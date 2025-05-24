import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { auth, signIn } from "../../auth";
import { App } from "../components/App";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session) {
    return signIn();
  }

  const colorScheme = "dark" as const;

  return (
    <html data-mantine-color-scheme={colorScheme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body>
        <MantineProvider forceColorScheme={colorScheme}>
          <App>{children}</App>
        </MantineProvider>
      </body>
    </html>
  );
};

export default Layout;
