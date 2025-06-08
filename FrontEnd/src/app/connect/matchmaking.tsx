import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import Navbar from "../Navbar";

export default function Matchmaking() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const token =
        Platform.OS === "web"
          ? localStorage.getItem("access_token")
          : await SecureStore.getItemAsync("access_token");

      const res = await fetch("http://127.0.0.1:8000/rulebased/all/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch matches");

      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not fetch matches.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Automatically fetch on page load
  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <ScrollView className="bg-white">
      <Navbar />
      <View className="items-center px-4 py-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-blue-500 underline">← Back to Profile</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-pink-600 mb-2">
          💘 Matchmaking Center
        </Text>
        <Text className="text-base text-center mb-4 text-gray-700">
          Let us find your best match based on your Rule-Based Profile!
        </Text>

        <TouchableOpacity
          onPress={() => Alert.alert("You can add matching logic here later")}
          className="bg-pink-500 px-6 py-4 rounded-2xl shadow-lg shadow-pink-300 mb-6"
        >
          <Text className="text-white text-lg font-bold">🔍 Start Matching</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="pink" />}
        {!loading && matches.length > 0 && (
          <View className="w-full">
            <Text className="text-xl font-semibold mb-4 text-left">
              🎯 Suggestions for You
            </Text>
            {matches.map((match) => (
              <View
                key={match.id}
                className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-4 shadow"
              >
                <Image
                  source={{ uri: `${match.pp}` }}
                  className="w-16 h-16 rounded-full border-2 border-pink-400"
                />
                <View className="flex-1 ml-4">
                  <Text className="font-bold text-lg text-gray-800">
                    @{match.profile_username}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    🎓 {match.education} • 🛐 {match.religion}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    💼 {match.job} • 📅 {match.birthdate}
                  </Text>
                </View>
                <TouchableOpacity
                  className="bg-pink-500 px-3 py-1 rounded-xl"
                  onPress={() => Alert.alert("Connect Request Sent!")}
                >
                  <Text className="text-white font-semibold">🤝 Connect</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
