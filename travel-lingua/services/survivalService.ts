export interface TravelPhrase {
  id: string;
  text: string;
  translation: string;
  pronunciation: string;
  category: 'introduction' | 'food' | 'restaurants' | 'airport' | 'shops' | 'hotel' | 'directions' | 'emergency';
  categoryLabel: string;
  audioAvailableOffline: boolean;
}

export interface TravelCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  samplePhrase: string;
  phraseCount: number;
  packId: string;
}

export interface PhrasePack {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  phraseCount: number;
  sizeBytes: string;
  phrases: TravelPhrase[];
}

export const CATEGORIES: TravelCategory[] = [
  {
    id: 'introduction',
    label: 'Introduction & Etiquette',
    icon: '👋',
    description: 'Polite greetings, introductions, saying thank you, and asking if English is spoken.',
    samplePhrase: '初めまして (Nice to meet you)',
    phraseCount: 5,
    packId: 'pack_intro'
  },
  {
    id: 'food',
    label: 'Food & Street Snacks',
    icon: '🍙',
    description: 'Asking for water, identifying dishes, asking about ingredients & allergies.',
    samplePhrase: '水をください (Water, please)',
    phraseCount: 5,
    packId: 'pack_food'
  },
  {
    id: 'restaurants',
    label: 'Restaurants & Dining',
    icon: '🍜',
    description: 'Requesting menus, chef recommendations, paying the bill & tipping etiquette.',
    samplePhrase: 'メニューをお願いします (Menu, please)',
    phraseCount: 5,
    packId: 'pack_dining'
  },
  {
    id: 'airport',
    label: 'Airport & Flight Gates',
    icon: '✈️',
    description: 'Boarding gate directions, baggage claim, customs, and airport taxi pickup.',
    samplePhrase: '搭乗口はどこですか？ (Where is boarding gate?)',
    phraseCount: 5,
    packId: 'pack_airport'
  },
  {
    id: 'shops',
    label: 'Shops & Tax-Free Paying',
    icon: '🛍️',
    description: 'Inquiring prices, tax-free discounts, paying by card, and declined bags.',
    samplePhrase: 'これはいくらですか？ (How much is this?)',
    phraseCount: 5,
    packId: 'pack_shopping'
  },
  {
    id: 'hotel',
    label: 'Hotel & Luggage Stay',
    icon: '🏨',
    description: 'Check-in procedures, holding luggage before flight, and Wi-Fi credentials.',
    samplePhrase: '予約しています (I have a reservation)',
    phraseCount: 4,
    packId: 'pack_hotel'
  },
  {
    id: 'directions',
    label: 'Directions & Subway',
    icon: '🗺️',
    description: 'Finding restrooms, train platforms, ticket gates, and asking for directions.',
    samplePhrase: '駅はどこですか？ (Where is train station?)',
    phraseCount: 5,
    packId: 'pack_directions'
  },
  {
    id: 'emergency',
    label: 'Emergency & Police Help',
    icon: '🚨',
    description: 'Immediate help, police box (Koban), lost passports, and hospital visits.',
    samplePhrase: '助けてください！ (Please help me!)',
    phraseCount: 5,
    packId: 'pack_emergency'
  },
];

