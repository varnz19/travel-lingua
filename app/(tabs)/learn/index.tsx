import { useRouter } from 'expo-router';
import {
  ArrowRight,
  ChevronRight,
  Compass,
  Heart,
  Languages,
  Map,
  Mic,
  Search
} from 'lucide-react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView, StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProfileContext } from '../../../context/ProfileContext';
import { Category, lessonService } from '../../../services/lessonService';

const C = {
  bg: '#FAFAFC',
  primary: '#6C63FF',
  primaryLight: '#F4F2FF',
  mint: '#EEF9F3',
  peach: '#FFF2EC',
  textPrimary: '#1B1B2F',
  textSecondary: '#7B7B93',
  white: '#FFFFFF',
  card: '#FFFFFF',
  divider: '#F0EFF8',
};

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  greetings: { bg: C.primaryLight, icon: C.primary },
  food: { bg: '#FFF7F0', icon: '#E06845' },
  restaurant: { bg: '#FFF7F0', icon: '#E06845' },
  transportation: { bg: C.mint, icon: '#3DB87A' },
  directions: { bg: C.mint, icon: '#3DB87A' },
  emergencies: { bg: '#FFF0F0', icon: '#E05555' },
  shopping: { bg: '#F4F0FF', icon: '#8B6FFE' },
  hotel: { bg: '#F0F7FF', icon: '#3B82F6' },
  default: { bg: '#F8F8FF', icon: C.primary },
};

const typography: any = {
  h1: { fontFamily: 'Inter_800ExtraBold', fontSize: 34, letterSpacing: -0.5 },
  h2: { fontFamily: 'Inter_700Bold', fontSize: 24, letterSpacing: -0.5 },
  h3: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  h4: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  subtitle1: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  subtitle2: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  body1: { fontFamily: 'Inter_400Regular', fontSize: 16 },
  body2: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  caption: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  overline: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
};

