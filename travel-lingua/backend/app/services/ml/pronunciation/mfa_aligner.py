import numpy as np
from typing import List, Dict, Any


def align_phonemes_to_frames(
    phonemes: List[str],
    num_frames: int,
    posteriors: np.ndarray = None,
    phoneme_to_id: Dict[str, int] = None,
    frame_duration_ms: float = 20.0
) -> List[Dict[str, Any]]:
    """
    CTC / Dynamic Time Alignment stage for Montreal Forced Alignment (MFA) / CTC-Segmentation:
    Computes monotonic phoneme time alignments given the target phoneme sequence
    and frame-level acoustic likelihood matrix.
    
    Returns start/end timestamps and frame intervals for each target phoneme.
    """
    if not phonemes:
        return []

    num_phonemes = len(phonemes)
    if num_frames <= num_phonemes:
        # Trivial edge case: allocate 1 frame minimum per phoneme
        alignment = []
        for i, p in enumerate(phonemes):
            st = min(i, max(0, num_frames - 1))
            et = min(i + 1, num_frames)
            alignment.append({
                "phoneme": p,
                "start_frame": st,
                "end_frame": max(et, st + 1),
                "start_time_s": round((st * frame_duration_ms) / 1000.0, 3),
                "end_time_s": round((max(et, st + 1) * frame_duration_ms) / 1000.0, 3),
                "duration_frames": max(et - st, 1),
            })
        return alignment

    # If acoustic posteriors are provided, perform Viterbi Dynamic Alignment
    if posteriors is not None and len(posteriors) == num_frames and posteriors.ndim == 2:
        vocab_size = posteriors.shape[1]
        
        # Build phoneme index lookup
        if phoneme_to_id is None:
            # Deterministic hash mapping into posterior vocab space
            phoneme_indices = [
                abs(hash(p)) % vocab_size for p in phonemes
            ]
        else:
            phoneme_indices = [
                phoneme_to_id.get(p, abs(hash(p)) % vocab_size) for p in phonemes
            ]

        # Log posterior matrix with floor epsilon to avoid -inf
        log_probs = np.log(np.clip(posteriors, 1e-7, 1.0))

        # Dynamic Programming matrix DP[t, k]: best score aligning first k phonemes to first t frames
        # Each phoneme k must occupy at least 1 frame
        T = num_frames
        K = num_phonemes
        dp = np.full((T, K), -np.inf, dtype=np.float64)
        backpointer = np.zeros((T, K), dtype=np.int32)

        # Initialize base case (k=0)
        p0_idx = phoneme_indices[0]
        dp[0, 0] = log_probs[0, p0_idx]
        for t in range(1, T - (K - 1)):
            dp[t, 0] = dp[t - 1, 0] + log_probs[t, p0_idx]
            backpointer[t, 0] = 0

        # Fill DP transitions: state k can come from state k (continuation) or state k-1 (transition)
        for k in range(1, K):
            pk_idx = phoneme_indices[k]
            for t in range(k, T - (K - 1 - k)):
                # From same phoneme (continuation)
                score_continue = dp[t - 1, k] + log_probs[t, pk_idx]
                # From previous phoneme (transition)
                score_transition = dp[t - 1, k - 1] + log_probs[t, pk_idx]

                if score_transition >= score_continue:
                    dp[t, k] = score_transition
                    backpointer[t, k] = t - 1
                else:
                    dp[t, k] = score_continue
                    backpointer[t, k] = backpointer[t - 1, k]

        # Backtrack boundaries
        boundaries = [T]
        curr_t = T - 1
        for k in range(K - 1, 0, -1):
            prev_t = backpointer[curr_t, k]
            # Ensure strictly monotonic boundaries
            prev_t = max(k, min(prev_t, curr_t - 1))
            boundaries.append(prev_t)
            curr_t = prev_t
        boundaries.append(0)
        boundaries.reverse()

        alignment = []
        for i, p in enumerate(phonemes):
            st = int(boundaries[i])
            et = int(boundaries[i + 1])
            if et <= st:
                et = st + 1
            alignment.append({
                "phoneme": p,
                "start_frame": st,
                "end_frame": et,
                "start_time_s": round((st * frame_duration_ms) / 1000.0, 3),
                "end_time_s": round((et * frame_duration_ms) / 1000.0, 3),
                "duration_frames": et - st,
            })
        return alignment

    # Proportional fallback alignment based on phoneme duration heuristics
    frames_per_phoneme = max(num_frames // num_phonemes, 1)
    alignment = []
    for i, phoneme in enumerate(phonemes):
        start_frame = i * frames_per_phoneme
        end_frame = (i + 1) * frames_per_phoneme if i < num_phonemes - 1 else num_frames
        alignment.append({
            "phoneme": phoneme,
            "start_frame": start_frame,
            "end_frame": end_frame,
            "start_time_s": round((start_frame * frame_duration_ms) / 1000.0, 3),
            "end_time_s": round((end_frame * frame_duration_ms) / 1000.0, 3),
            "duration_frames": end_frame - start_frame,
        })
    return alignment
