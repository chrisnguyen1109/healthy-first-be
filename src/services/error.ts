import { CelebrateError } from 'celebrate';
import createHttpError from 'http-errors';
import { BAD_REQUEST } from 'http-status';

export const handleCelebrateError = (error: CelebrateError) => {
    let message = '';

    error.details.forEach((value, source) => {
        message = message.concat(`${source}: ${value.message}.`);
    });

    return createHttpError(BAD_REQUEST, message);
};

export const handleCastError = (error: any) => {
    const message = `Invalid ${error.path}: ${error.value}`;

    return createHttpError(BAD_REQUEST, message);
};

export const handleDulicateFieldsError = (error: any) => {
    const value = Object.values(error.keyValue)[0];

    const message = `Dulicate field for value: '${value}'.Please use another value!`;

    return createHttpError(BAD_REQUEST, message);
};

export const handleValidationError = (error: any) => {
    const excludeMessage = 'validation failed:';
    const errorsIndex = error.message.indexOf(excludeMessage);

    const errors = error.message.slice(errorsIndex + excludeMessage.length);
    const message = `Invalid input:${errors}`;

    return createHttpError(BAD_REQUEST, message);
};
