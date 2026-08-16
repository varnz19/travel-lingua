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
  ScrollView,
  Modal,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../context/ProfileContext';

// Country codes list
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

  // Steps: 1 = contact, 1.5 = OTP verify, 2 = credentials, 3 = customize
  const [step, setStep] = useState<1 | 1.5 | 2 | 3>(1);

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

  // OTP refs — must be declared individually at top level (React rules of hooks)
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
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [duration, setDuration] = useState('');
  const [purpose, setPurpose] = useState('');

  const languages = [
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'French', flag: '🇫🇷' },
    { name: 'Japanese', flag: '🇯🇵' },
    { name: 'German', flag: '🇩🇪' },
    { name: 'Italian', flag: '🇮🇹' }
  ];

  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  const handleSendOtp = () => {
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
      const digits = phoneInput.replace(/\D/g, '');
      const valid = selectedCountry.digits.includes(digits.length);
      if (!valid) {
        const expected = selectedCountry.digits.join(' or ');
        Alert.alert(
          'Invalid Number',
          `${selectedCountry.name} (${selectedCountry.code}) phone numbers require ${expected} digits. You entered ${digits.length}.`
        );
        return;
      }
    }

    const otp = generateOtp();
    setGeneratedOtp(otp);
    setOtpInput(['', '', '', '', '', '']);

    // Simulate sending OTP (show in alert since no real SMS backend)
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

  const handleStep2Next = () => {
    if (!nameInput.trim() || !usernameInput.trim() || !passwordInput.trim()) {
      Alert.alert('Required', 'Please fill in Name, Username, and Password to proceed.');
      return;
    }
    setStep(3);
  };

  const handleSignup = () => {
    const signupData = {
      phoneNumber: contactType === 'phone' ? `${selectedCountry.code} ${phoneInput.trim()}` : '',
      email: contactType === 'email' ? emailInput.trim() : '',
      name: nameInput.trim(),
      username: usernameInput.trim(),
      password: passwordInput.trim(),
      learningLanguage: selectedLang
    };
    const tripData = {
      destination: destination.trim(),
      departureDate: departureDate.trim(),
      duration: duration.trim(),
      purpose: purpose.trim()
    };
    const success = signup(signupData, tripData);
    if (success) {
      // setTimeout gives React time to flush setState from signup() before navigating
      setTimeout(() => router.replace('/(tabs)'), 50);
    } else {
      Alert.alert('Error', 'Failed to register account.');
    }
  };

  const handleGoogleSignup = () => {
    const success = signup({
      phoneNumber: '',
      email: 'traveler@google.com',
      name: 'Google Traveler',
      username: 'google_traveler',
      password: 'googlePassword',
      learningLanguage: 'Japanese'
    }, {});
    if (success) {
      setTimeout(() => router.replace('/(tabs)'), 50);
    }
  };

  const stepLabel = step === 1 ? '1 of 3' : step === 1.5 ? '1 of 3' : step === 2 ? '2 of 3' : '3 of 3';
  const stepTitle = step === 1 ? 'Sign Up' : step === 1.5 ? 'Verify OTP' : step === 2 ? 'Account Credentials' : 'Travel Customise';
  const stepSubtitle = step === 1 ? `Step 1 of 3: Contact method` : step === 1.5 ? 'Enter the 6-digit code sent to you' : step === 2 ? 'Step 2 of 3: Set login values' : 'Step 3 of 3: Target setup';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="airplane" size={32} color="#2563EB" />
            </View>
            <Text style={styles.brandTitle}>{stepTitle}</Text>
            <Text style={styles.brandSubtitle}>{stepSubtitle}</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>

            {/* ─── STEP 1: Contact ─── */}
            {step === 1 && (
              <View>
                <Text style={styles.cardTitle}>Get Started</Text>
                <Text style={styles.cardSubtitle}>Select how you want to register</Text>

                {/* Toggle: Email / Phone */}
                <View style={styles.toggleBar}>
                  <TouchableOpacity
                    style={[styles.toggleTab, contactType === 'email' && styles.toggleTabActive]}
                    onPress={() => setContactType('email')}
                  >
                    <Ionicons name="mail-outline" size={15} color={contactType === 'email' ? '#0F172A' : '#94A3B8'} style={{ marginRight: 4 }} />
                    <Text style={[styles.toggleText, contactType === 'email' && styles.toggleTextActive]}>Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleTab, contactType === 'phone' && styles.toggleTabActive]}
                    onPress={() => setContactType('phone')}
                  >
                    <Ionicons name="call-outline" size={15} color={contactType === 'phone' ? '#0F172A' : '#94A3B8'} style={{ marginRight: 4 }} />
                    <Text style={[styles.toggleText, contactType === 'phone' && styles.toggleTextActive]}>Phone</Text>
                  </TouchableOpacity>
                </View>

                {contactType === 'email' ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="user@mail.com"
                        value={emailInput}
                        onChangeText={setEmailInput}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.phoneRow}>
                      {/* Country Code Selector */}
                      <TouchableOpacity
                        style={styles.codePickerBtn}
                        onPress={() => { setCountrySearch(''); setShowCountryPicker(true); }}
                      >
                        <Text style={styles.codeFlag}>{selectedCountry.flag}</Text>
                        <Text style={styles.codeText}>{selectedCountry.code}</Text>
                        <Ionicons name="chevron-down" size={14} color="#64748B" />
                      </TouchableOpacity>

                      {/* Phone Number Input */}
                      <View style={styles.phoneInputWrapper}>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter number"
                          value={phoneInput}
                          onChangeText={setPhoneInput}
                          keyboardType="phone-pad"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>
                    <Text style={styles.helperText}>
                      {selectedCountry.name}: {selectedCountry.digits.join(' or ')} digits required
                    </Text>
                  </View>
                )}

                <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOtp} activeOpacity={0.85}>
                  <Text style={styles.primaryBtnText}>Send OTP</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignup} activeOpacity={0.8}>
                  <Ionicons name="logo-google" size={18} color="#0F172A" style={{ marginRight: 10 }} />
                  <Text style={styles.googleBtnText}>Sign up with Google</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ─── STEP 1.5: OTP Verify ─── */}
            {step === 1.5 && (
              <View>
                <Text style={styles.cardTitle}>Enter OTP</Text>
                <Text style={styles.cardSubtitle}>
                  {contactType === 'phone'
                    ? `Code sent to ${selectedCountry.code} ${phoneInput}`
                    : `Code sent to ${emailInput}`}
                </Text>

                {/* 6-box OTP input */}
                <View style={styles.otpContainer}>
                  {otpInput.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={otpRefs[i]}
                      style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                      value={digit}
                      onChangeText={(v) => handleOtpChange(v.replace(/[^0-9]/g, '').slice(-1), i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOtp} activeOpacity={0.85}>
                  <Text style={styles.primaryBtnText}>Verify & Continue</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backStepBtn}
                  onPress={() => { setOtpInput(['', '', '', '', '', '']); setStep(1); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backStepText}>Change Contact</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const otp = generateOtp();
                    setGeneratedOtp(otp);
                    setOtpInput(['', '', '', '', '', '']);
                    Alert.alert('🔄 OTP Resent', `Your new code is: ${otp}`);
                  }}
                  style={{ alignItems: 'center', marginTop: 12 }}
                >
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ─── STEP 2: Credentials ─── */}
            {step === 2 && (
              <View>
                <Text style={styles.cardTitle}>Credentials</Text>
                <Text style={styles.cardSubtitle}>Choose your name, username, and password</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter display name"
                      value={nameInput}
                      onChangeText={setNameInput}
                      autoCapitalize="words"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Username</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="at-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Choose username handle"
                      value={usernameInput}
                      onChangeText={setUsernameInput}
                      autoCapitalize="none"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Create secure password"
                      value={passwordInput}
                      onChangeText={setPasswordInput}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      placeholderTextColor="#94A3B8"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleStep2Next} activeOpacity={0.85}>
                  <Text style={styles.primaryBtnText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(1)} activeOpacity={0.8}>
                  <Text style={styles.backStepText}>Back to Step 1</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ─── STEP 3: Customise ─── */}
            {step === 3 && (
              <View>
                <Text style={styles.cardTitle}>Customise Experience</Text>
                <Text style={styles.cardSubtitle}>Configure your target language and travel details</Text>

                <Text style={[styles.label, { marginBottom: 12 }]}>Choose Target Language</Text>
                <View style={styles.languageContainer}>
                  {languages.map((lang) => {
                    const isSelected = selectedLang === lang.name;
                    return (
                      <TouchableOpacity
                        key={lang.name}
                        style={[styles.languageCard, isSelected && styles.languageCardActive]}
                        onPress={() => setSelectedLang(lang.name)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.languageFlag}>{lang.flag}</Text>
                        <Text style={[styles.languageLabel, isSelected && styles.languageLabelActive]}>{lang.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {[
                  { label: 'Where is your trip?', icon: 'location-outline', value: destination, setter: setDestination, placeholder: 'e.g. Tokyo, Japan' },
                  { label: 'When is your trip?', icon: 'calendar-outline', value: departureDate, setter: setDepartureDate, placeholder: 'YYYY-MM-DD' },
                  { label: 'How long is your trip?', icon: 'time-outline', value: duration, setter: setDuration, placeholder: 'e.g. 14 days' },
                  { label: 'Purpose of the trip', icon: 'briefcase-outline', value: purpose, setter: setPurpose, placeholder: 'e.g. Tourism, Business' },
                ].map(({ label, icon, value, setter, placeholder }) => (
                  <View style={styles.inputGroup} key={label}>
                    <Text style={styles.label}>{label}</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name={icon as any} size={20} color="#94A3B8" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        value={value}
                        onChangeText={setter}
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                  </View>
                ))}

                <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup} activeOpacity={0.85}>
                  <Text style={styles.primaryBtnText}>Complete Signup</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(2)} activeOpacity={0.8}>
                  <Text style={styles.backStepText}>Back to Step 2</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Redirect */}
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.linkAction}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Code Picker — Compact Bottom Sheet */}
      <Modal visible={showCountryPicker} animationType="slide" transparent statusBarTranslucent>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        />

        {/* Sheet */}
        <View style={styles.modalSheet}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country Code</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code..."
              value={countrySearch}
              onChangeText={setCountrySearch}
              placeholderTextColor="#94A3B8"
              autoFocus
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
                  <Text style={styles.countryDigits}>
                    {item.digits.join(' or ')} digits
                  </Text>
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  brandContainer: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(37,99,235,0.08)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(37,99,235,0.15)',
  },
  brandTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  brandSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#CBD5E1',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  toggleBar: {
    flexDirection: 'row', backgroundColor: '#F1F5F9',
    borderRadius: 14, padding: 4, marginBottom: 20,
    borderWidth: 1, borderColor: '#CBD5E1',
  },
  toggleTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, flexDirection: 'row', justifyContent: 'center' },
  toggleTabActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  toggleTextActive: { color: '#0F172A', fontWeight: '700' },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1',
    borderRadius: 14, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  eyeIcon: { padding: 4 },
  phoneRow: { flexDirection: 'row', gap: 10 },
  codePickerBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: '#FFF', gap: 6,
  },
  codeFlag: { fontSize: 18 },
  codeText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  phoneInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 14, paddingHorizontal: 12,
  },
  helperText: { fontSize: 12, color: '#64748B', marginTop: 6 },
  // OTP
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 28, marginTop: 8 },
  otpBox: {
    width: 44, height: 52, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#CBD5E1',
    textAlign: 'center', fontSize: 22, fontWeight: '700', color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  otpBoxFilled: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  resendText: { color: '#2563EB', fontSize: 13, fontWeight: '700' },
  // Buttons
  primaryBtn: {
    flexDirection: 'row', backgroundColor: '#2563EB',
    paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    marginTop: 8, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8,
  },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  backStepBtn: {
    borderColor: '#CBD5E1', borderWidth: 1, paddingVertical: 12,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 12,
  },
  backStepText: { color: '#475569', fontSize: 14, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#CBD5E1' },
  dividerText: { fontSize: 12, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },
  googleBtn: {
    flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1',
    paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8,
  },
  googleBtnText: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  linkText: { fontSize: 13, color: '#64748B' },
  linkAction: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
  // Language
  languageContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 24 },
  languageCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, width: '48%',
    paddingHorizontal: 12, paddingVertical: 12,
  },
  languageCardActive: { borderColor: '#2563EB', borderWidth: 1.5 },
  languageFlag: { fontSize: 20, marginRight: 8 },
  languageLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  languageLabelActive: { color: '#2563EB', fontWeight: '700' },
  // Modal — compact bottom sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, borderWidth: 1, borderColor: '#CBD5E1',
    borderRadius: 14, paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  countryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12,
  },
  countryRowActive: { backgroundColor: '#EFF6FF' },
  countryFlag: { fontSize: 24 },
  countryName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  countryDigits: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  countryCode: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
});
