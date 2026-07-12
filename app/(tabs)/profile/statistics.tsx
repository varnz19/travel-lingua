import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../../../context/ProfileContext';

export default function StatisticsScreen() {
  const router = useRouter();
  const { lessonsCompleted, simulationsCompleted, savedPhrases, pronunciationPractices } = useContext(ProfileContext);

  const weeklyData = [
    { day: 'Mon', hours: 45 },
    { day: 'Tue', hours: 60 },
    { day: 'Wed', hours: 30 },
    { day: 'Thu', hours: 80 },
    { day: 'Fri', hours: 45 },
    { day: 'Sat', hours: 90 },
    { day: 'Sun', hours: 50 }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Weekly Activity</Text>
        
        {/* Custom Chart using Flexbox styling */}
        <View style={styles.chartCard}>
          <View style={styles.chartRow}>
            {weeklyData.map((item, index) => (
              <View key={index} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${item.hours}%` }]} />
                </View>
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Core Learning Trends</Text>

        <View style={styles.grid}>
          {/* Lessons Card */}
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Lessons Completed</Text>
            <Text style={styles.statVal}>{lessonsCompleted}</Text>
            <Text style={styles.statGoal}>Goal: 10 completed</Text>
          </View>

          {/* Simulations Card */}
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Simulations Run</Text>
            <Text style={styles.statVal}>{simulationsCompleted}</Text>
            <Text style={styles.statGoal}>Goal: 5 run</Text>
          </View>

          {/* Flashcards Card */}
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Saved Vocabulary</Text>
            <Text style={styles.statVal}>{savedPhrases.length}</Text>
            <Text style={styles.statGoal}>Goal: 15 phrases</Text>
          </View>

          {/* Pronunciation Card */}
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Pronunciation Runs</Text>
            <Text style={styles.statVal}>{pronunciationPractices}</Text>
            <Text style={styles.statGoal}>Goal: 10 sessions</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    backgroundColor: '#FFF',
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    },
  scroll: {
    padding: 20,
    paddingBottom: 110,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 150,
    alignItems: 'flex-end',
  },
  barCol: {
    alignItems: 'center',
  },
  barTrack: {
    width: 14,
    height: 120,
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: '#2563EB',
    borderRadius: 7,
    width: '100%',
  },
  barLabel: {
    fontSize: 11,
    color: '#5B6572',
    marginTop: 8,
    fontWeight: '600',
    },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFF',
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  statVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statGoal: {
    fontSize: 11,
    color: '#94A3B8',
    }
});
