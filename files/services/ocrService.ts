/**
 * ocrService.ts — Camera/Image OCR Translation Service
 *
 * SAMPLE IMPLEMENTATION: This module provides the full UI contract for OCR text
 * extraction from camera-captured or gallery-selected images. The actual text
 * recognition is SIMULATED for this pass — see the `extractTextFromImage()`
 * function body for where to plug in a real OCR backend.
 *
 * UPGRADE PATHS (noted in code comments):
 * 1. Google Cloud Vision API — cloud-based, requires API key + network.
 * 2. expo-text-recognition / ML Kit — on-device, works offline once installed.
 *
 * The UI clearly badges each OCR result as "Required Network" or "Offline Capable"
 * to maintain the app's offline-honesty rule.
 */

export interface OCRResult {
  /** The extracted text from the image */
  extractedText: string;
  /** Confidence score 0-100 (simulated) */
  confidence: number;
  /** Whether this scan required network (cloud OCR) or worked offline (on-device) */
  requiresNetwork: boolean;
  /** Human-readable label for the OCR method used */
  method: 'Cloud Vision API' | 'On-Device ML Kit' | 'Simulated (Sample)';
  /** Detected language of the extracted text (ISO code) */
  detectedLanguage: string;
  /** Bounding region description (for UI highlight overlay) */
  regionDescription: string;
}

/**
 * Simulated OCR text extraction.
 *
 * PRODUCTION REPLACEMENT:
 * Replace the body of this function with one of:
 *
 * Option A — Google Cloud Vision API (cloud, requires network):
 * ```
 * const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
 * const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     requests: [{
 *       image: { content: base64 },
 *       features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
 *     }]
 *   })
 * });
 * const data = await response.json();
 * const text = data.responses[0]?.fullTextAnnotation?.text || '';
 * ```
 *
 * Option B — expo-text-recognition / ML Kit (on-device, offline):
 * ```
 * import { recognizeText } from 'expo-text-recognition';
 * const result = await recognizeText(imageUri);
 * const text = result.text;
 * ```
 */
export const ocrService = {
  extractTextFromImage: async (imageUri: string): Promise<OCRResult> => {
    // Simulate network latency for a realistic demo feel
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Simulated OCR results based on realistic travel scenarios
    // In production, this would be replaced by actual OCR API calls
    const sampleResults: Array<{ text: string; lang: string; region: string }> = [
      {
        text: 'ラーメン ¥850\nカレーライス ¥750\n餃子 ¥450\nビール ¥500',
        lang: 'ja',
        region: 'Menu board — 4 items detected',
      },
      {
        text: '出口 (Exit)\n↑ 北口 (North Exit)\n← 南口 (South Exit)',
        lang: 'ja',
        region: 'Station signage — 3 lines detected',
      },
      {
        text: 'チェックイン 15:00\nチェックアウト 11:00\nWi-Fi: hotel_guest\nパスワード: room2024',
        lang: 'ja',
        region: 'Hotel information card — 4 lines detected',
      },
      {
        text: '大人 ¥1,200\n子供 ¥600\n営業時間 9:00-17:00',
        lang: 'ja',
        region: 'Ticket pricing sign — 3 lines detected',
      },
      {
        text: '本日のおすすめ\nマグロ刺身 ¥980\n天ぷら盛り合わせ ¥1,100',
        lang: 'ja',
        region: 'Restaurant daily special — 3 lines detected',
      },
    ];

    const picked = sampleResults[Math.floor(Math.random() * sampleResults.length)];

    return {
      extractedText: picked.text,
      confidence: Math.floor(Math.random() * 12) + 88, // 88-99%
      requiresNetwork: true, // Simulated as cloud OCR for honesty
      method: 'Simulated (Sample)',
      detectedLanguage: picked.lang,
      regionDescription: picked.region,
    };
  },
};
