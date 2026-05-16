import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  if (!process.env.DATABASE_URL_PUBLIC) {
    throw new Error(
      "DATABASE_URL or DATABASE_URL_PUBLIC must be set. Ensure the database is provisioned.",
    );
  }
}

const databaseUrl = process.env.DATABASE_URL_PUBLIC ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl!,
  },
});
