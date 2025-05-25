import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  Image,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { AntDesign } from "@expo/vector-icons";
import { Link } from "expo-router";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { meditations } from "../data/meditations";
import Navbar from "../Navbar";

const BACKEND_URL = "http://127.0.0.1:8000/meditation/like/";

const MeditationDetails = () => {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [likedMeds, setLikedMeds] = useState<string[]>([]);
  const [loadingLikes, setLoadingLikes] = useState<Record<string, boolean>>({});

  // Format time from ms
  const formatSeconds = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = (player, status) => {
    if (currentPlayer && currentPlayer !== player) {
      currentPlayer.pause();
    }
    if (status.playing) {
      player.pause();
      setCurrentPlayer(null);
    } else {
      player.play();
      setCurrentPlayer(player);
    }
  };

  const handleLike = useCallback(async (meditation) => {
    const medTitle = meditation.title;
    try {
      setLoadingLikes((prev) => ({ ...prev, [medTitle]: true }));

      const accessToken =
        Platform.OS === "web"
          ? localStorage.getItem("access_token")
          : await SecureStore.getItemAsync("access_token");

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: meditation.title,
          image: meditation.image.uri,
          audio: meditation.audio,
          duration: meditation.duration,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLikedMeds((prev) => {
          const isLiked = prev.includes(medTitle);
          return isLiked
            ? prev.filter((title) => title !== medTitle)
            : [...prev, medTitle];
        });
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update like status");
    } finally {
      setLoadingLikes((prev) => ({ ...prev, [medTitle]: false }));
    }
  }, []);

  // Get liked meditations on mount
  useEffect(() => {
    const fetchLikedMeditations = async () => {
      try {
        const accessToken =
          Platform.OS === "web"
            ? localStorage.getItem("access_token")
            : await SecureStore.getItemAsync("access_token");

        const response = await fetch(BACKEND_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();
        console.log("data:", data);

        if (response.ok) {
          const likedTitles = data.map((med) => med.title);
          setLikedMeds(likedTitles);
        } else {
          console.error("Failed to fetch likes:", data.message);
        }
      } catch (error) {
        console.error("Unable to load liked meditations:", error);
      }
    };

    fetchLikedMeditations();
  }, []);

  return (
    <ScrollView>
      <Navbar />
      <SafeAreaView className="bg-orange-100 flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-2 bg-yellow-100 rounded-lg">
          <Link href="../" className="flex-1 items-start">
            <AntDesign name="infocirlceo" size={24} color="black" />
          </Link>
          <Text className="flex-1 text-center font-bold text-lg">Meditations</Text>
          <View className="flex-1 items-end">
            <AntDesign name="close" size={24} color="black" />
          </View>
        </View>

        {/* Meditation List */}
        <View className="flex-1 mt-4">
          {meditations.map((meditation) => {
            const player = useAudioPlayer(meditation.audio);
            const status = useAudioPlayerStatus(player);
            const isLiked = likedMeds.includes(meditation.title);
            const isLoading = loadingLikes[meditation.title];

            return (
              <View
                key={meditation.id}
                className="bg-yellow-100 p-4 mb-4 rounded-lg shadow-lg"
              >
                {/* Header */}
                <View className="flex-row items-center">
                  <Image
                    source={meditation.image}
                    style={{ width: 60, height: 60, borderRadius: 10 }}
                  />
                  <View className="ml-4">
                    <Text className="font-semibold text-lg">{meditation.title}</Text>
                    <Text className="text-gray-500">
                      {formatSeconds(meditation.duration)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handlePlayPause(player, status)}
                    className="bg-zinc-800 w-12 h-12 p-4 rounded-full items-center justify-center ml-auto"
                  >
                    <AntDesign
                      name={status.playing ? "pause" : "play"}
                      size={24}
                      color="white"
                    />
                  </Pressable>
                </View>

                {/* Slider */}
                <View className="w-full mt-4">
                  <Slider
                    style={{ width: "100%", height: 40 }}
                    value={
                      status.duration ? status.currentTime / status.duration : 0
                    }
                    onSlidingComplete={(value) =>
                      player.seekTo(value * status.duration)
                    }
                    minimumValue={0}
                    maximumValue={1}
                    minimumTrackTintColor="#4caf50"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#4caf50"
                  />
                  <View className="flex-row justify-between mb-2">
                    <Text>{formatSeconds(status.currentTime)}</Text>
                    <Text>{formatSeconds(status.duration)}</Text>
                  </View>

                  {/* Like Button */}
                  <Pressable
                    onPress={() => !isLoading && handleLike(meditation)}
                    className="items-center mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <AntDesign name="loading1" size={24} color="gray" />
                    ) : (
                      <AntDesign
                        name={isLiked ? "heart" : "hearto"}
                        size={24}
                        color={isLiked ? "red" : "gray"}
                      />
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default MeditationDetails;
