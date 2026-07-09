import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { ProfileContext } from '../context/ProfileContext';

export default function SavedPhrasesList() {
  const { savedPhrases, addSavedPhrase, deleteSavedPhrase, profile } = useContext(ProfileContext);
  const [newPhrase, setNewPhrase] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [playingId, setPlayingId] = useState(null);

  const handleSpeak = async (item) => {
    try {
      if (playingId === item.id) {
        await Speech.stop();
        setPlayingId(null);
        return;
      }

      await Speech.stop();
      setPlayingId(item.id);
      
      Speech.speak(item.phrase, {
        language: item.language,
        onDone: () => setPlayingId(null),
        onStopped: () => setPlayingId(null),
        onError: (err) => {
          console.log('Speech error:', err);
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error(error);
      setPlayingId(null);
    }
  };

  const handleAddPhrase = () => {
    if (!newPhrase.trim() || !newTranslation.trim()) {
      Alert.alert('Incomplete Fields', 'Please enter both a phrase and its translation.');
      return;
    }
    addSavedPhrase(newPhrase.trim(), newTranslation.trim());
    setNewPhrase('');
    setNewTranslation('');
  };

  const renderPhraseItem = ({ item }) => {
    const isPlaying = playingId === item.id;
    return (
      <View style={styles.phraseItem}>
        <View style={styles.phraseContent}>
          <Text style={styles.originalText}>{item.phrase}</Text>
          <Text style={styles.translationText}>{item.translation}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.audioButton, isPlaying && styles.audioButtonPlaying]}
            onPress={() => handleSpeak(item)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlaying ? 'volume-high' : 'volume-medium-outline'}
              size={20}
              color={isPlaying ? '#ffffff' : '#7b4eff'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteSavedPhrase(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#ff4d4f" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Saved Vocabulary & Phrases</Text>
      
      {savedPhrases.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="journal-outline" size={36} color="#cccccc" />
          <Text style={styles.emptyText}>No phrases saved yet. Add one below!</Text>
        </View>
      ) : (
        <FlatList
          data={savedPhrases}
          keyExtractor={(item) => item.id}
          renderItem={renderPhraseItem}
          scrollEnabled={false} // List runs inside a Parent ScrollView in Dashboard Screen
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Input section to add new phrase */}
      <View style={styles.addCard}>
        <Text style={styles.addCardTitle}>Add Custom Phrase ({profile.learningLanguage})</Text>
        
        <TextInput
          style={styles.input}
          placeholder={`Enter phrase in ${profile.learningLanguage} (e.g. ¡Gracias!)`}
          placeholderTextColor="#999999"
          value={newPhrase}
          onChangeText={setNewPhrase}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Enter English translation (e.g. Thank you!)"
          placeholderTextColor="#999999"
          value={newTranslation}
          onChangeText={setNewTranslation}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPhrase}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>Save to List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    paddingLeft: 4,
  },
  listContent: {
    gap: 10,
    marginBottom: 14,
  },
  phraseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f0f2f5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  phraseContent: {
    flex: 1,
    marginRight: 10,
  },
  originalText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  translationText: {
    fontSize: 12,
    color: '#777777',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1ecff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonPlaying: {
    backgroundColor: '#7b4eff',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff1f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0f2f5',
    marginBottom: 14,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
  addCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e0ff',
    shadowColor: '#7b4eff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  addCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7b4eff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f9f9fc',
    borderWidth: 1,
    borderColor: '#e2e2e9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333333',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#7b4eff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 2,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
