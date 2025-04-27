import { View, Text } from "react-native";
import Navbar from "../Navbar";

export default function MeditationsPage() {
  return (
    <View className="flex-1 bg-gray-100">
      <Navbar/>
      <Text className="text-2xl font-bold">Meditations Page 🧘‍♂️</Text>
    </View>
  );
}
