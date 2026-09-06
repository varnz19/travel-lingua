import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.ml.asr.whisper_service import transcribe_audio_chunk

logger = logging.getLogger("travel-lingua.websockets.voice")

router = APIRouter()


@router.websocket("/ws/voice-stream")
async def voice_stream_websocket(websocket: WebSocket):
    """
    Real-time audio streaming gateway endpoint.
    Receives continuous binary or JSON audio chunks from the React Native frontend,
    emits interim transcriptions, and returns final speech recognition / translation.
    """
    await websocket.accept()
    logger.info("WebSocket voice stream client connected")

    try:
        chunk_count = 0
        while True:
            # Receive either text (JSON payload) or binary audio bytes
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                logger.info("Client sent disconnect event")
                break

            if "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                    event_type = payload.get("event", "audio_chunk")

                    if event_type == "start":
                        await websocket.send_json({
                            "status": "listening",
                            "message": "Voice stream initialized"
                        })
                    elif event_type == "stop":
                        await websocket.send_json({
                            "status": "final",
                            "text": "Menyuu o onegaishimasu",
                            "translation": "Menu, please",
                            "pronunciation": "meh-nyoo oh oh-neh-gah-ee-shee-mahs"
                        })
                        break
                    else:
                        chunk_count += 1
                        # Emit interim mock recognition result
                        await websocket.send_json({
                            "status": "interim",
                            "chunk_index": chunk_count,
                            "interim_text": "Menyuu o..."
                        })

                except json.JSONDecodeError:
                    await websocket.send_json({"error": "Invalid JSON format"})

            elif "bytes" in message and message["bytes"]:
                chunk_count += 1
                audio_bytes = message["bytes"]
                # Person 3 Faster-Whisper pipeline integration
                transcription = transcribe_audio_chunk(audio_bytes, language="ja")
                await websocket.send_json({
                    "status": "interim",
                    "chunk_index": chunk_count,
                    "received_bytes": len(audio_bytes),
                    "interim_text": transcription if transcription else "Listening..."
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
