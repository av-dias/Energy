import { monthlyReports } from "@/db/schemas/monthlyReports";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import { eq, and, like } from "drizzle-orm";
import { getUserByEmail } from "./userService";
import { eventEmitter, NotificationEvent } from "@/utility/eventEmitter";
import { createNotification } from "@/components/notificationBox/NotificationBox";
import { SQLJsDatabase } from "drizzle-orm/sql-js";

const getAllMonthlyReports = (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null
) => {
  if (!db) return null;

  return db.select().from(monthlyReports).all();
};

const getMonthlyReportByMonth = async (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  userId: string,
  month: number,
  year: number
) => {
  if (!db) return null;

  const leftZero = month < 10 ? `0` : "";
  const targetDate = `${year}-${leftZero}${month}`;
  const result = await db
    .select()
    .from(monthlyReports)
    .where(
      and(
        eq(monthlyReports.userId, userId),
        eq(monthlyReports.month, targetDate)
      )
    );

  return result[0];
};

const getReportsFromYear = (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  userId: string,
  year: number
) => {
  if (!db) return [];

  const result = db
    .select()
    .from(monthlyReports)
    .where(
      and(
        eq(monthlyReports.userId, userId),
        like(monthlyReports.month, `${year}-%`)
      )
    )
    .all();

  return result;
};

const updateMonthlyReport = async (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  month: number,
  year: number,
  data: any,
  email: string
) => {
  if (!db) return null;

  if (!email) {
    console.log("No user provided, cannot update monthly report.");
    eventEmitter.emit(
      NotificationEvent,
      createNotification(
        "No user provided, cannot update monthly report.",
        "pink"
      )
    );
    return;
  }

  const user = await getUserByEmail(db, email);
  if (!user || !user.uuid) {
    eventEmitter.emit(
      NotificationEvent,
      createNotification("No user found, cannot update monthly report.", "pink")
    );
    console.log("No user found, cannot update monthly report");
    return;
  }

  const reportExists = await getMonthlyReportByMonth(
    db,
    user?.uuid,
    month,
    year
  );

  const reportData = {
    id: data.id,
    averageCost: parseFloat(data.averageCost),
    month: data.month,
    numberOfDays: parseInt(data.numberOfDays, 10),
    totalCost: parseFloat(data.totalCost),
    predictedTotalCost: parseFloat(data.predictedTotalCost),
    totalKwh: parseFloat(data.totalKwh),
    userId: user?.uuid,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    fees: parseFloat(data.ascFee || 0) + parseFloat(data.psoFee || 0),
    totalDayCost: parseFloat(data.totalDayCost),
    totalDayKwh: parseFloat(data.totalDayKwh),
    totalNightCost: parseFloat(data.totalNightCost),
    totalNightKwh: parseFloat(data.totalNightKwh),
    totalPeakKwh: parseFloat(data.totalPeakKwh),
    totalPeakCost: parseFloat(data.totalPeakCost),
  };

  if (!reportExists) {
    console.log(`Monthly: Inserting new report ${data.month}.`);
    await db.insert(monthlyReports).values(reportData).run();
  } else {
    console.log(`Monthly: Updating already existing report ${data.month}.`);
    db.update(monthlyReports)
      .set(reportData)
      .where(eq(monthlyReports.id, reportExists.id))
      .run();
  }
};

const deleteAllMonthlyReports = (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null
) => {
  if (!db) return null;

  return db.delete(monthlyReports).run();
};

const updateMonthlyReportFees = (
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase;
  },
  reportId: string,
  fees: number
) => {
  if (!db) return null;

  return db
    .update(monthlyReports)
    .set({ fees: fees })
    .where(eq(monthlyReports.id, reportId))
    .run();
};

export {
  getMonthlyReportByMonth,
  updateMonthlyReport,
  getAllMonthlyReports,
  deleteAllMonthlyReports,
  updateMonthlyReportFees,
  getReportsFromYear,
};
