import { monthlyReports } from "@/db/schemas/monthlyReports";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import { eq, and } from "drizzle-orm";
import { getUserByEmail } from "./userService";

const getAllMonthlyReports = (
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase;
  }
) => {
  return db.select().from(monthlyReports).all();
};

const getMonthlyReportByMonth = (
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase;
  },
  userId: string,
  month: number,
  year: number
) => {
  const leftZero = month < 10 ? `0` : "";
  const targetDate = `${year}-${leftZero}${month}`;
  const result = db
    .select()
    .from(monthlyReports)
    .where(
      and(
        eq(monthlyReports.userId, userId),
        eq(monthlyReports.month, targetDate)
      )
    )
    .get();

  return result;
};

const updateMonthlyReport = async (
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase;
  },
  month: number,
  year: number,
  data: any,
  email: string
) => {
  if (!email) {
    console.log("No user provided, cannot update monthly report");
    return;
  }

  const user = getUserByEmail(db, email);
  if (!user || !user.uuid) {
    console.log("No user found, cannot update monthly report");
    return;
  }

  const reportExists = getMonthlyReportByMonth(db, user?.uuid, month, year);

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
    fees: parseFloat(data.fees),
    totalDayCost: parseFloat(data.totalDayCost),
    totalDayKwh: parseFloat(data.totalDayKwh),
    totalNightCost: parseFloat(data.totalNightCost),
    totalNightKwh: parseFloat(data.totalNightKwh),
    totalPeakKwh: parseFloat(data.totalPeakKwh),
    totalPeakCost: parseFloat(data.totalPeakCost),
  };

  console.log(reportData);

  if (!reportExists) {
    console.log("Inserting new report.");
    await db.insert(monthlyReports).values(reportData).run();
  } else {
    console.log("Updating already existing report.");
    await db
      .update(monthlyReports)
      .set(reportData)
      .where(eq(monthlyReports.id, reportExists.id))
      .run();
  }
};

const deleteAllMonthlyReports = (
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase;
  }
) => {
  return db.delete(monthlyReports).run();
};

const updateMonthlyReportFees = (
  db: ExpoSQLiteDatabase<Record<string, never>> & {
    $client: SQLiteDatabase;
  },
  reportId: string,
  fees: number
) => {
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
};
