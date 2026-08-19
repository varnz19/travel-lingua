import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileContext } from '../context/ProfileContext';
import { TravelTheme } from '../constants/TravelTheme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { HapticsManager } from '../utils/HapticsManager';
import {
  Plane,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Globe
} from 'lucide-react-native';

const T = TravelTheme.colors;

export default function LoginScreen() {
  const router = useRouter();
  const { login, signup, isLoggedIn } = useContext(ProfileContext);

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect to tabs
  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    setErrorMessage('');
    const usr = usernameInput.trim();
    const pwd = passwordInput.trim();

    if (!usr || !pwd) {
      const msg = 'Please enter both username/email and password.';
      setErrorMessage(msg);
      HapticsManager.light();
      if (Platform.OS !== 'web') Alert.alert('Error', msg);
      return;
    }

    const success = login(usr, pwd);

    if (success) {
      HapticsManager.success();
      setTimeout(() => router.replace('/(tabs)'), 50);
    } else {
      HapticsManager.light();
      const msg = 'Credentials not recognised. Try "sarahj" / "password123" or click Quick Fill Demo below.';
      setErrorMessage(msg);
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Login Failed',
          `Credentials not recognised.\n\nDefault demo account: "sarahj" / "password123"`
        );
      }
    }
  };

  const handleQuickDemo = () => {
    setUsernameInput('sarahj');
    setPasswordInput('password123');
    setErrorMessage('');
    HapticsManager.success();
    const success = login('sarahj', 'password123');
    if (success) {
      setTimeout(() => router.replace('/(tabs)'), 50);
    }
  };

  const handleGoogleLogin = () => {
    HapticsManager.medium();
    signup({
      phoneNumber: '',
      email: 'traveler@google.com',
      name: 'Sarah Jenkins',
      username: 'sarahj',
      password: 'password123',
      learningLanguage: 'Japanese'
    }, {});
    setTimeout(() => router.replace('/(tabs)'), 50);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.innerContainer}>
            {/* ── Brand Header (Boarding Pass Motif) ────────── */}
            <View style={styles.brandContainer}>
              <View style={styles.postmarkBadge}>
                <Plane size={24} color={T.postmark} strokeWidth={2.2} />
              </View>
              <Text style={styles.brandTitle}>TRAVEL-LINGUA</Text>
              <Text style={styles.brandSubtitle}>PRE-TRIP SURVIVAL PREP • PASSPORT READY</Text>
            </View>

            {/* ── Login Form Card ─────────────────────────── */}
            <View style={styles.card}>
              {/* Notches for boarding pass feel */}
              <View style={styles.notchLeft} />
              <View style={styles.notchRight} />

              <View style={styles.cardHeader}>
                <Text style={styles.boardingTag}>PASSENGER LOGIN</Text>
                <Text style={styles.cardTitle}>Welcome Back</Text>
                <Text style={styles.cardSubtitle}>Sign in to access your destination survival packs</Text>
              </View>

              {/* Error Banner */}
              {!!errorMessage && (
                <View style={styles.errorBanner}>
                  <AlertCircle size={16} color={T.postmark} style={{ marginRight: 8 }} />
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              )}

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>USERNAME, EMAIL OR PHONE</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={T.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="sarahj or email"
                    value={usernameInput}
                    onChangeText={(text) => { setUsernameInput(text); setErrorMessage(''); }}
                    autoCapitalize="none"
                    placeholderTextColor={T.textMuted}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={T.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChangeText={(text) => { setPasswordInput(text); setErrorMessage(''); }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    placeholderTextColor={T.textMuted}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={T.textMuted} />
                    ) : (
                      <Eye size={18} color={T.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button (Postmark Red Hero CTA) */}
              <AnimatedPressable style={styles.loginBtn} onPress={handleLogin}>
                <Text style={styles.loginBtnText}>Log In to Flight Prep</Text>
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </AnimatedPressable>

              {/* Quick Demo Button */}
              <AnimatedPressable style={styles.demoBtn} onPress={handleQuickDemo}>
                <Sparkles size={16} color={T.postmark} style={{ marginRight: 6 }} />
                <Text style={styles.demoBtnText}>Quick Fill Demo Account (sarahj)</Text>
              </AnimatedPressable>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Login */}
              <AnimatedPressable style={styles.googleBtn} onPress={handleGoogleLogin}>
                <Globe size={18} color={T.ink} style={{ marginRight: 8 }} />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </AnimatedPressable>

              {/* Redirect to Register */}
              <View style={styles.linkContainer}>
                <Text style={styles.linkText}>New traveler? </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={styles.linkAction}>Register Trip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.paper,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  innerContainer: {
    width: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  postmarkBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.primaryLight,
    borderWidth: 1.5,
    borderColor: T.postmark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 24,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: T.textMuted,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  card: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: T.sandLine,
    position: 'relative',
    overflow: 'hidden',
    ...TravelTheme.shadows.resting,
  },
  notchLeft: {
    position: 'absolute',
    left: -10,
    top: 60,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: T.paper,
    borderWidth: 1,
    borderColor: T.sandLine,
    zIndex: 10,
  },
  notchRight: {
    position: 'absolute',
    right: -10,
    top: 60,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: T.paper,
    borderWidth: 1,
    borderColor: T.sandLine,
    zIndex: 10,
  },
  cardHeader: {
    marginBottom: 20,
  },
  boardingTag: {
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    color: T.postmark,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.primaryLight,
    borderWidth: 1,
    borderColor: T.postmark,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: T.postmark,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.paper,
    borderWidth: 1,
    borderColor: T.sandLine,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: T.ink,
  },
  eyeIcon: {
    padding: 4,
  },
  loginBtn: {
    flexDirection: 'row',
    backgroundColor: T.postmark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
    ...TravelTheme.shadows.button,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  demoBtn: {
    flexDirection: 'row',
    backgroundColor: T.primaryLight,
    borderWidth: 1,
    borderColor: T.sandLine,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  demoBtnText: {
    color: T.postmark,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: T.sandLine,
  },
  dividerText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: T.textMuted,
    textTransform: 'uppercase',
  },
  googleBtn: {
    flexDirection: 'row',
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.sandLine,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    color: T.ink,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  linkText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
  },
  linkAction: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: T.postmark,
  },
});
