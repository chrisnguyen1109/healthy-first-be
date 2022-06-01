import { Joi } from 'celebrate';

import { CertificateStatus, InspectStatus } from '@/types';

import {
    schemaFutureDate,
    schemaInspectStatus,
    schemaObjectQuery,
    schemaValidDate,
    schemaValidMongoId,
} from './common';

export const schemaCertificateCreate = Joi.object({
    facility: schemaValidMongoId('Facility must be valid Mongo Id').required(),
});

export const schemaInspectedFood = Joi.object({
    name: Joi.string().required(),
    organization: Joi.string().required(),
    notes: Joi.string().allow(''),
});

export const schemaCertificateUpdateSampleStep = Joi.object({
    inspectedFoods: Joi.array().items(schemaInspectedFood).min(1).required(),
});

export const schemaCertificateUpdateAssessingStep = Joi.object({
    inspectedFoods: Joi.array()
        .items(
            schemaInspectedFood.keys({
                _id: schemaValidMongoId(
                    '_id must be valid Mongo Id'
                ).required(),
                status: Joi.alternatives()
                    .try(
                        Joi.string().valid(InspectStatus.FAILURE),
                        Joi.string().valid(InspectStatus.COMPLETED)
                    )
                    .required(),
                resultDate: Joi.date().required(),
            })
        )
        .min(1)
        .required(),
});

export const schemaCertificateUpdateCompletedStep = Joi.object({
    endDate: schemaFutureDate.required(),
});

export const schemaCertificateUpdateFood = Joi.object({
    notes: Joi.string().allow(''),
    status: schemaInspectStatus,
});

export const schemaGetCertificates = schemaObjectQuery.keys({
    facility: schemaValidMongoId,
    facilityName: Joi.string(),
    provinceCode: Joi.number(),
    districtCode: Joi.number(),
    isRevoked: Joi.boolean(),
    status: [
        Joi.number().valid(CertificateStatus.INITIAL),
        Joi.number().valid(CertificateStatus.TESTING),
        Joi.number().valid(CertificateStatus.SAMPLE),
        Joi.number().valid(CertificateStatus.ASSESSING),
        Joi.number().valid(CertificateStatus.COMPLETED),
        Joi.number().valid(CertificateStatus.FAILURE),
    ],
    startDate: schemaValidDate,
    ...['gte', 'gt', 'lte', 'lt', 'ne'].reduce(
        (acc, cur) => ({
            ...acc,
            [`startDate_${cur}`]: schemaValidDate,
        }),
        {}
    ),
    endDate: schemaValidDate,
    ...['gte', 'gt', 'lte', 'lt', 'ne'].reduce(
        (acc, cur) => ({
            ...acc,
            [`endDate_${cur}`]: schemaValidDate,
        }),
        {}
    ),
});

export const schemaCertificateUpdateFoodParams = Joi.object({
    id: schemaValidMongoId('Param id must be valid Mongo Id').required(),
    inspectedFood: schemaValidMongoId(
        'Inspected food must be valid Mongo Id'
    ).required(),
});
