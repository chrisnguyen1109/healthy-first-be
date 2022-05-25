import { Document } from 'mongoose';

import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@/config';
import { Pagination } from '@/types';

export const getPagination = (
    queryObject: Record<string, any>,
    document: Document[],
    totalRecords: number
): Pagination => {
    const page = +queryObject._page || DEFAULT_PAGE;
    const limit = +queryObject._limit || DEFAULT_LIMIT;
    const totalPage = Math.ceil(totalRecords / limit);

    return {
        page,
        limit,
        records: document.length,
        totalRecords,
        totalPage,
    };
};
