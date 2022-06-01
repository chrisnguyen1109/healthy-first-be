import mongoose, { Document, Model, Schema } from 'mongoose';

import { omitValueObj, trimmedStringType } from '@/helpers';
import { CertificateStatus, ICertificate } from '@/types';

import { inspectedFoodSchema } from './inspectedFood';

export interface CertificateDocument extends ICertificate, Document {}

type CertificateModel = Model<CertificateDocument>;

const certificateSchema: Schema<CertificateDocument, CertificateModel> =
    new Schema(
        {
            facility: {
                type: Schema.Types.ObjectId,
                ref: 'Facility',
                require: [true, 'Certificate must belong to a facility!'],
            },
            facilityName: {
                ...trimmedStringType,
                require: [true, 'Facility name field is required!'],
            },
            provinceCode: {
                type: Number,
                required: [true, 'Province code field is required!'],
            },
            districtCode: {
                type: Number,
                required: [true, 'District code field is required!'],
            },
            startDate: {
                type: Date,
            },
            endDate: {
                type: Date,
            },
            status: {
                type: Number,
                enum: {
                    values: Object.values(CertificateStatus),
                    message: `Status is either: ${Object.values(
                        CertificateStatus
                    ).join(', ')}`,
                },
                default: CertificateStatus.INITIAL,
            },
            isRevoked: {
                type: Boolean,
                default: false,
            },
            inspectedFoods: {
                type: [inspectedFoodSchema],
                default: undefined,
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

export const Certificate = mongoose.model<
    CertificateDocument,
    CertificateModel
>('Certificate', certificateSchema);
