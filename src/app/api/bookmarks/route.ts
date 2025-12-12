import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getMetadataPath, ensureDir, sanitizePath } from '@/lib/dataPath';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { speaker_id, dataset_name, index } = body;

        if (!speaker_id || !dataset_name || index === undefined) {
            return NextResponse.json({ error: 'Missing parameters: speaker_id, dataset_name, and index are required' }, { status: 400 });
        }

        // Validate index is a number
        if (typeof index !== 'number' || index < 0) {
            return NextResponse.json({ error: 'Invalid index: must be a non-negative number' }, { status: 400 });
        }

        // Sanitize inputs
        const safeSpeakerId = sanitizePath(speaker_id);
        const safeDatasetName = sanitizePath(dataset_name);

        const metadataDir = getMetadataPath();
        await ensureDir(metadataDir);
        const metadataPath = path.join(metadataDir, 'dataset_info.json');

        let datasetInfo: Record<string, unknown> = { speakers: {} };
        try {
            const content = await fs.readFile(metadataPath, 'utf-8');
            datasetInfo = JSON.parse(content);
        } catch {
            // File might not exist
        }

        // Ensure nested structure exists
        const speakers = (datasetInfo.speakers || {}) as Record<string, { datasets?: Record<string, { bookmarks?: number[] }> }>;
        if (!speakers[safeSpeakerId]) {
            speakers[safeSpeakerId] = { datasets: {} };
        }
        if (!speakers[safeSpeakerId].datasets) {
            speakers[safeSpeakerId].datasets = {};
        }
        if (!speakers[safeSpeakerId].datasets![safeDatasetName]) {
            speakers[safeSpeakerId].datasets![safeDatasetName] = { bookmarks: [] };
        }

        const ds = speakers[safeSpeakerId].datasets![safeDatasetName];
        if (!ds.bookmarks) ds.bookmarks = [];

        // Toggle bookmark
        if (ds.bookmarks.includes(index)) {
            ds.bookmarks = ds.bookmarks.filter((i: number) => i !== index);
        } else {
            ds.bookmarks.push(index);
            // Sort bookmarks for consistency
            ds.bookmarks.sort((a, b) => a - b);
        }

        datasetInfo.speakers = speakers;
        await fs.writeFile(metadataPath, JSON.stringify(datasetInfo, null, 2));

        return NextResponse.json({ success: true, bookmarks: ds.bookmarks });

    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const speaker_id = searchParams.get('speaker_id');
        const dataset_name = searchParams.get('dataset_name');

        if (!speaker_id || !dataset_name) {
            return NextResponse.json({ bookmarks: [] });
        }

        // Sanitize inputs
        const safeSpeakerId = sanitizePath(speaker_id);
        const safeDatasetName = sanitizePath(dataset_name);

        const metadataPath = path.join(getMetadataPath(), 'dataset_info.json');

        try {
            const content = await fs.readFile(metadataPath, 'utf-8');
            const datasetInfo = JSON.parse(content);
            const speakers = datasetInfo.speakers as Record<string, { datasets?: Record<string, { bookmarks?: number[] }> }>;
            const bookmarks = speakers[safeSpeakerId]?.datasets?.[safeDatasetName]?.bookmarks || [];
            return NextResponse.json({ bookmarks });
        } catch {
            return NextResponse.json({ bookmarks: [] });
        }
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
