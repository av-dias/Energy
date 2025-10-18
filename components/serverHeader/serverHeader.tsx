import color from "@/constants/color";
import { FontAwesome } from "@expo/vector-icons";
import { View, Text } from "react-native";

type ServerHeaderProps = {
  email: string;
  isServerOnline: boolean;
};

const ServerHeader = ({ email, isServerOnline }: ServerHeaderProps) => {
  return (
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
      {email && (
        <Text style={{ fontSize: 10 }}>{`${email.split("@")[0]}`}</Text>
      )}
      <View style={{ backgroundColor: "transparent" }}>
        <FontAwesome
          name="circle"
          size={10}
          color={isServerOnline ? "green" : "red"}
        />
      </View>
    </View>
  );
};

export default ServerHeader;
