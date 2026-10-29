// src/queue/redis.ts
import { Redis, RedisOptions } from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const isTls = redisUrl.startsWith('rediss://');

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  ...(isTls
    ? {
        tls: {
          rejectUnauthorized: false,
        },
      }
    : {}),
};

export const redisConnection = new Redis(redisUrl, redisOptions);

redisConnection.on('connect', () => {
  console.log('🔌 Connected to Redis successfully');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message);
});