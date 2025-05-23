import { createClient } from "redis";

export const getRedisClient = async () => {
  const client = createClient({
    url: `redis://redis:6379`, // 'redis' is the hostname within Docker
  });

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client.connect();

  return client;
};
