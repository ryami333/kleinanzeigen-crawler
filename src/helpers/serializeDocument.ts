import { ObjectId, type Document, type WithId } from "mongodb";

/** Ensure we really have ObjectId at runtime (not string/UUID/etc). */
export type WithObjectId<T extends Document> = WithId<T> & { _id: ObjectId };

/** DB -> API/JSON */
export type Serialized<T extends Document> = Omit<WithObjectId<T>, "_id"> & {
  id: string;
};

/**
 * API/JSON -> DB
 * NOTE: use the same Omit form that TS infers from `{ id, ...rest }`.
 */
export type Deserialized<T extends Document> = Omit<
  Omit<T, "_id"> & { id: string },
  "id"
> & { _id: ObjectId };

/** { _id: ObjectId, ... } -> { id: string, ... } */
export function serialize<T extends Document>(
  doc: WithObjectId<T>,
): Serialized<T> {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toHexString() };
}

/** { id: string, ... } -> { _id: ObjectId, ... } */
export function deserialize<T extends Document>(
  dto: Omit<T, "_id"> & { id: string },
): Deserialized<T> {
  const { id, ...rest } = dto;
  return { ...rest, _id: new ObjectId(id) };
}

/** Array helpers */
export function serializeMany<T extends Document>(
  docs: readonly WithObjectId<T>[],
): Serialized<T>[] {
  return docs.map(serialize);
}

export function deserializeMany<T extends Document>(
  dtos: readonly (Omit<T, "_id"> & { id: string })[],
): Deserialized<T>[] {
  return dtos.map(deserialize);
}
