"use client";

import { Button, Modal, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import z from "zod";
import { querySchema } from "../helpers/querySchema.ts";
// import { submitQueryAction } from "../helpers/submitQueryAction.ts";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { QueryForm } from "./QueryForm.tsx";

export const Homepage = ({
  currentValue,
}: {
  currentValue: Array<z.infer<typeof querySchema>>;
}) => {
  const [opened, { open, close }] = useDisclosure(false);

  const onSubmit = async (formValues: z.infer<typeof querySchema>) => {
    try {
      // await submitQueryAction({ data: formValues.queries });

      notifications.show({
        title: "Success",
        message: "Successfully updated.",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "This query could not be submitted",
        color: "red",
      });
      console.error(e);
    }
  };

  return (
    <Stack>
      <Modal opened={opened} onClose={close} title="Add New Query">
        <QueryForm onSubmit={onSubmit} />
      </Modal>
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
  );
};
