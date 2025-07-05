import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";

import * as SecureStore from "expo-secure-store"; // for native

const matchQuestions = [
  "Do you drink alcohol?",
  "Do you smoke?",
  "Do you want children?",
  "Are you open to long-distance relationships?",
  "Do you follow a specific religion?",
  "Is living together before marriage acceptable to you?",
  "Do you prefer a partner who exercises regularly?",
  "Do you want a partner from your own community?",
  "Do you believe in monogamy?",
  "Do you like pets (dogs/cats)?",
];

const options = ["Yes", "No", "Prefer not to say"];

export default function MatchPreferencesForm() {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const handleSelect = (index: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: answer,
    }));
  };

 const handleSubmit = async () => {
  if (Object.keys(answers).length < 10) {
    Alert.alert("Incomplete", "Please answer all questions.");
    return;
  }

  const payload = {
    q1_alcohol: answers[0],
    q2_smoke: answers[1],
    q3_children: answers[2],
    q4_long_distance: answers[3],
    q5_religion: answers[4],
    q6_living_together: answers[5],
    q7_exercise_partner: answers[6],
    q8_community: answers[7],
    q9_monogamy: answers[8],
    q10_pets: answers[9],
  };

  try {
    const accessToken =
      Platform.OS === "web"
        ? localStorage.getItem("access_token")
        : await SecureStore.getItemAsync("access_token");

    if (!accessToken) {
      Alert.alert("Error", "You must be logged in to submit preferences.");
      return;
    }

    const response = await fetch("http://127.0.0.1:8000/match-preferences/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 200) {
      Alert.alert("✅ Saved", "Your match preferences were submitted!");
      
      // 🔁 Refresh the page (web only)
      if (Platform.OS === "web") {
        setTimeout(() => {
          window.location.reload();
        }, 500); // slight delay to allow user to see the alert
      }

    } else if (response.status === 409) {
      const resJson = await response.json();
      Alert.alert("Already Submitted", resJson.detail);
    } else {
      const resJson = await response.json();
      console.error("Error:", resJson);
      Alert.alert("Submission Failed", "Please try again later.");
    }
  } catch (error) {
    console.error("Request Error:", error);
    Alert.alert("Network Error", "Please check your connection.");
  }
};


  return (
    <ScrollView className="p-4 bg-white">
      <Text className="text-xl font-bold text-center text-pink-600 mb-6">
        💖 Your Ideal Match Preferences
      </Text>

      {matchQuestions.map((q, index) => (
        <View key={index} className="mb-6">
          <Text className="text-base font-semibold text-gray-800 mb-2">
            {index + 1}. {q}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => handleSelect(index, opt)}
                className={`px-4 py-2 rounded-xl border ${
                  answers[index] === opt
                    ? "bg-pink-500 border-pink-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`${
                    answers[index] === opt ? "text-white" : "text-gray-800"
                  } font-semibold`}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-green-600 py-3 mt-6 rounded-xl"
      >
        <Text className="text-center text-white font-bold text-lg">
          ✅ Save Preferences
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
