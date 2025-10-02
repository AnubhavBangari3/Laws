import { View, Text, Image, ActivityIndicator, ScrollView, Alert, Pressable, Platform, TouchableOpacity, TextInput,FlatList } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import Navbar from './Navbar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';


import { Dimensions } from "react-native";


import Modal from "react-native-modal";

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

  const [postCount, setPostCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Vision Board States
const [isVisionModalVisible, setIsVisionModalVisible] = useState(false);
const [visionItems, setVisionItems] = useState<{ id: number; text: string; uri: string }[]>([]);
const [visionText, setVisionText] = useState('');
const screenWidth = Dimensions.get("window").width;
const [selectedVision, setSelectedVision] = useState<{ uri: string, text: string } | null>(null);
// Add state at top
const [isVisionBoardModalVisible, setIsVisionBoardModalVisible] = useState(false);



const openVisionItemModal = (item: any) => {
  setSelectedVision(item);
};

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
const getAccessToken = async () => {
  return Platform.OS === 'web'
    ? localStorage.getItem('access_token')
    : await SecureStore.getItemAsync('access_token');
};

const handlePostVisionItems = async () => {
  if (visionItems.length === 0) {
    Alert.alert("No Vision Items", "Please add at least one vision item before posting.");
    return;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) return Alert.alert("Error", "No access token found.");

  const formData = new FormData();

  if (Platform.OS === 'web') {
    await Promise.all(
      visionItems.map(async (item, index) => {
        formData.append(`text_${index}`, item.text);
        const res = await fetch(item.uri);
        const blob = await res.blob();
        const file = new File([blob], `vision_${Date.now()}_${index}.jpg`, { type: blob.type });
        formData.append(`image_${index}`, file);
      })
    );
  } else {
    visionItems.forEach((item, index) => {
      formData.append(`text_${index}`, item.text);
      formData.append(`image_${index}`, {
        uri: item.uri,
        name: `vision_${Date.now()}_${index}.jpg`,
        type: 'image/jpeg',
      } as any);
    });
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/vision/", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Alert.alert("Error", JSON.stringify(errorData));
    }

    // ✅ Clear the vision modal state after successful post
    setVisionItems([]);
    setVisionText('');
    setIsVisionModalVisible(false);

    Alert.alert("Success", "Your vision items have been posted!");
    
    // ✅ Refresh the main Vision Board separately (for viewing)
    fetchVisionBoardItems();
    
  } catch (error: any) {
    console.error("Post Vision Error:", error);
    Alert.alert("Error", error.message || "Failed to post vision items.");
  }
};


  const fetchFollowingCount = async (profileId?: number) => {
  try {
    const accessToken = Platform.OS === 'web'
      ? localStorage.getItem('access_token')
      : await SecureStore.getItemAsync('access_token');

    let url = "http://127.0.0.1:8000/profile/following-count/";
    if (profileId) {
      url = `http://127.0.0.1:8000/profile/${profileId}/following-count/`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch following count");
    }

    const data = await response.json();
    console.log("Following Count:", data);
    setFollowingCount(data.following_count);
  } catch (error) {
    console.error("Fetch Following Count Error:", error);
  }
};

