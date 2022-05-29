import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';

import {
    createUserController,
    deleteUserController,
    getUserController,
    getUsersController,
    updateUserController,
} from '@/controllers';
import { checkAuth, checkRole } from '@/middlewares';
import { UserRole } from '@/types';
import {
    schemaGetUsers,
    schemaMongoIdParam,
    schemaRecordQuery,
    schemaUserCreate,
    schemaUserUpdate,
} from '@/validators';

export const userRouter = Router();

userRouter.use(checkAuth, checkRole([UserRole.ADMIN, UserRole.MANAGER]));

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
    .patch(
        celebrate({
            [Segments.PARAMS]: schemaMongoIdParam,
            [Segments.BODY]: schemaUserUpdate,
        }),
        updateUserController
    )
    .delete(
        celebrate({
            [Segments.PARAMS]: schemaMongoIdParam,
        }),
        deleteUserController
    );
