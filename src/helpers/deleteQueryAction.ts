"use server";

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./authMiddleware.ts";
import { getCrawlerQueue } from "../../lib/getCrawlerQueue.ts";
import { env } from "./frontend-env.ts";
import z from "zod";
import { queriesCollection } from "./queriesCollection.ts";
import { ObjectId } from "mongodb";

export const deleteQueryAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.coerce.string())
  .handler(async ({ data: uuid }) => {
    queriesCollection.deleteOne({ $where: { _id: new ObjectId(uuid) } });

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
