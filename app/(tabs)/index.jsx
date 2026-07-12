import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileContext } from '../../context/ProfileContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const {
    username,
    learningLanguage,
    xp,
    level,
    coins,
    streak,
    lessonsCompleted,
    simulationsCompleted,
    savedPhrases,
    dailyGoals,
    recentActivity,
    trip
  } = useContext(ProfileContext);

  const readinessScore = Math.min(
    100,
    Math.round(
      (lessonsCompleted * 12) +
      (simulationsCompleted * 15) +
      (savedPhrases.length * 4) +
      (streak * 3)
    )
  );

  const getRecommendation = () => {
    if (trip.destination.toLowerCase().includes('japan') || learningLanguage === 'Japanese') {
      return "Focus on restaurant phrases and transportation vocabulary.";
    } else if (trip.destination.toLowerCase().includes('france') || learningLanguage === 'French') {
      return "Practice ordering croissants and asking for directions.";
    } else if (trip.destination.toLowerCase().includes('spain') || learningLanguage === 'Spanish') {
      return "Tap into Greetings and Taxi Ordering modules.";
    }
    return `Review your ${learningLanguage} greetings and take a simulation!`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.greetingTitle}>Hello, {username}</Text>
            <Text style={styles.greetingSubtitle}>Ready to continue learning {learningLanguage}?</Text>
          </View>

          {/* Travel Readiness Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>{readinessScore}%</Text>
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Travel Readiness</Text>
              <Text style={styles.heroSubtitle}>
                Preparing for your trip to {trip.destination || 'abroad'}
              </Text>
              <View style={styles.heroStats}>
                <Text style={styles.heroStatText}>🔥 {streak} Days</Text>
                <Text style={styles.heroStatText}>⭐ Lvl {level}</Text>
                <Text style={styles.heroStatText}>🪙 {coins}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/learn")}
            >
              <Ionicons name="book-outline" size={24} color="#8B5CF6" style={styles.actionIcon} />
              <Text style={styles.actionText}>Learn</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/simulate")}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#8B5CF6" style={styles.actionIcon} />
              <Text style={styles.actionText}>Simulate</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/learn/translator")}
            >
              <Ionicons name="language-outline" size={24} color="#8B5CF6" style={styles.actionIcon} />
              <Text style={styles.actionText}>Translate</Text>
            </TouchableOpacity>
          </View>

          {/* AI Recommendation Banner */}
          <View style={styles.aiBanner}>
            <Ionicons name="sparkles-outline" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
            <View style={styles.aiContent}>
              <Text style={styles.aiTitle}>Smart Recommendation</Text>
              <Text style={styles.aiSubtitle}>{getRecommendation()}</Text>
            </View>
          </View>

          {/* Daily Goals Section */}
          <View style={styles.goalsContainer}>
            <Text style={styles.sectionTitle}>Daily Goals</Text>
            {dailyGoals.map((goal) => (
              <View key={goal.id} style={styles.goalRow}>
                <View style={[styles.checkbox, goal.completed && styles.checkboxCompleted]}>
                  {goal.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.goalLabel, goal.completed && styles.goalLabelCompleted]}>
                  {goal.label} {goal.type === 'phrases' && `(${goal.current}/${goal.target})`}
                </Text>
              </View>
            ))}
          </View>

          {/* Continue Learning Card */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
          </View>
          <TouchableOpacity 
            style={styles.lessonCard}
            onPress={() => router.push("/learn/flashcards/greetings")}
          >
            <View style={styles.lessonContent}>
              <Text style={styles.lessonCategory}>Greetings</Text>
              <Text style={styles.lessonTitle}>Review Greetings & Phrases</Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '80%' }]} />
              </View>
            </View>
            <View style={styles.lessonRight}>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              <Text style={styles.percentageText}>80%</Text>
            </View>
          </TouchableOpacity>

          {/* Recent Activity Timeline */}
          <View style={styles.activityContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentActivity.slice(0, 3).map((act, index) => (
              <View key={act.id || index} style={styles.activityRow}>
                <View style={styles.timelineDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{act.title}</Text>
                  <Text style={styles.activityTime}>{act.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Practice Pronunciation Card */}
          <TouchableOpacity 
            style={styles.pronunciationCard}
            onPress={() => router.push("/learn/pronunciation")}
          >
            <Ionicons name="mic-outline" size={24} color="#8B5CF6" style={{ marginRight: 16 }} />
            <View style={styles.pronunciationContent}>
              <Text style={styles.pronunciationTitle}>Practice your pronunciation</Text>
              <Text style={styles.pronunciationSubtitle}>
                Test speaking aloud and unlock daily score boosts
              </Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#E2E8F0' : '#F8F9FA', 
  },
  container: {
    padding: 20,
    paddingBottom: 100, 
  },
  headerContainer: {
    marginTop: 10,
    marginBottom: 24,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#475569',
    },
  heroCard: {
    backgroundColor: '#FFF', 
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  progressText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#475569',
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
    },
  heroStats: {
    flexDirection: 'row',
    gap: 12,
  },
  heroStatText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
    },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12, 
  },
  actionButton: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flex: 1, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    },
  aiBanner: {
    backgroundColor: '#FFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  aiSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  goalsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkboxCompleted: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalLabel: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
    },
  goalLabelCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lessonCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lessonContent: {
    flex: 1,
  },
  lessonCategory: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  lessonRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 14,
    width: 35,
  },
  percentageText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginTop: 4,
  },
  activityContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
    },
  activityTime: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  pronunciationCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pronunciationContent: {
    flex: 1,
  },
  pronunciationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  pronunciationSubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 18,
    },
});
