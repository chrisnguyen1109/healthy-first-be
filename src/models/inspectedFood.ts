import { Document, Model, Schema } from 'mongoose';

import { trimmedStringType } from '@/helpers';
import { InspectedFoods, InspectStatus } from '@/types';

export interface InspectedFoodsDocument extends InspectedFoods, Document {}

type InspectedFoodsModel = Model<InspectedFoodsDocument>;

export const inspectedFoodSchema: Schema<
    InspectedFoodsDocument,
    InspectedFoodsModel
> = new Schema({
    name: {
        ...trimmedStringType,
        require: [true, 'Name of inspected food must be required!'],
    },
    organization: {
        ...trimmedStringType,
        require: [true, 'Organization of inspected food must be required!'],
    },
    status: {
        ...trimmedStringType,
        enum: {
            values: Object.values(InspectStatus),
            message: `Status of inspected food is either: ${Object.values(
                InspectStatus
            ).join(', ')}`,
        },
        default: InspectStatus.PENDING,
    },
    notes: {
        ...trimmedStringType,
    },
    resultDate: {
        type: Date,
    },
});
