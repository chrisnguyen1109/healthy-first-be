import createHttpError from 'http-errors';
import { UNAUTHORIZED } from 'http-status';

import { catchAsync } from '@/helpers';
import { decodeToken } from '@/services';

export const checkAuth = catchAsync(async (req, _res, next) => {
    if (!req.cookies.access_token) {
        throw createHttpError(UNAUTHORIZED, 'Invalid token!');
    }

    const user = await decodeToken(req.cookies.access_token);

    req.user = user;

    next();
});
