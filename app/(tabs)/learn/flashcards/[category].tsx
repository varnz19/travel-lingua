import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { lessonService, Phrase } from '../../../../services/lessonService';
import { ProfileContext } from '../../../../context/ProfileContext';

export default function FlashcardsScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const { speechSpeed, addSavedPhrase, completeLesson } = useContext(ProfileContext);

  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [starred, setStarred] = useState<Record<string, boolean>>({});
  const [learned, setLearned] = useState<Record<string, boolean>>({});

  // Quiz Mode State
  const [quizMode, setQuizMode] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState<{ phrase: string; correct: string; chosen: string }[]>([]);

  useEffect(() => {
    const fetchPhrases = async () => {
      if (!category) return;
      const catData = await lessonService.getCategory(category);
      if (catData) {
        setPhrases(catData.phrases);
      }
    };
    fetchPhrases();
  }, [category]);

  // Generate Multiple Choice Options
  useEffect(() => {
    if (phrases.length > 0 && quizMode) {
      const currentPhrase = phrases[currentIndex];
      const correct = currentPhrase.back;
      
      const otherAnswers = phrases
        .filter(p => p.back !== correct)
        .map(p => p.back);
      
      const shuffledWrong = otherAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);
      const combined = [correct, ...shuffledWrong].sort(() => 0.5 - Math.random());
      
      while (combined.length < 4) {
        combined.push("Alternative translation " + combined.length);
      }

      setOptions(combined);
      setSelectedOption(null);
    }
  }, [currentIndex, quizMode, phrases]);

  if (phrases.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Phrases...</Text>
      </View>
    );
  }

  const currentPhrase = phrases[currentIndex];

  const handleTTS = () => {
    const cleanText = currentPhrase.front.split('(')[0].trim();
    Speech.speak(cleanText, {
      language: 'ja',
      rate: speechSpeed || 1.0
    });
  };

  const handleNext = () => {
    setFlipped(false);
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (quizMode) {
        setQuizFinished(true);
        completeLesson(category || 'general');
      } else {
        setCurrentIndex(0);
      }
    }
  };

  const handlePrev = () => {
    setFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleShuffle = () => {
    setPhrases([...phrases].sort(() => 0.5 - Math.random()));
    setCurrentIndex(0);
    setFlipped(false);
  };

  const toggleStar = () => {
    const isStarred = !starred[currentPhrase.id];
    setStarred({ ...starred, [currentPhrase.id]: isStarred });
    if (isStarred) {
      addSavedPhrase(currentPhrase.front, currentPhrase.back, currentPhrase.pronunciation);
    }
  };

  const toggleLearned = () => {
    setLearned({ ...learned, [currentPhrase.id]: !learned[currentPhrase.id] });
  };

  const handleSelectOption = (opt: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt);
    if (opt === currentPhrase.back) {
      setQuizScore(prev => prev + 1);
    } else {
      setIncorrectAnswers(prev => [
        ...prev,
        { phrase: currentPhrase.front, correct: currentPhrase.back, chosen: opt }
      ]);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    setSelectedOption(null);
    setIncorrectAnswers([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>{category || 'Flashcards'}</Text>
        <TouchableOpacity 
          style={[styles.quizToggleBtn, quizMode && styles.quizToggleBtnActive]}
          onPress={() => { setQuizMode(!quizMode); resetQuiz(); }}
        >
          <Text style={[styles.quizToggleText, quizMode && styles.quizToggleTextActive]}>
            {quizMode ? 'Cards' : 'Quiz'}
          </Text>
        </TouchableOpacity>
      </View>

      {quizFinished ? (
        <ScrollView contentContainerStyle={styles.summaryContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.summaryTitle}>Quiz Finished! 🎉</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{quizScore} / {phrases.length}</Text>
          </View>
          <Text style={styles.pointsText}>Awarded +50 XP and 10 Coins</Text>

          {incorrectAnswers.length > 0 ? (
            <View style={styles.reviewSection}>
              <Text style={styles.reviewTitle}>Review Mistakes</Text>
              {incorrectAnswers.map((item, index) => (
                <View key={index} style={styles.reviewCard}>
                  <Text style={styles.reviewNative}>{item.phrase}</Text>
                  <Text style={styles.reviewIncorrect}>Chosen: {item.chosen}</Text>
                  <Text style={styles.reviewCorrect}>Correct: {item.correct}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.perfectText}>Perfect Score!</Text>
          )}

          <TouchableOpacity style={styles.actionBtn} onPress={resetQuiz}>
            <Text style={styles.actionBtnText}>Try Again</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.progressText}>Phrase {currentIndex + 1} of {phrases.length}</Text>

          {quizMode ? (
            // Quiz Layout
            <View style={styles.quizWrapper}>
              <View style={styles.questionCard}>
                <Text style={styles.questionLabel}>What does this mean?</Text>
                <Text style={styles.questionPhrase}>{currentPhrase.front}</Text>
                {currentPhrase.pronunciation ? (
                  <Text style={styles.questionPron}>Phonetic: {currentPhrase.pronunciation}</Text>
                ) : null}
              </View>

              <View style={styles.optionsList}>
                {options.map((opt, index) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentPhrase.back;
                  
                  let optionStyle: any = styles.optionBtn;
                  let optionTextStyle: any = styles.optionText;

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      optionStyle = [styles.optionBtn, styles.optionBtnCorrect];
                      optionTextStyle = [styles.optionText, styles.optionTextCorrect];
                    } else if (isSelected) {
                      optionStyle = [styles.optionBtn, styles.optionBtnWrong];
                      optionTextStyle = [styles.optionText, styles.optionTextWrong];
                    }
                  }

                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={optionStyle} 
                      onPress={() => handleSelectOption(opt)}
                      disabled={selectedOption !== null}
                    >
                      <Text style={optionTextStyle}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedOption !== null && (
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                  <Text style={styles.nextBtnText}>
                    {currentIndex === phrases.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // Flashcard Layout
            <View style={styles.cardContainer}>
              <TouchableOpacity 
                style={[styles.card, flipped && styles.cardFlipped]} 
                activeOpacity={0.9}
                onPress={() => setFlipped(!flipped)}
              >
                {!flipped ? (
                  <View style={styles.cardContent}>
                    <Text style={styles.phraseFront}>{currentPhrase.front}</Text>
                    {currentPhrase.pronunciation ? (
                      <Text style={styles.pronunciationGuide}>Phonetic: {currentPhrase.pronunciation}</Text>
                    ) : null}
                    <Text style={styles.tapToFlip}>Tap to reveal translation</Text>
                  </View>
                ) : (
                  <View style={styles.cardContent}>
                    <Text style={styles.phraseBack}>{currentPhrase.back}</Text>
                    {currentPhrase.example ? (
                      <View style={styles.exampleContainer}>
                        <Text style={styles.exampleHeader}>Example:</Text>
                        <Text style={styles.exampleText}>{currentPhrase.example}</Text>
                        <Text style={styles.exampleTrans}>{currentPhrase.exampleTranslation}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.tapToFlip}>Tap to flip back</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Toolbar */}
              <View style={styles.toolbar}>
                <TouchableOpacity style={styles.toolbarBtn} onPress={toggleStar}>
                  <Ionicons 
                    name={starred[currentPhrase.id] ? "star" : "star-outline"} 
                    size={22} 
                    color={starred[currentPhrase.id] ? "#F59E0B" : "#475569"} 
                  />
                  <Text style={styles.toolbarText}>Favorite</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.toolbarBtn} onPress={handleTTS}>
                  <Ionicons name="volume-high-outline" size={22} color="#8B5CF6" />
                  <Text style={styles.toolbarText}>Listen</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolbarBtn} onPress={toggleLearned}>
                  <Ionicons 
                    name={learned[currentPhrase.id] ? "checkmark-circle" : "checkmark-circle-outline"} 
                    size={22} 
                    color={learned[currentPhrase.id] ? "#10B981" : "#475569"} 
                  />
                  <Text style={styles.toolbarText}>Learned</Text>
                </TouchableOpacity>
              </View>

              {/* Navigation Controls */}
              <View style={styles.controls}>
                <TouchableOpacity 
                  style={[styles.controlBtn, currentIndex === 0 && styles.controlDisabled]} 
                  onPress={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <Text style={styles.controlText}>Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={handleShuffle}>
                  <Text style={styles.controlText}>Shuffle</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtnPrimary} onPress={handleNext}>
                  <Text style={styles.controlTextPrimary}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'capitalize',
    },
  quizToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quizToggleBtnActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  quizToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    },
  quizToggleTextActive: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 100,
    width: '100%',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 20,
  },
  cardContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    aspectRatio: 3 / 4.2,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardFlipped: {
    backgroundColor: '#FAF5FF',
    borderColor: '#D8B4FE',
  },
  cardContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phraseFront: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 34,
    },
  pronunciationGuide: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
    },
  phraseBack: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 16,
    },
  exampleContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  exampleHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    marginBottom: 4,
    },
  exampleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
    },
  exampleTrans: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    },
  tapToFlip: {
    position: 'absolute',
    bottom: 0,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 340,
    marginTop: 20,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolbarBtn: {
    alignItems: 'center',
    gap: 4,
  },
  toolbarText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    },
  controls: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 340,
    gap: 12,
    marginTop: 24,
  },
  controlBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  controlDisabled: {
    opacity: 0.5,
  },
  controlText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    },
  controlBtnPrimary: {
    flex: 1.2,
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  controlTextPrimary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    },

  // Quiz styling
  quizWrapper: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    marginBottom: 8,
    },
  questionPhrase: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    },
  questionPron: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 6,
    },
  optionsList: {
    width: '100%',
    maxWidth: 340,
    gap: 10,
    marginBottom: 20,
  },
  optionBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  optionBtnCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  optionBtnWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    },
  optionTextCorrect: {
    color: '#065F46',
    fontWeight: '700',
  },
  optionTextWrong: {
    color: '#991B1B',
    fontWeight: '700',
  },
  nextBtn: {
    width: '100%',
    maxWidth: 340,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    },

  // Summary styling
  summaryContainer: {
    padding: 30,
    alignItems: 'center',
    paddingBottom: 100,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8B5CF6',
    },
  pointsText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 30,
  },
  reviewSection: {
    width: '100%',
    marginBottom: 30,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  reviewNative: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  reviewIncorrect: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
    },
  reviewCorrect: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    },
  perfectText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
    marginBottom: 30,
  },
  actionBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    }
});
