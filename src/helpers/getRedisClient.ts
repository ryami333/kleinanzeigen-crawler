import { createClient } from "redis";
import { env } from "./frontend-env.ts";

export const getRedisClient = async () => {
  const client = createClient({
    url: `redis://${env.VALKEY_HOST}:6379`,
  });

  client.on("error", (err) => console.error("Valkey Client Error", err));

  await client.connect();

  return client;
};
