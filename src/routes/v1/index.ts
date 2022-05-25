import { Router } from 'express';

import { authRouter } from './auth';
import { userRouter } from './user';

export const loadRoutesV1 = () => {
    const router = Router();

    router.use('/auth', authRouter);
    router.use('/user', userRouter);

    return router;
};
