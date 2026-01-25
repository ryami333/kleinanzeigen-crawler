import { Outlet, createFileRoute } from "@tanstack/react-router";
import { authMiddleware } from "../../helpers/authMiddleware";
import { App } from "../../components/App";

export const Route = createFileRoute("/(protected)/_layout")({
  component: function Layout() {
    return (
      <App>
        <Outlet />
      </App>
    );
  },
  server: {
    middleware: [authMiddleware],
  },
});
