import { catchAsync } from '@/helpers';
import { decodeToken } from '@/services';

export const checkAuth = catchAsync(async (req, _res, next) => {
    const user = await decodeToken(req.cookies.access_token);

    req.user = user;

    next();
});