export const TRAVEL_PHRASES: TravelPhrase[] = [
  // ── Introduction & Basics ────────────────────────
  {
    id: 'tp_intro_1',
    text: 'Hajimemashite (初めまして)',
    translation: 'Nice to meet you',
    pronunciation: 'hah-jee-meh-mahsh-teh',
    category: 'introduction',
    categoryLabel: 'Introduction',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_intro_2',
    text: 'Konnichiwa (こんにちは)',
    translation: 'Hello / Good afternoon',
    pronunciation: 'kohn-nee-chee-wah',
    category: 'introduction',
    categoryLabel: 'Introduction',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_intro_3',
    text: 'Arigatou gozaimasu (ありがとうございます)',
    translation: 'Thank you very much',
    pronunciation: 'ah-ree-gah-toh goh-zah-ee-mahs',
    category: 'introduction',
    categoryLabel: 'Introduction',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_intro_4',
    text: 'Sumimasen (すみません)',
    translation: 'Excuse me / Pardon me',
    pronunciation: 'soo-mee-mah-sehn',
    category: 'introduction',
    categoryLabel: 'Introduction',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_intro_5',
    text: 'Eigo ga hanasemasu ka? (英語が話せますか？)',
    translation: 'Do you speak English?',
    pronunciation: 'ay-goh gah hah-nah-seh-mahs ka',
    category: 'introduction',
    categoryLabel: 'Introduction',
    audioAvailableOffline: true,
  },

  // ── Food & Drinks ────────────────────────────────
  {
    id: 'tp_food_1',
    text: 'Mizu o kudasai (水をください)',
    translation: 'Water, please',
    pronunciation: 'mee-zoo oh koo-dah-sah-ee',
    category: 'food',
    categoryLabel: 'Food & Drinks',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_food_2',
    text: 'Kore wa nan desu ka? (これは何ですか？)',
    translation: 'What is this food / item?',
    pronunciation: 'koh-reh wa nahn des-ka',
    category: 'food',
    categoryLabel: 'Food & Drinks',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_food_3',
    text: 'Oishii desu! (美味しいです！)',
    translation: 'It is delicious!',
    pronunciation: 'oy-shee des',
    category: 'food',
    categoryLabel: 'Food & Drinks',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_food_4',
    text: 'Aregii ga arimasu (アレルギーがあります)',
    translation: 'I have food allergies',
    pronunciation: 'ah-reh-gee gah ah-ree-mahs',
    category: 'food',
    categoryLabel: 'Food & Drinks',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_food_5',
    text: 'Itadakimasu (いただきます)',
    translation: 'Thank you for the meal (said before eating)',
    pronunciation: 'ee-tah-dah-kee-mahs',
    category: 'food',
    categoryLabel: 'Food & Drinks',
    audioAvailableOffline: true,
  },

  // ── Restaurants ──────────────────────────────────
  {
    id: 'tp_rest_1',
    text: 'Menyuu o onegaishimasu (メニューをお願いします)',
    translation: 'Menu, please',
    pronunciation: 'meh-nyoo oh oh-neh-gah-ee-shee-mahs',
    category: 'restaurants',
    categoryLabel: 'Restaurants',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_rest_2',
    text: 'Osusume wa nan desu ka? (おすすめは何ですか？)',
    translation: 'What do you recommend?',
    pronunciation: 'oh-soo-soo-meh wa nahn des-ka',
    category: 'restaurants',
    categoryLabel: 'Restaurants',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_rest_3',
    text: 'Okaikei o onegaishimasu (お会計をお願いします)',
    translation: 'The bill / check, please',
    pronunciation: 'oh-kah-ee-keh-ee oh oh-neh-gah-ee-shee-mahs',
    category: 'restaurants',
    categoryLabel: 'Restaurants',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_rest_4',
    text: 'Futari desu (二人です)',
    translation: 'Table for two people, please',
    pronunciation: 'foo-tah-ree des',
    category: 'restaurants',
    categoryLabel: 'Restaurants',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_rest_5',
    text: 'Gochisousama deshita (ごちそうさまでした)',
    translation: 'Thank you for the meal (said after eating)',
    pronunciation: 'goh-chee-soh-sah-mah dehsh-tah',
    category: 'restaurants',
    categoryLabel: 'Restaurants',
    audioAvailableOffline: true,
  },

  // ── Airport & Flight ─────────────────────────────
  {
    id: 'tp_air_1',
    text: 'Toujouguchi wa doko desu ka? (搭乗口はどこですか？)',
    translation: 'Where is the boarding gate?',
    pronunciation: 'toh-joh-goo-chee wa doh-koh des-ka',
    category: 'airport',
    categoryLabel: 'Airport & Flight',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_air_2',
    text: 'Nimotsu uketorijo wa doko desu ka? (荷物受取所はどこですか？)',
    translation: 'Where is the baggage claim area?',
    pronunciation: 'nee-moh-tsoo oo-keh-toh-ree-joh wa doh-koh des-ka',
    category: 'airport',
    categoryLabel: 'Airport & Flight',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_air_3',
    text: 'Takushii noriba wa doko desu ka? (タクシー乗り場はどこですか？)',
    translation: 'Where is the taxi stand?',
    pronunciation: 'tah-koo-shee noh-ree-bah wa doh-koh des-ka',
    category: 'airport',
    categoryLabel: 'Airport & Flight',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_air_4',
    text: 'Kankou de kimashita (観光で来ました)',
    translation: 'I am here for tourism / vacation',
    pronunciation: 'kahn-koh deh kee-mahsh-tah',
    category: 'airport',
    categoryLabel: 'Airport & Flight',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_air_5',
    text: 'Ryougaejo wa doko desu ka? (両替所はどこですか？)',
    translation: 'Where is currency exchange?',
    pronunciation: 'ryoh-gah-eh-joh wa doh-koh des-ka',
    category: 'airport',
    categoryLabel: 'Airport & Flight',
    audioAvailableOffline: true,
  },

  // ── Shops & Paying ───────────────────────────────
  {
    id: 'tp_shop_1',
    text: 'Kore wa ikura desu ka? (これはいくらですか？)',
    translation: 'How much is this?',
    pronunciation: 'koh-reh wa ee-koo-rah des-ka',
    category: 'shops',
    categoryLabel: 'Shops & Paying',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_shop_2',
    text: 'Kurejitto kaado wa tsukaemasu ka? (クレジットカードは使えますか？)',
    translation: 'Can I pay with a credit card?',
    pronunciation: 'koo-reh-jit-toh kah-doh wa tsoo-kah-eh-mahs ka',
    category: 'shops',
    categoryLabel: 'Shops & Paying',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_shop_3',
    text: 'Menzei ni dekimasu ka? (免税にできますか？)',
    translation: 'Can this be tax-free?',
    pronunciation: 'mehn-zeh-ee nee deh-kee-mahs ka',
    category: 'shops',
    categoryLabel: 'Shops & Paying',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_shop_4',
    text: 'Fukuro wa irimasen (袋はいりません)',
    translation: 'I do not need a shopping bag',
    pronunciation: 'foo-koo-roh wa ee-ree-mah-sehn',
    category: 'shops',
    categoryLabel: 'Shops & Paying',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_shop_5',
    text: 'Kore o kudasai (これをください)',
    translation: 'I will take this one, please',
    pronunciation: 'koh-reh oh koo-dah-sah-ee',
    category: 'shops',
    categoryLabel: 'Shops & Paying',
    audioAvailableOffline: true,
  },

  // ── Hotel & Stay ─────────────────────────────────
  {
    id: 'tp_hotel_1',
    text: 'Yoyaku shiteimasu (予約しています)',
    translation: 'I have a hotel reservation',
    pronunciation: 'yoh-yah-koo shee-teh-ee-mahs',
    category: 'hotel',
    categoryLabel: 'Hotel & Stay',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_hotel_2',
    text: 'Wi-Fi no pasuwaado wa nan desu ka? (Wi-Fiのパスワードは何ですか？)',
    translation: 'What is the Wi-Fi password?',
    pronunciation: 'wah-ee-fah-ee noh pah-soo-wah-doh wa nahn des-ka',
    category: 'hotel',
    categoryLabel: 'Hotel & Stay',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_hotel_3',
    text: 'Nimotsu o azukatte itadakemasu ka? (荷物を預かっていただけますか？)',
    translation: 'Could you hold my luggage before check-in?',
    pronunciation: 'nee-moh-tsoo oh ah-zoo-kaht-teh ee-tah-dah-keh-mahs ka',
    category: 'hotel',
    categoryLabel: 'Hotel & Stay',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_hotel_4',
    text: 'Chekkuauto wa nan-ji desu ka? (チェックアウトは何時ですか？)',
    translation: 'What time is check-out?',
    pronunciation: 'chehk-koo-ow-toh wa nahn-jee des-ka',
    category: 'hotel',
    categoryLabel: 'Hotel & Stay',
    audioAvailableOffline: true,
  },

  // ── Directions ───────────────────────────────────
  {
    id: 'tp_dir_1',
    text: 'Toire wa doko desu ka? (トイレはどこですか？)',
    translation: 'Where is the restroom / toilet?',
    pronunciation: 'toy-reh wa doh-koh des-ka',
    category: 'directions',
    categoryLabel: 'Directions',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_dir_2',
    text: 'Eki wa doko desu ka? (駅はどこですか？)',
    translation: 'Where is the train station?',
    pronunciation: 'eh-kee wa doh-koh des-ka',
    category: 'directions',
    categoryLabel: 'Directions',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_dir_3',
    text: 'Chikatetsu no noriba wa doko desu ka? (地下鉄の乗り場はどこですか？)',
    translation: 'Where is the subway entrance?',
    pronunciation: 'chee-kah-teht-soo noh noh-ree-bah wa doh-koh des-ka',
    category: 'directions',
    categoryLabel: 'Directions',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_dir_4',
    text: 'Koko wa doko desu ka? (ここはどこですか？)',
    translation: 'Where am I on the map?',
    pronunciation: 'koh-koh wa doh-koh des-ka',
    category: 'directions',
    categoryLabel: 'Directions',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_dir_5',
    text: 'Massugu itte kudasai (まっすぐ行ってください)',
    translation: 'Go straight ahead, please',
    pronunciation: 'mahs-soo-goo eet-teh koo-dah-sah-ee',
    category: 'directions',
    categoryLabel: 'Directions',
    audioAvailableOffline: true,
  },

  // ── Emergency ────────────────────────────────────
  {
    id: 'tp_em_1',
    text: 'Tasukete kudasai! (助けてください！)',
    translation: 'Please help me!',
    pronunciation: 'tah-soo-keh-teh koo-dah-sah-ee',
    category: 'emergency',
    categoryLabel: 'Emergency',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_em_2',
    text: 'Pasupooto o nakushimashita (パスポートを無くしました)',
    translation: 'I lost my passport',
    pronunciation: 'pah-soo-poh-toh oh nah-koo-shee-mahsh-tah',
    category: 'emergency',
    categoryLabel: 'Emergency',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_em_3',
    text: 'Kouban wa doko desu ka? (交番はどこですか？)',
    translation: 'Where is the police box (Koban)?',
    pronunciation: 'koh-bahn wa doh-koh des-ka',
    category: 'emergency',
    categoryLabel: 'Emergency',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_em_4',
    text: 'Byouin ni ikitai desu (病院に行きたいです)',
    translation: 'I need to go to a hospital / clinic',
    pronunciation: 'byoh-een nee ee-kee-tah-ee des',
    category: 'emergency',
    categoryLabel: 'Emergency',
    audioAvailableOffline: true,
  },
  {
    id: 'tp_em_5',
    text: 'Kyuukyuusha o yonde kudasai (救急車を呼んでください)',
    translation: 'Please call an ambulance (119)',
    pronunciation: 'kyoo-kyoo-shah oh yohn-deh koo-dah-sah-ee',
    category: 'emergency',
    categoryLabel: 'Emergency',
    audioAvailableOffline: true,
  },
];

