import React, { useContext, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileContext } from '../../context/ProfileContext';
import { TravelTheme } from '../../constants/TravelTheme';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { HapticsManager } from '../../utils/HapticsManager';
import {
  Plane,
  ArrowRight,
  MapPin,
  Calendar,
  Volume2,
  VolumeX,
  Languages,
  Camera,
  MessageSquare,
  Sparkles,
} from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { getApiBaseUrl } from '../../services/apiConfig';

const T = TravelTheme.colors;

// High-resolution curated travel photography
const DESTINATION_BANNER = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80';
const DINING_CARD_IMG = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';
const TRANSIT_CARD_IMG = 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80';
const SHOPPING_CARD_IMG = 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80';
const HOTEL_CARD_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';

export default function HomeScreen() {
  const router = useRouter();
  const {
    name,
    username,
    trip,
    getDaysUntilDeparture,
  } = useContext(ProfileContext);

  const [refreshing, setRefreshing] = useState(false);
  const [isPlayingDailyAudio, setIsPlayingDailyAudio] = useState(false);

  // Dynamic Phrase of the Day from Backend API
  const [dailyPhrase, setDailyPhrase] = useState({
    japanese: 'Arigatou gozaimasu (ありがとうございます)',
    english: 'Thank you very much (Polite & universal)',
    pronunciation: 'ah-ree-gah-toh goh-zah-ee-mahs',
    audio_text: 'Arigatou gozaimasu'
  });

  const fetchDailyPhrase = useCallback(async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/phrases/daily`);
      if (res.ok) {
        const data = await res.json();
        setDailyPhrase(data);
      }
    } catch (_err) {
      // Graceful fallback to default phrase
    }
  }, []);

  React.useEffect(() => {
    fetchDailyPhrase();
  }, [fetchDailyPhrase]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    HapticsManager.light();
    fetchDailyPhrase();
    setTimeout(() => setRefreshing(false), 800);
  }, [fetchDailyPhrase]);

  const daysRemaining = getDaysUntilDeparture();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleToggleDailyAudio = () => {
    if (isPlayingDailyAudio) {
      HapticsManager.light();
      Speech.stop();
      setIsPlayingDailyAudio(false);
      return;
    }

    HapticsManager.medium();
    Speech.stop();
    setIsPlayingDailyAudio(true);

    Speech.speak(dailyPhrase.audio_text || 'Arigatou gozaimasu', {
      language: 'ja-JP',
      rate: 0.85,
      onDone: () => setIsPlayingDailyAudio(false),
      onStopped: () => setIsPlayingDailyAudio(false),
      onError: () => setIsPlayingDailyAudio(false),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.postmark}
            colors={[T.postmark]}
          />
        }
      >
        {/* ── Top Header ─────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingSub}>{getGreeting()}</Text>
            <Text style={styles.greetingName}>{name || username}</Text>
          </View>
          <View style={styles.destinationBadge}>
            <MapPin size={15} color={T.postmark} strokeWidth={2.2} />
            <Text style={styles.destinationBadgeText}>{trip?.destination || 'Tokyo, Japan'}</Text>
          </View>
        </View>

        {/* ── Flight Countdown & Destination Hero Banner ──── */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: DESTINATION_BANNER }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroImageOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <View style={styles.flightPill}>
                <Plane size={13} color="#FFFFFF" />
                <Text style={styles.flightPillText}>FLIGHT DEPARTURE</Text>
              </View>
              <Text style={styles.departureDateText}>
                <Calendar size={12} color="#FFFFFF" /> {trip?.departureDate || '2026-08-25'}
              </Text>
            </View>

            <View style={styles.countdownRow}>
              <Text style={styles.countdownNumber}>{daysRemaining}</Text>
              <View style={styles.countdownLabelBox}>
                <Text style={styles.countdownDaysText}>DAYS REMAINING</Text>
                <Text style={styles.countdownTargetText}>Destination: {trip?.destination || 'Tokyo, Japan'}</Text>
              </View>
            </View>

            <AnimatedPressable
              style={styles.heroCtaBtn}
              onPress={() => {
                HapticsManager.medium();
                router.push('/(tabs)/survival' as any);
              }}
            >
              <Text style={styles.heroCtaText}>Browse Essential Phrases</Text>
              <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.5} />
            </AnimatedPressable>
          </View>
        </View>

        {/* ── Daily Travel Phrase of the Day ──────────────── */}
        <View style={styles.dailyPhraseCard}>
          <View style={styles.dailyHeaderRow}>
            <View style={styles.dailyTag}>
              <Sparkles size={12} color={T.postmark} />
              <Text style={styles.dailyTagText}>PHRASE OF THE DAY</Text>
            </View>
            <TouchableOpacity
              style={[styles.audioPillBtn, isPlayingDailyAudio && styles.audioPillBtnActive]}
              onPress={handleToggleDailyAudio}
            >
              {isPlayingDailyAudio ? (
                <VolumeX size={14} color="#FFFFFF" />
              ) : (
                <Volume2 size={14} color={T.postmark} />
              )}
              <Text style={[styles.audioPillText, isPlayingDailyAudio && styles.audioPillTextActive]}>
                {isPlayingDailyAudio ? 'Stop' : 'Listen'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.dailyJapaneseText}>{dailyPhrase.japanese}</Text>

          <View style={[styles.dailyEnglishBox, isPlayingDailyAudio && styles.dailyEnglishBoxActive]}>
            <Text style={styles.dailyEnglishLabel}>ENGLISH MEANING:</Text>
            <Text style={styles.dailyEnglishText}>{dailyPhrase.english}</Text>
          </View>

          <Text style={styles.dailyPhonetic}>🗣️ {dailyPhrase.pronunciation}</Text>
        </View>

        {/* ── Quick Travel Tools Shortcut Strip ───────────── */}
        <Text style={styles.sectionTitle}>Travel Utilities</Text>
        <Text style={styles.sectionSubtitle}>Quick-access voice translator, camera OCR & dialogues</Text>

        <View style={styles.toolGrid}>
          {/* Voice Translator Shortcut */}
          <AnimatedPressable
            style={styles.toolCard}
            onPress={() => {
              HapticsManager.light();
              router.push('/(tabs)/practice' as any);
            }}
          >
            <View style={[styles.toolIconBox, { backgroundColor: T.primaryLight }]}>
              <Languages size={20} color={T.postmark} />
            </View>
            <Text style={styles.toolTitle}>Voice Translate</Text>
            <Text style={styles.toolSub}>Instant speech translation</Text>
          </AnimatedPressable>

          {/* Camera Scanner Shortcut */}
          <AnimatedPressable
            style={styles.toolCard}
            onPress={() => {
              HapticsManager.light();
              router.push('/(tabs)/practice' as any);
            }}
          >
            <View style={[styles.toolIconBox, { backgroundColor: T.secondaryLight }]}>
              <Camera size={20} color={T.ink} />
            </View>
            <Text style={styles.toolTitle}>Sign Scanner</Text>
            <Text style={styles.toolSub}>Camera OCR extraction</Text>
          </AnimatedPressable>

          {/* Conversations Shortcut */}
          <AnimatedPressable
            style={styles.toolCard}
            onPress={() => {
              HapticsManager.light();
              router.push('/(tabs)/simulate' as any);
            }}
          >
            <View style={[styles.toolIconBox, { backgroundColor: T.successLight }]}>
              <MessageSquare size={20} color={T.sage} />
            </View>
            <Text style={styles.toolTitle}>Conversations</Text>
            <Text style={styles.toolSub}>Roleplay restaurant & taxi</Text>
          </AnimatedPressable>
        </View>

        {/* ── Visual Travel Scenes Gallery ────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Key Travel Situations</Text>
        <Text style={styles.sectionSubtitle}>Situations and phrases tailored for your trip</Text>

        <View style={styles.scenesGrid}>
          {/* Dining */}
          <AnimatedPressable
            style={styles.sceneCard}
            onPress={() => {
              HapticsManager.light();
              router.push({
                pathname: '/(tabs)/survival',
                params: { category: 'restaurants' }
              } as any);
            }}
          >
            <Image source={{ uri: DINING_CARD_IMG }} style={styles.sceneImage} />
            <View style={styles.sceneOverlay} />
            <View style={styles.sceneContent}>
              <Text style={styles.sceneCategory}>RESTAURANTS & FOOD</Text>
              <Text style={styles.sceneTitle}>Menus, water & ordering</Text>
            </View>
          </AnimatedPressable>

          {/* Airport */}
          <AnimatedPressable
            style={styles.sceneCard}
            onPress={() => {
              HapticsManager.light();
              router.push({
                pathname: '/(tabs)/survival',
                params: { category: 'airport' }
              } as any);
            }}
          >
            <Image source={{ uri: TRANSIT_CARD_IMG }} style={styles.sceneImage} />
            <View style={styles.sceneOverlay} />
            <View style={styles.sceneContent}>
              <Text style={styles.sceneCategory}>AIRPORT & TRANSIT</Text>
              <Text style={styles.sceneTitle}>Gates, subway & taxis</Text>
            </View>
          </AnimatedPressable>

          {/* Shopping */}
          <AnimatedPressable
            style={styles.sceneCard}
            onPress={() => {
              HapticsManager.light();
              router.push({
                pathname: '/(tabs)/survival',
                params: { category: 'shops' }
              } as any);
            }}
          >
            <Image source={{ uri: SHOPPING_CARD_IMG }} style={styles.sceneImage} />
            <View style={styles.sceneOverlay} />
            <View style={styles.sceneContent}>
              <Text style={styles.sceneCategory}>SHOPS & PAYING</Text>
              <Text style={styles.sceneTitle}>Prices & tax-free cards</Text>
            </View>
          </AnimatedPressable>

          {/* Hotel */}
          <AnimatedPressable
            style={styles.sceneCard}
            onPress={() => {
              HapticsManager.light();
              router.push({
                pathname: '/(tabs)/survival',
                params: { category: 'hotel' }
              } as any);
            }}
          >
            <Image source={{ uri: HOTEL_CARD_IMG }} style={styles.sceneImage} />
            <View style={styles.sceneOverlay} />
            <View style={styles.sceneContent}>
              <Text style={styles.sceneCategory}>HOTEL & STAY</Text>
              <Text style={styles.sceneTitle}>Check-in & luggage hold</Text>
            </View>
          </AnimatedPressable>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 11,
    color: T.textMuted,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  greetingName: {
    fontSize: 22,
    color: T.ink,
    fontFamily: 'Spectral_700Bold',
    letterSpacing: -0.3,
  },
  destinationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.sandLine,
    gap: 4,
    ...TravelTheme.shadows.resting,
  },
  destinationBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },

  // Hero Card
  heroCard: {
    borderRadius: 14,
    height: 190,
    marginBottom: 18,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.sandLine,
    ...TravelTheme.shadows.raised,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 42, 47, 0.72)',
  },
  heroContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(196, 68, 46, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  flightPillText: {
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  departureDateText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  countdownNumber: {
    fontSize: 44,
    fontFamily: 'Spectral_700Bold',
    color: '#FFFFFF',
    lineHeight: 46,
  },
  countdownLabelBox: {
    flex: 1,
  },
  countdownDaysText: {
    fontSize: 11,
    fontFamily: 'Inter_800ExtraBold',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  countdownTargetText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.postmark,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    ...TravelTheme.shadows.button,
  },
  heroCtaText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },

  // Daily Phrase Card
  dailyPhraseCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 22,
    ...TravelTheme.shadows.resting,
  },
  dailyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dailyTagText: {
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    color: T.postmark,
    letterSpacing: 0.8,
  },
  audioPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.paper,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.sandLine,
    gap: 4,
  },
  audioPillBtnActive: {
    backgroundColor: T.postmark,
    borderColor: T.postmark,
  },
  audioPillText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  audioPillTextActive: {
    color: '#FFFFFF',
  },
  dailyJapaneseText: {
    fontSize: 15,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    marginBottom: 6,
  },
  dailyEnglishBox: {
    backgroundColor: T.paper,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 4,
  },
  dailyEnglishBoxActive: {
    backgroundColor: T.primaryLight,
    borderColor: T.postmark,
  },
  dailyEnglishLabel: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    color: T.postmark,
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  dailyEnglishText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  dailyPhonetic: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: T.textMuted,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginBottom: 12,
  },

  // Tool Strip
  toolGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  toolCard: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: T.sandLine,
    alignItems: 'center',
    ...TravelTheme.shadows.resting,
  },
  toolIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  toolTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
    textAlign: 'center',
  },
  toolSub: {
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Scenes Grid
  scenesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sceneCard: {
    width: '48%',
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: T.sandLine,
    ...TravelTheme.shadows.resting,
  },
  sceneImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  sceneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 42, 47, 0.62)',
  },
  sceneContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'flex-end',
  },
  sceneCategory: {
    fontSize: 8,
    fontFamily: 'Inter_800ExtraBold',
    color: T.primaryLight,
    letterSpacing: 0.8,
  },
  sceneTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    marginTop: 1,
  },
});
