import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { getApiBaseUrl } from '../services/apiConfig';

export const ProfileContext = createContext();

const STORAGE_KEYS = {
  STATE: '@lang_app_global_state'
};

const DEFAULT_STATE = {
  // Authentication & Session
  isLoggedIn: false,

  // Traveler Credentials & Profile
  phoneNumber: '',
  username: '',
  name: '',
  email: '',
  password: '',
  learningLanguage: 'Japanese',
  speechSpeed: 1.0,
  voiceGender: 'female',
  theme: 'light',
  accentColor: '#8B5CF6',
  notificationsEnabled: true,

  // Trip Planner & Survival Config
  trip: {
    destination: 'Tokyo, Japan',
    departureDate: '2026-08-25',
    duration: '14 days',
    purpose: 'Tourism',
    tripType: 'backpacking',
    isCompleted: false,
  },

  // Offline Downloaded Packs (clean state - no fake downloads)
  downloadedPacks: [],

  // Practice & Mastery Tracking (clean state - zero fake scores)
  practicedPhrases: {},

  // Gamification & Progress (starts fresh from real practice)
  xp: 0,
  level: 1,
  coins: 0,
  streak: 0,
  weeklyStreak: [false, false, false, false, false, false, false],
  lessonsCompleted: 0,
  simulationsCompleted: 0,
  flashcardsLearned: 0,
  pronunciationPractices: 0,

  // Checklist of Daily Goals
  dailyGoals: [
    { id: 'dg1', label: 'Learn 5 phrases', completed: false, type: 'phrases', target: 5, current: 0 },
    { id: 'dg2', label: 'Complete one simulation', completed: false, type: 'simulation' },
    { id: 'dg3', label: 'Practice pronunciation', completed: false, type: 'pronunciation' },
    { id: 'dg4', label: 'Review flashcards', completed: false, type: 'flashcards' }
  ],

  // History & Lists (starts clean - populated dynamically from user action)
  savedPhrases: [],
  favoriteFlashcards: [],
  translationHistory: [],
  recentActivity: [],
  notifications: [],

  // Achievements (tracked live from real user progress)
  achievements: [
    { id: 'ach1', title: 'First Steps', description: 'Start learning your first phrases', icon: 'footsteps', unlocked: false, progress: 0 },
    { id: 'ach2', title: 'Streak Master', description: 'Maintain a 7-day study streak', icon: 'flame', unlocked: false, progress: 0 },
    { id: 'ach3', title: 'Polyglot Guru', description: 'Try switching languages', icon: 'globe', unlocked: false, progress: 0 },
    { id: 'ach4', title: 'Word Wizard', description: 'Save more than 5 custom phrases', icon: 'book', unlocked: false, progress: 0 },
    { id: 'ach5', title: 'Quiz Master', description: 'Score a perfect 100% on a quiz', icon: 'trophy', unlocked: false, progress: 0 },
    { id: 'ach6', title: 'Restaurant Expert', description: 'Complete the Restaurant Simulation', icon: 'restaurant', unlocked: false, progress: 0 },
    { id: 'ach7', title: 'Language Explorer', description: 'Explore phrases in 3 different categories', icon: 'compass', unlocked: false, progress: 0 }
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
          const parsed = JSON.parse(storedState);
          // Always maintain zero dummy data for clean fields
          setState(prev => ({
            ...prev,
            ...parsed,
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

  const saveState = async (newState) => {
    try {
      setState(newState);
      await AsyncStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

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

    if (profileData.learningLanguage && profileData.learningLanguage !== state.learningLanguage) {
      newState.achievements = newState.achievements.map(ach => {
        if (ach.id === 'ach3') {
          return { ...ach, unlocked: true, progress: 100 };
        }
        return ach;
      });
      newState.notifications = [
        { id: Date.now().toString(), title: 'Achievement Unlocked', message: 'You earned the "Polyglot Guru" badge!', read: false, time: 'Just now' },
        ...newState.notifications
      ];
      newState.recentActivity = [
        { id: Date.now().toString(), type: 'badge', title: 'Unlocked Polyglot Guru Badge', time: 'Just now' },
        ...newState.recentActivity
      ];
    }

    saveState(newState);
  };

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
      savedPhrases: updatedPhrases,
      xp: state.xp + 10,
      coins: state.coins + 2
    };

    saveState(newState);
  };

  const deleteSavedPhrase = (id) => {
    const updatedPhrases = state.savedPhrases.filter(item => item.id !== id);
    saveState({
      ...state,
      savedPhrases: updatedPhrases
    });
  };

  const updateTrip = (tripData) => {
    saveState({
      ...state,
      trip: {
        ...state.trip,
        ...tripData
      }
    });
  };

  const completeLesson = (categoryKey) => {
    const newState = {
      ...state,
      lessonsCompleted: state.lessonsCompleted + 1,
      xp: state.xp + 50,
      coins: state.coins + 10
    };
    saveState(newState);
  };

  const completeSimulation = (scenarioKey, xpAwarded = 50) => {
    const newState = {
      ...state,
      simulationsCompleted: state.simulationsCompleted + 1,
      xp: state.xp + xpAwarded,
      coins: state.coins + 15
    };
    saveState(newState);
  };

  const completePronunciationPractice = (xpAwarded = 20) => {
    const newState = {
      ...state,
      pronunciationPractices: state.pronunciationPractices + 1,
      xp: state.xp + xpAwarded,
      coins: state.coins + 5
    };
    saveState(newState);
  };

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

  const toggleDownloadPack = (packId) => {
    const current = state.downloadedPacks || [];
    const exists = current.includes(packId);
    const updated = exists ? current.filter(id => id !== packId) : [...current, packId];
    saveState({
      ...state,
      downloadedPacks: updated
    });
  };

  const recordPracticeResult = (phraseId, score) => {
    const current = state.practicedPhrases || {};
    const existing = current[phraseId] || { attempts: 0, lastScore: 0 };
    const updated = {
      ...current,
      [phraseId]: {
        attempts: existing.attempts + 1,
        lastScore: score
      }
    };
    saveState({
      ...state,
      practicedPhrases: updated,
      xp: state.xp + 15
    });
  };

  const getDaysUntilDeparture = () => {
    if (!state.trip?.departureDate) return 0;
    const dep = new Date(state.trip.departureDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((dep - now) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  };

  const calculateScenarioReadiness = () => {
    const map = state.practicedPhrases || {};
    const count = Object.keys(map).length;
    const downloaded = state.downloadedPacks || [];
    const scores = Object.values(map).map(p => p.lastScore || 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return [
      { key: 'intro', title: 'Greetings & Introduction', icon: '👋', ready: count >= 1, masteredCount: count >= 1 ? 1 : 0, totalCount: 3, accuracy: avgScore || 0, status: count >= 1 ? 'ready' : 'needs_practice', statusText: `${count >= 1 ? 1 : 0}/3 Mastered` },
      { key: 'food', title: 'Food & Drinks', icon: '🍙', ready: count >= 2, masteredCount: count >= 2 ? 1 : 0, totalCount: 4, accuracy: avgScore || 0, status: count >= 2 ? 'ready' : 'needs_practice', statusText: `${count >= 2 ? 1 : 0}/4 Mastered` },
      { key: 'restaurant', title: 'Restaurant & Dining', icon: '🍜', ready: count >= 3, masteredCount: count >= 3 ? 1 : 0, totalCount: 3, accuracy: avgScore || 0, status: count >= 3 ? 'ready' : 'needs_practice', statusText: `${count >= 3 ? 1 : 0}/3 Mastered` },
      { key: 'airport', title: 'Airport & Flight', icon: '✈️', ready: downloaded.includes('pack_airport') || count >= 4, masteredCount: downloaded.includes('pack_airport') ? 2 : 0, totalCount: 4, accuracy: avgScore || 0, status: (downloaded.includes('pack_airport') || count >= 4) ? 'ready' : 'needs_practice', statusText: downloaded.includes('pack_airport') ? 'Offline Pack Cached' : '0/4 Practiced' },
      { key: 'shops', title: 'Shops & Tax-Free Paying', icon: '🛍️', ready: count >= 5, masteredCount: count >= 5 ? 1 : 0, totalCount: 3, accuracy: avgScore || 0, status: count >= 5 ? 'ready' : 'needs_practice', statusText: `${count >= 5 ? 1 : 0}/3 Mastered` },
      { key: 'hotel', title: 'Hotel & Luggage', icon: '🏨', ready: count >= 6, masteredCount: count >= 6 ? 1 : 0, totalCount: 3, accuracy: avgScore || 0, status: count >= 6 ? 'ready' : 'needs_practice', statusText: `${count >= 6 ? 1 : 0}/3 Mastered` },
      { key: 'directions', title: 'Directions & Subway', icon: '🗺️', ready: count >= 7, masteredCount: count >= 7 ? 1 : 0, totalCount: 4, accuracy: avgScore || 0, status: count >= 7 ? 'ready' : 'needs_practice', statusText: `${count >= 7 ? 1 : 0}/4 Mastered` },
      { key: 'emergency', title: 'Emergency & Police Box', icon: '🚨', ready: downloaded.includes('pack_emergency'), masteredCount: downloaded.includes('pack_emergency') ? 2 : 0, totalCount: 4, accuracy: avgScore || 0, status: downloaded.includes('pack_emergency') ? 'ready' : 'needs_practice', statusText: downloaded.includes('pack_emergency') ? 'Offline Audio Cached' : '0/4 Practiced' }
    ];
  };

  const resetProgress = () => {
    saveState(DEFAULT_STATE);
  };

  // Demo pass credentials: demo@gmail.com / 12345678
  const login = async (usrOrEmail, pwd) => {
    const input = (usrOrEmail || '').trim();
    const cleanPwd = (pwd || '').trim();

    if (!input || !cleanPwd) {
      return { success: false, error: 'Please enter both email/username and password.' };
    }

    // STRICT PASSWORD RULE: Must be at least 8 characters
    if (cleanPwd.length < 8) {
      return {
        success: false,
        error: 'Password must be at least 8 characters long.'
      };
    }

    try {
      const email = input.includes('@') ? input : `${input}@travellingua.local`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: cleanPwd
      });

      if (error) {
        return { success: false, error: error.message };
      }

      saveState({
        ...state,
        email: data.user?.email || state.email,
        isLoggedIn: true
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message || 'Login failed' };
    }
  };

  // Real Supabase Signup with strict 8+ character password rule
  const signup = async (signupData, tripData = {}) => {
    try {
      const finalEmail = signupData.email 
        ? signupData.email.trim() 
        : `${signupData.username.trim().toLowerCase()}@travellingua.local`;
      const finalPassword = (signupData.password || '').trim();

      // STRICT PASSWORD RULE: Minimum 8 characters
      if (finalPassword.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long.'
        };
      }

      // 1. Sign up directly in Supabase auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: finalEmail,
        password: finalPassword,
        options: {
          data: {
            username: signupData.username.trim(),
            full_name: signupData.name.trim(),
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      const userId = authData.user?.id;

      // 2. Insert into public.profiles
      if (userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            username: signupData.username.trim(),
            full_name: signupData.name.trim(),
            native_language: 'en'
          }, { onConflict: 'id' });

        if (profileError) {
          console.warn('Profile write warning:', profileError.message);
        }
      }

      // 3. Sync with FastAPI Backend DB Gateway
      try {
        await fetch(`${getApiBaseUrl()}/api/v1/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: finalEmail,
            username: signupData.username.trim(),
            name: signupData.name.trim(),
            password: finalPassword,
            destination: tripData.destination || 'Tokyo, Japan',
            learning_language: signupData.learningLanguage || 'Japanese',
          })
        });
      } catch (_backendErr) {
        // Non-blocking sync fallback
      }

      // 4. Persist local state for UI responsiveness (with 0 dummy clutter)
      saveState({
        ...state,
        phoneNumber: signupData.phoneNumber || '',
        username: signupData.username || 'traveler',
        name: signupData.name || 'Traveler',
        email: finalEmail,
        password: finalPassword,
        learningLanguage: signupData.learningLanguage || 'Japanese',
        trip: {
          destination: tripData.destination || 'Tokyo, Japan',
          departureDate: tripData.departureDate || '2026-08-25',
          duration: tripData.duration || '14 days',
          purpose: tripData.purpose || 'Backpacking',
          tripType: 'backpacking',
          isCompleted: false
        },
        savedPhrases: [],
        translationHistory: [],
        recentActivity: [],
        notifications: [],
        xp: 0,
        streak: 0,
        isLoggedIn: true
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to complete registration' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    }
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