import { View, Text } from "react-native";
import Navbar from "../Navbar";
import BlogEditor from "./BlogEditor"; 

export default function BlogsPage() {
  return (
    <View className="flex-1 bg-gray-100">
      <Navbar />
      <BlogEditor />
    </View>
  );
}
