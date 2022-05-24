import mongoose, { Document, Model, Schema } from 'mongoose';
import validator from 'validator';

import { omitValueObj, trimmedStringType } from '@/helpers';
import { BusinessType, IFacility } from '@/types';

export interface FacilityDocument extends IFacility, Document {}

type FacilityModel = Model<FacilityDocument>;

const facilitySchema: Schema<FacilityDocument, FacilityModel> = new Schema(
    {
        name: {
            ...trimmedStringType,
            unique: true,
            required: [true, 'Name field must be required!'],
        },
        address: {
            ...trimmedStringType,
            required: [true, 'Address field must be required!'],
        },
        owner: {
            ...trimmedStringType,
            required: [true, 'Owner field must be required!'],
        },
        businessType: {
            ...trimmedStringType,
            enum: {
                values: Object.values(BusinessType),
                message: `Business type is either: ${Object.values(
                    BusinessType
                ).join(', ')}`,
            },
            required: [true, 'Business type field must be required!'],
        },
        phoneNumber: {
            ...trimmedStringType,
            validate: [validator.isMobilePhone, 'Invalid phone number format!'],
        },
        provinceCode: {
            type: Number,
            required: [true, 'Province code field must be required!'],
        },
        provinceName: {
            ...trimmedStringType,
            required: [true, 'Province name field must be required!'],
        },
        districtCode: {
            type: Number,
            required: [true, 'District code field must be required!'],
        },
        districtName: {
            ...trimmedStringType,
            required: [true, 'District name field must be required!'],
        },
        wardCode: {
            type: Number,
            required: [true, 'Ward code field must be required!'],
        },
        wardName: {
            ...trimmedStringType,
            required: [true, 'Ward name field must be required!'],
        },
        description: {
            ...trimmedStringType,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                const response = omitValueObj(ret, ['__v']);

                return response;
            },
        },
    }
);

export const Facility = mongoose.model<FacilityDocument, FacilityModel>(
    'Facility',
    facilitySchema
);
