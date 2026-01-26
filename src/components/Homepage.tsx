"use client";

import { Button, Modal, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import z from "zod";
import { QueryDocument, querySchema } from "../helpers/querySchema.ts";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { QueryForm } from "./QueryForm.tsx";
import { addQueryAction } from "../helpers/addQueryAction.ts";
import { useRouter } from "@tanstack/react-router";
import { QueryCard } from "./QueryCard.tsx";
import { Serialized } from "../helpers/serializeDocument.ts";

export const Homepage = ({
  currentValue,
}: {
  currentValue: Serialized<QueryDocument>[];
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  return (
    <>
      <Stack>
        {currentValue.map((query, index) => (
          <QueryCard key={index} query={query} />
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
