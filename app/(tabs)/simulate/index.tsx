import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { simulationService, Scenario } from '../../../services/simulationService';
import { ProfileContext } from '../../../context/ProfileContext';

export default function SimulateScreen() {
  const router = useRouter();
  const { simulationsCompleted } = useContext(ProfileContext);
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dialogue Practice</Text>
          <Text style={styles.headerSubtitle}>Roleplay critical travel branching scenarios</Text>
        </View>

        {/* Quick Stats Widget */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{simulationsCompleted}</Text>
            <Text style={styles.statLabel}>Practiced</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{scenarios.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>

        {/* List of Scenarios */}
        <Text style={styles.sectionTitle}>All Scenarios</Text>
        <View style={styles.list}>
          {scenarios.map((scene) => (
            <View key={scene.key} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{scene.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{scene.title}</Text>
                </View>
              </View>
              
              <View style={styles.metaRow}>
                <View style={styles.badge}>
                  <Ionicons name="flash-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
                  <Text style={styles.badgeText}>{scene.difficulty}</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="star-outline" size={12} color="#475569" style={{ marginRight: 4 }} />
                  <Text style={styles.badgeText}>+100 XP</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.startBtn}
                onPress={() => router.push(`/simulate/chat?type=${scene.key}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.startBtnText}>Start Dialogue</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
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
  scroll: {
    padding: 20,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#475569',
    },
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    },
  divider: {
    width: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#475569',
    },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    }
});