from typing import List, Dict, Any


def align_phonemes_to_frames(phonemes: List[str], num_frames: int) -> List[Dict[str, Any]]:
    """
    CTC / MFA alignment stage:
    Determines start and end timestamp frame intervals for each target phoneme.
    """
    if not phonemes:
        return []

    frames_per_phoneme = max(num_frames // len(phonemes), 1)
    alignment = []

    for i, phoneme in enumerate(phonemes):
        start_frame = i * frames_per_phoneme
        end_frame = (i + 1) * frames_per_phoneme if i < len(phonemes) - 1 else num_frames
        alignment.append({
            "phoneme": phoneme,
            "start_frame": start_frame,
            "end_frame": end_frame,
            "duration_frames": end_frame - start_frame
        })

    return alignment
