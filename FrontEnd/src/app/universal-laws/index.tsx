import { View, Text, Image, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import * as SecureStore from "expo-secure-store";

interface VisionItem {
  id: number;
  text: string;
  uri: string;
  unlocked?: boolean;
}

export default function UniversalLawsPage() {
  const [visions, setVisions] = useState<VisionItem[]>([]);

  const getAccessToken = async () => {
    return Platform.OS === "web"
      ? localStorage.getItem("access_token")
      : await SecureStore.getItemAsync("access_token");
  };

  const fetchVisionBoardItems = async () => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const response = await fetch("http://127.0.0.1:8000/visionget/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to fetch vision items");
      }

      const data = await response.json();
      const formatted = data.map((item: any) => ({
        id: item.id,
        text: item.text,
        uri: item.image,
        unlocked: false, // initially locked
      }));

      setVisions(formatted);
    } catch (error: any) {
      console.error("Fetch Vision Items Error:", error);
      Alert.alert("Error", error.message || "Could not fetch vision items.");
    }
  };

  useEffect(() => {
    fetchVisionBoardItems();
  }, []);

  const toggleVision = (id: number) => {
    setVisions(prev =>
      prev.map(v => (v.id === id ? { ...v, unlocked: !v.unlocked } : v))
    );
  };

  const shuffleVisions = () => {
    setVisions(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Navbar />
      <Text className="text-2xl font-bold text-center mt-4">Universal Laws Vision Board</Text>

      <TouchableOpacity
        onPress={shuffleVisions}
        className="bg-yellow-400 py-2 px-4 rounded-full mx-auto mt-4"
      >
        <Text className="text-white font-bold text-center">Shuffle Cards</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 16, alignItems: "center" }}>
        <View className="flex-row flex-wrap justify-center mt-4">
          {visions.map(vision => (
            <TouchableOpacity
              key={vision.id}
              onPress={() => toggleVision(vision.id)}
              style={{
                width: 140,
                height: 180,
                margin: 10,
                borderRadius: 12,
                backgroundColor: vision.unlocked ? "#facc15" : "#ddd",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              {vision.unlocked ? (
                <>
                  <Image
                    source={{ uri: vision.uri }}
                    style={{ width: "100%", height: 120 }}
                    resizeMode="cover"
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: "600",
                      marginTop: 6,
                      color: "#222",
                    }}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {vision.text}
                  </Text>
                </>
              ) : (
                <Text style={{ fontSize: 24 }}>🌌</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
