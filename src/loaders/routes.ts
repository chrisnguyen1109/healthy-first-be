import { Express } from 'express';

import { loadRoutesV1 } from '@/routes';

export const loadRoutes = (app: Express) => {
    app.use('/api/v1', loadRoutesV1());
};
