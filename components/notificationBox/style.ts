import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    height: 30,
    width: "99%",
    top: 40 + 5,
    paddingHorizontal: 10,
    alignSelf: "center",
    backgroundColor: "gray",
    borderRadius: 10,
    justifyContent: "center",
    alignContent: "center",
    zIndex: 1000,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    alignContent: "center",
    textAlign: "center",
  },
});
