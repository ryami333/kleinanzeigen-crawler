"use server";

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./authMiddleware.ts";
import { getRedisClient } from "./getRedisClient.ts";
import { REDIS_QUERY_KEY } from "../../lib/constants.ts";
import { getCrawlerQueue } from "../../lib/getCrawlerQueue.ts";
import { env } from "./frontend-env.ts";
import { querySchema } from "./querySchema.ts";

export const updateQueryAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(querySchema)
  .handler(async ({ data: query }) => {
    const redisClient = await getRedisClient();

    const members = await redisClient
      .sMembers(REDIS_QUERY_KEY)
      .then((items) =>
        items.map((item) => querySchema.parse(JSON.parse(item))),
      );

    const updatedMembers = members.map((member) => {
      if (member.id === query.id) {
        return query;
      }
      return member;
    });

    {
      /**
       * There's no such thing as an "update" operation, so we've got to delete
       * all the existing queries and then re-add them. Doing it in a single
       * operation because presumably this is "atomic"??
       */
      const operation = redisClient.multi();
      operation.del(REDIS_QUERY_KEY);

      updatedMembers.forEach((member) => {
        operation.sAdd(REDIS_QUERY_KEY, JSON.stringify(member));
      }, redisClient.multi());

      await operation.exec();
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
