import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { BarChart, stackDataItem } from "react-native-gifted-charts";
import { daysTillEndOfMonth } from "@/utility/calendar";
import { useCallback, useContext, useState } from "react";
import { AppContext } from "@/contexts/appContext";
import UsableScreen from "@/components/usableScreen";
import { useFocusEffect } from "expo-router";
import CustomPressable from "@/components/customPressable";
import {
  getMonthlyReportByMonth,
  updateMonthlyReport,
} from "@/service/monthlyReportService";
import { getUserByEmail } from "@/service/userService";
import ServerHeader from "@/components/serverHeader";
import LoadingIndicator from "@/components/loadingIndicator";
import { getDailyReport, getMonthlyReport } from "@/requests/report";
import { healthCheck } from "@/requests/server";
import { eventEmitter, NotificationEvent } from "@/utility/eventEmitter";
import {
  createNotification,
  NotificationBox,
} from "@/components/notificationBox/NotificationBox";
import color from "@/constants/color";
import {
  DailyReport,
  dailyReportMapper,
} from "@/models/response/DailyReportType";
import { verticalScale } from "@/utility/responsive";
import {
  deleteDailyReportMonth,
  getDailyReportByMonth,
  updateDailyReport,
} from "@/service/dailyReportService";
import Calendar from "@/components/calendar";
import ChartLegend from "@/components/ChartLegend";
import { DatabaseContext } from "@/contexts/dbContext";

const TopLabelComponent = ({ value, color, size = 12 }: any) => {
  return (
    <Text>
      <Text style={{ color: color, fontSize: size, marginBottom: 6 }}>
        {value}
      </Text>
      <Text
        style={{ color: color, fontSize: size - 3, marginBottom: 6 }}
      >{`€`}</Text>
    </Text>
  );
};

