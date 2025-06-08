import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Navbar from "../Navbar";

export default function Matchmaking() {
  const router = useRouter();

  return (
          <View>
          <Navbar />
          <View className="flex-1 items-center justify-center bg-white px-4">
                    <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6"
          >
          <Text className="text-blue-500 underline">← Back to Profile</Text>
          </TouchableOpacity>
                    
          <Text className="text-2xl font-bold text-pink-600 mb-4">
          💘 Matchmaking Center
          </Text>
          <Text className="text-base text-center mb-6 text-gray-700">
          Let us find your best match based on your Rule-Based Profile!
          </Text>

          <TouchableOpacity
          onPress={() => {
                    // TODO: Add matchmaking logic or fetch matches
                    alert("Matchmaking in progress... 🚀");
          }}
          className="bg-pink-500 px-6 py-4 rounded-2xl shadow-lg shadow-pink-300"
          >
          <Text className="text-white text-lg font-bold">🔍 Start Matching</Text>
          </TouchableOpacity>

          
          </View>
          </View>
  );
}
