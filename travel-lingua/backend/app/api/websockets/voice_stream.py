import json
import base64
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.ml.asr.whisper_service import whisper_service
from app.services.translation_service import translation_service

logger = logging.getLogger("travel-lingua.websockets.voice")

router = APIRouter()


@router.websocket("/ws/voice-stream")
async def voice_stream_websocket(websocket: WebSocket):
    """
    Real-time audio streaming gateway endpoint.
    Receives continuous binary or JSON audio chunks from the frontend,
    buffers audio, emits real-time interim transcriptions, and returns
    final speech recognition and translation.
    """
    await websocket.accept()
    logger.info("WebSocket voice stream client connected")

    buffered_bytes = bytearray()
    chunk_count = 0
    language = "ja"

    try:
        while True:
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                logger.info("Client sent disconnect event")
                break

            if "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                    event_type = payload.get("event", "audio_chunk")
                    if "language" in payload:
                        language = payload["language"]

                    if event_type == "start":
                        buffered_bytes.clear()
                        chunk_count = 0
                        await websocket.send_json({
                            "status": "listening",
                            "message": "Voice stream initialized"
                        })

                    elif event_type == "stop":
                        # Finalize transcription and translation on accumulated audio
                        final_text = ""
                        final_translation = ""
                        pronunciation = ""

                        if len(buffered_bytes) > 200:
                            try:
                                res = whisper_service.transcribe(bytes(buffered_bytes), language=language)
                                final_text = res.get("text", "").strip()
                            except Exception as e:
                                logger.warning(f"WebSocket final transcribe error: {e}")

                        if final_text:
                            try:
                                target_lang = "en" if language == "ja" else "ja"
                                tr_res = await translation_service.translate_text(
                                    text=final_text,
                                    source_lang=language,
                                    target_lang=target_lang
                                )
                                final_translation = tr_res.translated_text
                                pronunciation = tr_res.pronunciation or ""
                            except Exception:
                                final_translation = final_text
                        else:
                            final_text = payload.get("text", "")
                            final_translation = payload.get("translation", "No speech detected")

                        await websocket.send_json({
                            "status": "final",
                            "text": final_text,
                            "translation": final_translation,
                            "pronunciation": pronunciation
                        })
                        break

                    else:
                        chunk_count += 1
                        raw_chunk = payload.get("chunk", "")
                        if raw_chunk and raw_chunk != "data":
                            try:
                                if "," in raw_chunk:
                                    raw_chunk = raw_chunk.split(",", 1)[1]
                                missing_pad = len(raw_chunk) % 4
                                if missing_pad:
                                    raw_chunk += "=" * (4 - missing_pad)
                                decoded = base64.b64decode(raw_chunk)
                                buffered_bytes.extend(decoded)
                            except Exception:
                                pass

                        interim_text = "Listening..."
                        if len(buffered_bytes) > 32000 and chunk_count % 3 == 0:
                            try:
                                res = whisper_service.transcribe(bytes(buffered_bytes), language=language)
                                txt = res.get("text", "").strip()
                                if txt:
                                    interim_text = txt
                            except Exception:
                                pass

                        await websocket.send_json({
                            "status": "interim",
                            "chunk_index": chunk_count,
                            "interim_text": interim_text
                        })

                except json.JSONDecodeError:
                    await websocket.send_json({"error": "Invalid JSON format"})

            elif "bytes" in message and message["bytes"]:
                chunk_count += 1
                audio_bytes = message["bytes"]
                buffered_bytes.extend(audio_bytes)

                interim_text = "Listening..."
                if len(buffered_bytes) > 32000 and chunk_count % 3 == 0:
                    try:
                        res = whisper_service.transcribe(bytes(buffered_bytes), language=language)
                        txt = res.get("text", "").strip()
                        if txt:
                            interim_text = txt
                    except Exception:
                        pass

                await websocket.send_json({
                    "status": "interim",
                    "chunk_index": chunk_count,
                    "received_bytes": len(audio_bytes),
                    "interim_text": interim_text
                })

    except WebSocketDisconnect:
        logger.info("Client disconnected from WebSocket voice stream")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.send_json({"error": f"Internal server error: {str(e)}"})
            await websocket.close()
        except Exception:
            pass
