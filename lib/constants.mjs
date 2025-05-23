import fs from "node:fs";
import path from "node:path";
import { env } from "./env.mjs";

export const REDIS_QUERY_KEY = "queries-58f8de68-e78c-4146-b20c-54dbd019a8f0";

export const BULL_QUEUE_KEY = "queue-64e4217f-cf6d-4006-938d-c220e311aca4";

export const NOTIFICATION_QUEUE_KEY =
  "notifications-3b3bcd61-0d7c-43d0-9bde-a5d8118c016f";

export const PROCESSED_IDS_SET =
  "processed-ids-75a23be9-e81f-4b9b-8f41-97c24e922588";

export const GMAIL_PASS = fs.readFileSync(
  path.resolve(process.cwd(), env.GMAIL_PASS_FILE),
  "utf8",
);
