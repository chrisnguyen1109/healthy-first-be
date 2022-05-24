import mongoose, { Document, Model, Schema } from 'mongoose';
import validator from 'validator';

import { DEFAULT_AVATAR } from '@/config';
import { omitValueObj, trimmedStringType } from '@/helpers';
import { IUser, UserRole } from '@/types';

export interface UserDocument extends IUser, Document {}

type UserModel = Model<UserDocument>;

const userSchema: Schema<UserDocument, UserModel> = new Schema(
    {
        email: {
            ...trimmedStringType,
            required: [true, 'Email field must be required!'],
            unique: true,
            validate: [validator.isEmail, 'Invalid email format!'],
        },
        password: {
            ...trimmedStringType,
            minlength: [
                6,
                'Password must have more or equal than 6 characters!',
            ],
        },
        avatar: {
            ...trimmedStringType,
            validate: [validator.isURL, 'Invalid avatar url!'],
            default: DEFAULT_AVATAR,
        },
        role: {
            ...trimmedStringType,
            enum: {
                values: Object.values(UserRole),
                message: `Role is either: ${Object.values(UserRole).join(
                    ', '
                )}`,
            },
            required: [true, 'Role field must be required!'],
        },
        passwordModified: {
            type: Date,
        },
        code: {
            type: Number,
            required: [
                function (this: UserDocument) {
                    return !(this.role === UserRole.ADMIN);
                },
                'Code field must be required!',
            ],
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                const response = omitValueObj(ret, [
                    '__v',
                    'password',
                    'passwordModified',
                ]);

                return response;
            },
        },
    }
);

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);
