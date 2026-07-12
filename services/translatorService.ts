export interface TranslationResult {
  translatedText: string;
  pronunciation?: string;
  source: string;
  target: string;
}

const DICTIONARY: Record<string, Record<string, { trans: string; pron: string }>> = {
  spanish: {
    "hello": { trans: "hola", pron: "OH-lah" },
    "how are you?": { trans: "¿cómo estás?", pron: "KOH-moh ess-TAHS" },
    "water, please": { trans: "agua, por favor", pron: "AH-gwah, por fah-VOR" },
    "thank you": { trans: "gracias", pron: "GRAH-syahs" },
    "goodbye": { trans: "adiós", pron: "ah-DYOHS" },
    "where is the train?": { trans: "¿dónde está el tren?", pron: "DOHN-deh ess-TAH el tren" },
    "menu, please": { trans: "el menú, por favor", pron: "el meh-NOO, por fah-VOR" },
    "i have a reservation": { trans: "tengo una reservación", pron: "TEN-goh OO-nah reh-sehr-bah-SYOHN" }
  },
  french: {
    "hello": { trans: "bonjour", pron: "bohn-zhoor" },
    "how are you?": { trans: "comment ça va?", pron: "koh-mahn sah vah" },
    "water, please": { trans: "de l'eau, s'il vous plaît", pron: "duh loh, seel voo pleh" },
    "thank you": { trans: "merci", pron: "mair-see" },
    "goodbye": { trans: "au revoir", pron: "oh ruh-vwahr" },
    "where is the train?": { trans: "où est le train?", pron: "oo eh luh tran" },
    "menu, please": { trans: "la carte, s'il vous plaît", pron: "lah kart, seel voo pleh" },
    "i have a reservation": { trans: "j'ai une réservation", pron: "zhay oon ray-zair-vah-syohn" }
  },
  japanese: {
    "hello": { trans: "こんにちは (Konnichiwa)", pron: "kohn-nee-chee-wah" },
    "how are you?": { trans: "お元気ですか？ (O-genki desu ka?)", pron: "oh-gehn-kee des-ka" },
    "water, please": { trans: "水をください (Mizu o kudasai)", pron: "mee-zoo oh koo-dah-sah-ee" },
    "thank you": { trans: "ありがとうございます (Arigatou gozaimasu)", pron: "ah-ree-gah-toh goh-zah-ee-mahs" },
    "goodbye": { trans: "さようなら (Sayounara)", pron: "sah-yoh-nah-rah" },
    "where is the train?": { trans: "電車はどこですか？ (Densha wa doko desu ka?)", pron: "dehn-shah wa doh-koh des-ka" },
    "menu, please": { trans: "メニューをお願いします (Menyuu o onegaishimasu)", pron: "meh-nyoo oh oh-neh-gah-ee-shee-mahs" },
    "i have a reservation": { trans: "予約しています (Yoyaku shiteimasu)", pron: "yoh-yah-koo shee-teh-ee-mahs" }
  },
  german: {
    "hello": { trans: "hallo", pron: "HAH-loh" },
    "how are you?": { trans: "wie geht es dir?", pron: "vee gayt es deer" },
    "water, please": { trans: "wasser, bitte", pron: "VAHS-ser, BIT-teh" },
    "thank you": { trans: "danke", pron: "DAHN-keh" },
    "goodbye": { trans: "auf wiedersehen", pron: "owf VEE-der-zayn" },
    "where is the train?": { trans: "wo ist der zug?", pron: "voh ist dare tsoog" },
    "menu, please": { trans: "die speisekarte, bitte", pron: "dee SHPY-zeh-kar-teh, BIT-teh" },
    "i have a reservation": { trans: "ich habe eine reservierung", pron: "ikh HAH-beh EYE-neh reh-zair-VEE-roong" }
  },
  italian: {
    "hello": { trans: "ciao", pron: "chow" },
    "how are you?": { trans: "come stai?", pron: "KOH-meh sty" },
    "water, please": { trans: "acqua, per favore", pron: "AH-kwah, pehr fah-VOR-eh" },
    "thank you": { trans: "grazie", pron: "GRAHT-tsyeh" },
    "goodbye": { trans: "arrivederci", pron: "ah-ree-veh-DAIR-chee" },
    "where is the train?": { trans: "dov'è il treno?", pron: "doh-VEH eel TREH-noh" },
    "menu, please": { trans: "il menu, per favore", pron: "eel meh-NOO, pehr fah-VOR-eh" },
    "i have a reservation": { trans: "ho una prenotazione", pron: "oh OO-nah preh-noh-tah-TSYOH-neh" }
  }
};

export const translatorService = {
  translate: async (text: string, source: string, target: string): Promise<TranslationResult> => {
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 300));

    const cleanText = text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
    const langKey = target.toLowerCase();
    const sourceKey = source.toLowerCase();

    // Check if target translation exists in our mock dictionary
    if (DICTIONARY[langKey] && DICTIONARY[langKey][cleanText]) {
      const match = DICTIONARY[langKey][cleanText];
      return {
        translatedText: match.trans,
        pronunciation: match.pron,
        source,
        target
      };
    }

    // Dynamic mock translation for demo purposes
    let transText = `[${target}] ${text}`;
    if (langKey === 'spanish') {
      transText = text + "o";
    } else if (langKey === 'french') {
      transText = "Le " + text;
    } else if (langKey === 'japanese') {
      transText = text + " です";
    }

    return {
      translatedText: transText,
      pronunciation: `Phonetics for: ${text}`,
      source,
      target
    };
  }
};
