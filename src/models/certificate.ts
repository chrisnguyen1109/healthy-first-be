import mongoose, { Document, Model, Schema } from 'mongoose';

import { omitValueObj } from '@/helpers';
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
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                require: [true, 'Certificate must belong to a user!'],
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
                default: CertificateStatus.TESTING,
            },
            isTakeBack: {
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
