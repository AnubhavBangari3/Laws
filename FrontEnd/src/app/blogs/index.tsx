import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import BlogEditor from "./BlogEditor";
import * as SecureStore from "expo-secure-store";
import { Heart } from "lucide-react-native";

// Type definitions
interface Blog {
  id: number;
  content: string;
  posted_on: string;
  author: number;
  author_name: string;
  liked_by_user: boolean;
  total_likes: number;
}

interface Profile {
  id: number;
  name: string;
  // Add more fields if needed
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState<{ [key: number]: boolean }>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  const fetchProfile = async () => {
    try {
      const accessToken =
        Platform.OS === "web"
          ? localStorage.getItem("access_token")
          : await SecureStore.getItemAsync("access_token");

      if (!accessToken) {
        Alert.alert("Error", "No access token found.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
    } catch (error: any) {
      console.error("Profile Fetch Error:", error);
      Alert.alert("Error", error.message || "An error occurred.");
    }
  };

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

    const blogList = await res.json();

    // Fetch like status for each blog in parallel
    const enrichedBlogs = await Promise.all(
      blogList.map(async (blog: Blog) => {
        try {
          const statusRes = await fetch(`http://127.0.0.1:8000/blogs/${blog.id}/like-status/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!statusRes.ok) {
            throw new Error("Failed to fetch like status");
          }

          const likeData = await statusRes.json();

          return {
            ...blog,
            liked_by_user: likeData.liked,
            total_likes: likeData.total_likes,
          };
        } catch (err) {
          console.error(`Error fetching like status for blog ${blog.id}:`, err);
          return {
            ...blog,
            liked_by_user: false,
            total_likes: 0,
          };
        }
      })
    );

    setBlogs(enrichedBlogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    Alert.alert("Error", "An unexpected error occurred.");
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchProfile();
    fetchBlogs();
  }, []);

  const toggleLike = async (blogId: number) => {
  try {
    const accessToken =
      Platform.OS === "web"
        ? localStorage.getItem("access_token")
        : await SecureStore.getItemAsync("access_token");

    const response = await fetch(`http://127.0.0.1:8000/blogs/${blogId}/like/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to toggle like:", error);
      Alert.alert("Error", "Could not toggle like.");
      return;
    }

    const result = await response.json();

    // Update blog state with new like info
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog.id === blogId
          ? {
              ...blog,
              liked_by_user: result.liked,
              total_likes: result.total_likes,
            }
          : blog
      )
    );
  } catch (error) {
    console.error("Toggle like error:", error);
    Alert.alert("Error", "Unexpected error during like toggle.");
  }
};
  const startEditing = (blog: Blog) => {
    setEditingBlogId(blog.id);
    setEditContent(blog.content);
  };

  const cancelEditing = () => {
    setEditingBlogId(null);
    setEditContent("");
  };

  const saveEdit = async (blogId: number) => {
    try {
      const accessToken =
        Platform.OS === "web"
          ? localStorage.getItem("access_token")
          : await SecureStore.getItemAsync("access_token");

      const response = await fetch(`http://127.0.0.1:8000/blogs/${blogId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Edit failed:", error);
        Alert.alert("Error", "Could not update blog.");
        return;
      }

      Alert.alert("Success", "Blog updated.");
      setEditingBlogId(null);
      fetchBlogs();
    } catch (error) {
      console.error("Save edit error:", error);
      Alert.alert("Error", "Unexpected error during update.");
    }
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
          blogs.map((blog) => {
            const isOwner = profile?.id === blog.author;
            const isEditing = editingBlogId === blog.id;

            return (
              <View
                key={blog.id}
                className="bg-white rounded-2xl shadow-md mb-4 p-4"
                style={{ elevation: 3 }}
              >
                <Text className="text-sm text-gray-500 mb-1">
                  Author: {blog.author_name}
                </Text>
                <Text className="text-sm text-gray-500 mb-2">
                  Posted on: {new Date(blog.posted_on).toLocaleString()}
                </Text>

                <View className="border border-gray-200 rounded-lg p-2 mb-2 bg-gray-50">
                  {isEditing ? (
                    <TextInput
                      multiline
                      value={editContent}
                      onChangeText={setEditContent}
                      className="text-base text-gray-800"
                      style={{
                        minHeight: 100,
                        padding: 8,
                        backgroundColor: "#fff",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#ccc",
                      }}
                    />
                  ) : (
                    <Text className="text-base text-gray-800">
                      {blog.content}
                    </Text>
                  )}
                </View>

                <View className="flex-row justify-between items-center mt-2">
                  <TouchableOpacity
                    onPress={() => toggleLike(blog.id)}
                    className="flex-row items-center"
                  >
                    <Heart
                      size={20}
                      color={blog.liked_by_user ? "red" : "gray"}
                      fill={blog.liked_by_user ? "red" : "none"}
                      style={{ marginRight: 4 }}
                    />
                    <Text className="text-sm text-gray-600">
                     {blog.liked_by_user ? "Liked" : "Like"} • {blog.total_likes}
                    </Text>
                  </TouchableOpacity>

                  {isOwner && !isEditing && (
                    <TouchableOpacity onPress={() => startEditing(blog)}>
                      <Text className="text-blue-600 text-sm">Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {isEditing && (
                  <View className="flex-row gap-2 mt-2">
                    <TouchableOpacity
                      onPress={() => saveEdit(blog.id)}
                      className="bg-blue-500 px-4 py-1 rounded-xl"
                    >
                      <Text className="text-white text-sm">Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={cancelEditing}
                      className="bg-gray-300 px-4 py-1 rounded-xl"
                    >
                      <Text className="text-gray-800 text-sm">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
