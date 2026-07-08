import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Learn() {
  const router = useRouter();

  const categories = [
    { name: "Greetings", key: "greetings", emoji: "👋" },
    { name: "Food & Dining", key: "food", emoji: "🍜" },
    { name: "Transport", key: "transport", emoji: "🚕" },
    { name: "Emergency", key: "emergency", emoji: "🚨" },
    { name: "Shopping", key: "shopping", emoji: "🛍️" },
    { name: "Hotel", key: "hotel", emoji: "🏨" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Learn Japanese</Text>

      {categories.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.card}
          onPress={() => router.push(`/flashcards?category=${item.key}`)}
        >
          <Text style={styles.emoji}>{item.emoji}</Text>
          <View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.subtitle}>Tap to learn</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f5f7" },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },

  emoji: { fontSize: 28, marginRight: 15 },

  cardTitle: { fontSize: 18, fontWeight: "600" },

  subtitle: { color: "gray", fontSize: 12 },
});