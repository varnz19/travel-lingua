import 'react-native-gesture-handler';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileProvider } from './context/ProfileContext';
import DashboardScreen from './screens/DashboardScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.webWrapper}>
        <ProfileProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Dashboard"
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#f8f9ff' },
              }}
            >
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </ProfileProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#f8f9ff',
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      boxShadow: '0px 0px 20px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    } : {}),
  }
});
