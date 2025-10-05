import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Platform, 
  Modal 
} from "react-native";
import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import * as SecureStore from "expo-secure-store";

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

export default function UniversalLawsPage() {
  const [visions, setVisions] = useState<VisionItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // 🌠 New States for Manifestation Ordering
  const [manifestModalVisible, setManifestModalVisible] = useState(false);
  const [selectedVision, setSelectedVision] = useState<VisionItem | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const getAccessToken = async () => {
    return Platform.OS === "web"
      ? localStorage.getItem("access_token")
      : await SecureStore.getItemAsync("access_token");
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
      const formatted = data.map((item: any) => ({
        id: item.id,
        text: item.text,
        uri: item.image,
        unlocked: false,
      }));

      setVisions(formatted);
    } catch (error: any) {
      console.error("Fetch Vision Items Error:", error);
      Alert.alert("Error", error.message || "Could not fetch vision items.");
    }
  };

  useEffect(() => {
    fetchVisionBoardItems();
  }, []);

  const shuffleVisions = () => {
    setVisions(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  // 🌟 Function to open Manifestation Modal
  const openManifestationModal = (vision: VisionItem) => {
    setSelectedVision(vision);
    setOrderPlaced(false);
    setManifestModalVisible(true);
  };

  // 🌌 Universal Laws Data
  const universalLaws: UniversalLaw[] = [
    {
      id: 1,
      title: "Law of Divine Oneness",
      meaning: "Everything in the universe is connected. Every thought and action affects the collective whole.",
      example: "Sending love raises not only your vibration but also the energy of others."
    },
    {
      id: 2,
      title: "Law of Vibration",
      meaning: "Everything vibrates at a frequency — thoughts, emotions, and matter.",
      example: "Feeling gratitude attracts more experiences that match that vibration."
    },
    {
      id: 3,
      title: "Law of Attraction",
      meaning: "Like attracts like — what you focus on expands.",
      example: "Thinking ‘I always meet kind people’ attracts kindness in your reality."
    },
    {
      id: 4,
      title: "Law of Inspired Action",
      meaning: "Manifestation requires aligned action based on intuition.",
      example: "Visualizing your dream job and then acting on a sudden idea to reach out on LinkedIn."
    },
    {
      id: 5,
      title: "Law of Cause and Effect",
      meaning: "Every action has a reaction; energy you send returns.",
      example: "Helping someone now creates support for you later."
    },
    {
      id: 6,
      title: "Law of Correspondence",
      meaning: "Your outer world mirrors your inner state.",
      example: "A peaceful mind leads to harmonious surroundings."
    },
    {
      id: 7,
      title: "Law of Perpetual Transmutation of Energy",
      meaning: "Energy is always moving and can be transformed.",
      example: "Turning anger into motivation or sadness into creativity."
    },
    {
      id: 8,
      title: "Law of Compensation",
      meaning: "You are rewarded in proportion to the energy and value you give.",
      example: "Consistent positive effort brings unexpected rewards."
    },
    {
      id: 9,
      title: "Law of Relativity",
      meaning: "Nothing is good or bad — everything is relative and helps growth.",
      example: "A setback becomes meaningful when you see the lesson."
    },
    {
      id: 10,
      title: "Law of Polarity",
      meaning: "Everything has an opposite — light/dark, success/failure.",
      example: "Pain teaches you to appreciate joy."
    },
    {
      id: 11,
      title: "Law of Rhythm",
      meaning: "Life flows in cycles — seasons, emotions, and growth.",
      example: "There’s a time to rest and a time to act — trust the rhythm."
    },
    {
      id: 12,
      title: "Law of Gender",
      meaning: "Everything has masculine (action) and feminine (intuition) energies.",
      example: "Creating a vision (feminine) and executing it (masculine)."
    },
    {
      id: 13,
      title: "Law of Gratitude",
      meaning: "Gratitude amplifies abundance and raises vibration.",
      example: "Thanking the universe for small blessings attracts bigger ones."
    },
    {
      id: 14,
      title: "Law of Belief",
      meaning: "Your reality matches your deep beliefs.",
      example: "Believing you’re guided creates synchronicities."
    },
    {
      id: 15,
      title: "Law of Detachment",
      meaning: "Let go of how or when desires manifest — trust divine timing.",
      example: "Applying for your dream job, then releasing the outcome — it arrives unexpectedly."
    },
  ];

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

      {/* 🌌 Vision Board ScrollView */}
      <ScrollView contentContainerStyle={{ padding: 16, alignItems: "center" }}>
        <View className="flex-row flex-wrap justify-center mt-4">
          {visions.map(vision => (
            <TouchableOpacity
              key={vision.id}
              onPress={() => openManifestationModal(vision)}
              style={{
                width: 140,
                height: 180,
                margin: 10,
                borderRadius: 12,
                backgroundColor: "#facc15",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Image
                source={{ uri: vision.uri }}
                style={{ width: "100%", height: 120 }}
                resizeMode="cover"
              />
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  marginTop: 6,
                  color: "#222",
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {vision.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ✨ Button to open Universal Laws Modal */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-indigo-500 py-3 px-6 rounded-full mx-auto mb-8"
      >
        <Text className="text-white font-bold text-center text-lg">
          Laws of Universe
        </Text>
      </TouchableOpacity>

      {/* 🌟 Modal showing Universal Laws */}
      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 bg-white p-4">
          <Text className="text-2xl font-bold text-center mb-4 text-gray-800">
            Laws of the Universe ✨
          </Text>

          <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
            {universalLaws.map(law => (
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

          {/* Close button */}
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
      <Modal visible={manifestModalVisible} animationType="fade" transparent>
  <View className="flex-1 bg-black/60 justify-center items-center p-6">
    <View
      className="bg-white rounded-2xl p-6 shadow-lg"
      style={{ width: 320, height: 500 }} // ✅ fixed width & height
    >
      {selectedVision && (
        <>
          <Image
            source={{ uri: selectedVision.uri }}
            style={{
              width: "100%",
              height: 180,
              borderRadius: 12,
              marginBottom: 12,
            }}
            resizeMode="cover"
          />

          <Text className="text-xl font-bold text-center text-gray-800">
            {selectedVision.text}
          </Text>

          {!orderPlaced ? (
            <>
              <Text className="text-gray-600 text-center mt-2">
                Visualize this already being yours 💫
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setOrderPlaced(true);
                  setTimeout(() => {
                    Alert.alert(
                      "✨ Ordered!",
                      "Your order has been received by the Universe. Relax and trust the process 💖"
                    );
                  }, 1000);
                }}
                className="bg-indigo-500 py-3 px-6 rounded-full mt-6"
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Order to Universe 🚀
                </Text>
              </TouchableOpacity>
            </>
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

          <View className="flex-1 justify-end mt-6">
            <TouchableOpacity
              onPress={() => setManifestModalVisible(false)}
              className="bg-red-500 py-2 px-4 rounded-full"
            >
              <Text className="text-white font-bold text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  </View>
</Modal>

    </View>
  );
}
