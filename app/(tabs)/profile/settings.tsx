import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../../../context/ProfileContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const {
    username,
    password,
    learningLanguage,
    speechSpeed,
    theme,
    accentColor,
    notificationsEnabled,
    updateProfile,
    resetProgress
  } = useContext(ProfileContext);

  const router = useRouter();

  const [localUsername, setLocalUsername] = useState(username);
  const [localPassword, setLocalPassword] = useState(password);
  const [localLang, setLocalLang] = useState(learningLanguage);
  const [localSpeed, setLocalSpeed] = useState(speechSpeed || 1.0);
  const [localTheme, setLocalTheme] = useState(theme || 'light');
  const [localAccent, setLocalAccent] = useState(accentColor || '#8B5CF6');
  const [localNotif, setLocalNotif] = useState(notificationsEnabled !== undefined ? notificationsEnabled : true);
  const [showPassword, setShowPassword] = useState(false);

  const languages = [
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'French', flag: '🇫🇷' },
    { name: 'Japanese', flag: '🇯🇵' },
    { name: 'German', flag: '🇩🇪' },
    { name: 'Italian', flag: '🇮🇹' }
  ];

  const accents = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];

  const handleSave = () => {
    if (!localUsername.trim() || !localPassword.trim()) {
      Alert.alert('Required', 'Username and Password cannot be empty.');
      return;
    }

    updateProfile({
      username: localUsername.trim(),
      password: localPassword.trim(),
      learningLanguage: localLang,
      speechSpeed: localSpeed,
      theme: localTheme,
      accentColor: localAccent,
      notificationsEnabled: localNotif
    });

    Alert.alert(
      'Settings Saved',
      'Your preferences have been successfully updated!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Progress?',
      'This will erase all achievements, XP, levels, and saved phrases.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset Everything', 
          style: 'destructive',
          onPress: () => {
            resetProgress();
            Alert.alert("Reset Complete", "All data has been cleared.");
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionHeader}>Account Information</Text>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  value={localUsername}
                  onChangeText={setLocalUsername}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter password"
                  value={localPassword}
                  onChangeText={setLocalPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Accent Color */}
            <Text style={styles.label}>Accent Color</Text>
            <View style={styles.accentContainer}>
              {accents.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.accentCircle,
                    { backgroundColor: color },
                    localAccent === color && styles.accentCircleSelected
                  ]}
                  onPress={() => setLocalAccent(color)}
                />
              ))}
            </View>

            {/* Speeds */}
            <Text style={styles.label}>Voice Playback Speed</Text>
            <View style={styles.speedRow}>
              {speeds.map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedBtn,
                    localSpeed === speed && { backgroundColor: '#8B5CF6' }
                  ]}
                  onPress={() => setLocalSpeed(speed)}
                >
                  <Text style={[
                    styles.speedText,
                    localSpeed === speed && { color: '#FFF', fontWeight: 'bold' }
                  ]}>
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Daily Toggles */}
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Enable Reminders</Text>
              <TouchableOpacity 
                style={[styles.toggleSwitch, localNotif ? { backgroundColor: '#8B5CF6' } : { backgroundColor: '#E2E8F0' }]}
                onPress={() => setLocalNotif(!localNotif)}
              >
                <View style={[styles.toggleThumb, localNotif ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]} />
              </TouchableOpacity>
            </View>

            {/* Learning Language */}
            <Text style={[styles.label, { marginTop: 10, marginBottom: 8 }]}>Learning Language</Text>
            <View style={styles.languageContainer}>
              {languages.map((lang) => {
                const isSelected = localLang === lang.name;
                return (
                  <TouchableOpacity
                    key={lang.name}
                    style={[
                      styles.languageCard,
                      isSelected && { borderColor: '#8B5CF6', backgroundColor: '#FFF', borderWidth: 1.5 }
                    ]}
                    onPress={() => setLocalLang(lang.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text
                      style={[
                        styles.languageLabel,
                        isSelected && { color: '#8B5CF6', fontWeight: 'bold' }
                      ]}
                    >
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.85}
            >
              <Text style={styles.resetButtonText}>Reset Progress</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    },
  eyeIcon: {
    padding: 4,
  },
  accentContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  accentCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  accentCircleSelected: {
    borderColor: '#0F172A',
    borderWidth: 3,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  speedBtn: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  toggleSwitch: {
    width: 48,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 24,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    width: '48%',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    },
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    },
  resetButton: {
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
    }
});
