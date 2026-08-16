import { Tabs } from 'expo-router';
import { BookOpen, Home, MessageSquare, User } from 'lucide-react-native';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

const C = {
  primary: '#6C63FF',
  primaryLight: '#F4F2FF',
  inactive: '#B8B8CC',
  white: '#FFFFFF',
  shadow: '#1B1B2F',
};

const getTabIcon = (name: string, isFocused: boolean, color: string) => {
  const props = { size: 24, color, strokeWidth: isFocused ? 2.5 : 2 };
  switch (name) {
    case 'index': return <Home {...props} />;
    case 'learn': return <BookOpen {...props} />;
    case 'simulate': return <MessageSquare {...props} />;
    case 'profile': return <User {...props} />;
    default: return <Home {...props} />;
  }
};

function PremiumTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {state.routes.map((route: any, index: number) => {
          if (route.name === 'explore') return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
                {getTabIcon(route.name, isFocused, isFocused ? C.primary : C.inactive)}
              </View>
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
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="simulate" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="explore" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 32,
    right: 32,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: 36,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: C.primaryLight,
  },
});