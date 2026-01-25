"use client";

import {
  Button,
  Stack,
  TextInput,
  Fieldset,
  Divider,
  Grid,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import z from "zod";
import { querySchema } from "../helpers/querySchema.ts";
import { submitQueryAction } from "../helpers/submitQueryAction.ts";

export const Homepage = ({
  currentValue,
}: {
  currentValue: Array<z.infer<typeof querySchema>>;
}) => {
  const { register, control, handleSubmit, formState } = useForm({
    resolver: zodResolver(z.object({ queries: z.array(querySchema) })),
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
      await submitQueryAction({ data: formValues.queries });

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
            <Fieldset key={field.id} variant="default" legend={field.id}>
              <Stack gap="sm">
                <TextInput
                  label="Query"
                  style={{ flex: "1 auto" }}
                  error={formState.errors.queries?.[index]?.value?.message}
                  {...register(`queries.${index}.value`)}
                />
                <TextInput
                  label="Notification Email"
                  style={{ flex: "1 auto" }}
                  error={formState.errors.queries?.[index]?.email?.message}
                  description="Leave blank to use default notification email"
                  {...register(`queries.${index}.email`)}
                />
                <Divider />
                <Button
                  variant="outline"
                  onClick={() => remove(index)}
                  rightSection={<IconTrash size={14} />}
                >
                  Remove
                </Button>
              </Stack>
            </Fieldset>
          ))}

          <Grid>
            <Grid.Col span={6}>
              {" "}
              <Button
                variant="outline"
                type="button"
                fullWidth
                onClick={() =>
                  append({ id: window.crypto.randomUUID(), value: "" })
                }
                rightSection={<IconPlus size={14} />}
              >
                Add
              </Button>
            </Grid.Col>
            <Grid.Col span={6}>
              <Button type="submit" disabled={formState.isSubmitting} fullWidth>
                Submit
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </Stack>
  );
};
