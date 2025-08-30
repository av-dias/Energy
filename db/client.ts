import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

export const DB_NAME = "db.db"; // Change this to your desired database name

export const getDatabase = () => {
  const expoDb = openDatabaseSync(DB_NAME);
  const db = drizzle(expoDb);
  return db;
};
