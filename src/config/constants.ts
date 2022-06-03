/* eslint-disable prefer-destructuring */
export const PORT = process.env.PORT || 3001;

export const ENV = process.env.NODE_ENV;

export const DATABASE = process.env.DATABASE;

export const REDIS_URL = process.env.REDIS_URL;

export const DEFAULT_AVATAR =
    'https://res.cloudinary.com/chriscloud1109/image/upload/v1651629584/media/default_gr1p4q.jpg';

export const RESPONSE_MESSAGE = 'Success';

export const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE ?? '1d';
export const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE ?? '1d';

export const ACCESS_TOKEN_PRIVATE_KEY = process.env.ACCESS_TOKEN_PRIVATE_KEY;
export const REFRESH_TOKEN_PRIVATE_KEY = process.env.REFRESH_TOKEN_PRIVATE_KEY;

export const REFRESH_TOKEN_REDIS_EXPIRE =
    parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1d', 10) * 60 * 60 * 24;

export const ACCESS_TOKEN_COOKIE_EXPIRE = new Date(
    Date.now() +
        parseInt(process.env.ACCESS_TOKEN_EXPIRE || '1d', 10) *
            60 *
            60 *
            24 *
            1000
);

export const REFRESH_TOKEN_COOKIE_EXPIRE = new Date(
    Date.now() +
        parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1d', 10) *
            60 *
            60 *
            24 *
            1000
);

export const BCRYPT_SALT = process.env.BCRYPT_SALT
    ? +process.env.BCRYPT_SALT
    : undefined;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const DEFAULT_START_PAGE = 1;

export const DATE_FORMAT = 'MM/dd/yyyy';

export const EMAIL_FROM = process.env.EMAIL_FROM;

export const MAILTRAP_HOST = process.env.MAILTRAP_HOST;
export const MAILTRAP_PORT = parseInt(process.env.MAILTRAP_PORT!, 10);
export const MAILTRAP_USER = process.env.MAILTRAP_USER;
export const MAILTRAP_PASS = process.env.MAILTRAP_PASS;

export const SENDGRID_USERNAME = process.env.SENDGRID_USERNAME;
export const SENDGRID_PASSWORD = process.env.SENDGRID_PASSWORD;
