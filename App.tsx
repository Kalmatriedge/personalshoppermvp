import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

import OnboardingScreen from './screens/OnboardingScreen';
import MapScreen from './screens/MapScreen';
import WardrobeScreen from './screens/WardrobeScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <Button title="Byt" onPress={() => navigation.navigate('Onboarding' as never)} />
          ),
        })}
      />
      <Tab.Screen
        name="Wardrobe"
        component={WardrobeScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <Button title="Byt" onPress={() => navigation.navigate('Onboarding' as never)} />
          ),
        })}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    (async () => {
      const completed = await AsyncStorage.getItem('onboardingComplete');
      setShowOnboarding(!completed);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={showOnboarding ? 'Onboarding' : 'Tabs'}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
