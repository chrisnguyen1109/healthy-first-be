import { Joi } from 'celebrate';
import validator from 'validator';

import { UserRole } from '@/types';

export const schemaUserRole = Joi.alternatives().try(
    Joi.string().valid(UserRole.ADMIN),
    Joi.string().valid(UserRole.MANAGER),
    Joi.string().valid(UserRole.EXPERT)
);

export const schemaValidMongoId = (msg: string) =>
    Joi.string()
        .custom((val, helpers) =>
            validator.isMongoId(val)
                ? val
                : helpers.message({
                      custom: msg,
                  })
        )
        .required();

export const schemaMongoIdParam = Joi.object({
    id: schemaValidMongoId('Param id must be valid Mongo Id'),
});

export const schemaRoleCondition = (roles: UserRole[], schema: any) =>
    Joi.when('role', {
        is: roles.map(role => Joi.string().valid(role)),
        then: schema,
        otherwise: Joi.forbidden(),
    });

export const schemaRecordQuery = Joi.object({
    _expand: [Joi.array().items(Joi.string()), Joi.string()],
    _fields: [Joi.array().items(Joi.string()), Joi.string()],
});

export const schemaObjectQuery = (fileds: string[] = []) =>
    Joi.object({
        _page: Joi.number().integer().positive(),
        _limit: Joi.number().integer().positive(),
        _start: Joi.number().integer().positive(),
        _end: Joi.number().integer().positive().greater(Joi.ref('_start')),
        _expand: [Joi.array().items(Joi.string()), Joi.string()],
        _q: Joi.string(),
        _sort: [Joi.array().items(Joi.string()), Joi.string()],
        _fields: [Joi.array().items(Joi.string()), Joi.string()],
        ...fileds.reduce((acc, cur) => ({ ...acc, [cur]: Joi.number() }), {}),
    }).pattern(
        new RegExp(`(${fileds.join('|')})+_(gte|gt|lte|lt|ne)+$`),
        Joi.number()
    );
