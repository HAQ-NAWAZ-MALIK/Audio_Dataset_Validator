import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getAudioPath, getTranscriptionsPath, getMetadataPath, ensureDir, sanitizePath } from '@/lib/dataPath';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;
        const metadataStr = formData.get('metadata') as string;

        if (!audioFile || !metadataStr) {
            return NextResponse.json({ error: 'Missing audio or metadata' }, { status: 400 });
        }

        let metadata;
        try {
            metadata = JSON.parse(metadataStr);
        } catch {
            return NextResponse.json({ error: 'Invalid metadata JSON' }, { status: 400 });
        }

        const { speaker_id, dataset_name, text, font_style, timestamp, emotion, rating, duration } = metadata;

        // Validate required fields
        if (!speaker_id || !dataset_name || !text) {
            return NextResponse.json({ error: 'Missing required fields: speaker_id, dataset_name, or text' }, { status: 400 });
        }

        // Sanitize inputs to prevent path traversal
        const safeSpeakerId = sanitizePath(speaker_id);
        const safeDataset = sanitizePath(dataset_name);
        const safeText = sanitizePath(text.substring(0, 20));

        // Get paths using centralized data path utility
        const audioDir = getAudioPath(safeSpeakerId);
        const textDir = getTranscriptionsPath(safeSpeakerId);

        // Ensure directories exist
        await ensureDir(audioDir);
        await ensureDir(textDir);

        // Generate filename with timestamp for uniqueness
        const timeStr = new Date().toISOString().replace(/-/g, '').replace(/:/g, '').replace(/\./g, '').substring(0, 14);
        const index = metadata.index !== undefined ? `line${metadata.index + 1}` : `t${timeStr}`;

        const baseName = `${safeDataset}_${safeSpeakerId}_${index}_${safeText}_${timeStr}`;
        const audioName = `${baseName}.wav`;
        const textName = `${baseName}.txt`;

        // Save Audio
        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        await fs.writeFile(path.join(audioDir, audioName), audioBuffer);

        // Save Transcription
        const transcriptionContent = `[METADATA]
Recording_ID: ${audioName}
Speaker_ID: ${speaker_id}
Dataset_Name: ${dataset_name}
Timestamp: ${timestamp || new Date().toISOString()}
Font_Style: ${font_style || 'default'}
Emotion: ${emotion || 'neutral'}
Rating: ${rating || 3}
Duration: ${duration || 0}
[TEXT]
${text}
`;
        await fs.writeFile(path.join(textDir, textName), transcriptionContent);

        // Update Metadata
        const metadataDir = getMetadataPath();
        await ensureDir(metadataDir);
        const metadataPath = path.join(metadataDir, 'dataset_info.json');

        let datasetInfo: Record<string, unknown> = {
            speakers: {},
            last_updated: null,
            total_duration: 0,
            total_recordings: 0
        };

        try {
            const content = await fs.readFile(metadataPath, 'utf-8');
            datasetInfo = JSON.parse(content);
        } catch {
            // File doesn't exist yet, use defaults
        }

        datasetInfo.last_updated = new Date().toISOString();
        datasetInfo.total_recordings = (Number(datasetInfo.total_recordings) || 0) + 1;
        datasetInfo.total_duration = (Number(datasetInfo.total_duration) || 0) + (Number(duration) || 0);

        await fs.writeFile(metadataPath, JSON.stringify(datasetInfo, null, 2));

        return NextResponse.json({ success: true, filename: audioName });

    } catch (error) {
        console.error('Error saving recording:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
