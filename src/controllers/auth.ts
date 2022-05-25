import createHttpError from 'http-errors';
import { NOT_FOUND, OK } from 'http-status';
import passport from 'passport';

import { RESPONSE_MESSAGE } from '@/config';
import { catchAsync } from '@/helpers';
import { UserDocument } from '@/models';
import {
    generateAccessToken,
    generateRefreshToken,
    logout,
    verifyRefreshToken,
} from '@/services';

export const loginController = catchAsync(async (req, res, next) => {
    passport.authenticate('local', async (error, user: UserDocument) => {
        if (error) {
            return next(error);
        }

        if (!user._id) {
            return next(
                createHttpError(
                    NOT_FOUND,
                    'This user seems to no longer exists!'
                )
            );
        }

        const accessToken = await generateAccessToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        return res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data: {
                user,
                accessToken,
                refreshToken,
            },
        });
    })(req, res, next);
});

export const getMeController = catchAsync(async (req, res) => {
    res.status(OK).json({
        message: RESPONSE_MESSAGE,
        data: {
            user: req.user,
        },
    });
});

export const updateMeController = catchAsync(async (req, res) => {
    const { password, newPassword, ...rest } = req.body;

    const updatedUser = await req.user?.updateMe(rest);

    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if (newPassword && password) {
        await req.user?.updateMyPassword(password, newPassword);

        accessToken = await generateAccessToken(req.user?._id);
        refreshToken = await generateRefreshToken(req.user?._id);
    }

    res.status(OK).json({
        message: RESPONSE_MESSAGE,
        data: {
            user: updatedUser,
            accessToken,
            refreshToken,
        },
    });
});

export const logoutController = catchAsync(async (req, res) => {
    await logout(req.user?._id);

    res.status(OK).json({
        message: RESPONSE_MESSAGE,
    });
});

export const refreshAccessTokenController = catchAsync(async (req, res) => {
    const id = await verifyRefreshToken(req.body.refreshToken);

    const accessToken = await generateAccessToken(id);
    const refreshToken = await generateRefreshToken(id);

    res.status(OK).json({
        message: RESPONSE_MESSAGE,
        data: {
            accessToken,
            refreshToken,
        },
    });
});
