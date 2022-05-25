/* eslint-disable prefer-destructuring */
export const PORT = process.env.PORT || 3000;

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

export const BCRYPT_SALT = process.env.BCRYPT_SALT
    ? +process.env.BCRYPT_SALT
    : undefined;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const DEFAULT_START_PAGE = 1;
