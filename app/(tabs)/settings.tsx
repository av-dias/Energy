import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { ServerSyncContainer } from "@/demo/serverSyncContainer";
import UsableScreen from "@/components/usableScreen";

export default function TabTwoScreen() {
  return (
    <UsableScreen>
      <View style={styles.container}>
        <View style={{ paddingBottom: 100, backgroundColor: "transparent" }}>
          <Text style={styles.title}>Settings</Text>
        </View>
        <ServerSyncContainer />
      </View>
    </UsableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    paddingTop: 60,
    padding: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
