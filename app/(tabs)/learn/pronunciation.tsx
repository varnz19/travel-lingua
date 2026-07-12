import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { ProfileContext } from '../../../context/ProfileContext';

export default function PronunciationScreen() {
  const router = useRouter();
  const { speechSpeed, completePronunciationPractice } = useContext(ProfileContext);

  const practicePhrases = [
    { phrase: "Konnichiwa (こんにちは)", english: "Hello", langCode: "ja" },
    { phrase: "Oishii (おいしい)", english: "Delicious", langCode: "ja" },
    { phrase: "Mizu o kudasai (水をください)", english: "Water, please", langCode: "ja" },
    { phrase: "Arigatou gozaimasu (ありがとうございます)", english: "Thank you", langCode: "ja" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const current = practicePhrases[currentIndex];

  const handleSpeakText = () => {
    const cleanText = current.phrase.split('(')[0].trim();
    Speech.speak(cleanText, {
      language: current.langCode,
      rate: speechSpeed || 1.0
    });
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setScore(null);
    setFeedback('');

    setTimeout(() => {
      setIsRecording(false);
      const generatedScore = Math.floor(Math.random() * 20) + 81; // 81 to 100
      setScore(generatedScore);
      
      if (generatedScore >= 95) {
        setFeedback("Flawless pronunciation! You sound like a native speaker.");
      } else if (generatedScore >= 90) {
        setFeedback("Excellent! Minor accent details, but fully understandable.");
      } else {
        setFeedback("Good attempt! Keep practicing to smoothen your vowels.");
      }

      completePronunciationPractice(20);
    }, 2500);
  };

  const handleNext = () => {
    setScore(null);
    setFeedback('');
    if (currentIndex < practicePhrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Speak Practice</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepText}>PHRASE {currentIndex + 1} OF {practicePhrases.length}</Text>
        
        {/* Phrase Card */}
        <View style={styles.card}>
          <Text style={styles.phraseText}>{current.phrase}</Text>
          <Text style={styles.translationText}>{current.english}</Text>

          <TouchableOpacity style={styles.listenBtn} onPress={handleSpeakText} activeOpacity={0.8}>
            <Ionicons name="volume-high-outline" size={22} color="#FFF" />
            <Text style={styles.listenBtnText}>Listen</Text>
          </TouchableOpacity>
        </View>

        {/* Action Panel */}
        <View style={styles.actionPanel}>
          {isRecording ? (
            <View style={styles.recordingState}>
              <Text style={styles.recordingLabel}>Listening...</Text>
              <View style={styles.waveBarRow}>
                <View style={[styles.waveBar, { height: 20 }]} />
                <View style={[styles.waveBar, { height: 40 }]} />
                <View style={[styles.waveBar, { height: 30 }]} />
                <View style={[styles.waveBar, { height: 50 }]} />
                <View style={[styles.waveBar, { height: 20 }]} />
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.micBtn} onPress={handleStartRecording} activeOpacity={0.85}>
              <Ionicons name="mic-outline" size={32} color="#FFF" />
            </TouchableOpacity>
          )}
          {!isRecording && !score && (
            <Text style={styles.hintText}>Tap microphone and speak</Text>
          )}
        </View>

        {/* Results Banner */}
        {score !== null ? (
          <View style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreVal}>{score}%</Text>
              <Text style={styles.scoreLabel}>Match Score</Text>
            </View>
            <Text style={styles.feedbackText}>{feedback}</Text>
            
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Next Phrase</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    },
  scroll: {
    padding: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: 1.5,
    marginBottom: 12,
    },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 30,
  },
  phraseText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    },
  translationText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
    },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  listenBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    },
  actionPanel: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  micBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  recordingState: {
    alignItems: 'center',
    gap: 16,
  },
  recordingLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '700',
    },
  waveBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  waveBar: {
    width: 6,
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  hintText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 14,
    fontWeight: '500',
    },
  scoreCard: {
    backgroundColor: '#FFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  scoreVal: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    },
  feedbackText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    fontWeight: '500',
    },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    }
});
