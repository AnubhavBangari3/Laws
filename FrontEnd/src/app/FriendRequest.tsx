import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,Modal,SafeAreaView,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import Navbar from "./Navbar";

export default function FriendRequest() {
  return (
    <SafeAreaView className="flex-1 bg-white">
          <Navbar />
</SafeAreaView>
  )
}
