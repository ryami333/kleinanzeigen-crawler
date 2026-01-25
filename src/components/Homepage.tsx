"use client";

import { submitQueryAction } from "../helpers/submitQueryAction";
import { Button, Text, Stack, TextInput, ActionIcon } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { formValidationSchema } from "../helpers/formValidationSchema";
import { querySchema } from "../helpers/querySchema";
import z from "zod";

export const Homepage = ({
  currentValue,
}: {
  currentValue: Array<z.infer<typeof querySchema>>;
}) => {
  const { register, control, handleSubmit, formState } = useForm({
    resolver: zodResolver(formValidationSchema),
    defaultValues: {
      queries: currentValue,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "queries",
  });

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      await submitQueryAction({ data: formValues });

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
  });

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
        <Stack gap="lg">
          {fields.map((field, index) => (
            <div
              key={field.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                columnGap: "0.5em",
              }}
            >
              <TextInput
                style={{ flex: "1 auto" }}
                error={
                  formState.errors.queries?.[index]?.message ||
                  formState.errors.queries?.[index]?.id?.message ||
                  formState.errors.queries?.[index]?.value?.message
                }
                {...register(`queries.${index}.value`)}
              />
              <ActionIcon
                size="lg"
                type="button"
                variant="outline"
                onClick={() => remove(index)}
              >
                <IconTrash
                  style={{ width: "70%", height: "70%" }}
                  stroke={1.5}
                />
              </ActionIcon>
            </div>
          ))}

          <Button
            variant="outline"
            type="button"
            onClick={() =>
              append({ id: window.crypto.randomUUID(), value: "" })
            }
            rightSection={<IconPlus size={14} />}
          >
            Add
          </Button>
          <Button type="submit" disabled={formState.isSubmitting} fullWidth>
            Submit
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};
