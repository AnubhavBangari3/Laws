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
  const [isEditMode, setIsEditMode] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/personality-answers/bulk/";

useEffect(() => {
  const fetchData = async () => {
    try {
      const token =
        Platform.OS === "web"
          ? localStorage.getItem("access_token")
          : await SecureStore.getItemAsync("access_token");

      // 1. Fetch Questions
      const questionRes = await fetch(
        "http://127.0.0.1:8000/api/personality-questions/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const questionData = await questionRes.json();

      if (!questionRes.ok) {
        Alert.alert("Error", "Unable to fetch questions.");
        return;
      }

      setQuestions(questionData);

      // 2. Fetch Existing Answers
      const answerRes = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const answerData = await answerRes.json();

      // Create initial form state with empty values
      const initialFormState = {};
      questionData.forEach((q) => {
        initialFormState[q.id] = "";
      });

      // Merge with existing answers if they exist
      if (answerRes.ok && answerData.answers && Array.isArray(answerData.answers)) {
        const newFormState = { ...initialFormState };
        
        answerData.answers.forEach((a) => {
          // Use a.question.id instead of a.question_id if that's how it's structured
          const questionId = a.question?.id || a.question_id;
          if (questionId in newFormState) {
            newFormState[questionId] = a.answer;
          }
        });

        setForm(newFormState);
        setIsEditMode(true);
        setResult(answerData.predicted_mbti || "");
      } else {
        setForm(initialFormState);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Something went wrong while loading data.");
    }
  };

  fetchData();
}, []);



  const handleChange = (key, value) => {
    setForm((prevForm) => ({ ...prevForm, [key]: value }));
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

      // Save answers
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
        return;
      }

      // Get prediction
      const getRes = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resultData = await getRes.json();

      if (getRes.ok && resultData.predicted_mbti) {
        setResult(resultData.predicted_mbti);
      } else {
        Alert.alert("Note", resultData?.error || "Answers saved but no MBTI result.");
      }

      setIsEditMode(true);
    } catch (err) {
      console.error("Submit Error:", err);
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
            value={form[q.id] || ""}
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
            {isEditMode ? "Edit & Update Answers" : "Submit & Get MBTI Type"}
          </Text>
        </Pressable>
      )}

      {result ? (
        <View className="mt-6 items-center">
          <Text className="text-lg font-semibold text-green-600">
            🎉 Your MBTI Type: <Text className="text-xl">{result}</Text>
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
