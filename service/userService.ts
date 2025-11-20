import { users } from "@/db/schemas/users";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import { eq } from "drizzle-orm";
import { SQLJsDatabase } from "drizzle-orm/sql-js";

const getAllUsers = (db: SQLJsDatabase | ExpoSQLiteDatabase | null) => {
  // Drizzle ORM's queries are async, wrap in Promise for expo-sqlite
  try {
    if (!db) return [];
    return db.select().from(users).all();
  } catch (error) {
    console.log(error);
  }
};

const getUserByEmail = async (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  email: string
) => {
  try {
    if (!db) {
      console.log("Database is null!");
      return null;
    }
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();
    return user[0];
  } catch (error) {
    console.log(error);
  }
};

const insertOneUser = (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  email: string
) => {
  if (!db) {
    console.log("Database is null!");
    return undefined;
  }

  // Drizzle ORM's queries are async, wrap in Promise for expo-sqlite
  try {
    // Provide all required fields for the users table
    return db
      .insert(users)
      .values({
        name: email.split("@")[0],
        email: email,
        password: "default",
        baseUrl: "",
        creationDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        // Add other required fields as needed
      })
      .run();
  } catch (error) {
    console.log(error);
  }
};

const updateBaseUrlForUserByEmail = (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  email: string,
  baseUrl: string
) => {
  if (!db) {
    console.log("Database is null!");
    return undefined;
  }

  try {
    return db
      .update(users)
      .set({ baseUrl: baseUrl })
      .where(eq(users.email, email))
      .run();
  } catch (error) {
    console.log(error);
  }
};

const updateUUIDForUserByEmail = (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  email: string,
  UUID: string
) => {
  if (!db) {
    console.log("Database is null!");
    return undefined;
  }

  try {
    return db
      .update(users)
      .set({ uuid: UUID })
      .where(eq(users.email, email))
      .run();
  } catch (error) {
    console.log(error);
  }
};

const updateFeesForUserByEmail = (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  email: string,
  asc: number,
  pso: number
) => {
  if (!db) {
    console.log("Database is null!");
    return undefined;
  }

  try {
    return db
      .update(users)
      .set({ annualASC: asc, annualPSO: pso })
      .where(eq(users.email, email))
      .run();
  } catch (error) {
    console.log(error);
  }
};

export {
  getAllUsers,
  getUserByEmail,
  insertOneUser,
  updateBaseUrlForUserByEmail,
  updateUUIDForUserByEmail,
  updateFeesForUserByEmail,
};
