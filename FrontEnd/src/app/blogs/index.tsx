import { View, Text, ScrollView, ActivityIndicator, Alert, Platform } from "react-native";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import BlogEditor from "./BlogEditor";
import * as SecureStore from "expo-secure-store";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const accessToken =
        Platform.OS === "web"
          ? localStorage.getItem("access_token")
          : await SecureStore.getItemAsync("access_token");

      if (!accessToken) {
        Alert.alert("Error", "No access token found.");
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/blogs/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Failed to fetch blogs:", error);
        Alert.alert("Error", "Failed to fetch blogs.");
        return;
      }

      const data = await res.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <View className="flex-1 bg-gray-100">
      <Navbar />
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        {/* Pass fetchBlogs to refresh list after posting */}
        <BlogEditor onPostSuccess={fetchBlogs}/>

        <Text className="text-xl font-bold my-4">All Blogs</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          blogs.map((blog) => (
            <View
              key={blog.id}
              className="bg-white p-4 rounded-2xl shadow-md mb-4"
              style={{ elevation: 2 }}
            >
              <Text className="text-sm text-gray-500 mb-2">
                Posted on: {new Date(blog.posted_on).toLocaleString()}
              </Text>
              <Text className="text-base text-gray-800">{blog.content}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
