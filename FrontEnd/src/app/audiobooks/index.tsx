import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Navbar from "../Navbar";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth * 0.25;
const cardMargin = 6;

export default function AudiobooksPage() {
  const [audiobooks, setAudiobooks] = useState([]);
  const [likedBooks, setLikedBooks] = useState({}); // Track liked books by product_id
  const rowRefs = useRef([]);
  const scrollPositions = useRef({});

  useEffect(() => {
    const fetchAudiobook = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/audiobook/");
        const result = await response.json();
        setAudiobooks(result);
        
        // Initialize liked status using product_id
        const initialLikes = {};
        result.forEach(book => {
          initialLikes[book.product_id] = false; // Default to not liked
        });
        setLikedBooks(initialLikes);
      } catch (error) {
        console.error("Error fetching audiobooks:", error);
      }
    };

    fetchAudiobook();
  }, []);

  const toggleLike = (productId) => {
    setLikedBooks(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
    
    // Here you could also make an API call to save the like status to your backend
    // Example:
    // fetch(`http://127.0.0.1:8000/audiobook/${productId}/like/`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ liked: !likedBooks[productId] }),
    // });
  };

  const chunkArray = (arr, size) => {
    return Array.from(
      { length: Math.ceil(arr.length / size) },
      (_, i) => arr.slice(i * size, i * size + size)
    );
  };

  const audiobookRows = chunkArray(audiobooks, 10);

  const scrollRow = (rowIndex, direction) => {
    const scrollView = rowRefs.current[rowIndex];
    if (!scrollView) return;

    const currentX = scrollPositions.current[rowIndex] || 0;
    const scrollAmount =
      direction === "right"
        ? currentX + cardWidth * 3
        : Math.max(0, currentX - cardWidth * 3);

    scrollView.scrollTo({ x: scrollAmount, animated: true });
    scrollPositions.current[rowIndex] = scrollAmount;
  };

  const handleScroll = (rowIndex, event) => {
    const x = event.nativeEvent.contentOffset.x;
    scrollPositions.current[rowIndex] = x;
  };

  const setRowRef = useCallback(
    (index) => (ref) => {
      if (ref) {
        rowRefs.current[index] = ref;
      }
    },
    []
  );

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView style={styles.mainScroll}>
        <Text style={styles.header}>Top Audiobooks</Text>

        {audiobookRows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.rowWrapper}>
            <View style={styles.rowWithButtons}>
              <TouchableOpacity
                style={[styles.navButton, styles.leftButton]}
                onPress={() => scrollRow(rowIndex, "left")}
              >
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </TouchableOpacity>

              <ScrollView
                ref={setRowRef(rowIndex)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rowScroll}
                onScroll={(e) => handleScroll(rowIndex, e)}
                scrollEventThrottle={16}
              >
                {row.map((audiobook, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.card}
                    activeOpacity={0.8}
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={{
                          uri:
                            audiobook.image ||
                            "https://png.pngtree.com/thumb_back/fw800/background/20240527/pngtree-audio-book-concept-image-hd-image_15732306.jpg",
                        }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>
                          {audiobook.rating || "0.0"}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.likeButton}
                        onPress={() => toggleLike(audiobook.product_id)}
                      >
                        <Ionicons 
                          name={likedBooks[audiobook.product_id] ? "heart" : "heart-outline"} 
                          size={20} 
                          color={likedBooks[audiobook.product_id] ? "#FF0000" : "#FFF"} 
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.title} numberOfLines={1}>
                      {audiobook.title}
                    </Text>
                    <Text style={styles.author} numberOfLines={1}>
                      {audiobook.author}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.navButton, styles.rightButton]}
                onPress={() => scrollRow(rowIndex, "right")}
              >
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  mainScroll: {
    flex: 1,
  },
  header: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  rowWrapper: {
    marginBottom: 16,
  },
  rowWithButtons: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  rowScroll: {
    paddingLeft: 52,
    paddingRight: 52,
  },
  card: {
    width: cardWidth,
    marginRight: cardMargin,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 0.67,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#333",
    position: 'relative',
  },
  image: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 2,
  },
  title: {
    color: "#FFF",
    fontSize: 12,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  author: {
    color: "#999",
    fontSize: 11,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  navButton: {
    position: "absolute",
    zIndex: 10,
    width: 40,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  leftButton: {
    left: 0,
  },
  rightButton: {
    right: 0,
  },
  likeButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});