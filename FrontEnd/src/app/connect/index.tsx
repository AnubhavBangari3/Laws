import { View, Text, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import Navbar from "../Navbar";
import RuleBased from "./RuleBased";

// Placeholder components
const Collaborative = () => <Text className="text-center text-lg mt-4">Collaborative Filtering Section</Text>;
const ContentBased = () => <Text className="text-center text-lg mt-4">Content-Based Filtering Section</Text>;
const CompatibilityScore = () => <Text className="text-center text-lg mt-4">Compatibility Score Models</Text>;
const MLMatching = () => <Text className="text-center text-lg mt-4">Machine Learning Based Matching</Text>;

export default function ConnectPage() {
  const [selected, setSelected] = useState("rule");

  const renderSelected = () => {
    switch (selected) {
      case "rule":
        return <RuleBased />;
      case "collab":
        return <Collaborative />;
      case "content":
        return <ContentBased />;
      case "compat":
        return <CompatibilityScore />;
      case "ml":
        return <MLMatching />;
      default:
        return null;
    }
  };

  const options = [
    { label: "Rule-Based", value: "rule" },
    { label: "Collaborative", value: "collab" },
    { label: "Content-Based", value: "content" },
    { label: "Compatibility Score", value: "compat" },
    { label: "ML Matching", value: "ml" },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      <Navbar />
      <Text className="text-2xl font-bold text-center my-4 text-gray-800">Let’s Connect</Text>

      <View className="flex-row flex-wrap justify-center gap-2 px-4 mb-4">
        {options.map(({ label, value }) => (
          <Pressable
            key={value}
            onPress={() => setSelected(value)}
            className={`px-4 py-2 rounded-lg ${
              selected === value
                ? "bg-blue-600"
                : "bg-white border border-gray-300"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selected === value ? "text-white" : "text-gray-700"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-1 px-4">{renderSelected()}</View>
    </View>
  );
}
