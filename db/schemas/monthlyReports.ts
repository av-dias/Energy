import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./users"; // Assuming your user table is in a file named schema.ts

export const monthlyReports = sqliteTable("monthly_reports", {
  // `id` is a unique text column to store the UUID
  id: text("id").primaryKey().$type<string>(),

  // `averageCost` column
  averageCost: real("average_cost").notNull(),

  // `month` column to store the year and month (e.g., "2024-08")
  month: text("month").notNull(),

  // `numberOfDays` column
  numberOfDays: integer("number_of_days").notNull(),

  // `predictedTotalCost` column
  predictedTotalCost: real("predicted_total_cost").notNull(),

  // `totalKwh` column
  totalKwh: real("total_kwh").notNull(),

  // `userId` foreign key to link to the users table
  userId: text("user_id")
    .notNull()
    .references(() => users.uuid),

  // `updatedAt` column to store the date of the last update
  updatedAt: text("updated_at").notNull(),

  // `createdAt` column to store the date the report was created
  createdAt: text("created_at").notNull(),
});

// Define a one-to-many relationship between users and monthlyReports
export const monthlyReportsRelations = relations(monthlyReports, ({ one }) => ({
  user: one(users, {
    fields: [monthlyReports.userId],
    references: [users.uuid],
  }),
}));
