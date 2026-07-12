import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ProfileContext } from '../../../context/ProfileContext';
import ProfileHeader from '../../../components/ProfileHeader';
import UpcomingTrip from '../../../components/UpcomingTrip';
import StatsGrid from '../../../components/StatsGrid';
import AchievementBadges from '../../../components/AchievementBadges';
import SavedPhrasesList from '../../../components/SavedPhrasesList';

export default function DashboardScreen() {
  const router = useRouter();
  const { loading, xp, level, coins } = useContext(ProfileContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  const xpInCurrentLevel = xp % 200;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / 200) * 100));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileHeader />

        {/* Level & Gamification Card */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View>
              <Text style={styles.levelText}>Level {level}</Text>
              <Text style={styles.xpProgressText}>{xpInCurrentLevel} / 200 XP</Text>
            </View>
            <View style={styles.coinCol}>
              <Text style={styles.coinText}>🪙 {coins}</Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Utility Shortcuts Row */}
        <View style={styles.utilitiesRow}>
          <TouchableOpacity 
            style={styles.utilityBtn}
            onPress={() => router.push('/profile/trip-planner')}
            activeOpacity={0.8}
          >
            <Text style={styles.utilityBtnText}>✈️ Trip Plan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.utilityBtn}
            onPress={() => router.push('/profile/statistics')}
            activeOpacity={0.8}
          >
            <Text style={styles.utilityBtnText}>📊 Analytics</Text>
          </TouchableOpacity>
        </View>

        <UpcomingTrip />
        <StatsGrid />
        <AchievementBadges />
        <SavedPhrasesList />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', 
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  xpCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    },
  xpProgressText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
    fontWeight: '600',
    },
  coinCol: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coinText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    },
  progressBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06B6D4',
    borderRadius: 4,
  },
  utilitiesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  utilityBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  utilityBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    }
});