export const PHRASE_PACKS: PhrasePack[] = [
  {
    id: 'pack_intro',
    title: 'Introduction & Greetings',
    category: 'introduction',
    description: 'Greetings, introductions, politeness, and English queries.',
    icon: '👋',
    phraseCount: 5,
    sizeBytes: '2.1 MB',
    phrases: TRAVEL_PHRASES.filter(p => p.category === 'introduction')
  },
  {
    id: 'pack_food',
    title: 'Food & Street Snacks',
    category: 'food',
    description: 'Asking for water, ingredient questions, and allergy alerts.',
    icon: '🍙',
    phraseCount: 5,
    sizeBytes: '2.4 MB',
    phrases: TRAVEL_PHRASES.filter(p => p.category === 'food')
  },
  {
    id: 'pack_dining',
    title: 'Restaurant & Dining',
    category: 'restaurants',
    description: 'Menus, recommendations, ordering, and paying the bill.',
    icon: '🍜',
    phraseCount: 5,
    sizeBytes: '2.5 MB',
    phrases: TRAVEL_PHRASES.filter(p => p.category === 'restaurants')
  },
  {
    id: 'pack_airport',
    title: 'Airport & Transit',
    category: 'airport',
    description: 'Gates, baggage claim, taxi stands, and arrival procedures.',
    icon: '✈️',
    phraseCount: 5,
    sizeBytes: '2.8 MB',
    phrases: TRAVEL_PHRASES.filter(p => p.category === 'airport')
  },
  {
    id: 'pack_shopping',
    title: 'Shops & Payments',
    category: 'shops',
    description: 'Inquiring prices, tax-free discounts, cards, and shopping bags.',
    icon: '🛍️',
    phraseCount: 5,
    sizeBytes: '2.2 MB',
    phrases: TRAVEL_PHRASES.filter(p => p.category === 'shops')
  },
  {
    id: 'pack_hotel',
    title: 'Hotel & Lodging',
    category: 'hotel',
    description: 'Check-in, luggage drop, room key, Wi-Fi password.',
    icon: '🏨',
    phraseCount: 4,
    sizeBytes: '1.8 MB',
    phrases: TRAVEL_PHRASES.filter(p => p.category === 'hotel')
  },
  {
    id: 'pack_directions',
    title: 'Directions & Subway',
    category: 'directions',
    description: 'Restrooms, train station platforms, finding locations on a map.',
    icon: '🗺️',
    phraseCount: 5,
    sizeBytes: '1.9 MB',
    phrases: TRAVEL_PHRASES.filter(p => p.category === 'directions')
  },
  {
    id: 'pack_emergency',
    title: 'Emergency & Medical Help',
    category: 'emergency',
    description: 'Urgent assistance, police box, lost passport, hospital.',
    icon: '🚨',
    phraseCount: 5,
    sizeBytes: '2.0 MB',
    phrases: TRAVEL_PHRASES.filter(p => p.category === 'emergency')
  }
];

import { getApiBaseUrl } from './apiConfig';

export const survivalService = {
  getPhrasesByCategory: (categoryId: string): TravelPhrase[] => {
    if (!categoryId || categoryId === 'all') {
      return TRAVEL_PHRASES;
    }
    return TRAVEL_PHRASES.filter(p => p.category === categoryId);
  },

  getCategoryById: (categoryId: string): TravelCategory | undefined => {
    return CATEGORIES.find(c => c.id === categoryId);
  },

  getCategories: () => CATEGORIES,

  fetchCategoriesFromBackend: async (): Promise<TravelCategory[]> => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/phrases/categories`);
      if (res.ok) {
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories)) {
          return data.categories;
        }
      }
    } catch (err) {
      console.log('[SurvivalService] Backend unreachable, using offline packs');
    }
    return CATEGORIES;
  },

  getPacks: (): PhrasePack[] => PHRASE_PACKS,
};

// Aliases for compatibility
export type SurvivalPhrase = TravelPhrase;
export type SurvivalPack = PhrasePack;
export const SURVIVAL_PHRASES = TRAVEL_PHRASES;
export const SURVIVAL_PACKS = PHRASE_PACKS;
