import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function LearnJapaneseScreen() {
  const router = useRouter();

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
          <Text style={styles.title}>Learn Japanese</Text>
          <Text style={styles.subtitle}>Choose a category to start learning</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#2563EB' }]}>127</Text>
            <Text style={styles.statLabel}>Phrases{'\n'}Learned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#9333EA' }]}>89%</Text>
            <Text style={styles.statLabel}>Retention{'\n'}Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#EA580C' }]}>7</Text>
            <Text style={styles.statLabel}>Day{'\n'}Streak</Text>
          </View>
        </View>

        {/* Category List */}
        <View style={styles.listContainer}>
          <CategoryCard 
            emoji="👋" 
            bgColor="#3B82F6" 
            title="Greetings" 
            phrases={12} 
            onPress={() => router.push('/flashcards/greetings')}
          />
          <CategoryCard 
            emoji="🍜" 
            bgColor="#F97316" 
            title="Food & Dining" 
            phrases={24} 
            active 
            onPress={() => router.push('/flashcards/food')}
          />
          <CategoryCard 
            emoji="🚕" 
            bgColor="#10B981" 
            title="Transport" 
            phrases={18} 
            onPress={() => router.push('/flashcards/transport')}
          />
          <CategoryCard 
            emoji="🚨" 
            bgColor="#EF4444" 
            title="Emergency" 
            phrases={15} 
            onPress={() => router.push('/flashcards/emergency')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  </View>
  );
}

function CategoryCard({ emoji, bgColor, title, phrases, active = false, onPress }: { emoji: string; bgColor: string; title: string; phrases: number; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{phrases} phrases</Text>
        </View>
      </View>
      <Text style={[styles.chevron, active && styles.activeChevron]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FE',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    ...(Platform.OS === 'web' ? ({
      boxShadow: '0px 0px 20px rgba(0,0,0,0.1)',
      height: '100vh',
    } as any) : {}),
  },
  container: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 60 : 30,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    lineHeight: 16,
  },
  listContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 26,
  },
  cardTextContainer: {
    justifyContent: 'center',
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
    fontWeight: '600',
  },
  chevron: {
    fontSize: 28,
    color: '#CBD5E1',
    fontWeight: '400',
    marginRight: 8,
    paddingBottom: 2,
  },
  activeChevron: {
    color: '#A855F7',
    fontWeight: '600',
  },
});
