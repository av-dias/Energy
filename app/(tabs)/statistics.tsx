import LoadingIndicator from "@/components/loadingIndicator";
import UsableScreen from "@/components/usableScreen";
import { AppContext } from "@/contexts/appContext";
import { getDatabase } from "@/db/client";
import { getReportsFromYear } from "@/service/monthlyReportService";
import { getUserByEmail } from "@/service/userService";
import { convertDateToMonthString } from "@/utility/calendar";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const db = getDatabase();

export default function TabOneScreen() {
  /* Dev Zone Start */
  const {
    serverConfig,
    server: [isServerOnline, setIsServerOnline],
    userEmail: [email],
  } = useContext(AppContext);
  const [server] = serverConfig;
  /* Dev Zone End */
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [reports, setReports] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  const getUser = () => {
    const user = getUserByEmail(db, email);
    return user;
  };

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        setLoading(true);
        const user = getUser();

        if (user && user?.uuid) {
          const reports = getReportsFromYear(db, user?.uuid, year).sort(
            (a, b) => (a.month > b.month ? 1 : -1)
          );
          setReports(reports);
          const total = reports.reduce(
            (acc, report) => acc + report.totalCost,
            0
          );
          setTotalCost(Number(total.toFixed(2)));
        }
        setLoading(false);
      }
      fetchData();
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
            data={reports.map((report) => ({
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
              Math.max(...reports.map((report) => report.totalCost)) * 1.15
            }
            spacing={30}
            hideRules
            hideYAxisText
          />
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
