import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import {
  BarChart,
  barDataItem,
  stackDataItem,
} from "react-native-gifted-charts";
import { daysTillEndOfMonth, MONTHS_LONG } from "@/utility/calendar";
import { useCallback, useContext, useState } from "react";
import { AppContext } from "@/contexts/appContext";
import UsableScreen from "@/components/usableScreen";
import { useFocusEffect } from "expo-router";
import CustomPressable from "@/components/customPressable";
import {
  getMonthlyReportByMonth,
  updateMonthlyReport,
} from "@/service/monthlyReportService";
import { getDatabase } from "@/db/client";
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
import { FontAwesome } from "@expo/vector-icons";
import color from "@/constants/color";
import { DailyReport } from "@/models/response/DailyReportType";
import { verticalScale } from "@/utility/responsive";
import {
  getDailyReportByMonth,
  updateDailyReport,
} from "@/service/dailyReportService";
const db = getDatabase();

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

export default function TabOneScreen() {
  /* Dev Zone Start */
  const {
    serverConfig,
    server: [isServerOnline, setIsServerOnline],
    userEmail: [email],
  } = useContext(AppContext);
  const [server] = serverConfig;
  /* Dev Zone End */
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [totalKwh, setTotalKwh] = useState(0);
  const [monthlyData, setMonthlyData] = useState({ today: 0, prediction: 0 });
  const [dailyReportData, setDailyReportData] = useState<DailyReport[]>([]);
  const [averageCost, setAverageCost] = useState(0);
  const [daysAnalysed, setDaysAnalysed] = useState(0);
  const [refresh, setRefresh] = useState(true);
  const [loading, setLoading] = useState(false);

  const getUser = () => {
    const user = getUserByEmail(db, email);
    return user;
  };

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
        const user = getUser();

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
            const dailyReportRes: DailyReport[] = data.data.getDailyReports;
            setDailyReportData(data.data.getDailyReports);

            for (let report of dailyReportRes) {
              let date = new Date(report.date.toString());
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
        const user = getUser();

        const report = getMonthlyReportByMonth(
          db,
          user?.uuid ?? "",
          month + 1,
          year
        );

        setTotalKwh(report?.totalKwh || 0);
        setAverageCost(Number(report?.averageCost?.toFixed(2)) || 0);
        setDaysAnalysed(report?.numberOfDays || 0);
        setMonthlyData({
          today: report?.totalCost || 0,
          prediction: report?.predictedTotalCost || 0,
        });

        const dailyReportEntity: any[] = getDailyReportByMonth(
          db,
          user?.uuid ?? "",
          year,
          month + 1
        );

        const dailyReport: DailyReport[] = dailyReportEntity?.map((entity) => ({
          id: entity.id,
          date: entity.date,
          dayCost: entity.dayCost,
          peakCost: entity.peakCost,
          nightCost: entity.nightCost,
          peakKwh: entity.peakKwh,
          nightKwh: entity.nightKwh,
          dayKwh: entity.dayKwh,
          totalCost: entity.totalCost,
          totalKwh: entity.totalKwh,
          isSpike: entity.isSpike,
        }));

        setDailyReportData(dailyReport);
      }

      if (isServerOnline) fetchData();
      else getDbData();
    }, [server, month, refresh, isServerOnline])
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

  const loadDailyReportBar = (): {
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
        <View style={styles.calendarContainer}>
          <CustomPressable
            color={"lightblue"}
            text={"-"}
            padding={8}
            paddingVertical={2}
            onPress={() => setMonth(month - 1)}
          />
          <Text style={styles.title}>{MONTHS_LONG[month]}</Text>
          <CustomPressable
            color={"lightblue"}
            text={"+"}
            padding={8}
            paddingVertical={2}
            onPress={() => setMonth(month + 1)}
          />
        </View>
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              backgroundColor: "transparent",
              width: "100%",
              padding: 10,
            }}
          >
            <View style={styles.chartLegend}>
              <FontAwesome name="circle" size={10} color="lightgray" />
              <Text style={styles.text}>Today</Text>
            </View>
            <View style={styles.chartLegend}>
              <FontAwesome name="circle" size={10} color="#177AD5" />
              <Text style={styles.text}>Predict</Text>
            </View>
          </View>
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
            stackData={loadDailyReportBar().data}
            yAxisThickness={0}
            xAxisThickness={0}
            maxValue={loadDailyReportBar().maxValue * 1.1}
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
