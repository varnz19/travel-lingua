import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { ProfileProvider } from '../context/ProfileContext';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import {
  Spectral_400Regular,
  Spectral_600SemiBold,
  Spectral_700Bold,
  Spectral_800ExtraBold,
} from '@expo-google-fonts/spectral';
import { TravelTheme } from '../constants/TravelTheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Spectral_400Regular,
    Spectral_600SemiBold,
    Spectral_700Bold,
    Spectral_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ProfileProvider>
      <View style={styles.root}>
        <View style={styles.mobileFrame}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    </ProfileProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#EAE5D9' : TravelTheme.colors.paper,
  },
  mobileFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: TravelTheme.colors.paper,
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 24px rgba(27, 42, 47, 0.12)' as any,
        height: '100%' as any,
        overflow: 'hidden',
      }
    })
  }
});