"use server";

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./authMiddleware.ts";
import { getRedisClient } from "./getRedisClient.ts";
import { REDIS_QUERY_KEY } from "../../lib/constants.ts";
import { getCrawlerQueue } from "../../lib/getCrawlerQueue.ts";
import { env } from "./frontend-env.ts";
import { querySchema } from "./querySchema.ts";

export const addQueryAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(querySchema)
  .handler(async ({ data: query }) => {
    const redisClient = await getRedisClient();

    await redisClient.sAdd(REDIS_QUERY_KEY, JSON.stringify(query));

    /**
     * Set a baseline so that we don't get emailed about all of the _existing_
     * results.
     */
    const crawlerQueue = getCrawlerQueue({ hostname: env.VALKEY_HOST });
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
