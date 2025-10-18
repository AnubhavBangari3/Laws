import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import * as SecureStore from "expo-secure-store";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

interface VisionItem {
  id: number;
  text: string;
  uri: string;
  unlocked?: boolean;
}

interface UniversalLaw {
  id: number;
  title: string;
  meaning: string;
  example: string;
}

interface VisionBoardOrderItem {
  id: number;
  profile: number;
  vision_item: VisionItem;
  order_date: string;
  order_delivered: boolean;
  created_at: string;
}

export default function UniversalLawsPage() {
  const [visions, setVisions] = useState<VisionItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [manifestDate, setManifestDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [manifestModalVisible, setManifestModalVisible] = useState(false);
  const [selectedVision, setSelectedVision] = useState<VisionItem | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [visionOrders, setVisionOrders] = useState<VisionBoardOrderItem[]>([]);

  // 🔑 Token getter
  const getAccessToken = async () => {
    return Platform.OS === "web"
      ? localStorage.getItem("access_token")
      : await SecureStore.getItemAsync("access_token");
  };

  // 🧭 Fetch Orders
  const fetchVisionBoardOrders = async () => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const response = await fetch("http://127.0.0.1:8000/visionordebookr/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to fetch vision board orders");
      }

      const data = await response.json();
      console.log("data ordered:", data);
      setVisionOrders(data);
    } catch (error: any) {
      console.error("Fetch Vision Board Orders Error:", error);
      Alert.alert(
        "Error",
        error.message || "Could not fetch vision board orders."
      );
    }
  };

  // 🖼️ Fetch Vision Items
  const fetchVisionBoardItems = async () => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const response = await fetch("http://127.0.0.1:8000/visionget/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        
        throw new Error(data.detail || "Failed to fetch vision items");
      }

      const data = await response.json();
      
      const formatted = data.map((item: any) => ({
        id: item.id,
        text: item.text,
        uri: item.image,
        unlocked: false,
      }));
      console.log("all visions:",formatted)
      setVisions(formatted);
    } catch (error: any) {
      console.error("Fetch Vision Items Error:", error);
      Alert.alert("Error", error.message || "Could not fetch vision items.");
    }
  };

  useEffect(() => {
    fetchVisionBoardOrders();
    fetchVisionBoardItems();
  }, []);

  const shuffleVisions = () => {
    setVisions((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const openManifestationModal = (vision: VisionItem) => {
    setSelectedVision(vision);
    setOrderPlaced(false);
    setManifestDate(null);
    setManifestModalVisible(true);
  };

// 🗓️ Open Date Picker
const openDatePicker = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // ✅ only future date (not today)

  if (Platform.OS === "android") {
    DateTimePickerAndroid.open({
      value: manifestDate || tomorrow,
      mode: "date",
      minimumDate: tomorrow, // ✅ block past & today
      onChange: (event, date) => {
        if (event.type === "set" && date) setManifestDate(date);
      },
    });
  } else {
    setShowDatePicker(true);
  }
};


  // 🌍 Universal Laws List
  const universalLaws: UniversalLaw[] = [
    { id: 1, title: "Law of Divine Oneness", meaning: "Everything in the universe is connected. Every thought and action affects the collective whole.", example: "Sending love raises not only your vibration but also others'." },
    { id: 2, title: "Law of Vibration", meaning: "Everything vibrates at a frequency — thoughts, emotions, and matter.", example: "Feeling gratitude attracts more experiences that match that vibration." },
    { id: 3, title: "Law of Attraction", meaning: "Like attracts like — what you focus on expands.", example: "Thinking ‘I always meet kind people’ attracts kindness in your reality." },
    { id: 4, title: "Law of Inspired Action", meaning: "Manifestation requires aligned action based on intuition.", example: "Visualizing your dream job and then acting on a sudden idea to reach out on LinkedIn." },
    { id: 5, title: "Law of Cause and Effect", meaning: "Every action has a reaction; energy you send returns.", example: "Helping someone now creates support for you later." },
    { id: 6, title: "Law of Correspondence", meaning: "Your outer world mirrors your inner state.", example: "A peaceful mind leads to harmonious surroundings." },
    { id: 7, title: "Law of Perpetual Transmutation of Energy", meaning: "Energy is always moving and can be transformed.", example: "Turning anger into motivation or sadness into creativity." },
    { id: 8, title: "Law of Compensation", meaning: "You are rewarded in proportion to the energy and value you give.", example: "Consistent positive effort brings unexpected rewards." },
    { id: 9, title: "Law of Relativity", meaning: "Nothing is good or bad — everything is relative and helps growth.", example: "A setback becomes meaningful when you see the lesson." },
    { id: 10, title: "Law of Polarity", meaning: "Everything has an opposite — light/dark, success/failure.", example: "Pain teaches you to appreciate joy." },
    { id: 11, title: "Law of Rhythm", meaning: "Life flows in cycles — seasons, emotions, and growth.", example: "There’s a time to rest and a time to act — trust the rhythm." },
    { id: 12, title: "Law of Gender", meaning: "Everything has masculine (action) and feminine (intuition) energies.", example: "Creating a vision (feminine) and executing it (masculine)." },
    { id: 13, title: "Law of Gratitude", meaning: "Gratitude amplifies abundance and raises vibration.", example: "Thanking the universe for small blessings attracts bigger ones." },
    { id: 14, title: "Law of Belief", meaning: "Your reality matches your deep beliefs.", example: "Believing you’re guided creates synchronicities." },
    { id: 15, title: "Law of Detachment", meaning: "Let go of how or when desires manifest — trust divine timing.", example: "Applying for your dream job, then releasing the outcome — it arrives unexpectedly." },
  ];

  // 🛒 Handle Order
  const handleOrder = async () => {
    if (!manifestDate) {
      Alert.alert("Select a Date", "Please choose a date first 🌞");
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      Alert.alert("Authentication Error", "You must be logged in to order.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/visionorder/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          vision_item: selectedVision?.id,
          order_date: manifestDate.toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to place order");
      }

      setOrderPlaced(true);
      setTimeout(() => {
        Alert.alert(
          "✨ Ordered!",
          `Your order is set to manifest by ${manifestDate.toDateString()} 💖`
        );
        fetchVisionBoardOrders(); // refresh orders after placing
      }, 1000);
    } catch (error: any) {
      Alert.alert("Order Error", error.message || "Failed to place your order.");
    }
  };

  // ⚙️ Fix comparison (vision_item.id instead of vision_item)
const existingOrder = selectedVision
  ? visionOrders.find((order) => order.vision_item === selectedVision.id)
  : null;

  return (
    <View className="flex-1 bg-gray-100">
      <Navbar />
      <Text className="text-2xl font-bold text-center mt-4">
        Universal Laws Vision Board
      </Text>

      <TouchableOpacity
        onPress={shuffleVisions}
        className="bg-yellow-400 py-2 px-4 rounded-full mx-auto mt-4"
      >
        <Text className="text-white font-bold text-center">Shuffle Cards</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 16, alignItems: "center" }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
          {visions.map((vision, index) => (
            <TouchableOpacity
              key={vision.id}
              onPress={() => openManifestationModal(vision)}
              activeOpacity={0.9}
              style={{
                width: 150,
                height: index % 2 === 0 ? 200 : 160,
                borderRadius: 16,
                backgroundColor: "#fef3c7",
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 5,
                shadowOffset: { width: 0, height: 3 },
                transform: [{ rotate: `${(Math.random() - 0.5) * 4}deg` }],
              }}
            >
              <Image
                source={{ uri: vision.uri }}
                style={{
                  width: "100%",
                  height: "70%",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
                resizeMode="cover"
              />
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "700",
                    color: "#3b2f2f",
                    fontSize: 13,
                  }}
                  numberOfLines={2}
                >
                  {vision.text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Laws of Universe Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-indigo-500 py-3 px-6 rounded-full mx-auto mb-8"
      >
        <Text className="text-white font-bold text-center text-lg">
          Laws of Universe
        </Text>
      </TouchableOpacity>

      {/* 🌟 Universal Laws Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 bg-white p-4">
          <Text className="text-2xl font-bold text-center mb-4 text-gray-800">
            Laws of the Universe ✨
          </Text>

          <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
            {universalLaws.map((law) => (
              <View
                key={law.id}
                style={{
                  backgroundColor: "#fef3c7",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Text className="text-xl font-semibold text-yellow-700">
                  {law.id}. {law.title}
                </Text>
                <Text className="text-gray-700 mt-2">{law.meaning}</Text>
                <Text className="text-gray-600 mt-1 italic">
                  Example: {law.example}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="bg-red-500 py-3 px-6 rounded-full mx-auto mt-4"
          >
            <Text className="text-white font-bold text-center text-lg">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 🌠 Manifestation Modal */}
      <Modal
        visible={manifestModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setManifestModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center p-6">
          <View
            className="bg-white rounded-2xl p-6 shadow-lg"
            style={{ width: 320 }}
          >
            {selectedVision && (
              <>
                <Image
                  source={{ uri: selectedVision.uri }}
                  style={{
                    width: "100%",
                    height: 160,
                    borderRadius: 12,
                    marginBottom: 10,
                  }}
                  resizeMode="contain"
                />

                <Text className="text-xl font-bold text-center text-gray-800">
                  {selectedVision.text}
                </Text>

                {/* If order already exists */}
                {existingOrder ? (
                  <View className="items-center mt-4 p-4 bg-yellow-100 rounded-lg">
                    <Text className="font-semibold text-lg text-yellow-800 mb-2">
                      This vision is already ordered!
                    </Text>
                    <Text className="text-yellow-700">
                      Manifestation Date:{" "}
                      {new Date(
                        existingOrder.order_date
                      ).toDateString()}
                    </Text>
                    <Text className="mt-1 text-yellow-700">
                      Order Delivered:{" "}
                      {existingOrder.order_delivered ? "Yes" : "No"}
                    </Text>
                  </View>
                ) : (
                  <View className="mt-3 items-center">
                    <Text className="text-gray-700 mb-2 font-semibold">
                      Choose your manifestation date 🗓️
                    </Text>

                    <TouchableOpacity
                      onPress={openDatePicker}
                      activeOpacity={0.8}
                      className="bg-indigo-100 border border-indigo-300 rounded-full px-4 py-2"
                    >
                      <Text className="text-indigo-700 font-semibold">
                        {manifestDate
                          ? manifestDate.toDateString()
                          : "Select a Date"}
                      </Text>
                    </TouchableOpacity>

                    {/* iOS Date Picker */}
{showDatePicker && Platform.OS === "ios" && (
  <DateTimePicker
    value={manifestDate || new Date(Date.now() + 24 * 60 * 60 * 1000)}
    mode="date"
    display="inline"
    minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // ✅ only future
    onChange={(event, date) => {
      setShowDatePicker(false);
      if (date) setManifestDate(date);
    }}
  />
)}

{/* Web Date Picker */}
{Platform.OS === "web" && (
  <input
    type="date"
    onChange={(e) => {
      const selected = new Date(e.target.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today) {
        alert("Please select a future date 🌞");
        e.target.value = "";
        return;
      }
      setManifestDate(selected);
    }}
    style={{
      padding: 10,
      borderRadius: 10,
      border: "1px solid #ccc",
      marginTop: 8,
    }}
    min={new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]} // ✅ restrict input in calendar UI
  />
)}


                    {!orderPlaced ? (
                      <TouchableOpacity
                        onPress={handleOrder}
                        className="bg-indigo-500 py-3 px-6 rounded-full mt-5"
                      >
                        <Text className="text-white text-center font-semibold text-lg">
                          Order to Universe 🚀
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View className="items-center mt-4">
                        <Text className="text-green-600 text-lg font-semibold">
                          🌈 Your Order is being prepared...
                        </Text>
                        <Text className="text-gray-500 text-center mt-2">
                          Stay happy, let go, and trust divine timing 🕊️
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setManifestModalVisible(false)}
                  className="bg-red-500 py-2 px-4 rounded-full mt-6"
                >
                  <Text className="text-white font-bold text-center">
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
