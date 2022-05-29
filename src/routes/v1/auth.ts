import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';
import passport from 'passport';

import {
    getMeController,
    loginController,
    logoutController,
    refreshAccessTokenController,
    updateMeController,
} from '@/controllers';
import { checkAuth } from '@/middlewares';
import {
    schemaAuthLogin,
    schemaAuthRefreshToken,
    schemaAuthUpdateMe,
} from '@/validators';

export const authRouter = Router();

authRouter.post(
    '/login',
    celebrate({
        [Segments.BODY]: schemaAuthLogin,
    }),
    passport.authenticate('local', { session: false }),
    loginController
);

authRouter.post(
    '/refresh-token',
    celebrate({
        [Segments.COOKIES]: schemaAuthRefreshToken,
    }),
    refreshAccessTokenController
);

authRouter.use(checkAuth);

authRouter
    .route('/me')
    .get(getMeController)
    .patch(
        celebrate({
            [Segments.BODY]: schemaAuthUpdateMe,
        }),
        updateMeController
    );

authRouter.post('/logout', logoutController);
