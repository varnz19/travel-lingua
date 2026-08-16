import { useRouter } from 'expo-router';
import {
  BarChart2,
  BookOpen,
  ChevronRight,
  Compass,
  Flame,
  Footprints,
  Globe,
  Languages,
  Lock,
  Map,
  Plane,
  Settings,
  Star,
  Trophy,
  Utensils
} from 'lucide-react-native';
import React, { useContext } from 'react';
import {
  ActivityIndicator, SafeAreaView,
  ScrollView, StyleSheet,
  Text, TouchableOpacity,
  View,
} from 'react-native';
import { ProfileContext } from '../../../context/ProfileContext';

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
  gold: '#F5C842',
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

const getBadgeIcon = (key: string, size: number, color: string) => {
  const props = { size, color, strokeWidth: 2 };
  switch (key) {
    case 'footsteps': return <Footprints {...props} />;
    case 'flame': return <Flame {...props} />;
    case 'globe': return <Globe {...props} />;
    case 'book': return <BookOpen {...props} />;
    case 'trophy': return <Trophy {...props} />;
    case 'restaurant': return <Utensils {...props} />;
    case 'compass': return <Compass {...props} />;
    default: return <Trophy {...props} />;
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const {
    loading, name, username, learningLanguage,
    xp, level, coins, streak, trip,
    achievements, recentActivity,
  } = useContext(ProfileContext);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const xpInLevel = xp % 200;
  const xpPct = Math.min(100, Math.round((xpInLevel / 200) * 100));
  const displayName = name || username;
  const initials = displayName ? displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() : 'U';
  const unlockedAch = achievements.filter((a: any) => a.unlocked);
  const lockedAch = achievements.filter((a: any) => !a.unlocked);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero Header ─────────────────────────────────── */}
        <View style={styles.heroHeader}>
          <View style={styles.heroRow}>
            <View style={styles.avatar}>
              <Text style={[typography.h3, { color: C.white }]}>{initials}</Text>
            </View>
            <View style={styles.heroMeta}>
              <Text style={[typography.h3, { color: C.textPrimary, marginBottom: 4 }]}>{displayName}</Text>
              <View style={styles.languagePill}>
                <Languages size={14} color={C.primary} style={{ marginRight: 6 }} strokeWidth={2.5} />
                <Text style={[typography.caption, { color: C.primary, fontWeight: '700' }]}>Learning {learningLanguage}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/profile/settings' as any)} activeOpacity={0.8}>
              <Settings size={22} color={C.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* XP Progress */}
          <View style={styles.xpSection}>
            <View style={styles.xpLabelRow}>
              <Text style={[typography.subtitle1, { color: C.textPrimary }]}>Level {level} Traveller</Text>
              <Text style={[typography.caption, { color: C.textSecondary }]}>{xpInLevel} / 200 XP</Text>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${xpPct}%` as any }]} />
            </View>
          </View>

          {/* Stat Chips */}
          <View style={styles.chipRow}>
            {[
              { icon: Flame, value: `${streak}`, label: 'Day Streak', color: '#E06845', bg: C.peach },
              { icon: Trophy, value: `${xp}`, label: 'Total XP', color: C.primary, bg: C.primaryLight },
              { icon: Star, value: `${unlockedAch.length}`, label: 'Badges', color: C.success, bg: C.mint },
            ].map(({ icon: Icon, value, label, color, bg }) => (
              <View key={label} style={[styles.statChip, { backgroundColor: bg }]}>
                <Icon size={20} color={color} strokeWidth={2.5} style={{ marginBottom: 6 }} />
                <Text style={[typography.h4, { color }]}>{value}</Text>
                <Text style={[typography.caption, { color: C.textSecondary, marginTop: 2 }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Upcoming Trip ────────────────────────────────── */}
        {trip?.destination && (
          <TouchableOpacity style={styles.tripCard} onPress={() => router.push('/profile/trip-planner' as any)} activeOpacity={0.9}>
            {/* Ticket Cutouts */}
            <View style={styles.ticketCutoutLeft} />
            <View style={styles.ticketCutoutRight} />

            <View style={styles.tripIconBox}>
              <Plane size={24} color={C.primary} strokeWidth={2} style={{ transform: [{ rotate: '45deg' }] }} />
            </View>
            <View style={styles.tripBody}>
              <Text style={[typography.overline, { color: C.textSecondary, marginBottom: 4 }]}>UPCOMING TRIP</Text>
              <Text style={[typography.subtitle1, { color: C.textPrimary, marginBottom: 4 }]}>{trip.destination}</Text>
              {trip.departureDate && (
                <Text style={[typography.caption, { color: C.textSecondary }]}>{trip.departureDate} · {trip.duration}</Text>
              )}
            </View>
            <View style={styles.tripRightBorder}>
              <ChevronRight size={20} color={C.textSecondary} strokeWidth={2} />
            </View>
          </TouchableOpacity>
        )}

        {/* ── Quick Shortcuts ──────────────────────────────── */}
        <View style={styles.shortcutRow}>
          {[
            { icon: BarChart2, label: 'Analytics', route: '/profile/statistics' },
            { icon: Map, label: 'Trip Plan', route: '/profile/trip-planner' },
          ].map(({ icon: Icon, label, route }) => (
            <TouchableOpacity key={label} style={styles.shortcutBtn} onPress={() => router.push(route as any)} activeOpacity={0.8}>
              <Icon size={18} color={C.primary} style={{ marginRight: 10 }} strokeWidth={2.5} />
              <Text style={[typography.subtitle2, { color: C.primary }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Achievements ─────────────────────────────────── */}
        <Text style={[typography.h3, { color: C.textPrimary, marginBottom: 20 }]}>Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll} contentContainerStyle={{ gap: 16, paddingRight: 24 }}>
          {[...unlockedAch, ...lockedAch].map((badge: any) => (
            <View key={badge.id} style={[styles.badgeCard, !badge.unlocked && styles.badgeCardLocked]}>
              <View style={[styles.badgeIconBox, badge.unlocked ? { backgroundColor: '#FFF8E0' } : { backgroundColor: C.bg }]}>
                {getBadgeIcon(badge.icon, 24, badge.unlocked ? C.gold : '#C4C4D0')}
              </View>
              <Text style={[typography.caption, { color: C.textPrimary, textAlign: 'center' }, !badge.unlocked && { color: C.textSecondary }]} numberOfLines={1}>{badge.title}</Text>
              {!badge.unlocked && (
                <View style={styles.lockedPill}>
                  <Lock size={10} color={C.textSecondary} strokeWidth={2.5} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* ── Recent Activity ──────────────────────────────── */}
        {recentActivity?.length > 0 && (
          <>
            <Text style={[typography.h3, { color: C.textPrimary, marginBottom: 20 }]}>Recent Activity</Text>
            <View style={styles.activityCard}>
              {recentActivity.slice(0, 4).map((act: any, i: number) => (
                <View key={act.id || i} style={[styles.activityRow, i < Math.min(3, recentActivity.length - 1) && styles.activityRowBorder]}>
                  <View style={styles.activityDot} />
                  <View style={styles.activityBody}>
                    <Text style={[typography.body2, { color: C.textPrimary, marginBottom: 4 }]}>{act.title}</Text>
                    <Text style={[typography.caption, { color: C.textSecondary }]}>{act.time}</Text>
                  </View>
                </View>
              ))}
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
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

  heroHeader: {
    backgroundColor: C.white,
    borderRadius: 24, padding: 24, marginBottom: 24, marginTop: 12,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 3,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  heroMeta: { flex: 1 },
  languagePill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.primaryLight, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start',
  },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  xpSection: { marginBottom: 24 },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-end' },
  xpTrack: { height: 8, backgroundColor: C.primaryLight, borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: C.primary, borderRadius: 4 } as any,

  chipRow: { flexDirection: 'row', gap: 12 },
  statChip: { flex: 1, borderRadius: 20, paddingVertical: 16, alignItems: 'center' },

  tripCard: {
    backgroundColor: C.white, borderRadius: 24,
    padding: 24, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 3,
    position: 'relative',
    overflow: 'hidden'
  },
  ticketCutoutLeft: { position: 'absolute', left: -12, top: '50%', marginTop: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: C.bg },
  ticketCutoutRight: { position: 'absolute', right: -12, top: '50%', marginTop: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: C.bg },
  tripIconBox: { width: 56, height: 56, borderRadius: 20, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  tripBody: { flex: 1 },
  tripRightBorder: { borderLeftWidth: 1, borderLeftColor: C.divider, borderStyle: 'dashed', paddingLeft: 16, height: 40, justifyContent: 'center' },

  shortcutRow: { flexDirection: 'row', gap: 12, marginBottom: 36 },
  shortcutBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.white, borderRadius: 16, paddingVertical: 16,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },

  badgeScroll: { marginBottom: 36 },
  badgeCard: {
    width: 104, alignItems: 'center',
    backgroundColor: C.white, borderRadius: 24, padding: 16,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  badgeCardLocked: { opacity: 0.5, shadowOpacity: 0 },
  badgeIconBox: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  lockedPill: { marginTop: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },

  activityCard: {
    backgroundColor: C.white, borderRadius: 24,
    paddingHorizontal: 24, paddingVertical: 12,
    marginBottom: 24,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20 },
  activityRowBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primaryLight, borderWidth: 2, borderColor: C.primary, marginRight: 20 },
  activityBody: { flex: 1 },
});
