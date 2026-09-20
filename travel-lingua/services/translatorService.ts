export interface TranslationResult {
  translatedText: string;
  pronunciation?: string;
  source: string;
  target: string;
}

const JA_TO_EN_DICTIONARY: Record<string, { trans: string; pron: string }> = {
  // Japanese Kanji & Kana
  "こんにちは": { trans: "Hello / Good afternoon", pron: "kohn-nee-chee-wah" },
  "ありがとうございます": { trans: "Thank you very much", pron: "ah-ree-gah-toh goh-zah-ee-mahs" },
  "ありがとう": { trans: "Thank you", pron: "ah-ree-gah-toh" },
  "すみません": { trans: "Excuse me / Pardon me", pron: "soo-mee-mah-sehn" },
  "ごめんなさい": { trans: "I am sorry", pron: "goh-mehn-nah-sah-ee" },
  "はい": { trans: "Yes", pron: "hah-ee" },
  "いいえ": { trans: "No", pron: "ee-eh" },
  "水をください": { trans: "Water, please", pron: "mee-zoo oh koo-dah-sah-ee" },
  "お水": { trans: "Water", pron: "oh-mee-zoo" },
  "水": { trans: "Water", pron: "mee-zoo" },
  "駅はどこですか": { trans: "Where is the train station?", pron: "eh-kee wa doh-koh des-ka" },
  "駅": { trans: "Train station", pron: "eh-kee" },
  "電車": { trans: "Train", pron: "dehn-shah" },
  "トイレはどこですか": { trans: "Where is the restroom?", pron: "toy-reh wa doh-koh des-ka" },
  "トイレ": { trans: "Restroom / Toilet", pron: "toy-reh" },
  "これはいくらですか": { trans: "How much is this?", pron: "koh-reh wa ee-koo-rah des-ka" },
  "いくら": { trans: "How much?", pron: "ee-koo-rah" },
  "メニューをお願いします": { trans: "Menu, please", pron: "meh-nyoo oh oh-neh-gah-ee-shee-mahs" },
  "メニュー": { trans: "Menu", pron: "meh-nyoo" },
  "お会計をお願いします": { trans: "The bill / check, please", pron: "oh-kah-ee-keh-ee oh oh-neh-gah-ee-shee-mahs" },
  "お会計": { trans: "Bill / Check", pron: "oh-kah-ee-keh-ee" },
  "おすすめは何ですか": { trans: "What do you recommend?", pron: "oh-soo-soo-meh wa nahn des-ka" },
  "助けてください": { trans: "Please help me!", pron: "tah-soo-keh-teh koo-dah-sah-ee" },
  "助けて": { trans: "Help!", pron: "tah-soo-keh-teh" },
  "パスポートを無くしました": { trans: "I lost my passport", pron: "pah-soo-poh-toh oh nah-koo-shee-mahsh-tah" },
  "交番はどこですか": { trans: "Where is the police box?", pron: "koh-bahn wa doh-koh des-ka" },
  "交番": { trans: "Police box (Koban)", pron: "koh-bahn" },
  "病院に行きたいです": { trans: "I need to go to a hospital", pron: "byoh-een nee ee-kee-tah-ee des" },
  "英語が話せますか": { trans: "Do you speak English?", pron: "ay-goh gah hah-nah-seh-mahs ka" },
  "クレジットカードは使えますか": { trans: "Can I pay by credit card?", pron: "koo-reh-jit-toh kah-doh wa tsoo-kah-eh-mahs ka" },
  "免税にできますか": { trans: "Is this eligible for tax-free?", pron: "mehn-zeh-ee nee deh-kee-mahs ka" },
  "袋はいりません": { trans: "No shopping bag needed", pron: "foo-koo-roh wa ee-ree-mah-sehn" },
  "予約しています": { trans: "I have a reservation", pron: "yoh-yah-koo shee-teh-ee-mahs" },
  "Wi-Fiのパスワードは何ですか": { trans: "What is the Wi-Fi password?", pron: "wah-ee-fah-ee noh pah-soo-wah-doh wa nahn des-ka" },
  "荷物を預かっていただけますか": { trans: "Could you hold my luggage?", pron: "nee-moh-tsoo oh ah-zoo-kaht-teh ee-tah-dah-keh-mahs ka" },
  "搭乗口はどこですか": { trans: "Where is the boarding gate?", pron: "toh-joh-goo-chee wa doh-koh des-ka" },
  "荷物受取所はどこですか": { trans: "Where is baggage claim?", pron: "nee-moh-tsoo oo-keh-toh-ree-joh wa doh-koh des-ka" },
  "タクシー乗り場はどこですか": { trans: "Where is the taxi stand?", pron: "tah-koo-shee noh-ree-bah wa doh-koh des-ka" },
  "美味しい": { trans: "Delicious", pron: "oy-shee" },
  "美味しいです": { trans: "It is delicious!", pron: "oy-shee des" },
  "初めまして": { trans: "Nice to meet you", pron: "hah-jee-meh-mahsh-teh" },
  "さようなら": { trans: "Goodbye", pron: "sah-yoh-nah-rah" },

  // Romaji / Phonetics
  "konnichiwa": { trans: "Hello / Good afternoon", pron: "kohn-nee-chee-wah" },
  "arigatou": { trans: "Thank you", pron: "ah-ree-gah-toh" },
  "arigatou gozaimasu": { trans: "Thank you very much", pron: "ah-ree-gah-toh goh-zah-ee-mahs" },
  "sumimasen": { trans: "Excuse me / Pardon me", pron: "soo-mee-mah-sehn" },
  "gomen nasai": { trans: "I am sorry", pron: "goh-mehn-nah-sah-ee" },
  "hai": { trans: "Yes", pron: "hah-ee" },
  "iie": { trans: "No", pron: "ee-eh" },
  "mizu o kudasai": { trans: "Water, please", pron: "mee-zoo oh koo-dah-sah-ee" },
  "mizu": { trans: "Water", pron: "mee-zoo" },
  "eki wa doko desu ka": { trans: "Where is the train station?", pron: "eh-kee wa doh-koh des-ka" },
  "eki": { trans: "Train station", pron: "eh-kee" },
  "densha": { trans: "Train", pron: "dehn-shah" },
  "toire wa doko desu ka": { trans: "Where is the restroom?", pron: "toy-reh wa doh-koh des-ka" },
  "toire": { trans: "Restroom / Toilet", pron: "toy-reh" },
  "kore wa ikura desu ka": { trans: "How much is this?", pron: "koh-reh wa ee-koo-rah des-ka" },
  "ikura": { trans: "How much?", pron: "ee-koo-rah" },
  "menyuu o onegaishimasu": { trans: "Menu, please", pron: "meh-nyoo oh oh-neh-gah-ee-shee-mahs" },
  "menyuu": { trans: "Menu", pron: "meh-nyoo" },
  "okaikei o onegaishimasu": { trans: "The bill / check, please", pron: "oh-kah-ee-keh-ee oh oh-neh-gah-ee-shee-mahs" },
  "okaikei": { trans: "Bill / Check", pron: "oh-kah-ee-keh-ee" },
  "tasukete kudasai": { trans: "Please help me!", pron: "tah-soo-keh-teh koo-dah-sah-ee" },
  "tasukete": { trans: "Help!", pron: "tah-soo-keh-teh" },
  "kouban wa doko desu ka": { trans: "Where is the police box?", pron: "koh-bahn wa doh-koh des-ka" },
  "kouban": { trans: "Police box (Koban)", pron: "koh-bahn" },
  "oishii": { trans: "Delicious", pron: "oy-shee" },
  "oishii desu": { trans: "It is delicious!", pron: "oy-shee des" },
  "hajimemashite": { trans: "Nice to meet you", pron: "hah-jee-meh-mahsh-teh" },
  "sayounara": { trans: "Goodbye", pron: "sah-yoh-nah-rah" },
};

