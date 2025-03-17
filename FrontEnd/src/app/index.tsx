import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MotiView } from "moti";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "password") {
      router.replace("/main");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-6 bg-gradient-to-b from-gray-500 to-black-800">
      {/* Magnet Animation */}
      <View className="flex-row items-center justify-center mb-10">
        {/* Left Magnet */}
        <MotiView
          from={{ translateX: -40, scale: 1 }}
          animate={{
            translateX: -10,
            scale: [1, 1.2, 1], // Magnet expansion effect
          }}
          transition={{
            loop: true,
            type: "timing",
            duration: 1000,
            repeatReverse: true,
          }}
        >
          <Ionicons name="magnet-outline" size={40} color="red" />
        </MotiView>

        {/* Electric Bolt (Flickering Effect) */}
        <MotiView
          from={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            loop: true,
            type: "timing",
            duration: 500,
          }}
        >
          <MaterialIcons name="electric-bolt" size={40} color="yellow" />
        </MotiView>

        {/* Right Magnet */}
        <MotiView
          from={{ translateX: 40, scale: 1 }}
          animate={{
            translateX: 10,
            scale: [1, 1.2, 1], // Magnet expansion effect
          }}
          transition={{
            loop: true,
            type: "timing",
            duration: 1000,
            repeatReverse: true,
          }}
        >
          <Ionicons name="magnet-outline" size={40} color="red" />
        </MotiView>
      </View>

      {/* Glassmorphism Login Card */}
      <View className="w-full p-6 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-lg">
        <Text className="text-3xl font-bold text-white text-center mb-6">
          NIYAM
        </Text>

        <TextInput
          className="w-full p-4 bg-white/60 rounded-lg mb-4 border border-gray-300 text-lg text-gray-700"
          placeholder="Username"
          placeholderTextColor="#555"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          className="w-full p-4 bg-white/60 rounded-lg mb-4 border border-gray-300 text-lg text-gray-700"
          placeholder="Password"
          placeholderTextColor="#555"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

 
        {/* Keep the animation only for the login container, not the buttons */}
        <View>
          <Pressable
            onPress={handleLogin}
            className="w-full p-4 bg-blue-600 rounded-lg items-center shadow-lg"
          >
            <Text className="text-white text-lg font-bold">Login</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            className="w-full p-4 bg-yellow-600 rounded-lg items-center shadow-lg mt-4"
          >
            <Text className="text-white text-lg font-bold">Register</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            className="w-full p-4 bg-red-600 rounded-lg items-center shadow-lg mt-4 flex-row justify-center"
          >
            <Ionicons name="logo-google" size={20} color="white" />
            <Text className="text-white text-lg font-bold ml-2">Login with Google</Text>
          </Pressable>
        </View>
  

      </View>
    </View>
  );
}
