import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getDataPath, ensureDir, sanitizePath } from '@/lib/dataPath';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { speaker_id, dataset_name, index, text, reason } = data;

        if (!speaker_id || !dataset_name) {
            return NextResponse.json({ success: false, error: 'Missing required fields: speaker_id and dataset_name' }, { status: 400 });
        }

        // Sanitize inputs
        const safeSpeakerId = sanitizePath(speaker_id);
        const safeDatasetName = sanitizePath(dataset_name);

        const datasetDir = getDataPath(safeDatasetName);
        const skippedFile = path.join(datasetDir, 'skipped.json');

        // Ensure dataset directory exists
        await ensureDir(datasetDir);

        let skippedData: Array<{
            speaker_id: string;
            index: number;
            text: string;
            reason: string;
            timestamp: string;
        }> = [];

        try {
            const fileContent = await fs.readFile(skippedFile, 'utf-8');
            skippedData = JSON.parse(fileContent);

            // Ensure it's an array
            if (!Array.isArray(skippedData)) {
                skippedData = [];
            }
        } catch {
            // File doesn't exist or is empty, start new
        }

        const newSkip = {
            speaker_id: safeSpeakerId,
            index: typeof index === 'number' ? index : -1,
            text: typeof text === 'string' ? text.substring(0, 500) : '', // Limit text length
            reason: typeof reason === 'string' ? reason : 'Skipped by user',
            timestamp: new Date().toISOString()
        };

        skippedData.push(newSkip);

        await fs.writeFile(skippedFile, JSON.stringify(skippedData, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error skipping recording:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
