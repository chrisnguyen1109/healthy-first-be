import { CREATED, NO_CONTENT, OK } from 'http-status';

import { RESPONSE_MESSAGE } from '@/config';
import { catchAsync } from '@/helpers';
import { FacilityDocument } from '@/models';
import {
    createFacility,
    deleteFacility,
    getFacilities,
    getFacility,
    updateFacility,
} from '@/services';

export const createFacilityController = catchAsync<FacilityDocument>(
    async (req, res) => {
        const facility = await createFacility(req.user!, req.body);

        res.status(CREATED).json({
            message: RESPONSE_MESSAGE,
            data: {
                record: facility,
            },
        });
    }
);

export const getFacilitiesController = catchAsync<FacilityDocument[]>(
    async (req, res) => {
        const data = await getFacilities(
            req.user!,
            req.query as Record<string, any>
        );

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data,
        });
    }
);

export const getFacilityController = catchAsync<FacilityDocument>(
    async (req, res) => {
        const { id } = req.params;

        const data = await getFacility({
            currentUser: req.user!,
            id,
            query: req.query as Record<string, any>,
        });

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data,
        });
    }
);

export const updateFacilityController = catchAsync<FacilityDocument>(
    async (req, res) => {
        const { id } = req.params;

        const facility = await updateFacility({
            currentUser: req.user!,
            id,
            body: req.body,
        });

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data: {
                record: facility,
            },
        });
    }
);

export const deleteFacilityController = catchAsync(async (req, res) => {
    const { id } = req.params;

    await deleteFacility(req.user!, id);

    res.status(NO_CONTENT).json({
        message: RESPONSE_MESSAGE,
    });
});
