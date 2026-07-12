import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { lessonService, Category } from '../../../services/lessonService';
import { ProfileContext } from '../../../context/ProfileContext';

export default function LearnScreen() {
  const router = useRouter();
  const { lessonsCompleted } = useContext(ProfileContext);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'essential' | 'advanced'>('all');

  useEffect(() => {
    const fetchCats = async () => {
      const data = await lessonService.getCategories();
      setCategories(data);
    };
    fetchCats();
  }, []);

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cat.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'essential') {
      return matchesSearch && ['greetings', 'food', 'restaurant', 'emergencies', 'transportation', 'directions'].includes(cat.key);
    }
    if (activeFilter === 'advanced') {
      return matchesSearch && !['greetings', 'food', 'restaurant', 'emergencies', 'transportation', 'directions'].includes(cat.key);
    }
    return matchesSearch;
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Learn Vocabulary</Text>
          <Text style={styles.headerSubtitle}>Master essential phrases across 13 travel modules</Text>
        </View>

        {/* Global Action Utility Buttons */}
        <View style={styles.utilitiesRow}>
          <TouchableOpacity style={styles.utilityBtn} onPress={() => router.push('/learn/favorites')}>
            <Ionicons name="star-outline" size={16} color="#8B5CF6" style={{ marginRight: 6 }} />
            <Text style={styles.utilityBtnText}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilityBtn} onPress={() => router.push('/learn/translator')}>
            <Ionicons name="language-outline" size={16} color="#8B5CF6" style={{ marginRight: 6 }} />
            <Text style={styles.utilityBtnText}>Translator</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilityBtn} onPress={() => router.push('/learn/pronunciation')}>
            <Ionicons name="mic-outline" size={16} color="#8B5CF6" style={{ marginRight: 6 }} />
            <Text style={styles.utilityBtnText}>Speak</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories (e.g. food, transport)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Filter Badges */}
        <View style={styles.filtersRow}>
          <TouchableOpacity 
            style={[styles.filterBadge, activeFilter === 'all' && styles.filterBadgeActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>All Modules</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBadge, activeFilter === 'essential' && styles.filterBadgeActive]}
            onPress={() => setActiveFilter('essential')}
          >
            <Text style={[styles.filterText, activeFilter === 'essential' && styles.filterTextActive]}>Essentials</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBadge, activeFilter === 'advanced' && styles.filterBadgeActive]}
            onPress={() => setActiveFilter('advanced')}
          >
            <Text style={[styles.filterText, activeFilter === 'advanced' && styles.filterTextActive]}>Advanced</Text>
          </TouchableOpacity>
        </View>

        {/* Grid List */}
        <View style={styles.grid}>
          {filteredCategories.map((cat) => {
            const isCompleted = lessonsCompleted > 0 && ['greetings', 'food', 'restaurant'].includes(cat.key);
            const percentage = isCompleted ? 100 : cat.key === 'greetings' ? 60 : 0;

            return (
              <TouchableOpacity 
                key={cat.key} 
                style={styles.card}
                onPress={() => router.push(`/learn/flashcards/${cat.key}`)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{cat.icon}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardTitle}>{cat.title}</Text>
                    <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Module Progress</Text>
                    <Text style={styles.progressVal}>{percentage}%</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#475569',
    },
  utilitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  utilityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  utilityBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBadgeActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  cardMeta: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#475569',
    },
  progressContainer: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    },
  progressVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    },
  progressBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  }
});
