import { AnalysisResult, Issue, IssueType, AnalysisSettings, DEFAULT_SETTINGS } from '@/types/audio';

/**
 * Core audio analysis engine using Web Audio API
 */
export async function analyzeAudio(
    file: File,
    settings: AnalysisSettings = DEFAULT_SETTINGS
): Promise<AnalysisResult> {
    const audioContext = new AudioContext();

    try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const duration = audioBuffer.duration;
        const sampleRate = audioBuffer.sampleRate;
        const channels = audioBuffer.numberOfChannels;
        const format = getAudioFormat(file.type, file.name);

        // Get audio data from first channel
        const channelData = audioBuffer.getChannelData(0);

        // Calculate peak amplitude
        const peakAmplitude = calculatePeak(channelData);

        // Calculate RMS level
        const rmsLevel = calculateRMS(channelData);

        // Detect leading/trailing silence
        const { silenceStart, silenceEnd } = detectSilence(
            channelData,
            sampleRate,
            settings.silenceThreshold
        );

        // Detect clipping
        const hasClipping = detectClipping(channelData, settings.clippingThreshold);

        // Calculate DC offset
        const dcOffset = calculateDCOffset(channelData);

        // Estimate bit depth (approximate for non-WAV)
        const bitDepth = estimateBitDepth(channelData);

        // Detect issues
        const issues = detectIssues({
            duration,
            sampleRate,
            channels,
            peakAmplitude,
            rmsLevel,
            silenceStart,
            silenceEnd,
            hasClipping,
            dcOffset,
        }, settings);

        // Calculate health score
        const healthScore = calculateHealthScore(issues);

        return {
            duration,
            sampleRate,
            channels,
            bitDepth,
            format,
            peakAmplitude,
            rmsLevel,
            silenceStart,
            silenceEnd,
            hasClipping,
            dcOffset,
            healthScore,
            issues,
        };
    } finally {
        await audioContext.close();
    }
}

function getAudioFormat(mimeType: string, filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext) {
        const formats: Record<string, string> = {
            'wav': 'WAV',
            'mp3': 'MP3',
            'flac': 'FLAC',
            'ogg': 'OGG',
            'm4a': 'M4A',
            'webm': 'WebM',
        };
        return formats[ext] || ext.toUpperCase();
    }
    return mimeType.split('/')[1]?.toUpperCase() || 'Unknown';
}

function calculatePeak(data: Float32Array): number {
    let max = 0;
    for (let i = 0; i < data.length; i++) {
        const abs = Math.abs(data[i]);
        if (abs > max) max = abs;
    }
    return max;
}

function calculateRMS(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i] * data[i];
    }
    const rms = Math.sqrt(sum / data.length);
    // Convert to dB
    return 20 * Math.log10(rms + 1e-10);
}

function detectSilence(
    data: Float32Array,
    sampleRate: number,
    thresholdDb: number
): { silenceStart: number; silenceEnd: number } {
    const threshold = Math.pow(10, thresholdDb / 20);
    const windowSize = Math.floor(sampleRate * 0.01); // 10ms windows

    let silenceStart = 0;
    let silenceEnd = 0;

    // Detect leading silence
    for (let i = 0; i < data.length; i += windowSize) {
        const windowEnd = Math.min(i + windowSize, data.length);
        let windowRMS = 0;
        for (let j = i; j < windowEnd; j++) {
            windowRMS += data[j] * data[j];
        }
        windowRMS = Math.sqrt(windowRMS / (windowEnd - i));

        if (windowRMS > threshold) {
            silenceStart = i / sampleRate;
            break;
        }
    }

    // Detect trailing silence
    for (let i = data.length - 1; i >= 0; i -= windowSize) {
        const windowStart = Math.max(i - windowSize, 0);
        let windowRMS = 0;
        for (let j = windowStart; j <= i; j++) {
            windowRMS += data[j] * data[j];
        }
        windowRMS = Math.sqrt(windowRMS / (i - windowStart + 1));

        if (windowRMS > threshold) {
            silenceEnd = (data.length - i) / sampleRate;
            break;
        }
    }

    return { silenceStart, silenceEnd };
}

