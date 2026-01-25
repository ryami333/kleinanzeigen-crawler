"use server";

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./authMiddleware";
import { getRedisClient } from "./getRedisClient";
import { formValidationSchema } from "./formValidationSchema";
import { REDIS_QUERY_KEY } from "../../lib/constants";

export const submitQueryAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(formValidationSchema)
  .handler(async ({ data: formData }) => {
    const redisClient = await getRedisClient();

    if (formData.query.length === 0) {
      await redisClient.del(REDIS_QUERY_KEY);
    } else {
      await redisClient
        .multi()
        .del(REDIS_QUERY_KEY)
        .sAdd(
          REDIS_QUERY_KEY,
          formData.query.map((item) => item.value),
        )
        .exec();
    }

    /**
     * Set a baseline so that we don't get emailed about all of the _existing_
     * results.
     */
    // crawlerQueue.add(
    //   { sendNotifications: false },
    //   {
    //     attempts: 3,
    //   },
    // );

    return {
      ok: true,
    };
  });
