import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import { translatorService } from '../../../services/translatorService';
import { ProfileContext } from '../../../context/ProfileContext';

export default function TranslatorScreen() {
  const router = useRouter();
  const { speechSpeed, addSavedPhrase, translationHistory, addTranslationToHistory } = useContext(ProfileContext);

  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [source, setSource] = useState('English');
  const [target, setTarget] = useState('Japanese');

  const handleTranslate = async () => {
    if (!text.trim()) return;
    const result = await translatorService.translate(text, source, target);
    setTranslated(result.translatedText);
    setPronunciation(result.pronunciation || '');
    addTranslationToHistory(text, result.translatedText);
  };

  const handleSwap = () => {
    const temp = source;
    setSource(target);
    setTarget(temp);
    setText(translated);
    setTranslated(text);
  };

  const handleCopy = async () => {
    if (!translated) return;
    await Clipboard.setStringAsync(translated);
    alert('Translation copied to clipboard!');
  };

  const handleSave = () => {
    if (!translated) return;
    addSavedPhrase(translated, text, pronunciation);
    alert('Phrase saved to profile favorites!');
  };

  const handleTTS = () => {
    if (!translated) return;
    const cleanText = translated.split('(')[0].trim();
    const langCode = target === 'Japanese' ? 'ja' : target === 'Spanish' ? 'es' : target === 'French' ? 'fr' : target === 'German' ? 'de' : 'it';
    Speech.speak(cleanText, {
      language: langCode,
      rate: speechSpeed || 1.0
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translator</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Language Selector Bar */}
        <View style={styles.selectorBar}>
          <Text style={styles.langText}>{source}</Text>
          <TouchableOpacity onPress={handleSwap} style={styles.swapBtn} activeOpacity={0.7}>
            <Ionicons name="swap-horizontal" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.langText}>{target}</Text>
        </View>

        {/* Source Text Input */}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            multiline
            placeholder={`Enter text to translate from ${source}...`}
            value={text}
            onChangeText={setText}
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity style={styles.translateBtn} onPress={handleTranslate} activeOpacity={0.8}>
            <Text style={styles.translateBtnText}>Translate</Text>
          </TouchableOpacity>
        </View>

        {/* Translation Output Card */}
        {translated ? (
          <View style={[styles.card, styles.outputCard]}>
            <Text style={styles.outputTitle}>{target} Translation</Text>
            <Text style={styles.outputText}>{translated}</Text>
            {pronunciation ? <Text style={styles.pronText}>Pronunciation: {pronunciation}</Text> : null}

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionIcon} onPress={handleTTS}>
                <Ionicons name="volume-high-outline" size={22} color="#8B5CF6" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon} onPress={handleCopy}>
                <Ionicons name="copy-outline" size={22} color="#8B5CF6" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon} onPress={handleSave}>
                <Ionicons name="star-outline" size={22} color="#F59E0B" />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Translation History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>History</Text>
          {translationHistory.slice(0, 5).map((item: any, index: number) => (
            <View key={item.id || index} style={styles.historyCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historySource}>{item.sourceText}</Text>
                <Text style={styles.historyTarget}>{item.translatedText}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </View>
          ))}
        </View>
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
  },
  selectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  langText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 80,
    textAlign: 'center',
  },
  swapBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  input: {
    height: 100,
    fontSize: 16,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  translateBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  translateBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    },
  outputCard: {
    borderColor: '#D8B4FE',
    backgroundColor: '#FFF',
  },
  outputTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    marginBottom: 8,
    },
  outputText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  pronText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#64748B',
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 14,
  },
  actionIcon: {
    padding: 6,
  },
  historySection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  historySource: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  historyTarget: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    }
});
