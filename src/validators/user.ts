import { Joi } from 'celebrate';
import validator from 'validator';

import { checkMultipleWords } from '@/helpers';
import { UserRole } from '@/types';

import {
    schemaObjectQuery,
    schemaRoleCondition,
    schemaUserRole,
} from './common';

export const schemaUserCreate = Joi.object({
    fullName: Joi.string()
        .custom((val, helpers) =>
            checkMultipleWords(val, 2)
                ? val
                : helpers.message({
                      custom: 'Full name contains at least 2 words',
                  })
        )
        .required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    avatar: Joi.string().custom((val, helpers) =>
        validator.isURL(val)
            ? val
            : helpers.message({ custom: 'Invalid avatar url' })
    ),
    role: schemaUserRole.required(),
    provinceCode: schemaRoleCondition(
        [UserRole.MANAGER],
        Joi.number().integer().positive().positive().required()
    ),
    districtCode: schemaRoleCondition(
        [UserRole.EXPERT],
        Joi.number().integer().positive().positive().required()
    ),
});

export const schemaGetUsers = schemaObjectQuery([
    'provinceCode',
    'districtCode',
]).keys({
    fullName: Joi.string(),
    email: Joi.string(),
    role: schemaUserRole,
    status: Joi.boolean(),
    fullName_ne: Joi.string(),
    email_ne: Joi.string(),
    role_ne: schemaUserRole,
    status_ne: Joi.boolean(),
    provinceCode: Joi.number(),
    districtCode: Joi.number(),
});
