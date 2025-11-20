import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLJsDatabase } from "drizzle-orm/sql-js";
import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { getDatabase } from "@/db/client";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../drizzle/migrations"; // Adjust the path to your migrations file

type ContextType = { db: SQLJsDatabase | ExpoSQLiteDatabase | null };

export const DatabaseContext = React.createContext<ContextType>({ db: null });

export const useDatabase = () => useContext(DatabaseContext);

export function DatabaseProvider({ children }: PropsWithChildren) {
  const [db, setDb] = useState<SQLJsDatabase | ExpoSQLiteDatabase | null>(null);

  useEffect(() => {
    if (db) return;
    Promise.resolve(getDatabase()).then((newDb) => {
      setDb(newDb);
      const { success, error } = useMigrations(newDb, migrations);
      console.log(success);
      console.log(error);
    });
  }, []);

  return (
    <DatabaseContext.Provider value={{ db }}>
      {children}
    </DatabaseContext.Provider>
  );
}
