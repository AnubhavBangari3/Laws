import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import Navbar from "../Navbar";
import RuleBased from "./RuleBased"; // ✅ REAL IMPORT

// Temporary placeholders for others
const Collaborative = () => <Text className="text-center text-lg">Collaborative Filtering Section</Text>;
const ContentBased = () => <Text className="text-center text-lg">Content-Based Filtering Section</Text>;
const CompatibilityScore = () => <Text className="text-center text-lg">Compatibility Score Models</Text>;
const MLMatching = () => <Text className="text-center text-lg">Machine Learning Based Matching</Text>;

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

  return (
    <View className="flex-1 bg-gray-100">
      <Navbar />
      <Text className="text-2xl font-bold text-center my-4">Let’s Connect</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
        <TouchableOpacity onPress={() => setSelected("rule")} className="px-4 py-2 bg-white rounded-xl mr-2">
          <Text>Rule-Based</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelected("collab")} className="px-4 py-2 bg-white rounded-xl mr-2">
          <Text>Collaborative</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelected("content")} className="px-4 py-2 bg-white rounded-xl mr-2">
          <Text>Content-Based</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelected("compat")} className="px-4 py-2 bg-white rounded-xl mr-2">
          <Text>Compatibility Score</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelected("ml")} className="px-4 py-2 bg-white rounded-xl mr-2">
          <Text>ML Matching</Text>
        </TouchableOpacity>
      </ScrollView>

      <View className="flex-1 items-center justify-start px-4">
        {renderSelected()}
      </View>
    </View>
  );
}
