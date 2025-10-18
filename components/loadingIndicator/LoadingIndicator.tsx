import { Text, View } from "@/components/Themed";

const LoadingIndicator = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <View
      style={{
        backgroundColor: "transparent",
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>{isLoading ? "Loading..." : ""}</Text>
    </View>
  );
};

export default LoadingIndicator;