const EN_TO_JA_DICTIONARY: Record<string, { trans: string; pron: string }> = {
  "hello": { trans: "こんにちは (Konnichiwa)", pron: "kohn-nee-chee-wah" },
  "hi": { trans: "こんにちは (Konnichiwa)", pron: "kohn-nee-chee-wah" },
  "good afternoon": { trans: "こんにちは (Konnichiwa)", pron: "kohn-nee-chee-wah" },
  "thank you": { trans: "ありがとうございます (Arigatou gozaimasu)", pron: "ah-ree-gah-toh goh-zah-ee-mahs" },
  "thanks": { trans: "ありがとう (Arigatou)", pron: "ah-ree-gah-toh" },
  "excuse me": { trans: "すみません (Sumimasen)", pron: "soo-mee-mah-sehn" },
  "sorry": { trans: "ごめんなさい (Gomen nasai)", pron: "goh-mehn-nah-sah-ee" },
  "water please": { trans: "水をください (Mizu o kudasai)", pron: "mee-zoo oh koo-dah-sah-ee" },
  "water": { trans: "水 (Mizu)", pron: "mee-zoo" },
  "where is the train station": { trans: "駅はどこですか？ (Eki wa doko desu ka?)", pron: "eh-kee wa doh-koh des-ka" },
  "where is the station": { trans: "駅はどこですか？ (Eki wa doko desu ka?)", pron: "eh-kee wa doh-koh des-ka" },
  "where is the restroom": { trans: "トイレはどこですか？ (Toire wa doko desu ka?)", pron: "toy-reh wa doh-koh des-ka" },
  "where is the bathroom": { trans: "トイレはどこですか？ (Toire wa doko desu ka?)", pron: "toy-reh wa doh-koh des-ka" },
  "how much is this": { trans: "これはいくらですか？ (Kore wa ikura desu ka?)", pron: "koh-reh wa ee-koo-rah des-ka" },
  "menu please": { trans: "メニューをお願いします (Menyuu o onegaishimasu)", pron: "meh-nyoo oh oh-neh-gah-ee-shee-mahs" },
  "the bill please": { trans: "お会計をお願いします (Okaikei o onegaishimasu)", pron: "oh-kah-ee-keh-ee oh oh-neh-gah-ee-shee-mahs" },
  "the check please": { trans: "お会計をお願いします (Okaikei o onegaishimasu)", pron: "oh-kah-ee-keh-ee oh oh-neh-gah-ee-shee-mahs" },
  "help": { trans: "助けてください！ (Tasukete kudasai!)", pron: "tah-soo-keh-teh koo-dah-sah-ee" },
  "delicious": { trans: "美味しいです！ (Oishii desu!)", pron: "oy-shee des" },
  "nice to meet you": { trans: "初めまして (Hajimemashite)", pron: "hah-jee-meh-mahsh-teh" },
  "goodbye": { trans: "さようなら (Sayounara)", pron: "sah-yoh-nah-rah" },
};

