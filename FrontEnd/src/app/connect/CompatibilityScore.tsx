import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store"; // for mobile token storage

export default function CompatibilityScore() {
  const [form, setForm] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // 🔁 Fetch Questions from Backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token =
          Platform.OS === "web"
            ? localStorage.getItem("access_token")
            : await SecureStore.getItemAsync("access_token");

        const res = await fetch("http://127.0.0.1:8000/api/personality-questions/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setQuestions(data);

          // initialize form state dynamically
          const initialFormState = {};
          data.forEach((q) => {
            initialFormState[q.question_id] = "";
          });
          setForm(initialFormState);
        } else {
          console.error(data);
          Alert.alert("Error", "Unable to fetch questions.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Something went wrong while fetching questions.");
      }
    };

    fetchQuestions();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Submit logic here
    setLoading(false);
  };

  return (
    <ScrollView className="bg-white rounded-xl p-4 shadow-md">
      <Text className="text-xl font-bold text-center mb-4 text-purple-700">
        🧠 Discover Your MBTI Personality
      </Text>

      {questions.map((q) => (
        <View key={q.id} className="mb-3">
          <Text className="font-semibold mb-1">{q.question_text}</Text>
          <TextInput
            multiline
            className="border border-gray-300 p-2 rounded-md text-sm bg-gray-50"
            value={form[q.question_id]}
            onChangeText={(text) => handleChange(q.question_id, text)}
          />
        </View>
      ))}

      {loading ? (
        <ActivityIndicator size="large" color="purple" className="mt-4" />
      ) : (
        <Pressable
          className="bg-purple-600 py-3 rounded-full mt-4"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-center">
            Submit & Get MBTI Type
          </Text>
        </Pressable>
      )}

      {result && (
        <View className="mt-6 items-center">
          <Text className="text-lg font-semibold text-green-600">
            🎉 Your MBTI Type: <Text className="text-xl">{result}</Text>
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
