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
import { apiReadAccessTOkenMovies } from "@env";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth * 0.3;
const cardMargin = 4;

export default function TopRatedMovies() {
  const [movies, setMovies] = useState([]);
  const rowRefs = useRef([]);
  const scrollPositions = useRef({});

  useEffect(() => {
    const fetchAllTopRatedMovies = async () => {
      let allMovies = [];

      for (let page = 1; page <= 5; page++) {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/top_rated?page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${apiReadAccessTOkenMovies}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await res.json();
          allMovies = [...allMovies, ...data.results];
        } catch (error) {
          console.error(`Error fetching page ${page}:`, error);
          break;
        }
      }

      setMovies(allMovies);
    };

    fetchAllTopRatedMovies();
  }, []);

  const chunkArray = (arr, size) => {
    return Array.from(
      { length: Math.ceil(arr.length / size) },
      (_, i) => arr.slice(i * size, i * size + size)
    );
  };

  const movieRows = chunkArray(movies, 10);

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

  // ✅ Fix: Use stable callback to set refs
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
        <Text style={styles.header}>Top Rated Movies</Text>

        {movieRows.map((row, rowIndex) => (
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
                {row.map((movie) => (
                  <TouchableOpacity
                    key={movie.id}
                    style={styles.movieCard}
                    activeOpacity={0.8}
                  >
                    <View style={styles.imageContainer}>
                      {movie.poster_path ? (
                        <Image
                          source={{
                            uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                          }}
                          style={styles.movieImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Ionicons name="film" size={30} color="#666" />
                        </View>
                      )}
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>
                          {movie.vote_average.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.movieTitle} numberOfLines={1}>
                      {movie.title}
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
  movieCard: {
    width: cardWidth,
    marginRight: cardMargin,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 0.67,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#333",
  },
  movieImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
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
  movieTitle: {
    color: "#FFF",
    fontSize: 12,
    marginTop: 6,
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
});
