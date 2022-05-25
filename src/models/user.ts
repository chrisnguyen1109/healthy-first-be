import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import { BAD_REQUEST } from 'http-status';
import mongoose, { Document, Model, Schema } from 'mongoose';
import validator from 'validator';

import { BCRYPT_SALT, DEFAULT_AVATAR } from '@/config';
import {
    checkMultipleWords,
    compareBcrypt,
    omitValueObj,
    trimmedStringType,
} from '@/helpers';
import { IUser, UserRole } from '@/types';

export interface UserDocument extends IUser, Document {
    updateMe: (
        body: Pick<UserDocument, 'fullName' | 'avatar'>
    ) => Promise<UserDocument>;
    updateMyPassword: (
        passport: string,
        newPassword: string
    ) => Promise<UserDocument>;
    checkPasswordModified: (jwtIat: number) => boolean;
}

type UserModel = Model<UserDocument>;

const userSchema: Schema<UserDocument, UserModel> = new Schema(
    {
        fullName: {
            ...trimmedStringType,
            required: [true, 'Full name field must be required!'],
            validate: {
                validator: (val: string) => checkMultipleWords(val, 2),
                message: 'Full name contains at least 2 words',
            },
        },
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
        provinceCode: {
            type: Number,
            required: [
                function (this: UserDocument) {
                    return !(this.role === UserRole.ADMIN);
                },
                'Province code field must be required!',
            ],
        },
        districtCode: {
            type: Number,
            required: [
                function (this: UserDocument) {
                    return this.role === UserRole.EXPERT;
                },
                'District code field must be required!',
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

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(BCRYPT_SALT);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordModified = new Date();

    return next();
});

userSchema.methods.updateMe = async function (
    this: UserDocument,
    body: Pick<UserDocument, 'fullName' | 'avatar'>
) {
    (
        Object.keys(body) as Array<
            keyof Pick<UserDocument, 'fullName' | 'avatar'>
        >
    ).forEach(key => {
        this[key] = body[key];
    });

    await this.save();

    return this;
};

userSchema.methods.updateMyPassword = async function (
    this: UserDocument,
    password: string,
    newPassword: string
) {
    const passwordMatching = await compareBcrypt(password, this.password);
    if (!passwordMatching) {
        throw createHttpError(BAD_REQUEST, 'Wrong password!');
    }

    this.password = newPassword;

    await this.save();

    return this;
};

userSchema.methods.checkPasswordModified = function (
    this: UserDocument,
    jwtIat: number
) {
    if (this.passwordModified) {
        return (
            parseInt((this.passwordModified.getTime() / 1000).toString(), 10) >
            jwtIat
        );
    }

    return false;
};

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);
