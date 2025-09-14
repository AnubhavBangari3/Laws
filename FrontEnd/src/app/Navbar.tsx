import { View, Text, Pressable, Alert,Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  const handleLogout = async () => {
    try {
      let accessToken, refreshToken;

      if (Platform.OS === 'web') {
        accessToken = localStorage.getItem('access_token');
        refreshToken = localStorage.getItem('refresh_token');
      } else {
        accessToken = await SecureStore.getItemAsync('access_token');
        refreshToken = await SecureStore.getItemAsync('refresh_token');
      }

      if (!refreshToken) {
        Alert.alert("Error", "No refresh token found.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.status === 401) {
        await clearTokens();
        Alert.alert("Session Expired", "Please login again.");
        router.replace("/");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Logout failed");
      }

      await clearTokens();
      Alert.alert("Success", "You have been logged out.");
      router.replace("/");

    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", error.message || "An error occurred while logging out.");
      await clearTokens();
      router.replace("/");
    }
  };

  const clearTokens = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } else {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    }
  };

  const fetchFriendRequestCount = async () => {
    try {
      let accessToken;
      if (Platform.OS === "web") {
        accessToken = localStorage.getItem("access_token");
      } else {
        accessToken = await SecureStore.getItemAsync("access_token");
      }

      if (!accessToken) return;

      const response = await fetch(
        "http://127.0.0.1:8000/friend-request/receive/pending/",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        console.log("Failed to fetch friend requests");
        return;
      }

      const data = await response.json();
      setFriendRequestCount(data.length); // ✅ Count of pending requests
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

   useEffect(() => {
    fetchFriendRequestCount();
  }, [pathname]);

  // Navbar items
  const navItems = [
    { label: "Blogs", path: "/blogs" },
    { label: "Audiobooks", path: "/audiobooks" },
    { label: "Meditations", path: "/meditations" },
    { label: "Films", path: "/films" },
    { label: "Connect", path: "/connect" },
    { label: "Friend Request", path: "/FriendRequest" },
    { label: "Universal Laws", path: "/universal-laws" },
  ];

  return (
     <View className="flex-row bg-yellow-400 px-4 py-3 shadow-xl rounded-b-lg justify-around items-center border-b border-gray-300 flex-wrap">
      {/* App Name */}
      <Pressable onPress={() => router.push("/main")}>
        <Text className="text-2xl font-extrabold text-black mr-4">NIYAM</Text>
      </Pressable>

      {/* Navigation Items */}
   {navItems.map((item, index) => (
  <Pressable
    key={index}
    onPress={() => router.push(item.path)}
    className={`relative px-4 py-2 mx-1 rounded-lg transition 
      ${pathname === item.path 
        ? "bg-white shadow-md" 
        : "bg-yellow-500 hover:bg-yellow-600"} 
    `}
  >
    <Text
      className={`text-base font-semibold ${
        pathname === item.path ? "text-black" : "text-white"
      }`}
    >
      {item.label}
    </Text>

    {/* ✅ Friend Request Badge */}
    {item.label === "Friend Request" && friendRequestCount > 0 && (
      <View className="absolute -top-2 -right-2 bg-red-600 rounded-full px-2 py-0.5">
        <Text className="text-white text-xs font-bold">
          {friendRequestCount}
        </Text>
      </View>
    )}
  </Pressable>
))}

      {/* Logout Button */}
      <Pressable onPress={handleLogout} className="px-2 py-1">
        <Text className="text-lg font-semibold text-white">Logout</Text>
      </Pressable>
    </View>
  );
}
