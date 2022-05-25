import { Document, Model, Query } from 'mongoose';

export class FeatureRecordApi<T extends Document> {
    private query: Query<T | null, T>;

    constructor(
        private model: Model<T>,
        private id: string,
        private queryString: Record<string, any> = {}
    ) {
        this.query = this.model.findById(this.id);
    }

    projecting(): FeatureRecordApi<T> {
        if (typeof this.queryString._fields === 'string') {
            this.query.select(this.queryString._fields);
        }

        if (this.queryString._fields instanceof Array) {
            const selectFields = this.queryString._fields.join(' ');
            this.query.select(selectFields);
        }

        return this;
    }

    populate(fields: Record<string, string[]>): FeatureRecordApi<T> {
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

    execute() {
        return this.query;
    }
}
