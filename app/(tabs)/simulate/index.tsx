import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  const scenarios = [
    { name: "Restaurant Order", key: "restaurant", level: "Beginner", icon: "🍽️" },
    { name: "Hotel Check-in", key: "hotel", level: "Intermediate", icon: "🏨" },
    { name: "Taking a Taxi", key: "taxi", level: "Beginner", icon: "🚕" },
    { name: "Shopping", key: "shopping", level: "Intermediate", icon: "🛍️" },
    { name: "Airport Navigation", key: "airport", level: "Advanced", icon: "✈️" }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Header */}
        <Text style={{ fontSize: 26, fontWeight: 'bold' }}>
          Practice Scenarios
        </Text>
        <Text style={{ color: '#666', marginBottom: 20 }}>
          Real-world conversations to build confidence
        </Text>

        {/* Stats Card */}
        <View style={{
          backgroundColor: '#e8f7ec',
          padding: 20,
          borderRadius: 16,
          marginBottom: 20
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>
            Your Average Score 87%
          </Text>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10
          }}>
            <Text>12 Completed</Text>
            <Text>4.2 Rating</Text>
            <Text>8h Practice</Text>
          </View>
        </View>

        {/* Scenario Cards */}
        {scenarios.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() =>
              router.push({
                pathname: '/simulate/chat',
                params: { type: item.key }
              })
            }
            style={{
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 18,
              marginBottom: 15,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              {/* Icon */}
              <Text style={{ fontSize: 24, marginRight: 12 }}>
                {item.icon}
              </Text>

              {/* Text */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>
                  {item.name}
                </Text>

                {/* Difficulty Badge */}
                <Text style={{
                  marginTop: 4,
                  fontSize: 12,
                  color:
                    item.level === "Beginner" ? "#27ae60" :
                    item.level === "Intermediate" ? "#f39c12" :
                    "#e74c3c"
                }}>
                  {item.level}
                </Text>
              </View>

              {/* Arrow */}
              <Text style={{ fontSize: 18, color: '#bbb' }}>
                ›
              </Text>

            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}