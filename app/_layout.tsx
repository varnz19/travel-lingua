import { Stack } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <View style={styles.mobileFrame}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#E2E8F0' : '#F8F9FA',
  },
  mobileFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#F8F9FA',
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 20px rgba(0,0,0,0.1)' as any,
        height: '100%' as any,
        overflow: 'hidden',
      }
    })
  }
});