import { View, Text, Image, ActivityIndicator, ScrollView, Alert, Pressable, Platform, TouchableOpacity, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import Navbar from './Navbar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

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

  // --- Edit Mode States (NEW) ---
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [about, setAbout] = useState('');

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

  useEffect(() => {
    if (editing && profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setEmail(profile.email);
      setAbout(profile.about);
    }
  }, [editing]);

  const handleProfilePicturePress = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need permission to access your gallery.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        await uploadProfilePicture(selectedAsset);
      }

    } catch (error) {
      console.error('Image Picker Error:', error);
      Alert.alert('Error', 'Something went wrong while picking the image.');
    }
  };

  const uploadProfilePicture = async (selectedImage: { uri: string; type?: string; fileName?: string; }) => {
    try {
      const formData = new FormData();
      const fileName = selectedImage.fileName || selectedImage.uri.split('/').pop() || `profile_${Date.now()}`;
      const fileType = selectedImage.type || `image/${fileName.split('.').pop()}`;

      if (Platform.OS === 'web') {
        const response = await fetch(selectedImage.uri);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: fileType });
        formData.append('pp', file);
      } else {
        formData.append('pp', {
          uri: selectedImage.uri,
          name: fileName,
          type: fileType,
        } as any);
      }

      const accessToken = Platform.OS === 'web'
        ? localStorage.getItem('access_token')
        : await SecureStore.getItemAsync('access_token');

      const responseUpload = await fetch("http://127.0.0.1:8000/profile/picture", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!responseUpload.ok) {
        const errorData = await responseUpload.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await responseUpload.json();
      console.log("Profile Picture Updated Successfully:", data);

      Alert.alert('Success', 'Profile picture updated!');
      fetchProfile(); 
    } catch (error: any) {
      console.error('Upload Error:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture.');
    }
  };

  const handleSaveProfile = async () => {

    const formData = new FormData();
  formData.append('first_name', firstName);
  formData.append('last_name', lastName);
  formData.append('email', email);
  formData.append('about', about);
    try {
      const accessToken = Platform.OS === 'web'
        ? localStorage.getItem('access_token')
        : await SecureStore.getItemAsync('access_token');

      const response = await fetch("http://127.0.0.1:8000/profile", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          //"Content-Type": "application/json",
        },
        body:formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update profile.');
      }

      const updatedData = await response.json();
      console.log('Profile updated:', updatedData);

      setEditing(false);
      fetchProfile();
      Alert.alert('Success', 'Profile updated!');
    } catch (error: any) {
      console.error('Update Error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile.');
    }
  };

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
        <View className="items-center mt-6 px-4">

          {/* Profile Picture */}
          <TouchableOpacity onPress={handleProfilePicturePress} className="relative">
            <Image
              source={{ uri: `http://127.0.0.1:8000${profile.pp}` }}
              className="w-32 h-32 rounded-full border-4 border-yellow-400"
              resizeMode="cover"
            />
            <View className="absolute bottom-0 right-0 bg-yellow-400 p-2 rounded-full">
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>

          {editing ? (
            <>
              {/* Editable fields */}
              <View className="w-full px-6 mt-4">
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First Name"
                  className="border-b border-gray-400 my-2 py-2"
                />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last Name"
                  className="border-b border-gray-400 my-2 py-2"
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  keyboardType="email-address"
                  className="border-b border-gray-400 my-2 py-2"
                />
                <TextInput
                  value={about}
                  onChangeText={setAbout}
                  placeholder="About You"
                  multiline
                  className="border-b border-gray-400 my-2 py-2"
                />

                <Pressable
                  onPress={handleSaveProfile}
                  className="mt-6 bg-yellow-400 py-3 rounded-full"
                >
                  <Text className="text-center text-white font-bold text-lg">Save</Text>
                </Pressable>

                <Pressable
                  onPress={() => setEditing(false)}
                  className="mt-2 py-3"
                >
                  <Text className="text-center text-gray-500">Cancel</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              {/* Normal View */}
              <Text className="text-2xl font-bold mt-4 my-2">{profile.profile_name}</Text>
              <Text className="text-gray-500">{profile.email}</Text>

              <View className="flex-row justify-center items-center gap-2 my-4">
                  <Pressable
                    onPress={() => router.push("/connect")}
                    className="bg-yellow-400 px-4 py-3 rounded-full shadow-md"
                  >
                    <Text className="text-white font-bold text-center">Connect</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setEditing(true)}
                    className="bg-yellow-400 px-4 py-3 rounded-full shadow-md"
                  >
                    <Text className="text-white font-bold text-center">Edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push("/")}
                    className="bg-yellow-400 px-4 py-3 rounded-full shadow-md"
                  >
                    <Text className="text-white font-bold text-center">Vision</Text>
                  </Pressable>
              </View>

            </>
          )}
        </View>

        {/* Stats */}
        {!editing && (
          <View className="flex-row justify-around items-center mt-8 mx-6 bg-white py-4 rounded-lg shadow-md">
            <View className="items-center">
              <Text className="text-xl font-bold">{profile.num_connections}</Text>
              <Text className="text-gray-600">Followers</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold">0</Text>
              <Text className="text-gray-600">Posts</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold">0</Text>
              <Text className="text-gray-600">Following</Text>
            </View>
          </View>
        )}

        {/* About Section */}
        {!editing && (
          <View className="bg-white mt-6 mx-6 p-4 rounded-lg shadow-md">
            <Text className="text-lg font-semibold mb-2">About</Text>
            <Text className="text-gray-700 leading-relaxed">
              {profile.about || "No description provided."}
            </Text>
          </View>
        )}
      </ScrollView>
      <View>
        <Text className="text-lg font-semibold mb-2">Recent Activities</Text>
      </View>
    </View>
  );
}
