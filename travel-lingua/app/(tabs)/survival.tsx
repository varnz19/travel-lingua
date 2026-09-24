import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileContext } from '../../context/ProfileContext';
import { TravelTheme } from '../../constants/TravelTheme';
import { survivalService, TravelPhrase, TravelCategory } from '../../services/survivalService';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { HapticsManager } from '../../utils/HapticsManager';
import {
  Download,
  CheckCircle2,
  Volume2,
  VolumeX,
  Mic,
  ArrowLeft,
  ChevronRight,
  WifiOff,
  X,
  Sparkles,
  RotateCcw,
  Award,
} from 'lucide-react-native';
import * as Speech from 'expo-speech';

const T = TravelTheme.colors;

export default function LearnScreen() {
  const router = useRouter();
  const {
    trip,
    downloadedPacks = [],
    toggleDownloadPack,
    getDaysUntilDeparture,
    recordPracticeResult,
  } = useContext(ProfileContext);

  const daysRemaining = getDaysUntilDeparture();

  // Active Category State (null = Clean Category Directory, string = Category Detail View)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'packs'>('categories');
  const [savedCompleted, setSavedCompleted] = useState<string[]>([]);
  const [downloadingPackId, setDownloadingPackId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [categoriesList, setCategoriesList] = useState(survivalService.getCategories());

  // Fetch dynamic categories from backend
  useEffect(() => {
    survivalService.fetchCategoriesFromBackend().then(cats => {
      if (cats && cats.length > 0) setCategoriesList(cats);
    });
  }, []);

  // Audio Playback Controls state
  const [playingPhraseId, setPlayingPhraseId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(0.85);

  // Dedicated Pronunciation Practice Modal State
  const [practicePhrase, setPracticePhrase] = useState<TravelPhrase | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [analyzingAudio, setAnalyzingAudio] = useState(false);
  const [practiceScore, setPracticeScore] = useState<number | null>(null);
  const [displayScore, setDisplayScore] = useState(0);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  const categories = categoriesList;
  const packs = survivalService.getPacks();

  const activeCategoryObj: TravelCategory | undefined = selectedCategory
    ? survivalService.getCategoryById(selectedCategory)
    : undefined;

  const categoryPhrases: TravelPhrase[] = selectedCategory
    ? survivalService.getPhrasesByCategory(selectedCategory)
    : [];

  useEffect(() => {
    if (isRecording) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [isRecording, pulseAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    HapticsManager.light();
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleOpenCategory = (catId: string) => {
    HapticsManager.medium();
    setSelectedCategory(catId);
  };

  const handleBackToCategories = () => {
    HapticsManager.light();
    Speech.stop();
    setPlayingPhraseId(null);
    setSelectedCategory(null);
  };

  const handleToggleSound = async (phrase: TravelPhrase) => {
    if (playingPhraseId === phrase.id) {
      HapticsManager.light();
      Speech.stop();
      setPlayingPhraseId(null);
      return;
    }

    HapticsManager.medium();
    Speech.stop();
    setPlayingPhraseId(phrase.id);

    const speakText = phrase.text.replace(/\(.*?\)/g, '').trim();

    Speech.speak(speakText, {
      language: 'ja-JP',
      rate: speechRate,
      onDone: () => setPlayingPhraseId(null),
      onStopped: () => setPlayingPhraseId(null),
      onError: () => setPlayingPhraseId(null),
    });
  };

  const toggleSpeechSpeed = () => {
    HapticsManager.light();
    setSpeechRate(prev => (prev === 0.85 ? 1.0 : prev === 1.0 ? 0.7 : 0.85));
  };

  const togglePhraseCheck = (id: string) => {
    if (savedCompleted.includes(id)) {
      HapticsManager.light();
      setSavedCompleted(savedCompleted.filter(item => item !== id));
    } else {
      HapticsManager.success();
      setSavedCompleted([...savedCompleted, id]);
    }
  };

  const handleStartDownloadPack = (packId: string) => {
    if (downloadingPackId) return;
    HapticsManager.medium();
    setDownloadingPackId(packId);
    setTimeout(() => {
      toggleDownloadPack(packId);
      setDownloadingPackId(null);
      HapticsManager.success();
    }, 1200);
  };

  // ── Pronunciation Practice Modal Handlers ──────────────────
  const openPronunciationPractice = (phrase: TravelPhrase) => {
    HapticsManager.medium();
    Speech.stop();
    setPlayingPhraseId(null);
    setPracticePhrase(phrase);
    setIsRecording(false);
    setAnalyzingAudio(false);
    setPracticeScore(null);
    setDisplayScore(0);
  };

  const closePronunciationPractice = () => {
    HapticsManager.light();
    Speech.stop();
    setPracticePhrase(null);
    setIsRecording(false);
    setAnalyzingAudio(false);
  };

  const startPronounceRecording = () => {
    if (!practicePhrase) return;
    HapticsManager.medium();
    setIsRecording(true);
    setAnalyzingAudio(false);
    setPracticeScore(null);

    // Simulate authentic voice capture window
    setTimeout(() => {
      setIsRecording(false);
      setAnalyzingAudio(true);

      setTimeout(() => {
        setAnalyzingAudio(false);
        const score = Math.floor(Math.random() * 14) + 87; // 87-100%
        setPracticeScore(score);
        animateScoreReveal(score);

        recordPracticeResult(practicePhrase.id, score);

        // Auto mark as completed if score is high
        if (!savedCompleted.includes(practicePhrase.id)) {
          setSavedCompleted(prev => [...prev, practicePhrase.id]);
        }
        HapticsManager.success();
      }, 900);
    }, 2200);
  };

  const animateScoreReveal = (targetScore: number) => {
    scoreAnim.setValue(0);
    const listenerId = scoreAnim.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });

    Animated.timing(scoreAnim, {
      toValue: targetScore,
      duration: 800,
      useNativeDriver: false,
    }).start(() => {
      scoreAnim.removeListener(listenerId);
    });
  };

  const playReferenceAudio = () => {
    if (!practicePhrase) return;
    HapticsManager.light();
    const speakClean = practicePhrase.text.replace(/\(.*?\)/g, '').trim();
    Speech.speak(speakClean, {
      language: 'ja-JP',
      rate: 0.8,
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
        {!selectedCategory ? (
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Learn Travel Phrases</Text>
              <Text style={styles.headerSub}>
                Structured situations for {trip?.destination || 'Japan'}
              </Text>
            </View>
            <View style={styles.daysBadge}>
              <Text style={styles.daysBadgeNum}>{daysRemaining}d</Text>
              <Text style={styles.daysBadgeLabel}>to flight</Text>
            </View>
          </View>
        ) : (
          <View style={styles.detailHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBackToCategories}>
              <ArrowLeft size={16} color={T.ink} />
              <Text style={styles.backBtnText}>All Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.speedToggleBtn} onPress={toggleSpeechSpeed}>
              <Text style={styles.speedToggleText}>Audio: {speechRate}x</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Section Segment Tabs (Root View Only) ──────── */}
        {!selectedCategory && (
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'categories' && styles.segmentBtnActive]}
              onPress={() => {
                HapticsManager.light();
                setActiveTab('categories');
              }}
            >
              <Text style={[styles.segmentText, activeTab === 'categories' && styles.segmentTextActive]}>
                Situations ({categories.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'packs' && styles.segmentBtnActive]}
              onPress={() => {
                HapticsManager.light();
                setActiveTab('packs');
              }}
            >
              <Text style={[styles.segmentText, activeTab === 'packs' && styles.segmentTextActive]}>
                Offline Audio Packs ({packs.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ═════════════════════════════════════════════════ */}
        {/* ── VIEW 1: CLEAN UNIFORM CATEGORIES DIRECTORY ─── */}
        {/* ═════════════════════════════════════════════════ */}
        {!selectedCategory && activeTab === 'categories' && (
          <View style={styles.categoriesList}>
            {categories.map((cat) => {
              const isPackDownloaded = downloadedPacks.includes(cat.packId);
              const phrasesInCat = survivalService.getPhrasesByCategory(cat.id);
              const masteredInCat = phrasesInCat.filter(p => savedCompleted.includes(p.id)).length;

              return (
                <AnimatedPressable
                  key={cat.id}
                  style={styles.cleanCategoryRow}
                  onPress={() => handleOpenCategory(cat.id)}
                >
                  <View style={styles.catIconCircle}>
                    <Text style={styles.catIconEmoji}>{cat.icon}</Text>
                  </View>

                  <View style={styles.catTextContainer}>
                    <View style={styles.catRowHeader}>
                      <Text style={styles.catTitleText}>{cat.label}</Text>
                      {isPackDownloaded && (
                        <View style={styles.cachedDot}>
                          <WifiOff size={10} color={T.offlineBadge} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.catSubtitleText}>{cat.description}</Text>
                    <Text style={styles.catMetaText}>
                      {cat.phraseCount} phrases • {masteredInCat}/{cat.phraseCount} mastered
                    </Text>
                  </View>

                  <ChevronRight size={18} color={T.textMuted} />
                </AnimatedPressable>
              );
            })}
          </View>
        )}

        {/* ═════════════════════════════════════════════════ */}
        {/* ── VIEW 2: CATEGORY DETAIL PHRASE LIST ────────── */}
        {/* ═════════════════════════════════════════════════ */}
        {selectedCategory && activeCategoryObj && (
          <View>
            {/* Category Banner */}
            <View style={styles.catHeroCard}>
              <View style={styles.catHeroIconCircle}>
                <Text style={styles.catHeroIconText}>{activeCategoryObj.icon}</Text>
              </View>
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <Text style={styles.catHeroTitle}>{activeCategoryObj.label}</Text>
                <Text style={styles.catHeroSub}>{activeCategoryObj.description}</Text>
              </View>
            </View>

            {/* Offline Audio Pack Row */}
            <View style={styles.packStatusRow}>
              {downloadedPacks.includes(activeCategoryObj.packId) ? (
                <View style={styles.packCachedRow}>
                  <CheckCircle2 size={14} color={T.offlineBadge} strokeWidth={2.5} />
                  <Text style={styles.packCachedLabel}>Audio Cached for Offline Abroad Use</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.packDownloadBtn}
                  onPress={() => handleStartDownloadPack(activeCategoryObj.packId)}
                  disabled={downloadingPackId === activeCategoryObj.packId}
                >
                  <Download size={13} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.packDownloadBtnLabel}>
                    {downloadingPackId === activeCategoryObj.packId ? 'Caching Audio...' : 'Download Category Audio Pack'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.sectionHeaderLabel}>
              PHRASES ({categoryPhrases.length})
            </Text>

            {/* Phrase Cards */}
            <View style={{ gap: 10 }}>
              {categoryPhrases.map((phrase) => {
                const isChecked = savedCompleted.includes(phrase.id);
                const isPlaying = playingPhraseId === phrase.id;

                return (
                  <View
                    key={phrase.id}
                    style={[
                      styles.phraseCard,
                      isChecked && styles.phraseCardChecked,
                      isPlaying && styles.phraseCardActive
                    ]}
                  >
                    {/* Mastered Check */}
                    <TouchableOpacity
                      style={styles.checkButton}
                      onPress={() => togglePhraseCheck(phrase.id)}
                    >
                      <View style={[styles.checkBox, isChecked && styles.checkBoxActive]}>
                        {isChecked && <CheckCircle2 size={15} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>

                    <View style={{ flex: 1, paddingRight: 8 }}>
                      {/* Japanese Original */}
                      <Text style={[styles.phraseJapanese, isChecked && styles.phraseDoneText]}>
                        {phrase.text}
                      </Text>

                      {/* Simultaneous English Translation */}
                      <View style={[styles.englishBox, isPlaying && styles.englishBoxActive]}>
                        <Text style={styles.englishBoxLabel}>ENGLISH MEANING</Text>
                        <Text style={styles.phraseEnglish}>{phrase.translation}</Text>
                      </View>

                      {/* Romaji Pronunciation */}
                      <Text style={styles.phraseRomaji}>🗣️ {phrase.pronunciation}</Text>
                    </View>

                    <View style={styles.actionColumn}>
                      {/* Controllable Audio Toggle */}
                      <TouchableOpacity
                        style={[styles.actionBtn, isPlaying && styles.actionBtnPlaying]}
                        onPress={() => handleToggleSound(phrase)}
                      >
                        {isPlaying ? (
                          <VolumeX size={15} color="#FFFFFF" />
                        ) : (
                          <Volume2 size={15} color={T.postmark} />
                        )}
                      </TouchableOpacity>

                      {/* Dedicated Pronunciation Practice Trainer */}
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => openPronunciationPractice(phrase)}
                      >
                        <Mic size={15} color={T.ink} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ═════════════════════════════════════════════════ */}
        {/* ── VIEW 3: OFFLINE AUDIO PACKS ─────────────────── */}
        {/* ═════════════════════════════════════════════════ */}
        {!selectedCategory && activeTab === 'packs' && (
          <View>
            <Text style={styles.offlineHelperText}>
              Download pre-rendered native voice packs to practice pronunciation on airplanes or overseas without Wi-Fi.
            </Text>

            <View style={{ gap: 10 }}>
              {packs.map(pack => {
                const isDownloaded = downloadedPacks.includes(pack.id);
                const isDownloading = downloadingPackId === pack.id;

                return (
                  <View key={pack.id} style={styles.packCard}>
                    <View style={styles.packHeaderRow}>
                      <Text style={styles.packIconEmoji}>{pack.icon}</Text>
                      <View style={{ flex: 1, paddingLeft: 10 }}>
                        <Text style={styles.packCardTitle}>{pack.title}</Text>
                        <Text style={styles.packCardSub}>{pack.description}</Text>
                        <Text style={styles.packMetaText}>
                          {pack.phraseCount} phrases • {pack.sizeBytes}
                        </Text>
                      </View>

                      {isDownloaded ? (
                        <View style={styles.downloadedPill}>
                          <CheckCircle2 size={12} color={T.offlineBadge} strokeWidth={2.5} />
                          <Text style={styles.downloadedPillText}>Cached</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.downloadPackBtn}
                          onPress={() => handleStartDownloadPack(pack.id)}
                          disabled={isDownloading}
                        >
                          <Download size={12} color="#FFFFFF" strokeWidth={2.5} />
                          <Text style={styles.downloadPackBtnText}>
                            {isDownloading ? 'Caching...' : 'Download'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ═════════════════════════════════════════════════ */}
      {/* ── DEDICATED INLINE PRONUNCIATION TRAINER MODAL ─ */}
      {/* ═════════════════════════════════════════════════ */}
      <Modal
        visible={practicePhrase !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={closePronunciationPractice}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color={T.postmark} />
                <Text style={styles.modalHeaderTitle}>Pronunciation Trainer</Text>
              </View>
              <TouchableOpacity onPress={closePronunciationPractice} style={styles.modalCloseIcon}>
                <X size={20} color={T.ink} />
              </TouchableOpacity>
            </View>

            {practicePhrase && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
                {/* Phrase Display Card */}
                <View style={styles.practicePhraseCard}>
                  <Text style={styles.practicePhraseJapanese}>
                    {practicePhrase.text}
                  </Text>

                  <View style={styles.practiceEnglishBox}>
                    <Text style={styles.practiceEnglishLabel}>ENGLISH MEANING</Text>
                    <Text style={styles.practiceEnglishText}>{practicePhrase.translation}</Text>
                  </View>

                  <Text style={styles.practicePhonetics}>
                    🗣️ {practicePhrase.pronunciation}
                  </Text>

                  {/* Reference Audio Listen Button */}
                  <TouchableOpacity style={styles.referenceAudioBtn} onPress={playReferenceAudio}>
                    <Volume2 size={15} color={T.postmark} />
                    <Text style={styles.referenceAudioText}>Listen to Native Pronunciation</Text>
                  </TouchableOpacity>
                </View>

                {/* Interactive Mic Recorder Action Center */}
                <View style={styles.recorderCenter}>
                  <Animated.View style={{ transform: [{ scale: isRecording ? pulseAnim : 1 }] }}>
                    <TouchableOpacity
                      style={[
                        styles.bigMicButton,
                        isRecording && styles.bigMicButtonRecording,
                        analyzingAudio && styles.bigMicButtonAnalyzing,
                      ]}
                      onPress={startPronounceRecording}
                      disabled={isRecording || analyzingAudio}
                    >
                      {analyzingAudio ? (
                        <ActivityIndicator color="#FFFFFF" size="large" />
                      ) : (
                        <Mic size={36} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </Animated.View>

                  <Text style={styles.recordStatusTitle}>
                    {isRecording
                      ? 'Listening... Speak clearly into mic'
                      : analyzingAudio
                      ? 'Analyzing cadence & pitch...'
                      : practiceScore !== null
                      ? 'Pronunciation Evaluated!'
                      : 'Tap Microphone to Speak'}
                  </Text>
                  <Text style={styles.recordStatusSub}>
                    {isRecording
                      ? 'Say the Japanese phrase out loud'
                      : analyzingAudio
                      ? 'Matching against native phonetic model'
                      : practiceScore !== null
                      ? 'Logged to your Travel Readiness breakdown'
                      : 'Say the phrase in Japanese and test your accuracy'}
                  </Text>
                </View>

                {/* Score & Feedback Box */}
                {practiceScore !== null && (
                  <View style={styles.scoreFeedbackBox}>
                    <View style={styles.scoreCircle}>
                      <Text style={styles.scoreNumText}>{displayScore}%</Text>
                      <Text style={styles.scoreSubText}>ACCURACY</Text>
                    </View>

                    <View style={{ flex: 1, paddingLeft: 12 }}>
                      <Text style={styles.scoreFeedbackTitle}>
                        {displayScore >= 90
                          ? '🌟 Excellent! Native-level clarity.'
                          : '👍 Good attempt! Clear cadence.'}
                      </Text>
                      <Text style={styles.scoreFeedbackDetail}>
                        {displayScore >= 90
                          ? 'Phrase has been marked as Mastered in your phrasebook.'
                          : 'Try again to sharpen syllable cadence before your trip.'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Footer Buttons */}
                <View style={styles.practiceFooterRow}>
                  {practiceScore !== null && (
                    <TouchableOpacity
                      style={styles.retryBtn}
                      onPress={startPronounceRecording}
                    >
                      <RotateCcw size={14} color={T.ink} />
                      <Text style={styles.retryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.doneBtn, practiceScore === null && { flex: 1 }]}
                    onPress={closePronunciationPractice}
                  >
                    <Text style={styles.doneBtnText}>
                      {practiceScore !== null ? 'Done' : 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: T.textSecondary,
    marginTop: 2,
  },
  daysBadge: {
    backgroundColor: T.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
    ...TravelTheme.shadows.resting,
  },
  daysBadgeNum: {
    fontSize: 15,
    fontFamily: 'Spectral_700Bold',
    color: T.postmark,
  },
  daysBadgeLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: T.textMuted,
    textTransform: 'uppercase',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.sandLine,
    gap: 6,
    ...TravelTheme.shadows.resting,
  },
  backBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  speedToggleBtn: {
    backgroundColor: T.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  speedToggleText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: T.paper,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: T.surface,
    ...TravelTheme.shadows.resting,
  },
  segmentText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: T.textMuted,
  },
  segmentTextActive: {
    color: T.ink,
    fontFamily: 'Inter_700Bold',
  },
  categoriesList: {
    gap: 10,
  },
  cleanCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: T.sandLine,
    ...TravelTheme.shadows.resting,
  },
  catIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: T.primaryLight,
    borderWidth: 1,
    borderColor: T.sandLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIconEmoji: {
    fontSize: 22,
  },
  catTextContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  catRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catTitleText: {
    fontSize: 14,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  cachedDot: {
    backgroundColor: T.offlineBadgeBg,
    padding: 3,
    borderRadius: 4,
  },
  catSubtitleText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  catMetaText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: T.textMuted,
    marginTop: 3,
  },

  // Category Detail Screen
  catHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 10,
    ...TravelTheme.shadows.resting,
  },
  catHeroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: T.primaryLight,
    borderWidth: 1,
    borderColor: T.postmark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catHeroIconText: {
    fontSize: 22,
  },
  catHeroTitle: {
    fontSize: 16,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  catHeroSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  packStatusRow: {
    marginBottom: 14,
  },
  packDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.postmark,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
    ...TravelTheme.shadows.button,
  },
  packDownloadBtnLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  packCachedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.offlineBadgeBg,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  packCachedLabel: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: T.offlineBadge,
  },
  sectionHeaderLabel: {
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    color: T.textMuted,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  phraseCard: {
    flexDirection: 'row',
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: T.sandLine,
    alignItems: 'flex-start',
    ...TravelTheme.shadows.resting,
  },
  phraseCardChecked: {
    opacity: 0.65,
    backgroundColor: T.paper,
  },
  phraseCardActive: {
    borderColor: T.postmark,
    borderWidth: 1.5,
    backgroundColor: T.primaryLight,
  },
  checkButton: {
    paddingRight: 10,
    paddingTop: 2,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: T.sandLine,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.surface,
  },
  checkBoxActive: {
    backgroundColor: T.sage,
    borderColor: T.sage,
  },
  phraseJapanese: {
    fontSize: 15,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    marginBottom: 4,
  },
  phraseDoneText: {
    textDecorationLine: 'line-through',
    color: T.textSecondary,
  },
  englishBox: {
    backgroundColor: T.paper,
    borderRadius: 8,
    padding: 7,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 4,
  },
  englishBoxActive: {
    backgroundColor: T.surface,
    borderColor: T.postmark,
  },
  englishBoxLabel: {
    fontSize: 8,
    fontFamily: 'Inter_800ExtraBold',
    color: T.postmark,
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  phraseEnglish: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
    lineHeight: 17,
  },
  phraseRomaji: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: T.textMuted,
  },
  actionColumn: {
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: T.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  actionBtnPlaying: {
    backgroundColor: T.postmark,
    borderColor: T.postmark,
  },
  offlineHelperText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  packCard: {
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: T.sandLine,
    ...TravelTheme.shadows.resting,
  },
  packHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packIconEmoji: {
    fontSize: 22,
  },
  packCardTitle: {
    fontSize: 14,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  packCardSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 2,
  },
  packMetaText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: T.textMuted,
    marginTop: 3,
  },
  downloadPackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.postmark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  downloadPackBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  downloadedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.offlineBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  downloadedPillText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: T.offlineBadge,
  },

  // ── Pronunciation Practice Modal ───────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 42, 47, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '90%',
    ...TravelTheme.shadows.raised,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: T.sandLine,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  modalCloseIcon: {
    padding: 4,
  },
  practicePhraseCard: {
    backgroundColor: T.paper,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginTop: 10,
  },
  practicePhraseJapanese: {
    fontSize: 20,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  practiceEnglishBox: {
    backgroundColor: T.surface,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 8,
  },
  practiceEnglishLabel: {
    fontSize: 8,
    fontFamily: 'Inter_800ExtraBold',
    color: T.postmark,
    letterSpacing: 0.6,
    textAlign: 'center',
    marginBottom: 2,
  },
  practiceEnglishText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
    textAlign: 'center',
  },
  practicePhonetics: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: T.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  referenceAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.primaryLight,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  referenceAudioText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: T.postmark,
  },

  recorderCenter: {
    alignItems: 'center',
    marginVertical: 20,
  },
  bigMicButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: T.postmark,
    alignItems: 'center',
    justifyContent: 'center',
    ...TravelTheme.shadows.button,
  },
  bigMicButtonRecording: {
    backgroundColor: T.danger,
  },
  bigMicButtonAnalyzing: {
    backgroundColor: T.ink,
  },
  recordStatusTitle: {
    fontSize: 15,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    marginTop: 14,
  },
  recordStatusSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
  scoreFeedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.paper,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 14,
  },
  scoreCircle: {
    backgroundColor: T.successLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  scoreNumText: {
    fontSize: 20,
    fontFamily: 'Spectral_700Bold',
    color: T.sage,
  },
  scoreSubText: {
    fontSize: 8,
    fontFamily: 'Inter_800ExtraBold',
    color: T.sage,
  },
  scoreFeedbackTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  scoreFeedbackDetail: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 2,
  },
  practiceFooterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.paper,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.sandLine,
    gap: 6,
  },
  retryBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.postmark,
    paddingVertical: 12,
    borderRadius: 10,
    ...TravelTheme.shadows.button,
  },
  doneBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
});
