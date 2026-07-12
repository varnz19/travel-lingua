import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../context/ProfileContext';

export default function UpcomingTrip() {
  const { learningLanguage } = useContext(ProfileContext);

  const tripDetails = {
    Spanish: { destination: 'Madrid, Spain', date: 'Oct 15, 2026', daysLeft: 97, icon: 'airplane-outline' },
    French: { destination: 'Paris, France', date: 'Dec 02, 2026', daysLeft: 145, icon: 'airplane-outline' },
    Japanese: { destination: 'Tokyo, Japan', date: 'Nov 10, 2026', daysLeft: 123, icon: 'airplane-outline' },
    German: { destination: 'Berlin, Germany', date: 'Sep 30, 2026', daysLeft: 82, icon: 'airplane-outline' },
    Italian: { destination: 'Rome, Italy', date: 'Sep 05, 2026', daysLeft: 57, icon: 'airplane-outline' }
  };

  const trip = tripDetails[learningLanguage] || tripDetails['Spanish'];
  const progress = Math.min(100, Math.round(50 + (2.5 * 10)));

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={trip.icon} size={22} color="#8B5CF6" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.label}>UPCOMING TRIP</Text>
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
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
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
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  headerTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8B5CF6',
    letterSpacing: 1,
    marginBottom: 2,
    },
  destination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    },
  badge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: 'bold',
    },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
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
    color: '#475569',
    },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
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
    color: '#475569',
    },
  progressValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
});
