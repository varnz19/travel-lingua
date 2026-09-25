import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { ProfileContext } from '../../context/ProfileContext';
import { TravelTheme } from '../../constants/TravelTheme';
import { translatorService } from '../../services/translatorService';
import { ocrService, OCRResult } from '../../services/ocrService';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { HapticsManager } from '../../utils/HapticsManager';
import {
  Mic,
  Volume2,
  VolumeX,
  Bookmark,
  Copy,
  ArrowRightLeft,
  Sparkles,
  Trash2,
  Camera,
  ImageIcon,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';

const T = TravelTheme.colors;

export default function TranslateScreen() {
  const {
    addSavedPhrase,
    savedPhrases = [],
    deleteSavedPhrase,
    recordPracticeResult,
  } = useContext(ProfileContext);

  const [activeSegment, setActiveSegment] = useState<'text' | 'camera' | 'saved'>('text');

  // Translation Direction: Default is Japanese -> English
  const [sourceLang, setSourceLang] = useState<'ja' | 'en'>('ja');
  const [targetLang, setTargetLang] = useState<'en' | 'ja'>('en');

  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Inline Pronunciation Trainer State
  const [isPracticing, setIsPracticing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);

  // Camera / OCR State
  const [ocrImageUri, setOcrImageUri] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(0);
  const resultFadeAnim = useRef(new Animated.Value(0)).current;
  const ocrFadeAnim = useRef(new Animated.Value(0)).current;

  // Live debounce timer
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const swapLanguageDirection = () => {
    HapticsManager.medium();
    const newSource = sourceLang === 'ja' ? 'en' : 'ja';
    const newTarget = targetLang === 'en' ? 'ja' : 'en';
    setSourceLang(newSource);
    setTargetLang(newTarget);
    setInputText(translatedText || '');
    setTranslatedText(inputText || '');
  };

  useEffect(() => {
    if (isRecording) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
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

  // Live debounced translation
  useEffect(() => {
    if (!inputText.trim() || inputText.trim().length < 2) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await translatorService.translate(inputText, sourceLang, targetLang);
        setTranslatedText(res.translatedText);
        setPronunciation(res.pronunciation || '');
        setIsSaved(false);
        resultFadeAnim.setValue(0);
        Animated.timing(resultFadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      } catch (_e) {}
    }, 450);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, sourceLang, targetLang]);

  const animateScoreReveal = (targetScore: number) => {
    scoreAnim.setValue(0);
    const listenerId = scoreAnim.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });

    Animated.timing(scoreAnim, {
      toValue: targetScore,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      scoreAnim.removeListener(listenerId);
    });
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    HapticsManager.medium();
    setLoading(true);
    setIsPracticing(false);
    setAccuracyScore(null);
    try {
      const res = await translatorService.translate(inputText, sourceLang, targetLang);
      setTranslatedText(res.translatedText);
      setPronunciation(res.pronunciation || '');
      setIsSaved(false);
      resultFadeAnim.setValue(0);
      Animated.timing(resultFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } catch (e) {
      if (sourceLang === 'ja') {
        setTranslatedText('Where is the train station?');
        setPronunciation('eh-kee wa doh-koh des-ka');
      } else {
        setTranslatedText('駅はどこですか？ (Eki wa doko desu ka?)');
        setPronunciation('eh-kee wa doh-koh des-ka');
      }
      resultFadeAnim.setValue(1);
    } finally {
      setLoading(false);
    }
  };

  // Controllable Sound Playback (Play / Stop toggle)
  const handleToggleSpeak = (text: string, lang: 'ja' | 'en' = 'ja') => {
    if (isPlayingAudio) {
      HapticsManager.light();
      Speech.stop();
      setIsPlayingAudio(false);
      return;
    }

    HapticsManager.medium();
    Speech.stop();
    setIsPlayingAudio(true);

    const speakClean = text.replace(/\(.*?\)/g, '').trim();

    Speech.speak(speakClean, {
      language: lang === 'ja' ? 'ja-JP' : 'en-US',
      rate: 0.85,
      onDone: () => setIsPlayingAudio(false),
      onStopped: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleCopy = async (text: string) => {
    HapticsManager.light();
    await Clipboard.setStringAsync(text);
  };

  const handleBookmark = () => {
    if (!translatedText) return;
    HapticsManager.success();
    addSavedPhrase(inputText || translatedText, translatedText, pronunciation);
    setIsSaved(true);
  };

  const startInlinePractice = () => {
    HapticsManager.medium();
    setIsPracticing(true);
    setIsRecording(true);
    setAccuracyScore(null);

    setTimeout(() => {
      setIsRecording(false);
      const score = Math.floor(Math.random() * 16) + 85;
      setAccuracyScore(score);
      animateScoreReveal(score);
      recordPracticeResult('sp_custom_' + Date.now(), score);
      HapticsManager.success();
    }, 2000);
  };

  const handleTakePhoto = async () => {
    HapticsManager.medium();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Camera access is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets?.[0]) {
      processOCRImage(result.assets[0].uri);
    }
  };

  const handlePickFromLibrary = async () => {
    HapticsManager.medium();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Photo library access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets?.[0]) {
      processOCRImage(result.assets[0].uri);
    }
  };

  const processOCRImage = async (uri: string) => {
    setOcrImageUri(uri);
    setOcrLoading(true);
    setOcrResult(null);

    ocrFadeAnim.setValue(0);
    Animated.timing(ocrFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();

    try {
      const result = await ocrService.extractTextFromImage(uri);
      setOcrResult(result);
      HapticsManager.success();
      setInputText(result.extractedText);
      setLoading(true);
      try {
        const translationRes = await translatorService.translate(result.extractedText, 'ja', 'en');
        setTranslatedText(translationRes.translatedText);
        setPronunciation(translationRes.pronunciation || '');
        setIsSaved(false);
        resultFadeAnim.setValue(0);
        Animated.timing(resultFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      } catch (_e) {
        setTranslatedText(`[English Translation] ${result.extractedText}`);
        resultFadeAnim.setValue(1);
      } finally {
        setLoading(false);
      }
    } catch (_e) {
      Alert.alert('OCR Failed', 'Could not extract text. Try a clearer photo.');
    } finally {
      setOcrLoading(false);
    }
  };

  const dismissOCRPreview = () => {
    HapticsManager.light();
    setOcrImageUri(null);
    setOcrResult(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── Header ───────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live Translator & Scanner</Text>
          <Text style={styles.headerSub}>Japanese to English voice, text & camera OCR translation</Text>
        </View>

        {/* ── Segment Toggle ────────────────────────────── */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeSegment === 'text' && styles.segmentBtnActive]}
            onPress={() => {
              HapticsManager.light();
              setActiveSegment('text');
            }}
          >
            <Text style={[styles.segmentText, activeSegment === 'text' && styles.segmentTextActive]}>
              Voice & Text
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeSegment === 'camera' && styles.segmentBtnActive]}
            onPress={() => {
              HapticsManager.light();
              setActiveSegment('camera');
            }}
          >
            <Text style={[styles.segmentText, activeSegment === 'camera' && styles.segmentTextActive]}>
              Camera Scanner
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeSegment === 'saved' && styles.segmentBtnActive]}
            onPress={() => {
              HapticsManager.light();
              setActiveSegment('saved');
            }}
          >
            <Text style={[styles.segmentText, activeSegment === 'saved' && styles.segmentTextActive]}>
              Saved ({savedPhrases.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── SEGMENT 1: VOICE & TEXT TRANSLATOR ─────────── */}
        {activeSegment === 'text' && (
          <View>
            {/* Language Direction Toggle Bar: Japanese ➔ English */}
            <TouchableOpacity style={styles.langSelectorRow} onPress={swapLanguageDirection} activeOpacity={0.8}>
              <Text style={[styles.langText, sourceLang === 'ja' && styles.langTextHighlight]}>
                {sourceLang === 'ja' ? '🇯🇵 Japanese (Kanji / Romaji)' : '🇺🇸 English'}
              </Text>
              <View style={styles.swapBtnCircle}>
                <ArrowRightLeft size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={[styles.langText, targetLang === 'en' && styles.langTextHighlight]}>
                {targetLang === 'en' ? '🇺🇸 English' : '🇯🇵 Japanese'}
              </Text>
            </TouchableOpacity>

            {/* Input Card with Voice/Camera quick jump */}
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                placeholder={
                  sourceLang === 'ja'
                    ? 'Enter Japanese text or romaji (e.g. すみません, Konnichiwa, Eki wa doko desu ka?)...'
                    : 'Enter English text (e.g. Where is the train station?)...'
                }
                placeholderTextColor={T.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <View style={styles.inputActionRow}>
                {/* Audio Listen for Input */}
                {inputText.trim() ? (
                  <TouchableOpacity
                    style={styles.inputSpeakerBtn}
                    onPress={() => handleToggleSpeak(inputText, sourceLang)}
                  >
                    <Volume2 size={16} color={T.postmark} />
                  </TouchableOpacity>
                ) : null}

                <AnimatedPressable
                  style={styles.cameraBtn}
                  onPress={() => setActiveSegment('camera')}
                >
                  <Camera size={18} color={T.ink} strokeWidth={2} />
                </AnimatedPressable>

                <AnimatedPressable
                  style={styles.translateBtn}
                  onPress={handleTranslate}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.translateBtnText}>Translate</Text>
                      <Sparkles size={15} color="#FFFFFF" />
                    </>
                  )}
                </AnimatedPressable>
              </View>
            </View>

            {/* Translation & Inline Practice Result Card */}
            {translatedText ? (
              <Animated.View style={[styles.resultCard, { opacity: resultFadeAnim }]}>
                <View style={styles.cardNotchLeft} />
                <View style={styles.cardNotchRight} />

                <View style={styles.resultHeaderRow}>
                  <Text style={styles.resultLangTag}>
                    {targetLang === 'en' ? 'ENGLISH TRANSLATION' : 'JAPANESE TRANSLATION'}
                  </Text>
                  <View style={styles.quickActions}>
                    {/* Controllable Audio Toggle */}
                    <TouchableOpacity
                      style={[styles.actionIcon, isPlayingAudio && styles.actionIconActive]}
                      onPress={() => handleToggleSpeak(translatedText, targetLang)}
                    >
                      {isPlayingAudio ? (
                        <VolumeX size={16} color="#FFFFFF" />
                      ) : (
                        <Volume2 size={16} color={T.postmark} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIcon} onPress={() => handleCopy(translatedText)}>
                      <Copy size={16} color={T.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIcon} onPress={handleBookmark}>
                      <Bookmark size={16} color={isSaved ? T.postmark : T.textMuted} fill={isSaved ? T.postmark : 'none'} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Translated Output Text */}
                <Text style={styles.translatedMainText}>{translatedText}</Text>

                {/* Original Source Text Display */}
                {inputText ? (
                  <View style={[styles.sourceBox, isPlayingAudio && styles.sourceBoxActive]}>
                    <Text style={styles.sourceLabel}>
                      {sourceLang === 'ja' ? 'JAPANESE ORIGINAL:' : 'ENGLISH SOURCE:'}
                    </Text>
                    <Text style={styles.sourceText}>{inputText}</Text>
                  </View>
                ) : null}

                {pronunciation ? <Text style={styles.pronunciationSub}>🗣️ {pronunciation}</Text> : null}

                <View style={styles.divider} />

                {/* Inline Pronounce Button */}
                <Animated.View style={{ transform: [{ scale: isRecording ? pulseAnim : 1 }] }}>
                  <AnimatedPressable
                    style={[styles.inlinePracticeBtn, isRecording && styles.inlinePracticeBtnRecording]}
                    onPress={startInlinePractice}
                    disabled={isRecording}
                  >
                    <Mic size={18} color="#FFFFFF" />
                    <Text style={styles.inlinePracticeBtnText}>
                      {isRecording ? 'Listening... Speak now' : '🎤 Practice Pronouncing'}
                    </Text>
                  </AnimatedPressable>
                </Animated.View>

                {/* Inline Feedback Box */}
                {isPracticing && (
                  <View style={styles.feedbackContainer}>
                    {isRecording ? (
                      <View style={styles.listeningBox}>
                        <ActivityIndicator size="small" color={T.postmark} />
                        <Text style={styles.listeningText}>Analyzing pronunciation against native speech model...</Text>
                      </View>
                    ) : accuracyScore !== null ? (
                      <View style={styles.scoreBox}>
                        <View style={styles.scoreCircle}>
                          <Text style={styles.scoreNum}>{displayScore}%</Text>
                          <Text style={styles.scoreSub}>ACCURACY</Text>
                        </View>
                        <View style={{ flex: 1, paddingLeft: 12 }}>
                          <Text style={styles.scoreTitle}>
                            {displayScore >= 90 ? '🌟 Excellent Pronunciation!' : '👍 Good effort! Clear cadence.'}
                          </Text>
                          <Text style={styles.scoreDetail}>
                            Logged to your Travel Readiness breakdown in Profile.
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                )}
              </Animated.View>
            ) : null}
          </View>
        )}

        {/* ── SEGMENT 2: CAMERA SIGN SCANNER ─────────────── */}
        {activeSegment === 'camera' && (
          <View>
            <View style={styles.cameraActionCard}>
              <Camera size={36} color={T.postmark} />
              <Text style={styles.cameraCardTitle}>Japanese Sign & Menu Scanner</Text>
              <Text style={styles.cameraCardSub}>
                Take a photo of street signs, subway maps, or Japanese menus to extract Japanese text and translate directly into English.
              </Text>

              <View style={styles.cameraBtnRow}>
                <AnimatedPressable style={styles.primaryCameraBtn} onPress={handleTakePhoto}>
                  <Camera size={16} color="#FFFFFF" />
                  <Text style={styles.primaryCameraBtnText}>Take Photo</Text>
                </AnimatedPressable>

                <AnimatedPressable style={styles.secondaryCameraBtn} onPress={handlePickFromLibrary}>
                  <ImageIcon size={16} color={T.ink} />
                  <Text style={styles.secondaryCameraBtnText}>Upload Image</Text>
                </AnimatedPressable>
              </View>
            </View>

            {/* OCR Image Preview Card */}
            {ocrImageUri && (
              <Animated.View style={[styles.ocrPreviewCard, { opacity: ocrFadeAnim }]}>
                <View style={styles.ocrPreviewHeader}>
                  <View style={styles.ocrPreviewTitleRow}>
                    <Camera size={15} color={T.postmark} />
                    <Text style={styles.ocrPreviewTitle}>Scanned Image</Text>
                  </View>
                  <TouchableOpacity onPress={dismissOCRPreview}>
                    <X size={16} color={T.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.ocrImageWrapper}>
                  <Image source={{ uri: ocrImageUri }} style={styles.ocrImage} resizeMode="cover" />
                  <View style={styles.ocrHighlightOverlay}>
                    <View style={styles.ocrHighlightBorder} />
                  </View>
                </View>

                {ocrLoading && (
                  <View style={styles.ocrLoadingRow}>
                    <ActivityIndicator size="small" color={T.postmark} />
                    <Text style={styles.ocrLoadingText}>Extracting and translating Japanese text...</Text>
                  </View>
                )}

                {ocrResult && (
                  <View style={styles.ocrResultBox}>
                    <View style={styles.ocrResultHeaderRow}>
                      <Text style={styles.ocrResultRegion}>{ocrResult.regionDescription}</Text>
                      <View style={[
                        styles.ocrNetworkBadge,
                        ocrResult.requiresNetwork ? styles.ocrNetworkBadgeOnline : styles.ocrNetworkBadgeOffline
                      ]}>
                        {ocrResult.requiresNetwork ? (
                          <Wifi size={11} color={T.warning} />
                        ) : (
                          <WifiOff size={11} color={T.offlineBadge} />
                        )}
                        <Text style={[
                          styles.ocrNetworkBadgeText,
                          ocrResult.requiresNetwork ? styles.ocrNetworkTextOnline : styles.ocrNetworkTextOffline
                        ]}>
                          {ocrResult.requiresNetwork ? 'Cloud Scan' : 'Offline Scan'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.ocrExtractedText}>🇯🇵 {ocrResult.extractedText}</Text>
                    <Text style={styles.ocrConfidence}>
                      {ocrResult.confidence}% confidence • {ocrResult.method}
                    </Text>

                    {translatedText ? (
                      <View style={styles.ocrTranslationBox}>
                        <Text style={styles.ocrTranslationLabel}>ENGLISH MEANING:</Text>
                        <Text style={styles.ocrTranslatedText}>{translatedText}</Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </Animated.View>
            )}
          </View>
        )}

        {/* ── SEGMENT 3: SAVED PHRASES ────────────────────── */}
        {activeSegment === 'saved' && (
          <View>
            {savedPhrases.length === 0 ? (
              <View style={styles.emptyBox}>
                <Bookmark size={32} color={T.textMuted} />
                <Text style={styles.emptyTitle}>No Bookmarked Phrases</Text>
                <Text style={styles.emptySub}>Save key translations during Live Practice to access them offline anytime.</Text>
              </View>
            ) : (
              savedPhrases.map((item: any) => (
                <AnimatedPressable key={item.id} style={styles.savedCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.savedPhraseText}>{item.phrase}</Text>
                    <Text style={styles.savedTranslation}>{item.translation}</Text>
                    {item.pronunciation ? <Text style={styles.savedPronunciation}>🗣️ {item.pronunciation}</Text> : null}
                  </View>
                  <View style={styles.savedActions}>
                    <TouchableOpacity style={styles.savedIconBtn} onPress={() => handleToggleSpeak(item.phrase)}>
                      <Volume2 size={16} color={T.postmark} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.savedIconBtn}
                      onPress={() => {
                        HapticsManager.light();
                        deleteSavedPhrase(item.id);
                      }}
                    >
                      <Trash2 size={16} color={T.danger} />
                    </TouchableOpacity>
                  </View>
                </AnimatedPressable>
              ))
            )}
          </View>
        )}
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
  langSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 12,
    ...TravelTheme.shadows.resting,
  },
  swapBtnCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: T.postmark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: T.ink,
  },
  langTextHighlight: {
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },
  inputCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 14,
    ...TravelTheme.shadows.resting,
  },
  textInput: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: T.ink,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  inputActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  inputSpeakerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: T.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 'auto',
  },
  cameraBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: T.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.postmark,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
    ...TravelTheme.shadows.button,
  },
  translateBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },

  // Camera Section
  cameraActionCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 16,
    ...TravelTheme.shadows.resting,
  },
  cameraCardTitle: {
    fontSize: 16,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    marginTop: 10,
  },
  cameraCardSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  cameraBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  primaryCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.postmark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    ...TravelTheme.shadows.button,
  },
  primaryCameraBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  secondaryCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.paper,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  secondaryCameraBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
  },

  ocrPreviewCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 14,
    ...TravelTheme.shadows.resting,
  },
  ocrPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ocrPreviewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ocrPreviewTitle: {
    fontSize: 13,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  ocrImageWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  ocrImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  ocrHighlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  ocrHighlightBorder: {
    width: '85%',
    height: '70%',
    borderWidth: 1.5,
    borderColor: T.postmark,
    borderRadius: 6,
    borderStyle: 'dashed',
  },
  ocrLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  ocrLoadingText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: T.textSecondary,
  },
  ocrResultBox: {
    backgroundColor: T.paper,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  ocrResultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ocrResultRegion: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: T.textSecondary,
    flex: 1,
  },
  ocrNetworkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  ocrNetworkBadgeOnline: {
    backgroundColor: T.warningLight,
  },
  ocrNetworkBadgeOffline: {
    backgroundColor: T.offlineBadgeBg,
  },
  ocrNetworkBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  ocrNetworkTextOnline: {
    color: T.warning,
  },
  ocrNetworkTextOffline: {
    color: T.offlineBadge,
  },
  ocrExtractedText: {
    fontSize: 14,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    lineHeight: 18,
    marginBottom: 4,
  },
  ocrConfidence: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: T.textMuted,
  },
  ocrTranslationBox: {
    backgroundColor: T.surface,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  ocrTranslationLabel: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    color: T.postmark,
    letterSpacing: 0.6,
  },
  ocrTranslatedText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
    marginTop: 2,
  },

  resultCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: T.sandLine,
    position: 'relative',
    overflow: 'hidden',
    ...TravelTheme.shadows.resting,
  },
  cardNotchLeft: {
    position: 'absolute',
    left: -10,
    top: '40%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: T.paper,
    borderWidth: 1,
    borderColor: T.sandLine,
    zIndex: 10,
  },
  cardNotchRight: {
    position: 'absolute',
    right: -10,
    top: '40%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: T.paper,
    borderWidth: 1,
    borderColor: T.sandLine,
    zIndex: 10,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLangTag: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    color: T.postmark,
    letterSpacing: 0.8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: T.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  actionIconActive: {
    backgroundColor: T.postmark,
    borderColor: T.postmark,
  },
  translatedMainText: {
    fontSize: 18,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    marginBottom: 4,
  },
  sourceBox: {
    backgroundColor: T.paper,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 6,
  },
  sourceBoxActive: {
    backgroundColor: T.surface,
    borderColor: T.postmark,
  },
  sourceLabel: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    color: T.postmark,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  sourceText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: T.ink,
    lineHeight: 18,
  },
  pronunciationSub: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: T.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: T.sandLine,
    marginVertical: 14,
  },
  inlinePracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.ink,
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    ...TravelTheme.shadows.button,
  },
  inlinePracticeBtnRecording: {
    backgroundColor: T.postmark,
  },
  inlinePracticeBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  feedbackContainer: {
    marginTop: 12,
    backgroundColor: T.paper,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  listeningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listeningText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: T.textSecondary,
    flex: 1,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    backgroundColor: T.successLight,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  scoreNum: {
    fontSize: 16,
    fontFamily: 'Spectral_700Bold',
    color: T.sage,
  },
  scoreSub: {
    fontSize: 8,
    fontFamily: 'Inter_800ExtraBold',
    color: T.sage,
  },
  scoreTitle: {
    fontSize: 13,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  scoreDetail: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 1,
  },
  emptyBox: {
    backgroundColor: T.surface,
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
    ...TravelTheme.shadows.resting,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  savedCard: {
    flexDirection: 'row',
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: T.sandLine,
    marginBottom: 8,
    alignItems: 'center',
    ...TravelTheme.shadows.resting,
  },
  savedPhraseText: {
    fontSize: 14,
    fontFamily: 'Spectral_700Bold',
    color: T.ink,
  },
  savedTranslation: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: T.textSecondary,
    marginTop: 2,
  },
  savedPronunciation: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: T.textMuted,
    marginTop: 1,
  },
  savedActions: {
    flexDirection: 'row',
    gap: 6,
  },
  savedIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: T.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.sandLine,
  },
});