function detectClipping(data: Float32Array, threshold: number): boolean {
    let clippedSamples = 0;
    for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i]) >= threshold) {
            clippedSamples++;
            if (clippedSamples > 10) return true; // Allow a few samples
        }
    }
    return false;
}

function calculateDCOffset(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i];
    }
    return sum / data.length;
}

function estimateBitDepth(data: Float32Array): number {
    // Rough estimation based on unique values
    const uniqueValues = new Set<number>();
    const sampleSize = Math.min(data.length, 10000);

    for (let i = 0; i < sampleSize; i++) {
        uniqueValues.add(Math.round(data[i] * 32768));
    }

    const uniqueCount = uniqueValues.size;
    if (uniqueCount < 256) return 8;
    if (uniqueCount < 65536) return 16;
    return 24;
}

interface AnalysisMetrics {
    duration: number;
    sampleRate: number;
    channels: number;
    peakAmplitude: number;
    rmsLevel: number;
    silenceStart: number;
    silenceEnd: number;
    hasClipping: boolean;
    dcOffset: number;
}

function detectIssues(metrics: AnalysisMetrics, settings: AnalysisSettings): Issue[] {
    const issues: Issue[] = [];

    // Check leading silence
    if (metrics.silenceStart > settings.silenceMaxDuration) {
        issues.push({
            type: 'silence_start',
            severity: 'warning',
            message: `${metrics.silenceStart.toFixed(2)}s leading silence`,
            suggestion: 'Trim the beginning of the audio',
        });
    }

    // Check trailing silence
    if (metrics.silenceEnd > settings.silenceMaxDuration) {
        issues.push({
            type: 'silence_end',
            severity: 'warning',
            message: `${metrics.silenceEnd.toFixed(2)}s trailing silence`,
            suggestion: 'Trim the end of the audio',
        });
    }

    // Check clipping
    if (metrics.hasClipping) {
        issues.push({
            type: 'clipping',
            severity: 'error',
            message: 'Audio clipping detected',
            suggestion: 'Reduce volume or re-record at lower level',
        });
    }

    // Check low volume
    if (metrics.rmsLevel < settings.lowVolumeThreshold) {
        issues.push({
            type: 'low_volume',
            severity: 'warning',
            message: `Low volume (${metrics.rmsLevel.toFixed(1)} dB RMS)`,
            suggestion: 'Normalize audio to -3 dB',
        });
    }

    // Check DC offset
    if (Math.abs(metrics.dcOffset) > settings.dcOffsetThreshold) {
        issues.push({
            type: 'dc_offset',
            severity: 'warning',
            message: `DC offset detected (${(metrics.dcOffset * 100).toFixed(2)}%)`,
            suggestion: 'Apply DC offset removal filter',
        });
    }

    // Check stereo
    if (metrics.channels > 1) {
        issues.push({
            type: 'stereo',
            severity: 'info',
            message: `${metrics.channels} channels (stereo)`,
            suggestion: 'Convert to mono for TTS datasets',
        });
    }

    // Check sample rate
    if (metrics.sampleRate < settings.targetSampleRate) {
        issues.push({
            type: 'low_sample_rate',
            severity: 'warning',
            message: `Low sample rate (${metrics.sampleRate} Hz)`,
            suggestion: `Recommended: ${settings.targetSampleRate} Hz or higher`,
        });
    }

    // Check duration
    if (metrics.duration < settings.minDuration) {
        issues.push({
            type: 'short_duration',
            severity: 'warning',
            message: `Very short (${metrics.duration.toFixed(2)}s)`,
            suggestion: `Minimum recommended: ${settings.minDuration}s`,
        });
    }

    if (metrics.duration > settings.maxDuration) {
        issues.push({
            type: 'long_duration',
            severity: 'info',
            message: `Long audio (${metrics.duration.toFixed(1)}s)`,
            suggestion: 'Consider splitting into shorter segments',
        });
    }

    return issues;
}

function calculateHealthScore(issues: Issue[]): number {
    let score = 100;

    for (const issue of issues) {
        switch (issue.severity) {
            case 'error':
                score -= 25;
                break;
            case 'warning':
                score -= 10;
                break;
            case 'info':
                score -= 3;
                break;
        }
    }

    return Math.max(0, Math.min(100, score));
}
