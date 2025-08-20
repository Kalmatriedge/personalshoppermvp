import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ShopOption = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

const options: ShopOption[] = [
  { key: 'clothes', label: 'Clothes', icon: 'tshirt-crew-outline' },
  { key: 'shoes', label: 'Shoes', icon: 'shoe-sneaker' },
  { key: 'electronics', label: 'Electronics', icon: 'laptop' },
  { key: 'secondhand', label: 'Second Hand', icon: 'recycle' },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();

  const handleSelect = useCallback(async (value: string) => {
    try {
      await AsyncStorage.setItem('selectedCategory', value);
      await AsyncStorage.setItem('onboardingComplete', 'true');
      // @ts-ignore - root stack has Tabs route
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    } catch (error) {
      // In a real app, show a toast/snackbar
      console.error('Failed to save selection', error);
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>What are you shopping for?</Text>
      <View style={styles.grid}>
        {options.map((opt) => (
          <Card key={opt.key} style={styles.card} onPress={() => handleSelect(opt.key)}>
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons name={opt.icon} size={36} />
              <Text style={styles.cardLabel}>{opt.label}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 16,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  cardLabel: {
    marginTop: 8,
  },
});


