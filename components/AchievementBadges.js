import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../context/ProfileContext';

export default function AchievementBadges() {
  const { achievements } = useContext(ProfileContext);

  const iconMap = {
    footsteps: 'footsteps-outline',
    flame: 'flame-outline',
    globe: 'globe-outline',
    book: 'book-outline',
    trophy: 'trophy-outline',
    restaurant: 'restaurant-outline',
    compass: 'compass-outline'
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Achievements Badges</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {achievements.map((badge) => {
          const isUnlocked = badge.unlocked;
          return (
            <View
              key={badge.id}
              style={[
                styles.badgeCard,
                !isUnlocked && styles.lockedBadgeCard
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  isUnlocked ? styles.unlockedIconContainer : styles.lockedIconContainer
                ]}
              >
                <Ionicons
                  name={iconMap[badge.icon] || 'trophy-outline'}
                  size={26}
                  color={isUnlocked ? '#FBBF24' : '#94A3B8'}
                />
              </View>
              <Text
                style={[
                  styles.titleText,
                  !isUnlocked && styles.lockedTitleText
                ]}
                numberOfLines={1}
              >
                {badge.title}
              </Text>
              <Text style={styles.descText} numberOfLines={2}>
                {badge.description}
              </Text>
              
              {!isUnlocked && (
                <View style={styles.lockedTag}>
                  <Ionicons name="lock-closed-outline" size={10} color="#94A3B8" style={{ marginRight: 2 }} />
                  <Text style={styles.lockedTagText}>LOCKED</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
    paddingLeft: 4,
    },
  scrollContent: {
    paddingLeft: 4,
    paddingRight: 20,
    paddingVertical: 5,
  },
  badgeCard: {
    backgroundColor: '#FFF',
    width: 130,
    borderRadius: 20,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  lockedBadgeCard: {
    backgroundColor: '#FFF',
    borderColor: '#CBD5E1',
    opacity: 0.65,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  unlockedIconContainer: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  lockedIconContainer: {
    backgroundColor: '#F1F5F9',
  },
  titleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
    },
  lockedTitleText: {
    color: '#94A3B8',
  },
  descText: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 13,
    height: 26,
    },
  lockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  lockedTagText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94A3B8',
    },
});
