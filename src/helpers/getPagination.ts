import { Document } from 'mongoose';

import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@/config';
import { Pagination } from '@/types';

export const getPagination = (
    document: Document[],
    totalRecords: number,
    page: number = DEFAULT_PAGE,
    limit: number = DEFAULT_LIMIT
): Pagination => {
    const totalPage = Math.ceil(totalRecords / limit);

    return {
        page,
        limit,
        records: document.length,
        totalRecords,
        totalPage,
    };
};
