import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../context/ProfileContext';

export default function ProfileHeader() {
  const { profile } = useContext(ProfileContext);
  const navigation = useNavigation();

  // Language flag mapping
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
          <Text style={styles.avatarText}>{getInitials(profile.username)}</Text>
        </View>
        <View style={styles.profileTextContainer}>
          <Text style={styles.greetingText}>Hello, 👋</Text>
          <Text style={styles.usernameText}>{profile.username}</Text>
          <View style={styles.languageBadge}>
            <Text style={styles.languageFlag}>
              {languageFlags[profile.learningLanguage] || '🌐'}
            </Text>
            <Text style={styles.languageText}>Learning {profile.learningLanguage}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={24} color="#7b4eff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#7b4eff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
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
    backgroundColor: '#7b4eff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#e8e0ff',
  },
  avatarText: {
    color: '#ffffff',
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
    color: '#777777',
    fontWeight: '600',
  },
  usernameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1ecff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  languageFlag: {
    fontSize: 14,
    marginRight: 4,
  },
  languageText: {
    fontSize: 12,
    color: '#7b4eff',
    fontWeight: 'bold',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1ecff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
