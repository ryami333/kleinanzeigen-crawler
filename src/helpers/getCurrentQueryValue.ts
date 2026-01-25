import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./authMiddleware";
import { getRedisClient } from "./getRedisClient";
import { REDIS_QUERY_KEY } from "../../lib/constants";
import { querySchema } from "./querySchema";
import z from "zod";

export const getCurrentQueryValue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const redisClient = await getRedisClient();
    const rawValues = await redisClient
      .sMembers(REDIS_QUERY_KEY)
      .then((results) => results.map((item) => JSON.parse(item)));

    return z.array(querySchema).catch([]).parse(rawValues);
  });
