import LoadingIndicator from "@/components/loadingIndicator";
import UsableScreen from "@/components/usableScreen";
import color from "@/constants/color";
import { AppContext } from "@/contexts/appContext";
import { DatabaseContext } from "@/contexts/dbContext";
import {
  DailyReport,
  dailyReportMapper,
} from "@/models/response/DailyReportType";
import { getDailyReportByMonth } from "@/service/dailyReportService";
import { getReportsFromYear } from "@/service/monthlyReportService";
import { getUserByEmail } from "@/service/userService";
import {
  bimonthlyPeriods,
  convertDateToMonthString,
  MONTHS_SHORT,
} from "@/utility/calendar";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const calculateBiMonthlyBill = (
  dailyReport: {
    [month: number]: DailyReport[];
  },
  fees: number
): { period: string; amount: Number }[] => {
  const bimonthlyFee = (fees / 12) * 2;

  return bimonthlyPeriods
    .map(([startMonth, endMonth]) => {
      const period = `${MONTHS_SHORT[startMonth - 1]} - ${
        MONTHS_SHORT[endMonth - 1]
      }`;

      let totalCost = 0;

      // Iterate over all months in the period
      for (let month = startMonth; month <= endMonth; ) {
        if (!dailyReport[month]) {
          month = (month % 12) + 1;
          continue;
        }

        if (month == startMonth) {
          totalCost += dailyReport[month].reduce(
            (sum, item) =>
              new Date(item.date.toString()).getDate() >= 15
                ? sum + Number(item.totalCost)
                : sum,
            0
          );
        } else if (month == endMonth) {
          totalCost += dailyReport[month].reduce(
            (sum, item) =>
              new Date(item.date.toString()).getDate() <= 15
                ? sum + Number(item.totalCost)
                : sum,
            0
          );
        } else {
          totalCost += dailyReport[month].reduce(
            (sum, item) => sum + Number(item.totalCost),
            0
          );
        }

        // Move to next month (handle year wrap-around for Nov–Jan)
        month = (month % 12) + 1;
      }

      if (totalCost > 0)
        return { period: period, amount: totalCost + bimonthlyFee };
      return undefined;
    })
    .filter((bill) => bill !== undefined);
};

export default function TabOneScreen() {
  /* Dev Zone Start */
  const {
    serverConfig,
    server: [isServerOnline, setIsServerOnline],
    userEmail: [email],
  } = useContext(AppContext);
  const { db } = useContext(DatabaseContext);
  const [server] = serverConfig;
  /* Dev Zone End */
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyReports, setMonthlyReports] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [dailyReportData, setDailyReportData] = useState<{
    [month: number]: DailyReport[];
  }>({});
  const [monthlyFee, setMonthlyFee] = useState(0);

  const getUser = () => {
    const user = getUserByEmail(db, email);
    return user;
  };

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        setLoading(true);
        const user = await getUser();

        if (user && user?.uuid) {
          const monthlyReports = getReportsFromYear(db, user?.uuid, year).sort(
            (a, b) => (a.month > b.month ? 1 : -1)
          );

          setMonthlyFee(monthlyReports[0].fees || 0);
          setMonthlyReports(monthlyReports);
          const total = monthlyReports.reduce(
            (acc, report) => acc + report.totalCost,
            0
          );
          setTotalCost(Number(total.toFixed(2)));

          for (const r of monthlyReports) {
            const month = new Date(r.month).getMonth() + 1;

            const dailyReportEntity: any[] = await getDailyReportByMonth(
              db,
              user?.uuid ?? "",
              year,
              month
            );

            let dailyReports: DailyReport[] =
              dailyReportEntity?.map(dailyReportMapper);

            dailyReports = dailyReports.sort(
              (d1, d2) =>
                new Date(d1.date.toString()).getDate() -
                new Date(d2.date.toString()).getDate()
            );

            setDailyReportData((prev) => ({
              ...prev,
              [month]: dailyReports,
            }));
          }
        }
        setLoading(false);
      }

      if (db) {
        fetchData();
      }
    }, [db, year, server, email])
  );

  return (
    <UsableScreen>
      <View style={{ gap: 50, padding: 30, paddingTop: 40 }}>
        <View
          style={{
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              padding: 10,
              borderRadius: 10,
              backgroundColor: "lightblue",
            }}
          >
            <Text style={styles.title}>{year}</Text>
          </View>
          <Text style={styles.subtitle}>
            <Text style={styles.subtitle}>Total Cost {totalCost}</Text>
            <Text style={styles.symbol}>{`€`}</Text>
          </Text>
          <BarChart
            barWidth={50}
            initialSpacing={0}
            noOfSections={2}
            barBorderRadius={4}
            frontColor="lightgray"
            data={monthlyReports.map((report) => ({
              value: report.totalCost,
              label: convertDateToMonthString(report.month),
              frontColor:
                report.month ===
                `${year}-${new Date().getMonth() + 1 < 10 ? "0" : ""}${
                  new Date().getMonth() + 1
                }`
                  ? "#177AD5"
                  : "lightgray",
              topLabelComponent: () => (
                <Text>
                  <Text
                    style={{ color: "gray", fontSize: 12, marginBottom: 6 }}
                  >
                    {report.totalCost}
                  </Text>
                  <Text
                    style={{ color: "gray", fontSize: 9, marginBottom: 6 }}
                  >{`€`}</Text>
                </Text>
              ),
            }))}
            yAxisThickness={0}
            xAxisThickness={0}
            maxValue={
              Math.max(...monthlyReports.map((report) => report.totalCost)) *
              1.15
            }
            spacing={30}
            hideRules
            hideYAxisText
          />
        </View>
        <ScrollView contentContainerStyle={{ gap: 10 }}>
          <Text
            style={styles.title}
          >{`Bi-Monthly Bills start on 15th day`}</Text>
          {dailyReportData &&
            calculateBiMonthlyBill(dailyReportData, monthlyFee)?.map((bill) => (
              <View
                key={bill.period}
                style={{
                  padding: 20,
                  paddingHorizontal: 20,
                  backgroundColor: color.light.grayBlur,
                  borderRadius: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>{`${bill.period} `}</Text>
                <Text>
                  <Text>{`${bill.amount.toFixed(2)}`}</Text>
                  <Text style={[styles.symbol, { color: "black" }]}>{`€`}</Text>
                </Text>
              </View>
            ))}
        </ScrollView>
        <LoadingIndicator isLoading={loading} />
      </View>
    </UsableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 16,
    paddingHorizontal: 5,
    fontWeight: "bold",
    textAlign: "left",
    color: "black",
  },
  server: {
    fontSize: 12,
    color: "lightgray",
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
  },
  symbol: {
    fontSize: 10,
    color: "gray",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
