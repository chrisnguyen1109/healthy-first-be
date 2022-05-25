import { isCelebrateError } from 'celebrate';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED } from 'http-status';

import { ENV } from '@/config';
import {
    handleCastError,
    handleCelebrateError,
    handleDulicateFieldsError,
    handleValidationError,
} from '@/services';
import { ApiResponse } from '@/types';

export const globalErrorController = (
    error: any,
    _req: Request,
    res: Response<ApiResponse>,
    _next: NextFunction
) => {
    if (ENV === 'development') {
        console.log('-------------------------');
        console.log('Error 💥💥💥');
        console.error(error.name);
        console.error(error.code);
        console.error(error.message);
        console.error(error);
        console.log('-------------------------');
    }

    let resError = Object.create(error);

    switch (true) {
        case isCelebrateError(error): {
            resError = handleCelebrateError(error);
            break;
        }
        case error.name === 'CastError': {
            resError = handleCastError(error);
            break;
        }
        case error.name === 'ValidationError': {
            resError = handleValidationError(error);
            break;
        }
        case error.name === 'JsonWebTokenError': {
            resError = createHttpError(UNAUTHORIZED, 'Invalid token!');
            break;
        }
        case error.name === 'TokenExpiredError': {
            resError = createHttpError(UNAUTHORIZED, 'Token has been expired!');
            break;
        }
        case error.code === 11000: {
            resError = handleDulicateFieldsError(error);
            break;
        }
        case error.name === 'MongoServerError': {
            resError = createHttpError(BAD_REQUEST, error.message);
            break;
        }
        default: {
            break;
        }
    }

    if (resError instanceof createHttpError.HttpError) {
        return res
            .status(resError.statusCode)
            .json({ message: resError.message });
    }

    return res.status(INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong!',
    });
};
