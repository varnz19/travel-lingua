import { getApiBaseUrl } from './apiConfig';

export interface STTOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onStart?: () => void;
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
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
};

class STTService {
  private _isListening: boolean = false;
  private _recognition: any = null;
  private _mediaRecorder: any = null;
  private _audioChunks: Blob[] = [];

  public get isListening(): boolean {
    return this._isListening;
  }

  public getLocale(lang: string = 'ja'): string {
    const code = (lang || 'ja').toLowerCase().trim();
    return LANGUAGE_LOCALE_MAP[code] || (code.includes('-') ? code : `${code}-${code.toUpperCase()}`);
  }

  /**
   * Starts real-time voice speech recognition.
   * Uses browser SpeechRecognition (webkitSpeechRecognition) where available for instant streaming,
   * or falls back to MediaRecorder -> Faster-Whisper backend.
   */
  public async startListening(options: STTOptions = {}): Promise<void> {
    if (this._isListening) {
      await this.stopListening();
    }

    const lang = options.language || 'ja';
    const locale = this.getLocale(lang);

    // 1. Try Browser SpeechRecognition (Web / Mobile Web Chrome, Safari)
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = options.continuous !== undefined ? options.continuous : false;
          recognition.interimResults = options.interimResults !== undefined ? options.interimResults : true;
          recognition.lang = locale;

          recognition.onstart = () => {
            this._isListening = true;
            options.onStart?.();
          };

          recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                final += transcript;
              } else {
                interim += transcript;
              }
            }

            if (interim && options.onInterimResult) {
              options.onInterimResult(interim);
            }
            if (final && options.onFinalResult) {
              options.onFinalResult(final);
            }
          };

          recognition.onerror = (event: any) => {
            // If SpeechRecognition had a network/no-speech issue, notify
            options.onError?.(event.error);
          };

          recognition.onend = () => {
            this._isListening = false;
            this._recognition = null;
            options.onEnd?.();
          };

          this._recognition = recognition;
          recognition.start();
          return;
        } catch (_e) {
          // Fall through to MediaRecorder
        }
      }
    }

    // 2. MediaRecorder fallback to Faster-Whisper backend
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this._audioChunks = [];
        const mediaRecorder = new (window as any).MediaRecorder(stream);
        this._mediaRecorder = mediaRecorder;

        mediaRecorder.ondataavailable = (event: any) => {
          if (event.data && event.data.size > 0) {
            this._audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstart = () => {
          this._isListening = true;
          options.onStart?.();
        };

        mediaRecorder.onstop = async () => {
          this._isListening = false;
          stream.getTracks().forEach((track: any) => track.stop());

          const audioBlob = new Blob(this._audioChunks, { type: 'audio/webm' });
          const base64 = await this._blobToBase64(audioBlob);

          try {
            const result = await this.transcribeAudio(base64, lang);
            if (result && result.text) {
              options.onFinalResult?.(result.text);
            }
          } catch (err) {
            options.onError?.(err);
          } finally {
            options.onEnd?.();
          }
        };

        mediaRecorder.start();
        return;
      } catch (err) {
        this._isListening = false;
        options.onError?.(err);
        options.onEnd?.();
        return;
      }
    }

    options.onError?.(new Error('Speech recognition is not supported in this environment.'));
  }

  /**
   * Stops active speech recognition or audio recording.
   */
  public async stopListening(): Promise<void> {
    if (this._recognition) {
      try {
        this._recognition.stop();
      } catch (_e) {}
      this._recognition = null;
    }

    if (this._mediaRecorder && this._mediaRecorder.state !== 'inactive') {
      try {
        this._mediaRecorder.stop();
      } catch (_e) {}
      this._mediaRecorder = null;
    }

    this._isListening = false;
  }

  /**
   * Sends audio bytes to Faster-Whisper backend endpoint for neural transcription.
   */
  public async transcribeAudio(
    audioBase64: string,
    language: string = 'auto'
  ): Promise<{ text: string; language: string; vad_active: boolean }> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/asr/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_base64: audioBase64,
        language,
      }),
    });

    if (!res.ok) {
      throw new Error(`ASR API error: ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Runs Silero-VAD ONNX check on backend.
   */
  public async detectVoice(audioBase64: string, threshold: number = 0.5): Promise<boolean> {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/asr/detect-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_base64: audioBase64,
          threshold,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return !!data.is_speech;
      }
    } catch (_e) {}
    return false;
  }

  private _blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string) || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const sttService = new STTService();
