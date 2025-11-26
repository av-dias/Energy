import Calendar from "@/components/calendar";
import CustomPressable from "@/components/customPressable";
import InputBox from "@/components/InputBox";
import LoadingIndicator from "@/components/loadingIndicator";
import UsableScreen from "@/components/usableScreen";
import { AppContext } from "@/contexts/appContext";
import { DatabaseContext } from "@/contexts/dbContext";
import { getMonthlyReportByMonth } from "@/service/monthlyReportService";
import { getUserByEmail } from "@/service/userService";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { View, Text } from "react-native";
import { StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";

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
  const [pso, setPso] = useState(0);
  const [asc, setAsc] = useState(0);
  const [flatRate, setFlatRate] = useState(0);
  const [dayKwh, setDayKwh] = useState(0);
  const [peakKwh, setPeakKwh] = useState(0);
  const [nightKwh, setNightKwh] = useState(0);
  const [dayCost, setDayCost] = useState(0);
  const [peakCost, setPeakCost] = useState(0);
  const [nightCost, setNightCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [simulatedCost, setSimulatedCost] = useState<number | null>(null);

  const getUser = () => {
    const user = getUserByEmail(db, email);
    return user;
  };

  const loadSimulation = async () => {
    const monthlyPso = pso / 12;
    const monthlyAsc = asc / 12;
    const user = await getUser();

    if (!user || !user?.uuid) {
      alert("No user found");
      return;
    }

    const report = await getMonthlyReportByMonth(
      db,
      user?.uuid,
      month + 1,
      year
    );
    const totalKwh = report?.totalKwh;

    if (!totalKwh || totalKwh <= 0) {
      alert("No usage data found for this month");
      return;
    }

    const cost = flatRate * totalKwh + monthlyPso + monthlyAsc;
    setSimulatedCost(Number(cost.toFixed(2)));
  };

  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        setLoading(true);

        const user = await getUser();

        if (user && user?.uuid) {
          const report = await getMonthlyReportByMonth(
            db,
            user?.uuid,
            month + 1,
            year
          );

          if (report) {
            setDayKwh(Number(report.totalDayKwh.toFixed(1)));
            setDayCost(Number(report.totalDayCost.toFixed(1)));
            setNightKwh(Number(report.totalNightKwh.toFixed(1)));
            setNightCost(Number(report.totalNightCost.toFixed(1)));
            setPeakKwh(Number(report.totalPeakKwh.toFixed(1)));
            setPeakCost(Number(report.totalPeakCost.toFixed(1)));
          } else {
            setDayKwh(0);
            setDayCost(0);
            setNightKwh(0);
            setNightCost(0);
            setPeakKwh(0);
            setPeakCost(0);
          }
        }

        setLoading(false);
      }

      fetchData();
    }, [db, month, server])
  );

  return (
    <UsableScreen>
      <View style={{ gap: 50, padding: 30, paddingTop: 40 }}>
        <View style={{ gap: 20 }}>
          <Text style={styles.titleTop}>Current Period Usage</Text>
          <Calendar month={month} setMonth={setMonth} />
          <View
            style={{
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              marginTop: 20,
              gap: 50,
            }}
          >
            <PieChart
              radius={70}
              showValuesAsLabels={true}
              textColor="black"
              showText={true}
              textSize={18}
              data={[
                {
                  value: dayKwh,
                  text: `${dayKwh} kwh`,
                  color: "orange",
                  shiftX: 5,
                  shiftY: 5,
                },
                {
                  value: peakKwh,
                  text: `${peakKwh} kwh`,
                  color: "pink",
                },
                {
                  value: nightKwh,
                  text: `${nightKwh} kwh`,
                  color: "green",
                },
              ]}
            />
            <PieChart
              radius={70}
              showValuesAsLabels={true}
              textColor="black"
              showText={true}
              textSize={18}
              data={[
                {
                  value: dayCost,
                  text: `${dayCost} €`,
                  color: "orange",
                  shiftX: 5,
                  shiftY: 5,
                },
                {
                  value: peakCost,
                  text: `${peakCost} €`,
                  color: "pink",
                },
                {
                  value: nightCost,
                  text: `${nightCost} €`,
                  color: "green",
                },
              ]}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignSelf: "center",
              marginTop: 20,
              gap: 20,
            }}
          >
            <Text style={{ color: "orange" }}>Day</Text>
            <Text style={{ color: "pink" }}>Peak</Text>
            <Text style={{ color: "green" }}>Night</Text>
          </View>
        </View>
        <View style={{ gap: 20 }}>
          <Text style={styles.title}>Simulation Screen</Text>
          <InputBox
            icon={undefined}
            placeholder={"PSO"}
            onChange={setPso}
            keyboardType="numeric"
          />
          <InputBox
            icon={undefined}
            placeholder={"ASC"}
            onChange={setAsc}
            keyboardType="numeric"
          />
          <InputBox
            icon={undefined}
            placeholder={"Flat Rate"}
            onChange={setFlatRate}
            keyboardType="numeric"
          />
          <CustomPressable
            color={"lightblue"}
            text={"Simulate"}
            onPress={loadSimulation}
          />
        </View>
        <View>
          <Text>
            {simulatedCost !== null ? `Simulated Cost: ${simulatedCost} €` : ""}
          </Text>
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
    fontWeight: "bold",
    textAlign: "left",
    color: "black",
  },
  titleTop: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "lightblue",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
    borderRadius: 10,
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
