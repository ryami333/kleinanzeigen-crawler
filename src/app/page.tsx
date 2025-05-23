import { REDIS_QUERY_KEY } from "../../lib/constants.mjs";
import { getRedisClient } from "../../lib/getRedisClient.mjs";
import { Homepage } from "../components/Homepage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const redisClient = await getRedisClient();

  const currentValue = await redisClient.get(REDIS_QUERY_KEY);

  return <Homepage currentValue={currentValue ?? ""} />;
}
