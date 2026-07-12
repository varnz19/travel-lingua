import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import { ProfileContext } from '../../../context/ProfileContext';

export default function FavoritesScreen() {
  const router = useRouter();
  const { savedPhrases, deleteSavedPhrase, speechSpeed } = useContext(ProfileContext);
  const [activeTab, setActiveTab] = useState<'phrases' | 'flashcards'>('phrases');

  const handleTTS = (phrase: string, lang: string) => {
    const cleanText = phrase.split('(')[0].trim();
    const langCode = lang === 'Japanese' ? 'ja' : lang === 'Spanish' ? 'es' : lang === 'French' ? 'fr' : lang === 'German' ? 'de' : 'it';
    Speech.speak(cleanText, {
      language: langCode,
      rate: speechSpeed || 1.0
    });
  };

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    alert('Copied to clipboard!');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'phrases' && styles.tabActive]}
          onPress={() => setActiveTab('phrases')}
        >
          <Text style={[styles.tabText, activeTab === 'phrases' && styles.tabTextActive]}>Saved Phrases</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'flashcards' && styles.tabActive]}
          onPress={() => setActiveTab('flashcards')}
        >
          <Text style={[styles.tabText, activeTab === 'flashcards' && styles.tabTextActive]}>Starred Cards</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'phrases' ? (
          savedPhrases.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={48} color="#94A3B8" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyTitle}>No saved phrases yet</Text>
              <Text style={styles.emptySubtitle}>Translate phrases or favorite vocabulary to collect them here.</Text>
            </View>
          ) : (
            savedPhrases.map((item: any) => (
              <View key={item.id} style={styles.phraseCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.phraseNative}>{item.phrase}</Text>
                  <Text style={styles.phraseTrans}>{item.translation}</Text>
                  {item.pronunciation ? (
                    <Text style={styles.phrasePron}>Phonetic: {item.pronunciation}</Text>
                  ) : null}
                  <Text style={styles.phraseBadge}>{item.language}</Text>
                </View>

                <View style={styles.phraseActions}>
                  <TouchableOpacity onPress={() => handleTTS(item.phrase, item.language)} style={styles.actionBtn}>
                    <Ionicons name="volume-high-outline" size={20} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleCopy(item.phrase)} style={styles.actionBtn}>
                    <Ionicons name="copy-outline" size={18} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteSavedPhrase(item.id)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="documents-outline" size={48} color="#94A3B8" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No starred cards</Text>
            <Text style={styles.emptySubtitle}>Favorite cards during flashcard learning runs to view them here.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  scroll: {
    padding: 20,
    paddingBottom: 110,
  },
  phraseCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  phraseNative: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    },
  phraseTrans: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
    },
  phrasePron: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#94A3B8',
    marginBottom: 6,
    },
  phraseBadge: {
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    color: '#2563EB',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  phraseActions: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginLeft: 12,
  },
  actionBtn: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    },
  emptySubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
    }
});
