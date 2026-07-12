import { Stack } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { ProfileProvider } from '../context/ProfileContext';

export default function RootLayout() {
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
    backgroundColor: Platform.OS === 'web' ? '#F1F5F9' : '#F8FAFC',
  },
  mobileFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#F8FAFC',
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 20px rgba(0,0,0,0.05)' as any,
        height: '100%' as any,
        overflow: 'hidden',
      }
    })
  }
});