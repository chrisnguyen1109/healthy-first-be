import createHttpError from 'http-errors';
import { FORBIDDEN, NOT_FOUND } from 'http-status';

import {
    getFilterData,
    getPagination,
    getRecordData,
    redisKey,
} from '@/helpers';
import { redisClient } from '@/loaders';
import { User, UserDocument } from '@/models';
import { IUser, RedisKey, UserRole } from '@/types';

export const createUser = async (currentUser: UserDocument, body: IUser) => {
    if (currentUser.role === UserRole.MANAGER) {
        if (body.role !== UserRole.EXPERT) {
            throw createHttpError(
                FORBIDDEN,
                'Manager account only have permission to create expert accounts'
            );
        }

        if (body.provinceCode !== currentUser.provinceCode) {
            throw createHttpError(
                FORBIDDEN,
                'Manager account only have permission to create expert accounts with same province'
            );
        }
    }

    return User.create({ ...body });
};

export const getUsers = async (
    currentUser: UserDocument,
    query: Record<string, any>
) => {
    const queryObject =
        currentUser.role === UserRole.MANAGER
            ? {
                  ...query,
                  role: UserRole.EXPERT,
                  provinceCode: currentUser.provinceCode,
              }
            : query;

    const [users, totalDataUsers] = await getFilterData<UserDocument>(
        User,
        { ...queryObject, _id: { $ne: currentUser._id } },
        [
            'email',
            'fullName',
            'role',
            'districtCode',
            'provinceCode',
            'districtName',
            'provinceName',
        ]
    );

    return {
        records: users,
        pagination: getPagination(
            users,
            totalDataUsers,
            query._page,
            query._limit
        ),
    };
};

interface GetUserProps {
    currentUser: UserDocument;
    id: string;
    query: Record<string, any>;
}

export const getUser = async ({ currentUser, id, query }: GetUserProps) => {
    const user = await getRecordData<UserDocument>(User, id, query);

    if (!user) {
        throw createHttpError(NOT_FOUND, `No user with this id: ${id}`);
    }

    if (currentUser.role === UserRole.MANAGER) {
        if (user.role !== UserRole.EXPERT) {
            throw createHttpError(
                FORBIDDEN,
                'Manager account only have permission to access expert accounts'
            );
        }

        if (currentUser.provinceCode !== user.provinceCode) {
            throw createHttpError(
                FORBIDDEN,
                'Manager account only have permission to access accounts with same province'
            );
        }
    }

    return { record: user };
};

interface UpdateUserProps {
    currentUser: UserDocument;
    id: string;
    body: IUser;
}

export const updateUser = async ({
    body,
    currentUser,
    id,
}: UpdateUserProps) => {
    const updateQuery =
        currentUser.role === UserRole.MANAGER
            ? {
                  role: { $in: [UserRole.EXPERT] },
                  provinceCode: currentUser.provinceCode,
              }
            : { role: { $in: [UserRole.EXPERT, UserRole.MANAGER] } };

    const updatedUser = await User.findOneAndUpdate(
        {
            _id: id,
            ...updateQuery,
        },
        { ...body },
        { new: true }
    );

    if (!updatedUser) {
        throw createHttpError(
            NOT_FOUND,
            `No user with this id: ${id} or you don't have permission to update this user`
        );
    }

    if (!updatedUser.status) {
        redisClient.del(redisKey(id, RedisKey.REFRESH_TOKEN));
    }

    return updatedUser;
};

export const inactiveUser = async (currentUser: UserDocument, id: string) => {
    const updateQuery =
        currentUser.role === UserRole.MANAGER
            ? {
                  role: { $in: [UserRole.EXPERT] },
                  provinceCode: currentUser.provinceCode,
              }
            : { role: { $in: [UserRole.EXPERT, UserRole.MANAGER] } };

    const matchingUser = await User.findOneAndUpdate(
        {
            _id: id,
            ...updateQuery,
        },
        { status: false }
    );

    if (!matchingUser) {
        throw createHttpError(
            NOT_FOUND,
            `No user with this id: ${id} or you don't have permission to disable this user`
        );
    }

    redisClient.del(redisKey(id, RedisKey.REFRESH_TOKEN));

    return matchingUser;
};
