'use client';

import {
    Clock, Mic2, Radio, Waves, Volume2, Activity,
    AlertCircle, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { AudioFile, AnalysisResult } from '@/types/audio';
import { formatDuration, formatSampleRate, cn } from '@/lib/utils';
import HealthScore from './HealthScore';
import { IssueList } from './IssueTag';

interface AnalysisPanelProps {
    file: AudioFile | null;
}

export default function AnalysisPanel({ file }: AnalysisPanelProps) {
    if (!file) {
        return (
            <div className="glass-card h-full flex flex-col items-center justify-center text-center py-12">
                <Activity className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No file selected</h3>
                <p className="text-sm text-muted-foreground/70 mt-1">
                    Select a file from the list to view analysis
                </p>
            </div>
        );
    }

    if (file.status === 'pending') {
        return (
            <div className="glass-card h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Waiting to analyze</h3>
                <p className="text-sm text-muted-foreground mt-1">{file.name}</p>
            </div>
        );
    }

    if (file.status === 'analyzing') {
        return (
            <div className="glass-card h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                <h3 className="text-lg font-medium">Analyzing audio...</h3>
                <p className="text-sm text-muted-foreground mt-1">{file.name}</p>
            </div>
        );
    }

    if (file.status === 'error') {
        return (
            <div className="glass-card h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-lg font-medium text-destructive">Analysis failed</h3>
                <p className="text-sm text-muted-foreground mt-1">{file.error || 'Unknown error'}</p>
            </div>
        );
    }

    const analysis = file.analysis!;

    return (
        <div className="glass-card h-full overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold truncate max-w-md">{file.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {analysis.format} • {formatDuration(analysis.duration)} • {formatSampleRate(analysis.sampleRate)}
                    </p>
                </div>
                <HealthScore score={analysis.healthScore} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <MetricCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Duration"
                    value={formatDuration(analysis.duration)}
                />
                <MetricCard
                    icon={<Radio className="w-5 h-5" />}
                    label="Sample Rate"
                    value={formatSampleRate(analysis.sampleRate)}
                />
                <MetricCard
                    icon={<Mic2 className="w-5 h-5" />}
                    label="Channels"
                    value={analysis.channels === 1 ? 'Mono' : 'Stereo'}
                />
                <MetricCard
                    icon={<Waves className="w-5 h-5" />}
                    label="Bit Depth"
                    value={`${analysis.bitDepth}-bit`}
                />
                <MetricCard
                    icon={<Volume2 className="w-5 h-5" />}
                    label="Peak Level"
                    value={`${(analysis.peakAmplitude * 100).toFixed(1)}%`}
                />
                <MetricCard
                    icon={<Activity className="w-5 h-5" />}
                    label="RMS Level"
                    value={`${analysis.rmsLevel.toFixed(1)} dB`}
                />
            </div>

            {/* Silence Info */}
            {(analysis.silenceStart > 0.1 || analysis.silenceEnd > 0.1) && (
                <div className="mb-6 p-4 rounded-xl bg-warning/10">
                    <h3 className="text-sm font-medium text-warning mb-2">Silence Detection</h3>
                    <div className="flex gap-6 text-sm">
                        <div>
                            <span className="text-muted-foreground">Start: </span>
                            <span className="font-medium">{analysis.silenceStart.toFixed(2)}s</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">End: </span>
                            <span className="font-medium">{analysis.silenceEnd.toFixed(2)}s</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Issues */}
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {analysis.issues.length === 0 ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                    ) : analysis.issues.some(i => i.severity === 'error') ? (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                    )}
                    Issues ({analysis.issues.length})
                </h3>
                <IssueList issues={analysis.issues} />
            </div>
        </div>
    );
}

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function MetricCard({ icon, label, value }: MetricCardProps) {
    return (
        <div className="p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-lg font-semibold">{value}</p>
        </div>
    );
}
