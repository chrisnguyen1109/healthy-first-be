import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';

import {
    createUserController,
    deleteUserController,
    getUserController,
    getUsersController,
} from '@/controllers';
import { checkAuth, checkRole } from '@/middlewares';
import { UserRole } from '@/types';
import {
    schemaAuthAuthorization,
    schemaGetUsers,
    schemaMongoIdParam,
    schemaRecordQuery,
    schemaUserCreate,
} from '@/validators';

export const userRouter = Router();

userRouter.use(
    celebrate({
        [Segments.HEADERS]: schemaAuthAuthorization,
    }),
    checkAuth,
    checkRole([UserRole.ADMIN, UserRole.MANAGER])
);

userRouter
    .route('/')
    .get(
        celebrate({
            [Segments.QUERY]: schemaGetUsers,
        }),
        getUsersController
    )
    .post(
        celebrate({
            [Segments.BODY]: schemaUserCreate,
        }),
        createUserController
    );

userRouter
    .route('/:id')
    .get(
        celebrate({
            [Segments.PARAMS]: schemaMongoIdParam,
            [Segments.QUERY]: schemaRecordQuery,
        }),
        getUserController
    )
    .delete(
        celebrate({
            [Segments.PARAMS]: schemaMongoIdParam,
        }),
        deleteUserController
    );
