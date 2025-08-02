import { View, Text, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import Navbar from "../Navbar";
import RuleBased from "./RuleBased";
import CompatibilityScore from "./CompatibilityScore";
import MatchPreferencesForm from "./MatchPreferencesForm";
import Modal from "react-native-modal";

// Placeholder components
const Collaborative = () => <Text className="text-center text-lg mt-4">Collaborative Filtering Section</Text>;
const ContentBased = () => <Text className="text-center text-lg mt-4">Content-Based Filtering Section</Text>;
//const CompatibilityScore = () => <Text className="text-center text-lg mt-4">Compatibility Score Models</Text>;
const MLMatching = () => <Text className="text-center text-lg mt-4">Machine Learning Based Matching</Text>;

export default function ConnectPage() {
  const [selected, setSelected] = useState("rule");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const renderSelected = () => {
    switch (selected) {
      case "rule":
        return <RuleBased />;
      // case "collab":
      //   return <Collaborative />;
      // case "content":
      //   return <ContentBased />;
      case "compat":
        return <CompatibilityScore />;
      case "ml":
        return <MLMatching />;
      default:
        return null;
    }
  };

  const options = [
    { label: "Connect Profile", value: "rule" },
    // { label: "Collaborative", value: "collab" },
    // { label: "Content-Based", value: "content" },
    { label: "Personality Type", value: "compat" },
    { label: "ML Matching", value: "ml" },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      <Navbar />
      <Text className="text-2xl font-bold text-center my-4 text-gray-800">Let’s Connect</Text>

      {/* Filter Tabs */}
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

      {/* Open Form Modal Button */}
      <View className="items-center mb-4">
        <Pressable
          onPress={() => setIsModalVisible(true)}
          className="bg-purple-600 px-5 py-2 rounded-xl"
        >
          <Text className="text-white font-bold">📝 Fill Match Preferences</Text>
        </Pressable>
      </View>

      {/* Render selected matching method */}
      <ScrollView className="flex-1 px-4 pb-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {renderSelected()}
      </ScrollView>


      {/* Modal for Match Preferences Form */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        style={{ margin: 0, justifyContent: "flex-end" }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View className="bg-white rounded-t-2xl max-h-[90%] p-4">
          {/* Top Bar with mclose */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">Match Preferences</Text>
            <Pressable
              onPress={() => setIsModalVisible(false)}
              className="p-2 bg-gray-200 rounded-full"
            >
              <Text className="text-lg font-bold text-gray-600">❌</Text>
            </Pressable>
          </View>

          {/* Scrollable Form */}
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <MatchPreferencesForm />
          </ScrollView>

          {/* Bottom Close Button */}
          <Pressable
            onPress={() => setIsModalVisible(false)}
            className="bg-gray-800 py-3 mt-4 rounded-xl"
          >
            <Text className="text-white text-center font-bold">Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
