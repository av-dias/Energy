import { Text, Pressable } from "react-native";

type Props = {
  color: string;
  text: string;
  onPress: any;
  padding?: number;
};

const CustomPressable: React.FC<Props> = (props) => {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: props.color,
          padding: props.padding ? props.padding : 20,
          borderRadius: 10,
          opacity: pressed ? props.onPress && 0.8 : 1,
          marginHorizontal: pressed ? 1 : 0,
          marginTop: pressed ? 1 : 0,
        },
      ]}
      onPress={props.onPress}
    >
      <Text style={{ textAlign: "center" }}>{props.text}</Text>
    </Pressable>
  );
};

export default CustomPressable;
