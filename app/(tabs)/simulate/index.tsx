import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { simulationService, Scenario } from '../../../services/simulationService';
import { ProfileContext } from '../../../context/ProfileContext';
import { Ionicons } from '@expo/vector-icons';

export default function SimulationIndex() {
  const router = useRouter();
  const { simulationsCompleted, level } = useContext(ProfileContext);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    const fetchScenarios = async () => {
      const data = await simulationService.getScenarios();
      setScenarios(data);
    };
    fetchScenarios();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.headerTitle}>Practice Scenarios</Text>
        <Text style={styles.headerSubtitle}>Real-world conversations to build travel confidence</Text>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Practice Performance</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{simulationsCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{Math.round(85 + level * 1.5)}%</Text>
              <Text style={styles.statLabel}>Avg Accuracy</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{simulationsCompleted * 50} XP</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
          </View>
        </View>

        {/* Scenarios Grid */}
        <View style={styles.grid}>
          {scenarios.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() =>
                router.push({
                  pathname: '/simulate/chat',
                  params: { type: item.key }
                })
              }
              style={styles.card}
              activeOpacity={0.8}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                
                <View style={styles.cardMeta}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={styles.badgeRow}>
                    <Text style={[
                      styles.difficultyBadge,
                      item.difficulty === 'Beginner' ? styles.badgeBeginner : styles.badgeIntermediate
                    ]}>
                      {item.difficulty}
                    </Text>
                    <Text style={styles.rewardText}>🪙 +{item.points} XP</Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </View>
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
    padding: 20,
    paddingBottom: 100,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    },
  statLabel: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    fontWeight: '600',
    },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  cardMeta: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    },
  badgeBeginner: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeIntermediate: {
    backgroundColor: '#FAF5FF',
    color: '#8B5CF6',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  rewardText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    }
});