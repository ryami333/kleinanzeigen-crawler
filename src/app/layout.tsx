"use client";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import {
  Anchor,
  AppShell,
  Burger,
  Container,
  Group,
  MantineProvider,
  Title,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [opened, { toggle }] = useDisclosure();
  return (
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
        <MantineProvider forceColorScheme="dark">
          <Notifications />

          <AppShell
            header={{ height: 60 }}
            navbar={{
              width: 300,
              breakpoint: "sm",
              collapsed: { mobile: !opened },
            }}
            padding="md"
          >
            <AppShell.Header>
              <Group h="100%" px="md">
                <Burger
                  opened={opened}
                  onClick={toggle}
                  hiddenFrom="sm"
                  size="sm"
                />
                <Title size="lg">Kleinanzeigen Crawler</Title>
              </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
              <Anchor href="/">Settings</Anchor>
            </AppShell.Navbar>
            <AppShell.Main>
              <Container size="lg">{children}</Container>
            </AppShell.Main>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
};

export default Layout;
