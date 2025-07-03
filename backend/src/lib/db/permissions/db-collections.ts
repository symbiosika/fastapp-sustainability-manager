import type { PermissionDefinitionPerTable } from "../../types/permission-checker";
import {
  getPermissionForProject,
  getPermissionForSite,
  getPermissionForSystemEquvalents,
  getPermissionsForReport,
  getPermissionForUserId,
  getAllUsersProjects,
} from "./../permissions";

export const collectionPermissions: PermissionDefinitionPerTable = {
  // Table "actions"
  actions: {
    POST: {
      checkPermissionsFor: [
        {
          name: "site",
          permission: "create",
          checker: getPermissionForSite,
        },
      ],
    },
    GET: {
      neededParameters: [{ name: "site", operator: "eq", valueType: "uuid" }],
      checkPermissionsFor: [
        {
          name: "site",
          permission: "read",
          checker: getPermissionForSite,
        },
      ],
    },
    PUT: {
      checkPermissionsFor: [
        {
          name: "site",
          permission: "write",
          checker: getPermissionForSite,
        },
      ],
    },
    DELETE: {
      checkPermissionsFor: [
        {
          name: "site",
          permission: "delete",
          checker: getPermissionForSite,
        },
      ],
    },
  },

  // Table "csrdtopics"
  csrdTopics: {
    POST: {
      checkPermissionsFor: [
        {
          name: "report",
          permission: "create",
          checker: getPermissionsForReport,
        },
      ],
    },
    GET: {
      neededParameters: [{ name: "report", operator: "eq", valueType: "uuid" }],
      checkPermissionsFor: [
        {
          name: "report",
          permission: "read",
          checker: getPermissionsForReport,
        },
      ],
    },
    PUT: {
      checkPermissionsFor: [
        {
          name: "report",
          permission: "write",
          checker: getPermissionsForReport,
        },
      ],
    },
    DELETE: {
      checkPermissionsFor: [
        {
          name: "report",
          permission: "delete",
          checker: getPermissionsForReport,
        },
      ],
    },
  },

  // Table "equivalents"
  equivalents: {
    POST: {
      checkPermissionsFor: [
        {
          name: "project",
          permission: "create",
          checker: getPermissionForProject,
        },
      ],
    },
    GET: {
      neededParameters: [
        { name: "project", operator: "or", valueType: "uuid" },
      ],
      checkPermissionsFor: [
        {
          name: "project",
          permission: "read",
          checker: getPermissionForProject,
        },
      ],
    },
    PUT: {
      checkPermissionsFor: [
        {
          name: "project",
          permission: "write",
          checker: getPermissionForProject,
        },
      ],
    },
    DELETE: {
      checkPermissionsFor: [
        {
          name: "project",
          permission: "delete",
          checker: getPermissionForProject,
        },
      ],
    },
  },

  // Table facilities
  facilities: {
    POST: {
      checkPermissionsFor: [
        {
          name: "site",
          permission: "create",
          checker: getPermissionForSite,
        },
      ],
    },
    GET: {
      neededParameters: [{ name: "site", operator: "eq", valueType: "uuid" }],
      checkPermissionsFor: [
        {
          name: "site",
          permission: "read",
          checker: getPermissionForSite,
        },
      ],
    },
    PUT: {
      checkPermissionsFor: [
        {
          name: "site",
          permission: "write",
          checker: getPermissionForSite,
        },
      ],
    },
    DELETE: {
      checkPermissionsFor: [
        {
          name: "site",
          permission: "delete",
          checker: getPermissionForSite,
        },
      ],
    },
  },

  // Table "inputs"
  inputs: {
    POST: {
      checkPermissionsFor: [
        {
          name: "report",
          permission: "create",
          checker: getPermissionsForReport,
        },
      ],
    },
    GET: {
      neededParameters: [{ name: "report", operator: "eq", valueType: "uuid" }],
      checkPermissionsFor: [
        {
          name: "report",
          permission: "read",
          checker: getPermissionsForReport,
        },
      ],
    },
    PUT: {
      checkPermissionsFor: [
        {
          name: "report",
          permission: "write",
          checker: getPermissionsForReport,
        },
      ],
    },
    DELETE: {
      checkPermissionsFor: [
        {
          name: "report",
          permission: "delete",
          checker: getPermissionsForReport,
        },
      ],
    },
  },

  // Table "media"
  media: {
    POST: {
      checkPermissionsFor: [
        {
          name: "project",
          permission: "create",
          checker: getPermissionForProject,
        },
      ],
    },
    GET: {
      neededParameters: [
        { name: "project", operator: "eq", valueType: "uuid" },
      ],
      checkPermissionsFor: [
        {
          name: "project",
          permission: "read",
          checker: getPermissionForProject,
        },
      ],
    },
    PUT: {
      checkPermissionsFor: [
        {
          name: "project",
          permission: "write",
          checker: getPermissionForProject,
        },
      ],
    },
    DELETE: {
      checkPermissionsFor: [
        {
          name: "project",
          permission: "delete",
          checker: getPermissionForProject,
        },
      ],
    },
  },

  // Table "projects"
  projects: {
    // HACK: hier könnte man den anderen code rüberkopieren aus index.ts
    // POST: {
    //   checkPermissionsFor: [
    //     {
    //       name: 'project',
    //       permission: 'create',
    //       checker: getPermissionForProject,
    //     },
    //   ],
    // },
    GET: {
      async selector(userId: string) {
        return await getAllUsersProjects(userId);
      },
    },
    PUT: {
      checkPermissionsFor: [
        {
          name: "id",
          permission: "write",
          checker: getPermissionForProject,
        },
      ],
    },
    DELETE: {
      checkPermissionsFor: [
        {
          name: "id",
          permission: "delete",
          checker: getPermissionForProject,
        },
      ],
    },
  },

  // Table "user-projects"
  userProjects: {
    POST: {
      checkPermissionsFor: [
        {
          name: "projectId",
          permission: "create",
          checker: getPermissionForProject,
        },
      ],
    },
    GET: {
      neededParameters: [{ name: "userId", operator: "eq", valueType: "uuid" }],
      checkPermissionsFor: [
        {
          name: "userId",
          permission: "read",
          checker: getPermissionForUserId,
        },
      ],
    },
    DELETE: {
      neededParameters: [
        {
          name: "userId",
          operator: "eq",
          valueType: "uuid",
          isPrimaryId: true,
        },
        { name: "projectId", operator: "eq", valueType: "uuid" },
      ],
      checkPermissionsFor: [
        {
          name: "projectId",
          permission: "delete",
          checker: getPermissionForProject,
        },
      ],
    },
  },

  // Table "reports"
  reports: {
    POST: {
      checkPermissionsFor: [
        {
          name: "site",
          permission: "create",
          checker: getPermissionForSite,
        },
      ],
    },
    GET: {
      neededParameters: [{ name: "site", operator: "eq", valueType: "uuid" }],
      checkPermissionsFor: [
        {
          name: "site",
          permission: "read",
          checker: getPermissionForSite,
        },
      ],
    },
    PUT: {
      checkPermissionsFor: [
        {
          name: "site",
          permission: "write",
          checker: getPermissionForSite,
        },
      ],
    },
    DELETE: {
      checkPermissionsFor: [
        {
          name: "site",
          permission: "delete",
          checker: getPermissionForSite,
        },
      ],
    },
  },

  // Table "sites"
  sites: {
    POST: {
      checkPermissionsFor: [
        {
          name: "project",
          permission: "create",
          checker: getPermissionForProject,
        },
      ],
    },
    GET: {
      neededParameters: [
        { name: "project", operator: "eq", valueType: "uuid" },
      ],
      checkPermissionsFor: [
        {
          name: "project",
          permission: "read",
          checker: getPermissionForProject,
        },
      ],
    },
    PUT: {
      checkPermissionsFor: [
        {
          name: "project",
          permission: "write",
          checker: getPermissionForProject,
        },
      ],
    },
    DELETE: {
      checkPermissionsFor: [
        {
          name: "project",
          permission: "delete",
          checker: getPermissionForProject,
        },
      ],
    },
  },

  // Table "targets". depends on report
  targets: {
    POST: {
      checkPermissionsFor: [
        {
          name: "report",
          permission: "create",
          checker: getPermissionsForReport,
        },
      ],
    },
    GET: {
      neededParameters: [{ name: "report", operator: "eq", valueType: "uuid" }],
      checkPermissionsFor: [
        {
          name: "report",
          permission: "read",
          checker: getPermissionsForReport,
        },
      ],
    },
    PUT: {
      checkPermissionsFor: [
        {
          name: "report",
          permission: "write",
          checker: getPermissionsForReport,
        },
      ],
    },
    DELETE: {
      checkPermissionsFor: [
        {
          name: "report",
          permission: "delete",
          checker: getPermissionsForReport,
        },
      ],
    },
  },

  // Table "user_projects"
  // no CRUD operations on this table. It is a join table for the many-to-many relation between users and projects

  // Table "users"
  // only get on own user
  users: {
    GET: {
      neededParameters: [{ name: "id", operator: "eq", valueType: "uuid" }],
      checkPermissionsFor: [
        {
          name: "id",
          permission: "read",
          checker: getPermissionForUserId,
        },
      ],
    },
  },
};
