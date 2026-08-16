import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../context/ProfileContext';

export default function ProfileHeader() {
  const { name, username, learningLanguage } = useContext(ProfileContext);
  const router = useRouter();
  const displayName = name || username;

  const languageFlags = {
    Spanish: '🇪🇸',
    French: '🇫🇷',
    Japanese: '🇯🇵',
    German: '🇩🇪',
    Italian: '🇮🇹'
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
        </View>
        <View style={styles.profileTextContainer}>
          <Text style={styles.greetingText}>Hello</Text>
          <Text style={styles.usernameText}>{displayName}</Text>
          <View style={styles.languageBadge}>
            <Text style={styles.languageFlag}>
              {languageFlags[learningLanguage] || '🌐'}
            </Text>
            <Text style={styles.languageText}>Learning {learningLanguage}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push('/profile/settings')}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={22} color="#2563EB" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  profileTextContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    },
  usernameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  languageFlag: {
    fontSize: 14,
    marginRight: 4,
  },
  languageText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: 'bold',
    },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
});
