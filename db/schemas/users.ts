import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Define the user table schema using drizzle-orm
export const users = sqliteTable("users", {
  // `id` is a primary key that auto-increments
  id: integer("id").primaryKey({ autoIncrement: true }),

  // `uuid` is a unique text column to store the UUID
  uuid: text("uuid").unique(),

  // `name` column to store the user's name
  name: text("name").notNull(),

  // `email` column to store the user's email, which must be unique
  email: text("email").unique().notNull(),

  // `password` column to store a hashed password
  password: text("password").notNull(),

  // `baseUrl` column for a user-specific base URL
  baseUrl: text("baseUrl").notNull(),

  // `annualPSO` column to store the annual PSO value
  annualPSO: real("annualPSO").notNull().default(0),

  // `annualASC` column to store the annual ASC value
  annualASC: real("annualASC").notNull().default(0),

  // `updatedDate` column to store the date of the last update
  updatedDate: text("updatedDate").notNull(),

  // `creationDate` column to store the date the user was created
  creationDate: text("creationDate").notNull(),
});
