import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Bed,
  Car,
  Map,
  MessageSquare,
  Plane,
  ShoppingBag,
  Star,
  Stethoscope,
  Trophy,
  Utensils
} from 'lucide-react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView, StyleSheet,
  Text,
  View,
} from 'react-native';
import { ProfileContext } from '../../../context/ProfileContext';
import { Scenario, simulationService } from '../../../services/simulationService';
import { TravelTheme } from '../../../constants/TravelTheme';
import { AnimatedPressable } from '../../../components/AnimatedPressable';

const T = TravelTheme.colors;

const DIFFICULTY_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  beginner: { bg: T.successLight, color: T.sage, label: 'Beginner' },
  easy: { bg: T.successLight, color: T.sage, label: 'Easy' },
  intermediate: { bg: T.primaryLight, color: T.postmark, label: 'Intermediate' },
  hard: { bg: T.primaryLight, color: T.postmark, label: 'Hard' },
  advanced: { bg: T.primaryLight, color: T.postmark, label: 'Advanced' },
};

const getScenarioIcon = (key: string, size: number, color: string) => {
  const props = { size, color, strokeWidth: 2 };
  switch (key) {
    case 'restaurant': return <Utensils {...props} />;
    case 'taxi': return <Car {...props} />;
    case 'hotel': return <Bed {...props} />;
    case 'shopping': return <ShoppingBag {...props} />;
    case 'airport': return <Plane {...props} />;
    case 'emergency': return <Stethoscope {...props} />;
    case 'directions': return <Map {...props} />;
    default: return <MessageSquare {...props} />;
  }
};

export default function SimulateScreen() {
  const router = useRouter();
  const { simulationsCompleted } = useContext(ProfileContext);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    simulationService.getScenarios().then(setScenarios);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Travel Conversations</Text>
          <Text style={styles.subtitle}>Practice interactive dialogue for real travel situations</Text>
        </View>

        {/* Stats banner */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Trophy size={18} color={T.postmark} />
            <Text style={styles.statNumber}>{simulationsCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Star size={18} color={T.sage} />
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Accuracy Goal</Text>
          </View>
        </View>

        {/* Situations List */}
        <Text style={styles.sectionHeader}>Situations & Dialogues</Text>
        {scenarios.map((sc) => {
          const diff = DIFFICULTY_STYLES[sc.difficulty.toLowerCase()] || DIFFICULTY_STYLES.easy;
          return (
            <AnimatedPressable
              key={sc.key}
              style={styles.scenarioCard}
              onPress={() => router.push(`/(tabs)/simulate/chat?type=${sc.key}` as any)}
            >
              <View style={styles.iconCircle}>
                {getScenarioIcon(sc.key, 20, T.postmark)}
              </View>
              <View style={styles.scenarioDetails}>
                <Text style={styles.scenarioTitle}>{sc.title}</Text>
                <Text style={styles.scenarioDesc} numberOfLines={2}>
                  Interactive branching dialog • {sc.points} XP
                </Text>
                <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
                  <Text style={[styles.diffText, { color: diff.color }]}>{diff.label}</Text>
                </View>
              </View>
              <ArrowRight size={16} color={T.sandLine} />
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: T.paper },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontFamily: 'Spectral_700Bold', color: T.ink, letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontFamily: 'Inter_500Medium', color: T.textSecondary, marginTop: 2 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 20,
    ...TravelTheme.shadows.resting,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statNumber: { fontSize: 20, fontFamily: 'Spectral_700Bold', color: T.ink },
  statLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: T.textMuted, textTransform: 'uppercase' },
  statDivider: { width: 1, backgroundColor: T.sandLine, height: '70%', alignSelf: 'center' },
  sectionHeader: { fontSize: 15, fontFamily: 'Spectral_700Bold', color: T.ink, marginBottom: 12 },
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 10,
    ...TravelTheme.shadows.resting,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: T.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  scenarioDetails: {
    flex: 1,
    paddingHorizontal: 12,
  },
  scenarioTitle: { fontSize: 14, fontFamily: 'Spectral_700Bold', color: T.ink },
  scenarioDesc: { fontSize: 11, fontFamily: 'Inter_400Regular', color: T.textSecondary, marginTop: 2 },
  diffBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  diffText: { fontSize: 9, fontFamily: 'Inter_800ExtraBold', letterSpacing: 0.5 },
});