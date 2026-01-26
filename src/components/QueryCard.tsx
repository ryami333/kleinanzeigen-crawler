import { Card, Stack, Text, Button, Modal, Group } from "@mantine/core";
import { QueryDocument } from "../helpers/querySchema";
import { useDisclosure } from "@mantine/hooks";
import { QueryForm } from "./QueryForm";
import { notifications } from "@mantine/notifications";
import { useRouter } from "@tanstack/react-router";
import { deleteQueryAction } from "../helpers/deleteQueryAction";
import { Serialized } from "../helpers/serializeDocument";
import { updateQueryAction } from "../helpers/updateQueryAction";

export function QueryCard({ query }: { query: Serialized<QueryDocument> }) {
  const [editModalOpened, editModalActions] = useDisclosure(false);
  const [confirmDeleteModalOpened, confirmDeleteModalActions] =
    useDisclosure(false);
  const router = useRouter();

  return (
    <>
      <Card>
        <Stack gap="sm">
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "auto minmax(0, 1fr)",
              margin: 0,
              columnGap: `var(--mantine-spacing-md)`,
              rowGap: `var(--mantine-spacing-sm)`,
            }}
          >
            <Text component="dt">Query</Text>
            <Text component="dd">{query.value}</Text>

            <Text component="dt">Notifications</Text>
            <Text component="dd">
              {query.notifications.length > 0
                ? query.notifications.join(", ")
                : "(system default)"}
            </Text>
          </dl>
          <Group gap="sm" align="stretch" justify="end">
            <Button type="button" onClick={confirmDeleteModalActions.open}>
              Delete
            </Button>
            <Button type="button" onClick={() => editModalActions.open()}>
              Edit
            </Button>
          </Group>
        </Stack>
      </Card>
      <Modal
        opened={editModalOpened}
        onClose={editModalActions.close}
        title="Add New Query"
      >
        <QueryForm
          defaultValues={query}
          onSubmit={async (values: QueryDocument) => {
            try {
              await updateQueryAction({
                data: { id: query.id, values },
              });

              notifications.show({
                title: "Success",
                message: "Successfully updated.",
                color: "green",
              });

              editModalActions.close();
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
      <Modal
        opened={confirmDeleteModalOpened}
        onClose={confirmDeleteModalActions.close}
        title="Delete Query"
      >
        <Stack gap="sm">
          <Text>Are you sure you wish to delete this query?</Text>
          <Group gap="sm">
            <Button
              type="button"
              onClick={confirmDeleteModalActions.close}
              variant="outline"
            >
              Cancel
            </Button>
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

                  confirmDeleteModalActions.close();
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
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
