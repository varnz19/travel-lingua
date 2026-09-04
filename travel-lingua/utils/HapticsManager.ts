import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const HapticsManager = {
  light: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Safe fallback
      }
    }
  },

  medium: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        // Safe fallback
      }
    }
  },

  success: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        // Safe fallback
      }
    }
  },

  selection: () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch (e) {
        // Safe fallback
      }
    }
  }
};
