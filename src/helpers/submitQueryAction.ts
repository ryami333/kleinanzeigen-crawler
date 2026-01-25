"use server";

import { REDIS_QUERY_KEY } from "../../lib/constants";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./authMiddleware";
import { getRedisClient } from "./getRedisClient";
import { formValidationSchema } from "./formValidationSchema";

export const submitQueryAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(formValidationSchema)
  .handler(async ({ data: formData }) => {
    const redisClient = await getRedisClient();

    await redisClient.set(
      REDIS_QUERY_KEY,
      formData.query.map((item) => item.value).join("\n"),
    );

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
