import { View, Text, TextInput, Pressable,Modal, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MotiView } from "moti";
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const storeTokenWeb = async (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing token in web:', error);
    }
  };
 

  const [registerVisible, setRegisterVisible] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState("");
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");
  const [registerError, setRegisterError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Both username and password are required!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle errors, like wrong username/password
        const errorMessage = data.detail || "Invalid credentials";
        alert(errorMessage);
        return;
      }
      if (Platform.OS === 'web') {
        storeTokenWeb('access_token', data.access);
        storeTokenWeb('refresh_token', data.refresh);
      } else {
        // Use Expo Secure Store for mobile
        await SecureStore.setItemAsync('access_token', data.access);
        await SecureStore.setItemAsync('refresh_token', data.refresh);
      }

      // Save tokens locally (perhaps in AsyncStorage or secure storage)
     // console.log("Access Token:", data.access);
      //console.log("Refresh Token:", data.refresh);

      // Optionally store tokens or handle next steps like navigating
      router.replace("/main"); // Replace with your main screen
    } catch (error) {
      console.error("Login Error:", error);
      alert("An error occurred during login.");
    }
  };

  const handleRegister = async () => {
    // Basic validation
    if (!regUsername || !regEmail || !regPassword || !regPassword2 || !firstName || !lastName) {
      setRegisterError("All fields are required.");
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setRegisterError("Invalid email format.");
      return;
    }
  
    if (regPassword.length < 6) {
      setRegisterError("Password must be at least 6 characters.");
      return;
    }
  
    if (regPassword !== regPassword2) {
      setRegisterError("Passwords do not match.");
      return;
    }
  
    // Clear any previous errors
    setRegisterError("");
  
    try {
      const response = await fetch("http://127.0.0.1:8000/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          password2: regPassword2,
          first_name:firstName, // required by serializer
          last_name: lastName, 
        }),
      });
  
      const data = await response.json();
      console.log("Registration response:", data);
      if (!response.ok) {
        // You might receive errors like {"email": ["This field must be unique."]}
        const errorMessage = Object.values(data)
          .flat()
          .join("\n");
        setRegisterError(errorMessage || "Registration failed.");
        return;
      }
  
      // Success
      Alert.alert("Success", "User is created!");
      setRegisterVisible(false);
      // Reset form
      setfirstName("");
      setlastName("")
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
      setRegPassword2("");
    } catch (error) {
      console.error(error);
      setRegisterError("An error occurred. Please try again.");
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
            onPress={() => setRegisterVisible(true)}
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

      
      {/* Register Modal */}
      <Modal visible={registerVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="w-11/12 bg-white p-6 rounded-2xl shadow-xl">
            <Text className="text-2xl font-bold mb-4 text-center">Register</Text>

            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg mb-3"
              placeholder="Username"
              value={regUsername}
              onChangeText={setRegUsername}
            />

            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg mb-3"
              placeholder="First Name"
              value={firstName}
              onChangeText={setfirstName}
            />

          <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg mb-3"
              placeholder="Last Name"
              value={lastName}
              onChangeText={setlastName}
            />
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg mb-3"
              placeholder="Email"
              keyboardType="email-address"
              value={regEmail}
              onChangeText={setRegEmail}
            />
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg mb-3"
              placeholder="Password"
              secureTextEntry
              value={regPassword}
              onChangeText={setRegPassword}
            />
            <TextInput
              className="w-full p-3 border border-gray-300 rounded-lg mb-3"
              placeholder="Confirm Password"
              secureTextEntry
              value={regPassword2}
              onChangeText={setRegPassword2}
            />

            {registerError ? (
              <Text className="text-red-600 mb-3">{registerError}</Text>
            ) : null}

            <View className="flex-row justify-between">
              <Pressable
                className="bg-gray-400 px-4 py-2 rounded-lg"
                onPress={() => setRegisterVisible(false)}
              >
                <Text className="text-white font-bold">Cancel</Text>
              </Pressable>

              <Pressable
                className="bg-green-600 px-4 py-2 rounded-lg"
                onPress={handleRegister}
              >
                <Text className="text-white font-bold">Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>


    </View>
  );
}
