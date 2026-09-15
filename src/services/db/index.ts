import { User } from "./user";
import { Boost } from "./boost"
import { Typesaurus, schema } from "typesaurus";
import { Task } from "./task";

export const db = schema($ => ({
      users: $.collection<User>(),
      boost :$.collection<Boost>(),
      tasks :$.collection<Task>()
}));


export type Schema = Typesaurus.Schema<typeof db>;

export type SchemaKeys = keyof Schema;
export type SubSchemas = Schema[SchemaKeys]["sub"];
export type SubSchemaKeys = keyof SubSchemas;
export type Document = Schema[SchemaKeys]["Doc"];
export type SubDocument = SubSchemas[SubSchemaKeys]["Doc"];

export type Result<T> = {
  id: string;
} & T & {
    exist: boolean;
  };

export function toResult<U>(doc: Document | SubDocument | null): Result<U> {
  return { id: doc?.ref?.id as string, ...(doc?.data as U), exist: !!doc };
}