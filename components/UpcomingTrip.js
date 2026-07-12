import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../context/ProfileContext';

export default function UpcomingTrip() {
  const { profile } = useContext(ProfileContext);

  // Dynamic trip destination mapping based on learning language
  const tripDetails = {
    Spanish: { destination: 'Madrid, Spain', date: 'Oct 15, 2026', daysLeft: 97, icon: 'airplane' },
    French: { destination: 'Paris, France', date: 'Dec 02, 2026', daysLeft: 145, icon: 'airplane' },
    Japanese: { destination: 'Tokyo, Japan', date: 'Nov 10, 2026', daysLeft: 123, icon: 'airplane' },
    German: { destination: 'Berlin, Germany', date: 'Sep 30, 2026', daysLeft: 82, icon: 'airplane' },
    Italian: { destination: 'Rome, Italy', date: 'Sep 05, 2026', daysLeft: 57, icon: 'airplane' }
  };

  const trip = tripDetails[profile.learningLanguage] || tripDetails['Spanish'];

  // Vocabulary prep percentage (mock progress but related to saved phrases size)
  const progress = Math.min(100, Math.round(50 + (2.5 * 10))); // mock progress but feels realistic

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={trip.icon} size={22} color="#ffffff" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.label}>UPCOMING ADVENTURE</Text>
          <Text style={styles.destination}>{trip.destination}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{trip.daysLeft} days left</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.tripFooter}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Departure Date</Text>
          <Text style={styles.footerValue}>{trip.date}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Vocab Readiness</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#7b4eff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#7b4eff',
    letterSpacing: 1,
    marginBottom: 2,
  },
  destination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  badge: {
    backgroundColor: '#fff1f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffa39e',
  },
  badgeText: {
    fontSize: 11,
    color: '#f5222d',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f2f5',
    marginVertical: 15,
  },
  tripFooter: {
    gap: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 13,
    color: '#777777',
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#777777',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#7b4eff',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f1ecff',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7b4eff',
    borderRadius: 4,
  },
});
