import { defineConfig } from "drizzle-kit";

const PREFIX = "base_";

const POSTGRES_DB = process.env.POSTGRES_DB ?? "";
const POSTGRES_USER = process.env.POSTGRES_USER ?? "";
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? "";
const POSTGRES_HOST = process.env.POSTGRES_HOST ?? "";
const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT ?? "5432");
const POSTGRES_CA = process.env.POSTGRES_CA ?? "";
let POSTGRES_USE_SSL = !process.env.POSTGRES_USE_SSL
  ? true
  : process.env.POSTGRES_USE_SSL !== "false";

if (POSTGRES_CA && POSTGRES_CA.length > 0 && POSTGRES_CA !== "none") {
  POSTGRES_USE_SSL = true;
}

console.log(
  `RUN MIGRATIONS FOR "${PREFIX}" ON SERVER:${POSTGRES_HOST}, DB:${POSTGRES_DB}, USER:${POSTGRES_USER}, PORT:${POSTGRES_PORT}, PASSWORD:*** (SSL:${POSTGRES_USE_SSL})`
);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/fastapp-framework/src/lib/db/db-schema.ts",
  out: "./src/fastapp-framework/drizzle-sql",
  tablesFilter: PREFIX + "*",
  migrations: {
    table: `${PREFIX}migrations`,
  },
  dbCredentials: {
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    database: POSTGRES_DB,
    ...(POSTGRES_USE_SSL && {
      ssl: {
        rejectUnauthorized: false,
        ca: POSTGRES_CA,
      },
    }),
    ...(POSTGRES_USE_SSL === false && {
      ssl: false,
    }),
  },
});
