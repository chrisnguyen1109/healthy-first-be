import { Joi } from 'celebrate';
import validator from 'validator';

import { checkMultipleWords } from '@/helpers';

export const schemaAuthLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const schemaAuthRefreshToken = Joi.object({
    refresh_token: Joi.string().required(),
}).unknown();

export const schemaAuthUpdateMe = Joi.object({
    fullName: Joi.string().custom((val, helpers) =>
        checkMultipleWords(val, 2)
            ? val
            : helpers.message({
                  custom: 'Full name contains at least 2 words',
              })
    ),
    avatar: Joi.string().custom((val, helpers) =>
        validator.isURL(val)
            ? val
            : helpers.message({ custom: 'Invalid avatar url' })
    ),
    password: Joi.string().min(6),
    newPassword: Joi.string().min(6),
}).with('password', 'newPassword');
