"use client";

import { useTransition } from "react";
import { submitQueryAction } from "../helpers/submitQueryAction";
import { Button, Textarea, Text, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export const Homepage = ({ currentValue }: { currentValue: string }) => {
  const [isSubmitting, startTransition] = useTransition();

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    startTransition(async () => {
      if (!isSubmitting) {
        const query = e.currentTarget.querySelector("textarea")?.value ?? "";

        try {
          await submitQueryAction({ query });

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
      }
    });
  };

  return (
    <Stack>
      <Text>
        Please use lower-case alphanumeric queries, separated by newlines.
      </Text>
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          rowGap: "0.5em",
        }}
      >
        <Textarea
          name="query"
          rows={10}
          defaultValue={currentValue ?? undefined}
          style={{ flex: "1 auto" }}
        />
        <Button type="submit" disabled={isSubmitting} fullWidth>
          Submit
        </Button>
      </form>
    </Stack>
  );
};
