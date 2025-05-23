import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { Container, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link
        rel="stylesheet"
        href="https://unpkg.com/@mantine/core@7.4.2/styles.css"
      />
    </head>

    <body>
      <MantineProvider>
        <Notifications />
        <Container size="lg">{children}</Container>
      </MantineProvider>
    </body>
  </html>
);

export default Layout;
