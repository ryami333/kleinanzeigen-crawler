"use server";

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./authMiddleware.ts";
import { getCrawlerQueue } from "../../lib/getCrawlerQueue.ts";
import { env } from "./frontend-env.ts";
import { querySchema } from "./querySchema.ts";
import { queriesCollection } from "./queriesCollection.ts";
import { ObjectId } from "mongodb";
import z from "zod";

export const updateQueryAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(querySchema.extend({ id: z.string() }))
  .handler(async ({ data: { id, ...query } }) => {
    await queriesCollection.updateOne(
      { $where: { _id: new ObjectId(id) } },
      { $set: query },
    );

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
