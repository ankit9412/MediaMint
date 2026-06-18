import { Queue } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

import IORedis from 'ioredis';

const connection = process.env.REDIS_URL 
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    };

export const downloadQueue = new Queue('downloadQueue', { connection });
