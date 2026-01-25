import { createFileRoute } from "@tanstack/react-router";
import { Homepage } from "../../../components/Homepage";
import { getCurrentQueryValue } from "../../../helpers/getCurrentQueryValue";

export const Route = createFileRoute("/(protected)/_layout/")({
  component: function PageComponent() {
    const currentValue = Route.useLoaderData();

    return <Homepage currentValue={currentValue ?? ""} />;
  },
  loader: () => getCurrentQueryValue(),
});
