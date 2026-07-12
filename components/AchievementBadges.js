import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../context/ProfileContext';

export default function AchievementBadges() {
  const { achievements } = useContext(ProfileContext);

  // Map icon names from context to Ionicons names
  const iconMap = {
    footsteps: 'footsteps-sharp',
    flame: 'flame-sharp',
    globe: 'globe-sharp',
    book: 'book-sharp'
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
                  name={iconMap[badge.icon] || 'trophy'}
                  size={26}
                  color={isUnlocked ? '#ffffff' : '#a0a0a0'}
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
                  <Ionicons name="lock-closed" size={10} color="#888888" style={{ marginRight: 2 }} />
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    paddingLeft: 4,
  },
  scrollContent: {
    paddingLeft: 4,
    paddingRight: 20,
    paddingVertical: 5,
  },
  badgeCard: {
    backgroundColor: '#ffffff',
    width: 130,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    textAlign: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8e0ff',
  },
  lockedBadgeCard: {
    backgroundColor: '#fafafa',
    borderColor: '#e8e8e8',
    opacity: 0.75,
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
    backgroundColor: '#7b4eff',
  },
  lockedIconContainer: {
    backgroundColor: '#e0e0e0',
  },
  titleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'center',
  },
  lockedTitleText: {
    color: '#777777',
  },
  descText: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 13,
    height: 26, // fix height to prevent alignment issues
  },
  lockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 8,
  },
  lockedTagText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#777777',
  },
});
