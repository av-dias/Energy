import { getDatabase } from "@/db/client";
import { fetchWithTimeout } from "@/service/serviceUtils";
import { updateUUIDForUserByEmail } from "@/service/userService";
import { useFocusEffect } from "@react-navigation/native";
import React, {
  Dispatch,
  SetStateAction,
  use,
  useCallback,
  useState,
} from "react";
import { createContext } from "react";

interface AppContext {
  serverConfig: [string, React.Dispatch<React.SetStateAction<string>>]; // Dev test only
  server: [boolean, React.Dispatch<React.SetStateAction<boolean>>]; // Dev test only
  userEmail: [string, React.Dispatch<React.SetStateAction<string>>]; // Dev test only
}

export const AppContext = createContext<AppContext>({
  serverConfig: ["", () => {}],
  server: [false, () => {}],
  userEmail: ["", () => {}],
});

const AppContextProvider = ({ children }: { children: any }) => {
  const [server, setServer] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isServerOnline, setIsServerOnline] = useState<boolean>(false);
  const db = getDatabase();

  const value: AppContext = {
    serverConfig: [server, setServer],
    server: [isServerOnline, setIsServerOnline],
    userEmail: [email, setEmail],
  };

  useFocusEffect(
    useCallback(() => {
      async function checkUserOnServer() {
        // Check if user exists on server
        console.log("Email:", email);

        const userResponse = await fetchWithTimeout(
          `http://${server}:8080/graphql`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                    {
                      getUser(email: "${email}") {
                        id
                        email
                        createdAt
                      }
                    }
            `,
            }),
          }
        );

        const user = await userResponse?.json();

        if (!user) {
          console.log("No response from server - User registry");
          return;
        } else if (user.data.getUser) {
          console.log(`User ${user.data.getUser.email} already registered.`);
          setIsServerOnline(true);
          updateUUIDForUserByEmail(db, email, user.data.getUser.id);
        } else {
          console.log("User not registered.");
          const userCreatedResponse = await fetchWithTimeout(
            `http://${server}:8080/graphql`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: `
                    mutation CreateUserMutation($email: String!, $password: String!) {
                      createUser(email: $email, password: $password) {
                        id
                        email
                        createdAt
                      }
                    }
                  `,
                variables: {
                  email: email,
                  password: "default",
                },
              }),
            }
          );

          setIsServerOnline(true);
          const userCreated = await userCreatedResponse?.json();
          updateUUIDForUserByEmail(db, email, userCreated.data.createUser.id);
        }
      }

      if (email && email != "") checkUserOnServer();
    }, [value.server, email])
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
