import { View, Text, Pressable, SafeAreaView, Image, ScrollView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import Slider from "@react-native-community/slider";
import { meditations } from "../data/meditations";
import Navbar from "../Navbar";

const MeditationDetails = () => {
  const [currentPlayer, setCurrentPlayer] = useState(null);  // Track the currently playing meditation player

  const formatSeconds = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = (player, status) => {
    // If there's already a player playing, stop it
    if (currentPlayer && currentPlayer !== player) {
      currentPlayer.pause();
    }
    // Start the new player or pause the current one
    if (status.playing) {
      player.pause();
      setCurrentPlayer(null); // Clear the current player if paused
    } else {
      player.play();
      setCurrentPlayer(player); // Set the new player as the current one
    }
  };

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

            return (
              <View
                key={meditation.id}
                className="bg-yellow-100 p-4 mb-4 rounded-lg shadow-lg"
              >
                {/* Meditation Item */}
                <View className="flex-row items-center">
                  <Image
                    source={meditation.image}
                    style={{ width: 60, height: 60, borderRadius: 10 }}
                  />
                  <View className="ml-4">
                    <Text className="font-semibold text-lg">{meditation.title}</Text>
                    <Text className="text-gray-500">{formatSeconds(meditation.duration)}</Text>
                  </View>
                  {/* Play Button */}
                  <Pressable
                    onPress={() => handlePlayPause(player, status)}
                    className="bg-zinc-800 w-12 h-12 p-4 rounded-full items-center justify-center ml-auto"
                  >
                    <AntDesign name={status.playing ? "pause" : "play"} size={24} color="white" />
                  </Pressable>
                </View>

                {/* Audio Progress */}
                <View className="w-full mt-4">
                  <Slider
                    style={{ width: "100%", height: 40 }}
                    value={status.duration ? status.currentTime / status.duration : 0}
                    onSlidingComplete={(value) => player.seekTo(value * status.duration)}
                    minimumValue={0}
                    maximumValue={1}
                    minimumTrackTintColor="#4caf50"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#4caf50"
                  />
                  <View className="flex-row justify-between">
                    <Text>{formatSeconds(status.currentTime)}</Text>
                    <Text>{formatSeconds(status.duration)}</Text>
                  </View>
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
