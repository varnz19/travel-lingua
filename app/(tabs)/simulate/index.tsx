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
  Text, TouchableOpacity,
  View,
} from 'react-native';
import { ProfileContext } from '../../../context/ProfileContext';
import { Scenario, simulationService } from '../../../services/simulationService';

const C = {
  bg: '#FAFAFC',
  primary: '#6C63FF',
  primaryLight: '#F4F2FF',
  mint: '#EEF9F3',
  peach: '#FFF2EC',
  textPrimary: '#1B1B2F',
  textSecondary: '#7B7B93',
  white: '#FFFFFF',
  success: '#58C98A',
  divider: '#F0EFF8',
};

const typography: any = {
  h1: { fontFamily: 'Inter_800ExtraBold', fontSize: 34, letterSpacing: -0.5 },
  h2: { fontFamily: 'Inter_700Bold', fontSize: 24, letterSpacing: -0.5 },
  h3: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  h4: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  subtitle1: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  subtitle2: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  body1: { fontFamily: 'Inter_400Regular', fontSize: 16 },
  body2: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  caption: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  overline: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
};

const DIFFICULTY_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  beginner: { bg: '#E8F8F0', color: '#3DB87A', label: 'Beginner' },
  easy: { bg: '#E8F8F0', color: '#3DB87A', label: 'Easy' },
  intermediate: { bg: '#FFF4E0', color: '#E0963B', label: 'Intermediate' },
  hard: { bg: '#FDEAEA', color: '#E05555', label: 'Hard' },
  advanced: { bg: '#FDEAEA', color: '#E05555', label: 'Advanced' },
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

  const featured = scenarios[0];
  const rest = scenarios.slice(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ──────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={[typography.h1, { color: C.textPrimary, marginBottom: 8 }]}>Dialogue Practice</Text>
          <Text style={[typography.body1, { color: C.textSecondary }]}>Roleplay real travel situations</Text>
        </View>

        {/* ── Progress Banner ──────────────────────────────── */}
        <View style={styles.progressBanner}>
          <View style={styles.progressBannerLeft}>
            <View style={styles.progressBannerIconBox}>
              <Trophy size={20} color={C.primary} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={[typography.subtitle1, { color: C.textPrimary }]}>{simulationsCompleted} Scenarios Completed</Text>
              <Text style={[typography.caption, { color: C.textSecondary, marginTop: 4 }]}>{scenarios.length} available to practise</Text>
            </View>
          </View>
          <Plane size={28} color="rgba(108,99,255,0.2)" strokeWidth={2} style={{ transform: [{ rotate: '45deg' }] }} />
        </View>

        {/* ── Featured Scenario ────────────────────────────── */}
        {featured && (() => {
          const diff = DIFFICULTY_STYLES[featured.difficulty?.toLowerCase()] || DIFFICULTY_STYLES.intermediate;
          return (
            <>
              <Text style={[typography.overline, { color: C.textSecondary, marginBottom: 14 }]}>FEATURED</Text>
              <TouchableOpacity
                style={styles.featuredCard}
                onPress={() => router.push(`/simulate/chat?type=${featured.key}` as any)}
                activeOpacity={0.9}
              >
                <View style={styles.featuredRow}>
                  <View style={styles.featuredIconBox}>
                    {getScenarioIcon(featured.key, 32, C.primary)}
                  </View>
                  <View style={styles.featuredMeta}>
                    <Text style={[typography.h3, { color: C.textPrimary, marginBottom: 10 }]}>{featured.title}</Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, { backgroundColor: diff.bg }]}>
                        <Text style={[typography.caption, { color: diff.color, fontWeight: '700' }]}>{diff.label}</Text>
                      </View>
                      <View style={styles.badgeXP}>
                        <Star size={12} color={C.textSecondary} strokeWidth={2.5} style={{ marginRight: 4 }} />
                        <Text style={[typography.caption, { color: C.textSecondary, fontWeight: '700' }]}>+100 XP</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.featuredCtaRow}>
                  <View style={styles.startFeaturedBtn}>
                    <Text style={[typography.subtitle2, { color: C.primary, marginRight: 8 }]}>Start Dialogue</Text>
                    <ArrowRight size={16} color={C.primary} strokeWidth={2.5} />
                  </View>
                </View>
              </TouchableOpacity>
            </>
          );
        })()}

        {/* ── All Scenarios ────────────────────────────────── */}
        {rest.length > 0 && (
          <>
            <Text style={[typography.overline, { color: C.textSecondary, marginBottom: 14, marginTop: 10 }]}>ALL SCENARIOS</Text>
            <View style={styles.list}>
              {rest.map(scene => {
                const diff = DIFFICULTY_STYLES[scene.difficulty?.toLowerCase()] || DIFFICULTY_STYLES.intermediate;
                return (
                  <TouchableOpacity
                    key={scene.key}
                    style={styles.scenarioCard}
                    onPress={() => router.push(`/simulate/chat?type=${scene.key}` as any)}
                    activeOpacity={0.82}
                  >
                    <View style={styles.scenarioIconBox}>
                      {getScenarioIcon(scene.key, 24, C.primary)}
                    </View>
                    <View style={styles.scenarioBody}>
                      <Text style={[typography.subtitle1, { color: C.textPrimary, marginBottom: 6 }]}>{scene.title}</Text>
                      <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: diff.bg }]}>
                          <Text style={[typography.caption, { color: diff.color, fontWeight: '700' }]}>{diff.label}</Text>
                        </View>
                        <View style={styles.badgeXP}>
                          <Text style={[typography.caption, { color: C.textSecondary, fontWeight: '700' }]}>+100 XP</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.compactBtn}>
                      <Text style={[typography.subtitle2, { color: C.primary }]}>Start</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 24, paddingBottom: 120 },

  header: { marginBottom: 28, marginTop: 12 },

  progressBanner: {
    backgroundColor: C.primaryLight,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.1)',
  },
  progressBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  progressBannerIconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },

  featuredCard: {
    backgroundColor: C.white,
    borderRadius: 24, padding: 24, marginBottom: 24,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04, shadowRadius: 20, elevation: 3,
  },
  featuredRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  featuredIconBox: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 20,
  },
  featuredMeta: { flex: 1 },
  badgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeXP: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F3FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },

  featuredCtaRow: { borderTopWidth: 1, borderTopColor: C.divider, paddingTop: 20, alignItems: 'flex-start' },
  startFeaturedBtn: { flexDirection: 'row', alignItems: 'center' },

  list: { gap: 16 },
  scenarioCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 20, padding: 18,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  scenarioIconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  scenarioBody: { flex: 1 },
  compactBtn: { backgroundColor: C.primaryLight, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, marginLeft: 12 },
});