import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 60,
          borderTopWidth: 0,
          elevation: 5
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600'
        },
        tabBarActiveTintColor: '#6c5ce7',
        tabBarInactiveTintColor: '#aaa'
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Simulate"
        }}
      />
    </Tabs>
  );
}