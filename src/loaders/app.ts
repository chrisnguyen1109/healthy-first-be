import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import createHttpError from 'http-errors';
import { NOT_FOUND } from 'http-status';

import { connectMongoDB } from './mongoDatabase';
import { connectRedisDB } from './redisDatabase';
import { loadRoutes } from './routes';

export const loadApp = async (app: Express) => {
    const mongoDB = connectMongoDB();
    const redisDB = connectRedisDB();

    await mongoDB;
    await redisDB;

    app.enable('trust proxy');

    app.use(cors());

    app.use(cookieParser());

    app.use(express.json());
    app.use(
        express.urlencoded({
            extended: true,
        })
    );

    app.use(compression());

    loadRoutes(app);

    app.all('*', (req, _res, next) => {
        next(
            createHttpError(
                NOT_FOUND,
                `Can't find ${req.originalUrl} on this server`
            )
        );
    });
};
