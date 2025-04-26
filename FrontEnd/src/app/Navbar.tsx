import { View, Text, Pressable, Alert } from "react-native";

import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export default function Navbar() {

  const handleLogout = async () => {
    try {
      let accessToken, refreshToken;
      
      // Handle token retrieval based on platform
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
  
      // Only send refresh token in body and access token in header
      const response = await fetch("http://127.0.0.1:8000/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`  // Only access token here
        },
        body: JSON.stringify({
          refresh_token: refreshToken,  // Only refresh token here
        }),
      });
  
      if (response.status === 401) {
        // Token might be expired, clear storage anyway
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
      // Clear tokens anyway if there's an error
      await clearTokens();
      router.replace("/");
    }
  };
  
  // Helper function to clear tokens
  const clearTokens = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } else {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    }
  };

  return (
 
      
      <View className="flex-row bg-yellow-400 px-4 py-3 shadow-xl rounded-b-lg justify-around items-center border-b border-gray-300">
        <Text className="text-xl font-extrabold text-black">NIYAM</Text>
        <Text className="text-lg font-semibold text-white">Blogs</Text>
        <Text className="text-lg font-semibold text-white">Audiobooks</Text>
        <Text className="text-lg font-semibold text-white">Meditations</Text>
        <Text className="text-lg font-semibold text-white">Films</Text>
        <Text className="text-lg font-semibold text-white">E-Books</Text>
        <Pressable onPress={handleLogout}>
          <Text className="text-lg font-semibold text-white">Logout</Text>
        </Pressable>
      </View>

     

  );
}
