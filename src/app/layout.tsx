"use client";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import {
  AppShell,
  Burger,
  Container,
  Group,
  MantineProvider,
  NavLink,
  Title,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { IconAdjustments, IconEye } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [opened, { toggle }] = useDisclosure();
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
              <NavLink
                href="/"
                label="Settings"
                leftSection={<IconAdjustments size={16} stroke={1.5} />}
              />
              <NavLink
                href="/browse"
                label="Browse"
                leftSection={<IconEye size={16} stroke={1.5} />}
              />
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
