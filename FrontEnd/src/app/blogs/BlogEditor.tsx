import { View, Text, Button, TextInput, Platform, Alert } from "react-native";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { useRef, useState } from "react";
import * as SecureStore from 'expo-secure-store';


export default function BlogEditor() {
  const richText = useRef<RichEditor>(null);
  const [content, setContent] = useState("");

  const saveContent = async () => {
    let blogHtml = content;
     const accessToken = Platform.OS === 'web'
            ? localStorage.getItem('access_token')
            : await SecureStore.getItemAsync('access_token');
    
          if (!accessToken) {
            Alert.alert("Error", "No access token found.");
            return;
          }

    if (Platform.OS !== "web") {
      const html = await richText.current?.getContentHtml();
      blogHtml = html || "";
      setContent(blogHtml);
    }

    if (!blogHtml.trim()) {
      Alert.alert("Error", "Blog content cannot be empty.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/blogs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content: blogHtml }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Blog posted:", data);
        Alert.alert("Success", "Blog posted successfully!");
        setContent("");
      } else {
        const error = await response.json();
        console.error("Failed to post blog:", error);
        Alert.alert("Error", "Failed to post blog.");
      }
    } catch (err) {
      console.error("Error posting blog:", err);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Add New Blog Post
      </Text>

      {Platform.OS === "web" ? (
        <TextInput
          multiline
          numberOfLines={10}
          value={content}
          onChangeText={setContent}
          placeholder="Start writing your blog..."
          style={{
            borderColor: "#ccc",
            borderWidth: 1,
            padding: 10,
            height: 200,
            textAlignVertical: "top",
            marginBottom: 10,
          }}
        />
      ) : (
        <>
          <RichEditor
            ref={richText}
            style={{ flex: 1, borderColor: "#ccc", borderWidth: 1, marginBottom: 10 }}
            placeholder="Start writing your blog..."
            onChange={(text) => setContent(text)}
          />
          <RichToolbar
            editor={richText}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.insertBulletsList,
              actions.insertImage,
            ]}
          />
        </>
      )}

      <Button title="Post" onPress={saveContent} />
    </View>
  );
}
