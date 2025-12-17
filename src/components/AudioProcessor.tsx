// @ts-nocheck
'use client';

import { useState, useCallback } from 'react';
import {
    Volume2, VolumeX, Scissors, Wand2, Download,
    RotateCcw, Loader2, Waves, Sparkles, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AudioProcessorProps {
    audioBuffer: AudioBuffer | null;
    filename: string;
    onProcessed?: (buffer: AudioBuffer) => void;
}

type ProcessingType = 'normalize' | 'trim' | 'noise' | 'dc_offset' | 'auto_clean';

// Research-standard parameters for TTS/ASR
const RESEARCH_STANDARDS = {
    targetPeakDb: -3,       // Peak normalization target
    noiseGateThreshold: 0.015, // Noise gate threshold
    silenceThresholdDb: -40,   // Silence detection
    minLeadingSilence: 0.05,   // 50ms minimum lead
    minTrailingSilence: 0.1,   // 100ms minimum trail
    dcOffsetMax: 0.005,        // Maximum DC offset
};

export default function AudioProcessor({ audioBuffer, filename, onProcessed }: AudioProcessorProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedBuffer, setProcessedBuffer] = useState<AudioBuffer | null>(null);
    const [activeProcess, setActiveProcess] = useState<ProcessingType | null>(null);
    const [autoCleanResults, setAutoCleanResults] = useState<string[]>([]);

    // Settings
    const [normalizeLevel, setNormalizeLevel] = useState(-3);
    const [noiseReduction, setNoiseReduction] = useState(0.02);
    const [trimThreshold, setTrimThreshold] = useState(-40);

    // AI Auto-Clean - applies all processing in optimal order
    const autoClean = useCallback(async () => {
        if (!audioBuffer) return;

        setIsProcessing(true);
        setActiveProcess('auto_clean');
        setAutoCleanResults([]);

        try {
            const results: string[] = [];
            const sourceData = audioBuffer.getChannelData(0);
            let data = new Float32Array(sourceData);

            // Step 1: Remove DC Offset
            const dcOffset = calculateMean(data);
            if (Math.abs(dcOffset) > RESEARCH_STANDARDS.dcOffsetMax) {
                data = removeDCOffset(data) as Float32Array;
                results.push(`✓ Removed DC offset (${(dcOffset * 100).toFixed(2)}%)`);
            }

            // Step 2: Noise Gate
            const noiseFloor = estimateNoiseFloor(data);
            if (noiseFloor > 0.005) {
                data = reduceNoise(data, RESEARCH_STANDARDS.noiseGateThreshold) as Float32Array;
                results.push(`✓ Applied noise gate`);
            }

            // Step 3: Trim Silence
            const originalLength = data.length;
            data = trimSilenceWithPadding(data, audioBuffer.sampleRate) as Float32Array;
            if (data.length < originalLength) {
                const trimmedMs = ((originalLength - data.length) / audioBuffer.sampleRate * 1000).toFixed(0);
                results.push(`✓ Trimmed ${trimmedMs}ms silence`);
            }

            // Step 4: Normalize to -3dB peak
            const currentPeak = calculatePeak(data);
            const currentPeakDb = 20 * Math.log10(currentPeak + 0.0001);
            if (currentPeakDb < RESEARCH_STANDARDS.targetPeakDb - 1) {
                data = normalizeAudio(data, RESEARCH_STANDARDS.targetPeakDb) as Float32Array;
                results.push(`✓ Normalized to ${RESEARCH_STANDARDS.targetPeakDb}dB`);
            }

            // Step 5: Soft limit to prevent clipping
            data = softLimit(data) as Float32Array;

            if (results.length === 0) {
                results.push('✓ Audio already meets standards!');
            }

            // Create new buffer
            const newBuffer = new AudioBuffer({
                numberOfChannels: 1,
                length: data.length,
                sampleRate: audioBuffer.sampleRate,
            });
            newBuffer.copyToChannel(data, 0);

            setProcessedBuffer(newBuffer);
            setAutoCleanResults(results);
            onProcessed?.(newBuffer);
            toast.success('AI Auto-Clean complete!', {
                description: `${results.length} optimizations applied`,
            });
        } catch (error) {
            console.error('Auto-clean error:', error);
            toast.error('Auto-clean failed');
        } finally {
            setIsProcessing(false);
            setActiveProcess(null);
        }
    }, [audioBuffer, onProcessed]);

    const processAudio = useCallback(async (type: ProcessingType) => {
        if (!audioBuffer) return;
        if (type === 'auto_clean') {
            return autoClean();
        }

        setIsProcessing(true);
        setActiveProcess(type);

        try {
            const channelData = new Float32Array(audioBuffer.length);
            audioBuffer.copyFromChannel(channelData, 0);

            let processedData: Float32Array;

            switch (type) {
                case 'normalize':
                    processedData = normalizeAudio(channelData, normalizeLevel) as Float32Array;
                    break;
                case 'trim':
                    processedData = trimSilence(channelData, audioBuffer.sampleRate, trimThreshold) as Float32Array;
                    break;
                case 'noise':
                    processedData = reduceNoise(channelData, noiseReduction) as Float32Array;
                    break;
                case 'dc_offset':
                    processedData = removeDCOffset(channelData) as Float32Array;
                    break;
                default:
                    processedData = channelData;
            }

            const newBuffer = new AudioBuffer({
                numberOfChannels: 1,
                length: processedData.length,
                sampleRate: audioBuffer.sampleRate,
            });
            newBuffer.copyToChannel(processedData, 0);

            setProcessedBuffer(newBuffer);
            onProcessed?.(newBuffer);
            toast.success(`${type.replace('_', ' ')} applied successfully`);
        } catch (error) {
            console.error('Processing error:', error);
            toast.error('Processing failed');
        } finally {
            setIsProcessing(false);
            setActiveProcess(null);
        }
    }, [audioBuffer, normalizeLevel, noiseReduction, trimThreshold, onProcessed, autoClean]);

    const downloadProcessed = useCallback((format: 'wav' | 'wav_22k' = 'wav') => {
        const bufferToDownload = processedBuffer || audioBuffer;
        if (!bufferToDownload) return;

        let finalBuffer = bufferToDownload;
        let suffix = '';

        // Resample to 22050Hz if requested (TTS standard)
        if (format === 'wav_22k' && bufferToDownload.sampleRate !== 22050) {
            finalBuffer = resampleBuffer(bufferToDownload, 22050);
            suffix = '_22kHz';
        }

        const wav = audioBufferToWav(finalBuffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_${filename.replace(/\.[^/.]+$/, '')}${suffix}.wav`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Audio downloaded (${format === 'wav_22k' ? '22kHz' : 'original SR'})`);
    }, [processedBuffer, audioBuffer, filename]);

    const resetProcessing = useCallback(() => {
        setProcessedBuffer(null);
        setAutoCleanResults([]);
        toast.info('Processing reset');
    }, []);

    if (!audioBuffer) {
        return (
            <div className="glass-panel">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Wand2 className="w-5 h-5 text-primary" />
                    Audio Processor
                </h3>
                <p className="text-muted-foreground text-sm">
                    Select an audio file to access processing tools
                </p>
            </div>
        );
    }

    return (
        <div className="glass-panel space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                Audio Processor
                {processedBuffer && <span className="badge-success text-xs">Modified</span>}
            </h3>

            {/* AI Auto-Clean - Featured */}
            <div
                onClick={() => !isProcessing && processAudio('auto_clean')}
                className={cn(
                    'p-4 rounded-xl border-2 transition-all cursor-pointer',
                    'bg-gradient-to-r from-primary/10 to-accent/10',
                    activeProcess === 'auto_clean'
                        ? 'border-primary shadow-lg shadow-primary/20'
                        : 'border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/10'
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                        {isProcessing && activeProcess === 'auto_clean'
                            ? <Loader2 className="w-6 h-6 animate-spin" />
                            : <Sparkles className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-base">AI Auto-Clean</p>
                        <p className="text-xs text-muted-foreground">
                            One-click optimization for TTS-ready audio
                        </p>
                    </div>
                </div>

                {autoCleanResults.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                        {autoCleanResults.map((result, i) => (
                            <p key={i} className="text-xs text-success flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> {result}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            {/* Manual Processing Tools */}
            <div className="grid grid-cols-2 gap-3">
                <ProcessingCard
                    icon={<Volume2 className="w-5 h-5" />}
                    title="Normalize"
                    description={`Target: ${normalizeLevel}dB`}
                    isActive={activeProcess === 'normalize'}
                    isProcessing={isProcessing && activeProcess === 'normalize'}
                    onClick={() => processAudio('normalize')}
                />
                <ProcessingCard
                    icon={<Scissors className="w-5 h-5" />}
                    title="Trim Silence"
                    description="Remove silence"
                    isActive={activeProcess === 'trim'}
                    isProcessing={isProcessing && activeProcess === 'trim'}
                    onClick={() => processAudio('trim')}
                />
                <ProcessingCard
                    icon={<VolumeX className="w-5 h-5" />}
                    title="Noise Gate"
                    description="Reduce noise"
                    isActive={activeProcess === 'noise'}
                    isProcessing={isProcessing && activeProcess === 'noise'}
                    onClick={() => processAudio('noise')}
                />
                <ProcessingCard
                    icon={<Waves className="w-5 h-5" />}
                    title="DC Offset"
                    description="Center waveform"
                    isActive={activeProcess === 'dc_offset'}
                    isProcessing={isProcessing && activeProcess === 'dc_offset'}
                    onClick={() => processAudio('dc_offset')}
                />
            </div>

            {/* Download Options */}
            <div className="space-y-2 pt-2 border-t border-border">
                <button
                    onClick={() => downloadProcessed('wav')}
                    className="btn-primary w-full"
                    disabled={!audioBuffer}
                >
                    <Download className="w-4 h-4" />
                    Download WAV (Original SR)
                </button>
                <button
                    onClick={() => downloadProcessed('wav_22k')}
                    className="btn-secondary w-full text-sm"
                    disabled={!audioBuffer}
                >
                    <Download className="w-4 h-4" />
                    Download WAV (22kHz TTS)
                </button>
                {processedBuffer && (
                    <button onClick={resetProcessing} className="btn-ghost w-full text-sm">
                        <RotateCcw className="w-4 h-4" />
                        Reset All Processing
                    </button>
                )}
            </div>
        </div>
    );
}

interface ProcessingCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    isActive: boolean;
    isProcessing: boolean;
    onClick: () => void;
}

function ProcessingCard({ icon, title, description, isActive, isProcessing, onClick }: ProcessingCardProps) {
    return (
        <div
            className={cn(
                'p-3 rounded-xl border transition-all cursor-pointer',
                isActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-secondary/30'
            )}
            onClick={!isProcessing ? onClick : undefined}
        >
            <div className="flex items-center gap-2">
                <div className={cn(
                    'p-1.5 rounded-lg',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                )}>
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
                </div>
                <div>
                    <p className="font-medium text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    );
}

// Helper Functions
function calculateMean(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    return sum / data.length;
}

function calculatePeak(data: Float32Array): number {
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
        const abs = Math.abs(data[i]);
        if (abs > peak) peak = abs;
    }
    return peak;
}

function estimateNoiseFloor(data: Float32Array): number {
    // Sample quiet sections
    const windowSize = Math.min(1000, data.length / 10);
    let minRms = Infinity;

    for (let i = 0; i < data.length - windowSize; i += windowSize) {
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
            sum += data[i + j] * data[i + j];
        }
        const rms = Math.sqrt(sum / windowSize);
        if (rms < minRms) minRms = rms;
    }

    return minRms;
}

function normalizeAudio(data: Float32Array, targetDb: number): Float32Array {
    const target = Math.pow(10, targetDb / 20);
    const peak = calculatePeak(data);
    if (peak === 0) return data;

    const gain = target / peak;
    const result = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = Math.max(-1, Math.min(1, data[i] * gain));
    }
    return result;
}

function trimSilence(data: Float32Array, sampleRate: number, thresholdDb: number): Float32Array {
    const threshold = Math.pow(10, thresholdDb / 20);
    const windowSize = Math.floor(sampleRate * 0.01);

    let startIndex = 0;
    let endIndex = data.length - 1;

    for (let i = 0; i < data.length - windowSize; i += windowSize) {
        let rms = 0;
        for (let j = 0; j < windowSize; j++) rms += data[i + j] * data[i + j];
        if (Math.sqrt(rms / windowSize) > threshold) {
            startIndex = Math.max(0, i - windowSize);
            break;
        }
    }

    for (let i = data.length - 1; i >= windowSize; i -= windowSize) {
        let rms = 0;
        for (let j = 0; j < windowSize; j++) rms += data[i - j] * data[i - j];
        if (Math.sqrt(rms / windowSize) > threshold) {
            endIndex = Math.min(data.length - 1, i + windowSize);
            break;
        }
    }

    return data.slice(startIndex, endIndex + 1);
}

function trimSilenceWithPadding(data: Float32Array, sampleRate: number): Float32Array {
    const trimmed = trimSilence(data, sampleRate, -40);

    // Add small padding (50ms lead, 100ms trail)
    const leadPad = Math.floor(sampleRate * 0.05);
    const trailPad = Math.floor(sampleRate * 0.1);

    const result = new Float32Array(trimmed.length + leadPad + trailPad);
    result.set(trimmed, leadPad);

    return result;
}

function reduceNoise(data: Float32Array, threshold: number): Float32Array {
    const result = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i]) < threshold) {
            result[i] = 0;
        } else {
            const sign = data[i] > 0 ? 1 : -1;
            result[i] = sign * (Math.abs(data[i]) - threshold * 0.5);
        }
    }
    return result;
}

