import createHttpError from 'http-errors';
import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } from 'http-status';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongoose';
import { promisify } from 'util';

import {
    ACCESS_TOKEN_EXPIRE,
    ACCESS_TOKEN_PRIVATE_KEY,
    REFRESH_TOKEN_EXPIRE,
    REFRESH_TOKEN_PRIVATE_KEY,
    REFRESH_TOKEN_REDIS_EXPIRE,
} from '@/config';
import { compareBcrypt, redisKey } from '@/helpers';
import { redisClient } from '@/loaders';
import { User } from '@/models';
import { RedisKey, TokenType } from '@/types';

interface CheckLoginProps {
    email: string;
    password: string;
}

export const checkLogin = async ({ email, password }: CheckLoginProps) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw createHttpError(
            NOT_FOUND,
            'This email seems to no longer exist!'
        );
    }

    if (!user.status) {
        throw createHttpError(NOT_FOUND, 'This user has been inactive!');
    }

    const passwordMatching = await compareBcrypt(password, user.password);
    if (!passwordMatching) {
        throw createHttpError(BAD_REQUEST, 'Wrong password!');
    }

    return user;
};

export const generateJWT = async (payload: object, type: TokenType) => {
    const genTokenAsync = promisify(jwt.sign) as any;

    const privateKey =
        type === TokenType.ACCESS_TOKEN
            ? ACCESS_TOKEN_PRIVATE_KEY
            : REFRESH_TOKEN_PRIVATE_KEY;

    const expiresIn =
        type === TokenType.ACCESS_TOKEN
            ? ACCESS_TOKEN_EXPIRE
            : REFRESH_TOKEN_EXPIRE;

    return genTokenAsync(payload, privateKey, {
        expiresIn,
    });
};

export const decodeJWT = async (token: string, type: TokenType) => {
    const decodeAsync = promisify(jwt.verify) as any;

    const privateKey =
        type === TokenType.ACCESS_TOKEN
            ? ACCESS_TOKEN_PRIVATE_KEY
            : REFRESH_TOKEN_PRIVATE_KEY;

    return decodeAsync(token, privateKey);
};

export const generateAccessToken = async (id: ObjectId): Promise<string> =>
    generateJWT({ id }, TokenType.ACCESS_TOKEN);

export const generateRefreshToken = async (id: ObjectId): Promise<string> => {
    const refreshToken = await generateJWT({ id }, TokenType.REFRESH_TOKEN);

    await redisClient.setEx(
        redisKey(id.toString(), RedisKey.REFRESH_TOKEN),
        REFRESH_TOKEN_REDIS_EXPIRE,
        refreshToken
    );

    return refreshToken;
};

export const decodeToken = async (token: string) => {
    const { id, iat } = await decodeJWT(token, TokenType.ACCESS_TOKEN);

    const user = await User.findOne({ _id: id });
    if (!user) {
        throw createHttpError(NOT_FOUND, 'This user seems to no longer exist!');
    }

    if (!user.status) {
        throw createHttpError(NOT_FOUND, 'This user has been inactive!');
    }

    if (user.checkPasswordModified(iat)) {
        throw createHttpError(
            UNAUTHORIZED,
            'User recently changed password! Please log in again'
        );
    }

    return user;
};

export const logout = (userId: ObjectId) =>
    redisClient.del(redisKey(userId.toString(), RedisKey.REFRESH_TOKEN));

export const verifyRefreshToken = async (refreshToken: string) => {
    const { id } = await decodeJWT(refreshToken, TokenType.REFRESH_TOKEN);

    const token = await redisClient.get(redisKey(id, RedisKey.REFRESH_TOKEN));

    if (!token || token !== refreshToken) {
        throw createHttpError(UNAUTHORIZED, 'Unauthorized!');
    }

    return id;
};
