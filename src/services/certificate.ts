import { endOfDay, format, startOfDay } from 'date-fns';
import createHttpError from 'http-errors';
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND } from 'http-status';

import {
    getFilterData,
    getPagination,
    getRecordData,
    PdfService,
} from '@/helpers';
import {
    Certificate,
    CertificateDocument,
    Facility,
    UserDocument,
} from '@/models';
import {
    CertificateStatus,
    FacilityCertificate,
    ICertificate,
    InspectedFoods,
    InspectStatus,
    UserRole,
} from '@/types';

export const createCertificate = async (
    currentUser: UserDocument,
    certificate: ICertificate
) => {
    const facilityId = certificate.facility;
    const bodyCertificate = { ...certificate };

    const matchingFacility = await Facility.findById(facilityId);

    if (!matchingFacility) {
        throw createHttpError(
            NOT_FOUND,
            `No facility with this id: ${facilityId}`
        );
    }

    if (
        currentUser.role === UserRole.MANAGER &&
        currentUser.provinceCode !== matchingFacility.provinceCode
    ) {
        throw createHttpError(
            FORBIDDEN,
            'Manager account only have permission to create facilities with same province'
        );
    }

    if (
        currentUser.role === UserRole.EXPERT &&
        currentUser.districtCode !== matchingFacility.districtCode
    ) {
        throw createHttpError(
            FORBIDDEN,
            'Expert account only have permission to create facilities with same district'
        );
    }

    bodyCertificate.facilityName = matchingFacility.name;
    bodyCertificate.provinceCode = matchingFacility.provinceCode;
    bodyCertificate.districtCode = matchingFacility.districtCode;

    const newCertificate = await Certificate.create(bodyCertificate);

    matchingFacility.facilityCertificate = FacilityCertificate.PENDING;
    matchingFacility.certificate = newCertificate._id;

    await matchingFacility.save();

    return newCertificate;
};

export const getCertificates = async (
    currentUser: UserDocument,
    query: Record<string, any>
) => {
    let queryObject = Object.keys(query).reduce((prev, key) => {
        if (/^(startDate|endDate)+_(gte|gt|lte|lt|ne)+$/.test(key)) {
            return {
                ...prev,
                [key.split('_')[0]]: {
                    [`$${key.split('_')[1]}`]: new Date(query[key]),
                },
            };
        }

        if (key === 'startDate' || key === 'endDate') {
            return {
                ...prev,
                [key]: {
                    $gte: startOfDay(new Date(query[key])),
                    $lt: endOfDay(new Date(query[key])),
                },
            };
        }

        return { ...prev, [key]: query[key] };
    }, {});

    if (currentUser.role === UserRole.MANAGER) {
        queryObject = {
            ...queryObject,
            provinceCode: currentUser.provinceCode,
        };
    }

    if (currentUser.role === UserRole.EXPERT) {
        queryObject = {
            ...queryObject,
            districtCode: currentUser.districtCode,
        };
    }

    const [certificates, totalDataCertificates] =
        await getFilterData<CertificateDocument>(Certificate, queryObject, [
            'facilityName',
        ]);

    return {
        records: certificates,
        pagination: getPagination(
            certificates,
            totalDataCertificates,
            query._page,
            query._limit
        ),
    };
};

interface GetCertificateProps {
    currentUser: UserDocument;
    id: string;
    query: Record<string, any>;
}

export const getCertificate = async ({
    currentUser,
    id,
    query,
}: GetCertificateProps) => {
    const certificate = await getRecordData<CertificateDocument>(
        Certificate,
        id,
        query
    );

    if (!certificate) {
        throw createHttpError(NOT_FOUND, `No certificate with this id: ${id}`);
    }

    if (
        currentUser.role === UserRole.MANAGER &&
        certificate.provinceCode !== currentUser.provinceCode
    ) {
        throw createHttpError(
            FORBIDDEN,
            'Manager account only have permission to access certificate with same province'
        );
    }

    if (
        currentUser.role === UserRole.EXPERT &&
        certificate.districtCode !== currentUser.districtCode
    ) {
        throw createHttpError(
            FORBIDDEN,
            'Expert account only have permission to access certificate with same district'
        );
    }

    return { record: certificate };
};