function removeDCOffset(data: Float32Array): Float32Array {
    const mean = calculateMean(data);
    const result = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] - mean;
    }
    return result;
}

function softLimit(data: Float32Array): Float32Array {
    const result = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
        const x = data[i];
        if (Math.abs(x) > 0.9) {
            // Soft clip using tanh-like curve
            const sign = x > 0 ? 1 : -1;
            result[i] = sign * (0.9 + 0.1 * Math.tanh((Math.abs(x) - 0.9) * 5));
        } else {
            result[i] = x;
        }
    }
    return result;
}

function resampleBuffer(buffer: AudioBuffer, targetSampleRate: number): AudioBuffer {
    const ratio = buffer.sampleRate / targetSampleRate;
    const newLength = Math.floor(buffer.length / ratio);
    const data = buffer.getChannelData(0);
    const result = new Float32Array(newLength);

    // Simple linear interpolation resampling
    for (let i = 0; i < newLength; i++) {
        const srcIndex = i * ratio;
        const srcIndexFloor = Math.floor(srcIndex);
        const srcIndexCeil = Math.min(srcIndexFloor + 1, data.length - 1);
        const t = srcIndex - srcIndexFloor;
        result[i] = data[srcIndexFloor] * (1 - t) + data[srcIndexCeil] * t;
    }

    const newBuffer = new AudioBuffer({
        numberOfChannels: 1,
        length: newLength,
        sampleRate: targetSampleRate,
    });
    newBuffer.copyToChannel(result, 0);
    return newBuffer;
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = 1;
    const sampleRate = buffer.sampleRate;
    const bitDepth = 16;
    const data = buffer.getChannelData(0);
    const dataLength = data.length * 2;
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeStr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, bitDepth, true);
    writeStr(36, 'data');
    view.setUint32(40, dataLength, true);

    // Audio data
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
        const s = Math.max(-1, Math.min(1, data[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        offset += 2;
    }

    return arrayBuffer;
}
