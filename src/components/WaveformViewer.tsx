'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
    Play, Pause, RotateCcw, ZoomIn, ZoomOut, Volume2,
    Maximize2, Minimize2, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WaveformViewerProps {
    audioBuffer: AudioBuffer | null;
    isPlaying: boolean;
    currentTime: number;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
    onReset: () => void;
    viewMode?: 'waveform' | 'bars' | 'mirror' | 'spectrum';
    highlightRegions?: { start: number; end: number; color: string; label: string }[];
}

export default function WaveformViewer({
    audioBuffer,
    isPlaying,
    currentTime,
    onPlayPause,
    onSeek,
    onReset,
    viewMode = 'waveform',
    highlightRegions = [],
}: WaveformViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [canvasHeight, setCanvasHeight] = useState(160);

    // Zoom presets
    const zoomPresets = [0.5, 1, 2, 4, 8, 16, 32, 50];

    // Height presets
    const heights = { minimized: 60, normal: 160, expanded: 300 };

    useEffect(() => {
        if (isMinimized) setCanvasHeight(heights.minimized);
        else if (isExpanded) setCanvasHeight(heights.expanded);
        else setCanvasHeight(heights.normal);
    }, [isMinimized, isExpanded]);

    // Pre-compute downsampled data for performance
    const downsampledData = useMemo(() => {
        if (!audioBuffer) return null;
        const data = audioBuffer.getChannelData(0);
        const targetLength = 2000; // Fixed samples for visualization
        const step = Math.max(1, Math.floor(data.length / targetLength));
        const result: { min: number; max: number; rms: number }[] = [];

        for (let i = 0; i < data.length; i += step) {
            let min = 1, max = -1, sum = 0, count = 0;
            for (let j = 0; j < step && i + j < data.length; j++) {
                const v = data[i + j];
                if (v < min) min = v;
                if (v > max) max = v;
                sum += v * v;
                count++;
            }
            result.push({ min, max, rms: Math.sqrt(sum / count) });
        }
        return result;
    }, [audioBuffer]);

    // Draw visualization
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || !audioBuffer || !downsampledData) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = container.clientWidth * zoom;
        const height = canvasHeight;
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        bgGradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.9)');
        bgGradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        const gridSpacing = Math.max(50, 100 / zoom);
        for (let i = 0; i < width; i += gridSpacing) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        }

        const amp = height / 2;

        // Draw highlight regions
        for (const region of highlightRegions) {
            const startX = (region.start / audioBuffer.duration) * width;
            const endX = (region.end / audioBuffer.duration) * width;
            ctx.fillStyle = region.color;
            ctx.fillRect(startX, 0, endX - startX, height);
        }

        // Draw based on view mode
        if (viewMode === 'waveform') {
            drawWaveform(ctx, downsampledData, width, height, amp);
        } else if (viewMode === 'bars') {
            drawColorfulBars(ctx, downsampledData, width, height);
        } else if (viewMode === 'mirror') {
            drawMirrorWaveform(ctx, downsampledData, width, height, amp);
        } else if (viewMode === 'spectrum') {
            drawSimpleSpectrum(ctx, downsampledData, width, height);
        }

        // Time markers
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '9px monospace';
        const markerCount = Math.min(20, Math.floor(width / 80));
        for (let i = 0; i <= markerCount; i++) {
            const t = (i / markerCount) * audioBuffer.duration;
            const x = (t / audioBuffer.duration) * width;
            ctx.fillText(formatTimeShort(t), x + 2, height - 4);
        }

        // Playhead
        const playheadX = (currentTime / audioBuffer.duration) * width;
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(playheadX, 0); ctx.lineTo(playheadX, height); ctx.stroke();
        ctx.shadowBlur = 0;

        // Playhead handle
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.moveTo(playheadX - 6, 0);
        ctx.lineTo(playheadX + 6, 0);
        ctx.lineTo(playheadX, 10);
        ctx.closePath();
        ctx.fill();

    }, [audioBuffer, downsampledData, zoom, viewMode, highlightRegions, currentTime, canvasHeight]);

    const drawWaveform = (
        ctx: CanvasRenderingContext2D,
        data: { min: number; max: number; rms: number }[],
        width: number,
        height: number,
        amp: number
    ) => {
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(0.33, '#6366f1');
        gradient.addColorStop(0.66, '#a855f7');
        gradient.addColorStop(1, '#ec4899');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, amp);

        const step = data.length / width;
        for (let i = 0; i < width; i++) {
            const idx = Math.floor(i * step);
            const d = data[Math.min(idx, data.length - 1)];
            ctx.lineTo(i, amp + d.min * amp * 0.9);
        }
        for (let i = width - 1; i >= 0; i--) {
            const idx = Math.floor(i * step);
            const d = data[Math.min(idx, data.length - 1)];
            ctx.lineTo(i, amp + d.max * amp * 0.9);
        }

        ctx.closePath();
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Center line
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(0, amp); ctx.lineTo(width, amp); ctx.stroke();
        ctx.setLineDash([]);
    };

    const drawColorfulBars = (
        ctx: CanvasRenderingContext2D,
        data: { min: number; max: number; rms: number }[],
        width: number,
        height: number
    ) => {
        const barCount = Math.min(200, Math.floor(width / 5));
        const barWidth = Math.max(2, (width / barCount) - 2);
        const gap = 2;

        for (let i = 0; i < barCount; i++) {
            const idx = Math.floor((i / barCount) * data.length);
            const d = data[Math.min(idx, data.length - 1)];
            const barHeight = Math.max(4, d.rms * height * 3);

            const x = i * (barWidth + gap);
            const y = (height - barHeight) / 2;
            const hue = (i / barCount) * 360;

            ctx.fillStyle = `hsl(${hue}, 85%, 55%)`;
            ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    };

    const drawMirrorWaveform = (
        ctx: CanvasRenderingContext2D,
        data: { min: number; max: number; rms: number }[],
        width: number,
        height: number,
        amp: number
    ) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.5, '#6366f1');
        gradient.addColorStop(1, '#10b981');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, amp);

        const step = data.length / width;
        for (let i = 0; i < width; i++) {
            const idx = Math.floor(i * step);
            const d = data[Math.min(idx, data.length - 1)];
            ctx.lineTo(i, amp - d.rms * amp * 1.5);
        }
        for (let i = width - 1; i >= 0; i--) {
            const idx = Math.floor(i * step);
            const d = data[Math.min(idx, data.length - 1)];
            ctx.lineTo(i, amp + d.rms * amp * 1.5);
        }

        ctx.closePath();
        ctx.fill();
    };

    // Simplified spectrum - no heavy computation
    const drawSimpleSpectrum = (
        ctx: CanvasRenderingContext2D,
        data: { min: number; max: number; rms: number }[],
        width: number,
        height: number
    ) => {
        const cols = Math.min(width, 400);
        const rows = 32;
        const colWidth = width / cols;
        const rowHeight = height / rows;

        for (let c = 0; c < cols; c++) {
            const idx = Math.floor((c / cols) * data.length);
            const d = data[Math.min(idx, data.length - 1)];
            const intensity = d.rms * 10;

            for (let r = 0; r < rows; r++) {
                // Simulate frequency bands (lower rows = lower freq)
                const freqFactor = 1 - (r / rows);
                const value = Math.min(1, intensity * freqFactor * (1 + Math.random() * 0.3));

                if (value > 0.05) {
                    // Fire gradient
                    const hue = 240 - value * 200;
                    const light = 30 + value * 40;
                    ctx.fillStyle = `hsl(${hue}, 90%, ${light}%)`;
                    ctx.fillRect(c * colWidth, r * rowHeight, colWidth, rowHeight);
                }
            }
        }

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px sans-serif';
        ctx.fillText('High', 4, 14);
        ctx.fillText('Low', 4, height - 6);
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!audioBuffer || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / rect.width) * audioBuffer.duration;
        onSeek(Math.max(0, Math.min(audioBuffer.duration, time)));
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60), sec = Math.floor(s % 60), ms = Math.floor((s % 1) * 100);
        return `${m}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    const formatTimeShort = (s: number) => {
        const m = Math.floor(s / 60), sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    if (!audioBuffer) {
        return (
            <div className="glass-panel h-[220px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <Volume2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">Select a file to view waveform</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "glass-panel space-y-4 transition-all duration-300",
            isExpanded && "fixed inset-4 z-50 bg-card/95 backdrop-blur-xl"
        )}>
            {/* Controls */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <button onClick={onPlayPause} className="btn-primary p-3 rounded-full">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button onClick={onReset} className="btn-ghost p-2">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <div className="px-3 py-1.5 rounded-lg bg-secondary/50 font-mono text-sm">
                        <span className="text-primary font-semibold">{formatTime(currentTime)}</span>
                        <span className="text-muted-foreground"> / {formatTime(audioBuffer.duration)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={() => setZoom(Math.max(0.5, zoom / 2))} className="btn-ghost p-2" disabled={zoom <= 0.5}>
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-0.5 px-1">
                        {zoomPresets.map((z) => (
                            <button
                                key={z}
                                onClick={() => setZoom(z)}
                                className={cn(
                                    "px-1.5 py-0.5 text-xs rounded transition-all",
                                    zoom === z ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                                )}
                            >
                                {z}x
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setZoom(Math.min(50, zoom * 2))} className="btn-ghost p-2" disabled={zoom >= 50}>
                        <ZoomIn className="w-4 h-4" />
                    </button>

                    <div className="w-px h-5 bg-border mx-1" />

                    <button onClick={() => { setIsMinimized(!isMinimized); setIsExpanded(false); }} className={cn("btn-ghost p-2", isMinimized && "text-primary")}>
                        {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setIsExpanded(!isExpanded); setIsMinimized(false); }} className={cn("btn-ghost p-2", isExpanded && "text-primary")}>
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div ref={containerRef} className="overflow-x-auto rounded-xl" style={{ maxWidth: '100%' }}>
                <canvas ref={canvasRef} onClick={handleCanvasClick} className="cursor-crosshair block rounded-xl" />
            </div>
        </div>
    );
}
