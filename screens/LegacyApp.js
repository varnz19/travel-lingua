import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function App() {
  // Mock function to handle navigation/clicks
  const handlePress = (screenName) => {
    Alert.alert(`Opening ${screenName}`, `This would navigate to the ${screenName} screen.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6F8" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greetingTitle}>Konnichiwa, Sarah! 👋</Text>
          <Text style={styles.greetingSubtitle}>Ready to continue learning?</Text>
        </View>

        {/* Main Hero Card */}
        <TouchableOpacity 
          style={styles.heroCard} 
          activeOpacity={0.9} 
          onPress={() => handlePress('Travel Readiness')}
        >
          <View style={styles.heroContent}>
            {/* Circular Progress Placeholder */}
            <View style={styles.circleProgress}>
              <Text style={styles.circleText}>67%</Text>
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>⚡ Travel Readiness Score</Text>
              <Text style={styles.heroSubtitle}>You're making great progress for your trip to Japan!</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statText}>🔥 7 day streak</Text>
                <Text style={styles.statDot}> • </Text>
                <Text style={styles.statText}>⭐ 24 lessons</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handlePress('Learn Module')}>
            <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
              <Text style={styles.emojiIcon}>📖</Text>
            </View>
            <Text style={styles.actionText}>Learn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => handlePress('Simulate Module')}>
            <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
              <Text style={styles.emojiIcon}>💬</Text>
            </View>
            <Text style={styles.actionText}>Simulate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => handlePress('Culture Module')}>
            <View style={[styles.iconBox, { backgroundColor: '#E0EEFF' }]}>
              <Text style={styles.emojiIcon}>🗺️</Text>
            </View>
            <Text style={styles.actionText}>Culture</Text>
          </TouchableOpacity>
        </View>

        {/* AI Recommendation Banner */}
        <TouchableOpacity style={styles.aiBanner} onPress={() => handlePress('AI Recommendation Details')}>
          <View style={styles.aiIconContainer}>
            <Text style={styles.aiIconText}>⚡</Text>
          </View>
          <View style={styles.aiTextContainer}>
            <Text style={styles.aiTitle}>AI Recommendation</Text>
            <Text style={styles.aiSubtitle}>Based on your trip to Japan in 3 weeks, focus on restaurant phrases and transportation vocabulary.</Text>
          </View>
        </TouchableOpacity>

        {/* Recommended for Today */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for Today</Text>
          <TouchableOpacity onPress={() => handlePress('Trends')}>
            <Text style={styles.trendIcon}>📈</Text>
          </TouchableOpacity>
        </View>

        {/* Lesson Card 1 */}
        <TouchableOpacity style={styles.lessonCard} onPress={() => handlePress('Basic Hello & Goodbye')}>
          <Text style={styles.lessonEmoji}>👏</Text>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonCategory, { color: '#9333EA' }]}>Greetings</Text>
            <Text style={styles.lessonTitle}>Basic Hello & Goodbye</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: '75%' }]} />
            </View>
          </View>
          <View style={styles.lessonRight}>
            <Text style={styles.chevron}>›</Text>
            <Text style={styles.progressText}>75%</Text>
          </View>
        </TouchableOpacity>

        {/* Lesson Card 2 */}
        <TouchableOpacity style={styles.lessonCard} onPress={() => handlePress('Ordering at Restaurants')}>
          <Text style={styles.lessonEmoji}>🍜</Text>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonCategory, { color: '#9333EA' }]}>Food</Text>
            <Text style={styles.lessonTitle}>Ordering at Restaurants</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: '40%' }]} />
            </View>
          </View>
          <View style={styles.lessonRight}>
            <Text style={styles.chevron}>›</Text>
            <Text style={styles.progressText}>40%</Text>
          </View>
        </TouchableOpacity>

        {/* Lesson Card 3 */}
        <TouchableOpacity style={styles.lessonCard} onPress={() => handlePress('Taking a Taxi')}>
          <Text style={styles.lessonEmoji}>🚕</Text>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonCategory, { color: '#9333EA' }]}>Transport</Text>
            <Text style={styles.lessonTitle}>Taking a Taxi</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: '20%' }]} />
            </View>
          </View>
          <View style={styles.lessonRight}>
            <Text style={styles.chevron}>›</Text>
            <Text style={styles.progressText}>20%</Text>
          </View>
        </TouchableOpacity>

        {/* Pronunciation Banner */}
        <TouchableOpacity style={styles.pronunciationCard} onPress={() => handlePress('Pronunciation Practice')}>
          <Text style={styles.lessonEmoji}>🔊</Text>
          <View style={styles.pronunciationInfo}>
            <Text style={styles.lessonTitle}>Practice your pronunciation</Text>
            <Text style={styles.greetingSubtitle}>5 min daily practice improves retention by 80%</Text>
          </View>
        </TouchableOpacity>
        
        {/* Padding for bottom nav */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('Home')}>
          <View style={styles.activeNavIcon}>
            <Text style={styles.navEmoji}>🏠</Text>
          </View>
          <Text style={styles.activeNavText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('Learn Tab')}>
          <Text style={styles.navEmoji}>📖</Text>
          <Text style={styles.navText}>Learn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('Simulate Tab')}>
          <Text style={styles.navEmoji}>💬</Text>
          <Text style={styles.navText}>Simulate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('Profile')}>
          <Text style={styles.navEmoji}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA', // Very light lavender/gray background
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: '#7C3AED', // Used solid purple. For gradient use expo-linear-gradient
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  circleText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  heroSubtitle: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statDot: {
    color: '#FFF',
    fontSize: 12,
    marginHorizontal: 5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: '#FFF',
    width: '30%',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emojiIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  aiBanner: {
    backgroundColor: '#FFFBEB',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  aiIconContainer: {
    backgroundColor: '#F59E0B',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiIconText: {
    color: '#FFF',
    fontSize: 16,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  trendIcon: {
    fontSize: 20,
    color: '#9333EA',
  },
  lessonCard: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  lessonEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonCategory: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 3,
  },
  lessonRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 45,
    marginLeft: 10,
  },
  chevron: {
    fontSize: 20,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  pronunciationCard: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  pronunciationInfo: {
    flex: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: 25, // For iPhone home indicator
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavIcon: {
    backgroundColor: '#F3E8FF',
    padding: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  navEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  activeNavText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '700',
  },
});