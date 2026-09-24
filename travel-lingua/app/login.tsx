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
  AlertCircle,
  ArrowRight,
  Globe,
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

  const handleLogin = async () => {
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

    // STRICT RULE: Reject any password below 8 characters
    if (pwd.length < 8) {
      const msg = 'Password must be at least 8 characters long.';
      setErrorMessage(msg);
      HapticsManager.light();
      if (Platform.OS !== 'web') Alert.alert('Invalid Password', msg);
      return;
    }

    const result = await login(usr, pwd);

    if (result && result.success) {
      HapticsManager.success();
      setTimeout(() => router.replace('/(tabs)'), 50);
    } else {
      HapticsManager.light();
      const msg = result?.error || 'Invalid credentials. Please verify your email and password.';
      setErrorMessage(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Login Failed', msg);
      }
    }
  };

  const handleGoogleLogin = async () => {
    HapticsManager.medium();
    await signup({
      phoneNumber: '',
      email: 'traveler@google.com',
      name: 'Google Traveler',
      username: 'googletraveler',
      password: 'GooglePass2026!',
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
                <Text style={styles.label}>EMAIL OR USERNAME</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={T.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email or username"
                    value={usernameInput}
                    onChangeText={(text) => { setUsernameInput(text); setErrorMessage(''); }}
                    autoCapitalize="none"
                    placeholderTextColor={T.textMuted}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <Text style={styles.passwordHint}>Min 8 characters</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={T.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="•••••••• (min 8 chars)"
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
    paddingVertical: 24,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  postmarkBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: T.postmark,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.primaryLight,
    marginBottom: 12,
  },
  brandTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 22,
    fontWeight: '800',
    color: T.ink,
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: T.textMuted,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  card: {
    backgroundColor: T.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 24,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  notchLeft: {
    position: 'absolute',
    left: -10,
    top: 70,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: T.paper,
    borderRightWidth: 1,
    borderColor: T.cardBorder,
  },
  notchRight: {
    position: 'absolute',
    right: -10,
    top: 70,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: T.paper,
    borderLeftWidth: 1,
    borderColor: T.cardBorder,
  },
  cardHeader: {
    marginBottom: 16,
  },
  boardingTag: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    fontWeight: '700',
    color: T.postmark,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: T.ink,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: T.textMuted,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: T.ink,
    letterSpacing: 1,
    marginBottom: 6,
  },
  passwordHint: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: T.textMuted,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: T.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: T.ink,
  },
  eyeIcon: {
    padding: 6,
  },
  loginBtn: {
    backgroundColor: T.postmark,
    borderRadius: 8,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: T.cardBorder,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: T.textMuted,
  },
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: T.cardBorder,
    borderRadius: 8,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  googleBtnText: {
    color: T.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  linkText: {
    fontSize: 13,
    color: T.textMuted,
  },
  linkAction: {
    fontSize: 13,
    fontWeight: '700',
    color: T.postmark,
  },
});
