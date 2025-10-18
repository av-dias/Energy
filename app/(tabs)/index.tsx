import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { BarChart } from "react-native-gifted-charts";
import { MONTHS_LONG } from "@/utility/calendar";
import { useCallback, useContext, useState } from "react";
import { AppContext } from "@/contexts/appContext";
import UsableScreen from "@/components/usableScreen";
import { useFocusEffect } from "expo-router";
import CustomPressable from "@/components/customPressable";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import color from "@/constants/color";
import {
  deleteAllMonthlyReports,
  getAllMonthlyReports,
  getMonthlyReportByMonth,
  updateMonthlyReport,
} from "@/service/monthlyReportService";
import { getDatabase } from "@/db/client";
import { getUserByEmail } from "@/service/userService";
import { fetchWithTimeout } from "@/service/serviceUtils";

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
  const [data, setBarData] = useState({ today: 0, prediction: 0 });
  const [averageCost, setAverageCost] = useState(0);
  const [daysAnalysed, setDaysAnalysed] = useState(0);
  const [refresh, setRefresh] = useState(true);
  const [loading, setLoading] = useState(false);
  const db = getDatabase();

  const LoadingIndicator = () => (
    <View style={{ backgroundColor: "transparent", padding: 10 }}>
      <Text>Loading...</Text>
    </View>
  );

  const daysTillEndOfMonth = () => {
    const today = new Date();
    const endOfMonth = new Date(
      new Date().getFullYear(),
      month + 1,
      0
    ).getDate();

    if (today.getMonth() > month) {
      return 0;
    } else {
      return endOfMonth - today.getDate();
    }
  };

  const getUser = () => {
    const user = getUserByEmail(db, email);
    return user;
  };

  const triggerRefresh = async () => {
    setRefresh((prev) => !prev);

    try {
      const response = await fetchWithTimeout(
        `http://${server}:8080/api/v1/health`
      );

      const data = await response?.json();
      if (data) {
        setIsServerOnline(true);
      } else {
        setIsServerOnline(false);
      }
    } catch (error) {
      console.error("Error fetching server health:", error);
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
        const reports = getAllMonthlyReports(db);

        const user = getUser();

        const report = await fetchWithTimeout(`http://${server}:8080/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
                    {
                      getMonthlyReport(
                        userId: "${user?.uuid}"
                        month: ${month + 1}
                        year: ${year}
                      ) {
                        id
                        month
                        totalKwh
                        totalCost
                        averageCost
                        numberOfDays
                        predictedTotalCost
                        totalDayCost
                        totalPeakCost
                        totalNightCost
                        totalDayKwh
                        totalPeakKwh
                        totalNightKwh
                        ascFee
                        psoFee
                        createdAt
                      }
                    }
            `,
          }),
        });

        if (report) {
          const data = await report?.json();

          if (data.data.getMonthlyReport != null) {
            setTotalKwh(data.data.getMonthlyReport.totalKwh);
            setAverageCost(data.data.getMonthlyReport.averageCost.toFixed(2));
            setDaysAnalysed(data.data.getMonthlyReport.numberOfDays);
            setBarData({
              today: data.data.getMonthlyReport.totalCost,
              prediction: data.data.getMonthlyReport.predictedTotalCost,
            });

            console.log(data.data.getMonthlyReport);

            await updateMonthlyReport(
              db,
              month + 1,
              year,
              {
                id: data.data.getMonthlyReport.id,
                averageCost: data.data.getMonthlyReport.averageCost,
                month: data.data.getMonthlyReport.month,
                numberOfDays: data.data.getMonthlyReport.numberOfDays,
                totalCost: data.data.getMonthlyReport.totalCost,
                predictedTotalCost:
                  data.data.getMonthlyReport.predictedTotalCost,
                fees:
                  (data.data.getMonthlyReport.ascFee || 0) +
                  (data.data.getMonthlyReport.psoFee || 0),
                totalKwh: data.data.getMonthlyReport.totalKwh,
                totalDayCost: data.data.getMonthlyReport.totalDayCost,
                totalPeakCost: data.data.getMonthlyReport.totalPeakCost,
                totalNightCost: data.data.getMonthlyReport.totalNightCost,
                totalDayKwh: data.data.getMonthlyReport.totalDayKwh,
                totalPeakKwh: data.data.getMonthlyReport.totalPeakKwh,
                totalNightKwh: data.data.getMonthlyReport.totalNightKwh,
              },
              user?.email ?? ""
            );
          } else {
            setTotalKwh(0);
            setAverageCost(0);
            setDaysAnalysed(0);
            setBarData({
              today: 0,
              prediction: 0,
            });
          }
        }

        setLoading(false);
      }

      async function getDbData() {
        const reports = getAllMonthlyReports(db);

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
        setBarData({
          today: report?.totalCost || 0,
          prediction: report?.predictedTotalCost || 0,
        });
      }

      if (isServerOnline) fetchData();
      else getDbData();
    }, [server, month, refresh, isServerOnline])
  );

  const barData = [
    {
      value: data.today,
      label: "Today",
      topLabelComponent: () => (
        <Text>
          <Text style={{ color: "gray", fontSize: 12, marginBottom: 6 }}>
            {data.today}
          </Text>
          <Text
            style={{ color: "gray", fontSize: 9, marginBottom: 6 }}
          >{`€`}</Text>
        </Text>
      ),
    },
    {
      value: data.prediction,
      label: "Predicted",
      frontColor: "#177AD5",
      topLabelComponent: () => (
        <Text>
          <Text style={{ color: "#177AD5", fontSize: 12, marginBottom: 6 }}>
            {data.prediction}
          </Text>
          <Text
            style={{ color: "#177AD5", fontSize: 9, marginBottom: 6 }}
          >{`€`}</Text>
        </Text>
      ),
    },
  ];

  return (
    <UsableScreen>
      <View
        style={{
          backgroundColor: color.light.grayBlur,
          position: "absolute",
          top: 40,
          right: 10,
          padding: 5,
          borderRadius: 5,
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Text style={{ fontSize: 10 }}>{`${email.split("@")[0]}`}</Text>
        <View style={{ backgroundColor: "transparent" }}>
          <FontAwesome
            name="circle"
            size={10}
            color={isServerOnline ? "green" : "red"}
          />
        </View>
      </View>
      <View style={styles.container}>
        <View
          style={{
            alignItems: "center",
            gap: 5,
            backgroundColor: "transparent",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
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
        <Text
          style={styles.subtitle}
        >{`${daysTillEndOfMonth()} days till end of month`}</Text>
        <Text style={styles.server}>{`http://${server}:8080/graphql`}</Text>
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
        <View
          style={{
            paddingBottom: 20,
            alignItems: "center",
            gap: 5,
            backgroundColor: "transparent",
          }}
        >
          <View
            style={{
              backgroundColor: "lightblue",
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
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
        <View
          style={{
            flex: 1,
            alignItems: "center",
            backgroundColor: "transparent",
          }}
        >
          <BarChart
            barWidth={50}
            initialSpacing={100}
            noOfSections={2}
            barBorderRadius={4}
            frontColor="lightgray"
            data={barData}
            yAxisThickness={0}
            xAxisThickness={0}
            maxValue={data.prediction * 1.15}
            spacing={40}
            hideRules
            hideYAxisText
          />
        </View>
        {loading && <LoadingIndicator />}
        <View style={{ backgroundColor: "transparent", paddingBottom: 10 }}>
          <CustomPressable
            color={"lightblue"}
            text={"Refresh"}
            onPress={triggerRefresh}
            padding={10}
          />
        </View>
        <View
          style={{
            backgroundColor: "transparent",
            alignContent: "center",
          }}
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
