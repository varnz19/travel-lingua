import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../context/ProfileContext';

export default function StatsGrid() {
  const { stats, savedPhrases } = useContext(ProfileContext);

  // Stats definition with labels, icons, values and colors
  const statItems = [
    {
      id: 'studyTime',
      label: 'Study Time',
      value: stats.studyTime,
      icon: 'time-outline',
      color: '#36cfc9',
      bgColor: '#e6fffb'
    },
    {
      id: 'phrasesLearned',
      label: 'Phrases Learned',
      // Dynamically display phrases length if it is greater than the standard stats value
      value: Math.max(stats.phrasesLearned, savedPhrases.length),
      icon: 'book-outline',
      color: '#7b4eff',
      bgColor: '#f1ecff'
    },
    {
      id: 'streak',
      label: 'Daily Streak',
      value: `${stats.streak} Days`,
      icon: 'flame-outline',
      color: '#ff7a45',
      bgColor: '#fff2e8'
    },
    {
      id: 'scenarios',
      label: 'Scenarios',
      value: stats.scenarios,
      icon: 'chatbubbles-outline',
      color: '#ffec3d',
      colorIcon: '#ad8b00', // darker for visibility
      bgColor: '#feffe6'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Your Progress Stats</Text>
      <View style={styles.grid}>
        {statItems.map((item) => (
          <View key={item.id} style={styles.statCard}>
            <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon} size={24} color={item.colorIcon || item.color} />
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    paddingLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    width: '48%', // Ensures two cards fit side by side with spacing
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  labelText: {
    fontSize: 12,
    color: '#777777',
    fontWeight: '500',
  },
});
