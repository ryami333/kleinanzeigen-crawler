import { Anchor, List, ListItem } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { kleinanzeigenUrlSchema } from "../../../helpers/kleinanzeigenUrlSchema.ts";
import { getCurrentQueryValue } from "../../../helpers/getCurrentQueryValue.ts";

export const Route = createFileRoute("/(protected)/_layout/browse")({
  component: function PageComponent() {
    const currentValue = Route.useLoaderData() ?? "";

    return (
      <List>
        {currentValue.map((query, index) => (
          <ListItem key={index}>
            <Anchor
              href={
                kleinanzeigenUrlSchema.safeParse(query.value).success
                  ? query.value
                  : `https://www.kleinanzeigen.de/s-berlin/${query.value}/k0l3331`
              }
            >
              {query.value}
            </Anchor>
          </ListItem>
        ))}
      </List>
    );
  },
  loader: () => getCurrentQueryValue(),
});
