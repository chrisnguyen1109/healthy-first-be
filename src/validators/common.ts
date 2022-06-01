import { Joi } from 'celebrate';
import { isFuture } from 'date-fns';
import validator from 'validator';

import { DATE_FORMAT } from '@/config';
import { BusinessType, InspectStatus, UserRole } from '@/types';

export const schemaUserRole = Joi.alternatives().try(
    Joi.string().valid(UserRole.ADMIN),
    Joi.string().valid(UserRole.MANAGER),
    Joi.string().valid(UserRole.EXPERT)
);

export const schemaFacilityType = Joi.alternatives().try(
    Joi.string().valid(BusinessType.FOOD_PRODUCTION),
    Joi.string().valid(BusinessType.FOOD_SERVICE)
);

export const schemaValidMongoId = (msg: string) =>
    Joi.string().custom((val, helpers) =>
        validator.isMongoId(val)
            ? val
            : helpers.message({
                  custom: msg,
              })
    );

export const schemaMongoIdParam = Joi.object({
    id: schemaValidMongoId('Param id must be valid Mongo Id').required(),
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

export const schemaObjectQuery = Joi.object({
    _page: Joi.number().integer().positive(),
    _limit: Joi.number().integer().positive(),
    _start: Joi.number().integer().positive(),
    _end: Joi.number().integer().positive().greater(Joi.ref('_start')),
    _expand: [Joi.array().items(Joi.string()), Joi.string()],
    _q: Joi.string().allow(''),
    _sort: [Joi.array().items(Joi.string()), Joi.string()],
    _fields: [Joi.array().items(Joi.string()), Joi.string()],
});

export const schemaInspectStatus = Joi.alternatives().try(
    Joi.string().valid(InspectStatus.FAILURE),
    Joi.string().valid(InspectStatus.COMPLETED),
    Joi.string().valid(InspectStatus.PENDING)
);

export const schemaValidDate = Joi.string().custom((val, helpers) =>
    validator.isDate(val, { format: DATE_FORMAT })
        ? val
        : helpers.message({
              custom: 'Invalid date format',
          })
);

export const schemaFutureDate = Joi.string().custom((val, helpers) => {
    if (!validator.isDate(val, { format: DATE_FORMAT })) {
        return helpers.message({
            custom: 'Invalid date format',
        });
    }

    if (!isFuture(new Date(val))) {
        return helpers.message({
            custom: 'The date must be in the future',
        });
    }

    return val;
});
