import ExpoImageModifier from "expo-image-modifier";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from "react-native";

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleTextOverlay = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await ExpoImageModifier.modifyImage({
        source: { uri: image },
        overlays: {
          text: [
            {
              text,
              position,
              style: {
                color: "#FFFFFF",
                fontSize: 24,
              },
            },
          ],
        },
      });
      setImage(result.uri);
    } catch (error) {
      console.error("Error adding text overlay:", error);
    }
    setLoading(false);
  };

  const handleImageOverlay = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const overlayImage = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!overlayImage.canceled) {
        const result = await ExpoImageModifier.modifyImage({
          source: { uri: image },
          overlays: {
            images: [
              {
                source: { uri: overlayImage.assets[0].uri },
                position,
                size: { width: 100, height: 100 },
              },
            ],
          },
        });
        setImage(result.uri);
      }
    } catch (error) {
      console.error("Error adding image overlay:", error);
    }
    setLoading(false);
  };

  const handleMapOverlay = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await ExpoImageModifier.modifyImage({
        source: { uri: image },
        overlays: {
          maps: [
            {
              coordinates: {
                latitude: 37.7749,
                longitude: -122.4194,
              },
              markers: [
                {
                  coordinate: {
                    latitude: 37.7749,
                    longitude: -122.4194,
                  },
                  title: "San Francisco",
                },
              ],
              style: {
                width: 200,
                height: 200,
                zoomLevel: 15,
              },
            },
          ],
        },
      });
      setImage(result.uri);
    } catch (error) {
      console.error("Error adding map overlay:", error);
    }
    setLoading(false);
  };

  const handleCombinedOverlays = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await ExpoImageModifier.modifyImage({
        source: { uri: image },
        overlays: {
          text: [
            {
              text: "Sample Text",
              position: { x: 50, y: 50 },
              style: {
                color: "#FFFFFF",
                fontSize: 24,
              },
            },
          ],
          maps: [
            {
              coordinates: {
                latitude: 37.7749,
                longitude: -122.4194,
              },
              markers: [
                {
                  coordinate: {
                    latitude: 37.7749,
                    longitude: -122.4194,
                  },
                  title: "San Francisco",
                },
              ],
              style: {
                width: 200,
                height: 200,
                zoomLevel: 15,
              },
            },
          ],
        },
      });
      setImage(result.uri);
    } catch (error) {
      console.error("Error adding combined overlays:", error);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Image Modifier Example</Text>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick Image</Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter text"
          value={text}
          onChangeText={setText}
        />
        <TextInput
          style={styles.input}
          placeholder="X position"
          keyboardType="numeric"
          value={position.x.toString()}
          onChangeText={(value) =>
            setPosition({ ...position, x: parseInt(value) || 0 })
          }
        />
        <TextInput
          style={styles.input}
          placeholder="Y position"
          keyboardType="numeric"
          value={position.y.toString()}
          onChangeText={(value) =>
            setPosition({ ...position, y: parseInt(value) || 0 })
          }
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleTextOverlay}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Add Text Overlay</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleImageOverlay}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Add Image Overlay</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleMapOverlay}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Add Map Overlay</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleCombinedOverlays}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Add Combined Overlays</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  imageContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});
