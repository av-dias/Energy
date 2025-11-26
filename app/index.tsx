import UsableScreen from "@/components/usableScreen";
import React, { useCallback, useContext, useState } from "react";
import { Text, View } from "@/components/Themed";
import { StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  getAllUsers,
  getUserByEmail,
  insertOneUser,
} from "@/service/userService";
import InputBox from "@/components/InputBox";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import CustomPressable from "@/components/customPressable";
import { AppContext } from "@/contexts/appContext";
import { DatabaseContext } from "@/contexts/dbContext";

/**
 * Login screen component
 * TODO: Implement login functionality
 * Obs: Currently the User just needs to enter their email to log in
 */
export default function LoginScreen() {
  const {
    serverConfig: [, setServer],
    userEmail: [, setEmail],
  } = useContext(AppContext);
  const { db } = useContext(DatabaseContext);

  const [loading, setLoading] = useState(true);
  const [inputEmail, setInputEmail] = useState("");
  const [users, setUsers] = useState<any[] | undefined>(undefined);

  const handleLogin = async () => {
    console.log("Login pressed");

    // Check if user exists
    const existingUser = await getUserByEmail(db, inputEmail);

    // If user exists, log them in
    if (existingUser) {
      console.log("User exists:", existingUser);
      setEmail(inputEmail);
      setServer(existingUser?.baseUrl);
      router.replace("/(tabs)");
    } else {
      // If user doesn't exist, create new user
      console.log("User doesn't exist, creating new user:", inputEmail);
      insertOneUser(db, inputEmail);
      setEmail(inputEmail);
      router.replace("/(tabs)");
    }
  };

  /**
   * TODO: Remove this useEffect
   * This is a temporary solution to fetch the activity list.
   * For dev test only purpose
   * Use tanStack Query or React Query
   */
  useFocusEffect(
    useCallback(() => {
      async function fetchData() {
        const allUsers = await getAllUsers(db);
        setUsers(allUsers);

        if (allUsers && allUsers?.length > 0) {
          setEmail(allUsers[0].email);
          setServer(allUsers[0].baseUrl);
          router.replace("/(tabs)");
        }

        setLoading(false);
      }

      if (db) fetchData();
    }, [db])
  );

  return (
    <UsableScreen>
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            gap: 5,
            backgroundColor: "transparent",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text style={styles.title}>Login</Text>
        </View>
        {loading && (
          <View
            style={{
              flex: 3,
              backgroundColor: "transparent",
            }}
          >
            <Text style={styles.subtitle}>Loading...</Text>
          </View>
        )}
        {users?.length === 0 && (
          <View
            style={{
              flex: 3,
              width: 200,
              gap: 10,
              backgroundColor: "transparent",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                width: 200,
                gap: 10,
                backgroundColor: "transparent",
              }}
            >
              <InputBox
                icon={<AntDesign name="user" size={20} color="black" />}
                placeholder={"user@gmail.com"}
                onChange={(value: string) => setInputEmail(value)}
                keyboardType="email-address"
              />
              <InputBox
                icon={<EvilIcons name="lock" size={28} color="black" />}
                placeholder={"yourpassword"}
                keyboardType="default"
                secureTextEntry={true}
              />
            </View>
            <View style={{ backgroundColor: "transparent", width: "100%" }}>
              <CustomPressable
                color={"lightblue"}
                text={"Login"}
                onPress={() => handleLogin()}
              />
            </View>
          </View>
        )}
        {!loading && users && users?.length > 0 && (
          <View
            style={{
              flex: 3,
              backgroundColor: "transparent",
            }}
          >
            <Text style={styles.subtitle}></Text>
          </View>
        )}
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
