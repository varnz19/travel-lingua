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
import { ProfileContext } from '../context/ProfileContext';

export default function SettingsScreen({ navigation }) {
  const { profile, updateProfile } = useContext(ProfileContext);

  // Local state for form fields
  const [username, setUsername] = useState(profile.username);
  const [password, setPassword] = useState(profile.password);
  const [learningLanguage, setLearningLanguage] = useState(profile.learningLanguage);
  const [showPassword, setShowPassword] = useState(false);

  // Available languages list with icons
  const languages = [
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'French', flag: '🇫🇷' },
    { name: 'Japanese', flag: '🇯🇵' },
    { name: 'German', flag: '🇩🇪' },
    { name: 'Italian', flag: '🇮🇹' }
  ];

  const handleSave = () => {
    if (!username.trim()) {
      Alert.alert('Required Field', 'Username cannot be empty.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Required Field', 'Password cannot be empty.');
      return;
    }

    updateProfile({
      username: username.trim(),
      password: password.trim(),
      learningLanguage
    });

    Alert.alert(
      'Settings Saved',
      'Your profile changes have been updated in real-time!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
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
          {/* Back button and header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile Settings</Text>
            <View style={{ width: 40 }} /> {/* spacer to center title */}
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionHeader}>Edit Profile Info</Text>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#7b4eff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#7b4eff" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
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
                    color="#888888"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Language Selection */}
            <Text style={[styles.label, { marginTop: 10, marginBottom: 8 }]}>Select Learning Language</Text>
            <View style={styles.languageContainer}>
              {languages.map((lang) => {
                const isSelected = learningLanguage === lang.name;
                return (
                  <TouchableOpacity
                    key={lang.name}
                    style={[
                      styles.languageCard,
                      isSelected && styles.languageCardSelected
                    ]}
                    onPress={() => setLearningLanguage(lang.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text
                      style={[
                        styles.languageLabel,
                        isSelected && styles.languageLabelSelected
                      ]}
                    >
                      {lang.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark-circle" size={16} color="#7b4eff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Ionicons name="save-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
    backgroundColor: '#f8f9ff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9fc',
    borderWidth: 1,
    borderColor: '#e2e2e9',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333333',
  },
  eyeIcon: {
    padding: 4,
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
    backgroundColor: '#f9f9fc',
    borderWidth: 1,
    borderColor: '#e2e2e9',
    borderRadius: 12,
    width: '48%', // two per row
    paddingHorizontal: 12,
    paddingVertical: 12,
    position: 'relative',
  },
  languageCardSelected: {
    backgroundColor: '#f1ecff',
    borderColor: '#7b4eff',
    borderWidth: 1.5,
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },
  languageLabelSelected: {
    color: '#7b4eff',
    fontWeight: 'bold',
  },
  checkmark: {
    position: 'absolute',
    right: 8,
    top: 12,
  },
  saveButton: {
    backgroundColor: '#7b4eff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#7b4eff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
