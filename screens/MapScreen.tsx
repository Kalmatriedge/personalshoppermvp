import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native-paper';

type Store = {
  id: string;
  name: string;
  category: 'clothes' | 'shoes' | 'electronics' | 'secondhand';
  latitude: number;
  longitude: number;
};

const SAMPLE_STORES: Store[] = [
  { id: '1', name: 'City Fashion', category: 'clothes', latitude: 59.3355, longitude: 18.0635 },
  { id: '2', name: 'Sneaker Hub', category: 'shoes', latitude: 59.3335, longitude: 18.0615 },
  { id: '3', name: 'ElectroWorld', category: 'electronics', latitude: 59.336, longitude: 18.067 },
  { id: '4', name: 'Second Chance', category: 'secondhand', latitude: 59.332, longitude: 18.059 },
];

export default function MapScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Store['category'] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('selectedCategory');
        if (stored) {
          setSelectedCategory(stored as Store['category']);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          // Fallback to Stockholm center
          setRegion({
            latitude: 59.334591,
            longitude: 18.06324,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (err) {
        setErrorMsg('Failed to get location');
        setRegion({
          latitude: 59.334591,
          longitude: 18.06324,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    })();
  }, []);

  const filteredStores = useMemo(() => {
    if (!selectedCategory) return SAMPLE_STORES;
    return SAMPLE_STORES.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
        <Text>{errorMsg ?? 'Fetching your location...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region}>
        {filteredStores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{ latitude: store.latitude, longitude: store.longitude }}
            title={store.name}
            description={store.category}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  map: {
    flex: 1,
  },
});


