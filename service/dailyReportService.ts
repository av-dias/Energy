import { dailyReport } from "@/db/schemas/dailyReport";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import { eq, and, like } from "drizzle-orm";
import { getUserByEmail } from "./userService";
import { eventEmitter, NotificationEvent } from "@/utility/eventEmitter";
import { createNotification } from "@/components/notificationBox/NotificationBox";
import { DailyReport } from "@/models/response/DailyReportType";
import { SQLJsDatabase } from "drizzle-orm/sql-js";

const getDailyReportByDate = async (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  userId: string,
  year: number,
  month: number,
  day: number
) => {
  const leftZeroMonth = month < 10 ? `0` : "";
  const formatMonth = `${leftZeroMonth}${month}`;
  const leftZeroDay = day < 10 ? `0` : "";
  const formatDay = `${leftZeroDay}${day}`;

  if (!db) return null;

  const result = await db
    .select()
    .from(dailyReport)
    .where(
      and(
        eq(dailyReport.userId, userId),
        like(dailyReport.date, `${year}-${formatMonth}-${formatDay}`)
      )
    );
  return result[0];
};

const getDailyReportByMonth = async (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  userId: string,
  year: number,
  month: number
) => {
  if (!db) return [];

  const leftZeroMonth = month < 10 ? `0` : "";
  const formatMonth = `${leftZeroMonth}${month}`;

  const result = await db
    .select()
    .from(dailyReport)
    .where(
      and(
        eq(dailyReport.userId, userId),
        like(dailyReport.date, `${year}-${formatMonth}-%`)
      )
    );

  return result;
};

const updateDailyReport = async (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  year: number,
  month: number,
  day: number,
  data: DailyReport,
  email: string
) => {
  if (!db) return null;

  if (!email) {
    console.log("No user provided, cannot update daily report.");
    eventEmitter.emit(
      NotificationEvent,
      createNotification(
        "No user provided, cannot update daily report.",
        "pink"
      )
    );
    return;
  }

  const user = await getUserByEmail(db, email);
  if (!user || !user.uuid) {
    eventEmitter.emit(
      NotificationEvent,
      createNotification("No user found, cannot update daily report.", "pink")
    );
    console.log("No user found, cannot update daily report");
    return;
  }

  const reportExists = await getDailyReportByDate(
    db,
    user?.uuid,
    year,
    month,
    day
  );

  const dailyReportData = {
    id: String(data.id),
    date: String(data.date),
    dayCost: Number(data.dayCost),
    peakCost: Number(data.peakCost),
    nightCost: Number(data.nightCost),
    dayKwh: Number(data.dayKwh),
    peakKwh: Number(data.peakKwh),
    nightKwh: Number(data.nightKwh),
    totalCost: Number(data.totalCost),
    totalKwh: Number(data.totalKwh),
    isSpike: Boolean(data.isSpike),
    userId: String(user.uuid),
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  if (!reportExists) {
    console.log(`Daily: Inserting new daily report ${data.date}.`);
    await db.insert(dailyReport).values(dailyReportData).run();
  } else {
    console.log(`Daily: Updating already existing daily report ${data.date}.`);
    await db
      .update(dailyReport)
      .set(dailyReportData)
      .where(eq(dailyReport.id, reportExists.id))
      .run();
  }
};

const deleteDailyReportMonth = async (
  db: SQLJsDatabase | ExpoSQLiteDatabase | null,
  year: number,
  month: number,
  userId: string
) => {
  if (!db) return null;

  const leftZeroMonth = month < 10 ? `0` : "";
  const formatMonth = `${leftZeroMonth}${month}`;

  const result = db
    .delete(dailyReport)
    .where(
      and(
        eq(dailyReport.userId, userId),
        like(dailyReport.date, `${year}-${formatMonth}-%`)
      )
    )
    .run();

  console.log(`Deleted daily report where ${year}-${formatMonth}-%`);

  return result;
};

export {
  getDailyReportByDate,
  getDailyReportByMonth,
  updateDailyReport,
  deleteDailyReportMonth,
};
