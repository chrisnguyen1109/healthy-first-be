import createHttpError from 'http-errors';
import { FORBIDDEN, NOT_FOUND } from 'http-status';

import { getDistrict, getProvince } from '@/api';
import { getFilterData, getPagination, getRecordData } from '@/helpers';
import { User, UserDocument } from '@/models';
import { IUser, UserRole } from '@/types';

export const createUser = async (currentUser: UserDocument, body: IUser) => {
    if (
        currentUser.role === UserRole.MANAGER &&
        body.role !== UserRole.EXPERT
    ) {
        throw createHttpError(
            FORBIDDEN,
            'Manager account only have permission to create expert accounts'
        );
    }

    if (body.role === UserRole.MANAGER) {
        try {
            await getProvince(body.provinceCode!);
        } catch (error) {
            throw createHttpError(
                NOT_FOUND,
                `No province with this code: ${body.provinceCode}`
            );
        }
    }

    if (body.role === UserRole.EXPERT) {
        let provinceCode: number;

        try {
            const district = await getDistrict(body.districtCode!);

            provinceCode = district.province_code;
        } catch (error) {
            throw createHttpError(
                NOT_FOUND,
                `No district with this code: ${body.districtCode}`
            );
        }

        if (
            currentUser.role === UserRole.MANAGER &&
            currentUser.provinceCode !== provinceCode
        ) {
            throw createHttpError(
                FORBIDDEN,
                'Manager account only have permission to create expert accounts with same province'
            );
        }

        // eslint-disable-next-line no-param-reassign
        body.provinceCode = provinceCode;
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
        queryObject,
        ['email', 'fullName', 'role', 'districtCode', 'provinceCode']
    );

    return {
        records: users,
        pagination: getPagination(queryObject, users, totalDataUsers),
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
                'Manager account only have permission to create expert accounts'
            );
        }

        if (currentUser.provinceCode !== user.provinceCode) {
            throw createHttpError(
                FORBIDDEN,
                'Manager account only have permission to create expert accounts with same province'
            );
        }
    }

    return { record: user };
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

    return matchingUser;
};
