import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,Modal,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import Navbar from "../Navbar";

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

export default function Matchmaking() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<ProfileType | null>(null);


  const [selectedUser, setSelectedUser] = useState(null); // match.profile_username
  const [matchScore, setMatchScore] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

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
    
  useEffect(() => {
    fetchProfile();
  }, []);

  console.log("profile:",profile)

  const getCompatibilityLevel = (score: number | null): string => {
  if (score === null) return "";

  if (score < 10) return "COMPLEX";
  if (score >= 15 && score <= 30) return "MEANINGFUL";
  if (score >= 40 && score <= 50) return "POWERFUL";
  if (score > 50 && score <= 80) return "EXTRAORDINARY";
  if (score > 80) return "SOULMATE";

  return "CHALLENGING"; // fallback for anything in-between
};

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const token =
        Platform.OS === "web"
          ? localStorage.getItem("access_token")
          : await SecureStore.getItemAsync("access_token");

      const res = await fetch("http://127.0.0.1:8000/rulebased/all/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch matches");

      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not fetch matches.");
    } finally {
      setLoading(false);
    }
  };

  console.log("matches:",matches)

  const handleMatchScoreCheck = async (slug, matchUsername) => {
  try {
    const token =
      Platform.OS === "web"
        ? localStorage.getItem("access_token")
        : await SecureStore.getItemAsync("access_token");

    const res = await fetch(`http://127.0.0.1:8000/match-score/${slug}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch score");

    const data = await res.json();
    
    setMatchScore(data.match_score);
    setSelectedUser(matchUsername);
    setModalVisible(true);
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Could not fetch matching score.");
  }
};


  // ✅ Automatically fetch on page load
  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <ScrollView className="bg-white">
      <Navbar />
      <View className="items-center px-4 py-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-blue-500 underline">← Back to Profile</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-pink-600 mb-2">
          💘 Matchmaking Center
        </Text>
        <Text className="text-base text-center mb-4 text-gray-700">
          Let us find your best match based on your Rule-Based Profile!
        </Text>

     

        {loading && <ActivityIndicator size="large" color="pink" />}
        {!loading && matches.length > 0 && (
          <View className="w-full">
            <Text className="text-xl font-semibold mb-4 text-left">
              🎯 Suggestions for You
            </Text>
            {matches.map((match) => (
              <View
                key={match.id}
                className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-4 shadow"
              >
                <Image
                  source={{ uri: `${match.pp}` }}
                  className="w-16 h-16 rounded-full border-2 border-pink-400"
                />
                <View className="flex-1 ml-4">
                  <Text className="font-bold text-lg text-gray-800">
                    @{match.profile_username}
                  </Text>
                   <Text className="text-sm text-gray-600">
                    {match.gender}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    🎓 {match.education} • 🛐 {match.religion}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    💼 {match.job} • 📅 {match.birthdate}
                  </Text>
                </View>
                 {/* 👇 Show interests here */}
                <View className="flex-row flex-wrap mt-1">
                  {match.interest_objects?.map((interest) => (
                    <Text
                      key={interest.id}
                      className="text-xs bg-pink-100 text-pink-800 px-2 py-1 mr-2 mb-2 rounded-full"
                    >
                      {interest.name}
                    </Text>
                  ))}
                </View>
                <TouchableOpacity
                  className="bg-pink-500 px-3 py-1 rounded-xl"
                  onPress={() => Alert.alert("Connect Request Sent!")}
                >
                  <Text className="text-white font-semibold">🤝 Connect</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="bg-pink-500 px-3 py-1 rounded-xl"
                  onPress={() => handleMatchScoreCheck(match.slug, match.profile_username)}
                >
                  <Text className="text-white font-semibold">Matching score</Text> 
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View className="flex-1 justify-center items-center bg-black bg-opacity-60">
    <View className="bg-white w-10/12 p-6 rounded-xl items-center shadow-lg">
      <Text className="text-lg font-bold text-purple-800 mb-2">🎯 Matching Score</Text>
      
      <View className="flex-row justify-between w-full px-4 mb-2">
        <Text className="text-sm font-semibold text-gray-600">@{profile?.profile_name || "..."}</Text>
        <Text className="text-sm font-semibold text-gray-600">@{selectedUser}</Text>
      </View>

      <Text className="text-lg font-semibold text-purple-600 mt-2">
        Compatibility Level: {getCompatibilityLevel(matchScore)}
      </Text>
      
      <Text className="text-gray-700 text-center mt-2">
        This score reflects how well your profiles align.
      </Text>

      <TouchableOpacity
        className="mt-6 bg-purple-600 px-6 py-2 rounded-xl"
        onPress={() => setModalVisible(false)}
      >
        <Text className="text-white font-semibold">Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


    </ScrollView>
    
  );
}
