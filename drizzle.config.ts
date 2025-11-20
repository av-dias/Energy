import type { Config } from "drizzle-kit";
export default {
  schema: [
    "./db/schemas/users.ts",
    "./db/schemas/monthlyReports.ts",
    "./db/schemas/dailyReport.ts",
  ],
  out: "./drizzle",
  dialect: "sqlite",
  driver: "expo", // <--- very important
} satisfies Config;
