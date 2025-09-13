import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  Image,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import Navbar from "./Navbar";

export default function FriendRequest() {
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (id: number) => {
  try {
    let accessToken;

    if (Platform.OS === "web") {
      accessToken = localStorage.getItem("access_token");
    } else {
      accessToken = await SecureStore.getItemAsync("access_token");
    }

    if (!accessToken) {
      Alert.alert("Error", "No access token found. Please login again.");
      return;
    }

    const response = await fetch(
      `http://127.0.0.1:8000/friend-request/${id}/cancel/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      Alert.alert("Success", "Friend request cancelled.");
      // Refresh the requests list
      fetchRequests();
    } else {
      const errorData = await response.json();
      Alert.alert("Error", errorData.detail || "Could not cancel request.");
    }
  } catch (error) {
    console.error("Cancel error:", error);
    Alert.alert("Error", "Something went wrong while cancelling.");
  }
};


  const fetchRequests = async () => {
    try {
      setLoading(true);
      let accessToken;

      if (Platform.OS === "web") {
        accessToken = localStorage.getItem("access_token");
      } else {
        accessToken = await SecureStore.getItemAsync("access_token");
      }

      if (!accessToken) {
        Alert.alert("Error", "No access token found. Please login again.");
        return;
      }

      // Fetch sent requests
      const sentRes = await fetch("http://127.0.0.1:8000/friend-request/sent/pending/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const sentData = await sentRes.json();

      // Fetch received requests
      const receivedRes = await fetch("http://127.0.0.1:8000/friend-request/receive/pending/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const receivedData = await receivedRes.json();

      setSentRequests(sentData);
      setReceivedRequests(receivedData);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Alert.alert("Error", "Could not fetch friend requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: number) => {
    Alert.alert("Accept", `Friend request ${id} accepted.`);
    // TODO: call your backend accept API
  };

  const handleReject = async (id: number) => {
    Alert.alert("Reject", `Friend request ${id} rejected.`);
    // TODO: call your backend reject API
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Navbar />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="blue" />
          <Text className="mt-2">Loading friend requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Navbar />
      <ScrollView className="p-4">
        {/* Sent Requests Section */}
        <Text className="text-2xl font-bold mb-3">Sent Requests</Text>
        {sentRequests.length > 0 ? (
          sentRequests.map((req) => (
            <View
              key={req.id}
              className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-2"
            >
              <Image
                source={{ uri: req.receiver?.pp }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="text-lg font-semibold">{req.receiver?.profile_name}</Text>
                <Text className="text-sm text-gray-500">{req.receiver?.email}</Text>
              </View>
              <TouchableOpacity
                className="bg-red-500 px-3 py-1 rounded-lg"
                onPress={() => handleCancel(req.id)}
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text className="text-gray-500">No pending sent requests.</Text>
        )}

        {/* Received Requests Section */}
        <Text className="text-2xl font-bold mt-6 mb-3">Received Requests</Text>
        {receivedRequests.length > 0 ? (
          receivedRequests.map((req) => (
            <View
              key={req.id}
              className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-2"
            >
              <Image
                source={{ uri: req.sender?.pp }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="text-lg font-semibold">{req.sender?.profile_name}</Text>
                <Text className="text-sm text-gray-500">{req.sender?.email}</Text>
              </View>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  className="bg-green-500 px-3 py-1 rounded-lg mr-2"
                  onPress={() => handleAccept(req.id)}
                >
                  <Text className="text-white">Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-500 px-3 py-1 rounded-lg"
                  onPress={() => handleReject(req.id)}
                >
                  <Text className="text-white">Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-gray-500">No pending received requests.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
