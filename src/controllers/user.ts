import { CREATED, NO_CONTENT, OK } from 'http-status';

import { RESPONSE_MESSAGE } from '@/config';
import { catchAsync } from '@/helpers';
import { UserDocument } from '@/models';
import { createUser, getUser, getUsers, inactiveUser } from '@/services';

export const createUserController = catchAsync<UserDocument>(
    async (req, res) => {
        const user = await createUser(req.user!, req.body);

        res.status(CREATED).json({
            message: RESPONSE_MESSAGE,
            data: {
                record: user,
            },
        });
    }
);

export const getUsersController = catchAsync<UserDocument[]>(
    async (req, res) => {
        const data = await getUsers(
            req.user!,
            req.query as Record<string, any>
        );

        res.status(OK).json({
            message: RESPONSE_MESSAGE,
            data,
        });
    }
);

export const getUserController = catchAsync<UserDocument>(async (req, res) => {
    const { id } = req.params;

    const data = await getUser({
        currentUser: req.user!,
        id,
        query: req.query as Record<string, any>,
    });

    res.status(OK).json({
        message: RESPONSE_MESSAGE,
        data,
    });
});

export const deleteUserController = catchAsync(async (req, res) => {
    const { id } = req.params;

    await inactiveUser(req.user!, id);

    res.status(NO_CONTENT).json({
        message: RESPONSE_MESSAGE,
    });
});
