export interface AudioFile {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'analyzing' | 'done' | 'error';
    analysis?: AnalysisResult;
    error?: string;
}

export interface AnalysisResult {
    duration: number;
    sampleRate: number;
    channels: number;
    bitDepth: number;
    format: string;
    peakAmplitude: number;
    rmsLevel: number;
    silenceStart: number;
    silenceEnd: number;
    hasClipping: boolean;
    dcOffset: number;
    healthScore: number;
    issues: Issue[];
}

export interface Issue {
    type: IssueType;
    severity: 'info' | 'warning' | 'error';
    message: string;
    suggestion: string;
}

export type IssueType =
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

export interface DatasetStats {
    totalFiles: number;
    analyzedFiles: number;
    passCount: number;
    warnCount: number;
    errorCount: number;
    averageHealthScore: number;
    totalDuration: number;
    issueBreakdown: Record<IssueType, number>;
}

export interface AnalysisSettings {
    targetSampleRate: number;
    minDuration: number;
    maxDuration: number;
    silenceThreshold: number;
    silenceMaxDuration: number;
    clippingThreshold: number;
    lowVolumeThreshold: number;
    dcOffsetThreshold: number;
}

export const DEFAULT_SETTINGS: AnalysisSettings = {
    targetSampleRate: 22050,
    minDuration: 0.5,
    maxDuration: 30,
    silenceThreshold: -40, // dB
    silenceMaxDuration: 0.3, // seconds
    clippingThreshold: 0.99,
    lowVolumeThreshold: -30, // dB RMS
    dcOffsetThreshold: 0.01,
};
