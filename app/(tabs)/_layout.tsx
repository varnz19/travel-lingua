import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.bottomNavWrapper}>
      <View style={styles.bottomNav}>
        {state.routes.map((route: any, index: number) => {
          if (route.name === 'explore') return null;

          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: any = "home-outline";
          if (route.name === 'learn') iconName = "book-outline";
          if (route.name === 'simulate') iconName = "chatbubble-ellipses-outline";
          if (route.name === 'profile') iconName = "person-outline";

          const activeColor = '#2563EB';
          const inactiveColor = '#94A3B8';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={[
                styles.navItem,
                isFocused && styles.navItemActive
              ]}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={iconName} 
                size={22} 
                color={isFocused ? activeColor : inactiveColor} 
                style={{ marginBottom: 3 }}
              />
              <Text style={isFocused ? styles.navLabelActive : styles.navLabel}>
                {label}
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
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
        }}
      />
      <Tabs.Screen
        name="simulate"
        options={{
          title: "Simulate",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bottomNavWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  navItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    },
  navLabelActive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    },
}) as any;