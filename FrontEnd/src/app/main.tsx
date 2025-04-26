import { View, Text, Image, ActivityIndicator, ScrollView, Alert, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Navbar from './Navbar';

interface ProfileType {
  id: number;
  username: number;
  first_name: string;
  last_name: string;
  email: string;
  about: string;
  pp: string;
  slug: string;
  profile_name: string;
  num_connections: number;
}

export default function Main() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = Platform.OS === 'web'
          ? localStorage.getItem('access_token')
          : await SecureStore.getItemAsync('access_token');

        if (!accessToken) {
          Alert.alert("Error", "No access token found.");
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#facc15" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-700">No Profile Data Available.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <Navbar />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Profile Header */}
        <View className="items-center mt-6 px-4">
          <Image
            source={{ uri: `http://127.0.0.1:8000${profile.pp}` }}
            className="w-32 h-32 rounded-full border-4 border-yellow-400"
            resizeMode="cover"
          />
          <Text className="text-2xl font-bold mt-4">{profile.profile_name}</Text>
          <Text className="text-gray-500">{profile.email}</Text>
        </View>

        {/* Stats + Connect Section */}
        <View className="flex-row justify-around items-center mt-8 mx-6 bg-white py-4 rounded-lg shadow-md">

          {/* Followers */}
          <View className="items-center">
            <Text className="text-xl font-bold">{profile.num_connections}</Text>
            <Text className="text-gray-600">Followers</Text>
          </View>

          {/* Connect Button in middle */}
          {/* <Pressable
            className="bg-yellow-400 px-4 py-2 rounded-full shadow-lg"
            onPress={() => Alert.alert("Connect", "Feature coming soon!")}
          >
            <Text className="text-white font-semibold text-base">Connect</Text>
          </Pressable> */}

          <View className="items-center">
            <Text className="text-xl font-bold">0</Text>
            <Text className="text-gray-600">Posts</Text>
          </View>

          {/* Following */}
          <View className="items-center">
            <Text className="text-xl font-bold">0</Text>
            <Text className="text-gray-600">Following</Text>
          </View>

        </View>

        {/* About Section */}
        <View className="bg-white mt-6 mx-6 p-4 rounded-lg shadow-md">
          <Text className="text-lg font-semibold mb-2">About</Text>
          <Text className="text-gray-700 leading-relaxed">
            {profile.about || "No description provided."}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}
