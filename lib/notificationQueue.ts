import Queue from "bull";
import { NOTIFICATION_QUEUE_KEY } from "./constants.ts";

export const notificationQueue = new Queue<{
  html: string;
  subject: string;
  to: string;
}>(NOTIFICATION_QUEUE_KEY, `redis://valkey:6379`);
