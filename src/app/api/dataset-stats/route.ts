import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getMetadataPath, ensureDir, getDataDir } from '@/lib/dataPath';
import { getCleanupConfig } from '@/lib/cleanup';

export async function GET() {
    try {
        const metadataDir = getMetadataPath();
        await ensureDir(metadataDir);
        const metadataPath = path.join(metadataDir, 'dataset_info.json');

        let metadata: Record<string, unknown> = { speakers: {}, last_updated: null };
        try {
            const content = await fs.readFile(metadataPath, 'utf-8');
            metadata = JSON.parse(content);
        } catch {
            // File might not exist yet
        }

        // Flatten statistics
        let recordedSentences = 0;
        const speakers = metadata.speakers as Record<string, { datasets?: Record<string, { recordings?: number }> }>;

        for (const speakerId in speakers) {
            const speaker = speakers[speakerId];
            if (speaker?.datasets) {
                for (const datasetName in speaker.datasets) {
                    const dataset = speaker.datasets[datasetName];
                    recordedSentences += dataset?.recordings || 0;
                }
            }
        }

        // Get cleanup configuration for display
        const cleanupConfig = getCleanupConfig();

        return NextResponse.json({
            lastUpdated: metadata.last_updated || null,
            total_recordings: Number(metadata.total_recordings) || 0,
            total_duration: Number(metadata.total_duration) || 0,
            recent_recordings: Array.isArray(metadata.recent_recordings) ? metadata.recent_recordings : [],
            speakers: Object.keys(speakers).length,
            recordedSentences,
            // Include storage info for transparency
            storage: {
                dataDirectory: getDataDir(),
                autoCleanupHours: cleanupConfig.maxFileAgeHours,
                isHuggingFaceSpaces: getDataDir() === '/data'
            },
            details: metadata
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
