import { Document } from 'mongoose';

export type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
    ...a: Parameters<T>
) => TNewReturn;

export interface Pagination {
    records: number;
    totalRecords: number;
    limit: number;
    page: number;
    totalPage: number;
}

export type ServerResponse<T> = T extends Document[]
    ? { data: { records: T; pagination: Pagination } }
    : T extends Document
    ? { data: { record: T | null } }
    : { data?: Record<string, any> };

export type ApiResponse<T = any> = ServerResponse<T> & { message: string };

export enum TokenType {
    ACCESS_TOKEN = 'access_token',
    REFRESH_TOKEN = 'refresh_token',
}

export enum PdfTemplate {
    CERTIFIED_SUCCESS = 'success',
    CERTIFIED_FAILURE = 'failure',
    CERTIFIED_REVOKED = 'revoked',
}

export enum RedisKey {
    REFRESH_TOKEN = 'rftk',
    RESET_PASSWORD = 'rspwd',
}
