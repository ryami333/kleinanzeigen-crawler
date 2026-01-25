import { Outlet, createFileRoute } from "@tanstack/react-router";
import { authMiddleware } from "../../helpers/authMiddleware.ts";
import { App } from "../../components/App.tsx";

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
