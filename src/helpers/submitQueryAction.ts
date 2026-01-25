"use server";

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./authMiddleware.ts";
import { getRedisClient } from "./getRedisClient.ts";
import { REDIS_QUERY_KEY } from "../../lib/constants.ts";
import { getCrawlerQueue } from "../../lib/getCrawlerQueue.ts";
import { env } from "./frontend-env.ts";
import z from "zod";
import { querySchema } from "./querySchema.ts";

export const submitQueryAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.array(querySchema))
  .handler(async ({ data: queries }) => {
    const redisClient = await getRedisClient();

    if (queries.length === 0) {
      await redisClient.del(REDIS_QUERY_KEY);
    } else {
      await redisClient
        .multi()
        .del(REDIS_QUERY_KEY)
        .sAdd(
          REDIS_QUERY_KEY,
          queries.map((item) => JSON.stringify(item)),
        )
        .exec();
    }

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
