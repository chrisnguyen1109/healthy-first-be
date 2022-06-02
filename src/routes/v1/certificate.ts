import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';

import {
    createCertificateController,
    downloadCertificateController,
    getCertificateController,
    getCertificatesController,
    printCertificateController,
    updateCertificateAssessingStepController,
    updateCertificateCompleteStepController,
    updateCertificateFailureStepController,
    updateCertificateFoodController,
    updateCertificateSampleStepController,
    updateCertificateTestingStepController,
} from '@/controllers';
import { checkAuth } from '@/middlewares';
import {
    schemaCertificateCreate,
    schemaCertificateUpdateAssessingStep,
    schemaCertificateUpdateCompletedStep,
    schemaCertificateUpdateFood,
    schemaCertificateUpdateFoodParams,
    schemaCertificateUpdateSampleStep,
    schemaGetCertificates,
    schemaMongoIdParam,
    schemaRecordQuery,
} from '@/validators';

export const certificateRouter = Router();

certificateRouter.use(checkAuth);

certificateRouter
    .route('/')
    .get(
        celebrate({
            [Segments.QUERY]: schemaGetCertificates,
        }),
        getCertificatesController
    )
    .post(
        celebrate({
            [Segments.BODY]: schemaCertificateCreate,
        }),
        createCertificateController
    );

certificateRouter.get(
    '/:id',
    celebrate({
        [Segments.PARAMS]: schemaMongoIdParam,
        [Segments.QUERY]: schemaRecordQuery,
    }),
    getCertificateController
);

certificateRouter.patch(
    '/:id/step/1',
    celebrate({
        [Segments.PARAMS]: schemaMongoIdParam,
    }),
    updateCertificateTestingStepController
);
certificateRouter.patch(
    '/:id/step/2',
    celebrate({
        [Segments.PARAMS]: schemaMongoIdParam,
        [Segments.BODY]: schemaCertificateUpdateSampleStep,
    }),
    updateCertificateSampleStepController
);
certificateRouter.patch(
    '/:id/step/3',
    celebrate({
        [Segments.PARAMS]: schemaMongoIdParam,
        [Segments.BODY]: schemaCertificateUpdateAssessingStep,
    }),
    updateCertificateAssessingStepController
);
certificateRouter.patch(
    '/:id/step/4',
    celebrate({
        [Segments.PARAMS]: schemaMongoIdParam,
        [Segments.BODY]: schemaCertificateUpdateCompletedStep,
    }),
    updateCertificateCompleteStepController
);
certificateRouter.patch('/:id/step/5', updateCertificateFailureStepController);

certificateRouter.patch(
    '/:id/inspectedFood/:inspectedFood',
    celebrate({
        [Segments.PARAMS]: schemaCertificateUpdateFoodParams,
        [Segments.BODY]: schemaCertificateUpdateFood,
    }),
    updateCertificateFoodController
);

certificateRouter.post(
    '/:id/get-certificate',
    celebrate({
        [Segments.PARAMS]: schemaMongoIdParam,
    }),
    printCertificateController
);

certificateRouter.get(
    '/:id/download-certificate',
    celebrate({
        [Segments.PARAMS]: schemaMongoIdParam,
    }),
    downloadCertificateController
);
