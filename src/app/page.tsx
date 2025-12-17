'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import AudioDropzone from '@/components/AudioDropzone';
import FileList from '@/components/FileList';
import AnalysisPanel from '@/components/AnalysisPanel';
import SummaryCard from '@/components/SummaryCard';
import WaveformViewer from '@/components/WaveformViewer';
import AudioProcessor from '@/components/AudioProcessor';
import { AudioFile } from '@/types/audio';
import { analyzeAudio } from '@/lib/audioAnalyzer';
import { Waves, BarChart3, Activity, Radio } from 'lucide-react';

type ViewMode = 'waveform' | 'bars' | 'mirror' | 'spectrum';

export default function Home() {
    const [files, setFiles] = useState<AudioFile[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Audio playback state
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [viewMode, setViewMode] = useState<ViewMode>('waveform');

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const startTimeRef = useRef<number>(0);
    const animationRef = useRef<number>(0);

    // Load audio buffer when file changes
    useEffect(() => {
        const loadAudioBuffer = async () => {
            const selectedFile = files.find(f => f.id === selectedId);
            if (!selectedFile) {
                setAudioBuffer(null);
                return;
            }

            try {
                const ctx = new AudioContext();
                const arrayBuffer = await selectedFile.file.arrayBuffer();
                const buffer = await ctx.decodeAudioData(arrayBuffer);
                setAudioBuffer(buffer);
                audioContextRef.current = ctx;
            } catch (error) {
                console.error('Failed to load audio:', error);
            }
        };

        loadAudioBuffer();
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [selectedId, files]);

    // Animation loop for playhead
    useEffect(() => {
        if (isPlaying && audioContextRef.current) {
            const updateTime = () => {
                const elapsed = audioContextRef.current!.currentTime - startTimeRef.current;
                setCurrentTime(elapsed);

                if (audioBuffer && elapsed >= audioBuffer.duration) {
                    setIsPlaying(false);
                    setCurrentTime(0);
                } else {
                    animationRef.current = requestAnimationFrame(updateTime);
                }
            };
            animationRef.current = requestAnimationFrame(updateTime);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, audioBuffer]);

    const handlePlayPause = useCallback(() => {
        if (!audioBuffer || !audioContextRef.current) return;

        if (isPlaying) {
            sourceNodeRef.current?.stop();
            setIsPlaying(false);
        } else {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsPlaying(false);

            startTimeRef.current = audioContextRef.current.currentTime - currentTime;
            source.start(0, currentTime);
            sourceNodeRef.current = source;
            setIsPlaying(true);
        }
    }, [audioBuffer, isPlaying, currentTime]);

    const handleSeek = useCallback((time: number) => {
        setCurrentTime(time);
        if (isPlaying) {
            sourceNodeRef.current?.stop();

            if (audioBuffer && audioContextRef.current) {
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.onended = () => setIsPlaying(false);

                startTimeRef.current = audioContextRef.current.currentTime - time;
                source.start(0, time);
                sourceNodeRef.current = source;
            }
        }
    }, [audioBuffer, isPlaying]);

    const handleReset = useCallback(() => {
        if (isPlaying) {
            sourceNodeRef.current?.stop();
            setIsPlaying(false);
        }
        setCurrentTime(0);
    }, [isPlaying]);

    const handleFilesAdded = useCallback(async (newFiles: File[]) => {
        const audioFiles: AudioFile[] = newFiles.map((file) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending' as const,
        }));

        setFiles((prev) => [...prev, ...audioFiles]);

        if (!selectedId && audioFiles.length > 0) {
            setSelectedId(audioFiles[0].id);
        }

        setIsProcessing(true);

        for (const audioFile of audioFiles) {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === audioFile.id ? { ...f, status: 'analyzing' as const } : f
                )
            );

            try {
                const analysis = await analyzeAudio(audioFile.file);

                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === audioFile.id
                            ? { ...f, status: 'done' as const, analysis }
                            : f
                    )
                );
            } catch (error) {
                console.error('Analysis error:', error);
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === audioFile.id
                            ? {
                                ...f,
                                status: 'error' as const,
                                error: error instanceof Error ? error.message : 'Analysis failed',
                            }
                            : f
                    )
                );
            }
        }

        setIsProcessing(false);
    }, [selectedId]);

    const handleSelectFile = useCallback((id: string) => {
        setSelectedId(id);
        setCurrentTime(0);
        setIsPlaying(false);
    }, []);

    const handleRemoveFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        if (selectedId === id) {
            setSelectedId(null);
            setAudioBuffer(null);
        }
    }, [selectedId]);

    const handleClearAll = useCallback(() => {
        setFiles([]);
        setSelectedId(null);
        setAudioBuffer(null);
    }, []);

    const handleProcessedBuffer = useCallback((buffer: AudioBuffer) => {
        setAudioBuffer(buffer);
    }, []);

    const selectedFile = files.find((f) => f.id === selectedId) || null;

    // Get highlight regions for waveform
    const getHighlightRegions = () => {
        if (!selectedFile?.analysis) return [];
        const regions = [];

        if (selectedFile.analysis.silenceStart > 0.1) {
            regions.push({
                start: 0,
                end: selectedFile.analysis.silenceStart,
                color: 'rgba(245, 158, 11, 0.3)',
                label: 'Silence',
            });
        }

        if (selectedFile.analysis.silenceEnd > 0.1 && audioBuffer) {
            regions.push({
                start: audioBuffer.duration - selectedFile.analysis.silenceEnd,
                end: audioBuffer.duration,
                color: 'rgba(245, 158, 11, 0.3)',
                label: 'Silence',
            });
        }

        return regions;
    };

    return (
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Header />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Upload & File List */}
                    <motion.div
                        className="lg:col-span-3 space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AudioDropzone
                            onFilesAdded={handleFilesAdded}
                            isProcessing={isProcessing}
                        />
                        <div className="h-[350px]">
                            <FileList
                                files={files}
                                selectedId={selectedId}
                                onSelect={handleSelectFile}
                                onRemove={handleRemoveFile}
                                onClearAll={handleClearAll}
                            />
                        </div>
                    </motion.div>

                    {/* Center Column - Analysis & Waveform */}
                    <motion.div
                        className="lg:col-span-6 space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        {/* View Mode Toggle */}
                        {audioBuffer && (
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm text-muted-foreground mr-2">Visualization:</span>
                                <button
                                    onClick={() => setViewMode('waveform')}
                                    className={`btn-icon ${viewMode === 'waveform' ? 'btn-primary' : 'btn-ghost'}`}
                                    title="Waveform"
                                >
                                    <Waves className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('bars')}
                                    className={`btn-icon ${viewMode === 'bars' ? 'btn-primary' : 'btn-ghost'}`}
                                    title="Bars"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('mirror')}
                                    className={`btn-icon ${viewMode === 'mirror' ? 'btn-primary' : 'btn-ghost'}`}
                                    title="Mirror"
                                >
                                    <Activity className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('spectrum')}
                                    className={`btn-icon ${viewMode === 'spectrum' ? 'btn-primary' : 'btn-ghost'}`}
                                    title="Spectrogram"
                                >
                                    <Radio className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Waveform Viewer */}
                        <WaveformViewer
                            audioBuffer={audioBuffer}
                            isPlaying={isPlaying}
                            currentTime={currentTime}
                            onPlayPause={handlePlayPause}
                            onSeek={handleSeek}
                            onReset={handleReset}
                            viewMode={viewMode}
                            highlightRegions={getHighlightRegions()}
                        />

                        {/* Analysis Panel */}
                        <div className="h-[400px]">
                            <AnalysisPanel file={selectedFile} />
                        </div>
                    </motion.div>

                    {/* Right Column - Summary & Processor */}
                    <motion.div
                        className="lg:col-span-3 space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <SummaryCard files={files} />

                        <AudioProcessor
                            audioBuffer={audioBuffer}
                            filename={selectedFile?.name || 'audio'}
                            onProcessed={handleProcessedBuffer}
                        />
                    </motion.div>
                </div>

                {/* Footer */}
                <footer className="mt-8 text-center text-sm text-muted-foreground">
                    <p>
                        Audio Dataset Validator • Built for TTS/ASR dataset creators
                    </p>
                </footer>
            </div>
        </main>
    );
}
