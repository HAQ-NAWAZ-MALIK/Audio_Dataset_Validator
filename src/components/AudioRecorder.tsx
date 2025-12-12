'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Save, Play, SkipForward, SkipBack, Star, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
    speakerId: string;
    datasetName: string;
    text: string;
    fontStyle: string;
    index: number;
    onSaved: () => void;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    hasPrev: boolean;
    hasNext: boolean;
    autoAdvance: boolean;
    autoSave: boolean;
    silenceThreshold: number;
}

const EMOTIONS = [
    { id: 'neutral', label: 'Neutral', color: 'bg-gray-500' },
    { id: 'happy', label: 'Happy', color: 'bg-yellow-500' },
    { id: 'sad', label: 'Sad', color: 'bg-blue-500' },
    { id: 'angry', label: 'Angry', color: 'bg-red-500' },
    { id: 'surprised', label: 'Surprised', color: 'bg-purple-500' },
    { id: 'whisper', label: 'Whisper', color: 'bg-indigo-500' },
    { id: 'excited', label: 'Excited', color: 'bg-orange-500' },
];

export default function AudioRecorder({
    speakerId,
    datasetName,
    text,
    fontStyle,
    index,
    onSaved,
    onNext,
    onPrev,
    onSkip,
    hasPrev,
    hasNext,
    autoAdvance,
    autoSave,
    silenceThreshold
}: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSilent, setIsSilent] = useState(false);
    const [emotion, setEmotion] = useState('neutral');
    const [rating, setRating] = useState(3);
    const [duration, setDuration] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];
            startTimeRef.current = Date.now();

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                setDuration((Date.now() - startTimeRef.current) / 1000);
                stopVisualizer();

                if (autoSave) {
                    saveRecording(blob);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            startVisualizer(stream);
            toast.info('Recording started');
        } catch (err) {
            console.error('Error accessing microphone:', err);
            toast.error('Could not access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            toast.info('Recording stopped');
        }
    };

    const startVisualizer = (stream: MediaStream) => {
        if (!canvasRef.current) return;

        // @ts-ignore
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            if (!analyserRef.current) return;

            animationFrameRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteTimeDomainData(dataArray);

            // Calculate RMS for level meter
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                const x = (dataArray[i] - 128) / 128.0;
                sum += x * x;
            }
            const rms = Math.sqrt(sum / bufferLength);
            const db = 20 * Math.log10(rms);
            // Normalize db to 0-1 range (approx -60db to 0db)
            const level = Math.max(0, (db + 60) / 60);
            setAudioLevel(level);

            // Silence detection
            const isCurrentlySilent = level < (silenceThreshold / 100);
            setIsSilent(isCurrentlySilent);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 2;
            ctx.strokeStyle = isCurrentlySilent ? 'rgb(239, 68, 68)' : 'rgb(139, 92, 246)';
            ctx.beginPath();

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };

        draw();
    };

    const stopVisualizer = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setAudioLevel(0);
    };

    const saveRecording = async (blobToSave: Blob | null = audioBlob) => {
        if (!blobToSave || !speakerId || !datasetName) {
            toast.error('Missing recording or metadata');
            return;
        }

        setIsSaving(true);
        const formData = new FormData();
        formData.append('audio', blobToSave);
        formData.append('metadata', JSON.stringify({
            speaker_id: speakerId,
            dataset_name: datasetName,
            text: text,
            font_style: fontStyle,
            index: index,
            emotion: emotion,
            rating: rating,
            duration: duration,
            timestamp: new Date().toISOString()
        }));

        try {
            const res = await fetch('/api/save-recording', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                onSaved();
                setAudioBlob(null);
                setAudioUrl(null);
                toast.success('Recording saved successfully');
                if (autoAdvance) {
                    onNext();
                }
            } else {
                toast.error('Failed to save recording');
            }
        } catch (err) {
            console.error('Error saving:', err);
            toast.error('Error saving recording');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-primary/10">
            <CardContent className="p-6 space-y-6">
                {/* Meter Bar */}
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-75 ease-out"
                        style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
                    />
                </div>

                <div className="flex justify-center relative">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={100}
                        className="w-full h-24 bg-secondary/30 rounded-xl border border-border"
                    />
                    {isRecording && isSilent && (
                        <Badge variant="destructive" className="absolute top-2 right-2 animate-pulse">
                            SILENCE DETECTED
                        </Badge>
                    )}
                </div>

                <div className="flex justify-center gap-6 items-center">
                    <AnimatePresence mode="wait">
                        {!isRecording ? (
                            <motion.button
                                key="record"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-shadow"
                                onClick={startRecording}
                                id="record-btn"
                            >
                                <Mic className="w-8 h-8 text-white" />
                            </motion.button>
                        ) : (
                            <motion.button
                                key="stop"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center shadow-lg hover:bg-secondary/80"
                                onClick={stopRecording}
                            >
                                <Square className="w-8 h-8 fill-current" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {audioUrl && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-6 overflow-hidden"
                        >
                            <div className="flex items-center justify-between gap-4 p-4 bg-secondary/20 rounded-xl border border-border/50">
                                <audio src={audioUrl} controls className="flex-1 h-8" />
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                                    {duration.toFixed(1)}s
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="label">Emotion</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EMOTIONS.map((e) => (
                                            <button
                                                key={e.id}
                                                onClick={() => setEmotion(e.id)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                                    emotion === e.id
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
                                                )}
                                            >
                                                {e.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="label">Quality Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className="p-1 hover:scale-110 transition-transform"
                                            >
                                                <Star
                                                    className={cn(
                                                        "w-6 h-6 transition-colors",
                                                        star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-border/50">
                                <button
                                    className="btn btn-secondary flex-1"
                                    onClick={onPrev}
                                    disabled={!hasPrev}
                                >
                                    <SkipBack className="w-4 h-4 mr-2" />
                                    Previous
                                </button>

                                <button
                                    className="btn btn-secondary flex-1"
                                    onClick={onSkip}
                                    title="Skip this sentence"
                                >
                                    <SkipForward className="w-4 h-4 mr-2" />
                                    Skip
                                </button>

                                <button
                                    className="btn btn-primary flex-[2]"
                                    onClick={() => saveRecording()}
                                    disabled={isSaving}
                                    id="save-btn"
                                >
                                    {isSaving ? 'Saving...' : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save & Next
                                        </>
                                    )}
                                </button>

                                <button
                                    className="btn btn-secondary flex-1"
                                    onClick={onNext}
                                    disabled={!hasNext}
                                >
                                    Next
                                    <SkipForward className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
