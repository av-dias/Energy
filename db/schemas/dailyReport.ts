import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const dailyReport = sqliteTable("daily_reports", {
  // `id` is a unique text column to store the UUID
  id: text("id").primaryKey().$type<string>(),

  date: text("date").notNull(),

  dayCost: real("day_cost").notNull(),

  peakCost: real("peak_cost").notNull(),

  nightCost: real("night_cost").notNull(),

  dayKwh: real("day_kwh").notNull(),

  peakKwh: real("peak_kwh").notNull(),

  nightKwh: real("night_kwh").notNull(),

  totalCost: real("total_cost").notNull(),

  totalKwh: real("total_kwh").notNull(),

  isSpike: integer("is_peak").$type<boolean>().notNull(),

  userId: text("user_id") // `userId` foreign key to link to the users table
    .notNull()
    .references(() => users.uuid),

  updatedAt: text("updated_at").notNull(),

  createdAt: text("created_at").notNull(),
});
