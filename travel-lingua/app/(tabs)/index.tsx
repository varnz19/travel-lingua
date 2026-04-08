import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function Home() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f4f5f7' }}>

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
          backgroundColor: '#dff5e1',
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
            marginTop: 15
          }}>
            <Text>12 Completed</Text>
            <Text>4.2 Rating</Text>
            <Text>8h Practice</Text>
          </View>
        </View>

        {/* Scenario Cards */}
        {[
          { title: "Restaurant Order", level: "Beginner" },
          { title: "Hotel Check-in", level: "Intermediate" },
          { title: "Taking a Taxi", level: "Beginner" },
          { title: "Shopping", level: "Intermediate" },
          { title: "Airport Navigation", level: "Advanced" }
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              backgroundColor: '#fff',
              padding: 15,
              borderRadius: 16,
              marginBottom: 15,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 5
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600' }}>
              {item.title}
            </Text>

            <Text style={{ color: '#888', marginTop: 5 }}>
              {item.level}
            </Text>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Bottom Nav */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        borderTopWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff'
      }}>
        <Text>Home</Text>
        <Text>Learn</Text>
        <Text style={{ color: '#6c5ce7', fontWeight: 'bold' }}>
          Simulate
        </Text>
        <Text>Profile</Text>
      </View>

    </View>
  );
}