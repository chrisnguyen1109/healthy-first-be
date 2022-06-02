import { CREATED, OK } from 'http-status';
import path from 'path';

import { RESPONSE_MESSAGE } from '@/config';
import { catchAsync } from '@/helpers';
import { CertificateDocument, Facility } from '@/models';
import {
    createCertificate,
    getCertificate,
    getCertificates,
    printCertificate,
    updateCertificateFood,
    updateCertificateStep,
} from '@/services';
import { CertificateStatus, FacilityCertificate } from '@/types';

export const createCertificateController = catchAsync<CertificateDocument>(
    async (req, res) => {
        const certificate = await createCertificate(req.user!, req.body);

        res.status(CREATED).json({
            message: RESPONSE_MESSAGE,
            data: {
                record: certificate,
            },
        });
    }
);

export const getCertificatesController = catchAsync<CertificateDocument[]>(
    async (req, res) => {
        const data = await getCertificates(
            req.user!,
            req.query as Record<string, any>
        );

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data,
        });
    }
);

export const getCertificateController = catchAsync<CertificateDocument>(
    async (req, res) => {
        const { id } = req.params;

        const data = await getCertificate({
            currentUser: req.user!,
            id,
            query: req.query as Record<string, any>,
        });

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data,
        });
    }
);

export const updateCertificateTestingStepController =
    catchAsync<CertificateDocument>(async (req, res) => {
        const certificate = await updateCertificateStep({
            currentUser: req.user!,
            id: req.params.id,
            body: { status: CertificateStatus.TESTING },
        });

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data: {
                record: certificate,
            },
        });
    });

export const updateCertificateSampleStepController =
    catchAsync<CertificateDocument>(async (req, res) => {
        const certificate = await updateCertificateStep({
            currentUser: req.user!,
            id: req.params.id,
            body: {
                status: CertificateStatus.SAMPLE,
                inspectedFoods: req.body.inspectedFoods,
            },
        });

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data: {
                record: certificate,
            },
        });
    });

export const updateCertificateAssessingStepController =
    catchAsync<CertificateDocument>(async (req, res) => {
        const certificate = await updateCertificateStep({
            currentUser: req.user!,
            id: req.params.id,
            body: {
                status: CertificateStatus.ASSESSING,
                inspectedFoods: req.body.inspectedFoods,
            },
        });

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data: {
                record: certificate,
            },
        });
    });

export const updateCertificateCompleteStepController =
    catchAsync<CertificateDocument>(async (req, res) => {
        const certificate = await updateCertificateStep({
            currentUser: req.user!,
            id: req.params.id,
            body: {
                status: CertificateStatus.COMPLETED,
                endDate: req.body.endDate,
                startDate: new Date(),
            },
        });

        await Facility.findByIdAndUpdate(certificate.facility, {
            facilityCertificate: FacilityCertificate.CERTIFIED,
            certificate: certificate._id,
        });

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data: {
                record: certificate,
            },
        });
    });

export const updateCertificateFailureStepController =
    catchAsync<CertificateDocument>(async (req, res) => {
        const certificate = await updateCertificateStep({
            currentUser: req.user!,
            id: req.params.id,
            body: {
                status: CertificateStatus.FAILURE,
            },
        });

        const facility = await Facility.findByIdAndUpdate(
            certificate.facility,
            {
                facilityCertificate: FacilityCertificate.NO_CERTIFICATE,
            }
        );

        facility!.certificate = undefined;
        await facility?.save();

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data: {
                record: certificate,
            },
        });
    });

export const updateCertificateFoodController = catchAsync<CertificateDocument>(
    async (req, res) => {
        const { id, inspectedFood } = req.params;

        const certificate = await updateCertificateFood({
            currentUser: req.user!,
            id,
            body: req.body,
            inspectedFood,
        });

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data: {
                record: certificate,
            },
        });
    }
);

export const printCertificateController = catchAsync(async (req, res) => {
    const { id } = req.params;

    const pdfFile = await printCertificate(id, req.user!);

    const url = `${req.protocol}://${req.get('host')}/pdf/${pdfFile}`;

    res.status(OK).json({
        message: RESPONSE_MESSAGE,
        data: {
            url,
        },
    });
});

export const downloadCertificateController = catchAsync(async (req, res) => {
    const { id } = req.params;

    const pdfFile = await printCertificate(id, req.user!);

    res.download(path.join(__dirname, `../../public/pdf/${pdfFile}`));
});
