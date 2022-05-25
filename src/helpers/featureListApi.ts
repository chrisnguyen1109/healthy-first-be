/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import { Document, FilterQuery, Model, Query } from 'mongoose';

import { DEFAULT_LIMIT, DEFAULT_PAGE, DEFAULT_START_PAGE } from '@/config';

import { omitValueObj } from './omitValueObj';

export class FeatureListApi<T extends Document> {
    private query: Query<T[], T>;

    private queryCount: Query<number, any>;

    constructor(
        private model: Model<T>,
        private queryString: Record<string, any>
    ) {
        const queryObject = this.filterQuery();

        this.query = this.model.find(queryObject);
        this.queryCount = this.model.countDocuments(queryObject);
    }

    private filterQuery(): FilterQuery<T> {
        const excludeFields = [
            '_page',
            '_sort',
            '_limit',
            '_fields',
            '_q',
            '_start',
            '_end',
            '_expand',
        ];

        const queryObject = omitValueObj(
            this.queryString,
            excludeFields
        ) as FilterQuery<T>;

        for (const key in queryObject) {
            const matchFilter = key.match(/^[a-zA-Z]+_(gte|gt|lte|lt|ne)+$/);

            if (matchFilter) {
                const filterType = `$${matchFilter[1]}`;
                const filterField = key.split('_')[0] as keyof T;

                queryObject[filterField] = {
                    ...queryObject[filterField],
                    [filterType]: queryObject[key],
                };
            }
        }

        return queryObject;
    }

    search(fileds: Exclude<keyof T, keyof Document>[]): FeatureListApi<T> {
        if (this.queryString._q && fileds.length > 0) {
            const searchField = fileds.map(field => ({
                [field]: new RegExp(`${this.queryString._q.trim()}`, 'i'),
            })) as FilterQuery<T>[];

            this.query.or(searchField);
            this.queryCount.or(searchField);
        }

        return this;
    }

    sort(): FeatureListApi<T> {
        if (typeof this.queryString._sort === 'string') {
            this.query.sort(this.queryString._sort);
            return this;
        }

        if (this.queryString._sort instanceof Array) {
            const sortFields = this.queryString._sort.join(' ');
            this.query.sort(sortFields);
            return this;
        }

        this.query.sort('-createdAt');

        return this;
    }

    projecting(): FeatureListApi<T> {
        if (typeof this.queryString._fields === 'string') {
            this.query.select(this.queryString._fields);
        }

        if (this.queryString._fields instanceof Array) {
            const selectFields = this.queryString._fields.join(' ');
            this.query.select(selectFields);
        }

        return this;
    }

    paginate(): FeatureListApi<T> {
        const start = +this.queryString._start || DEFAULT_START_PAGE;
        const page = +this.queryString._page || DEFAULT_PAGE;
        const limit = +this.queryString._limit || DEFAULT_LIMIT;
        const end = +this.queryString._end;
        const skip = start - 1 + (page - 1) * limit;

        this.query.skip(skip).limit(end || limit);

        return this;
    }

    populate(fields: Record<string, string[]>): FeatureListApi<T> {
        if (typeof this.queryString._expand === 'string') {
            const path = this.queryString._expand;

            this.query.populate({
                path,
                select: fields[path]?.join(' '),
                strictPopulate: false,
            });
        }

        if (this.queryString._expand instanceof Array) {
            this.queryString._expand.forEach(path => {
                this.query.populate({
                    path,
                    select: fields[path]?.join(' '),
                    strictPopulate: false,
                });
            });
        }

        return this;
    }

    count() {
        return this.queryCount;
    }

    execute() {
        return this.query;
    }
}
