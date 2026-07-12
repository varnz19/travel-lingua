import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const FLASHCARD_DATA: Record<string, { front: string; back: string }[]> = {
  greetings: [
    { front: "Konnichiwa\n(こんにちは)", back: "Hello / Good afternoon" },
    { front: "Ohayou gozaimasu\n(おはようございます)", back: "Good morning" },
    { front: "Konbanwa\n(こんばんは)", back: "Good evening" },
    { front: "Arigatou gozaimasu\n(ありがとうございます)", back: "Thank you" },
    { front: "Sayounara\n(さようなら)", back: "Goodbye" },
  ],
  food: [
    { front: "Oishii\n(おいしい)", back: "Delicious" },
    { front: "Menyuu o onegaishimasu\n(メニューをお願いします)", back: "Menu, please" },
    { front: "Mizu o kudasai\n(水をください)", back: "Water, please" },
    { front: "Okaikei o onegaishimasu\n(お会計をお願いします)", back: "Check, please" },
  ],
  transport: [
    { front: "Eki\n(駅)", back: "Station" },
    { front: "Densha\n(電車)", back: "Train" },
    { front: "... wa doko desu ka?\n(…はどこですか？)", back: "Where is...?" },
    { front: "Kippu\n(切符)", back: "Ticket" },
  ],
  emergency: [
    { front: "Tasukete!\n(助けて！)", back: "Help!" },
    { front: "Kyuukyuusha o yonde\n(救急車を呼んで)", back: "Call an ambulance" },
    { front: "Pasupooto o nakushimashita\n(パスポートをなくしました)", back: "I lost my passport" },
  ]
};

export default function FlashcardsScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const categoryKey = category ? category.toLowerCase() : 'greetings';
  const cards = FLASHCARD_DATA[categoryKey] || FLASHCARD_DATA.greetings;
  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // loop back to start
    }
  };

  const handlePrev = () => {
    setFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={styles.webWrapper}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{category || 'Flashcards'}</Text>
        </View>

        <View style={styles.container}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Card {currentIndex + 1} of {cards.length}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.card, flipped && styles.cardFlipped]} 
            activeOpacity={0.8}
            onPress={() => setFlipped(!flipped)}
          >
            <Text style={styles.cardText}>
              {flipped ? currentCard.back : currentCard.front}
            </Text>
            <Text style={styles.hintText}>Tap to flip</Text>
          </TouchableOpacity>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.controlButton, currentIndex === 0 && styles.controlButtonDisabled]} 
              onPress={handlePrev}
              disabled={currentIndex === 0}
            >
              <Text style={[styles.controlText, currentIndex === 0 && styles.controlTextDisabled]}>Previous</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButtonPrimary} onPress={handleNext}>
              <Text style={styles.controlTextPrimary}>
                {currentIndex === cards.length - 1 ? 'Start Over' : 'Next Card'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FE',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    ...(Platform.OS === 'web' ? ({
      boxShadow: '0px 0px 20px rgba(0,0,0,0.1)',
      height: '100vh',
    } as any) : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    paddingRight: 16,
  },
  backText: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  card: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 3 / 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
  cardFlipped: {
    backgroundColor: '#F3E8FF',
  },
  cardText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 40,
  },
  hintText: {
    position: 'absolute',
    bottom: 32,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 40,
    width: '100%',
    justifyContent: 'space-between',
    gap: 16,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  controlTextDisabled: {
    color: '#94A3B8',
  },
  controlButtonPrimary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  controlTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
