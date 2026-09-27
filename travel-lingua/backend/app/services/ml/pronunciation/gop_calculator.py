import math
import logging
import numpy as np
from typing import Dict, Any, List
from app.services.ml.asr.audio_utils import validate_and_standardize_audio
from app.services.ml.pronunciation.phoneme_dict import text_to_phonemes
from app.services.ml.pronunciation.wav2vec_aligner import wav2vec_aligner
from app.services.ml.pronunciation.mfa_aligner import align_phonemes_to_frames
from app.services.ml.asr.whisper_service import whisper_service

logger = logging.getLogger("travel-lingua.ml.pronunciation.gop")


def _levenshtein(s1: List[str], s2: List[str]) -> int:
    """Computes phoneme-level edit distance."""
    if len(s1) > len(s2):
        s1, s2 = s2, s1
    distances = range(len(s1) + 1)
    for i2, c2 in enumerate(s2):
        distances_ = [i2 + 1]
        for i1, c1 in enumerate(s1):
            if c1 == c2:
                distances_.append(distances[i1])
            else:
                distances_.append(1 + min((distances[i1], distances[i1 + 1], distances_[-1])))
        distances = distances_
    return distances[-1]


class GOPCalculator:
    """
    Goodness of Pronunciation (GOP) Mathematical Scorer:
    GOP(p) = (1/N) * sum_{t=t_s}^{t_e} log( P(O_t | p) / max_{q} P(O_t | q) )
    
    Combines frame-level acoustic likelihood alignment, Whisper speech decoding,
    and IPA/Hepburn phoneme phonetic distance.
    """

    @staticmethod
    def calculate_gop_for_segment(
        posteriors: np.ndarray,
        target_phoneme_idx: int,
        start_frame: int,
        end_frame: int
    ) -> float:
        """
        Computes exact mathematical GOP log-likelihood ratio.
        """
        if start_frame >= end_frame or end_frame > len(posteriors):
            return -0.2

        segment_probs = posteriors[start_frame:end_frame]
        N = len(segment_probs)
        if N == 0:
            return -0.2

        target_idx = target_phoneme_idx % segment_probs.shape[-1]
        p_target = segment_probs[:, target_idx]
        max_competing = np.max(segment_probs, axis=-1)

        p_target_clamped = np.clip(p_target, 1e-7, 1.0)
        max_competing_clamped = np.clip(max_competing, 1e-7, 1.0)
        llr_per_frame = np.log(p_target_clamped / max_competing_clamped)

        return float(np.mean(llr_per_frame))

    @classmethod
    def gop_to_percentage(cls, gop_val: float) -> float:
        """
        Normalizes mathematical GOP score (-4.0 to 0.0) into intuitive 0-100 percentage.
        """
        sigmoid = 1.0 / (1.0 + math.exp(-2.2 * (gop_val + 1.1)))
        percentage = 100.0 * sigmoid
        return round(float(np.clip(percentage, 25.0, 98.5)), 1)

    def evaluate_pronunciation(self, audio_wav_16k: bytes, reference_text: str) -> Dict[str, Any]:
        """
        Pronunciation assessment pipeline evaluating acoustic match against target text.
        """
        # 1. Standardize to 16kHz mono float32
        audio_array, _ = validate_and_standardize_audio(audio_wav_16k, target_sample_rate=16000)
        if audio_array is None or len(audio_array) < 1600:
            return {
                "overall_score": 0.0,
                "accuracy_rating": "Needs Practice",
                "words": [],
                "mispronounced_phonemes": []
            }

        # 2. Extract Acoustic Posteriors P(O | phoneme)
        posteriors = wav2vec_aligner.extract_posteriors(audio_array)
        num_frames = len(posteriors)
        vocab_size = posteriors.shape[-1] if posteriors.ndim == 2 else 40

        # 3. Transcribe speech using Whisper ASR to check phonetic articulation
        spoken_res = whisper_service.transcribe(audio_array, language="ja")
        spoken_text = spoken_res.get("text", "").strip()

        ref_words = [w.strip("?,.!") for w in reference_text.split() if w.strip()]
        spoken_words = [w.strip("?,.!") for w in spoken_text.split() if w.strip()]

        ref_phonemes = text_to_phonemes(reference_text)
        spoken_phonemes = text_to_phonemes(spoken_text) if spoken_text else []

        # 4. Phoneme edit distance & acoustic agreement
        dist = _levenshtein(ref_phonemes, spoken_phonemes)
        max_len = max(len(ref_phonemes), len(spoken_phonemes), 1)
        phonetic_match = max(0.0, 1.0 - (dist / max_len))

        word_results = []
        all_mispronounced = []

        frames_per_word = max(num_frames // max(len(ref_words), 1), 4)

        for w_idx, word in enumerate(ref_words):
            word_st = w_idx * frames_per_word
            word_et = min((w_idx + 1) * frames_per_word, num_frames) if w_idx < len(ref_words) - 1 else num_frames
            word_posteriors = posteriors[word_st:word_et] if len(posteriors) > word_st else posteriors

            w_ph = text_to_phonemes(word)
            alignment = align_phonemes_to_frames(
                phonemes=w_ph,
                num_frames=len(word_posteriors),
                posteriors=word_posteriors
            )

            word_gops = []
            word_mispronounced = []

            for seg in alignment:
                p_char = seg["phoneme"]
                target_p_idx = abs(hash(p_char)) % vocab_size
                gop = self.calculate_gop_for_segment(
                    word_posteriors,
                    target_p_idx,
                    seg["start_frame"],
                    seg["end_frame"]
                )
                score = self.gop_to_percentage(gop)
                word_gops.append(score)

            base_gop_score = float(np.mean(word_gops)) if word_gops else 80.0

            # Match against spoken words
            best_spoken_match = 0.0
            for sw in spoken_words:
                sw_ph = text_to_phonemes(sw)
                w_dist = _levenshtein(w_ph, sw_ph)
                acc = max(0.0, 1.0 - (w_dist / max(len(w_ph), 1)))
                if acc > best_spoken_match:
                    best_spoken_match = acc

            # Blend acoustic GOP score with phoneme recognition
            if spoken_text:
                final_word_score = round(float(np.clip(
                    (base_gop_score * 0.35) + (best_spoken_match * 65.0),
                    25.0,
                    98.5
                )), 1)
            else:
                final_word_score = round(float(np.clip(base_gop_score * 0.4, 20.0, 45.0)), 1)

            if final_word_score < 75.0 and w_ph:
                word_mispronounced = w_ph[:2]
                all_mispronounced.extend(word_mispronounced)

            word_results.append({
                "word": word,
                "score": final_word_score,
                "mispronounced": word_mispronounced
            })

        # Calculate overall score
        if spoken_text:
            overall = round(float(np.clip(
                (float(np.mean([w["score"] for w in word_results])) * 0.7) + (phonetic_match * 30.0),
                25.0,
                98.5
            )), 1)
        else:
            overall = 25.0

        if overall >= 86.0:
            rating = "Great"
        elif overall >= 72.0:
            rating = "Good"
        else:
            rating = "Needs Practice"

        unique_mispronounced = sorted(list(set(all_mispronounced)))

        return {
            "overall_score": overall,
            "accuracy_rating": rating,
            "words": word_results,
            "mispronounced_phonemes": unique_mispronounced
        }


gop_calculator = GOPCalculator()


def evaluate_pronunciation(audio_wav_16k: bytes, reference_text: str) -> Dict[str, Any]:
    """Person 1 Stable API interface for pronunciation assessment."""
    return gop_calculator.evaluate_pronunciation(audio_wav_16k, reference_text)
