import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import createHttpError from 'http-errors';
import { NOT_FOUND } from 'http-status';
import path from 'path';

import { ENV } from '@/config';
import { globalErrorController } from '@/controllers';

import { connectMongoDB } from './mongoDatabase';
import { loadPassports } from './passport';
import { connectRedisDB } from './redisDatabase';
import { loadRoutes } from './routes';

export const loadApp = async (app: Express) => {
    const mongoDB = connectMongoDB();
    const redisDB = connectRedisDB();

    await mongoDB;
    await redisDB;

    app.enable('trust proxy');

    // if (ENV === 'development') {
    //     app.use(
    //         cors({
    //             origin: 'http://localhost:3000',
    //             credentials: true,
    //         })
    //     );
    // }

    app.use(cookieParser());

    app.use(express.json());
    app.use(
        express.urlencoded({
            extended: true,
        })
    );

    app.use(compression());

    loadPassports();

    app.use(express.static(path.join(__dirname, '../../public')));

    loadRoutes(app);

    if (ENV === 'production') {
        app.get('*', (_req, res) => {
            res.sendFile(path.join(__dirname, '../../public', 'index.html'));
        });
    }

    app.all('*', (req, _res, next) => {
        next(
            createHttpError(
                NOT_FOUND,
                `Can't find ${req.originalUrl} on this server`
            )
        );
    });

    app.use(globalErrorController);
};
