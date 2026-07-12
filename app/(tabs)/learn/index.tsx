import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LearnScreen() {
  const router = useRouter();

  const categories = [
    { key: 'greetings', title: 'Greetings', icon: '👋', subtitle: 'Basic hello & goodbye' },
    { key: 'food', title: 'Food & Dining', icon: '🍜', subtitle: 'Ordering at restaurants' },
    { key: 'transport', title: 'Transportation', icon: '🚕', subtitle: 'Getting around' },
    { key: 'emergency', title: 'Emergency', icon: '🚨', subtitle: 'Asking for help' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>Learn Vocabulary</Text>
        <Text style={styles.headerSubtitle}>Master essential phrases with flashcards</Text>

        <View style={styles.grid}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.key} 
              style={styles.card}
              onPress={() => router.push(`/learn/flashcards/${cat.key}`)}
            >
              <Text style={styles.cardIcon}>{cat.icon}</Text>
              <Text style={styles.cardTitle}>{cat.title}</Text>
              <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scroll: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
  }
});
