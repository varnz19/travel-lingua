import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileContext } from '../../context/ProfileContext';
import { TravelTheme } from '../../constants/TravelTheme';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { HapticsManager } from '../../utils/HapticsManager';
import {
  User,
  Calendar,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Luggage,
  Edit3,
  Save,
  Globe,
  ArrowRight,
  Award,
} from 'lucide-react-native';

const T = TravelTheme.colors;

const TRIP_STYLES = [
  'Tourism & Vacation',
  'Solo Backpacking',
  'Business Travel',
  'Family Vacation',
  'Romantic Getaway',
  'Cultural Immersion',
];

export default function ProfileScreen() {
  const router = useRouter();
  const {
    name,
    username,
    email,
    trip,
    learningLanguage,
    practicedPhrases = {},
    getDaysUntilDeparture,
    calculateScenarioReadiness,
    updateProfile,
    updateTrip,
    logout,
  } = useContext(ProfileContext);

  const [showRecapModal, setShowRecapModal] = useState(false);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [badgesExpanded, setBadgesExpanded] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(name || 'Sarah Jenkins');
  const [editUsername, setEditUsername] = useState(username || 'sarahj');
  const [editDestination, setEditDestination] = useState(trip?.destination || 'Tokyo, Japan');
  const [editDepartureDate, setEditDepartureDate] = useState(trip?.departureDate || '2026-08-25');
  const [editTripType, setEditTripType] = useState(trip?.purpose || 'Tourism & Vacation');
  const [editLanguage, setEditLanguage] = useState(learningLanguage || 'Japanese');

  const daysRemaining = getDaysUntilDeparture();
  const isTripEnded = daysRemaining === 0;
  const totalPracticedCount = Object.keys(practicedPhrases).length;

  const scenarios = calculateScenarioReadiness();
  const readyCount = scenarios.filter((s: any) => s.ready).length;
  const totalScenarios = scenarios.length;
  const readinessPercentage = Math.round((readyCount / totalScenarios) * 100);

  const getReadinessGrade = (pct: number) => {
    if (pct >= 85) return { grade: 'Grade A', label: 'Flight Ready', color: T.sage };
    if (pct >= 65) return { grade: 'Grade B', label: 'Well Prepared', color: T.postmark };
    if (pct >= 45) return { grade: 'Grade C', label: 'Basic Preparedness', color: T.warning };
    return { grade: 'Grade D', label: 'Needs Practice', color: T.danger };
  };

  const readinessGrade = getReadinessGrade(readinessPercentage);

  const handleOpenEdit = () => {
    HapticsManager.light();
    setEditName(name || '');
    setEditUsername(username || '');
    setEditDestination(trip?.destination || 'Tokyo, Japan');
    setEditDepartureDate(trip?.departureDate || '2026-08-25');
    setEditTripType(trip?.purpose || 'Tourism & Vacation');
    setEditLanguage(learningLanguage || 'Japanese');
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }

    HapticsManager.success();
    updateProfile({
      name: editName.trim(),
      username: editUsername.trim(),
      learningLanguage: editLanguage,
    });

    updateTrip({
      destination: editDestination.trim(),
      departureDate: editDepartureDate.trim(),
      purpose: editTripType.trim(),
    });

    setShowEditModal(false);
    if (Platform.OS !== 'web') {
      Alert.alert('Updated', 'Your traveler profile and trip settings have been saved.');
    }
  };

  const handleLogout = () => {
    HapticsManager.medium();
    logout();
    router.replace('/login');
  };

  const milestonesList = [
    { id: 'b1', title: 'First Steps', desc: 'Saved 1st phrase', icon: '👣', unlocked: true },
    { id: 'b2', title: 'Tokyo Ready', desc: 'Emergency pack cached', icon: '🇯🇵', unlocked: true },
    { id: 'b3', title: 'Dining Master', desc: 'Practiced 5 food phrases', icon: '🍜', unlocked: true },
    { id: 'b4', title: 'Polyglot Voyager', desc: 'Tested 2 languages', icon: '✈️', unlocked: false },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── Profile Header ───────────────────────────── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarBox}>
            <User size={28} color={T.postmark} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={styles.profileName}>{name || username}</Text>
            <Text style={styles.profileEmail}>{email || 'sarah.jenkins@example.com'}</Text>
          </View>
          <TouchableOpacity style={styles.editIconBtn} onPress={handleOpenEdit}>
            <Edit3 size={16} color={T.postmark} />
          </TouchableOpacity>
        </View>

        {/* ── Travel Readiness Dynamic Breakdown Card ────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Travel Readiness</Text>
          <View style={[styles.gradeBadge, { backgroundColor: readinessGrade.color + '20' }]}>
            <Award size={12} color={readinessGrade.color} />
            <Text style={[styles.gradeBadgeText, { color: readinessGrade.color }]}>
              {readinessGrade.grade}: {readinessGrade.label}
            </Text>
          </View>
        </View>

        <AnimatedPressable
          style={styles.readinessCard}
          onPress={() => {
            HapticsManager.light();
            setShowReadinessModal(true);
          }}
        >
          <View style={styles.notchLeft} />
          <View style={styles.notchRight} />

          <View style={styles.readinessTopRow}>
            <View style={styles.readinessScoreBox}>
              <Text style={styles.readinessScoreNum}>{readinessPercentage}%</Text>
              <Text style={styles.readinessScoreSub}>READY</Text>
            </View>
            <View style={styles.readinessMeta}>
              <Text style={styles.readinessMetaTitle}>
                {readyCount} of {totalScenarios} Categories Mastered
              </Text>
              <Text style={styles.readinessMetaSub}>
                Real phrase coverage & native pronunciation scores
              </Text>
            </View>
            <ChevronRight size={18} color={T.textMuted} />
          </View>

          {/* Segmented Progress Meter */}
          <View style={styles.progressMeterTrack}>
            <View style={[styles.progressMeterFill, { width: `${readinessPercentage}%` }]} />
          </View>

          <View style={styles.divider} />

          {/* Real Category Coverage Grid */}
          <View style={styles.scenarioGrid}>
            {scenarios.map((sc: any) => (
              <View
                key={sc.key}
                style={[
                  styles.scenarioMiniCard,
                  sc.ready ? styles.scenarioMiniCardReady : styles.scenarioMiniCardWarn
                ]}
              >
                <View style={styles.scenarioMiniHeader}>
                  <Text style={styles.scenarioMiniIcon}>{sc.icon}</Text>
                  {sc.ready ? (
                    <CheckCircle2 size={13} color={T.sage} strokeWidth={2.5} />
                  ) : (
                    <AlertCircle size={13} color={T.postmark} strokeWidth={2.5} />
                  )}
                </View>
                <Text style={styles.scenarioMiniTitle} numberOfLines={1}>{sc.title.split('&')[0].trim()}</Text>
                <Text style={styles.scenarioMiniSub}>{sc.statusText}</Text>
              </View>
            ))}
          </View>
        </AnimatedPressable>

        {/* ── Active Trip Settings Card ─────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Trip Profile</Text>
          <TouchableOpacity onPress={handleOpenEdit}>
            <Text style={styles.editLinkText}>Edit Trip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <MapPin size={16} color={T.postmark} />
            <Text style={styles.infoLabel}>Destination:</Text>
            <Text style={styles.infoValue}>{trip?.destination || 'Tokyo, Japan'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={16} color={T.ink} />
            <Text style={styles.infoLabel}>Departure Date:</Text>
            <Text style={styles.infoValue}>{trip?.departureDate || '2026-08-25'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Luggage size={16} color={T.sage} />
            <Text style={styles.infoLabel}>Trip Style:</Text>
            <Text style={styles.infoValue}>{trip?.purpose || 'Tourism & Vacation'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Globe size={16} color={T.postmark} />
            <Text style={styles.infoLabel}>Language:</Text>
            <Text style={styles.infoValue}>{learningLanguage || 'Japanese'}</Text>
          </View>
        </View>

        {/* ── Post-Trip Recap Hero Banner ───────────────── */}
        <AnimatedPressable
          style={styles.recapBannerCard}
          onPress={() => {
            HapticsManager.medium();
            setShowRecapModal(true);
          }}
        >
          <View style={styles.notchLeft} />
          <View style={styles.notchRight} />

          <View style={styles.recapIconBox}>
            <Sparkles size={18} color={T.postmark} />
          </View>
          <View style={{ flex: 1, paddingHorizontal: 10 }}>
            <Text style={styles.recapBannerTitle}>
              {isTripEnded ? '🎉 Trip Recap Available' : '✈️ Post-Trip Recap'}
            </Text>
            <Text style={styles.recapBannerSub}>
              Review phrases used vs. prepared for {trip?.destination || 'Japan'}.
            </Text>
          </View>
          <ChevronRight size={16} color={T.postmark} />
        </AnimatedPressable>

        {/* ── Travel Milestones (Collapsible / Extendable) ── */}
        <View style={styles.badgeSectionHeader}>
          <Text style={styles.sectionTitle}>Travel Milestones</Text>
          <TouchableOpacity
            style={styles.expandToggleBtn}
            onPress={() => {
              HapticsManager.light();
              setBadgesExpanded(!badgesExpanded);
            }}
          >
            <Text style={styles.expandToggleText}>{badgesExpanded ? 'Collapse' : 'Show All'}</Text>
            {badgesExpanded ? <ChevronUp size={14} color={T.postmark} /> : <ChevronDown size={14} color={T.postmark} />}
          </TouchableOpacity>
        </View>

        <View style={styles.badgeGrid}>
          {(badgesExpanded ? milestonesList : milestonesList.slice(0, 2)).map(b => (
            <AnimatedPressable key={b.id} style={[styles.badgeCard, !b.unlocked && styles.badgeLocked]}>
              <Text style={styles.badgeIcon}>{b.icon}</Text>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </AnimatedPressable>
          ))}
        </View>

        {/* ── Logout Button ─────────────────────────────── */}
        <AnimatedPressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={16} color={T.postmark} />
          <Text style={styles.logoutText}>Log Out of Account</Text>
        </AnimatedPressable>
      </ScrollView>

      {/* ── Edit Profile & Trip Modal ───────────────────── */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Traveler Profile & Trip</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={22} color={T.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 14 }}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Sarah Jenkins"
                  placeholderTextColor={T.textMuted}
                />
              </View>

              {/* Username */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>USERNAME</Text>
                <TextInput
                  style={styles.textInput}
                  value={editUsername}
                  onChangeText={setEditUsername}
                  placeholder="sarahj"
                  autoCapitalize="none"
                  placeholderTextColor={T.textMuted}
                />
              </View>

              {/* Destination */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>DESTINATION CITY / COUNTRY</Text>
                <TextInput
                  style={styles.textInput}
                  value={editDestination}
                  onChangeText={setEditDestination}
                  placeholder="e.g. Tokyo, Japan"
                  placeholderTextColor={T.textMuted}
                />
              </View>

              {/* Departure Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>DEPARTURE DATE (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editDepartureDate}
                  onChangeText={setEditDepartureDate}
                  placeholder="2026-08-25"
                  placeholderTextColor={T.textMuted}
                />
              </View>

              {/* Selectable Trip Style */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TRIP STYLE / PURPOSE</Text>
                <View style={styles.tripStylesRow}>
                  {TRIP_STYLES.map(styleOption => {
                    const isSelected = editTripType === styleOption;
                    return (
                      <TouchableOpacity
                        key={styleOption}
                        style={[styles.tripStyleChip, isSelected && styles.tripStyleChipSelected]}
                        onPress={() => {
                          HapticsManager.light();
                          setEditTripType(styleOption);
                        }}
                      >
                        <Text style={[styles.tripStyleChipText, isSelected && styles.tripStyleChipTextSelected]}>
                          {styleOption}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TextInput
                  style={[styles.textInput, { marginTop: 8 }]}
                  value={editTripType}
                  onChangeText={setEditTripType}
                  placeholder="Or type custom trip style..."
                  placeholderTextColor={T.textMuted}
                />
              </View>

              {/* Target Language */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TARGET LANGUAGE</Text>
                <TextInput
                  style={styles.textInput}
                  value={editLanguage}
                  onChangeText={setEditLanguage}
                  placeholder="e.g. Japanese"
                  placeholderTextColor={T.textMuted}
                />
              </View>
            </ScrollView>

            <AnimatedPressable style={styles.modalSaveBtn} onPress={handleSaveProfile}>
              <Save size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.modalSaveBtnText}>Save Changes</Text>
            </AnimatedPressable>
          </View>
        </View>
      </Modal>

      {/* ── Detailed Readiness Modal ────────────────────── */}
      <Modal
        visible={showReadinessModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReadinessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Travel Readiness Audit</Text>
              <TouchableOpacity onPress={() => setShowReadinessModal(false)}>
                <X size={22} color={T.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Evaluated across 8 essential travel categories for your trip to {trip?.destination || 'Japan'}.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 14 }}>
              {scenarios.map((sc: any) => (
                <View key={sc.key} style={styles.scenarioDetailItem}>
                  <Text style={styles.scenarioDetailIconBig}>{sc.icon}</Text>
                  <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text style={styles.scenarioDetailTitle}>{sc.title}</Text>
                    <Text style={styles.scenarioDetailStatus}>
                      {sc.statusText} • {sc.accuracy}% accuracy
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.scenarioBadge, sc.ready ? styles.scenarioBadgeReady : styles.scenarioBadgeWarn]}
                    onPress={() => {
                      setShowReadinessModal(false);
                      router.push('/(tabs)/survival' as any);
                    }}
                  >
                    <Text style={[styles.scenarioBadgeText, sc.ready ? styles.scenarioBadgeTextReady : styles.scenarioBadgeTextWarn]}>
                      {sc.ready ? 'Mastered' : 'Practice'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <AnimatedPressable style={styles.modalCloseBtn} onPress={() => setShowReadinessModal(false)}>
              <Text style={styles.modalCloseBtnText}>Close Audit</Text>
            </AnimatedPressable>
          </View>
        </View>
      </Modal>

      {/* ── Post-Trip Recap Modal ───────────────────────── */}
      <Modal
        visible={showRecapModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRecapModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post-Trip Recap: {trip?.destination || 'Japan'}</Text>
              <TouchableOpacity onPress={() => setShowRecapModal(false)}>
                <X size={22} color={T.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 14 }}>
              <View style={styles.recapInsightBox}>
                <Sparkles size={18} color={T.postmark} />
                <Text style={styles.recapInsightText}>
                  💡 <Text style={{ fontFamily: 'Inter_700Bold' }}>Trip Insight:</Text> You practiced <Text style={{ fontFamily: 'Inter_700Bold' }}>Dining & Directions</Text> phrases most frequently during this trip prep window.
                </Text>
              </View>

              <View style={styles.recapStatsRow}>
                <View style={styles.recapStatCard}>
                  <Text style={styles.recapStatNum}>{totalPracticedCount}</Text>
                  <Text style={styles.recapStatLabel}>Phrases Practiced</Text>
                </View>
                <View style={styles.recapStatCard}>
                  <Text style={styles.recapStatNum}>12</Text>
                  <Text style={styles.recapStatLabel}>Available in Phrasebook</Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { fontSize: 14, marginTop: 14, marginBottom: 8 }]}>
                Prepared Phrases
              </Text>
              {[
                { text: 'Konnichiwa (Hello)', count: '5 times', category: 'Introduction' },
                { text: 'Mizu o kudasai (Water please)', count: '3 times', category: 'Food & Drinks' },
                { text: 'Eki wa doko desu ka? (Where is station?)', count: '4 times', category: 'Directions' },
                { text: 'Menyuu o onegaishimasu (Menu please)', count: '2 times', category: 'Restaurants' }
              ].map((item, idx) => (
                <View key={idx} style={styles.recapItemRow}>
                  <CheckCircle2 size={15} color={T.sage} />
                  <View style={{ flex: 1, paddingLeft: 8 }}>
                    <Text style={styles.recapItemText}>{item.text}</Text>
                    <Text style={styles.recapItemSub}>{item.category} • Practiced {item.count}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <AnimatedPressable style={styles.modalCloseBtn} onPress={() => setShowRecapModal(false)}>
              <Text style={styles.modalCloseBtnText}>Close Post-Trip Recap</Text>
            </AnimatedPressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: T.paper,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 110,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 16,
    ...TravelTheme.shadows.resting,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: T.primaryLight,
    borderWidth: 1,
    borderColor: T.postmark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 17,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 2,
  },
  editIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: T.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  gradeBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  editLinkText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: T.postmark,
  },
  readinessCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    ...TravelTheme.shadows.resting,
  },
  notchLeft: {
    position: 'absolute',
    left: -10,
    top: '45%',
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
    top: '45%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: T.paper,
    borderWidth: 1,
    borderColor: T.sandLine,
    zIndex: 10,
  },
  readinessTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  readinessScoreBox: {
    backgroundColor: T.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  readinessScoreNum: {
    fontSize: 20,
    fontFamily: 'Spectral_700Bold',
    color: T.postmark,
  },
  readinessScoreSub: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    color: T.postmark,
    letterSpacing: 0.8,
  },
  readinessMeta: {
    flex: 1,
  },
  readinessMetaTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  readinessMetaSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 2,
  },
  progressMeterTrack: {
    height: 6,
    backgroundColor: T.paper,
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  progressMeterFill: {
    height: '100%',
    backgroundColor: T.postmark,
  },
  divider: {
    height: 1,
    backgroundColor: T.sandLine,
    marginVertical: 12,
  },
  scenarioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scenarioMiniCard: {
    width: '48%',
    backgroundColor: T.paper,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  scenarioMiniCardReady: {
    borderLeftWidth: 3,
    borderLeftColor: T.sage,
  },
  scenarioMiniCardWarn: {
    borderLeftWidth: 3,
    borderLeftColor: T.postmark,
  },
  scenarioMiniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scenarioMiniIcon: {
    fontSize: 14,
  },
  scenarioMiniTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  scenarioMiniSub: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: T.textSecondary,
    marginTop: 2,
  },
  recapBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    ...TravelTheme.shadows.resting,
  },
  recapIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: T.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recapBannerTitle: {
    fontSize: 13,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  recapBannerSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 16,
    gap: 10,
    ...TravelTheme.shadows.resting,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: T.textSecondary,
    width: 100,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  badgeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expandToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandToggleText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: T.postmark,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: T.sandLine,
    alignItems: 'center',
    ...TravelTheme.shadows.resting,
  },
  badgeLocked: {
    opacity: 0.45,
  },
  badgeIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  badgeTitle: {
    fontSize: 12,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  badgeDesc: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.surface,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.postmark,
    gap: 6,
    marginBottom: 20,
    ...TravelTheme.shadows.resting,
  },
  logoutText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: T.postmark,
  },

  // Edit Profile Modal
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    color: T.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  tripStylesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tripStyleChip: {
    backgroundColor: T.paper,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  tripStyleChipSelected: {
    backgroundColor: T.postmark,
    borderColor: T.postmark,
  },
  tripStyleChipText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: T.ink,
  },
  tripStyleChipTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },
  textInput: {
    backgroundColor: T.paper,
    borderWidth: 1,
    borderColor: T.sandLine,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: T.ink,
  },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.postmark,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 14,
    ...TravelTheme.shadows.button,
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },

  // Modal Common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 42, 47, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '85%',
    ...TravelTheme.shadows.raised,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  modalSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  scenarioDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.paper,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  scenarioDetailIconBig: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  scenarioDetailTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  scenarioDetailStatus: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 2,
  },
  scenarioBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scenarioBadgeReady: {
    backgroundColor: T.successLight,
  },
  scenarioBadgeWarn: {
    backgroundColor: T.primaryLight,
  },
  scenarioBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  scenarioBadgeTextReady: {
    color: T.sage,
  },
  scenarioBadgeTextWarn: {
    color: T.postmark,
  },
  modalCloseBtn: {
    backgroundColor: T.postmark,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
    ...TravelTheme.shadows.button,
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  recapInsightBox: {
    flexDirection: 'row',
    backgroundColor: T.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  recapInsightText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: T.ink,
    lineHeight: 16,
  },
  recapStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  recapStatCard: {
    flex: 1,
    backgroundColor: T.paper,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  recapStatNum: {
    fontSize: 22,
    fontFamily: 'Spectral_700Bold',
    color: T.postmark,
  },
  recapStatLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: T.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  recapItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.paper,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  recapItemText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  recapItemSub: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: T.textSecondary,
    marginTop: 1,
  },
});
