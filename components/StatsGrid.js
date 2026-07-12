import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../context/ProfileContext';

export default function StatsGrid() {
  const { streak, lessonsCompleted, simulationsCompleted, savedPhrases } = useContext(ProfileContext);

  const studyTimeMins = (lessonsCompleted * 12) + (simulationsCompleted * 15);
  const formattedStudyTime = studyTimeMins >= 60 
    ? `${Math.floor(studyTimeMins / 60)}h ${studyTimeMins % 60}m`
    : `${studyTimeMins}m`;

  const statItems = [
    {
      id: 'studyTime',
      label: 'Study Time',
      value: formattedStudyTime,
      icon: 'time-outline',
      color: '#8B5CF6'
    },
    {
      id: 'phrasesLearned',
      label: 'Phrases Learned',
      value: savedPhrases.length,
      icon: 'book-outline',
      color: '#8B5CF6'
    },
    {
      id: 'streak',
      label: 'Daily Streak',
      value: `${streak} Days`,
      icon: 'flame-outline',
      color: '#8B5CF6'
    },
    {
      id: 'scenarios',
      label: 'Scenarios',
      value: simulationsCompleted,
      icon: 'chatbubbles-outline',
      color: '#8B5CF6'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Your Progress Stats</Text>
      <View style={styles.grid}>
        {statItems.map((item) => (
          <View key={item.id} style={styles.statCard}>
            <View style={styles.iconWrapper}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.valueText}>{item.value}</Text>
            <Text style={styles.labelText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
    paddingLeft: 4,
    },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFF',
    width: '48%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  labelText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    },
});
