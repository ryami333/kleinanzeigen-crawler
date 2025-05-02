import Queue from "bull";
import { env } from "./env.mjs";
import { BULL_QUEUE_KEY } from "./constants.mjs";

/**
 * @type {Queue.Queue<{ sendNotifications: boolean }>} crawlerQueue
 */
export const crawlerQueue = new Queue(
  BULL_QUEUE_KEY,
  `redis://${env.REDIS_HOST}:6379`,
);
