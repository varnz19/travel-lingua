import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ProfileContext } from '../../../context/ProfileContext';
import { translatorService } from '../../../services/translatorService';

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
  success: '#58C98A',
};

const LANGUAGES = ['English', 'Japanese', 'Spanish', 'French', 'German', 'Italian'];

export default function TranslatorScreen() {
  const router = useRouter();
  const { speechSpeed, addSavedPhrase, translationHistory, addTranslationToHistory } = useContext(ProfileContext);

  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [source, setSource] = useState('English');
  const [target, setTarget] = useState('Japanese');
  const [sourcePicker, setSourcePicker] = useState(false);
  const [targetPicker, setTargetPicker] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    const result = await translatorService.translate(text, source, target);
    setTranslated(result.translatedText);
    setPronunciation(result.pronunciation || '');
    addTranslationToHistory(text, result.translatedText);
  };

  const handleSwap = () => {
    setSource(target);
    setTarget(source);
    setText(translated);
    setTranslated(text);
  };

  const handleCopy = async () => {
    if (!translated) return;
    await Clipboard.setStringAsync(translated);
  };

  const handleSave = () => {
    if (!translated) return;
    addSavedPhrase(translated, text, pronunciation);
  };

  const handleTTS = () => {
    if (!translated) return;
    const clean = translated.split('(')[0].trim();
    const map: Record<string, string> = { Japanese: 'ja', Spanish: 'es', French: 'fr', German: 'de', Italian: 'it' };
    Speech.speak(clean, { language: map[target] || 'en', rate: speechSpeed || 1.0 });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Translator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Language Selector ────────────────────────── */}
        <View style={styles.langBar}>
          {/* Source */}
          <TouchableOpacity style={styles.langPill} onPress={() => { setSourcePicker(!sourcePicker); setTargetPicker(false); }} activeOpacity={0.8}>
            <Text style={styles.langPillText}>{source}</Text>
            <Ionicons name="chevron-down" size={14} color={C.textSecondary} />
          </TouchableOpacity>

          {/* Swap */}
          <TouchableOpacity style={styles.swapBtn} onPress={handleSwap} activeOpacity={0.8}>
            <Ionicons name="swap-horizontal" size={18} color={C.primary} />
          </TouchableOpacity>

          {/* Target */}
          <TouchableOpacity style={[styles.langPill, { backgroundColor: C.primaryLight }]} onPress={() => { setTargetPicker(!targetPicker); setSourcePicker(false); }} activeOpacity={0.8}>
            <Text style={[styles.langPillText, { color: C.primary }]}>{target}</Text>
            <Ionicons name="chevron-down" size={14} color={C.primary} />
          </TouchableOpacity>
        </View>

        {/* Source Picker Dropdown */}
        {sourcePicker && (
          <View style={styles.dropdown}>
            {LANGUAGES.filter(l => l !== target).map(l => (
              <TouchableOpacity key={l} style={styles.dropdownItem} onPress={() => { setSource(l); setSourcePicker(false); }}>
                <Text style={[styles.dropdownText, l === source && { color: C.primary, fontWeight: '700' }]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Target Picker Dropdown */}
        {targetPicker && (
          <View style={styles.dropdown}>
            {LANGUAGES.filter(l => l !== source).map(l => (
              <TouchableOpacity key={l} style={styles.dropdownItem} onPress={() => { setTarget(l); setTargetPicker(false); }}>
                <Text style={[styles.dropdownText, l === target && { color: C.primary, fontWeight: '700' }]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Input Card ───────────────────────────────── */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>{source}</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder={`Type something in ${source}...`}
            value={text}
            onChangeText={setText}
            placeholderTextColor={C.textSecondary}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.translateBtn} onPress={handleTranslate} activeOpacity={0.85}>
            <Ionicons name="language" size={18} color={C.white} style={{ marginRight: 8 }} />
            <Text style={styles.translateBtnText}>Translate</Text>
          </TouchableOpacity>
        </View>

        {/* ── Output Card ──────────────────────────────── */}
        {!!translated && (
          <View style={styles.outputCard}>
            <Text style={styles.outputLabel}>{target}</Text>
            <Text style={styles.outputText}>{translated}</Text>
            {!!pronunciation && (
              <Text style={styles.outputPron}>/{pronunciation}/</Text>
            )}
            <View style={styles.outputActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleTTS} activeOpacity={0.8}>
                <Ionicons name="volume-high-outline" size={20} color={C.primary} />
                <Text style={styles.actionBtnText}>Listen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} activeOpacity={0.8}>
                <Ionicons name="copy-outline" size={20} color={C.textSecondary} />
                <Text style={[styles.actionBtnText, { color: C.textSecondary }]}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF7E0' }]} onPress={handleSave} activeOpacity={0.8}>
                <Ionicons name="bookmark-outline" size={20} color="#E0963B" />
                <Text style={[styles.actionBtnText, { color: '#E0963B' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── History ──────────────────────────────────── */}
        {translationHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Translations</Text>
            {translationHistory.slice(0, 5).map((item: any, i: number) => (
              <TouchableOpacity
                key={item.id || i}
                style={styles.historyRow}
                onPress={() => { setText(item.sourceText); setTranslated(item.translatedText); }}
                activeOpacity={0.8}
              >
                <View style={styles.historyIcon}>
                  <Ionicons name="time-outline" size={16} color={C.textSecondary} />
                </View>
                <View style={styles.historyBody}>
                  <Text style={styles.historySource}>{item.sourceText}</Text>
                  <Text style={styles.historyTarget}>{item.translatedText}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16,
    backgroundColor: C.bg,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary },

  scroll: { padding: 24, paddingTop: 8, paddingBottom: 120 },

  langBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 },
  langPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.white, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  langPillText: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  swapBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center',
  },

  dropdown: {
    backgroundColor: C.white, borderRadius: 16, padding: 8, marginBottom: 12,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownText: { fontSize: 15, fontWeight: '500', color: C.textPrimary },

  inputCard: {
    backgroundColor: C.white, borderRadius: 24,
    padding: 20, marginBottom: 16,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  textInput: { minHeight: 100, fontSize: 18, color: C.textPrimary, fontWeight: '400', marginBottom: 16 },
  translateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.primary, borderRadius: 16, paddingVertical: 14,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 3,
  },
  translateBtnText: { color: C.white, fontSize: 16, fontWeight: '700' },

  outputCard: {
    backgroundColor: C.primaryLight, borderRadius: 24,
    padding: 20, marginBottom: 24,
  },
  outputLabel: { fontSize: 11, fontWeight: '700', color: C.primary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  outputText: { fontSize: 22, fontWeight: '700', color: C.textPrimary, marginBottom: 6 },
  outputPron: { fontSize: 14, fontStyle: 'italic', color: C.textSecondary, marginBottom: 16 },
  outputActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.white, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: C.primary },

  historySection: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: C.textPrimary, marginBottom: 16 },
  historyRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: C.textPrimary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.025, shadowRadius: 6, elevation: 1,
  },
  historyIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  historyBody: { flex: 1 },
  historySource: { fontSize: 14, color: C.textSecondary, marginBottom: 2 },
  historyTarget: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
});
