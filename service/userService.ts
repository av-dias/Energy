import { users } from "@/db/schemas/users";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import { eq } from "drizzle-orm";

const getAllUsers = (
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase;
  }
) => {
  // Drizzle ORM's queries are async, wrap in Promise for expo-sqlite
  try {
    return db.select().from(users).all();
  } catch (error) {
    console.log(error);
  }
};

const getUserByEmail = (
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase;
  },
  email: string
) => {
  try {
    return db.select().from(users).where(eq(users.email, email)).get();
  } catch (error) {
    console.log(error);
  }
};

const insertOneUser = (
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase;
  },
  email: string
) => {
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
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase;
  },
  email: string,
  baseUrl: string
) => {
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
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase;
  },
  email: string,
  UUID: string
) => {
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

export {
  getAllUsers,
  getUserByEmail,
  insertOneUser,
  updateBaseUrlForUserByEmail,
  updateUUIDForUserByEmail,
};
