import React from 'react';
import { Tabs } from 'expo-router';
import { Home, BookOpen, Languages, User } from 'lucide-react-native';
import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { TravelTheme } from '../../constants/TravelTheme';
import { HapticsManager } from '../../utils/HapticsManager';

const T = TravelTheme.colors;

// Explicit 4-tab sequence: Home, Learn, Translate, Profile
const PRIMARY_TABS = [
  {
    name: 'index',
    label: 'Home',
    icon: (props: any) => <Home {...props} />,
  },
  {
    name: 'survival',
    label: 'Learn',
    icon: (props: any) => <BookOpen {...props} />,
  },
  {
    name: 'practice',
    label: 'Translate',
    icon: (props: any) => <Languages {...props} />,
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: (props: any) => <User {...props} />,
  },
];

function PremiumTabBar({ state, descriptors, navigation }: any) {
  const currentRouteName = state.routes[state.index]?.name;

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {PRIMARY_TABS.map((tab) => {
          const isFocused = currentRouteName === tab.name;
          const color = isFocused ? T.postmark : T.textMuted;

          const onPress = () => {
            HapticsManager.light();
            if (!isFocused) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
                {tab.icon({ size: 20, color, strokeWidth: isFocused ? 2.5 : 1.8 })}
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <PremiumTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="survival" options={{ title: 'Learn' }} />
      <Tabs.Screen name="practice" options={{ title: 'Translate' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="simulate" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 12,
    left: 20,
    right: 20,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: T.surface,
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderColor: T.sandLine,
    borderWidth: 1,
    ...TravelTheme.shadows.raised,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconPill: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: T.primaryLight,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: T.textMuted,
  },
  tabLabelActive: {
    color: T.postmark,
    fontFamily: 'Inter_700Bold',
  },
});