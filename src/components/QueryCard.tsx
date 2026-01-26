import {
  Card,
  Stack,
  Title,
  Text,
  Button,
  Modal,
  ButtonGroup,
  Group,
} from "@mantine/core";
import { querySchema } from "../helpers/querySchema";
import z from "zod";
import { useDisclosure } from "@mantine/hooks";
import { QueryForm } from "./QueryForm";
import { addQueryAction } from "../helpers/addQueryAction";
import { notifications } from "@mantine/notifications";
import { useRouter } from "@tanstack/react-router";
import { deleteQueryAction } from "../helpers/deleteQueryAction";

export function QueryCard({ query }: { query: z.infer<typeof querySchema> }) {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  return (
    <>
      <Card>
        <Stack gap="sm">
          <div>
            <Title order={3}>Query</Title>
            <Text>{query.value}</Text>
          </div>
          <div>
            <Title order={3}>Email</Title>
            <Text>{query.email || "(system default)"}</Text>
          </div>
          <Group gap="sm" align="stretch" justify="end">
            <Button
              type="button"
              onClick={async () => {
                try {
                  await deleteQueryAction({ data: query.id });

                  notifications.show({
                    title: "Success",
                    message: "Successfully deleted.",
                    color: "green",
                  });

                  router.invalidate();
                } catch (e) {
                  notifications.show({
                    title: "Error",
                    message: "This query could not be deleted",
                    color: "red",
                  });
                  console.error(e);
                }
              }}
              color="red"
              variant="outline"
            >
              Delete
            </Button>
            <Button type="button" onClick={() => open()}>
              Edit
            </Button>
          </Group>
        </Stack>
      </Card>
      <Modal opened={opened} onClose={close} title="Add New Query">
        <QueryForm
          defaultValues={query}
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
}
