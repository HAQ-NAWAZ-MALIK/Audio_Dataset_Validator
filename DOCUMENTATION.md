# 🎚️ Audio Dataset Validator - Complete Documentation

> **Professional-grade audio quality analysis tool for TTS/ASR dataset creators**
>
> Author: [HAQ-NAWAZ-MALIK](https://github.com/HAQ-NAWAZ-MALIK/)

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#-architecture)
3. [Project Structure](#-project-structure)
4. [Component Architecture](#-component-architecture)
5. [Data Flow & Connections](#-data-flow--connections)
6. [Core Features](#-core-features)
7. [Technology Stack](#-technology-stack)
8. [Development Guide](#-development-guide)
9. [Deployment](#-deployment)
10. [API Reference](#-api-reference)
11. [Audio Standards](#-audio-standards)

---

## 🌟 Project Overview

The **Audio Dataset Validator** is a Next.js-based web application designed to help researchers, developers, and audio engineers validate and optimize audio datasets for Text-to-Speech (TTS) and Automatic Speech Recognition (ASR) applications. 

### Key Capabilities

- **Comprehensive Audio Analysis**: Analyzes sample rate, channels, duration, bit depth, RMS levels, and more
- **Intelligent Issue Detection**: Automatically detects silence, clipping, volume problems, DC offset, and stereo issues
- **AI-Powered Auto-Cleaning**: One-click optimization using research-standard audio processing parameters
- **Real-Time Visualization**: Four distinct waveform visualization modes (Waveform, Bars, Mirror, Spectrogram)
- **Batch Processing**: Analyze multiple audio files simultaneously
- **Professional Audio Processing**: Normalize, trim silence, apply noise gate, remove DC offset
- **Export Capabilities**: Download processed audio in WAV format, export analysis reports as JSON/CSV

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Next.js 14 (React 18) App                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │   UI Layer  │  │   Business  │  │    Audio     │  │  │
│  │  │ Components  │◄─┤    Logic    │◄─┤  Processing  │  │  │
│  │  │  (10 TSX)   │  │  (page.tsx) │  │  (Web Audio) │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  │         ▲                ▲                  ▲         │  │
│  │         │                │                  │         │  │
│  │         ▼                ▼                  ▼         │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │       Core Audio Analysis Engine             │    │  │
│  │  │       (audioAnalyzer.ts)                     │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │         ▲                                             │  │
│  │         │                                             │  │
│  │         ▼                                             │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │         Type Definitions (audio.ts)          │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Files stored in browser memory (File API) + localStorage   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Layers

| Layer | Technologies | Purpose |
|-------|-------------|---------|
| **Framework** | Next.js 14, React 18, TypeScript | Core application framework with type safety |
| **Audio Processing** | Web Audio API | Low-level audio analysis, decoding, and processing |
| **Styling** | Tailwind CSS, Custom CSS | Glassmorphism UI with modern design |
| **Animation** | Framer Motion | Smooth transitions and micro-interactions |
| **Visualization** | WaveSurfer.js, Recharts, Canvas API | Waveform rendering and data charts |
| **State Management** | React Hooks (useState, useRef, useEffect) | Local component state and audio context |
| **File Handling** | File API, Drag & Drop API | File upload and processing |

---

## 📁 Project Structure

```
polar-interstellar-docker/
│
├── .agent/                     # Agent workflows
│   └── workflows/
│       └── huggingface-spaces-docker.md
│
├── .git/                       # Git repository
├── .next/                      # Next.js build output (auto-generated)
├── node_modules/               # Dependencies (auto-generated)
├── public/                     # Static assets
│   └── file.svg
│
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles & design tokens
│   │   ├── layout.tsx          # Root layout with metadata
│   │   └── page.tsx            # Main application page (352 lines)
│   │
│   ├── components/             # React components (10 files)
│   │   ├── AnalysisPanel.tsx   # Analysis results display
│   │   ├── AudioDropzone.tsx   # Drag & drop file uploader
│   │   ├── AudioProcessor.tsx  # Audio processing controls (20KB - largest component)
│   │   ├── FileList.tsx        # File management list view
│   │   ├── Header.tsx          # Application header
│   │   ├── HealthScore.tsx     # Visual health score indicator
│   │   ├── HelpModal.tsx       # Built-in documentation modal
│   │   ├── IssueTag.tsx        # Issue badge component
│   │   ├── SummaryCard.tsx     # Dataset statistics summary
│   │   └── WaveformViewer.tsx  # Waveform visualization (15KB)
│   │
│   ├── lib/                    # Core library functions
│   │   ├── audioAnalyzer.ts    # Main audio analysis engine (321 lines)
│   │   └── utils.ts            # Utility functions (cn helper)
│   │
│   └── types/                  # TypeScript type definitions
│       └── audio.ts            # Core data structures & interfaces
│
├── .gitignore                  # Git ignore patterns
├── Dockerfile                  # Docker container configuration
├── README.md                   # Project README (HuggingFace format)
├── next-env.d.ts              # Next.js TypeScript declarations
├── next.config.mjs            # Next.js configuration
├── package.json               # Dependencies & scripts
├── package-lock.json          # Dependency lock file
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

### Key Directories Explained

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `src/app/` | Next.js App Router pages and layouts | 3 files |
| `src/components/` | Reusable React components | 10 files |
| `src/lib/` | Core business logic and utilities | 2 files |
| `src/types/` | TypeScript type definitions | 1 file |
| `public/` | Static assets (images, icons) | 1 file |

---

## 🧩 Component Architecture

### Component Hierarchy & Relationships

```
page.tsx (Main Application)
│
├── Header
│   └── { title, subtitle, helpButton }
│
├── HelpModal
│   └── { audioStandards, processingGuide }
│
├── AudioDropzone
│   └── { onFilesAdded } → triggers analyzeAudio()
│
├── SummaryCard
│   └── { stats: DatasetStats }
│
├── FileList
│   ├── { files: AudioFile[] }
│   ├── { selectedFileId }
│   ├── onSelect → triggers loadAudioBuffer()
│   ├── onDelete → removes file
│   └── onPlay → plays audio preview
│
├── AnalysisPanel
│   ├── { analysis: AnalysisResult }
│   ├── IssueTag[] → displays individual issues
│   └── HealthScore → visual health indicator
│
├── WaveformViewer
│   ├── { audioBuffer, viewMode }
│   ├── Canvas rendering for waveforms
│   └── Timeline with playback controls
│
└── AudioProcessor
    ├── { audioBuffer, analysis }
    ├── AI Auto-Clean button
    ├── Manual processing controls
    ├── Download processed audio
    └── Uses Web Audio API nodes
```

### Component Responsibilities

#### 1. **page.tsx** (Main Application Container)
- **Role**: Application orchestrator and state manager
- **State Management**:
  - `files`: Array of uploaded audio files
  - `selectedFileId`: Currently selected file
  - `audioBuffer`: Decoded audio data for playback
  - `viewMode`: Waveform visualization mode
  - `isPlaying`, `currentTime`, `duration`: Playback state
- **Key Functions**:
  - `handleFilesAdded()`: Processes dropped files
  - `analyzeAudio()`: Triggers audio analysis for each file
  - `loadAudioBuffer()`: Loads audio into Web Audio API
  - `playPause()`: Controls audio playback
  - `getHighlightRegions()`: Generates waveform highlights based on issues

#### 2. **AudioDropzone.tsx** (File Upload)
- **Role**: File input interface with drag & drop
- **Features**:
  - Drag & drop zone with visual feedback
  - File type validation (WAV, MP3, FLAC, OGG)
  - Multiple file support
  - Upload animation states
- **Props**: `onFilesAdded: (files: File[]) => void`

#### 3. **FileList.tsx** (File Management)
- **Role**: Displays list of uploaded files with status
- **Features**:
  - File status indicators (pending, analyzing, done, error)
  - Health score badges
  - Play button for quick preview
  - Delete functionality
  - File selection for detailed view
- **Props**: 
  - `files: AudioFile[]`
  - `selectedFileId: string | null`
  - `onSelect`, `onDelete`, `onPlay`

#### 4. **AnalysisPanel.tsx** (Analysis Results)
- **Role**: Displays detailed audio analysis metrics
- **Displays**:
  - Technical specs (sample rate, channels, bit depth, format)
  - Quality metrics (peak amplitude, RMS level)
  - Silence detection results
  - DC offset measurements
  - List of detected issues with severity
- **Props**: `analysis: AnalysisResult`

#### 5. **WaveformViewer.tsx** (Visualization)
- **Role**: Advanced waveform visualization with multiple modes
- **Visualization Modes**:
  - **Waveform**: Classic dual-channel waveform
  - **Bars**: Vertical bar graph representation
  - **Mirror**: Symmetrical mirrored waveform
  - **Spectrogram**: Frequency-time visualization
- **Features**:
  - Real-time playback cursor
  - Highlighted regions for detected issues (clipping, silence)
  - Timeline scrubbing
  - Zoom and pan controls
- **Props**: 
  - `audioBuffer: AudioBuffer | null`
  - `viewMode: ViewMode`
  - `onSeek`, `currentTime`, `isPlaying`

#### 6. **AudioProcessor.tsx** (Audio Processing Engine)
- **Role**: Audio enhancement and cleanup tools
- **Processing Features**:
  - **AI Auto-Clean**: One-click optimization with preset parameters
    - Normalize to -1 dB
    - Trim silence (threshold: -40dB)
    - Noise gate at -50dB
    - DC offset removal
    - Convert to 22kHz mono
  - **Manual Controls**:
    - Normalize (custom target level)
    - Trim Silence (custom threshold)
    - Noise Gate (custom threshold)
    - DC Offset Removal
- **Download Options**:
  - Original sample rate
  - 22kHz TTS-optimized
- **Web Audio Nodes Used**:
  - `OfflineAudioContext` for processing
  - `GainNode` for normalization
  - Custom DSP for silence trimming and noise gate
- **Props**: 
  - `audioBuffer: AudioBuffer | null`
  - `analysis: AnalysisResult | undefined`
  - `onProcessed: (buffer: AudioBuffer) => void`

#### 7. **HealthScore.tsx** (Health Indicator)
- **Role**: Visual representation of audio quality
- **Features**:
  - 0-100 score calculation
  - Color-coded indicator (green/yellow/red)
  - Animated circular progress bar
  - Score breakdown tooltip
- **Props**: `score: number`

#### 8. **SummaryCard.tsx** (Dataset Statistics)
- **Role**: Aggregated dataset metrics
- **Displays**:
  - Total files analyzed
  - Pass/Warning/Error counts
  - Average health score
  - Total duration
  - Issue breakdown by type (chart)
- **Props**: `files: AudioFile[]`

#### 9. **Header.tsx** (Application Header)
- **Role**: Branding, title, and help access
- **Features**:
  - Application logo and title
  - Description text
  - Help button (opens HelpModal)
- **Props**: None (static)

#### 10. **HelpModal.tsx** (Documentation)
- **Role**: In-app reference guide
- **Content**:
  - Audio quality standards
  - TTS/ASR best practices
  - Processing recommendations
  - Troubleshooting tips
- **Props**: `isOpen: boolean`, `onClose: () => void`

#### 11. **IssueTag.tsx** (Issue Badge)
- **Role**: Visual tag for detected issues
- **Features**:
  - Color-coded by severity (info/warning/error)
  - Icon display
  - Tooltip with suggestion
- **Props**: `issue: Issue`

---

## 🔄 Data Flow & Connections

### File Upload to Analysis Flow

```
User Action: Drag & Drop Files
         │
         ▼
┌─────────────────────┐
│  AudioDropzone.tsx  │  Validates file types
└─────────────────────┘
         │
         │ onFilesAdded(files)
         ▼
┌─────────────────────┐
│     page.tsx        │  Creates AudioFile objects
│  handleFilesAdded() │  Sets status = 'pending'
└─────────────────────┘
         │
         │ For each file
         ▼
┌─────────────────────────────────┐
│  audioAnalyzer.ts               │
│  analyzeAudio(file, settings)   │
│                                 │
│  1. Decode audio via Web Audio  │
│  2. Extract AudioBuffer         │
│  3. Calculate metrics:          │
│     - Peak amplitude            │
│     - RMS level                 │
│     - Silence regions           │
│     - DC offset                 │
│     - Clipping detection        │
│  4. Detect issues               │
│  5. Calculate health score      │
└─────────────────────────────────┘
         │
         │ Returns AnalysisResult
         ▼
┌─────────────────────┐
│     page.tsx        │  Updates file.analysis
│                     │  Sets status = 'done'
└─────────────────────┘
         │
         │ State update triggers re-render
         ▼
┌─────────────────────┐     ┌─────────────────────┐
│    FileList.tsx     │────▶│  AnalysisPanel.tsx  │
│  (shows health)     │     │  (shows details)    │
└─────────────────────┘     └─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  SummaryCard.tsx    │  Aggregates all results
└─────────────────────┘
```

### Audio Playback Flow

```
User Action: Click Play on File
         │
         ▼
┌─────────────────────┐
│   FileList.tsx      │  onPlay(file)
└─────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│       page.tsx              │
│   loadAudioBuffer()         │
│                             │
│  1. Fetch file              │
│  2. arrayBuffer()           │
│  3. decodeAudioData()       │
│  4. Store in audioBuffer    │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   WaveformViewer.tsx        │
│                             │
│  1. useEffect detects       │
│     audioBuffer change      │
│  2. Renders waveform        │
│  3. Shows playback cursor   │
└─────────────────────────────┘
         │
         │ User clicks Play
         ▼
┌─────────────────────────────┐
│       page.tsx              │
│     playPause()             │
│                             │
│  Web Audio API:             │
│  - Create AudioContext      │
│  - Create BufferSourceNode  │
│  - Connect to destination   │
│  - source.start()           │
│                             │
│  Update currentTime         │
│  via requestAnimationFrame  │
└─────────────────────────────┘
         │
         │ Time updates
         ▼
┌─────────────────────────────┐
│   WaveformViewer.tsx        │  Cursor position updates
└─────────────────────────────┘
```

### Audio Processing Flow

```
User Action: Click "AI Auto-Clean" or Manual Process
         │
         ▼
┌────────────────────────────────────┐
│     AudioProcessor.tsx             │
│                                    │
│  handleAutoClean() or              │
│  handleManualProcess()             │
│                                    │
│  1. Create OfflineAudioContext     │
│  2. Apply processing chain:        │
│     ┌─────────────────────┐        │
│     │  DC Offset Removal  │        │
│     └─────────────────────┘        │
│              │                     │
│              ▼                     │
│     ┌─────────────────────┐        │
│     │   Noise Gate        │        │
│     └─────────────────────┘        │
│              │                     │
│              ▼                     │
│     ┌─────────────────────┐        │
│     │  Trim Silence       │        │
│     └─────────────────────┘        │
│              │                     │
│              ▼                     │
│     ┌─────────────────────┐        │
│     │   Normalize         │        │
│     └─────────────────────┘        │
│              │                     │
│              ▼                     │
│     ┌─────────────────────┐        │
│     │ Convert to Mono     │        │
│     │  (if stereo)        │        │
│     └─────────────────────┘        │
│              │                     │
│              ▼                     │
│     ┌─────────────────────┐        │
│     │ Resample to 22kHz   │        │
│     │   (if needed)       │        │
│     └─────────────────────┘        │
│                                    │
│  3. Render processed audio         │
│  4. Store in processedBuffer       │
└────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│     AudioProcessor.tsx             │
│   handleDownload()                 │
│                                    │
│  1. Convert buffer to WAV          │
│  2. Create Blob                    │
│  3. Create download link           │
│  4. Trigger download               │
└────────────────────────────────────┘
```

### Type System Connections

```
audio.ts (Type Definitions)
    │
    ├── AudioFile ──────────────────┬──► page.tsx (state: files[])
    │                               ├──► FileList.tsx (props)
    │                               └──► SummaryCard.tsx (props)
    │
    ├── AnalysisResult ─────────────┬──► audioAnalyzer.ts (return type)
    │                               ├──► page.tsx (analysis state)
    │                               ├──► AnalysisPanel.tsx (props)
    │                               └──► AudioProcessor.tsx (props)
    │
    ├── Issue ──────────────────────┬──► audioAnalyzer.ts (detectIssues)
    │                               ├──► AnalysisPanel.tsx (display)
    │                               └──► IssueTag.tsx (props)
    │
    ├── IssueType ──────────────────┬──► audioAnalyzer.ts (detection logic)
    │                               └──► IssueTag.tsx (icon mapping)
    │
    ├── DatasetStats ───────────────┬──► page.tsx (calculated)
    │                               └──► SummaryCard.tsx (props)
    │
    └── AnalysisSettings ───────────┬──► audioAnalyzer.ts (parameters)
                                    └──► DEFAULT_SETTINGS (defaults)
```

---

## ⚡ Core Features

### 1. Audio Analysis Engine (`audioAnalyzer.ts`)

The core analysis engine performs comprehensive audio quality checks:

#### Analysis Metrics
- **Duration**: Total length in seconds
- **Sample Rate**: Hz (e.g., 22050, 44100, 48000)
- **Channels**: Mono (1) or Stereo (2)
- **Bit Depth**: Estimated from dynamic range (8, 16, 24, 32-bit)
- **Format**: File type (WAV, MP3, FLAC, OGG)
- **Peak Amplitude**: Maximum absolute value (-∞ to 0 dBFS)
- **RMS Level**: Root Mean Square volume (average loudness)
- **DC Offset**: Average signal offset from zero
- **Clipping**: Detection of samples at ≥99% peak

#### Issue Detection

| Issue Type | Severity | Detection Criteria |
|-----------|----------|-------------------|
| `silence_start` | Warning | Leading silence > 0.3s at <-40dB |
| `silence_end` | Warning | Trailing silence > 0.3s at <-40dB |
| `clipping` | Error | Samples ≥ 0.99 amplitude |
| `low_volume` | Warning | RMS < -30 dB |
| `high_volume` | Warning | Peak > -1 dB |
| `dc_offset` | Warning | Absolute offset > 0.01 |
| `stereo` | Info | 2 channels detected |
| `low_sample_rate` | Info | Sample rate < 22050 Hz |
| `short_duration` | Info | Duration < 0.5s |
| `long_duration` | Info | Duration > 30s |

#### Health Score Calculation

```
Base Score: 100
Deductions:
  - Error issues: -20 points each
  - Warning issues: -10 points each
  - Info issues: -5 points each

Final Score: max(0, Base Score - Total Deductions)

Rating:
  90-100: Excellent (Green)
  70-89:  Good (Yellow)
  50-69:  Fair (Orange)
  0-49:   Poor (Red)
```

### 2. AI Auto-Clean Processing

**Preset Parameters** (Research-Standard):
```typescript
{
  normalize: true,
  targetLevel: -1,        // dB (industry standard)
  trimSilence: true,
  silenceThreshold: -40,  // dB
  noiseGate: true,
  gateThreshold: -50,     // dB
  removeDCOffset: true,
  convertToMono: true,
  targetSampleRate: 22050 // Hz (TTS standard)
}
```

**Processing Pipeline**:
1. **DC Offset Removal**: Removes DC bias by subtracting mean
2. **Noise Gate**: Attenuates samples below -50dB to zero
3. **Trim Silence**: Removes leading/trailing silence below -40dB
4. **Normalize**: Scales to -1dB peak (prevents clipping)
5. **Mono Conversion**: Averages L+R channels if stereo
6. **Resample**: Converts to 22kHz using linear interpolation

### 3. Visualization Modes

#### Waveform Mode
- Dual-channel amplitude plot
- Time on X-axis, amplitude on Y-axis
- Highlighted regions for issues (red for clipping, yellow for silence)

#### Bars Mode
- Vertical bar graph
- Each bar represents time segment average amplitude
- Useful for quick visual quality check

#### Mirror Mode
- Symmetrical waveform (mirrored top/bottom)
- Aesthetic visualization
- Easy to spot asymmetric distortions

#### Spectrogram Mode
- Frequency-time representation
- Color intensity = energy at frequency
- FFT size: 2048, overlap: 50%
- Frequency range: 0-11kHz (Nyquist for 22kHz)

### 4. Batch Processing

- **Concurrent Analysis**: Processes multiple files in parallel
- **Progress Tracking**: Status indicators for each file
- **Error Handling**: Graceful failure with error messages
- **Performance**: Uses Web Workers where available (future enhancement)

### 5. Export Capabilities

#### Analysis Reports
- **JSON Export**: Complete analysis data for programmatic use
- **CSV Export**: Tabular format for Excel/spreadsheet analysis

#### Processed Audio
- **WAV Format**: Uncompressed, lossless output
- **Sample Rate Options**: 
  - Original: Maintains source sample rate
  - 22kHz: TTS-optimized (smaller file size)
- **Bit Depth**: 16-bit (industry standard)
- **Channels**: Mono (after processing)

---

## 💻 Technology Stack

### Frontend Framework
- **Next.js 14**: React framework with App Router
- **React 18**: UI library with hooks and concurrent features
- **TypeScript 5**: Static type checking

### Audio Processing
- **Web Audio API**: Native browser audio decoding and processing
- **WaveSurfer.js 7**: Waveform rendering library
- **OfflineAudioContext**: Background audio processing

### Styling & UI
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Custom CSS**: Glassmorphism effects, gradients
- **Framer Motion 11**: Animation library for smooth transitions
- **Lucide React**: Icon library

### Data Visualization
- **Recharts 2**: Chart library for statistics graphs
- **Canvas API**: Custom waveform rendering

### Utilities
- **clsx**: Conditional className helper
- **tailwind-merge**: Merge Tailwind classes without conflicts
- **Sonner**: Toast notifications

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: Vendor prefix automation

### Deployment
- **Docker**: Containerization
- **Node.js 20**: Runtime environment
- **HuggingFace Spaces**: Hosting platform (optional)

---

## 🛠️ Development Guide

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/audio-dataset-validator.git
cd audio-dataset-validator

# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **dev** | `npm run dev` | Start development server (hot reload) |
| **build** | `npm run build` | Create production build |
| **start** | `npm start` | Start production server |
| **lint** | `npm run lint` | Run ESLint code checks |

### Project Configuration Files

#### `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker deployment
};

export default nextConfig;
```

#### `tailwind.config.ts`
- Custom color palette
- Glassmorphism utilities
- Animation keyframes
- Typography settings

#### `tsconfig.json`
- Path aliases (`@/*` maps to `src/*`)
- Strict type checking enabled
- Next.js compiler options

### Adding New Features

#### Adding a New Component

1. Create component file in `src/components/`:
```tsx
// src/components/NewFeature.tsx
import React from 'react';

interface NewFeatureProps {
  data: string;
}

export default function NewFeature({ data }: NewFeatureProps) {
  return (
    <div className="glass-card">
      <h3>{data}</h3>
    </div>
  );
}
```

2. Import in `page.tsx`:
```tsx
import NewFeature from '@/components/NewFeature';
```

#### Adding New Analysis Metrics

1. Update type definition in `src/types/audio.ts`:
```typescript
export interface AnalysisResult {
  // ... existing fields
  newMetric: number;
}
```

2. Implement in `src/lib/audioAnalyzer.ts`:
```typescript
function calculateNewMetric(data: Float32Array): number {
  // Your calculation logic
  return result;
}

// Add to analyzeAudio() return object
```

3. Display in `AnalysisPanel.tsx`

### Debugging Tips

#### Audio Not Playing
- Check browser console for AudioContext errors
- Verify file is properly decoded (check `audioBuffer`)
- Ensure HTTPS in production (AudioContext requires secure context)

#### Analysis Errors
- Validate file format is supported
- Check Web Audio API compatibility
- Verify file isn't corrupted

#### Performance Issues
- Use React DevTools Profiler
- Check for unnecessary re-renders
- Consider memoization for expensive calculations

---

## 🚀 Deployment

### Option 1: Docker (Recommended)

#### Build Docker Image

```bash
# Build the image
docker build -t audio-dataset-validator .

# Run container
docker run -p 7860:7860 audio-dataset-validator
```

Access at `http://localhost:7860`

#### Dockerfile Explanation

```dockerfile
# Multi-stage build for optimized image size

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create data directory for persistent storage
RUN mkdir -p /data && chmod 777 /data

EXPOSE 7860
ENV PORT=7860
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Image Layers**:
1. **deps**: Installs node_modules (cached if package.json unchanged)
2. **builder**: Builds Next.js application
3. **runner**: Minimal runtime image (only production files)

**Optimizations**:
- Multi-stage build reduces final image size
- `npm ci` for reproducible builds
- Standalone output for minimal dependencies
- Alpine Linux base for smallest image

### Option 2: HuggingFace Spaces

#### Prerequisites
- HuggingFace account
- Git configured with HF credentials

#### Steps

1. **Update README.md** (already configured):
```yaml
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
```

2. **Create HF Space**:
```bash
# On HuggingFace website, create new Space with Docker SDK
```

3. **Push to HuggingFace**:
```bash
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/audio-dataset-validator
git push hf main
```

4. **Monitor Build**:
- Check Space "Build Logs" tab
- Wait for "Running" status (3-5 minutes)

#### HuggingFace-Specific Configuration

- **Port**: Must be 7860 (HF standard)
- **Data Directory**: `/data` for persistent storage
- **Environment**: Production mode (`NODE_ENV=production`)
- **Hostname**: `0.0.0.0` to accept external connections

### Option 3: Vercel (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Note**: Web Audio API works best with static hosting. Vercel is ideal for Next.js.

### Option 4: Manual Server Deployment

```bash
# Build production bundle
npm run build

# Start server
npm start
```

Runs on `http://localhost:3000` by default.

#### Environment Variables

```bash
# .env.local
PORT=3000
NODE_ENV=production
```

### Deployment Checklist

- [ ] Update `README.md` with correct URLs
- [ ] Test Dockerfile builds successfully
- [ ] Verify audio playback works in production
- [ ] Check HTTPS configuration (required for Web Audio API)
- [ ] Test file upload with large files
- [ ] Verify export/download functionality
- [ ] Monitor memory usage (audio processing is memory-intensive)
- [ ] Set up error logging (Sentry, LogRocket, etc.)
- [ ] Configure CDN for static assets (optional)
- [ ] Add analytics (Google Analytics, Plausible, etc.)

---

## 📡 API Reference

### Type Definitions

#### AudioFile Interface
```typescript
interface AudioFile {
  id: string;              // Unique identifier (UUID)
  file: File;              // Original File object
  name: string;            // Filename
  size: number;            // File size in bytes
  type: string;            // MIME type
  status: 'pending' | 'analyzing' | 'done' | 'error';
  analysis?: AnalysisResult;
  error?: string;
}
```

#### AnalysisResult Interface
```typescript
interface AnalysisResult {
  duration: number;        // Seconds
  sampleRate: number;      // Hz (e.g., 22050)
  channels: number;        // 1 (mono) or 2 (stereo)
  bitDepth: number;        // Estimated bit depth
  format: string;          // 'WAV', 'MP3', etc.
  peakAmplitude: number;   // -∞ to 0 dBFS
  rmsLevel: number;        // dB
  silenceStart: number;    // Seconds of leading silence
  silenceEnd: number;      // Seconds of trailing silence
  hasClipping: boolean;    // Clipping detected
  dcOffset: number;        // -1 to 1
  healthScore: number;     // 0-100
  issues: Issue[];
}
```

#### Issue Interface
```typescript
interface Issue {
  type: IssueType;
  severity: 'info' | 'warning' | 'error';
  message: string;         // Human-readable description
  suggestion: string;      // How to fix
}

type IssueType =
  | 'silence_start'
  | 'silence_end'
  | 'clipping'
  | 'low_volume'
  | 'high_volume'
  | 'dc_offset'
  | 'stereo'
  | 'low_sample_rate'
  | 'short_duration'
  | 'long_duration';
```

#### AnalysisSettings Interface
```typescript
interface AnalysisSettings {
  targetSampleRate: number;      // Default: 22050
  minDuration: number;           // Default: 0.5 seconds
  maxDuration: number;           // Default: 30 seconds
  silenceThreshold: number;      // Default: -40 dB
  silenceMaxDuration: number;    // Default: 0.3 seconds
  clippingThreshold: number;     // Default: 0.99
  lowVolumeThreshold: number;    // Default: -30 dB
  dcOffsetThreshold: number;     // Default: 0.01
}
```

### Core Functions

#### `analyzeAudio(file, settings?)`

**Description**: Analyzes an audio file and returns comprehensive quality metrics.

**Parameters**:
- `file` (File): Audio file to analyze
- `settings` (AnalysisSettings, optional): Custom thresholds (defaults to `DEFAULT_SETTINGS`)

**Returns**: `Promise<AnalysisResult>`

**Example**:
```typescript
import { analyzeAudio } from '@/lib/audioAnalyzer';

const result = await analyzeAudio(audioFile, {
  targetSampleRate: 44100,
  silenceThreshold: -50
});

console.log(result.healthScore); // 85
console.log(result.issues);      // [{ type: 'low_volume', ... }]
```

#### `calculateHealthScore(issues)`

**Description**: Calculates 0-100 quality score based on detected issues.

**Parameters**:
- `issues` (Issue[]): Array of detected issues

**Returns**: `number` (0-100)

**Algorithm**:
```typescript
let score = 100;
issues.forEach(issue => {
  if (issue.severity === 'error') score -= 20;
  else if (issue.severity === 'warning') score -= 10;
  else if (issue.severity === 'info') score -= 5;
});
return Math.max(0, score);
```

#### Helper Functions

##### `calculatePeak(data: Float32Array): number`
Returns peak amplitude in linear scale (0-1).

##### `calculateRMS(data: Float32Array): number`
Returns RMS level in dB.

##### `detectSilence(data, sampleRate, threshold): { silenceStart, silenceEnd }`
Detects leading and trailing silence in seconds.

##### `detectClipping(data, threshold): boolean`
Returns true if any samples exceed clipping threshold.

##### `calculateDCOffset(data): number`
Returns average DC offset (-1 to 1).

##### `estimateBitDepth(data): number`
Estimates bit depth based on dynamic range (8, 16, 24, or 32).

---

## 🎯 Audio Standards

### TTS (Text-to-Speech) Standards

| Parameter | Recommended | Acceptable | Notes |
|-----------|-------------|------------|-------|
| **Sample Rate** | 22,050 Hz | 16,000 - 44,100 Hz | 22kHz is standard for training |
| **Channels** | Mono (1) | Mono only | Stereo increases processing time |
| **Bit Depth** | 16-bit | 16-24 bit | Higher bit depth = larger files |
| **Peak Level** | -1 dB | -3 to -1 dB | Prevents clipping during processing |
| **RMS Level** | -20 to -15 dB | -30 to -10 dB | Consistent loudness across dataset |
| **Duration** | 2-10 seconds | 1-15 seconds | Optimal for training |
| **Leading Silence** | < 0.1 seconds | < 0.3 seconds | Quick start improves alignment |
| **Trailing Silence** | < 0.1 seconds | < 0.3 seconds | Reduces padding in batches |
| **DC Offset** | < 0.005 | < 0.01 | Prevents low-frequency distortion |
| **Format** | WAV (uncompressed) | FLAC | Lossless only for training |

### ASR (Automatic Speech Recognition) Standards

| Parameter | Recommended | Acceptable | Notes |
|-----------|-------------|------------|-------|
| **Sample Rate** | 16,000 Hz | 8,000 - 48,000 Hz | 16kHz is standard for most ASR |
| **Channels** | Mono (1) | Mono only | Stereo not beneficial for ASR |
| **Bit Depth** | 16-bit | 16-bit | Standard for speech |
| **Duration** | 2-15 seconds | 0.5-30 seconds | Varies by use case |

### Quality Thresholds

#### Excellent Quality (90-100 Health Score)
- No clipping
- Minimal silence (< 0.1s)
- Proper volume levels (-20 to -15 dB RMS)
- No DC offset
- Mono, 22kHz, 16-bit

#### Good Quality (70-89 Health Score)
- Minor issues (e.g., slight leading silence)
- May need minor processing
- Usable for training with minimal cleanup

#### Fair Quality (50-69 Health Score)
- Multiple warnings
- Requires audio processing
- May impact model training quality

#### Poor Quality (0-49 Health Score)
- Critical errors (clipping, extreme volume)
- Extensive processing needed
- May need re-recording

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: "Failed to decode audio"
**Cause**: Unsupported format or corrupted file
**Solution**: 
- Verify file format (WAV, MP3, FLAC, OGG only)
- Try re-exporting from audio editor
- Check file isn't corrupted

#### Issue: Waveform not displaying
**Cause**: AudioBuffer not loaded or Canvas API issue
**Solution**:
- Check browser console for errors
- Verify browser supports Canvas API
- Try refreshing page

#### Issue: "Audio playback failed"
**Cause**: Browser restrictions or HTTPS requirement
**Solution**:
- Ensure site is served over HTTPS in production
- Check browser's AudioContext policy
- User may need to interact with page first (click)

#### Issue: Processed audio download fails
**Cause**: Memory limitation or browser restriction
**Solution**:
- Close other tabs to free memory
- Try smaller files first
- Check browser's download permissions

#### Issue: Slow analysis on large files
**Cause**: Single-threaded JavaScript processing
**Solution**:
- Use smaller file batches
- Consider compressing files before upload
- Future: Implement Web Workers for parallel processing

---

## 📊 Performance Considerations

### Memory Usage

- **Audio Decoding**: ~10MB per minute of 44.1kHz stereo audio
- **Processing**: 2x memory during OfflineAudioContext rendering
- **Recommendation**: Limit batch uploads to 10 files or 100MB total

### Browser Compatibility

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| **Chrome** | 90+ | ✅ Full | Best performance |
| **Firefox** | 88+ | ✅ Full | Good performance |
| **Safari** | 14.1+ | ✅ Full | AudioContext requires user gesture |
| **Edge** | 90+ | ✅ Full | Chromium-based |

### Optimization Tips

1. **Lazy Load Audio**: Only decode when user selects file
2. **Debounce Waveform Rendering**: Avoid re-rendering on every time update
3. **Use requestAnimationFrame**: Smooth playback cursor updates
4. **Memoize Calculations**: Cache health scores and stats
5. **Offload Processing**: Future enhancement with Web Workers

---

## 🤝 Contributing

### Development Workflow

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Comments**: JSDoc for public functions
- **Formatting**: Prettier/ESLint auto-format

---

## 📝 License

This project is open source. Please attribute when using.

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/audio-dataset-validator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/audio-dataset-validator/discussions)
- **Author**: [HAQ-NAWAZ-MALIK](https://github.com/HAQ-NAWAZ-MALIK/)

---

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Web Workers for parallel processing
- [ ] Advanced spectrogram with pitch tracking
- [ ] Batch export all processed files as ZIP
- [ ] Custom processing presets (save/load)
- [ ] Cloud storage integration (S3, Google Drive)
- [ ] Real-time audio recording and analysis
- [ ] Audio comparison (before/after overlay)
- [ ] Noise profiling and reduction
- [ ] Equalizer for frequency adjustment
- [ ] Transcription integration (Whisper API)

---

**Built with ❤️ using Next.js, TypeScript, and Web Audio API**
