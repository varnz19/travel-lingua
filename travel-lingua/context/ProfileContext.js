import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ProfileContext = createContext();

const STORAGE_KEYS = {
  STATE: '@lang_app_global_state'
};

const DEFAULT_STATE = {
  // Authentication & Session
  isLoggedIn: false,

  // Profile & Preferences
  phoneNumber: '',
  username: 'sarahj',
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@example.com',
  password: 'password123',
  learningLanguage: 'Japanese',
  speechSpeed: 1.0,
  voiceGender: 'female',
  theme: 'light',
  accentColor: '#8B5CF6',
  notificationsEnabled: true,

  // Trip Planner & Survival Config
  trip: {
    destination: 'Tokyo, Japan',
    departureDate: '2026-08-25', // ISO YYYY-MM-DD
    duration: '14 days',
    purpose: 'Tourism',
    tripType: 'backpacking', // 'business' | 'backpacking' | 'family' | 'romantic' | 'tourism'
    isCompleted: false,
  },

  // Offline Downloaded Packs (pack IDs)
  downloadedPacks: ['pack_emergency', 'pack_arrival'],

  // Practice & Mastery Tracking
  practicedPhrases: {
    'sp_e1': { attempts: 3, lastScore: 92 },
    'sp_g1': { attempts: 5, lastScore: 98 },
    'sp_g2': { attempts: 2, lastScore: 85 },
    'sp_d2': { attempts: 1, lastScore: 78 }
  },

  // Gamification & Progress
  xp: 120,
  level: 1,
  coins: 50,
  streak: 7,
  weeklyStreak: [true, true, true, true, true, false, false], // Mon-Sun
  lessonsCompleted: 3,
  simulationsCompleted: 1,
  flashcardsLearned: 5,
  pronunciationPractices: 4,

  // Checklist of Daily Goals
  dailyGoals: [
    { id: 'dg1', label: 'Learn 5 phrases', completed: false, type: 'phrases', target: 5, current: 0 },
    { id: 'dg2', label: 'Complete one simulation', completed: false, type: 'simulation' },
    { id: 'dg3', label: 'Practice pronunciation', completed: false, type: 'pronunciation' },
    { id: 'dg4', label: 'Review flashcards', completed: false, type: 'flashcards' }
  ],

  // History & Lists
  savedPhrases: [
    { id: 'sp1', phrase: "Konnichiwa (こんにちは)", translation: "Hello / Good afternoon", language: "Japanese", pronunciation: "kohn-nee-chee-wah" },
    { id: 'sp2', phrase: "Mizu o kudasai (水をください)", translation: "Water, please", language: "Japanese", pronunciation: "mee-zoo oh koo-dah-sah-ee" }
  ],
  favoriteFlashcards: [],
  translationHistory: [
    { id: 'th1', sourceText: "Where is the station?", translatedText: "駅はどこですか？ (Eki wa doko desu ka?)", language: "Japanese" }
  ],
  recentActivity: [
    { id: 'ra1', type: 'lesson', title: 'Completed Basic Greetings', time: '2 hours ago' },
    { id: 'ra2', type: 'simulation', title: 'Finished Taxi Order', time: 'Yesterday' }
  ],
  notifications: [
    { id: 'n1', title: 'Time to practice!', message: 'Keep your 7-day streak alive!', read: false, time: '1 hour ago' },
    { id: 'n2', title: 'New Achievement Unlocked', message: 'You earned the "First Steps" badge!', read: true, time: 'Yesterday' }
  ],

  // Achievements
  achievements: [
    { id: 'ach1', title: 'First Steps', description: 'Start learning your first phrases', icon: 'footsteps', unlocked: true, progress: 100 },
    { id: 'ach2', title: 'Streak Master', description: 'Maintain a 7-day study streak', icon: 'flame', unlocked: true, progress: 100 },
    { id: 'ach3', title: 'Polyglot Guru', description: 'Try switching languages', icon: 'globe', unlocked: false, progress: 0 },
    { id: 'ach4', title: 'Word Wizard', description: 'Save more than 5 custom phrases', icon: 'book', unlocked: false, progress: 40 },
    { id: 'ach5', title: 'Quiz Master', description: 'Score a perfect 100% on a quiz', icon: 'trophy', unlocked: false, progress: 0 },
    { id: 'ach6', title: 'Restaurant Expert', description: 'Complete the Restaurant Simulation', icon: 'restaurant', unlocked: false, progress: 0 },
    { id: 'ach7', title: 'Language Explorer', description: 'Explore phrases in 3 different categories', icon: 'compass', unlocked: false, progress: 33 }
  ]
};

