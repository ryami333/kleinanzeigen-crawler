"use server";

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./authMiddleware";
import { getRedisClient } from "./getRedisClient";
import { formValidationSchema } from "./formValidationSchema";
import { REDIS_QUERY_KEY } from "../../lib/constants";
import { getCrawlerQueue } from "../../lib/getCrawlerQueue";
import { env } from "./frontend-env";

export const submitQueryAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(formValidationSchema)
  .handler(async ({ data: formData }) => {
    const redisClient = await getRedisClient();

    if (formData.queries.length === 0) {
      await redisClient.del(REDIS_QUERY_KEY);
    } else {
      await redisClient
        .multi()
        .del(REDIS_QUERY_KEY)
        .sAdd(
          REDIS_QUERY_KEY,
          formData.queries.map((item) => JSON.stringify(item)),
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
