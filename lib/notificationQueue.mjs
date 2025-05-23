import Queue from "bull";
import { NOTIFICATION_QUEUE_KEY } from "./constants.mjs";

/**
 * @type {Queue.Queue<{ html: string, subject: string }>} notificationQueue
 */
export const notificationQueue = new Queue(
  NOTIFICATION_QUEUE_KEY,
  `redis://localhost:6379`,
);
