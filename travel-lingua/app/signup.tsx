import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plane,
  Search,
  User,
  X
} from 'lucide-react-native';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { TravelTheme } from '../constants/TravelTheme';
import { ProfileContext } from '../context/ProfileContext';
import { HapticsManager } from '../utils/HapticsManager';

const T = TravelTheme.colors;

const COUNTRY_CODES = [
  { name: 'India', code: '+91', flag: '🇮🇳', digits: [10] },
  { name: 'USA / Canada', code: '+1', flag: '🇺🇸', digits: [10] },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', digits: [10, 11] },
  { name: 'Japan', code: '+81', flag: '🇯🇵', digits: [10, 11] },
  { name: 'France', code: '+33', flag: '🇫🇷', digits: [9, 10] },
  { name: 'Germany', code: '+49', flag: '🇩🇪', digits: [10, 11] },
  { name: 'Italy', code: '+39', flag: '🇮🇹', digits: [9, 10] },
  { name: 'Australia', code: '+61', flag: '🇦🇺', digits: [9] },
  { name: 'Spain', code: '+34', flag: '🇪🇸', digits: [9] },
  { name: 'Brazil', code: '+55', flag: '🇧🇷', digits: [10, 11] },
  { name: 'China', code: '+86', flag: '🇨🇳', digits: [11] },
  { name: 'South Korea', code: '+82', flag: '🇰🇷', digits: [9, 10] },
  { name: 'Mexico', code: '+52', flag: '🇲🇽', digits: [10] },
  { name: 'UAE', code: '+971', flag: '🇦🇪', digits: [9] },
  { name: 'Singapore', code: '+65', flag: '🇸🇬', digits: [8] },
];

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useContext(ProfileContext);

  const [step, setStep] = useState<1 | 1.5 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 states
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [emailInput, setEmailInput] = useState('');

  // Phone state
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneInput, setPhoneInput] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);

  const otpRef0 = React.useRef<TextInput>(null);
  const otpRef1 = React.useRef<TextInput>(null);
  const otpRef2 = React.useRef<TextInput>(null);
  const otpRef3 = React.useRef<TextInput>(null);
  const otpRef4 = React.useRef<TextInput>(null);
  const otpRef5 = React.useRef<TextInput>(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3, otpRef4, otpRef5];

  // Step 2 states
  const [nameInput, setNameInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 3 states
  const [selectedLang, setSelectedLang] = useState('Japanese');
  const [destination, setDestination] = useState('Tokyo, Japan');
  const [departureDate, setDepartureDate] = useState('2026-08-25');
  const [duration, setDuration] = useState('14 days');
  const [purpose, setPurpose] = useState('Backpacking');

  const languages = [
    { name: 'Japanese', flag: '🇯🇵' },
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'French', flag: '🇫🇷' },
    { name: 'German', flag: '🇩🇪' },
    { name: 'Italian', flag: '🇮🇹' }
  ];

  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  const handleSendOtp = () => {
    HapticsManager.medium();
    if (contactType === 'email') {
      if (!emailInput.trim() || !emailInput.includes('@')) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
    } else {
      if (!phoneInput.trim()) {
        Alert.alert('Required', 'Please enter your phone number.');
        return;
      }
    }

    const otp = generateOtp();
    setGeneratedOtp(otp);
    setOtpInput(['', '', '', '', '', '']);

    if (Platform.OS === 'web') {
      alert(`📱 OTP Sent\n\nYour verification code is: ${otp}\n\n(In production, this would arrive via SMS/Email)`);
      setStep(1.5);
    } else {
      Alert.alert(
        '📱 OTP Sent',
        `Your verification code is: ${otp}\n\n(In production, this would arrive via SMS/Email)`,
        [{ text: 'Got it', onPress: () => setStep(1.5) }]
      );
    }
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otpInput.join('');
    if (enteredOtp.length < 6) {
      Alert.alert('Incomplete', 'Please enter all 6 digits of your OTP.');
      return;
    }
    if (enteredOtp !== generatedOtp) {
      Alert.alert('Invalid OTP', 'The code you entered is incorrect. Please try again.');
      return;
    }
    HapticsManager.success();
    setStep(2);
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otpInput];
    newOtp[index] = value;
    setOtpInput(newOtp);
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
    if (!value && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Password Strength Evaluation
  const evaluatePassword = (pwd: string) => {
    const p = pwd || '';
    const hasMinLength = p.length >= 8;
    const hasLower = /[a-z]/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);

    let score = 0;
    if (hasMinLength) score += 1;
    if (hasLower && hasUpper) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
    if (p.length >= 12) score += 1;

    let label = 'Too Short';
    let color = '#DC2626';

    if (!hasMinLength) {
      label = `${p.length}/8 characters`;
      color = '#DC2626';
    } else if (score <= 2) {
      label = 'Weak';
      color = '#EA580C';
    } else if (score === 3) {
      label = 'Good';
      color = '#CA8A04';
    } else if (score === 4) {
      label = 'Strong';
      color = '#16A34A';
    } else {
      label = 'Very Strong';
      color = '#059669';
    }

    return {
      score,
      label,
      color,
      hasMinLength,
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial
    };
  };

  const passwordStrength = evaluatePassword(passwordInput);

  const handleStep2Next = () => {
    if (!nameInput.trim() || !usernameInput.trim() || !passwordInput.trim()) {
      Alert.alert('Required', 'Please fill in Name, Username, and Password to proceed.');
      return;
    }
    // STRICT PASSWORD RULE: Minimum 8 characters
    if (passwordInput.trim().length < 8) {
      Alert.alert(
        'Password Too Short',
        'Password must be at least 8 characters long.'
      );
      return;
    }
    if (passwordStrength.score < 2) {
      Alert.alert(
        'Weak Password',
        'Please create a stronger password by including numbers or uppercase letters.'
      );
      return;
    }
    HapticsManager.medium();
    setStep(3);
  };

  const handleSignup = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    HapticsManager.medium();

    const signupData = {
      phoneNumber: contactType === 'phone' ? `${selectedCountry.code} ${phoneInput.trim()}` : '',
      email: contactType === 'email' ? emailInput.trim() : '',
      name: nameInput.trim(),
      username: usernameInput.trim(),
      password: passwordInput.trim(),
      learningLanguage: selectedLang
    };

    const tripData = {
      destination: destination || 'Tokyo, Japan',
      departureDate: departureDate || '2026-08-25',
      duration: duration || '14 days',
      purpose: purpose || 'Backpacking'
    };

    const result = await signup(signupData, tripData);
    setIsSubmitting(false);

    if (result && result.success) {
      HapticsManager.success();
      router.replace('/(tabs)');
    } else {
      const errorMsg = result?.error || 'Registration failed. Please try again.';
      if (Platform.OS === 'web') {
        alert(`Error: ${errorMsg}`);
      } else {
        Alert.alert('Registration Error', errorMsg);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.brandContainer}>
            <View style={styles.postmarkBadge}>
              <Plane size={24} color={T.postmark} strokeWidth={2.2} />
            </View>
            <Text style={styles.brandTitle}>TRAVEL-LINGUA</Text>
            <Text style={styles.brandSubtitle}>NEW PASSENGER REGISTRATION</Text>
          </View>

          {/* ── STEP 1: Contact Input ── */}
          {step === 1 && (
            <View style={styles.card}>
              <View style={styles.notchLeft} />
              <View style={styles.notchRight} />

              <Text style={styles.boardingTag}>STEP 1 OF 3 • CONTACT</Text>
              <Text style={styles.cardTitle}>Begin Flight Prep</Text>
              <Text style={styles.cardSubtitle}>Choose your verification channel</Text>

              <View style={styles.toggleBar}>
                <TouchableOpacity
                  style={[styles.toggleTab, contactType === 'email' && styles.toggleTabActive]}
                  onPress={() => { HapticsManager.light(); setContactType('email'); }}
                >
                  <Mail size={16} color={contactType === 'email' ? T.postmark : T.textMuted} style={{ marginRight: 6 }} />
                  <Text style={[styles.toggleText, contactType === 'email' && styles.toggleTextActive]}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleTab, contactType === 'phone' && styles.toggleTabActive]}
                  onPress={() => { HapticsManager.light(); setContactType('phone'); }}
                >
                  <Phone size={16} color={contactType === 'phone' ? T.postmark : T.textMuted} style={{ marginRight: 6 }} />
                  <Text style={[styles.toggleText, contactType === 'phone' && styles.toggleTextActive]}>Phone</Text>
                </TouchableOpacity>
              </View>

              {contactType === 'email' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color={T.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="traveler@example.com"
                      value={emailInput}
                      onChangeText={setEmailInput}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholderTextColor={T.textMuted}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>MOBILE NUMBER</Text>
                  <View style={styles.phoneRow}>
                    <TouchableOpacity
                      style={styles.codePickerBtn}
                      onPress={() => setShowCountryPicker(true)}
                    >
                      <Text style={styles.codeFlag}>{selectedCountry.flag}</Text>
                      <Text style={styles.codeText}>{selectedCountry.code}</Text>
                    </TouchableOpacity>
                    <View style={styles.phoneInputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Phone number"
                        value={phoneInput}
                        onChangeText={setPhoneInput}
                        keyboardType="phone-pad"
                        placeholderTextColor={T.textMuted}
                      />
                    </View>
                  </View>
                </View>
              )}

              <AnimatedPressable style={styles.primaryBtn} onPress={handleSendOtp}>
                <Text style={styles.primaryBtnText}>Send Verification Code</Text>
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </AnimatedPressable>

              <View style={styles.linkContainer}>
                <Text style={styles.linkText}>Already registered? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.linkAction}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── STEP 1.5: OTP Verify ── */}
          {step === 1.5 && (
            <View style={styles.card}>
              <View style={styles.notchLeft} />
              <View style={styles.notchRight} />

              <Text style={styles.boardingTag}>SECURITY CHECK</Text>
              <Text style={styles.cardTitle}>Enter 6-Digit Code</Text>
              <Text style={styles.cardSubtitle}>
                Sent to {contactType === 'email' ? emailInput : `${selectedCountry.code} ${phoneInput}`}
              </Text>

              <View style={styles.otpContainer}>
                {otpInput.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={otpRefs[idx]}
                    style={[styles.otpBox, !!digit && styles.otpBoxFilled]}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <AnimatedPressable style={styles.primaryBtn} onPress={handleVerifyOtp}>
                <Text style={styles.primaryBtnText}>Verify & Continue</Text>
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </AnimatedPressable>

              <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(1)}>
                <Text style={styles.backStepText}>Change Contact Info</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── STEP 2: Credentials ── */}
          {step === 2 && (
            <View style={styles.card}>
              <View style={styles.notchLeft} />
              <View style={styles.notchRight} />

              <Text style={styles.boardingTag}>STEP 2 OF 3 • PASSENGER INFO</Text>
              <Text style={styles.cardTitle}>Create Profile</Text>
              <Text style={styles.cardSubtitle}>Set your traveler credentials</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>FULL NAME</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={T.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Demo Traveler"
                    value={nameInput}
                    onChangeText={setNameInput}
                    placeholderTextColor={T.textMuted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>USERNAME</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={T.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="demotraveler"
                    value={usernameInput}
                    onChangeText={setUsernameInput}
                    autoCapitalize="none"
                    placeholderTextColor={T.textMuted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.label}>PASSWORD</Text>
                  {passwordInput.length > 0 && (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </Text>
                  )}
                </View>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={T.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Min 8 chars (e.g. Pass1234!)"
                    value={passwordInput}
                    onChangeText={setPasswordInput}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={T.textMuted}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} color={T.textMuted} /> : <Eye size={18} color={T.textMuted} />}
                  </TouchableOpacity>
                </View>

                {/* Password Strength Meter & Requirement Checklist */}
                {passwordInput.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <View style={{ height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(15, passwordStrength.score * 20))}%`,
                          backgroundColor: passwordStrength.color,
                        }}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      <Text style={{ fontSize: 10, color: passwordStrength.hasMinLength ? '#16A34A' : '#DC2626', fontWeight: '600' }}>
                        {passwordStrength.hasMinLength ? '✓ 8+ chars' : '✗ 8+ chars'}
                      </Text>
                      <Text style={{ fontSize: 10, color: passwordStrength.hasUpper ? '#16A34A' : T.textMuted }}>
                        {passwordStrength.hasUpper ? '✓ Uppercase' : '○ Uppercase'}
                      </Text>
                      <Text style={{ fontSize: 10, color: passwordStrength.hasNumber ? '#16A34A' : T.textMuted }}>
                        {passwordStrength.hasNumber ? '✓ Number' : '○ Number'}
                      </Text>
                      <Text style={{ fontSize: 10, color: passwordStrength.hasSpecial ? '#16A34A' : T.textMuted }}>
                        {passwordStrength.hasSpecial ? '✓ Symbol' : '○ Symbol'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <AnimatedPressable style={styles.primaryBtn} onPress={handleStep2Next}>
                <Text style={styles.primaryBtnText}>Continue to Trip Setup</Text>
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </AnimatedPressable>
            </View>
          )}

          {/* ── STEP 3: Destination & Trip Setup ── */}
          {step === 3 && (
            <View style={styles.card}>
              <View style={styles.notchLeft} />
              <View style={styles.notchRight} />

              <Text style={styles.boardingTag}>STEP 3 OF 3 • FLIGHT DETAILS</Text>
              <Text style={styles.cardTitle}>Upcoming Trip</Text>
              <Text style={styles.cardSubtitle}>Target language & travel style</Text>

              <Text style={styles.label}>PRIMARY DESTINATION LANGUAGE</Text>
              <View style={styles.languageContainer}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.name}
                    style={[styles.languageCard, selectedLang === lang.name && styles.languageCardActive]}
                    onPress={() => { HapticsManager.light(); setSelectedLang(lang.name); }}
                  >
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text style={[styles.languageLabel, selectedLang === lang.name && styles.languageLabelActive]}>
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>DESTINATION CITY / COUNTRY</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={18} color={T.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tokyo, Japan"
                    value={destination}
                    onChangeText={setDestination}
                    placeholderTextColor={T.textMuted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>DEPARTURE DATE (YYYY-MM-DD)</Text>
                <View style={styles.inputWrapper}>
                  <Calendar size={18} color={T.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="2026-08-25"
                    value={departureDate}
                    onChangeText={setDepartureDate}
                    placeholderTextColor={T.textMuted}
                  />
                </View>
              </View>

              <AnimatedPressable 
                style={[styles.primaryBtn, isSubmitting && { opacity: 0.7 }]} 
                onPress={handleSignup}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Issue Boarding Pass & Enter</Text>
                    <Plane size={16} color="#FFFFFF" strokeWidth={2.5} />
                  </>
                )}
              </AnimatedPressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Code Picker Modal */}
      <Modal visible={showCountryPicker} animationType="slide" transparent statusBarTranslucent>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        />
        <View style={styles.modalSheet}>
          <View style={styles.dragHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country Code</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)} style={styles.modalCloseBtn}>
              <X size={18} color={T.ink} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrapper}>
            <Search size={18} color={T.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country..."
              value={countrySearch}
              onChangeText={setCountrySearch}
              placeholderTextColor={T.textMuted}
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code + item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.countryRow, selectedCountry.code === item.code && item.name === selectedCountry.name && styles.countryRowActive]}
                onPress={() => {
                  setSelectedCountry(item);
                  setPhoneInput('');
                  setShowCountryPicker(false);
                }}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDigits}>{item.digits.join(' or ')} digits</Text>
                </View>
                <Text style={styles.countryCode}>{item.code}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.paper },
  scrollContent: { padding: 20, paddingBottom: 40 },
  brandContainer: { alignItems: 'center', marginBottom: 24, marginTop: 12 },
  postmarkBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: T.primaryLight, borderWidth: 1.5, borderColor: T.postmark,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  brandTitle: { fontSize: 24, fontFamily: 'Spectral_700Bold', color: T.ink, letterSpacing: 2, marginBottom: 4 },
  brandSubtitle: { fontSize: 10, fontFamily: 'Inter_700Bold', color: T.textMuted, letterSpacing: 1.2, textAlign: 'center' },
  card: {
    backgroundColor: T.surface, borderRadius: 14, padding: 24,
    borderWidth: 1, borderColor: T.sandLine, position: 'relative', overflow: 'hidden',
    ...TravelTheme.shadows.resting,
  },
  notchLeft: {
    position: 'absolute', left: -10, top: 60, width: 20, height: 20,
    borderRadius: 10, backgroundColor: T.paper, borderWidth: 1, borderColor: T.sandLine, zIndex: 10,
  },
  notchRight: {
    position: 'absolute', right: -10, top: 60, width: 20, height: 20,
    borderRadius: 10, backgroundColor: T.paper, borderWidth: 1, borderColor: T.sandLine, zIndex: 10,
  },
  boardingTag: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: T.postmark, letterSpacing: 1.2, marginBottom: 6 },
  cardTitle: { fontSize: 22, fontFamily: 'Spectral_700Bold', color: T.ink, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', color: T.textSecondary, marginBottom: 20 },
  toggleBar: {
    flexDirection: 'row', backgroundColor: T.paper, borderRadius: 10,
    padding: 3, marginBottom: 20, borderWidth: 1, borderColor: T.sandLine,
  },
  toggleTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, flexDirection: 'row', justifyContent: 'center' },
  toggleTabActive: { backgroundColor: T.surface, ...TravelTheme.shadows.resting },
  toggleText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: T.textMuted },
  toggleTextActive: { color: T.ink, fontFamily: 'Inter_700Bold' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontFamily: 'Inter_700Bold', color: T.ink, letterSpacing: 0.8, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: T.paper,
    borderWidth: 1, borderColor: T.sandLine, borderRadius: 10, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, fontFamily: 'Inter_500Medium', color: T.ink },
  phoneRow: { flexDirection: 'row', gap: 10 },
  codePickerBtn: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: T.sandLine,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: T.paper, gap: 6,
  },
  codeFlag: { fontSize: 18 },
  codeText: { fontSize: 13, fontFamily: 'Inter_700Bold', color: T.ink },
  phoneInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: T.sandLine, borderRadius: 10, paddingHorizontal: 12, backgroundColor: T.paper,
  },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24, marginTop: 8 },
  otpBox: {
    width: 44, height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: T.sandLine,
    textAlign: 'center', fontSize: 20, fontFamily: 'Spectral_700Bold', color: T.ink, backgroundColor: T.paper,
  },
  otpBoxFilled: { borderColor: T.postmark, backgroundColor: T.primaryLight },
  primaryBtn: {
    flexDirection: 'row', backgroundColor: T.postmark, paddingVertical: 14,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 8,
    ...TravelTheme.shadows.button,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_700Bold' },
  backStepBtn: {
    borderColor: T.sandLine, borderWidth: 1, paddingVertical: 12,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 12,
  },
  backStepText: { color: T.textSecondary, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  linkText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: T.textSecondary },
  linkAction: { fontSize: 13, fontFamily: 'Inter_700Bold', color: T.postmark },
  languageContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginBottom: 16 },
  languageCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: T.paper,
    borderWidth: 1, borderColor: T.sandLine, borderRadius: 10, width: '48%',
    paddingHorizontal: 10, paddingVertical: 10,
  },
  languageCardActive: { borderColor: T.postmark, borderWidth: 1.5, backgroundColor: T.primaryLight },
  languageFlag: { fontSize: 18, marginRight: 6 },
  languageLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: T.textSecondary },
  languageLabelActive: { color: T.postmark, fontFamily: 'Inter_700Bold' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(27, 42, 47, 0.4)' },
  modalSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
    backgroundColor: T.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    overflow: 'hidden', ...TravelTheme.shadows.raised,
  },
  dragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: T.sandLine, alignSelf: 'center', marginTop: 10 },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: T.paper, alignItems: 'center', justifyContent: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: T.sandLine },
  modalTitle: { fontSize: 16, fontFamily: 'Spectral_700Bold', color: T.ink },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', margin: 12, borderWidth: 1,
    borderColor: T.sandLine, borderRadius: 10, paddingHorizontal: 12, backgroundColor: T.paper,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, fontFamily: 'Inter_500Medium', color: T.ink },
  countryRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.paper, gap: 12,
  },
  countryRowActive: { backgroundColor: T.primaryLight },
  countryFlag: { fontSize: 20 },
  countryName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: T.ink },
  countryDigits: { fontSize: 11, fontFamily: 'Inter_400Regular', color: T.textMuted, marginTop: 1 },
  countryCode: { fontSize: 13, fontFamily: 'Inter_700Bold', color: T.postmark },
});