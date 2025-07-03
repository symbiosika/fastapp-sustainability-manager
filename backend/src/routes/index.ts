import type { FastAppHono } from "../fastapp-framework/src/types";
import * as v from "valibot";
import {
  HTTPException,
  middlewareService,
  log,
} from "../fastapp-framework/src";
import { validator } from "hono-openapi/valibot";
import {
  GET as collectionsGET,
  POST as collectionsPOST,
} from "./../routes/collections/[name]";
import {
  GET as collectionsWithIdGET,
  PUT as collectionsWithIdPUT,
  DELETE as collectionsWithIdDELETE,
} from "./../routes/collections/[name]/[id]";
import {
  inputs,
  projects,
  reports,
  sites,
  userProjects,
} from "../lib/db/db-schema";
import { getDb, users } from "../fastapp-framework/src/dbSchema";
import { getPermissionForProject } from "../lib/db/permissions";
import { and, eq, inArray } from "drizzle-orm";
import { authAndSetUsersInfo } from "../fastapp-framework/src/lib/utils/hono-middlewares";

export function defineDataRoutes(app: FastAppHono) {
  /**
   * Ping custom app endpoint
   */
  app.get("/ping", async (c) => {
    return c.json({ pong: true });
  });

  /**
   * Collections endpoint
   */
  app.all(
    "/collections/:name/:id?",
    middlewareService.authAndSetUsersInfo,
    async (c) => {
      // check if id is set
      const id = c.req.param("id");
      if (!id) {
        if (c.req.method === "GET") {
          return collectionsGET(c);
        } else if (c.req.method === "POST") {
          return collectionsPOST(c);
        } else {
          throw new HTTPException(405, { message: "Method not allowed" });
        }
      } else {
        if (c.req.method === "GET") {
          return collectionsWithIdGET(c);
        } else if (c.req.method === "PUT") {
          return collectionsWithIdPUT(c);
        } else if (c.req.method === "DELETE") {
          return collectionsWithIdDELETE(c);
        } else {
          throw new HTTPException(405, { message: "Method not allowed" });
        }
      }
    }
  );

  /**
   * Search for users by email address
   */
  app.get("/user/search", middlewareService.authAndSetUsersInfo, async (c) => {
    const email = c.req.query("email");
    if (!email) {
      throw new HTTPException(400, { message: "email is required" });
    }
    const u = await getDb().select().from(users).where(eq(users.email, email));
    if (!u || u.length === 0) {
      throw new HTTPException(404, { message: "User not found" });
    }
    return c.json({
      id: u[0].id,
      email: u[0].email,
      firstname: u[0].firstname,
      surname: u[0].surname,
    });
  });

  /**
   * Get all users assigned to a project
   */
  app.get(
    "/project/:id/users",
    middlewareService.authAndSetUsersInfo,
    async (c) => {
      const projectId = c.req.param("id");
      if (!projectId) {
        throw new HTTPException(400, { message: "project id is required" });
      }
      if (!(await getPermissionForProject(c.get("usersId"), projectId)).read) {
        throw new HTTPException(403, {
          message: "Not allowed to read users for this project",
        });
      }

      const userIds = await getDb()
        .select({ userId: userProjects.userId })
        .from(userProjects)
        .where(eq(userProjects.projectId, projectId));

      const assignedUsers = await getDb()
        .select({
          id: users.id,
          email: users.email,
          firstname: users.firstname,
          surname: users.surname,
        })
        .from(users)
        .where(
          inArray(
            users.id,
            userIds.map((u) => u.userId)
          )
        );

      return c.json(assignedUsers);
    }
  );

  /**
   * Create a new project
   */
  app.get(
    "/inputs-for-project",
    middlewareService.authAndSetUsersInfo,
    async (c) => {
      try {
        const project = c.req.query("project");
        const yearsList = c.req.query("years");
        const extend =
          c.req.query("extend") && c.req.query("extend") === "true"
            ? true
            : false;

        const years: number[] =
          yearsList && yearsList.length > 0
            ? yearsList.split(",").map((y: string) => parseInt(y))
            : [];

        if (!project) {
          throw new HTTPException(400, { message: "project is required" });
        }

        // create an dict from all keys in "inputs" with value=true
        const cols: { [col: string]: boolean } = {};
        for (const col of Object.keys(inputs)) {
          cols[col] = true;
        }

        // extended result
        if (extend) {
          // @ts-ignore
          const userInputs = await getDb().query.inputs.findMany({
            with: {
              report: {
                where:
                  years.length > 0 ? inArray(reports.year, years) : undefined,
                with: {
                  site: {
                    project: {
                      where: eq(projects.id, project),
                    },
                  },
                },
              },
              facility: true,
            },
          });

          return c.json(userInputs);
        }
        // simple result
        else {
          const userInputs = await getDb()
            .select()
            .from(inputs)
            .where(
              eq(
                inputs.report,
                getDb()
                  .select({
                    reportId: reports.id,
                  })
                  .from(reports)
                  .innerJoin(sites, eq(reports.site, sites.id))
                  .where(
                    years.length > 0
                      ? eq(sites.project, project)
                      : and(
                          eq(sites.project, project),
                          inArray(reports.year, years)
                        )
                  )
                  .limit(1)
              )
            );

          return c.json(userInputs);
        }
      } catch (err) {
        throw new HTTPException(400, { message: err + "" });
      }
    }
  );

  app.post(
    "/hooks/create-project",
    middlewareService.authAndSetUsersInfo,
    async (c) => {
      const usersId = c.get("usersId");

      try {
        // add project
        const project = await c.req.json();
        const created = await getDb()
          .insert(projects)
          .values({ ...project, id: undefined })
          .returning();
        // add the user to the project
        await getDb()
          .insert(userProjects)
          .values({
            userId: c.get("usersId"),
            projectId: created[0].id,
          });

        return c.json(created[0]);
      } catch (err) {
        throw new HTTPException(400, { message: err + "" });
      }
    }
  );

  /**
   * Update the own user
   */
  app.put("/user/me", middlewareService.authAndSetUsersInfo, async (c) => {
    try {
      const { firstname, surname, meta } = await c.req.json();
      const updatedUser = await getDb()
        .update(users)
        .set({
          firstname,
          surname,
          meta,
        })
        .where(eq(users.id, c.get("usersId")))
        .returning({
          id: users.id,
          email: users.email,
          firstname: users.firstname,
          surname: users.surname,
          meta: users.meta,
        });
      return c.json(updatedUser[0]);
    } catch (err) {
      throw new HTTPException(500, {
        message: "Error updating user: " + err,
      });
    }
  });
}
