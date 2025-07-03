import { collectionPermissions } from "../../../lib/db/permissions/db-collections";
import type { CrudPermission } from "../../../lib/types/permissions";
import type { QueryParams } from "./url-parser";

interface PermissionDefinition {
  neededParameters?: {
    name: string;
    operator: string;
    valueType: string;
    isPrimaryId?: boolean; // if this is the primary id of the table then it comes from the request as "id" and needs to be renamed
  }[]; // URL Parameters that are needed for the query
  checkPermissionsFor?: {
    name: string;
    checker: (
      userId: string,
      value: string | string[]
    ) => Promise<CrudPermission>;
    permission: "create" | "read" | "write" | "delete";
  }[];
  columns?: any;
  // custom SQL actions
  selector?: (userId: string, params: QueryParams) => Promise<any[]>; // custom selector function
  inserter?: (userId: string, body: any) => Promise<any>; // custom inserter function
  // custom actions to do some modifications with the data before the actual action
  preAction?: (userId: string, body: any) => Promise<any>; // custom pre-action function
  // postAction?: (userId: string, body: any) => Promise<any>; // custom post-action function
}

interface PermissionDefinitionPerMethod {
  [key: string]: PermissionDefinition | undefined;
  GET?: PermissionDefinition;
  POST?: PermissionDefinition;
  PUT?: PermissionDefinition;
  DELETE?: PermissionDefinition;
}

export interface PermissionDefinitionPerTable {
  [tablename: string]: PermissionDefinitionPerMethod;
}

export const getValueForEquals = (params: QueryParams, name: string) => {
  const value = params[name];
  if (!value || (value.operator !== "eq" && value.operator !== "or")) {
    throw new Error(`"${name}[eq]=<value>" is required`);
  }
  return value.value;
};

export const permissionCheckerViaUrlParams = async (
  definition: PermissionDefinition,
  userId: string,
  params: QueryParams
) => {
  if (definition.neededParameters) {
    for (const { name, operator, valueType } of definition.neededParameters) {
      if (!params[name] || params[name].operator !== operator) {
        throw new Error(`"${name}[${operator}]=<${valueType}>" is required`);
      }
    }
  }
  if (definition.checkPermissionsFor) {
    for (const {
      name,
      permission,
      checker,
    } of definition.checkPermissionsFor) {
      const value = getValueForEquals(params, name);
      const p = await checker(userId, value);
      if (!p[permission]) {
        throw new Error("No Permission");
      }
    }
  }
};

export const permissionCheckerViaBody = async (
  definition: PermissionDefinition,
  userId: string,
  body: any
) => {
  if (definition.checkPermissionsFor) {
    for (const {
      name,
      permission,
      checker,
    } of definition.checkPermissionsFor) {
      const value = body[name] ?? undefined;
      const p = await checker(userId, value);
      if (!p[permission]) {
        throw new Error("No Permission");
      }
    }
  }
};

export const getPermissionDefinionForMethod = (
  tableName: string,
  method: string
): PermissionDefinition => {
  const definition = collectionPermissions[tableName]?.[method];
  if (!definition) {
    throw new Error(
      `No permission definition found for table "${tableName}" and method "${method}"`
    );
  }
  return definition;
};
