import React, { useEffect, useState } from "react";
import { Animated, Text, View } from "react-native";
import { styles } from "./style";
import { eventEmitter, NotificationEvent } from "../../utility/eventEmitter";

export type NotificationData = {
  msg: string;
  notificationColor?: string;
};

export const createNotification = (
  message: string,
  notificationColor: string
) => {
  return { msg: message, notificationColor: notificationColor };
};

export const NotificationBox = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [notificationColor, setNotificationColor] = useState("gray");
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const showNotification = ({ msg, notificationColor }: NotificationData) => {
      setMessage(msg);
      setVisible(true);

      if (notificationColor) setNotificationColor(notificationColor);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          setNotificationColor("gray");
        });
      }, 4000);
    };

    eventEmitter.on(NotificationEvent, showNotification);
    return () => {
      eventEmitter.off(NotificationEvent, showNotification);
    };
  }, []);

  if (!visible) return null;

  return (
    <View style={{ ...styles.container, backgroundColor: notificationColor }}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};
