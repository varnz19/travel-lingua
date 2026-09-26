import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { ArrowLeft, Volume2, Send, Sparkles } from 'lucide-react-native';
import { simulationService, DialogueNode } from '../../../services/simulationService';
import { ProfileContext } from '../../../context/ProfileContext';
import { TravelTheme } from '../../../constants/TravelTheme';
import { AnimatedPressable } from '../../../components/AnimatedPressable';
import { getApiBaseUrl } from '../../../services/apiConfig';

const T = TravelTheme.colors;

export default function SimulationChat() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const { speechSpeed, completeSimulation } = useContext(ProfileContext);

  const [scenarioName, setScenarioName] = useState('Simulation');
  const [nodes, setNodes] = useState<Record<string, DialogueNode>>({});
  const [currentNodeKey, setCurrentNodeKey] = useState('start');
  const [chat, setChat] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [simulationEnded, setSimulationEnded] = useState(false);
  const [accumulatedXp, setAccumulatedXp] = useState(0);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchScenario = async () => {
      const scenarioKey = typeof type === 'string' ? type : 'restaurant';
      const data = await simulationService.getScenario(scenarioKey);
      if (data) {
        setScenarioName(data.title);
        setNodes(data.nodes);
        const startNode = data.nodes[data.startNode];
        setChat([{ sender: 'bot', text: startNode.text }]);
        Speech.speak(startNode.text, { language: 'ja', rate: speechSpeed || 1.0 });
      }
    };
    fetchScenario();
  }, [type]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [chat]);

  const handleSelectOption = (textVal: string, nextNodeKey: string | null, xpEarned: number) => {
    const nextXp = accumulatedXp + xpEarned;
    setAccumulatedXp(nextXp);

    const updatedChat = [
      ...chat,
      { sender: 'user', text: textVal }
    ];

    if (nextNodeKey && nodes[nextNodeKey]) {
      const nextNode = nodes[nextNodeKey];
      updatedChat.push({ sender: 'bot', text: nextNode.text });
      setChat(updatedChat);
      setCurrentNodeKey(nextNodeKey);
      const cleanSpeak = nextNode.text.split('(')[0].trim();
      Speech.speak(cleanSpeak, { language: 'ja', rate: speechSpeed || 1.0 });
    } else {
      updatedChat.push({ sender: 'bot', text: "Wonderful! We have successfully finished our dialogue practice." });
      setChat(updatedChat);
      setSimulationEnded(true);
      const scenarioKey = typeof type === 'string' ? type : 'restaurant';
      completeSimulation(scenarioKey, nextXp);
    }
  };

  const handleSendCustom = async () => {
    if (!input.trim()) return;
    const textVal = input.trim();
    setInput('');

    const updatedChat = [
      ...chat,
      { sender: 'user', text: textVal }
    ];
    setChat(updatedChat);

    const scenarioKey = typeof type === 'string' ? type : 'restaurant';
    let botReplyText = `Hai! I understand: "${textVal}". Arigatou gozaimasu!`;

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/roleplay/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenarioKey,
          message: textVal,
          conversation_history: updatedChat.map(m => `${m.sender}: ${m.text}`)
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          botReplyText = data.reply;
        }
      }
    } catch (_err) {
      // offline fallback
    }

    const cleanSpeak = botReplyText.split('(')[0].replace(/[^\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\w\s]/g, '').trim();
    setChat([...updatedChat, { sender: 'bot', text: botReplyText }]);
    Speech.speak(cleanSpeak || "Hai! Arigatou gozaimasu", { language: 'ja', rate: speechSpeed || 1.0 });
  };

  const handleReplayTts = (text: string) => {
    const cleanSpeak = text.split('(')[0].trim();
    Speech.speak(cleanSpeak, { language: 'ja', rate: speechSpeed || 1.0 });
  };

  const currentNode = nodes[currentNodeKey];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={T.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{scenarioName}</Text>
          <TouchableOpacity
            onPress={() => {
              if (chat.length > 0) {
                const lastBotMsg = [...chat].reverse().find(m => m.sender === 'bot');
                if (lastBotMsg) handleReplayTts(lastBotMsg.text);
              }
            }}
            style={styles.ttsHeaderBtn}
          >
            <Volume2 size={20} color={T.postmark} />
          </TouchableOpacity>
        </View>

        {/* Chat messages */}
        <ScrollView ref={scrollRef} style={styles.chatArea} contentContainerStyle={{ paddingBottom: 24 }}>
          {chat.map((msg, idx) => {
            const isBot = msg.sender === 'bot';
            return (
              <View
                key={idx}
                style={[
                  styles.bubble,
                  isBot ? styles.bubbleBot : styles.bubbleUser
                ]}
              >
                <Text style={[styles.bubbleText, isBot ? styles.bubbleTextBot : styles.bubbleTextUser]}>
                  {msg.text}
                </Text>
              </View>
            );
          })}

          {simulationEnded && (
            <View style={styles.endedCard}>
              <Sparkles size={28} color={T.postmark} style={{ marginBottom: 8 }} />
              <Text style={styles.endedTitle}>Dialogue Complete!</Text>
              <Text style={styles.endedSubtitle}>
                You earned +{accumulatedXp} XP. Great job practicing this travel scenario!
              </Text>
              <AnimatedPressable style={styles.closeBtn} onPress={() => router.back()}>
                <Text style={styles.closeBtnText}>Back to Situations</Text>
              </AnimatedPressable>
            </View>
          )}
        </ScrollView>

        {/* Choices panel */}
        {!simulationEnded && currentNode && currentNode.options && currentNode.options.length > 0 && (
          <View style={styles.choicesPanel}>
            <Text style={styles.choicesTitle}>Suggested Responses</Text>
            {currentNode.options.map((opt, i) => (
              <AnimatedPressable
                key={i}
                style={styles.choiceBtn}
                onPress={() => handleSelectOption(opt.text, opt.nextNode, opt.xp || 10)}
              >
                <Text style={styles.choiceText}>{opt.text}</Text>
                <Text style={styles.choiceXp}>+{opt.xp || 10} XP</Text>
              </AnimatedPressable>
            ))}
          </View>
        )}

        {/* Input row */}
        {!simulationEnded && (
          <View style={styles.footer}>
            <TextInput
              style={styles.input}
              placeholder="Type reply in Japanese or English..."
              placeholderTextColor={T.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSendCustom}
            />
            <AnimatedPressable style={styles.sendBtn} onPress={handleSendCustom}>
              <Send size={16} color="#FFFFFF" />
            </AnimatedPressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: T.surface },
  container: { flex: 1, backgroundColor: T.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.sandLine,
    backgroundColor: T.surface,
  },
  backBtn: { marginRight: 14 },
  headerTitle: { flex: 1, fontSize: 16, fontFamily: 'Spectral_700Bold', color: T.ink },
  ttsHeaderBtn: { padding: 4 },
  chatArea: { flex: 1, padding: 16 },
  bubble: { padding: 12, borderRadius: 14, marginBottom: 10, maxWidth: '80%' },
  bubbleBot: {
    backgroundColor: T.surface,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: T.sandLine,
    ...TravelTheme.shadows.resting,
  },
  bubbleUser: {
    backgroundColor: T.postmark,
    alignSelf: 'flex-end',
    ...TravelTheme.shadows.button,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextBot: { color: T.ink, fontFamily: 'Inter_500Medium' },
  bubbleTextUser: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' },
  choicesPanel: {
    padding: 14,
    backgroundColor: T.surface,
    borderTopWidth: 1,
    borderTopColor: T.sandLine,
  },
  choicesTitle: {
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    color: T.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  choiceBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: T.paper,
    borderWidth: 1,
    borderColor: T.sandLine,
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  choiceText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: T.ink, flex: 1, marginRight: 8 },
  choiceXp: { fontSize: 11, fontFamily: 'Inter_700Bold', color: T.postmark },
  footer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: T.surface,
    borderTopWidth: 1,
    borderTopColor: T.sandLine,
    alignItems: 'center',
    gap: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  input: {
    flex: 1,
    backgroundColor: T.paper,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: T.ink,
    borderWidth: 1,
    borderColor: T.sandLine,
  },
  sendBtn: {
    backgroundColor: T.postmark,
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endedCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.sandLine,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    ...TravelTheme.shadows.resting,
  },
  endedTitle: { fontSize: 18, fontFamily: 'Spectral_700Bold', color: T.ink, marginBottom: 4 },
  endedSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: T.textSecondary, textAlign: 'center', lineHeight: 16, marginBottom: 14 },
  closeBtn: { backgroundColor: T.postmark, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  closeBtnText: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_700Bold' },
});