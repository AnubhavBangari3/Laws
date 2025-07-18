import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Picker } from "@react-native-picker/picker";

import { useRouter } from "expo-router";

const RELIGION_CHOICES = ["Hindu", "Muslim", "Christian", "Sikh", "Agnostic", "Other"];
const EDUCATION_CHOICES = ["High School", "Bachelor's", "Master's", "PhD", "Other"];
const JOB_CHOICES = ["Engineer", "Doctor", "Teacher", "Artist", "Business", "Actor", "Model", "Lawyer", "Other"];
const GENDER_CHOICES = ["Male", "Female", "Others"];

export default function RuleBased() {
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const router = useRouter();

  const [pp,setPP] =useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [height, setHeight] = useState("");
  const [religion, setReligion] = useState("");
  const [customReligion, setCustomReligion] = useState("");
  const [education, setEducation] = useState("");
  const [customEducation, setCustomEducation] = useState("");
  const [job, setJob] = useState("");
  const [customJob, setCustomJob] = useState("");
  const [interestsInput, setInterestsInput] = useState("");
  const [interests, setInterests] = useState<{ id: number; name: string }[]>([]);

  const fetchProfile = async () => {
    const accessToken =
      Platform.OS === "web"
        ? localStorage.getItem("access_token")
        : await SecureStore.getItemAsync("access_token");

    try {
      const res = await fetch("http://127.0.0.1:8000/rulebased/view/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        //console.log("data m:",data);
        setProfileExists(true);
        setPP(data.pp);
        setBirthdate(data.birthdate);
        setHeight(data.height.toString());
        setReligion(data.religion);
        setEducation(data.education);
        setJob(data.job);
        setGender(data.gender);

        if (data.religion === "Other") setCustomReligion(data.custom_religion || "");
        if (data.education === "Other") setCustomEducation(data.custom_education || "");
        if (data.job === "Other") setCustomJob(data.custom_job || "");

        if (Array.isArray(data.interest_objects)) {
          setInterests(data.interest_objects);
        } else if (Array.isArray(data.interests)) {
          setInterests(data.interests.map((name, index) => ({ id: index, name })));
        } else {
          setInterests([]);
        }
      } else {
        setProfileExists(false);
      }
    } catch (err) {
      console.error("Error fetching profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    fetchProfile();
  }, []);



  const handleAddInterest = () => {
    const trimmed = interestsInput.trim();
    if (trimmed && !interests.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) {
      setInterests([...interests, { id: Date.now(), name: trimmed }]);
      setInterestsInput("");
    }
  };

  const handleSubmit = async () => {
    const accessToken =
      Platform.OS === "web"
        ? localStorage.getItem("access_token")
        : await SecureStore.getItemAsync("access_token");

    const payload = {
      gender,
      birthdate,
      height: parseFloat(height),
      religion,
      custom_religion: religion === "Other" ? customReligion : null,
      education,
      custom_education: education === "Other" ? customEducation : null,
      job,
      custom_job: job === "Other" ? customJob : null,
      interests: interests.map((i) => i.name), // convert to string array
    };

    const url = profileExists && editMode
      ? "http://127.0.0.1:8000/rulebased/update/"
      : "http://127.0.0.1:8000/rulebased/create/";

    const method = profileExists && editMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert("Success", `Rule-Based Profile ${editMode ? "Updated" : "Created"}!`);
        setEditMode(false);
        setProfileExists(true);
        fetchProfile();
      } else {
        const error = await res.json();
        Alert.alert("Error", JSON.stringify(error));
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error.");
    }
  };

  const handleRemoveInterest = async (interestId: number) => {
    const accessToken =
      Platform.OS === "web"
        ? localStorage.getItem("access_token")
        : await SecureStore.getItemAsync("access_token");

    try {
      const deleteRes = await fetch(
        `http://127.0.0.1:8000/rulebased/delete/${interestId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (deleteRes.ok) {
        setInterests(interests.filter((i) => i.id !== interestId));
      } else {
        const errorData = await deleteRes.json();
        console.error("Delete failed:", errorData);
        Alert.alert("Error", "Failed to remove interest.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error while removing interest.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4B9CD3" />
      </View>
    );
  }

  if (profileExists && !editMode) {
    return (
      <View className="w-full px-4">
        <Text className="text-xl font-bold mb-2">Your Rule-Based Profile</Text>
        <Image
                      source={{ uri: `${pp}` }}
                      className="w-32 h-32 rounded-full border-4 border-yellow-400"
                      resizeMode="cover"
                    />
        <Text>📅 Birthdate: {birthdate}</Text>
        <Text>Gender  {gender}</Text>

        <Text>📏 Height: {height} ft</Text>
        <Text>🛐 Religion: {religion === "Other" ? customReligion : religion}</Text>
        <Text>🎓 Education: {education === "Other" ? customEducation : education}</Text>
        <Text>💼 Job: {job === "Other" ? customJob : job}</Text>
        <View className="flex-row flex-wrap mt-2">
          {interests.map((interest) => (
            <TouchableOpacity
              key={interest.id}
              onPress={() => handleRemoveInterest(interest.id)}
              className="bg-gray-200 rounded px-2 py-1 mr-2 mb-2"
            >
              <Text>{interest.name} ×</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setEditMode(true)}
          className="bg-blue-500 mt-4 p-3 rounded"
        >
          <Text className="text-white text-center font-bold">Edit Profile</Text>
        </TouchableOpacity>


        <TouchableOpacity
          onPress={() => router.push("/connect/matchmaking")} 
          className="bg-pink-500 mt-6 mx-2 p-4 rounded-2xl shadow-lg shadow-pink-300 mb-10"
        >
          <Text className="text-white text-center text-lg font-extrabold tracking-wide">
            💖 Vibe check
          </Text>
        </TouchableOpacity>


      </View>
    );
  }

  return (
    <ScrollView className="w-full px-4 py-2">
      <Text className="text-xl font-semibold mb-2">
        {editMode ? "Edit" : "Create"} Rule-Based Profile
      </Text>

      <Text className="mt-2">Birthdate (YYYY-MM-DD)</Text>
      <TextInput
        className="border p-2 rounded"
        value={birthdate}
        onChangeText={setBirthdate}
        placeholder="1990-01-01"
      />

      <Text className="mt-2">Height (in ft)</Text>
      <TextInput
        className="border p-2 rounded"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        placeholder="5.8"
      />

      <Text className="mt-2">Gender</Text>
<View className="border rounded">
  <Picker selectedValue={gender} onValueChange={setGender}>
    <Picker.Item label="Select gender" value="" />
    {GENDER_CHOICES.map((g) => (
      <Picker.Item key={g} label={g} value={g} />
    ))}
  </Picker>
</View>

      <Text className="mt-2">Religion</Text>
      <View className="border rounded">
        <Picker selectedValue={religion} onValueChange={setReligion}>
          <Picker.Item label="Select religion" value="" />
          {RELIGION_CHOICES.map((r) => (
            <Picker.Item key={r} label={r} value={r} />
          ))}
        </Picker>
      </View>
      {religion === "Other" && (
        <TextInput
          className="border p-2 rounded mt-1"
          value={customReligion}
          onChangeText={setCustomReligion}
          placeholder="Enter custom religion"
        />
      )}

      <Text className="mt-2">Education</Text>
      <View className="border rounded">
        <Picker selectedValue={education} onValueChange={setEducation}>
          <Picker.Item label="Select education" value="" />
          {EDUCATION_CHOICES.map((e) => (
            <Picker.Item key={e} label={e} value={e} />
          ))}
        </Picker>
      </View>
      {education === "Other" && (
        <TextInput
          className="border p-2 rounded mt-1"
          value={customEducation}
          onChangeText={setCustomEducation}
          placeholder="Enter custom education"
        />
      )}

      <Text className="mt-2">Job</Text>
      <View className="border rounded">
        <Picker selectedValue={job} onValueChange={setJob}>
          <Picker.Item label="Select job" value="" />
          {JOB_CHOICES.map((j) => (
            <Picker.Item key={j} label={j} value={j} />
          ))}
        </Picker>
      </View>
      {job === "Other" && (
        <TextInput
          className="border p-2 rounded mt-1"
          value={customJob}
          onChangeText={setCustomJob}
          placeholder="Enter custom job"
        />
      )}

      <Text className="mt-2">Interests</Text>
      <View className="flex-row items-center">
        <TextInput
          className="border flex-1 p-2 rounded mr-2"
          value={interestsInput}
          onChangeText={setInterestsInput}
          placeholder="e.g., Gym"
        />
        <TouchableOpacity onPress={handleAddInterest} className="bg-blue-500 px-3 py-2 rounded">
          <Text className="text-white">Add</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap mt-2">
        {interests.map((interest) => (
          <TouchableOpacity
            key={interest.id}
            onPress={() => handleRemoveInterest(interest.id)}
            className="bg-gray-200 rounded px-2 py-1 mr-2 mb-2"
          >
            <Text>{interest.name} ×</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleSubmit} className="bg-green-600 mt-4 p-3 rounded">
        <Text className="text-white text-center font-bold">Submit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
