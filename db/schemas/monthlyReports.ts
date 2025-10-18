import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./users"; // Assuming your user table is in a file named schema.ts

export const monthlyReports = sqliteTable("monthly_reports", {
  // `id` is a unique text column to store the UUID
  id: text("id").primaryKey().$type<string>(),

  averageCost: real("average_cost").notNull().default(0),

  month: text("month").notNull(), // `month` column to store the year and month (e.g., "2024-08")
  numberOfDays: integer("number_of_days").notNull(),

  predictedTotalCost: real("predicted_total_cost").notNull().default(0),

  totalCost: real("total_cost").notNull().default(0),

  totalKwh: real("total_kwh").notNull().default(0),

  userId: text("user_id") // `userId` foreign key to link to the users table
    .notNull()
    .references(() => users.uuid),

  fees: real("fees").notNull().default(0),

  totalDayCost: real("total_day_cost").notNull().default(0),

  totalNightCost: real("total_night_cost").notNull().default(0),

  totalNightKwh: real("total_night_kwh").notNull().default(0),

  totalDayKwh: real("total_day_kwh").notNull().default(0),

  totalPeakKwh: real("total_peak_kwh").notNull().default(0),

  totalPeakCost: real("total_peak_cost").notNull().default(0),

  updatedAt: text("updated_at").notNull(),

  createdAt: text("created_at").notNull(),
});

// Define a one-to-many relationship between users and monthlyReports
export const monthlyReportsRelations = relations(monthlyReports, ({ one }) => ({
  user: one(users, {
    fields: [monthlyReports.userId],
    references: [users.uuid],
  }),
}));
