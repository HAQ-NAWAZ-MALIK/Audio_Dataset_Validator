---
title: Audio Dataset Validator
emoji: 🎚️
colorFrom: indigo
colorTo: purple
sdk: docker
app_file: Dockerfile
app_port: 7860
pinned: false
---

# 🎚️ Audio Dataset Validator

A professional-grade audio quality analysis tool for TTS/ASR dataset creators.

## ✨ Features

- 📊 **Quality Analysis**: Sample rate, channels, duration, bit depth, RMS level
- 🔍 **Issue Detection**: Silence, clipping, low volume, DC offset, stereo detection
- 🌊 **4 Visualization Modes**: Waveform, Bars, Mirror, Spectrogram
- 📈 **Health Score**: 0-100 quality rating per file
- ✨ **AI Auto-Clean**: One-click optimization with research-standard parameters
- 🔧 **Audio Processor**: Normalize, Trim Silence, Noise Gate, DC Offset removal
- 📥 **Download Processed**: Export cleaned audio as WAV (original or 22kHz TTS)
- 📁 **Batch Processing**: Analyze multiple files at once
- 📤 **Export Reports**: JSON/CSV output
- 📖 **Built-in Guide**: Audio standards reference

## 🚀 Usage

1. Drag & drop audio files (WAV, MP3, FLAC, OGG)
2. View analysis results instantly
3. Use AI Auto-Clean or manual processing to fix issues
4. Download processed audio file

## 🎯 Audio Standards (TTS/ASR)

- **Sample Rate**: 22,050 Hz or 44,100 Hz
- **Channels**: Mono (1 channel)
- **Bit Depth**: 16-bit
- **Peak Level**: -3 dB to -1 dB
- **Duration**: 1-15 seconds
- **Leading Silence**: < 0.1s

## 🛠️ Tech Stack

- Next.js 14 + TypeScript
- Web Audio API
- Tailwind CSS + Glassmorphism UI
- Framer Motion animations

## 👤 Author

Created by [HAQ-NAWAZ-MALIK](https://github.com/HAQ-NAWAZ-MALIK/)
