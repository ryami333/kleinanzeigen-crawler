"use client";

import { Button, Card, Modal, Stack, Title, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import z from "zod";
import { querySchema } from "../helpers/querySchema.ts";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { QueryForm } from "./QueryForm.tsx";
import { addQueryAction } from "../helpers/addQueryAction.ts";

export const Homepage = ({
  currentValue,
}: {
  currentValue: Array<z.infer<typeof querySchema>>;
}) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Stack>
        {currentValue.map((query, index) => (
          <Card key={index}>
            <Stack gap="sm">
              <div>
                <Title>Query</Title>
                <Text>{query.value}</Text>
              </div>
              <div>
                <Title>Email</Title>
                <Text>{query.email}</Text>
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
          onSubmit={async (query: z.infer<typeof querySchema>) => {
            try {
              await addQueryAction({ data: query });

              notifications.show({
                title: "Success",
                message: "Successfully updated.",
                color: "green",
              });

              close();
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
