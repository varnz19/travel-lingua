import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { simulationService, DialogueNode } from '../../../services/simulationService';
import { ProfileContext } from '../../../context/ProfileContext';

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
      completeSimulation(typeof type === 'string' ? type : 'restaurant', nextXp);
    }
  };

  const handleSendCustomText = () => {
    if (!input.trim()) return;
    const userText = input.toLowerCase().trim();
    
    const currentNode = nodes[currentNodeKey];
    if (currentNode && currentNode.options) {
      const match = currentNode.options.find(opt => 
        userText.includes(opt.text.toLowerCase()) || opt.text.toLowerCase().includes(userText)
      );

      if (match) {
        handleSelectOption(match.text, match.nextNode, match.xp);
        setInput('');
        return;
      }
    }

    const currentOptions = currentNode?.options.map(opt => `"${opt.text}"`).join(' or ') || '';
    const updatedChat = [
      ...chat,
      { sender: 'user', text: input },
      { sender: 'bot', text: `Try choosing one of the phrases below, or type something like: ${currentOptions}` }
    ];
    setChat(updatedChat);
    setInput('');
  };

  const handlePlayTTS = () => {
    const currentNode = nodes[currentNodeKey];
    if (currentNode) {
      const cleanText = currentNode.text.split('(')[0].trim();
      Speech.speak(cleanText, { language: 'ja', rate: speechSpeed || 1.0 });
    }
  };

  const currentNode = nodes[currentNodeKey];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{scenarioName}</Text>
        <TouchableOpacity onPress={handlePlayTTS} style={styles.ttsHeaderBtn}>
          <Ionicons name="volume-high-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {chat.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.bubble,
              msg.sender === 'user' ? styles.bubbleUser : styles.bubbleBot
            ]}
          >
            <Text style={[
              styles.bubbleText,
              msg.sender === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot
            ]}>
              {msg.text}
            </Text>
          </View>
        ))}

        {simulationEnded && (
          <View style={styles.endedCard}>
            <Text style={styles.endedTitle}>Scenario Finished! 🎉</Text>
            <Text style={styles.endedSubtitle}>You practiced branching conversations and earned +{accumulatedXp} XP!</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>Back to Scenarios</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Predefined Branching Choices */}
      {!simulationEnded && currentNode && currentNode.options && currentNode.options.length > 0 && (
        <View style={styles.choicesPanel}>
          <Text style={styles.choicesTitle}>Select your reply:</Text>
          {currentNode.options.map((opt, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelectOption(opt.text, opt.nextNode, opt.xp)}
              style={styles.choiceBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.choiceText}>{opt.text}</Text>
              <Text style={styles.choiceXp}>+{opt.xp} XP</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Text Input Footer */}
      {!simulationEnded && (
        <View style={styles.footer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your response..."
            style={styles.input}
            placeholderTextColor="#94A3B8"
            onSubmitEditing={handleSendCustomText}
          />
          <TouchableOpacity onPress={handleSendCustomText} style={styles.sendBtn} activeOpacity={0.8}>
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
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
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    },
  ttsHeaderBtn: {
    padding: 6,
  },
  chatArea: {
    flex: 1,
    padding: 16,
  },
  bubble: {
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    maxWidth: '78%',
  },
  bubbleBot: {
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleUser: {
    backgroundColor: '#8B5CF6',
    alignSelf: 'end' as any,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    },
  bubbleTextBot: {
    color: '#0F172A',
  },
  bubbleTextUser: {
    color: '#FFF',
    fontWeight: '600',
  },
  choicesPanel: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  choicesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 10,
    },
  choiceBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  choiceXp: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CF6',
    },
  footer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    backgroundColor: '#8B5CF6',
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endedCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  endedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  endedSubtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  closeBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    }
});