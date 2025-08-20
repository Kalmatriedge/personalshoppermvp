import React, { useCallback, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Card, Text } from 'react-native-paper';

type PickedPhoto = {
  uri: string;
  name: string;
  type: string;
};

type Analysis = {
  item: string;
  recommendations: string[];
};

type WardrobeEntry = {
  photo: PickedPhoto;
  analysis?: Analysis;
};

export default function WardrobeScreen() {
  const [entries, setEntries] = useState<WardrobeEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhoto = useCallback(async (photo: PickedPhoto) => {
    try {
      setIsUploading(true);
      const form = new FormData();
      form.append('photo', {
        uri: photo.uri,
        name: photo.name,
        type: photo.type,
      } as any);

      const baseUrl = Platform.select({ ios: 'http://localhost:3000', android: 'http://10.0.2.2:3000' })!;
      const res = await fetch(`${baseUrl}/analyze`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed with status ${res.status}`);
      }
      const data = (await res.json()) as Analysis;
      setEntries((prev) =>
        prev.map((e) => (e.photo.uri === photo.uri ? { ...e, analysis: data } : e))
      );
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message ?? 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your library to pick a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const photo: PickedPhoto = {
        uri: asset.uri,
        name: asset.fileName ?? 'photo.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      };
      setEntries((prev) => [{ photo }, ...prev]);
      uploadPhoto(photo);
    }
  }, [uploadPhoto]);

  const handleTakePhoto = useCallback(async () => {
    const camPerm = await ImagePicker.requestCameraPermissionsAsync();
    if (camPerm.status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const photo: PickedPhoto = {
        uri: asset.uri,
        name: asset.fileName ?? 'photo.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      };
      setEntries((prev) => [{ photo }, ...prev]);
      uploadPhoto(photo);
    }
  }, [uploadPhoto]);

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Button icon="camera" mode="contained" onPress={handleTakePhoto} loading={isUploading}>
          Take Photo
        </Button>
        <Button icon="image" mode="outlined" onPress={handlePickImage} disabled={isUploading}>
          Pick from Library
        </Button>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {entries.length === 0 ? (
          <Text style={styles.empty}>No items yet. Add your first photo.</Text>
        ) : (
          entries.map((entry, idx) => (
            <Card key={`${entry.photo.uri}-${idx}`} style={styles.card}>
              <Card.Cover source={{ uri: entry.photo.uri }} style={styles.photo} />
              <Card.Content>
                {entry.analysis ? (
                  <View style={styles.bubble}>
                    <Text style={styles.bubbleTitle}>Your stylist says</Text>
                    <Text style={styles.itemText}>{entry.analysis.item}</Text>
                    <View style={styles.recs}>
                      {entry.analysis.recommendations.map((rec, rIdx) => (
                        <View key={`${rec}-${rIdx}`} style={styles.recChip}>
                          <Text>{rec}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text style={styles.analyzing}>Analyzing your item...</Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    gap: 8,
  },
  list: {
    padding: 12,
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
  },
  card: {
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 240,
    borderRadius: 8,
  },
  analyzing: {
    marginTop: 12,
    opacity: 0.6,
  },
  bubble: {
    marginTop: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
  },
  bubbleTitle: {
    fontWeight: '600',
    marginBottom: 6,
  },
  itemText: {
    marginBottom: 8,
  },
  recs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});


