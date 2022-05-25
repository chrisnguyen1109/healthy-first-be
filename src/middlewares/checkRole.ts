import createHttpError from 'http-errors';
import { FORBIDDEN } from 'http-status';

import { catchAsync } from '@/helpers';
import { UserRole } from '@/types';

export const checkRole = (roles: UserRole[]) =>
    catchAsync(async (req, _res, next) => {
        if (!roles.includes(req.user!.role)) {
            throw createHttpError(
                FORBIDDEN,
                'You do not have permission to perform this action!'
            );
        }

        next();
    });
