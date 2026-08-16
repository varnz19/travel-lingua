import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileContext } from '../../context/ProfileContext';
import {
  Plane,
  Utensils,
  Briefcase,
  BookOpen,
  MessageCircle,
  Globe,
  CheckCircle2,
  ArrowRight
} from 'lucide-react-native';

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
  card: '#FFFFFF',
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

export default function HomeScreen() {
  const router = useRouter();
  const {
    name,
    username,
    lessonsCompleted,
    simulationsCompleted,
    savedPhrases,
    streak,
    dailyGoals,
    trip,
    learningLanguage,
  } = useContext(ProfileContext);

  const readinessScore = Math.min(
    100,
    Math.round(
      (lessonsCompleted * 12) +
      (simulationsCompleted * 15) +
      (savedPhrases.length * 4) +
      (streak * 3)
    )
  );

  const getHourGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── Greeting ─────────────────────────────────── */}
        <View style={styles.greetingRow}>
          <View style={styles.greetingText}>
            <Text style={[typography.subtitle1, { color: C.textSecondary, marginBottom: 4 }]}>{getHourGreeting()}</Text>
            <Text style={[typography.h1, { color: C.textPrimary, marginBottom: 8 }]}>{name || username}</Text>
            <Text style={[typography.body1, { color: C.textSecondary }]}>Ready to continue your {learningLanguage} journey?</Text>
          </View>
          <View style={styles.greetingBadge}>
            <Plane size={24} color={C.primary} strokeWidth={2.5} />
          </View>
        </View>

        {/* ── Today's Lesson Hero ───────────────────────── */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => router.push('/learn/flashcards/greetings' as any)}
          activeOpacity={0.9}
        >
          {/* Ticket/Boarding Pass Motif Left Cutout */}
          <View style={styles.ticketCutoutLeft} />
          <View style={styles.ticketCutoutRight} />

          <View style={styles.heroInner}>
            <Text style={[typography.overline, { color: 'rgba(255,255,255,0.7)', marginBottom: 8 }]}>TODAY'S LESSON</Text>
            <Text style={[typography.h2, { color: C.white, marginBottom: 6 }]}>Restaurant Phrases</Text>
            <Text style={[typography.subtitle2, { color: 'rgba(255,255,255,0.8)', marginBottom: 24 }]}>10 phrases · ~8 min</Text>

            <View style={styles.heroCtaRow}>
              <View style={styles.heroCta}>
                <Text style={[typography.subtitle2, { color: C.primary, marginRight: 6 }]}>Start Learning</Text>
                <ArrowRight size={16} color={C.primary} strokeWidth={2.5} />
              </View>
            </View>
          </View>
          <View style={styles.heroIconWrap}>
            <Utensils size={64} color="rgba(255,255,255,0.15)" strokeWidth={1.5} />
          </View>
        </TouchableOpacity>

        {/* ── Travel Readiness ──────────────────────────── */}
        <View style={styles.readinessCard}>
          <View style={styles.readinessTop}>
            <View>
              <Text style={[typography.overline, { color: C.textSecondary, marginBottom: 4 }]}>Travel Readiness</Text>
              <Text style={[typography.h4, { color: C.textPrimary }]}>{trip?.destination || 'Japan'}</Text>
            </View>
            <View style={styles.readinessIconCircle}>
              <Briefcase size={20} color={C.primary} strokeWidth={2.5} />
            </View>
          </View>
          <Text style={[typography.h1, { color: C.primary, fontSize: 42, marginBottom: 16 }]}>{readinessScore}%</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${readinessScore}%` as any }]} />
          </View>
          <Text style={[typography.body2, { color: C.textSecondary, marginTop: 12 }]}>
            {readinessScore >= 80 ? "You're almost trip-ready! 🌟" : readinessScore >= 50 ? 'Making great progress.' : 'Keep practicing daily!'}
          </Text>
        </View>

        {/* ── Quick Actions ─────────────────────────────── */}
        <Text style={[typography.h3, { color: C.textPrimary, marginBottom: 16 }]}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: C.primaryLight }]} onPress={() => router.push('/learn' as any)} activeOpacity={0.8}>
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(108,99,255,0.1)' }]}>
              <BookOpen size={24} color={C.primary} strokeWidth={2.5} />
            </View>
            <Text style={[typography.subtitle2, { color: C.primary }]}>Learn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: C.mint }]} onPress={() => router.push('/simulate' as any)} activeOpacity={0.8}>
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(88,201,138,0.15)' }]}>
              <MessageCircle size={24} color="#3DB87A" strokeWidth={2.5} />
            </View>
            <Text style={[typography.subtitle2, { color: '#3DB87A' }]}>Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: C.peach }]} onPress={() => router.push('/learn/translator' as any)} activeOpacity={0.8}>
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(255,140,115,0.15)' }]}>
              <Globe size={24} color="#E06845" strokeWidth={2.5} />
            </View>
            <Text style={[typography.subtitle2, { color: '#E06845' }]}>Translate</Text>
          </TouchableOpacity>
        </View>

        {/* ── Daily Goals ───────────────────────────────── */}
        <Text style={[typography.h3, { color: C.textPrimary, marginBottom: 16 }]}>Daily Goals</Text>
        <View style={styles.goalsCard}>
          {dailyGoals.map((goal: any, index: number) => {
            const isLast = index === dailyGoals.length - 1;
            const current = goal.current ?? 0;
            const target = goal.target ?? 1;
            const progress = goal.type === 'phrases' ? Math.min(1, current / target) : goal.completed ? 1 : 0;
            const pct = Math.round(progress * 100);

            return (
              <View key={goal.id} style={[styles.goalRow, !isLast && styles.goalRowBorder]}>
                <View style={styles.goalInfo}>
                  <View style={styles.goalTitleRow}>
                    <Text style={[typography.subtitle1, { color: C.textPrimary, flex: 1 }, goal.completed && { color: C.textSecondary, textDecorationLine: 'line-through' }]}>
                      {goal.label}
                    </Text>
                    {goal.completed && (
                      <View style={styles.donePill}>
                        <CheckCircle2 size={12} color={C.success} strokeWidth={3} />
                        <Text style={[typography.overline, { color: C.success, letterSpacing: 0.5, marginLeft: 4 }]}>Done</Text>
                      </View>
                    )}
                  </View>
                  {!goal.completed && (
                    <View style={styles.goalProgressRow}>
                      <View style={styles.goalTrack}>
                        <View style={[styles.goalFill, { width: `${pct}%` as any }]} />
                      </View>
                      <Text style={[typography.caption, { color: C.textSecondary, marginLeft: 12 }]}>
                        {goal.type === 'phrases' ? `${current}/${target}` : 'Pending'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { padding: 24, paddingTop: 16, paddingBottom: 120 },

  // Greeting
  greetingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 32 },
  greetingText: { flex: 1, paddingRight: 16 },
  greetingBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },

  // Hero Card
  heroCard: {
    backgroundColor: C.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 6,
    position: 'relative',
    overflow: 'hidden'
  },
  ticketCutoutLeft: { position: 'absolute', left: -12, top: '50%', marginTop: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: C.bg },
  ticketCutoutRight: { position: 'absolute', right: -12, top: '50%', marginTop: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: C.bg },
  heroInner: { flex: 1, zIndex: 1 },
  heroCtaRow: { flexDirection: 'row' },
  heroCta: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  heroIconWrap: { position: 'absolute', right: -10, bottom: -10, zIndex: 0 },

  // Readiness Card
  readinessCard: {
    backgroundColor: C.card, borderRadius: 24, padding: 24, marginBottom: 32,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  readinessTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  readinessIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 6, backgroundColor: C.primaryLight, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 3 } as any,

  // Actions
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  actionCard: { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 110 },
  actionIconBg: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },

  // Goals
  goalsCard: {
    backgroundColor: C.card, borderRadius: 24, paddingVertical: 8, paddingHorizontal: 24,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  goalRow: { paddingVertical: 20 },
  goalRowBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
  goalInfo: { flex: 1 },
  goalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  donePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F8F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  goalProgressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  goalTrack: { flex: 1, height: 6, backgroundColor: C.primaryLight, borderRadius: 3, overflow: 'hidden' },
  goalFill: { height: '100%', backgroundColor: C.primary, borderRadius: 3 } as any,
  goalMiniFill: { height: '100%', backgroundColor: C.primary, borderRadius: 2 } as any,
});
