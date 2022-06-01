import createHttpError from 'http-errors';
import { CONFLICT, NOT_FOUND } from 'http-status';
import mongoose, { Document, Model, Schema } from 'mongoose';
import validator from 'validator';

import { getDistrict, getProvince, getWard } from '@/api';
import { omitValueObj, trimmedStringType } from '@/helpers';
import { BusinessType, FacilityCertificate, IFacility } from '@/types';

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
            required: [true, 'Phonenumber field must be required!'],
        },
        provinceCode: {
            type: Number,
            required: [true, 'Province code field must be required!'],
        },
        provinceName: {
            ...trimmedStringType,
        },
        districtCode: {
            type: Number,
            required: [true, 'District code field must be required!'],
        },
        districtName: {
            ...trimmedStringType,
        },
        wardCode: {
            type: Number,
            required: [true, 'Ward code field must be required!'],
        },
        wardName: {
            ...trimmedStringType,
        },
        description: {
            ...trimmedStringType,
        },
        facilityCertificate: {
            ...trimmedStringType,
            enum: {
                values: Object.values(FacilityCertificate),
                message: `Facility certificate is either: ${Object.values(
                    FacilityCertificate
                ).join(', ')}`,
            },
            default: FacilityCertificate.NO_CERTIFICATE,
        },
        certificate: {
            type: Schema.Types.ObjectId,
            ref: 'Certificate',
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

facilitySchema.pre('save', async function (next) {
    if (this.isNew) {
        let provinceCode: number;
        let districtCode: number;

        try {
            const [province, district, ward] = await Promise.all([
                getProvince(this.provinceCode),
                getDistrict(this.districtCode),
                getWard(this.wardCode),
            ]);

            this.provinceName = province.name;
            this.districtName = district.name;
            this.wardName = ward.name;

            provinceCode = district.province_code;
            districtCode = ward.district_code;
        } catch (error) {
            throw createHttpError(
                NOT_FOUND,
                'Invalid province, district or ward code'
            );
        }

        if (provinceCode !== this.provinceCode) {
            throw createHttpError(
                CONFLICT,
                'This district code does not match the province code'
            );
        }

        if (districtCode !== this.districtCode) {
            throw createHttpError(
                CONFLICT,
                'This ward code does not match the district code'
            );
        }
    }

    return next();
});

export const Facility = mongoose.model<FacilityDocument, FacilityModel>(
    'Facility',
    facilitySchema
);
