/**
 * ocrService.ts — Camera/Image OCR Translation Service
 *
 * Provides real OCR text extraction from camera-captured or gallery-selected images
 * using the backend Tesseract / Vision ML OCR pipeline with automated translation.
 */

import { getApiBaseUrl } from './apiConfig';

export interface OCRResult {
  /** The extracted text from the image */
  extractedText: string;
  /** Automated translation of the extracted text */
  translatedText?: string;
  /** Confidence score 0-100 */
  confidence: number;
  /** Whether this scan required network or worked offline */
  requiresNetwork: boolean;
  /** Human-readable label for the OCR method used */
  method: string;
  /** Detected language of the extracted text (ISO code) */
  detectedLanguage: string;
  /** Bounding region description (for UI highlight overlay) */
  regionDescription: string;
}

export const ocrService = {
  extractTextFromImage: async (imageUri: string): Promise<OCRResult> => {
    // 1. Attempt Live Backend OCR Endpoint
    const baseUrl = getApiBaseUrl();
    const formData = new FormData();

    try {
      if (imageUri.startsWith('data:') || imageUri.startsWith('blob:') || imageUri.startsWith('http')) {
        const resBlob = await fetch(imageUri);
        const rawBlob = await resBlob.blob();
        const mimeType = rawBlob.type && rawBlob.type.startsWith('image/') ? rawBlob.type : 'image/jpeg';
        const imageBlob = new Blob([rawBlob], { type: mimeType });
        formData.append('file', imageBlob, 'sign_scan.jpg');
      } else {
        formData.append('file', {
          uri: imageUri,
          name: 'sign_scan.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch(`${baseUrl}/api/v1/ocr/extract`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const text = (data?.extracted_text || data?.text || '').trim();
        if (text.length > 0) {
          const orientation = data?.info?.orientation || 'horizontal';
          const lineCount = (text.split('\n').filter(Boolean).length) || 1;
          const engineName = data?.info?.engine || 'Tesseract Vision Engine';
          return {
            extractedText: text,
            translatedText: data?.translated_text || undefined,
            confidence: Math.round(data?.confidence || 92),
            requiresNetwork: true,
            method: engineName,
            detectedLanguage: data?.detected_language || 'ja',
            regionDescription: `Detected ${orientation} signage (${lineCount} line${lineCount === 1 ? '' : 's'})`,
          };
        } else {
          throw new Error('No readable text detected in this image. Please ensure the sign or menu is well-lit and in focus.');
        }
      } else {
        const errJson = await response.json().catch(() => null);
        const errMsg = errJson?.detail || `OCR server error (${response.status})`;
        throw new Error(errMsg);
      }
    } catch (err: any) {
      // Re-throw meaningful user-facing validation/server errors
      if (err?.message && !err.message.includes('Network request failed') && !err.message.includes('fetch')) {
        throw err;
      }
      // If server unreachable, throw connection error
      throw new Error('Could not connect to OCR server. Please verify backend is running on ' + baseUrl);
    }
  },
};