export default function LearnScreen() {
  const router = useRouter();
  const { lessonsCompleted } = useContext(ProfileContext);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'essential' | 'advanced'>('all');

  useEffect(() => {
    lessonService.getCategories().then(setCategories);
  }, []);

  const filteredCategories = categories.filter(cat => {
    const q = searchQuery.toLowerCase();
    const matches = cat.title.toLowerCase().includes(q) || cat.subtitle.toLowerCase().includes(q);
    if (activeFilter === 'essential') {
      return matches && ['greetings', 'food', 'restaurant', 'emergencies', 'transportation', 'directions'].includes(cat.key);
    }
    if (activeFilter === 'advanced') {
      return matches && !['greetings', 'food', 'restaurant', 'emergencies', 'transportation', 'directions'].includes(cat.key);
    }
    return matches;
  });

  const featured = filteredCategories[0];
  const rest = filteredCategories.slice(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ──────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={[typography.h1, { color: C.textPrimary, marginBottom: 8 }]}>Learn</Text>
          <Text style={[typography.body1, { color: C.textSecondary }]}>Master phrases across {categories.length} travel modules</Text>
        </View>

        {/* ── Utility Row ─────────────────────────────────── */}
        <View style={styles.utilRow}>
          {[
            { label: 'Favorites', icon: Heart, route: '/learn/favorites', bg: C.peach, color: '#E06845' },
            { label: 'Speak', icon: Mic, route: '/learn/pronunciation', bg: C.mint, color: '#3DB87A' },
            { label: 'Translate', icon: Languages, route: '/learn/translator', bg: C.primaryLight, color: C.primary },
          ].map(({ label, icon: Icon, route, bg, color }) => (
            <TouchableOpacity key={label} style={[styles.utilBtn, { backgroundColor: bg }]} onPress={() => router.push(route as any)} activeOpacity={0.82}>
              <Icon size={18} color={color} style={{ marginRight: 8 }} strokeWidth={2.5} />
              <Text style={[typography.subtitle2, { color }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Search ──────────────────────────────────────── */}
        <View style={styles.searchBox}>
          <Search size={20} color={C.textSecondary} style={{ marginRight: 12 }} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, typography.body1]}
            placeholder="Search modules..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={C.textSecondary}
          />
        </View>

        {/* ── Filter Pills ─────────────────────────────────── */}
        <View style={styles.filterRow}>
          {(['all', 'essential', 'advanced'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.pill, activeFilter === f && styles.pillActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[typography.subtitle2, styles.pillText, activeFilter === f && styles.pillTextActive]}>
                {f === 'all' ? 'All' : f === 'essential' ? 'Essentials' : 'Advanced'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Featured Module ──────────────────────────────── */}
        {featured && (() => {
          const color = CATEGORY_COLORS[featured.key] || CATEGORY_COLORS.default;
          const pct = ['greetings', 'food', 'restaurant'].includes(featured.key) && lessonsCompleted > 0 ? 100 : featured.key === 'greetings' ? 60 : 0;
          return (
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => router.push(`/learn/flashcards/${featured.key}` as any)}
              activeOpacity={0.9}
            >
              {/* Ticket Cutouts */}
              <View style={styles.ticketCutoutTop} />
              <View style={styles.ticketCutoutBottom} />

              <View style={styles.featuredMeta}>
                <Text style={[typography.overline, { color: C.textSecondary, marginBottom: 8 }]}>FEATURED MODULE</Text>
                <Text style={[typography.h3, { color: C.textPrimary, marginBottom: 6 }]}>{featured.title}</Text>
                <Text style={[typography.body2, { color: C.textSecondary, marginBottom: 20 }]}>{featured.subtitle}</Text>

                <View style={styles.featuredProgress}>
                  <View style={styles.featuredTrack}>
                    <View style={[styles.featuredFill, { width: `${pct}%` as any }]} />
                  </View>
                  <Text style={[typography.subtitle2, { color: C.primary }]}>{pct}%</Text>
                </View>

                <View style={styles.featuredCta}>
                  <Text style={[typography.subtitle2, { color: C.primary, marginRight: 6 }]}>Continue</Text>
                  <ArrowRight size={16} color={C.primary} strokeWidth={2.5} />
                </View>
              </View>
              <View style={styles.featuredRight}>
                <View style={[styles.featuredIconBg, { backgroundColor: color.bg }]}>
                  <Map size={40} color={color.icon} strokeWidth={1.5} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })()}

        {/* ── Module List ──────────────────────────────────── */}
        <View style={styles.moduleList}>
          {rest.map(cat => {
            const color = CATEGORY_COLORS[cat.key] || CATEGORY_COLORS.default;
            const pct = ['greetings', 'food', 'restaurant'].includes(cat.key) && lessonsCompleted > 0 ? 100 : cat.key === 'greetings' ? 60 : 0;
            return (
              <TouchableOpacity
                key={cat.key}
                style={styles.moduleCard}
                onPress={() => router.push(`/learn/flashcards/${cat.key}` as any)}
                activeOpacity={0.82}
              >
                <View style={[styles.moduleIconBox, { backgroundColor: color.bg }]}>
                  <Compass size={24} color={color.icon} strokeWidth={2} />
                </View>
                <View style={styles.moduleBody}>
                  <Text style={[typography.subtitle1, { color: C.textPrimary, marginBottom: 4 }]}>{cat.title}</Text>
                  <Text style={[typography.caption, { color: C.textSecondary, marginBottom: 10 }]}>{cat.subtitle}</Text>
                  <View style={styles.moduleTrack}>
                    <View style={[styles.moduleFill, { width: `${pct}%` as any }]} />
                  </View>
                </View>
                <View style={styles.moduleRightCol}>
                  <Text style={[typography.subtitle2, { color: C.textSecondary, marginBottom: 4 }]}>{pct}%</Text>
                  <ChevronRight size={18} color={C.textSecondary} strokeWidth={2} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 24, paddingBottom: 120 },

  header: { marginBottom: 28, marginTop: 12 },

  utilRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  utilBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 14 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 16, marginBottom: 20,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  searchInput: { flex: 1, color: C.textPrimary },

  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  pill: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
    backgroundColor: C.white,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  pillActive: { backgroundColor: C.textPrimary },
  pillText: { color: C.textSecondary },
  pillTextActive: { color: C.white },

  featuredCard: {
    backgroundColor: C.white,
    borderRadius: 24, padding: 24, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05, shadowRadius: 20, elevation: 3,
    position: 'relative',
    overflow: 'hidden'
  },
  ticketCutoutTop: { position: 'absolute', right: 110, top: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: C.bg },
  ticketCutoutBottom: { position: 'absolute', right: 110, bottom: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: C.bg },

  featuredMeta: { flex: 1, paddingRight: 24, borderRightWidth: 1, borderRightColor: C.divider, borderStyle: 'dashed' },
  featuredProgress: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  featuredTrack: { flex: 1, height: 6, backgroundColor: C.primaryLight, borderRadius: 3, overflow: 'hidden' },
  featuredFill: { height: '100%', backgroundColor: C.primary, borderRadius: 3 } as any,
  featuredCta: { flexDirection: 'row', alignItems: 'center' },

  featuredRight: { width: 100, alignItems: 'center', justifyContent: 'center' },
  featuredIconBg: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

  moduleList: { gap: 16 },
  moduleCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 20,
    padding: 16,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  moduleIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  moduleBody: { flex: 1, paddingRight: 12 },
  moduleTrack: { height: 6, backgroundColor: C.primaryLight, borderRadius: 3, overflow: 'hidden' },
  moduleFill: { height: '100%', backgroundColor: C.primary, borderRadius: 3 } as any,
  moduleRightCol: { alignItems: 'flex-end', justifyContent: 'center' },
});
