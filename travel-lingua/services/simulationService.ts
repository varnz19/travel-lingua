export interface ChatOption {
  text: string;
  nextNode: string | null;
  xp: number;
}

export interface DialogueNode {
  text: string;
  options: ChatOption[];
}

export interface Scenario {
  key: string;
  title: string;
  icon: string;
  difficulty: string;
  points: number;
  startNode: string;
  nodes: Record<string, DialogueNode>;
}

export const SCENARIOS_DATA: Record<string, Scenario> = {
  restaurant: {
    key: 'restaurant',
    title: 'Restaurant Order',
    icon: '🍜',
    difficulty: 'Beginner',
    points: 50,
    startNode: 'start',
    nodes: {
      start: {
        text: "Konnichiwa! Welcome to Ramen Ichiran. Ready to order?",
        options: [
          { text: "Yes, I would like ramen, please.", nextNode: "drinks", xp: 15 },
          { text: "Can I see the English menu?", nextNode: "menu", xp: 10 },
          { text: "Do you have vegetarian options?", nextNode: "veg", xp: 20 }
        ]
      },
      menu: {
        text: "Sure! Here is the English menu. What would you like?",
        options: [
          { text: "Thank you. I'll have the Tonkotsu Ramen.", nextNode: "drinks", xp: 15 },
          { text: "What do you recommend?", nextNode: "recommend", xp: 20 }
        ]
      },
      recommend: {
        text: "Our signature Spicy Miso Ramen is very popular!",
        options: [
          { text: "Perfect, I will have that.", nextNode: "drinks", xp: 15 }
        ]
      },
      veg: {
        text: "We have Veggie Ramen with soy sauce broth. Is that okay?",
        options: [
          { text: "Yes, sounds great!", nextNode: "drinks", xp: 20 }
        ]
      },
      drinks: {
        text: "Excellent choice. Would you like a drink with that?",
        options: [
          { text: "Just water, please.", nextNode: "end", xp: 10 },
          { text: "A green tea, please.", nextNode: "end", xp: 20 }
        ]
      },
      end: {
        text: "Got it! Your order will be ready in 5 minutes. Arigatou!",
        options: []
      }
    }
  },
  taxi: {
    key: 'taxi',
    title: 'Taking a Taxi',
    icon: '🚕',
    difficulty: 'Beginner',
    points: 40,
    startNode: 'start',
    nodes: {
      start: {
        text: "Hello! Where would you like to go today?",
        options: [
          { text: "To Tokyo Station, please.", nextNode: "station", xp: 15 },
          { text: "Could you take me to the airport?", nextNode: "airport", xp: 15 }
        ]
      },
      station: {
        text: "Tokyo Station, understood. It takes about 15 minutes. Highway okay?",
        options: [
          { text: "Yes, highway is fine.", nextNode: "arrived", xp: 15 },
          { text: "No, local roads please.", nextNode: "arrived", xp: 20 }
        ]
      },
      airport: {
        text: "Haneda Airport, correct? Which terminal?",
        options: [
          { text: "Terminal 1, please.", nextNode: "arrived", xp: 15 },
          { text: "I'm not sure, JAL flight.", nextNode: "JAL", xp: 20 }
        ]
      },
      JAL: {
        text: "Ah, JAL is Terminal 1. Let's head there.",
        options: [
          { text: "Thank you for checking!", nextNode: "arrived", xp: 15 }
        ]
      },
      arrived: {
        text: "We have arrived. That will be 2,500 yen.",
        options: [
          { text: "Can I pay by credit card?", nextNode: "end", xp: 20 },
          { text: "Here is 3,000 yen. Keep the change.", nextNode: "end", xp: 15 }
        ]
      },
      end: {
        text: "Payment received. Thank you, have a safe trip!",
        options: []
      }
    }
  },
  hotel: {
    key: 'hotel',
    title: 'Hotel Check-in',
    icon: '🏨',
    difficulty: 'Intermediate',
    points: 60,
    startNode: 'start',
    nodes: {
      start: {
        text: "Welcome to the Grand Palace. How can I help you?",
        options: [
          { text: "I have a reservation under Sarah Jenkins.", nextNode: "confirm", xp: 15 },
          { text: "Do you have any rooms available tonight?", nextNode: "walkin", xp: 20 }
        ]
      },
      confirm: {
        text: "Yes, Sarah Jenkins. 3 nights, deluxe double room. May I see your passport?",
        options: [
          { text: "Sure, here it is.", nextNode: "checkout", xp: 10 }
        ]
      },
      walkin: {
        text: "We have standard queen rooms left. 15,000 yen per night. Is that okay?",
        options: [
          { text: "Yes, that works.", nextNode: "checkout", xp: 15 },
          { text: "Does that include breakfast?", nextNode: "breakfast", xp: 20 }
        ]
      },
      breakfast: {
        text: "Yes, buffet breakfast is included in the price.",
        options: [
          { text: "Perfect, let's book it.", nextNode: "checkout", xp: 15 }
        ]
      },
      checkout: {
        text: "All set! Here is your keycard, room 704. Check out is at 11 AM.",
        options: [
          { text: "Thank you. What is the Wi-Fi password?", nextNode: "end", xp: 15 }
        ]
      },
      end: {
        text: "The Wi-Fi password is on the card holder: 'Palace2026'. Enjoy your stay!",
        options: []
      }
    }
  },
  airport: {
    key: 'airport',
    title: 'Airport Transit',
    icon: '✈️',
    difficulty: 'Beginner',
    points: 40,
    startNode: 'start',
    nodes: {
      start: {
        text: "Welcome to Japan Airlines. Where are you flying to today?",
        options: [
          { text: "Going to New York, check-in please.", nextNode: "bags", xp: 15 }
        ]
      },
      bags: {
        text: "Great. Any bags to check in today?",
        options: [
          { text: "Yes, one suitcase.", nextNode: "gate", xp: 15 },
          { text: "No bags, just carry-on.", nextNode: "gate", xp: 20 }
        ]
      },
      gate: {
        text: "Here is your boarding pass. Gate 42, boarding starts at 2:30 PM.",
        options: [
          { text: "Thank you. Where is Gate 42?", nextNode: "end", xp: 15 }
        ]
      },
      end: {
        text: "Go straight, past security, and turn left. Have a nice flight!",
        options: []
      }
    }
  },
  immigration: {
    key: 'immigration',
    title: 'Immigration Control',
    icon: '🛂',
    difficulty: 'Intermediate',
    points: 50,
    startNode: 'start',
    nodes: {
      start: {
        text: "Good day. What is the purpose of your visit to Japan?",
        options: [
          { text: "I'm here for tourism.", nextNode: "duration", xp: 15 },
          { text: "Business meetings.", nextNode: "duration", xp: 20 }
        ]
      },
      duration: {
        text: "Tourism, I see. How long will you be staying?",
        options: [
          { text: "For two weeks.", nextNode: "address", xp: 15 }
        ]
      },
      address: {
        text: "Where will you be staying during your trip?",
        options: [
          { text: "At the Grand Palace Hotel in Tokyo.", nextNode: "end", xp: 20 }
        ]
      },
      end: {
        text: "Perfect. Look at the camera and scan your fingerprints... Welcome to Japan!",
        options: []
      }
    }
  },
  shopping: {
    key: 'shopping',
    title: 'Shopping Souvenirs',
    icon: '🛍️',
    difficulty: 'Beginner',
    points: 30,
    startNode: 'start',
    nodes: {
      start: {
        text: "Welcome! Looking for anything special?",
        options: [
          { text: "I'm looking for local green tea.", nextNode: "tea", xp: 15 },
          { text: "Just browsing, thank you.", nextNode: "end", xp: 10 }
        ]
      },
      tea: {
        text: "We have premium Matcha from Kyoto right here.",
        options: [
          { text: "Excellent! How much is it?", nextNode: "buy", xp: 15 }
        ]
      },
      buy: {
        text: "It is 1,200 yen per box.",
        options: [
          { text: "I will take two boxes, please.", nextNode: "end", xp: 20 }
        ]
      },
      end: {
        text: "Great! Let's get that checked out for you at the counter.",
        options: []
      }
    }
  },
  pharmacy: {
    key: 'pharmacy',
    title: 'Buying Medicine',
    icon: '💊',
    difficulty: 'Intermediate',
    points: 50,
    startNode: 'start',
    nodes: {
      start: {
        text: "Hello, how can I help you?",
        options: [
          { text: "I have a bad headache, do you have pain relievers?", nextNode: "reliever", xp: 15 },
          { text: "I need cough medicine.", nextNode: "cough", xp: 15 }
        ]
      },
      reliever: {
        text: "Yes, we have Loxonin or Bufferin. Do you have any allergies?",
        options: [
          { text: "No allergies. I will take Bufferin.", nextNode: "end", xp: 20 }
        ]
      },
      cough: {
        text: "We have cough syrup or tablets. Which do you prefer?",
        options: [
          { text: "Cough syrup, please.", nextNode: "end", xp: 20 }
        ]
      },
      end: {
        text: "Take one dose after meals. Take care!",
        options: []
      }
    }
  },
  emergency: {
    key: 'emergency',
    title: 'Emergency Help',
    icon: '🚨',
    difficulty: 'Intermediate',
    points: 60,
    startNode: 'start',
    nodes: {
      start: {
        text: "Emergency Services. Do you need Police or Ambulance?",
        options: [
          { text: "Ambulance! My friend collapsed.", nextNode: "ambulance", xp: 20 },
          { text: "Police, I was pickpocketed.", nextNode: "police", xp: 20 }
        ]
      },
      ambulance: {
        text: "Ambulance dispatched. What is your location?",
        options: [
          { text: "Near Tokyo Tower, main entrance.", nextNode: "end", xp: 20 }
        ]
      },
      police: {
        text: "Please go to the nearest Police Box (Kouban). What is your location?",
        options: [
          { text: "I'm near Shibuya Crossing.", nextNode: "end", xp: 20 }
        ]
      },
      end: {
        text: "Help is on the way. Please stay calm.",
        options: []
      }
    }
  },
  directions: {
    key: 'directions',
    title: 'Asking Directions',
    icon: '🗺️',
    difficulty: 'Beginner',
    points: 30,
    startNode: 'start',
    nodes: {
      start: {
        text: "Excuse me, can I help you?",
        options: [
          { text: "Yes, where is the nearest subway station?", nextNode: "subway", xp: 15 },
          { text: "I am lost. Where is the Senso-ji Temple?", nextNode: "temple", xp: 20 }
        ]
      },
      subway: {
        text: "Go straight for two blocks, it's next to the convenience store.",
        options: [
          { text: "Thank you so much!", nextNode: "end", xp: 10 }
        ]
      },
      temple: {
        text: "Ah, Senso-ji is a 10-minute walk. Follow this street all the way down.",
        options: [
          { text: "Is it far?", nextNode: "far", xp: 15 }
        ]
      },
      far: {
        text: "No, very close. You will see the red gate shortly.",
        options: [
          { text: "Perfect, thank you!", nextNode: "end", xp: 10 }
        ]
      },
      end: {
        text: "You are welcome. Have a wonderful day!",
        options: []
      }
    }
  }
};

import { getApiBaseUrl } from './apiConfig';

export interface RoleplayAIResponse {
  reply: string;
  feedbackGrammar?: string;
  suggestedNextPhrases: string[];
  isLiveServer: boolean;
}

export const simulationService = {
  getScenarios: async (): Promise<Scenario[]> => {
    return Object.values(SCENARIOS_DATA);
  },
  getScenario: async (key: string): Promise<Scenario | null> => {
    return SCENARIOS_DATA[key] || null;
  },
  sendRoleplayMessage: async (
    scenarioId: string,
    message: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    difficulty: string = 'beginner'
  ): Promise<RoleplayAIResponse | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${getApiBaseUrl()}/api/v1/roleplay/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenarioId,
          difficulty: difficulty,
          message: message,
          conversation_history: conversationHistory,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          reply: data.reply,
          feedbackGrammar: data.feedback_grammar,
          suggestedNextPhrases: data.suggested_next_phrases || [],
          isLiveServer: true,
        };
      }
    } catch (_err) {
      // Backend unavailable; fall back to local dialogue nodes
    }
    return null;
  },
};
