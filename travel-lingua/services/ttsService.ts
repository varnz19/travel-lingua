import * as Speech from 'expo-speech';
import { getApiBaseUrl } from './apiConfig';

export interface TTSOptions {
  language?: string;
  rate?: number; // 0.5 to 1.5
  pitch?: number;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: any) => void;
  useBackend?: boolean;
}

const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  ja: 'ja-JP',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  ko: 'ko-KR',
  zh: 'zh-CN',
  pt: 'pt-BR',
  ru: 'ru-RU',
};

class TTSService {
  private _isSpeaking: boolean = false;
  private _currentAudio: HTMLAudioElement | null = null;

  public get isSpeaking(): boolean {
    return this._isSpeaking;
  }

  /**
   * Cleans text before vocalization (removes Romaji annotations, brackets, parentheticals)
   * Example: "トイレはどこですか？ (Toire wa doko desu ka?)" -> "トイレはどこですか？"
   */
  public cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/（.*?）/g, '')
      .replace(/【.*?】/g, '')
      .trim();
  }

  /**
   * Resolves language code to BCP-47 locale tag
   */
  public getLocale(lang: string = 'ja'): string {
    const code = (lang || 'ja').toLowerCase().trim();
    return LANGUAGE_LOCALE_MAP[code] || (code.includes('-') ? code : `${code}-${code.toUpperCase()}`);
  }

  /**
   * Generates direct streaming URL from the FastAPI backend TTS endpoint.
   */
  public getAudioStreamUrl(text: string, lang: string = 'ja', speed: number = 1.0): string {
    const baseUrl = getApiBaseUrl();
    const clean = this.cleanText(text);
    return `${baseUrl}/api/v1/tts/stream?text=${encodeURIComponent(clean)}&language=${encodeURIComponent(lang)}&speed=${speed}`;
  }

  /**
   * Automatically determines whether text is Japanese, English, or other language
   * based on unicode character ranges to prevent English speech engines from reading Japanese phonetics.
   */
  public detectLanguageFromText(text: string, fallbackLang: string = 'ja'): string {
    if (!text) return fallbackLang;
    // Check Japanese Kana and Kanji (Hiragana \u3040-\u309F, Katakana \u30A0-\u30FF, CJK Unified \u4E00-\u9FFF)
    const hasJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
    if (hasJapanese) return 'ja';

    // If text consists of standard Latin alphabet and English words
    const isPureLatin = /^[A-Za-z0-9\s.,'?!/()\-]+$/.test(text.trim());
    if (isPureLatin && fallbackLang === 'ja') {
      return 'en';
    }

    return fallbackLang;
  }

  /**
   * Speaks the given text using neural backend streaming (Edge-TTS) or high-quality native voice.
   */
  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    const clean = this.cleanText(text);
    if (!clean) return;

    // Correctly resolve language from text content to prevent voice mismatch
    const requestedLang = options.language || 'ja';
    const lang = this.detectLanguageFromText(clean, requestedLang);
    const rate = options.rate !== undefined ? options.rate : 0.95;
    const pitch = options.pitch !== undefined ? options.pitch : 1.0;

    // Stop previous speech if any
    await this.stop();

    this._isSpeaking = true;
    options.onStart?.();

    // Default to Neural Backend (Edge-TTS Microsoft voices: ja-JP-NanamiNeural / en-US-JennyNeural)
    if (options.useBackend !== false && typeof Audio !== 'undefined') {
      try {
        const streamUrl = this.getAudioStreamUrl(clean, lang, rate);
        const audio = new Audio(streamUrl);
        this._currentAudio = audio;

        audio.onended = () => {
          this._isSpeaking = false;
          this._currentAudio = null;
          options.onDone?.();
        };

        audio.onerror = () => {
          this._currentAudio = null;
          // Fallback to native speech
          this._speakNative(clean, lang, rate, pitch, options);
        };

        await audio.play();
        return;
      } catch (_e) {
        // Fallback to native speech
        this._speakNative(clean, lang, rate, pitch, options);
        return;
      }
    }

    this._speakNative(clean, lang, rate, pitch, options);
  }

  private _speakNative(
    clean: string,
    lang: string,
    rate: number,
    pitch: number,
    options: TTSOptions
  ): void {
    const locale = this.getLocale(lang);

    // Browser Web Speech API specialized voice selection
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = locale;
        utter.rate = rate;
        utter.pitch = pitch;

        const voices = window.speechSynthesis.getVoices();
        const prefix = lang.toLowerCase();
        const matched = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
        if (matched) {
          utter.voice = matched;
        }

        utter.onend = () => {
          this._isSpeaking = false;
          options.onDone?.();
        };
        utter.onerror = (err) => {
          this._isSpeaking = false;
          options.onError?.(err);
        };

        window.speechSynthesis.speak(utter);
        return;
      } catch (_err) {
        // Fallback to expo-speech
      }
    }

    try {
      Speech.speak(clean, {
        language: locale,
        rate,
        pitch,
        onDone: () => {
          this._isSpeaking = false;
          options.onDone?.();
        },
        onStopped: () => {
          this._isSpeaking = false;
          options.onStopped?.();
        },
        onError: (err) => {
          this._isSpeaking = false;
          options.onError?.(err);
        },
      });
    } catch (err) {
      this._isSpeaking = false;
      options.onError?.(err);
    }
  }

  /**
   * Stops active speech immediately across both native speech and audio element.
   */
  public async stop(): Promise<void> {
    try {
      if (this._currentAudio) {
        this._currentAudio.pause();
        this._currentAudio.currentTime = 0;
        this._currentAudio = null;
      }
      await Speech.stop();
    } catch (_e) {
      // ignore
    } finally {
      this._isSpeaking = false;
    }
  }

  /**
   * Synthesizes audio bytes via backend API (returns base64 WAV string with Redis caching).
   */
  public async fetchBackendAudioBase64(text: string, lang: string = 'ja', speed: number = 1.0): Promise<string | null> {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/tts/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: this.cleanText(text),
          language: lang,
          speed,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.audio_base64 || null;
      }
    } catch (_err) {
      // fallback
    }
    return null;
  }
}

export const ttsService = new TTSService();

