import { StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { MONTHS_LONG } from "@/utility/calendar";
import { useState } from "react";

export default function TabOneScreen() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [totalKwh, setTotalKwh] = useState(136.2);
  const [data, setBarData] = useState({ today: 54, prediction: 63 });
  const [averageCost, setAverageCost] = useState(1.36);
  const [daysAnalysed, setDaysAnalysed] = useState(24);

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
    <View style={styles.container}>
      <Text style={styles.title}>{MONTHS_LONG[month]}</Text>
      <Text style={styles.subtitle}>{`${
        new Date(new Date().getFullYear(), month + 1, 0).getDate() -
        new Date().getDate()
      } days till end of month`}</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <View style={{ paddingBottom: 20, alignItems: "center", gap: 5 }}>
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
        <View style={{ alignItems: "center" }}>
          <Text
            style={{ color: "gray" }}
          >{`${daysAnalysed} days analysed`}</Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: "center",
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
      <View>
        <View>
          <Text>
            <Text>{`Average daily cost: ${averageCost}`}</Text>
            <Text style={{ fontSize: 10 }}>{`€`}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
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
