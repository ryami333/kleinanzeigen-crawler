"use client";

import { submitQueryAction } from "../helpers/submitQueryAction";
import {
  Button,
  Text,
  Stack,
  TextInput,
  Fieldset,
  ActionIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { IconPlus, IconTrash } from "@tabler/icons-react";

const formValidationSchema = z.object({
  query: z
    .object({
      id: z.string(),
      value: z.string().trim().nonempty({ error: "Row cannot be empty" }),
    })
    .array()
    .transform((input) => input.map((item) => item.value).join("\n")),
});

export const Homepage = ({ currentValue }: { currentValue: string }) => {
  const { register, control, handleSubmit, formState } = useForm({
    resolver: zodResolver(formValidationSchema),
    defaultValues: {
      query: currentValue
        .split("\n")
        .map((item, index) => ({ id: String(index), value: item })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "query",
  });

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      console.log(formValues.query);
      await submitQueryAction({ data: { query: formValues.query } });

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
                defaultValue={currentValue ?? undefined}
                style={{ flex: "1 auto" }}
                error={
                  formState.errors.query?.[index]?.message ||
                  formState.errors.query?.[index]?.id?.message ||
                  formState.errors.query?.[index]?.value?.message
                }
                {...register(`query.${index}.value`)}
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
