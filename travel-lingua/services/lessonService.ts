export interface Phrase {
  id: string;
  front: string;
  back: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
}

export interface Category {
  key: string;
  title: string;
  icon: string;
  subtitle: string;
  phrases: Phrase[];
}

export const CATEGORIES_DATA: Record<string, Category> = {
  greetings: {
    key: 'greetings',
    title: 'Greetings',
    icon: '👋',
    subtitle: 'Basic hello & goodbye',
    phrases: [
      { id: 'g1', front: "Konnichiwa (こんにちは)", back: "Hello / Good afternoon", pronunciation: "kohn-nee-chee-wah", example: "Konnichiwa, genki desu ka?", exampleTranslation: "Hello, how are you?" },
      { id: 'g2', front: "Ohayou gozaimasu (おはようございます)", back: "Good morning", pronunciation: "oh-hah-yoh goh-zah-ee-mahs", example: "Ohayou gozaimasu, sensei.", exampleTranslation: "Good morning, teacher." },
      { id: 'g3', front: "Konbanwa (こんばんは)", back: "Good evening", pronunciation: "kohn-bahn-wah", example: "Konbanwa, osoku narimashita.", exampleTranslation: "Good evening, I am late." },
      { id: 'g4', front: "Arigatou gozaimasu (ありがとうございます)", back: "Thank you very much", pronunciation: "ah-ree-gah-toh goh-zah-ee-mahs", example: "Tetsudatte kurete arigatou gozaimasu.", exampleTranslation: "Thank you very much for helping me." },
      { id: 'g5', front: "Sayounara (さようなら)", back: "Goodbye", pronunciation: "sah-yoh-nah-rah", example: "Mata ashita, sayounara.", exampleTranslation: "See you tomorrow, goodbye." }
    ]
  },
  food: {
    key: 'food',
    title: 'Food & Dining',
    icon: '🍜',
    subtitle: 'Ordering food & snacks',
    phrases: [
      { id: 'f1', front: "Oishii (おいしい)", back: "Delicious", pronunciation: "oy-shee", example: "Kono ramen wa oishii desu.", exampleTranslation: "This ramen is delicious." },
      { id: 'f2', front: "Mizu o kudasai (水をください)", back: "Water, please", pronunciation: "mee-zoo oh koo-dah-sah-ee", example: "Sumimasen, mizu o kudasai.", exampleTranslation: "Excuse me, water please." },
      { id: 'f3', front: "Gochisousama deshita (ごちそうさまでした)", back: "Thank you for the feast", pronunciation: "goh-chee-soh-sah-mah desh-tah", example: "Oishikatta desu, gochisousama deshita.", exampleTranslation: "It was delicious, thank you for the feast." }
    ]
  },
  restaurant: {
    key: 'restaurant',
    title: 'Restaurant',
    icon: '🍽️',
    subtitle: 'Dining out phrases',
    phrases: [
      { id: 'r1', front: "Menyuu o onegaishimasu (メニューをお願いします)", back: "Menu, please", pronunciation: "meh-nyoo oh oh-neh-gah-ee-shee-mahs", example: "Eigo no menyuu o onegaishimasu.", exampleTranslation: "English menu, please." },
      { id: 'r2', front: "Okaikei o onegaishimasu (お会計をお願いします)", back: "Check, please", pronunciation: "oh-kah-ee-keh-ee oh oh-neh-gah-ee-shee-mahs", example: "Kurejitto kaado de okaikei o onegaishimasu.", exampleTranslation: "Check please, by credit card." },
      { id: 'r3', front: "Kore o kudasai (これをください)", back: "I will have this, please", pronunciation: "koh-reh oh koo-dah-sah-ee", example: "Sumimasen, kore o kudasai.", exampleTranslation: "Excuse me, I'll have this please." }
    ]
  },
  airport: {
    key: 'airport',
    title: 'Airport',
    icon: '✈️',
    subtitle: 'Transit & flights',
    phrases: [
      { id: 'ap1', front: "Toujouken (搭乗券)", back: "Boarding pass", pronunciation: "toh-joh-kehn", example: "Toujouken o misete kudasai.", exampleTranslation: "Please show me your boarding pass." },
      { id: 'ap2', front: "Tenimotsu (手荷物)", back: "Carry-on baggage", pronunciation: "teh-nee-moh-tsoo", example: "Tenimotsu wa kore dake desu.", exampleTranslation: "This is all my carry-on baggage." }
    ]
  },
  hotel: {
    key: 'hotel',
    title: 'Hotel',
    icon: '🏨',
    subtitle: 'Accommodation stay',
    phrases: [
      { id: 'h1', front: "Yoyaku shiteimasu (予約しています)", back: "I have a reservation", pronunciation: "yoh-yah-koo shee-teh-ee-mahs", example: "Sarah Jenkins de yoyaku shiteimasu.", exampleTranslation: "I have a reservation under Sarah Jenkins." },
      { id: 'h2', front: "Wi-Fi no pasuwaado wa nan desu ka? (Wi-Fiのパスワードは何ですか？)", back: "What is the Wi-Fi password?", pronunciation: "wahee-fahee no pah-soo-wah-doh wa nahn des-ka", example: "Sumimasen, Wi-Fi no pasuwaado wa nan desu ka?", exampleTranslation: "Excuse me, what is the Wi-Fi password?" }
    ]
  },
  shopping: {
    key: 'shopping',
    title: 'Shopping',
    icon: '🛍️',
    subtitle: 'Buying souvenirs & items',
    phrases: [
      { id: 's1', front: "Kore wa ikura desu ka? (これはいくらですか？)", back: "How much is this?", pronunciation: "koh-reh wa ee-koo-rah des-ka", example: "Kono omiyage wa kore wa ikura desu ka?", exampleTranslation: "How much is this souvenir?" },
      { id: 's2', front: "Fukuro o onegaishimasu (袋をお願いします)", back: "Bag, please", pronunciation: "foo-koo-roh oh oh-neh-gah-ee-shee-mahs", example: "Kaimono fukuro o onegaishimasu.", exampleTranslation: "Shopping bag, please." }
    ]
  },
  transportation: {
    key: 'transportation',
    title: 'Transportation',
    icon: '🚕',
    subtitle: 'Trains, taxis & buses',
    phrases: [
      { id: 't1', front: "Eki (駅)", back: "Station", pronunciation: "eh-kee", example: "Shinjuku eki wa doko desu ka?", exampleTranslation: "Where is Shinjuku station?" },
      { id: 't2', front: "Densha (電車)", back: "Train", pronunciation: "dehn-shah", example: "Densha ga kimasu.", exampleTranslation: "The train is coming." },
      { id: 't3', front: "Kippu (切符)", back: "Ticket", pronunciation: "keep-poo", example: "Kippu uriba wa doko desu ka?", exampleTranslation: "Where is the ticket office?" }
    ]
  },
  directions: {
    key: 'directions',
    title: 'Directions',
    icon: '🗺️',
    subtitle: 'Asking how to go',
    phrases: [
      { id: 'd1', front: "... wa doko desu ka? (…はどこですか？)", back: "Where is...?", pronunciation: "wa doh-koh des-ka", example: "Toire wa doko desu ka?", exampleTranslation: "Where is the restroom?" },
      { id: 'd2', front: "Massugu (真っ直ぐ)", back: "Straight ahead", pronunciation: "mahs-soo-goo", example: "Massugu itte kudasai.", exampleTranslation: "Please go straight ahead." }
    ]
  },
  emergencies: {
    key: 'emergencies',
    title: 'Emergencies',
    icon: '🚨',
    subtitle: 'Critical & urgent care',
    phrases: [
      { id: 'e1', front: "Tasukete! (助けて！)", back: "Help!", pronunciation: "tah-soo-keh-teh", example: "Dareka tasukete!", exampleTranslation: "Someone help!" },
      { id: 'e2', front: "Pasupooto o nakushimashita (パスポートをなくしました)", back: "I lost my passport", pronunciation: "pah-soo-poh-toh oh nah-koo-shee-mahsh-tah", example: "Kouban wa doko desu ka? Pasupooto o nakushimashita.", exampleTranslation: "Where is the police box? I lost my passport." }
    ]
  },
  healthcare: {
    key: 'healthcare',
    title: 'Healthcare',
    icon: '🏥',
    subtitle: 'Pharmacy & doctors',
    phrases: [
      { id: 'hc1', front: "Kusuri (薬)", back: "Medicine", pronunciation: "koo-soo-ree", example: "Kaze no kusuri o kudasai.", exampleTranslation: "Cold medicine, please." },
      { id: 'hc2', front: "Kibun ga warui desu (気分が悪いです)", back: "I feel sick", pronunciation: "kee-boon ga wah-roo-ee des", example: "Sumimasen, kibun ga warui desu.", exampleTranslation: "Excuse me, I feel sick." }
    ]
  },
  numbers: {
    key: 'numbers',
    title: 'Numbers',
    icon: '🔢',
    subtitle: 'Counting 1 to 10',
    phrases: [
      { id: 'n1', front: "Ichi, Ni, San (一, 二, 三)", back: "One, Two, Three", pronunciation: "ee-chee, nee, sahn", example: "Ichi, ni, san, yon, go.", exampleTranslation: "One, two, three, four, five." }
    ]
  },
  money: {
    key: 'money',
    title: 'Money & ATM',
    icon: '💵',
    subtitle: 'Exchanging & paying',
    phrases: [
      { id: 'm1', front: "Ryogaeshitsu (両替所)", back: "Currency exchange", pronunciation: "ryoh-gah-ee-joh", example: "Ryogaeshitsu wa doko desu ka?", exampleTranslation: "Where is the currency exchange?" }
    ]
  },
  culture: {
    key: 'culture',
    title: 'Culture',
    icon: '🏯',
    subtitle: 'Shrines & manners',
    phrases: [
      { id: 'c1', front: "O-jigi (お辞儀)", back: "Bowing", pronunciation: "oh-jee-gee", example: "Nihon dewa o-jigi ga taisetsu desu.", exampleTranslation: "Bowing is important in Japan." }
    ]
  }
};

export const lessonService = {
  getCategories: async (): Promise<Category[]> => {
    return Object.values(CATEGORIES_DATA);
  },
  getCategory: async (key: string): Promise<Category | null> => {
    return CATEGORIES_DATA[key] || null;
  }
};
