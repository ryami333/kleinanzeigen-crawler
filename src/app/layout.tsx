import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { auth } from "../../auth";
import { App } from "../components/App";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  await auth();
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body>
        <MantineProvider forceColorScheme="dark">
          <App>{children}</App>
        </MantineProvider>
      </body>
    </html>
  );
};

export default Layout;
