# Travel-Lingua

**AI-powered real-time translation and travel language companion**

[![Project Status](https://img.shields.io/badge/status-active%20development-orange.svg)](https://github.com)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020.svg?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?logo=react)]
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python)]
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg?logo=fastapi)]
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg?logo=redis)]
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E.svg?logo=supabase)]

> **Project Status: Active Development**
>
> Travel-Lingua is an ongoing project currently being developed as a real-time travel translation and language learning platform. Several core modules are functional, while voice streaming, OCR, pronunciation assessment, offline capabilities, and AI roleplay are being actively implemented and tested.

---

## Overview

Travel-Lingua is an AI-powered travel companion designed to help users communicate, understand foreign languages, and navigate real-world travel situations.

The platform combines real-time translation, pronunciation coaching, offline travel phrases, camera-based text recognition, and scenario-based language practice into a single mobile application.

The initial language experience focuses on English and Japanese, with support for Romanized pronunciation and native text-to-speech playback.

Travel-Lingua is designed around practical travel situations such as:

- Ordering food
- Navigating public transportation
- Checking into hotels
- Reading menus and signs
- Communicating during emergencies
- Practicing conversations before traveling

---

## Current Development Status

Travel-Lingua is **actively under development**.

The project follows a modular development approach where individual capabilities are implemented and validated independently before being integrated into the complete travel experience.

### Feature Status & Implementation Matrix

| Module | Functionality | Status | Tech Stack / Engine |
|---|---|---|---|
| **Multi-Language Translator** | 8-language real-time translation (JA, EN, ES, FR, DE, IT, KO, ZH), Hepburn Romaji & TTS | **Fully Integrated** | FastAPI, MarianMT / NLLB-200, Redis Cache |
| **Semantic Search Embeddings** | Natural language intent matching across 29+ travel situations (e.g. "wash hands" ➔ "restroom") | **Fully Integrated** | Sentence-Transformers (`all-MiniLM-L6-v2`), 384-dim Cosine Sim |
| **Voice Activity Detection (VAD)** | Real-time speech activity detection & noise gating | **Fully Integrated** | Silero-VAD (Snakers4) + Calibrated RMS Energy Filter |
| **Speech-to-Text (ASR)** | Real-time audio transcription | **Fully Integrated** | OpenAI Faster-Whisper, 16kHz Linear PCM |
| **Pronunciation Coach (GOP)** | Acoustic accuracy scoring & word/phoneme level feedback | **Fully Integrated** | Goodness of Pronunciation (GOP), Wav2Vec 2.0 |
| **Vision / Camera OCR** | Camera capture & gallery upload, text extraction, orientation & dynamic translation | **Fully Integrated** | PaddleOCR / Vision Pipeline + MarianMT |
| **AI Scenario Roleplay** | Conversational travel scenarios (Dining, Hotel, Transit, Shopping) with grammar tips | **Fully Integrated** | FastAPI Roleplay Engine + Difficulty Modes |
| **Traveler Profile & Auth** | Real Supabase Auth, JWT validation, trip countdown, saved phrases & practice history | **Fully Integrated** | Supabase Auth, PostgreSQL, AsyncStorage |
| **Offline-First Resilience** | Full offline dictionary & fallback engine when network/backend is unreachable | **Fully Integrated** | Local Dictionary, AsyncStorage, Romaji Engine |
| **Containerization** | Multi-stage Docker build with Nginx SPA reverse proxy & docker-compose | **Production-Ready** | Docker, Nginx Alpine, Docker-Compose |

---

## Core Features

### Real-Time Translation

Provides bidirectional translation between supported languages with:

- Text translation
- Romanized pronunciation
- Native-language text-to-speech
- Translation caching
- Real-time communication support

### Survival Phrasebook

Provides commonly required travel phrases organized into categories such as:

- Emergency
- Transportation
- Dining
- Accommodation
- Tax-free shopping

The phrasebook is designed to remain accessible when internet connectivity is limited.

### Pronunciation Coach

The pronunciation module evaluates recorded speech against target phrases and provides pronunciation feedback.

Current development includes:

- Acoustic accuracy scoring
- Syllable-level analysis
- Pronunciation feedback
- Learning progress tracking

### AI Scenario Roleplay

Provides conversational practice based on real travel situations.

Example scenarios include:

- Ordering at a café
- Hotel check-in
- Buying train tickets
- Asking for directions
- Navigating common travel interactions

### Camera OCR

Allows users to capture foreign-language text using the device camera.

The OCR pipeline is being developed to support:

1. Image capture
2. Text extraction
3. Translation
4. Display of the translated result

Potential use cases include menus, street signs, transportation boards, and other travel-related text.

### Traveler Profile

Provides a centralized profile containing:

- Trip information
- Saved phrases
- Learning statistics
- Achievement badges
- Translation activity

---

## Architecture

```text
                           Travel-Lingua
                                |
                 +--------------+--------------+
                 |                             |
           Mobile Client                  Backend API
        React Native / Expo             FastAPI / Python
                 |                             |
          Expo Router                +---------+---------+
                 |                   |         |         |
                 |                REST API  WebSocket  ML Services
                 |                   |         |         |
                 |                Redis      Voice    Whisper / OCR
                 |                 Cache     Stream
                 |                   |
                 +-------------------+
                             |
                       Supabase
                    Auth + PostgreSQL
