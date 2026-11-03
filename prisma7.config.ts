import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Falls back to empty string if not loaded yet, preventing runtime boot crashes
    url: process.env.DIRECT_URL ?? "", 
  },
});
