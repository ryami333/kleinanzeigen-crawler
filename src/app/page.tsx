import { REDIS_QUERY_KEY } from "../../lib/constants.mjs";
import { getRedisClient } from "../../lib/getRedisClient.mjs";

export default async function Page() {
  const redisClient = await getRedisClient();

  const currentValue = await redisClient.get(REDIS_QUERY_KEY);

  return (
    <>
      <p>Please use lower-case alphanumeric queries, separated by newlines.</p>
      <form
        method="post"
        action="/submit"
        style={{
          display: "flex",
          flexDirection: "column",
          rowGap: "0.5em",
        }}
      >
        <textarea
          name="query"
          rows={10}
          defaultValue={currentValue ?? undefined}
          style={{ flex: "1 auto" }}
        />
        <button type="submit">Submit"</button>
      </form>
    </>
  );
}
