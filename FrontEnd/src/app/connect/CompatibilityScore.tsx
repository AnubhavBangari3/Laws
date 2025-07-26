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
import * as SecureStore from "expo-secure-store";

export default function CompatibilityScore() {
  const [form, setForm] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const API_URL = "http://127.0.0.1:8000/api/personality-answers/bulk/";

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

          // Fix: Use correct question ID key
          const initialFormState = {};
          data.forEach((q) => {
            initialFormState[q.id] = "";
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
    setResult("");

    try {
      const token =
        Platform.OS === "web"
          ? localStorage.getItem("access_token")
          : await SecureStore.getItemAsync("access_token");

      const answers = Object.entries(form).map(([question_id, answer]) => ({
        question_id: Number(question_id),
        answer,
      }));

      console.log("answers:", answers);

      const saveRes = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json();
        console.error("Save Error:", errorData);
        Alert.alert("Error", "Failed to save answers.");
        setLoading(false);
        return;
      }

      // 🔁 GET MBTI Prediction (if implemented on backend)
      const getRes = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resultData = await getRes.json();

      if (getRes.ok) {
        setResult(resultData.predicted_mbti);
      } else {
        console.error("Prediction Error:", resultData);
        Alert.alert("Error", resultData.error || "Failed to get MBTI result.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
            value={form[q.id]}
            onChangeText={(text) => handleChange(q.id, text)}
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

      {result ? (
        <View className="mt-6 items-center">
          <Text className="text-lg font-semibold text-green-600">
            🎉 Your MBTI Type: {result}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
