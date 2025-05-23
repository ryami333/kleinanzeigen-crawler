import Queue from "bull";
import { BULL_QUEUE_KEY } from "./constants.mjs";

/**
 * @type {Queue.Queue<{ sendNotifications: boolean }>} crawlerQueue
 */
export const crawlerQueue = new Queue(BULL_QUEUE_KEY, `redis://redis:6379`, {
  defaultJobOptions: {
    attempts: 10,
    backoff: {
      /**
       * With exponential backoff, the delay (in milliseconds is computed) as:
       * 2 ^ (attempts - 1) * delay
       */
      type: "exponential",
      delay: 1000,
    },
  },
});
