import { createServerFn } from "@tanstack/react-start";
import { REDIS_QUERY_KEY } from "../../lib/constants";
import { authMiddleware } from "./authMiddleware";
import { getRedisClient } from "../../lib/getRedisClient";

export const getCurrentQueryValue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const redisClient = await getRedisClient();
    const currentValue = await redisClient.get(REDIS_QUERY_KEY);

    return currentValue;
  });
