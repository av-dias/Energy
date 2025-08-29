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

export default function TabOneScreen() {
  /* Dev Zone Start */
  const {
    serverConfig,
    isServerOnline,
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

  const LoadingIndicator = () => (
    <View style={{ backgroundColor: "transparent", padding: 10 }}>
      <Text>Loading...</Text>
    </View>
  );

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
        fetch(`http://${server}:8080/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
                    {
                    getMonthlyReport(
                      userId: "c3c8a408-8442-413b-99f5-23306150273c"
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
                      createdAt
                    }
                  }
            `,
          }),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);
            setTotalKwh(data.data.getMonthlyReport.totalKwh);
            setAverageCost(data.data.getMonthlyReport.averageCost.toFixed(2));
            setDaysAnalysed(data.data.getMonthlyReport.numberOfDays);
            setBarData({
              today: data.data.getMonthlyReport.totalCost,
              prediction: data.data.getMonthlyReport.predictedTotalCost,
            });
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      }

      if (isServerOnline) fetchData();
    }, [server, refresh])
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
        }}
      >
        <Text style={{ fontSize: 10 }}>{`${email.split("@")[0]}`}</Text>
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
          <Text style={styles.title}>{MONTHS_LONG[month]}</Text>
          <View style={{ backgroundColor: "transparent" }}>
            <FontAwesome
              name="circle"
              size={10}
              color={isServerOnline ? "green" : "red"}
            />
          </View>
        </View>
        <Text style={styles.subtitle}>{`${
          new Date(new Date().getFullYear(), month + 1, 0).getDate() -
          new Date().getDate()
        } days till end of month`}</Text>
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
            onPress={() => setRefresh(!refresh)}
            padding={10}
          />
        </View>
        <View
          style={{
            backgroundColor: "transparent",
          }}
        >
          <Text>
            <Text>{`Average daily cost: ${averageCost}`}</Text>
            <Text style={{ fontSize: 10 }}>{`€`}</Text>
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
  },
  server: {
    fontSize: 12,
    color: "lightgray",
  },
  subtitle: {
    fontSize: 14,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
