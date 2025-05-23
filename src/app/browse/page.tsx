import { Anchor, List, ListItem } from "@mantine/core";
import { REDIS_QUERY_KEY } from "../../../lib/constants.mjs";
import { getRedisClient } from "../../../lib/getRedisClient.mjs";

export default async function Page() {
  const redisClient = await getRedisClient();

  const currentValue = (await redisClient.get(REDIS_QUERY_KEY)) ?? "";

  return (
    <List>
      {currentValue
        .split("\n")
        .map((input) => input.trim())
        .toSorted((a, b) => a.localeCompare(b))
        .map((query, index) => (
          <ListItem key={index}>
            <Anchor
              href={`https://www.kleinanzeigen.de/s-berlin/${query}/k0l3331`}
            >
              {query}
            </Anchor>
          </ListItem>
        ))}
    </List>
  );
}
