import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./authMiddleware";
import { getRedisClient } from "./getRedisClient";
import { REDIS_QUERY_KEY } from "../../lib/constants";

export const getCurrentQueryValue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const redisClient = await getRedisClient();
    return await redisClient.sMembers(REDIS_QUERY_KEY);
  });