interface UpdateCertificateStepProps {
    id: string;
    currentUser: UserDocument;
    body: any;
}

export const updateCertificateStep = async ({
    id,
    currentUser,
    body,
}: UpdateCertificateStepProps) => {
    const updateQuery = (() => {
        switch (currentUser.role) {
            case UserRole.MANAGER: {
                return { provinceCode: currentUser.provinceCode };
            }
            case UserRole.EXPERT: {
                return { districtCode: currentUser.districtCode };
            }
            default: {
                return {};
            }
        }
    })();

    const updatedCertificate = await Certificate.findOneAndUpdate(
        {
            _id: id,
            ...updateQuery,
            isRevoked: false,
        },
        { ...body },
        { new: true }
    );

    if (!updatedCertificate) {
        throw createHttpError(
            NOT_FOUND,
            `No certificate with this id: ${id} or you don't have permission to do this action`
        );
    }

    return updatedCertificate;
};

interface UpdateCertificateFoodProps {
    id: string;
    inspectedFood: string;
    body: InspectedFoods;
    currentUser: UserDocument;
}

export const updateCertificateFood = async ({
    id,
    body,
    inspectedFood,
    currentUser,
}: UpdateCertificateFoodProps) => {
    const updateQuery = (() => {
        switch (currentUser.role) {
            case UserRole.MANAGER: {
                return { provinceCode: currentUser.provinceCode };
            }
            case UserRole.EXPERT: {
                return { districtCode: currentUser.districtCode };
            }
            default: {
                return {};
            }
        }
    })();

    const updatedCertificate = await Certificate.findOneAndUpdate(
        {
            _id: id,
            ...updateQuery,
            'inspectedFoods._id': inspectedFood,
        },
        {
            $set: {
                'inspectedFoods.$.status': body.status,
                'inspectedFoods.$.resultDate': new Date(),
                'inspectedFoods.$.notes': body.notes,
            },
        },
        { new: true }
    );

    if (!updatedCertificate) {
        throw createHttpError(
            NOT_FOUND,
            `No certificate with this id: ${id} or you don't have permission to do this action`
        );
    }

    return updatedCertificate;
};

export const printCertificate = async (
    id: string,
    currentUser: UserDocument
) => {
    const objectQuery = (() => {
        switch (currentUser.role) {
            case UserRole.MANAGER: {
                return { provinceCode: currentUser.provinceCode };
            }
            case UserRole.EXPERT: {
                return { districtCode: currentUser.districtCode };
            }
            default: {
                return {};
            }
        }
    })();

    const certificate = await Certificate.findOne({
        _id: id,
        ...objectQuery,
    });

    if (!certificate) {
        throw createHttpError(
            NOT_FOUND,
            `No certificate with this id: ${id} or you don't have permission to do this action`
        );
    }

    if (certificate.isRevoked) {
        return new PdfService(id, {
            facilityName: certificate.facilityName,
            today: format(new Date(), 'dd LLLL, yyyy'),
        }).generateRevokedCertificate();
    }

    if (certificate.status === CertificateStatus.COMPLETED) {
        return new PdfService(id, {
            facilityName: certificate.facilityName,
            startDate: format(
                new Date(certificate.startDate!),
                'dd LLLL, yyyy'
            ),
            endDate: format(new Date(certificate.endDate!), 'dd LLLL, yyyy'),
        }).generateSuccessCertificate();
    }

    if (certificate.status === CertificateStatus.FAILURE) {
        return new PdfService(id, {
            facilityName: certificate.facilityName,
            inspectedFoods: (certificate.inspectedFoods ?? [])
                .filter(food => food.status === InspectStatus.FAILURE)
                .map(food => ({
                    name: food.name,
                    status: food.status.toUpperCase(),
                    resultDate: format(
                        new Date(food.resultDate!),
                        'dd LLLL, yyyy'
                    ),
                })),
        }).generateFailureCertificate();
    }

    throw createHttpError(
        BAD_REQUEST,
        'There is no printout for this certificate'
    );
};
