/// <reference types="vite/client" />
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Kleinanzeigen Crawler",
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  const colorScheme = "dark" as const;

  return (
    <html data-mantine-color-scheme={colorScheme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <MantineProvider forceColorScheme={colorScheme}>
          <Notifications />
          <Outlet />
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  );
}
