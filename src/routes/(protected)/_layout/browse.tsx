import { Anchor, List, ListItem } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { getCurrentQueryValue } from "../../../helpers/getCurrentQueryValue";

export const Route = createFileRoute("/(protected)/_layout/browse")({
  component: function PageComponent() {
    const currentValue = Route.useLoaderData() ?? "";

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
  },
  loader: () => getCurrentQueryValue(),
});