const handleAddVisionItem = async () => {
  try {
    // Pick Image
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
      const selectedUri = result.assets[0].uri;
      const newItem = {
        id: Date.now(),
        text: visionText,
        uri: selectedUri,
      };
      setVisionItems(prev => [...prev, newItem]);
      setVisionText('');
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Something went wrong while adding the vision item.");
  }
};


  useEffect(() => {
    fetchVisionBoardItems();
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

const fetchUserPostsCount = async (profileId: number) => {
  try {
    const accessToken = Platform.OS === 'web'
      ? localStorage.getItem('access_token')
      : await SecureStore.getItemAsync('access_token');

    const response = await fetch("http://127.0.0.1:8000/blogs/", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch blogs");
    }

    const blogs = await response.json();
    console.log("blogs:", blogs);

    // ✅ Fix: compare blog.author directly with profileId
    const count = blogs.filter((blog: any) => blog.author === profileId).length;
    setPostCount(count);

  } catch (error) {
    console.error("Fetch Blogs Error:", error);
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
    console.log("Vison data:",data);
    // Map API data to match your visionItems format
    const formatted = data.map((item: any) => ({
      id: item.id,
      text: item.text,
      uri: item.image,
    }));
    setVisionItems(formatted);
  } catch (error: any) {
    console.error("Fetch Vision Items Error:", error);
    Alert.alert("Error", error.message || "Could not fetch vision items.");
  }
};


  useEffect(() => {
  if (profile) {
    fetchUserPostsCount(profile.id);
     fetchFollowingCount(profile.id);
  }
}, [profile]);

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
                    onPress={() => setIsVisionModalVisible(true)}
                    className="bg-yellow-400 px-4 py-3 rounded-full shadow-md"
                  >
                    <Text className="text-white font-bold text-center">Vision</Text>
                  </Pressable>

                  <Pressable
                  onPress={() => setIsVisionBoardModalVisible(true)}
                  className="bg-yellow-400 px-4 py-3 rounded-full shadow-md"
                >
                  <Text className="text-white font-bold text-center">View Vision Boards</Text>
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
              <Text className="text-xl font-bold">{postCount}</Text>
              <Text className="text-gray-600">Posts</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold">{followingCount}</Text>
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


<Modal
  isVisible={isVisionModalVisible}
  onBackdropPress={() => setIsVisionModalVisible(false)}
  style={{ margin: 0 }}
>
  <View className="flex-1 bg-white p-4 rounded-lg">
    <Text className="text-xl font-bold mb-4">Add Vision Item</Text>

    {/* Vision Text Input */}
    <TextInput
      value={visionText}
      onChangeText={setVisionText}
      placeholder="Enter your vision"
      className="border-b border-gray-400 mb-4 py-2 px-2"
    />

    {/* Show Add Image button only if visionText is not empty */}
    {visionText.trim().length > 0 && (
      <Pressable
        onPress={handleAddVisionItem}
        className="bg-yellow-400 py-3 rounded-full mb-4"
      >
        <Text className="text-center text-white font-bold">Pick Image & Add</Text>
      </Pressable>
    )}

    {/* Show Added Vision Items */}
    <FlatList
      data={visionItems}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View className="flex-row items-center mb-2">
          <Image
            source={{ uri: item.uri }}
            style={{ width: 50, height: 50, borderRadius: 8, marginRight: 10 }}
          />
          <Text className="flex-1">{item.text}</Text>
        </View>
      )}
      ListEmptyComponent={
        <Text className="text-gray-500 text-center mt-4">
          No vision items added yet.
        </Text>
      }
    />

    {/* Post Vision Items Button */}
    <Pressable
  onPress={handlePostVisionItems} // No extra setVisionItems here
  className="bg-green-500 py-3 rounded-full mt-4"
>
  <Text className="text-center text-white font-bold">Post Vision Items</Text>
</Pressable>

    {/* Close Modal */}
    <Pressable
      onPress={() => setIsVisionModalVisible(false)}
      className="mt-4 py-3"
    >
      <Text className="text-center text-gray-500">Close</Text>
    </Pressable>
  </View>
</Modal>

     <Modal
  isVisible={isVisionBoardModalVisible}
  onBackdropPress={() => setIsVisionBoardModalVisible(false)}
  style={{ margin: 0 }}
>
  <View className="flex-1 bg-white p-4 rounded-lg">
    <Text className="text-xl font-bold mb-4">Vision Boards</Text>

    <FlatList
      data={visionItems}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => openVisionItemModal(item)}
          style={{
            width: (screenWidth - 48) / 2,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#f3f3f3',
          }}
        >
          {/* Image */}
          <View style={{ width: '100%', aspectRatio: 1 }}>
            <Image
              source={{ uri: item.uri }}   // ✅ Corrected property
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          {/* Caption */}
          <View style={{ padding: 8, backgroundColor: '#fff' }}>
            <Text
              style={{ textAlign: 'center', fontSize: 14, color: '#374151' }}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {item.text}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text className="text-gray-500 text-center mt-4">
          No vision board items yet.
        </Text>
      }
    />

    <Pressable
      onPress={() => setIsVisionBoardModalVisible(false)}
      className="mt-4 py-3"
    >
      <Text className="text-center text-gray-500">Close</Text>
    </Pressable>
  </View>
</Modal>



    
     
    </View>
  );
}