type ChartDataType = {
  data: stackDataItem[];
  maxValue: number;
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
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [totalKwh, setTotalKwh] = useState(0);
  const [monthlyData, setMonthlyData] = useState({ today: 0, prediction: 0 });
  const [dailyReportData, setDailyReportData] = useState<DailyReport[]>([]);
  const [dailyReportChartData, setDailyReportChartData] =
    useState<ChartDataType>({ data: [], maxValue: 0 });
  const [averageCost, setAverageCost] = useState(0);
  const [daysAnalysed, setDaysAnalysed] = useState(0);
  const [dailyReportSelected, setDailyReportSelected] = useState<DailyReport>();
  const [refresh, setRefresh] = useState(true);
  const [loading, setLoading] = useState(false);

  const triggerRefresh = async () => {
    setRefresh((prev) => !prev);

    const response = await healthCheck(server);
    const data = await response?.json();
    if (data) {
      setIsServerOnline(true);
    } else {
      setIsServerOnline(false);
    }
  };

  /**
   * TODO: Remove this useEffect
   * This is a temporary solution to fetch the activity list.
   * For dev test only purpose
   * Use tanStack Query or React Query
   */
  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        setLoading(true);
        const user = await getUserByEmail(db, email);

        if (!user || !user?.uuid) {
          eventEmitter.emit(
            NotificationEvent,
            createNotification("No user found.", "pink")
          );
          setLoading(false);
          return;
        }

        const monthlyReport = await getMonthlyReport(user, month, year, server);

        // MONTHLY REPORT
        if (monthlyReport) {
          const data = await monthlyReport?.json();

          if (data.data.getMonthlyReport != null) {
            setTotalKwh(data.data.getMonthlyReport.totalKwh);
            setAverageCost(data.data.getMonthlyReport.averageCost.toFixed(2));
            setDaysAnalysed(data.data.getMonthlyReport.numberOfDays);
            setMonthlyData({
              today: data.data.getMonthlyReport.totalCost,
              prediction: data.data.getMonthlyReport.predictedTotalCost,
            });

            await updateMonthlyReport(
              db,
              month + 1,
              year,
              data.data.getMonthlyReport,
              user?.email ?? ""
            );
          } else {
            setTotalKwh(0);
            setAverageCost(0);
            setDaysAnalysed(0);
            setMonthlyData({
              today: 0,
              prediction: 0,
            });
          }
        }

        // DAILY REPORT
        const dailyReportList = await getDailyReport(user, month, year, server);

        if (dailyReportList) {
          const data = await dailyReportList?.json();

          if (data.data.getDailyReports != null) {
            let dailyReportRes: DailyReport[] = data.data.getDailyReports;

            dailyReportRes = dailyReportRes.sort(
              (d1, d2) =>
                new Date(d1.date.toString()).getDate() -
                new Date(d2.date.toString()).getDate()
            );

            setDailyReportData(dailyReportRes);
            setDailyReportChartData(loadDailyReportBar(dailyReportRes));

            for (let report of dailyReportRes) {
              let date = new Date(report.date.toString());

              const existingReport = dailyReportData.find(
                (d) => d.date == report.date
              );

              // Dont update if totalCost stayed unchanged
              if (report.totalCost == existingReport?.totalCost) continue;

              await updateDailyReport(
                db,
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate(),
                report,
                email
              );
            }
          } else {
            console.log("Error fetching daily report list.");
            setDailyReportData([]);
          }
        }

        setLoading(false);
      }

      async function getDbData() {
        const user = await getUserByEmail(db, email);

        const monthlyReport = await getMonthlyReportByMonth(
          db,
          user?.uuid ?? "",
          month + 1,
          year
        );

        setTotalKwh(monthlyReport?.totalKwh || 0);
        setAverageCost(Number(monthlyReport?.averageCost?.toFixed(2)) || 0);
        setDaysAnalysed(monthlyReport?.numberOfDays || 0);
        setMonthlyData({
          today: monthlyReport?.totalCost || 0,
          prediction: monthlyReport?.predictedTotalCost || 0,
        });

        const dailyReportEntity: any[] = await getDailyReportByMonth(
          db,
          user?.uuid ?? "",
          year,
          month + 1
        );

        let dailyReports: DailyReport[] =
          dailyReportEntity?.map(dailyReportMapper);

        dailyReports = dailyReports.sort(
          (d1, d2) =>
            new Date(d1.date.toString()).getDate() -
            new Date(d2.date.toString()).getDate()
        );

        setDailyReportData(dailyReports);
        setDailyReportChartData(loadDailyReportBar(dailyReports));
      }

      if (db) {
        if (isServerOnline) fetchData();
        else getDbData();
      }
    }, [server, db, month, refresh, isServerOnline])
  );

  const barData = [
    {
      value: monthlyData.today,
      topLabelComponent: () => (
        <TopLabelComponent value={monthlyData.today} color="gray" />
      ),
    },
    {
      value: monthlyData.prediction,
      frontColor: "#177AD5",
      topLabelComponent: () => (
        <TopLabelComponent value={monthlyData.prediction} color="#177AD5" />
      ),
    },
  ];

  const loadDailyReportBar = (
    dailyReportData: DailyReport[]
  ): {
    data: stackDataItem[];
    maxValue: number;
  } => {
    if (!dailyReportData || dailyReportData.length == 0) {
      return { data: [], maxValue: 0 };
    }

    const sortedDailyList = dailyReportData
      .sort(
        (d1, d2) =>
          new Date(String(d1.date)).getDate() -
          new Date(String(d2.date)).getDate()
      )
      .map((d) => ({
        stacks: [
          { value: Number(d.peakCost), color: "pink" },
          { value: Number(d.dayCost), color: "#177AD5" },
          { value: Number(d.nightCost), color: "lightblue" },
        ],
        label: new Date(String(d.date)).getDate().toString(),
        topLabelComponent: () => (
          <TopLabelComponent
            value={Number(d?.totalCost.toFixed(1) ?? 0)}
            color={d?.isSpike ? "red" : "gray"}
            size={10}
          />
        ),
      }));

    // find highest cost value
    const maxValue = dailyReportData?.sort(
      (d1, d2) => Number(d2.dayCost) - Number(d1.dayCost)
    )[0].totalCost;

    return { data: sortedDailyList, maxValue: Number(maxValue) };
  };

  return (
    <UsableScreen>
      <NotificationBox />
      <ServerHeader email={email} isServerOnline={isServerOnline} />
      <View style={styles.container}>
        <Calendar month={month} setMonth={setMonth} />
        <Text style={styles.subtitle}>{`${daysTillEndOfMonth(
          month
        )} days till end of month`}</Text>
        <Text style={styles.server}>{`http://${server}:8080/graphql`}</Text>
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
        <View style={styles.chartHeader}>
          <View style={styles.chartHeaderItem}>
            <Text style={{ color: "black" }}>{`${totalKwh} kWh`}</Text>
          </View>
          <View
            style={{ alignItems: "center", backgroundColor: "transparent" }}
          >
            <Text
              style={{ color: "gray" }}
            >{`${daysAnalysed} days analysed`}</Text>
          </View>
        </View>
        <View style={styles.horizontalChartContainer}>
          <ChartLegend
            legends={[
              { text: "Total", color: "gray" },
              { text: "Predict", color: "#177AD5" },
            ]}
          />
          <BarChart
            horizontal
            width={320}
            height={50}
            barWidth={20}
            initialSpacing={0}
            noOfSections={2}
            barBorderRadius={4}
            frontColor="lightgray"
            topLabelContainerStyle={{
              marginTop: -5,
            }}
            data={barData}
            yAxisThickness={0}
            xAxisThickness={0}
            maxValue={monthlyData.prediction * 1.25}
            shiftX={-50}
            shiftY={-30}
            spacing={15}
            hideRules
            hideYAxisText
          />
        </View>
        <View
          style={[styles.separator, { marginVertical: 5 }]}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
        <View style={styles.chartContainer}>
          <ChartLegend
            style={{ position: "absolute", top: 10 }}
            legends={
              dailyReportSelected
                ? [
                    {
                      text: dailyReportSelected.peakCost.toFixed(1),
                      color: "pink",
                    },
                    {
                      text: dailyReportSelected.dayCost.toFixed(1),
                      color: "#177AD5",
                    },
                    {
                      text: dailyReportSelected.nightCost.toFixed(1),
                      color: "lightblue",
                    },
                  ]
                : [
                    { text: "Peak", color: "pink" },
                    { text: "Day", color: "#177AD5" },
                    { text: "Night", color: "lightblue" },
                  ]
            }
          />
          <BarChart
            height={verticalScale(200)}
            barWidth={25}
            initialSpacing={0}
            noOfSections={2}
            barBorderRadius={2}
            frontColor="lightgray"
            xAxisLabelTextStyle={{
              width: 25,
              justifyContent: "center",
              textAlign: "center",
              fontSize: 10,
              color: "gray",
            }}
            stackData={dailyReportChartData.data}
            yAxisThickness={0}
            xAxisThickness={0}
            maxValue={dailyReportChartData.maxValue * 1.1}
            onPress={(b: { label: string }) => {
              if (dailyReportData) {
                let orderedReport = dailyReportData.sort(
                  (d1, d2) =>
                    new Date(d1.date.toString()).getDate() -
                    new Date(d2.date.toString()).getDate()
                );
                setDailyReportSelected(orderedReport[Number(b.label) - 1]);
              }
            }}
            lineData={dailyReportData.map(() => ({
              value: averageCost || 0,
              label: "Average",
            }))}
            lineConfig={{
              curvature: 0, // Straight line
              hideDataPoints: true,
              color: "lightgray",
            }}
            onBackgroundPress={() => setDailyReportSelected(undefined)}
            dashGap={5}
            spacing={20}
            hideRules
            hideYAxisText
            scrollToEnd
          />
        </View>
        <View
          style={{
            height: verticalScale(100),
            backgroundColor: "transparent",
            alignContent: "center",
            justifyContent: "flex-end",
            gap: 5,
          }}
        >
          <View
            style={{ backgroundColor: "transparent", alignItems: "center" }}
          >
            <CustomPressable
              color={"lightblue"}
              text={"Refresh"}
              onPress={triggerRefresh}
              padding={10}
            />
          </View>
          <View
            style={{ backgroundColor: "transparent", alignItems: "center" }}
          >
            <Text style={{ textAlign: "center" }}>
              <Text
                style={{ color: "gray" }}
              >{`Average daily cost: ${averageCost}`}</Text>
              <Text style={{ fontSize: 10, color: "gray" }}>{`€`}</Text>
            </Text>
            <Text style={{ textAlign: "center" }}>
              <Text style={{ color: "gray" }}>{`Total cost without fees: ${(
                averageCost * daysAnalysed
              ).toFixed(2)}`}</Text>
              <Text style={{ fontSize: 10, color: "gray" }}>{`€`}</Text>
            </Text>
          </View>
        </View>
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
  calendarContainer: {
    alignItems: "center",
    gap: 5,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    width: 120,
    textAlign: "center",
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
  chartLegend: {
    gap: 3,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: "80%",
  },
  chartHeader: {
    paddingBottom: 20,
    alignItems: "center",
    gap: 5,
    backgroundColor: "transparent",
  },
  chartHeaderItem: {
    backgroundColor: "lightblue",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  horizontalChartContainer: {
    width: "100%",
    maxHeight: 150,
    padding: 10,
    borderRadius: 10,
    backgroundColor: color.light.grayBlur,
    alignItems: "flex-start",
  },
  chartContainer: {
    width: "100%",
    maxHeight: 300,
    padding: 10,
    borderRadius: 10,
    backgroundColor: color.light.grayBlur,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  text: { color: color.light.textPrimary },
});
