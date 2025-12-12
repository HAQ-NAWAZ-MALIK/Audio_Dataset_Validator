import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import archiver from 'archiver';
import { getDataPath, sanitizePath } from '@/lib/dataPath';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const datasetName = searchParams.get('dataset_name');

    if (!datasetName) {
        return NextResponse.json({ error: 'Dataset name required' }, { status: 400 });
    }

    // Sanitize dataset name to prevent path traversal
    const safeDatasetName = sanitizePath(datasetName);
    const datasetDir = getDataPath(safeDatasetName);

    try {
        await fs.access(datasetDir);
    } catch {
        return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    const stream = new ReadableStream({
        async start(controller) {
            archive.on('data', (chunk) => {
                controller.enqueue(chunk);
            });

            archive.on('end', () => {
                controller.close();
            });

            archive.on('error', (err) => {
                console.error('Archive error:', err);
                controller.error(err);
            });

            // Generate metadata.csv for LJSpeech compatibility
            try {
                const metadataPath = path.join(datasetDir, 'dataset_info.json');
                const metadataContent = await fs.readFile(metadataPath, 'utf-8');
                const metadata = JSON.parse(metadataContent);

                if (metadata.recordings && Array.isArray(metadata.recordings)) {
                    const csvContent = metadata.recordings.map((r: { filename?: string; text?: string }) =>
                        `${r.filename || ''}|${r.text || ''}`
                    ).join('\n');
                    archive.append(csvContent, { name: 'metadata.csv' });
                }
            } catch (e) {
                console.warn('Could not generate metadata.csv', e);
            }

            try {
                archive.directory(datasetDir, false);
                archive.finalize();
            } catch (error) {
                console.error('Error finalizing archive:', error);
                controller.error(error);
            }
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${safeDatasetName}.zip"`
        }
    });
}
