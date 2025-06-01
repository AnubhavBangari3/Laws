import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";

export default function RuleBased() {
  const [birthdate, setBirthdate] = useState("");
  const [height, setHeight] = useState("");
  const [religion, setReligion] = useState("");
  const [customReligion, setCustomReligion] = useState("");
  const [education, setEducation] = useState("");
  const [customEducation, setCustomEducation] = useState("");
  const [job, setJob] = useState("");
  const [customJob, setCustomJob] = useState("");
  const [interestsInput, setInterestsInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const handleAddInterest = () => {
    if (interestsInput.trim() && !interests.includes(interestsInput.trim())) {
      setInterests([...interests, interestsInput.trim()]);
      setInterestsInput("");
    }
  };

  const handleSubmit = async () => {
    const payload = {
      profile: 1, // Replace with actual user profile ID
      birthdate,
      height: parseFloat(height),
      religion,
      custom_religion: religion === "Other" ? customReligion : null,
      education,
      custom_education: education === "Other" ? customEducation : null,
      job,
      custom_job: job === "Other" ? customJob : null,
      interests,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/rule-based/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert("Success", "Rule-Based Profile Created!");
      } else {
        const error = await res.json();
        console.log("Error:", error);
        Alert.alert("Error", "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error.");
    }
  };

  return (
    <ScrollView className="w-full px-4 py-2">
      <Text className="text-xl font-semibold mb-2">Rule-Based Matching Form</Text>

      <Text className="mt-2">Birthdate (YYYY-MM-DD)</Text>
      <TextInput className="border p-2 rounded" value={birthdate} onChangeText={setBirthdate} />

      <Text className="mt-2">Height (in ft)</Text>
      <TextInput className="border p-2 rounded" value={height} onChangeText={setHeight} keyboardType="numeric" />

      <Text className="mt-2">Religion</Text>
      <TextInput className="border p-2 rounded" value={religion} onChangeText={setReligion} placeholder="Hindu / Muslim / Other" />
      {religion === "Other" && (
        <TextInput className="border p-2 rounded mt-1" value={customReligion} onChangeText={setCustomReligion} placeholder="Enter custom religion" />
      )}

      <Text className="mt-2">Education</Text>
      <TextInput className="border p-2 rounded" value={education} onChangeText={setEducation} placeholder="Bachelor's / PhD / Other" />
      {education === "Other" && (
        <TextInput className="border p-2 rounded mt-1" value={customEducation} onChangeText={setCustomEducation} placeholder="Enter custom education" />
      )}

      <Text className="mt-2">Job</Text>
      <TextInput className="border p-2 rounded" value={job} onChangeText={setJob} placeholder="Engineer / Artist / Other" />
      {job === "Other" && (
        <TextInput className="border p-2 rounded mt-1" value={customJob} onChangeText={setCustomJob} placeholder="Enter custom job" />
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
      <View className="flex-row flex-wrap mt-1">
        {interests.map((interest, index) => (
          <Text key={index} className="bg-gray-200 rounded px-2 py-1 mr-2 mb-2">
            {interest}
          </Text>
        ))}
      </View>

      <TouchableOpacity onPress={handleSubmit} className="bg-green-600 mt-4 p-3 rounded">
        <Text className="text-white text-center font-bold">Submit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
