"use client";

import {
  AppShell,
  Burger,
  Container,
  Group,
  NavLink,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAdjustments, IconEye, IconLogout } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "../helpers/authClient.ts";

export const App = ({ children }: { children: React.ReactNode }) => {
  const [opened, { toggle }] = useDisclosure();
  const router = useRouter();

  return (
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
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
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
        <NavLink
          onClick={async () => {
            authClient.signOut();
            router.invalidate();
          }}
          label="Logout"
          leftSection={<IconLogout size={16} stroke={1.5} />}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Container size="lg">{children}</Container>
      </AppShell.Main>
    </AppShell>
  );
};
