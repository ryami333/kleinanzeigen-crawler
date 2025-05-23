"use server";

import { z } from "zod";
import { createSafeAction } from "./createSafeAction";
import { getRedisClient } from "../../lib/getRedisClient.mjs";
import { REDIS_QUERY_KEY } from "../../lib/constants.mjs";
import { crawlerQueue } from "../../lib/crawlerQueue.mjs";

const schema = z.object({
  query: z
    .string()
    .trim()
    .nonempty()
    /**
     * \u00e4 -> ä
     * \u00f6 -> ö
     * \u00fc -> ü
     * \u00df -> ß
     */
    .regex(/^[a-z0-9\u00e4\u00f6\u00fc\u00df\r\n-]+$/) // alphanumeric. newlines, ü, ä and ö only
    .transform((val) => val.replace(/\r\n/g, "\n")), // normalize CRLF to LF)
});

export const submitQueryAction = createSafeAction(schema, async ({ query }) => {
  const redisClient = await getRedisClient();

  await redisClient.set(REDIS_QUERY_KEY, query);

  /**
   * Set a baseline so that we don't get emailed about all of the _existing_
   * results.
   */
  crawlerQueue.add(
    { sendNotifications: false },
    {
      attempts: 3,
    },
  );

  return {
    ok: true,
  };
});
