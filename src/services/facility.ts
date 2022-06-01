import createHttpError from 'http-errors';
import { FORBIDDEN, NOT_FOUND } from 'http-status';

import { getFilterData, getPagination, getRecordData } from '@/helpers';
import {
    Certificate,
    Facility,
    FacilityDocument,
    UserDocument,
} from '@/models';
import { FacilityCertificate, IFacility, UserRole } from '@/types';

export const createFacility = (currentUser: UserDocument, body: IFacility) => {
    if (
        currentUser.role === UserRole.MANAGER &&
        body.provinceCode !== currentUser.provinceCode
    ) {
        throw createHttpError(
            FORBIDDEN,
            'Manager account only have permission to create facilities with same province'
        );
    }

    if (
        currentUser.role === UserRole.EXPERT &&
        body.districtCode !== currentUser.districtCode
    ) {
        throw createHttpError(
            FORBIDDEN,
            'Expert account only have permission to create facilities with same district'
        );
    }

    return Facility.create({ ...body });
};

export const getFacilities = async (
    currentUser: UserDocument,
    query: Record<string, any>
) => {
    let queryObject = { ...query };

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

    const [facilities, totalDataFacilities] =
        await getFilterData<FacilityDocument>(Facility, queryObject, [
            'name',
            'owner',
            'address',
            'businessType',
            'provinceName',
            'districtName',
            'wardName',
            'phoneNumber',
        ]);

    return {
        records: facilities,
        pagination: getPagination(
            facilities,
            totalDataFacilities,
            query._page,
            query._limit
        ),
    };
};

interface GetFacilityProps {
    currentUser: UserDocument;
    id: string;
    query: Record<string, any>;
}

export const getFacility = async ({
    id,
    query,
    currentUser,
}: GetFacilityProps) => {
    const facility = await getRecordData<FacilityDocument>(Facility, id, query);

    if (!facility) {
        throw createHttpError(NOT_FOUND, `No facility with this id: ${id}`);
    }

    if (
        currentUser.role === UserRole.MANAGER &&
        facility.provinceCode !== currentUser.provinceCode
    ) {
        throw createHttpError(
            FORBIDDEN,
            'Manager account only have permission to access facility with same province'
        );
    }

    if (
        currentUser.role === UserRole.EXPERT &&
        facility.districtCode !== currentUser.districtCode
    ) {
        throw createHttpError(
            FORBIDDEN,
            'Expert account only have permission to access facility with same district'
        );
    }

    return { record: facility };
};

interface UpdateFacilityProps {
    currentUser: UserDocument;
    id: string;
    body: IFacility;
}

export const updateFacility = async ({
    id,
    body,
    currentUser,
}: UpdateFacilityProps) => {
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

    const updatedFacility = await Facility.findOneAndUpdate(
        {
            _id: id,
            ...updateQuery,
        },
        { ...body },
        { new: true }
    );

    if (!updatedFacility) {
        throw createHttpError(
            NOT_FOUND,
            `No facility with this id: ${id} or you don't have permission to update this facility`
        );
    }

    return updatedFacility;
};

export const deleteFacility = async (currentUser: UserDocument, id: string) => {
    const deleteQuery = (() => {
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

    const deletedFacility = await Facility.findOneAndDelete({
        _id: id,
        ...deleteQuery,
    });

    if (!deletedFacility) {
        throw createHttpError(
            NOT_FOUND,
            `No facility with this id: ${id} or you don't have permission to delete this facility`
        );
    }

    return deletedFacility;
};

export const revokeFacilityCertificate = async (
    currentUser: UserDocument,
    id: string
) => {
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

    const updatedFacility = await Facility.findOneAndUpdate(
        {
            _id: id,
            ...updateQuery,
            facilityCertificate: FacilityCertificate.CERTIFIED,
        },
        {
            facilityCertificate: FacilityCertificate.REVOKED,
        },
        { new: true }
    );

    if (!updatedFacility) {
        throw createHttpError(
            NOT_FOUND,
            `No facility with this id: ${id} or you don't have permission to delete this facility`
        );
    }

    await Certificate.findByIdAndUpdate(updatedFacility.certificate, {
        isRevoked: true,
    });

    updatedFacility.certificate = undefined;

    await updatedFacility.save();

    return updatedFacility;
};
