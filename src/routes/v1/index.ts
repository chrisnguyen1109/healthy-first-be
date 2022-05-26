import { Router } from 'express';

import { authRouter } from './auth';
import { facilityRouter } from './facility';
import { userRouter } from './user';

export const loadRoutesV1 = () => {
    const router = Router();

    router.use('/auth', authRouter);
    router.use('/user', userRouter);
    router.use('/facility', facilityRouter);

    return router;
};
