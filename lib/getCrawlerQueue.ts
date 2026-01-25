import Queue from "bull";
import { BULL_QUEUE_KEY } from "./constants.ts";

export const getCrawlerQueue = ({ hostname }: { hostname: string }) =>
  new Queue<{ sendNotifications: boolean }>(
    BULL_QUEUE_KEY,
    `redis://${hostname}:6379`,
    {
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
    },
  );
