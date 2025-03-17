import {Stack} from "expo-router";
import { useState } from "react";
import "../../global.css";

export default function RootLayout() {
          const [isAuthenticated, setIsAuthenticated] = useState(false);

          return (
          <Stack screenOptions={{ headerShown: false }}>
                    {!isAuthenticated ? (
                    <Stack.Screen name="index" options={{ title: "Login" }} />
                    ) : (
                    <Stack.Screen name="main" options={{ title: "Main" }} />
                    )}
                    </Stack>
          );
}