export const ProfileProvider = ({ children }) => {
  const [state, setState] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedState = await AsyncStorage.getItem(STORAGE_KEYS.STATE);
        if (storedState) {
          // Merge stored state with defaults to prevent crashes on schema expansion.
          // Always reset isLoggedIn to false so user must actively log in each session.
          setState(prev => ({
            ...prev,
            ...JSON.parse(storedState),
            isLoggedIn: false
          }));
        }
      } catch (error) {
        console.error('Error loading App State from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };
    loadState();
  }, []);

  // Helper to persist state
  const saveState = async (newState) => {
    try {
      setState(newState);
      await AsyncStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  // 1. Update Profile & Preferences
  const updateProfile = (profileData) => {
    const newState = {
      ...state,
      name: profileData.name !== undefined ? profileData.name : state.name,
      username: profileData.username !== undefined ? profileData.username : state.username,
      password: profileData.password !== undefined ? profileData.password : state.password,
      learningLanguage: profileData.learningLanguage !== undefined ? profileData.learningLanguage : state.learningLanguage,
      speechSpeed: profileData.speechSpeed !== undefined ? profileData.speechSpeed : state.speechSpeed,
      voiceGender: profileData.voiceGender !== undefined ? profileData.voiceGender : state.voiceGender,
      theme: profileData.theme !== undefined ? profileData.theme : state.theme,
      accentColor: profileData.accentColor !== undefined ? profileData.accentColor : state.accentColor,
      notificationsEnabled: profileData.notificationsEnabled !== undefined ? profileData.notificationsEnabled : state.notificationsEnabled,
    };

    // Check language change to trigger Polyglot Guru progress/unlock
    if (profileData.learningLanguage && profileData.learningLanguage !== state.learningLanguage) {
      newState.achievements = newState.achievements.map(ach => {
        if (ach.id === 'ach3') {
          return { ...ach, unlocked: true, progress: 100 };
        }
        return ach;
      });
      // Add notification
      newState.notifications = [
        { id: Date.now().toString(), title: 'Achievement Unlocked', message: 'You earned the "Polyglot Guru" badge!', read: false, time: 'Just now' },
        ...newState.notifications
      ];
      // Add Activity log
      newState.recentActivity = [
        { id: Date.now().toString(), type: 'badge', title: 'Unlocked Polyglot Guru Badge', time: 'Just now' },
        ...newState.recentActivity
      ];
    }

    saveState(newState);
  };

  // 2. Add custom phrase
  const addSavedPhrase = (phraseText, translationText, pronunciation = '') => {
    const newPhrase = {
      id: Date.now().toString(),
      phrase: phraseText,
      translation: translationText,
      language: state.learningLanguage,
      pronunciation
    };

    const updatedPhrases = [newPhrase, ...state.savedPhrases];
    const newState = {
      ...state,
      savedPhrases: updatedPhrases
    };

    // Track daily goal 'Learn 5 phrases'
    newState.dailyGoals = newState.dailyGoals.map(goal => {
      if (goal.type === 'phrases') {
        const nextCurrent = Math.min(goal.target, goal.current + 1);
        return {
          ...goal,
          current: nextCurrent,
          completed: nextCurrent >= goal.target
        };
      }
      return goal;
    });

    // Award XP and coins for saving a phrase
    newState.xp += 10;
    newState.coins += 2;

    // Check level up (every 200 XP is a level)
    const newLevel = Math.floor(newState.xp / 200) + 1;
    if (newLevel > newState.level) {
      newState.level = newLevel;
      newState.notifications = [
        { id: Date.now().toString(), title: 'Leveled Up!', message: `Congratulations, you reached Level ${newLevel}!`, read: false, time: 'Just now' },
        ...newState.notifications
      ];
    }

    // Update achievement 'Word Wizard'
    const wordWizardProgress = Math.min(100, Math.round((updatedPhrases.length / 5) * 100));
    newState.achievements = newState.achievements.map(ach => {
      if (ach.id === 'ach4') {
        return {
          ...ach,
          progress: wordWizardProgress,
          unlocked: wordWizardProgress >= 100
        };
      }
      return ach;
    });

    saveState(newState);
  };

  // 3. Delete custom phrase
  const deleteSavedPhrase = (id) => {
    const updatedPhrases = state.savedPhrases.filter(item => item.id !== id);
    saveState({
      ...state,
      savedPhrases: updatedPhrases
    });
  };

  // 4. Update Trip Details
  const updateTrip = (tripData) => {
    saveState({
      ...state,
      trip: {
        ...state.trip,
        ...tripData
      }
    });
  };

  // 5. Complete Lesson Action
  const completeLesson = (categoryKey) => {
    const newState = {
      ...state,
      lessonsCompleted: state.lessonsCompleted + 1,
      xp: state.xp + 50,
      coins: state.coins + 10
    };

    // Check level up
    const newLevel = Math.floor(newState.xp / 200) + 1;
    if (newLevel > newState.level) {
      newState.level = newLevel;
    }

    // Toggle daily goal
    newState.dailyGoals = newState.dailyGoals.map(goal => {
      if (goal.type === 'flashcards') {
        return { ...goal, completed: true };
      }
      return goal;
    });

    newState.recentActivity = [
      { id: Date.now().toString(), type: 'lesson', title: `Finished ${categoryKey} Lesson`, time: 'Just now' },
      ...newState.recentActivity
    ];

    saveState(newState);
  };

  // 6. Complete Simulation Action
  const completeSimulation = (scenarioKey, xpAwarded = 50) => {
    const newState = {
      ...state,
      simulationsCompleted: state.simulationsCompleted + 1,
      xp: state.xp + xpAwarded,
      coins: state.coins + 15
    };

    // Check level up
    const newLevel = Math.floor(newState.xp / 200) + 1;
    if (newLevel > newState.level) {
      newState.level = newLevel;
    }

    // Toggle daily goal
    newState.dailyGoals = newState.dailyGoals.map(goal => {
      if (goal.type === 'simulation') {
        return { ...goal, completed: true };
      }
      return goal;
    });

    // Check specific badges
    if (scenarioKey === 'restaurant') {
      newState.achievements = newState.achievements.map(ach => {
        if (ach.id === 'ach6') {
          return { ...ach, unlocked: true, progress: 100 };
        }
        return ach;
      });
    }

    newState.recentActivity = [
      { id: Date.now().toString(), type: 'simulation', title: `Completed ${scenarioKey} Simulation`, time: 'Just now' },
      ...newState.recentActivity
    ];

    saveState(newState);
  };

  // 7. Pronunciation Practice completed
  const completePronunciationPractice = (xpAwarded = 20) => {
    const newState = {
      ...state,
      pronunciationPractices: state.pronunciationPractices + 1,
      xp: state.xp + xpAwarded,
      coins: state.coins + 5
    };

    // Toggle daily goal
    newState.dailyGoals = newState.dailyGoals.map(goal => {
      if (goal.type === 'pronunciation') {
        return { ...goal, completed: true };
      }
      return goal;
    });

    newState.recentActivity = [
      { id: Date.now().toString(), type: 'practice', title: 'Completed Pronunciation Session', time: 'Just now' },
      ...newState.recentActivity
    ];

    saveState(newState);
  };

  // 8. Translation History Logging
  const addTranslationToHistory = (sourceText, translatedText) => {
    const newHistory = {
      id: Date.now().toString(),
      sourceText,
      translatedText,
      language: state.learningLanguage
    };
    saveState({
      ...state,
      translationHistory: [newHistory, ...state.translationHistory]
    });
  };

  // 9. Toggle Download Offline Pack
  const toggleDownloadPack = (packId) => {
    const current = state.downloadedPacks || [];
    const exists = current.includes(packId);
    const updated = exists ? current.filter(id => id !== packId) : [...current, packId];
    saveState({
      ...state,
      downloadedPacks: updated
    });
  };

  // 10. Record Practice Result for a Phrase
  const recordPracticeResult = (phraseId, score) => {
    const currentMap = state.practicedPhrases || {};
    const existing = currentMap[phraseId] || { attempts: 0, lastScore: 0 };
    const updatedMap = {
      ...currentMap,
      [phraseId]: {
        attempts: existing.attempts + 1,
        lastScore: score
      }
    };
    const newState = {
      ...state,
      practicedPhrases: updatedMap,
      pronunciationPractices: (state.pronunciationPractices || 0) + 1,
      xp: (state.xp || 0) + Math.round(score / 5)
    };
    saveState(newState);
  };

  // 11. Days Until Departure
  const getDaysUntilDeparture = () => {
    if (!state.trip?.departureDate) return 7;
    const dep = new Date(state.trip.departureDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((dep - now) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  };

  // 12. Calculate Scenario-by-Scenario Readiness
  const calculateScenarioReadiness = () => {
    const map = state.practicedPhrases || {};
    const count = Object.keys(map).length;
    const downloaded = state.downloadedPacks || [];

    // Calculate average practice score
    const scores = Object.values(map).map(p => p.lastScore || p.score || 85);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 88;

    return [
      {
        key: 'intro',
        title: 'Greetings & Introduction',
        icon: '👋',
        ready: true,
        masteredCount: 3,
        totalCount: 3,
        accuracy: Math.max(88, avgScore),
        status: 'ready',
        statusText: '3/3 Mastered'
      },
      {
        key: 'food',
        title: 'Food & Drinks',
        icon: '🍙',
        ready: count >= 1,
        masteredCount: count >= 1 ? 3 : 1,
        totalCount: 4,
        accuracy: Math.max(82, avgScore),
        status: count >= 1 ? 'ready' : 'needs_practice',
        statusText: count >= 1 ? '3/4 Mastered' : '1/4 Mastered'
      },
      {
        key: 'restaurant',
        title: 'Restaurant & Dining',
        icon: '🍜',
        ready: count >= 2,
        masteredCount: count >= 2 ? 3 : 1,
        totalCount: 3,
        accuracy: Math.max(80, avgScore),
        status: count >= 2 ? 'ready' : 'needs_practice',
        statusText: count >= 2 ? '3/3 Mastered' : '1/3 Mastered'
      },
      {
        key: 'airport',
        title: 'Airport & Flight',
        icon: '✈️',
        ready: downloaded.includes('pack_airport') || count >= 2,
        masteredCount: downloaded.includes('pack_airport') ? 4 : 2,
        totalCount: 4,
        accuracy: 90,
        status: (downloaded.includes('pack_airport') || count >= 2) ? 'ready' : 'needs_practice',
        statusText: downloaded.includes('pack_airport') ? 'Offline Pack Cached' : '2/4 Practiced'
      },
      {
        key: 'shops',
        title: 'Shops & Tax-Free Paying',
        icon: '🛍️',
        ready: count >= 3,
        masteredCount: count >= 3 ? 3 : 1,
        totalCount: 3,
        accuracy: Math.max(84, avgScore),
        status: count >= 3 ? 'ready' : 'needs_practice',
        statusText: count >= 3 ? '3/3 Mastered' : '1/3 Mastered'
      },
      {
        key: 'hotel',
        title: 'Hotel & Luggage',
        icon: '🏨',
        ready: count >= 2,
        masteredCount: count >= 2 ? 3 : 1,
        totalCount: 3,
        accuracy: 86,
        status: count >= 2 ? 'ready' : 'needs_practice',
        statusText: count >= 2 ? '3/3 Mastered' : '1/3 Mastered'
      },
      {
        key: 'directions',
        title: 'Directions & Subway',
        icon: '🗺️',
        ready: count >= 3,
        masteredCount: count >= 3 ? 4 : 2,
        totalCount: 4,
        accuracy: 85,
        status: count >= 3 ? 'ready' : 'needs_practice',
        statusText: count >= 3 ? '4/4 Mastered' : '2/4 Mastered'
      },
      {
        key: 'emergency',
        title: 'Emergency & Police Box',
        icon: '🚨',
        ready: downloaded.includes('pack_emergency') || count >= 1,
        masteredCount: downloaded.includes('pack_emergency') ? 4 : 2,
        totalCount: 4,
        accuracy: 94,
        status: (downloaded.includes('pack_emergency') || count >= 1) ? 'ready' : 'needs_practice',
        statusText: downloaded.includes('pack_emergency') ? 'Offline Audio Cached' : '2/4 Practiced'
      }
    ];
  };

  // 13. Reset progress entirely
  const resetProgress = () => {
    saveState(DEFAULT_STATE);
  };

  const login = (usrOrEmail, pwd) => {
    const input = (usrOrEmail || '').trim();
    const cleanUsr = input.toLowerCase();
    const cleanPwd = (pwd || '').trim();

    if (!cleanUsr || !cleanPwd) return false;

    const currentUsr = (state.username || '').trim().toLowerCase();
    const currentEmail = (state.email || '').trim().toLowerCase();
    const currentPhone = (state.phoneNumber || '').replace(/\s+/g, '').toLowerCase();
    const cleanInputPhone = cleanUsr.replace(/\s+/g, '');

    const isUsernameMatch = currentUsr && currentUsr === cleanUsr;
    const isEmailMatch = currentEmail && currentEmail === cleanUsr;
    const isPhoneMatch = currentPhone && cleanInputPhone && currentPhone === cleanInputPhone;
    const isPasswordMatch = (state.password || '').trim() === cleanPwd;

    // Demo account fallback check
    const isDemoMatch = (cleanUsr === 'sarahj' || cleanUsr === 'sarah.jenkins@example.com') && cleanPwd === 'password123';

    if (((isUsernameMatch || isEmailMatch || isPhoneMatch) && isPasswordMatch) || isDemoMatch) {
      saveState({
        ...state,
        isLoggedIn: true
      });
      return true;
    }
    return false;
  };

  const signup = (signupData, tripData = {}) => {
    saveState({
      ...state,
      phoneNumber: signupData.phoneNumber || state.phoneNumber,
      username: signupData.username || state.username,
      name: signupData.name || state.name,
      email: signupData.email || state.email,
      password: signupData.password || state.password,
      learningLanguage: signupData.learningLanguage || state.learningLanguage,
      trip: {
        destination: tripData.destination || state.trip.destination,
        departureDate: tripData.departureDate || state.trip.departureDate,
        duration: tripData.duration || state.trip.duration,
        purpose: tripData.purpose || state.trip.purpose
      },
      isLoggedIn: true
    });
    return true;
  };

  const logout = () => {
    saveState({
      ...state,
      isLoggedIn: false
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        ...state,
        username: state.username,
        profile: {
          username: state.username,
          name: state.name,
          password: state.password,
          learningLanguage: state.learningLanguage
        },
        loading,
        updateProfile,
        addSavedPhrase,
        deleteSavedPhrase,
        updateTrip,
        completeLesson,
        completeSimulation,
        completePronunciationPractice,
        addTranslationToHistory,
        toggleDownloadPack,
        recordPracticeResult,
        getDaysUntilDeparture,
        calculateScenarioReadiness,
        resetProgress,
        login,
        signup,
        logout
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
