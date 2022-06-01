import { Router } from 'express';

import { authRouter } from './auth';
import { certificateRouter } from './certificate';
import { facilityRouter } from './facility';
import { userRouter } from './user';

export const loadRoutesV1 = () => {
    const router = Router();

    router.use('/auth', authRouter);
    router.use('/user', userRouter);
    router.use('/facility', facilityRouter);
    router.use('/certificate', certificateRouter);

    return router;
};
