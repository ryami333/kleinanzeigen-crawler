"use client";

import { Button, Card, Modal, Stack, Title, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import z from "zod";
import { querySchema } from "../helpers/querySchema.ts";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { QueryForm } from "./QueryForm.tsx";
import { addQueryAction } from "../helpers/addQueryAction.ts";
import { useRouter } from "@tanstack/react-router";

export const Homepage = ({
  currentValue,
}: {
  currentValue: Array<z.infer<typeof querySchema>>;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  return (
    <>
      <Stack>
        {currentValue.map((query, index) => (
          <Card key={index}>
            <Stack gap="sm">
              <div>
                <Title order={3}>Query</Title>
                <Text>{query.value}</Text>
              </div>
              <div>
                <Title order={3}>Email</Title>
                <Text>{query.email || "(system default)"}</Text>
              </div>
            </Stack>
          </Card>
        ))}
        <Button
          variant="outline"
          type="button"
          fullWidth
          onClick={() => open()}
          rightSection={<IconPlus size={14} />}
        >
          Add
        </Button>
      </Stack>
      <Modal opened={opened} onClose={close} title="Add New Query">
        <QueryForm
          defaultValues={{
            id: window.crypto.randomUUID(),
            value: "",
            email: "",
          }}
          onSubmit={async (query: z.infer<typeof querySchema>) => {
            try {
              await addQueryAction({ data: query });

              notifications.show({
                title: "Success",
                message: "Successfully updated.",
                color: "green",
              });

              close();
              router.invalidate();
            } catch (e) {
              notifications.show({
                title: "Error",
                message: "This query could not be submitted",
                color: "red",
              });
              console.error(e);
            }
          }}
        />
      </Modal>
    </>
  );
};