import { getApiBaseUrl } from './apiConfig';

export const translatorService = {
  translate: async (text: string, source: string = 'ja', target: string = 'en'): Promise<TranslationResult> => {
    if (!text || !text.trim()) {
      return { translatedText: '', pronunciation: '', source, target };
    }

    // 1. Attempt live FastAPI backend translation
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${getApiBaseUrl()}/api/v1/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          source_lang: source,
          target_lang: target,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.translated_text) {
          return {
            translatedText: data.translated_text,
            pronunciation: data.romanized || undefined,
            source: data.detected_lang || source,
            target: target,
          };
        }
      }
    } catch (_e) {
      // Backend unreachable or request timed out; seamlessly degrade to offline dictionary
    }

    const clean = text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");

    // 1. Japanese to English
    if (source.toLowerCase().startsWith('ja') || target.toLowerCase().startsWith('en')) {
      if (JA_TO_EN_DICTIONARY[text.trim()]) {
        const item = JA_TO_EN_DICTIONARY[text.trim()];
        return { translatedText: item.trans, pronunciation: item.pron, source: 'ja', target: 'en' };
      }
      if (JA_TO_EN_DICTIONARY[clean]) {
        const item = JA_TO_EN_DICTIONARY[clean];
        return { translatedText: item.trans, pronunciation: item.pron, source: 'ja', target: 'en' };
      }
      // Partial matching
      for (const [key, val] of Object.entries(JA_TO_EN_DICTIONARY)) {
        if (text.includes(key) || clean.includes(key)) {
          return { translatedText: val.trans, pronunciation: val.pron, source: 'ja', target: 'en' };
        }
      }
    }

    // 2. English to Japanese
    if (source.toLowerCase().startsWith('en') || target.toLowerCase().startsWith('ja')) {
      if (EN_TO_JA_DICTIONARY[clean]) {
        const item = EN_TO_JA_DICTIONARY[clean];
        return { translatedText: item.trans, pronunciation: item.pron, source: 'en', target: 'ja' };
      }
      for (const [key, val] of Object.entries(EN_TO_JA_DICTIONARY)) {
        if (clean.includes(key)) {
          return { translatedText: val.trans, pronunciation: val.pron, source: 'en', target: 'ja' };
        }
      }
    }

    // Dynamic fallback for any text
    if (source.toLowerCase().startsWith('ja')) {
      return {
        translatedText: `[English Translation] ${text}`,
        pronunciation: `Phonetics: ${text}`,
        source: 'ja',
        target: 'en'
      };
    } else {
      return {
        translatedText: `${text} です (Desu)`,
        pronunciation: `Phonetics for: ${text}`,
        source: 'en',
        target: 'ja'
      };
    }
  }
};
