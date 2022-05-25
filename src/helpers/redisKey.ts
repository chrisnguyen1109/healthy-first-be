import { RedisKey } from '@/types';

export const redisKey = (key: string, type: RedisKey) => `${key}_${type}`;
