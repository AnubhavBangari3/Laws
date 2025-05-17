import { View, Text, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import BlogEditor from "./BlogEditor";
import * as SecureStore from "expo-secure-store";
import { Heart } from "lucide-react-native"; // if you use lucide-react-native for icons

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState<{ [key: number]: boolean }>({}); // simple local like state

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

  const toggleLike = (id: number) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Navbar />
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <BlogEditor onPostSuccess={fetchBlogs} />

        <Text className="text-xl font-bold my-4">All Blogs</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          blogs.map((blog) => (
            <View
              key={blog.id}
              className="bg-white rounded-2xl shadow-md mb-4 p-4"
              style={{ elevation: 3 }}
            >
              <Text className="text-sm text-gray-500 mb-2">
                Posted on: {new Date(blog.posted_on).toLocaleString()}
              </Text>

              <View className="border border-gray-200 rounded-lg p-2 mb-2 bg-gray-50">
                <Text className="text-base text-gray-800">{blog.content}</Text>
              </View>

              <TouchableOpacity
                onPress={() => toggleLike(blog.id)}
                className="flex-row items-center mt-2"
              >
                <Heart
                  size={20}
                  color={likes[blog.id] ? "red" : "gray"}
                  fill={likes[blog.id] ? "red" : "none"}
                  style={{ marginRight: 4 }}
                />
                <Text className="text-sm text-gray-600">
                  {likes[blog.id] ? "Liked" : "Like"}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
