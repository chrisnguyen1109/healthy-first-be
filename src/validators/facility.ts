import { Joi } from 'celebrate';
import validator from 'validator';

import { FacilityCertificate } from '@/types';

import {
    schemaFacilityType,
    schemaObjectQuery,
    schemaValidMongoId,
} from './common';

export const schemaFacilityCreate = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    owner: Joi.string().required(),
    businessType: schemaFacilityType.required(),
    phoneNumber: Joi.string()
        .custom((val, helpers) =>
            validator.isMobilePhone(val)
                ? val
                : helpers.message({ custom: 'Invalid phone number' })
        )
        .required(),
    provinceCode: Joi.number().integer().positive().positive().required(),
    districtCode: Joi.number().integer().positive().positive().required(),
    wardCode: Joi.number().integer().positive().positive().required(),
    description: Joi.string(),
});

export const schemaGetFacilities = schemaObjectQuery.keys({
    name: Joi.string(),
    address: Joi.string(),
    owner: Joi.string(),
    businessType: schemaFacilityType,
    phoneNumber: Joi.string(),
    provinceName: Joi.string(),
    districtName: Joi.string(),
    wardName: Joi.string(),
    description: Joi.string(),
    provinceCode: Joi.number(),
    districtCode: Joi.number(),
    wardCode: Joi.number(),
    facilityCertificate: [
        Joi.string().valid(FacilityCertificate.NO_CERTIFICATE),
        Joi.string().valid(FacilityCertificate.CERTIFIED),
        Joi.string().valid(FacilityCertificate.EXPIRED),
        Joi.string().valid(FacilityCertificate.PENDING),
        Joi.string().valid(FacilityCertificate.REVOKED),
    ],
    certificate: schemaValidMongoId,
});

export const schemaFacilityUpdate = Joi.object({
    name: Joi.string(),
    address: Joi.string(),
    owner: Joi.string(),
    businessType: schemaFacilityType,
    phoneNumber: Joi.string().custom((val, helpers) =>
        validator.isMobilePhone(val)
            ? val
            : helpers.message({ custom: 'Invalid phone number' })
    ),
    description: Joi.string(),
});
