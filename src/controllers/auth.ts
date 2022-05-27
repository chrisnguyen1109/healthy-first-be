import createHttpError from 'http-errors';
import { NOT_FOUND, OK } from 'http-status';
import passport from 'passport';

import { RESPONSE_MESSAGE } from '@/config';
import { catchAsync, setCookieResponse } from '@/helpers';
import { UserDocument } from '@/models';
import {
    generateAccessToken,
    generateRefreshToken,
    logout,
    verifyRefreshToken,
} from '@/services';
import { TokenType } from '@/types';

export const loginController = catchAsync<UserDocument>(
    async (req, res, next) => {
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

            setCookieResponse(req, res, TokenType.ACCESS_TOKEN, accessToken);
            setCookieResponse(req, res, TokenType.REFRESH_TOKEN, refreshToken);

            return res.status(OK).json({
                message: RESPONSE_MESSAGE,
                data: {
                    record: user,
                },
            });
        })(req, res, next);
    }
);

export const getMeController = catchAsync<UserDocument>(async (req, res) => {
    res.status(OK).json({
        message: RESPONSE_MESSAGE,
        data: {
            record: req.user!,
        },
    });
});

export const updateMeController = catchAsync<UserDocument>(async (req, res) => {
    const { password, newPassword, ...rest } = req.body;

    const updatedUser = await req.user?.updateMe(rest);

    if (newPassword && password) {
        await req.user?.updateMyPassword(password, newPassword);

        const accessToken = await generateAccessToken(req.user?._id);
        const refreshToken = await generateRefreshToken(req.user?._id);

        setCookieResponse(req, res, TokenType.ACCESS_TOKEN, accessToken);
        setCookieResponse(req, res, TokenType.REFRESH_TOKEN, refreshToken);
    }

    res.status(OK).json({
        message: RESPONSE_MESSAGE,
        data: {
            record: updatedUser!,
        },
    });
});

export const logoutController = catchAsync(async (req, res) => {
    await logout(req.user?._id);

    setCookieResponse(req, res, TokenType.ACCESS_TOKEN, null, {
        expires: new Date(0),
    });
    setCookieResponse(req, res, TokenType.REFRESH_TOKEN, null, {
        expires: new Date(0),
    });

    res.status(OK).json({
        message: RESPONSE_MESSAGE,
    });
});

export const refreshAccessTokenController = catchAsync(async (req, res) => {
    const id = await verifyRefreshToken(req.cookies.refresh_token);

    const accessToken = await generateAccessToken(id);
    const refreshToken = await generateRefreshToken(id);

    setCookieResponse(req, res, TokenType.ACCESS_TOKEN, accessToken);
    setCookieResponse(req, res, TokenType.REFRESH_TOKEN, refreshToken);

    res.status(OK).json({
        message: RESPONSE_MESSAGE,
    });
});
