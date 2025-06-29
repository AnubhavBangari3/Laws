import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";

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

  const handleSubmit = () => {
    if (Object.keys(answers).length < matchQuestions.length) {
      Alert.alert("Incomplete", "Please answer all questions.");
      return;
    }

    // You can send `answers` to your Django API here.
    console.log("Submitted Preferences:", answers);
    Alert.alert("✅ Saved", "Your match preferences were submitted!");
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
