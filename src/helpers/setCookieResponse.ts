import { CookieOptions, Request, Response } from 'express';

import {
    ACCESS_TOKEN_COOKIE_EXPIRE,
    REFRESH_TOKEN_COOKIE_EXPIRE,
} from '@/config';
import { TokenType } from '@/types';

export const setCookieResponse = (
    req: Request,
    res: Response,
    tokenType: TokenType,
    token: string | null,
    cookieOptions: CookieOptions = {}
) => {
    res.cookie(tokenType, token, {
        expires:
            tokenType === TokenType.ACCESS_TOKEN
                ? ACCESS_TOKEN_COOKIE_EXPIRE
                : REFRESH_TOKEN_COOKIE_EXPIRE,
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'strict',
        ...cookieOptions,
    });
};
