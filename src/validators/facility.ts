import { Joi } from 'celebrate';
import validator from 'validator';

import { schemaFacilityType, schemaObjectQuery } from './common';

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
