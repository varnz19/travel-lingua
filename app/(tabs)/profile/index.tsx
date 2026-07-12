import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileContext } from '../../../context/ProfileContext';
import ProfileHeader from '../../../components/ProfileHeader';
import UpcomingTrip from '../../../components/UpcomingTrip';
import StatsGrid from '../../../components/StatsGrid';
import AchievementBadges from '../../../components/AchievementBadges';
import SavedPhrasesList from '../../../components/SavedPhrasesList';

export default function DashboardScreen() {
  const { loading } = useContext(ProfileContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7b4eff" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileHeader />
        <UpcomingTrip />
        <StatsGrid />
        <AchievementBadges />
        <SavedPhrasesList />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff', // Dashboard background: light gray
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  loadingText: {
    marginTop: 12,
    color: '#7b4eff',
    fontSize: 14,
    fontWeight: '600',
  },
});
