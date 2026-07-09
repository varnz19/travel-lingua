import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ProfileContext = createContext();

const STORAGE_KEYS = {
  PROFILE: '@lang_app_profile',
  STATS: '@lang_app_stats',
  PHRASES: '@lang_app_phrases',
  ACHIEVEMENTS: '@lang_app_achievements'
};

const DEFAULT_PROFILE = {
  username: 'Sarah Jenkins',
  password: 'password123',
  learningLanguage: 'Spanish'
};

const DEFAULT_STATS = {
  studyTime: '12.5h',
  phrasesLearned: 3,
  streak: 14,
  scenarios: 8
};

const DEFAULT_PHRASES = {
  Spanish: [
    { id: '1', phrase: '¡Hola! ¿Cómo estás?', translation: 'Hello! How are you?', language: 'es' },
    { id: '2', phrase: 'Buenos días, mi amigo.', translation: 'Good morning, my friend.', language: 'es' },
    { id: '3', phrase: 'Una mesa para dos, por favor.', translation: 'A table for two, please.', language: 'es' }
  ],
  French: [
    { id: '1', phrase: 'Bonjour! Comment ça va?', translation: 'Hello! How is it going?', language: 'fr' },
    { id: '2', phrase: 'Enchanté de vous rencontrer.', translation: 'Nice to meet you.', language: 'fr' },
    { id: '3', phrase: 'Une table pour deux, s’il vous plaît.', translation: 'A table for two, please.', language: 'fr' }
  ],
  Japanese: [
    { id: '1', phrase: 'こんにちは！お元気ですか？', translation: 'Hello! How are you?', language: 'ja' },
    { id: '2', phrase: 'はじめまして。', translation: 'Nice to meet you.', language: 'ja' },
    { id: '3', phrase: '二人用のテーブルをお願いします。', translation: 'A table for two, please.', language: 'ja' }
  ],
  German: [
    { id: '1', phrase: 'Hallo! Wie geht es dir?', translation: 'Hello! How are you?', language: 'de' },
    { id: '2', phrase: 'Schön, Sie kennenzulernen.', translation: 'Nice to meet you.', language: 'de' },
    { id: '3', phrase: 'Einen Tisch für zwei, bitte.', translation: 'A table for two, please.', language: 'de' }
  ],
  Italian: [
    { id: '1', phrase: 'Ciao! Come stai?', translation: 'Hello! How are you?', language: 'it' },
    { id: '2', phrase: 'Piacere di conoscerti.', translation: 'Nice to meet you.', language: 'it' },
    { id: '3', phrase: 'Un tavolo per due, per favore.', translation: 'A table for two, please.', language: 'it' }
  ]
};

const DEFAULT_ACHIEVEMENTS = [
  { id: '1', title: 'First Steps', description: 'Start learning your first phrases', icon: 'footsteps', unlocked: true },
  { id: '2', title: 'Streak Master', description: 'Maintain a 14-day study streak', icon: 'flame', unlocked: true },
  { id: '3', title: 'Polyglot Guru', description: 'Try switching languages', icon: 'globe', unlocked: false },
  { id: '4', title: 'Word Wizard', description: 'Save more than 5 custom phrases', icon: 'book', unlocked: false }
];

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [savedPhrases, setSavedPhrases] = useState(DEFAULT_PHRASES['Spanish']);
  const [achievements, setAchievements] = useState(DEFAULT_ACHIEVEMENTS);
  const [loading, setLoading] = useState(true);

  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
        const storedStats = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
        const storedPhrases = await AsyncStorage.getItem(STORAGE_KEYS.PHRASES);
        const storedAchievements = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);

        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
        if (storedStats) {
          setStats(JSON.parse(storedStats));
        }
        if (storedPhrases) {
          setSavedPhrases(JSON.parse(storedPhrases));
        } else {
          // Default to Spanish phrases if none stored
          setSavedPhrases(DEFAULT_PHRASES['Spanish']);
        }
        if (storedAchievements) {
          setAchievements(JSON.parse(storedAchievements));
        }
      } catch (error) {
        console.error('Error loading states from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, []);

  // Sync profile details and update saved phrases language if default ones are used
  const updateProfile = async (newProfile) => {
    try {
      // If language changed, let's load default phrases for that language to demo TTS
      const langChanged = newProfile.learningLanguage !== profile.learningLanguage;
      let updatedPhrases = savedPhrases;

      if (langChanged) {
        // Load default phrases for new language
        updatedPhrases = DEFAULT_PHRASES[newProfile.learningLanguage] || DEFAULT_PHRASES['Spanish'];
        setSavedPhrases(updatedPhrases);
        await AsyncStorage.setItem(STORAGE_KEYS.PHRASES, JSON.stringify(updatedPhrases));

        // Unlock 'Polyglot Guru' achievement
        const updatedAchievements = achievements.map(ach => {
          if (ach.id === '3') {
            return { ...ach, unlocked: true };
          }
          return ach;
        });
        setAchievements(updatedAchievements);
        await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updatedAchievements));
      }

      setProfile(newProfile);
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
    } catch (error) {
      console.error('Error saving profile to AsyncStorage:', error);
    }
  };

  // Add custom phrase
  const addSavedPhrase = async (phraseText, translationText) => {
    try {
      const langMap = {
        Spanish: 'es',
        French: 'fr',
        Japanese: 'ja',
        German: 'de',
        Italian: 'it'
      };
      const langCode = langMap[profile.learningLanguage] || 'es';

      const newPhrase = {
        id: Date.now().toString(),
        phrase: phraseText,
        translation: translationText,
        language: langCode
      };

      const updatedPhrases = [newPhrase, ...savedPhrases];
      setSavedPhrases(updatedPhrases);
      await AsyncStorage.setItem(STORAGE_KEYS.PHRASES, JSON.stringify(updatedPhrases));

      // Update stats: phrases learned
      const updatedStats = {
        ...stats,
        phrasesLearned: stats.phrasesLearned + 1
      };
      setStats(updatedStats);
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));

      // Check for Word Wizard achievement
      if (updatedPhrases.length > 5) {
        const updatedAchievements = achievements.map(ach => {
          if (ach.id === '4') {
            return { ...ach, unlocked: true };
          }
          return ach;
        });
        setAchievements(updatedAchievements);
        await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updatedAchievements));
      }
    } catch (error) {
      console.error('Error adding saved phrase:', error);
    }
  };

  // Delete phrase
  const deleteSavedPhrase = async (id) => {
    try {
      const updatedPhrases = savedPhrases.filter(item => item.id !== id);
      setSavedPhrases(updatedPhrases);
      await AsyncStorage.setItem(STORAGE_KEYS.PHRASES, JSON.stringify(updatedPhrases));
    } catch (error) {
      console.error('Error deleting saved phrase:', error);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        stats,
        savedPhrases,
        achievements,
        loading,
        updateProfile,
        addSavedPhrase,
        deleteSavedPhrase
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
