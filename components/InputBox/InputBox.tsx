import { View, TextInput, KeyboardTypeOptions } from "react-native";
import { ReactNode } from "react";

import IconContainer from "../iconContainer";
import color from "../../constants/color";

type PropsWithChildren = {
  icon: ReactNode;
  placeholder: string;
  onSubmitEditing?: any;
  onChange?: any;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
};

const InputBox: React.FC<PropsWithChildren> = ({
  icon,
  placeholder,
  onSubmitEditing,
  onChange,
  keyboardType = "default",
  secureTextEntry,
}) => {
  return (
    <View
      style={{
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 50,
          justifyContent: "center",
        }}
      >
        <IconContainer>{icon}</IconContainer>
      </View>
      <TextInput
        style={{ flex: 3 }}
        placeholder={placeholder}
        onSubmitEditing={onSubmitEditing}
        onChangeText={onChange}
        autoCapitalize="none"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      ></TextInput>
    </View>
  );
};

export default InputBox;
