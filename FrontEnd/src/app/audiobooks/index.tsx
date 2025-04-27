import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import Navbar from "../Navbar";

export default function AudiobooksPage() {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    const fetchAudiobook = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/audiobook/");
        const result = await response.json();
        console.log(result); // See the whole response
        setData(result);
      } catch (error) {
        console.error("Error fetching audiobook:", error);
      }
    };

    fetchAudiobook();
  }, []);

  return (
    <ScrollView style={styles.container}>
      
      <Navbar/>

      <View style={styles.gridContainer}>
        {data.map((audiobook, index) => (
          <View key={index} style={styles.card}>
            <Image
              source={{
                uri: "https://png.pngtree.com/thumb_back/fw800/background/20240527/pngtree-audio-book-concept-image-hd-image_15732306.jpg",
              }}
              style={styles.image}
            />
            <Text style={styles.title}>{audiobook.title}</Text>
            <Text style={styles.author}>{audiobook.author}</Text>
            <Text style={styles.rating}>Rating: {audiobook.rating}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f1f1f1",
  
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  card: {
    width: "48%", // This will make the cards take up 48% of the width (2 items per row)
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 3, // Adds shadow for better visibility
    marginTop: 10,
  },
  image: {
    width: "100%", // Ensures the image fills the width of the card
    height: 200, // Fixed height for the images
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  author: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginBottom: 5,
  },
  rating: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
});
