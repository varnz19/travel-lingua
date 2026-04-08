import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';

/* ---------- SCENARIOS ---------- */
const scenarios = {
  restaurant: [
    {
      text: "What would you like to order?",
      options: ["I would like pasta", "Can I see the menu?", "Do you have veg food?"]
    },
    {
      text: "Would you like something to drink?",
      options: ["Water please", "Juice please", "No, thank you"]
    },
    {
      text: "Anything else?",
      options: ["That’s all", "Maybe later", "No thanks"]
    }
  ],

  hotel: [
    {
      text: "Do you have a reservation?",
      options: ["Yes, under my name", "No, I need a room", "Can I book now?"]
    },
    {
      text: "How many nights?",
      options: ["Two nights", "Three nights", "One night"]
    }
  ]
};

export default function Simulation() {

  const { type } = useLocalSearchParams();
  const scenario =
    scenarios[type as keyof typeof scenarios] || scenarios.restaurant;

  const [step, setStep] = useState(0);
  const [chat, setChat] = useState<any[]>([
    { sender: "bot", text: scenario[0].text }
  ]);
  const [input, setInput] = useState('');

  const scrollRef = useRef<ScrollView>(null);

  /* ---------- AUTO SCROLL ---------- */
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [chat]);

  /* ---------- HANDLE OPTION ---------- */
  const handleSelect = (option: string) => {
    const nextStep = step + 1;

    const updatedChat = [
      ...chat,
      { sender: "user", text: option }
    ];

    if (scenario[nextStep]) {
      updatedChat.push({
        sender: "bot",
        text: scenario[nextStep].text
      });
    }

    setChat(updatedChat);
    setStep(nextStep);
  };

  /* ---------- HANDLE TEXT INPUT ---------- */
  const handleSend = () => {
    if (!input.trim()) return;

    const updatedChat = [
      ...chat,
      { sender: "user", text: input },
      {
        sender: "bot",
        text: "Try saying: 'Could you help me with that?'"
      }
    ];

    setChat(updatedChat);
    setInput('');
  };

  /* ---------- VOICE (basic speak) ---------- */
  const handleVoice = () => {
    Speech.speak("You can say: Could you help me with that?");
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>

      {/* HEADER */}
      <View style={{
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff'
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          Simulation
        </Text>
      </View>

      {/* CHAT AREA */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, padding: 15 }}
        showsVerticalScrollIndicator={false}
      >
        {chat.map((msg, index) => (
          <View
            key={index}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#6c5ce7' : '#fff',
              padding: 12,
              borderRadius: 16,
              marginBottom: 10,
              maxWidth: '75%',
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 4
            }}
          >
            <Text style={{
              color: msg.sender === 'user' ? '#fff' : '#000'
            }}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* OPTIONS */}
      {scenario[step] && (
        <View style={{ paddingHorizontal: 15 }}>
          {scenario[step].options.map((opt, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(opt)}
              style={{
                backgroundColor: '#fff',
                padding: 14,
                borderRadius: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: '#eee'
              }}
            >
              <Text>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* INPUT BAR */}
      <View style={{
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#eee'
      }}>

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask something..."
          style={{
            flex: 1,
            backgroundColor: '#f1f2f6',
            padding: 12,
            borderRadius: 20
          }}
        />

        {/* VOICE BUTTON */}
        <TouchableOpacity
          onPress={handleVoice}
          style={{
            marginLeft: 8,
            backgroundColor: '#a29bfe',
            padding: 12,
            borderRadius: 20
          }}
        >
          <Text style={{ color: '#fff' }}>🎤</Text>
        </TouchableOpacity>

        {/* SEND BUTTON */}
        <TouchableOpacity
          onPress={handleSend}
          style={{
            marginLeft: 8,
            backgroundColor: '#6c5ce7',
            padding: 12,
            borderRadius: 20
          }}
        >
          <Text style={{ color: '#fff' }}>➤</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}