import Queue from "bull";
import { NOTIFICATION_QUEUE_KEY } from "./constants.ts";

export const notificationQueue = new Queue<{ html: string; subject: string }>(
  NOTIFICATION_QUEUE_KEY,
  `redis://redis:6379`,
);
