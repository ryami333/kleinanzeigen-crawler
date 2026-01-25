import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "./authMiddleware.ts";
import { getRedisClient } from "./getRedisClient.ts";
import { REDIS_QUERY_KEY } from "../../lib/constants.ts";
import { querySchema } from "./querySchema.ts";

export const getCurrentQueryValue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const redisClient = await getRedisClient();
    const rawValues = await redisClient
      .sMembers(REDIS_QUERY_KEY)
      .then((results) => results.map((item) => JSON.parse(item)));

    return z.array(querySchema).catch([]).parse(rawValues);
  });
