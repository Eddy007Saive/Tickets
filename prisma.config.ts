import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 configuration. Connection URLs no longer live in schema.prisma.
// The CLI (migrate / db push) uses the URL below; pick the DIRECT connection
// (Supabase port 5432) so migrations don't go through the PgBouncer pooler.
// The application runtime connects separately via the pg driver adapter in
// lib/prisma.ts using DATABASE_URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
