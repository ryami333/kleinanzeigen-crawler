import { createFileRoute } from "@tanstack/react-router";
import { Homepage } from "../../../components/Homepage.tsx";
import { getCurrentQueryValue } from "../../../helpers/getCurrentQueryValue.ts";

export const Route = createFileRoute("/(protected)/_layout/")({
  component: function PageComponent() {
    const currentValue = Route.useLoaderData();

    return <Homepage currentValue={currentValue ?? ""} />;
  },
  loader: () => getCurrentQueryValue(),
});
