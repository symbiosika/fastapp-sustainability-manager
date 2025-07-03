import { getDb } from "../../fastapp-framework/src/dbSchema";
import type { CrudPermission } from "../types/permissions";
import {
  dbAppSchema,
  type DatabaseAppSchema,
  validTableNames,
} from "./db-schema";

/**
 * check if a table name is valid and return it
 */
export function getDbSchemaTable<K extends keyof DatabaseAppSchema>(
  tableName: K
): DatabaseAppSchema[K] {
  if (!validTableNames.includes(tableName as string)) {
    throw new Error(`Invalid table name: ${tableName}`);
  } else {
    const db = getDb();
    const key = tableName as keyof typeof db.query;
    const table = dbAppSchema[key];
    return table as DatabaseAppSchema[K];
  }
}

/**
 * Check if a table name is valid
 */
const isValidTablename = (name: string): boolean => {
  return validTableNames.includes(name);
};

/**
 * Returns the table name in a camelCase format
 */
export const normalizeTableName = (name: string): keyof DatabaseAppSchema => {
  // replace '-'-string to a camelCase string
  const tableName = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  if (!isValidTablename(tableName)) {
    throw new Error(`Provided an invalid table name: ${name}`);
  }
  return tableName as keyof DatabaseAppSchema;
};

export const checkTablePermissionForUser = async (
  userId: string,
  tableName: keyof DatabaseAppSchema
): Promise<CrudPermission> => {
  const p = {
    create: false,
    read: false,
    write: false,
    delete: false,
  };
  if (tableName === "users") {
    return p;
  } else {
    return p;
  }
};
