"use client";

import { submitQueryAction } from "../helpers/submitQueryAction";
import { Button, Textarea, Text, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

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
        {fields.map((field, index) => (
          <TextInput
            key={field.id}
            defaultValue={currentValue ?? undefined}
            style={{ flex: "1 auto" }}
            error={
              formState.errors.query?.[index]?.message ||
              formState.errors.query?.[index]?.id?.message ||
              formState.errors.query?.[index]?.value?.message
            }
            {...register(`query.${index}.value`)}
          />
        ))}
        <Button
          type="button"
          onClick={() => append({ id: window.crypto.randomUUID(), value: "" })}
        >
          Add
        </Button>
        <Button type="submit" disabled={formState.isSubmitting} fullWidth>
          Submit
        </Button>
      </form>
    </Stack>
  );
};
