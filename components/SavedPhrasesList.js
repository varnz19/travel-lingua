import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../context/ProfileContext';

export default function SavedPhrasesList() {
  const { savedPhrases, deleteSavedPhrase } = useContext(ProfileContext);

  if (savedPhrases.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionHeader}>Saved Vocabulary</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No saved phrases yet. Practice cards or use translation tools to bookmark key expressions.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Saved Vocabulary</Text>
      {savedPhrases.slice(0, 4).map((phrase) => (
        <View key={phrase.id} style={styles.phraseCard}>
          <View style={styles.textContainer}>
            <Text style={styles.phraseNative}>{phrase.phrase}</Text>
            <Text style={styles.phraseTranslation}>{phrase.translation}</Text>
            {phrase.pronunciation ? (
              <Text style={styles.phrasePron}>Phonetic: {phrase.pronunciation}</Text>
            ) : null}
            <Text style={styles.langBadge}>{phrase.language}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteSavedPhrase(phrase.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
    paddingLeft: 4,
    },
  phraseCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  textContainer: {
    flex: 1,
  },
  phraseNative: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
    },
  phraseTranslation: {
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
  langBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#FAF5FF',
    color: '#8B5CF6',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  deleteBtn: {
    padding: 8,
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    },
});
