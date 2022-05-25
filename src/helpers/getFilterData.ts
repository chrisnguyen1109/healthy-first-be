import { Document, Model } from 'mongoose';

import { FeatureListApi } from './featureListApi';
import { FeatureRecordApi } from './featureRecordApi';

export const getFilterData = async <T extends Document>(
    model: Model<T>,
    queryObject: Record<string, any> = {},
    searchFields: Exclude<keyof T, keyof Document>[] = [],
    populateFields: Record<string, string[]> = {}
): Promise<[T[], number]> => {
    const featureApi = new FeatureListApi<T>(model, queryObject);

    const query = featureApi.search([...searchFields]);

    return Promise.all([
        query.projecting().sort().paginate().populate(populateFields).execute(),
        query.count(),
    ]);
};

export const getRecordData = async <T extends Document>(
    model: Model<T>,
    id: string,
    queryObject: Record<string, any> = {},
    populateFields: Record<string, string[]> = {}
): Promise<T | null> => {
    const featureApi = new FeatureRecordApi<T>(model, id, queryObject);

    return featureApi.projecting().populate(populateFields).execute();
};
