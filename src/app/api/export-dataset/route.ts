import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import archiver from 'archiver';
import { getDataDir, getAudioPath, getTranscriptionsPath, getMetadataPath } from '@/lib/dataPath';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const speakerId = searchParams.get('speaker_id');

    // Get the base data directory
    const dataDir = getDataDir();

    try {
        await fs.access(dataDir);
    } catch {
        return NextResponse.json({ error: 'Data directory not found' }, { status: 404 });
    }

    const archive = archiver('zip', {
        zlib: { level: 9 }
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

            try {
                // Generate metadata.csv for LJSpeech compatibility
                const metadataPath = path.join(getMetadataPath(), 'dataset_info.json');
                try {
                    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
                    const metadata = JSON.parse(metadataContent);

                    if (metadata.recordings && Array.isArray(metadata.recordings)) {
                        const csvContent = metadata.recordings.map((r: { filename?: string; text?: string }) =>
                            `${r.filename || ''}|${r.text || ''}`
                        ).join('\n');
                        archive.append(csvContent, { name: 'metadata.csv' });
                    }
                } catch {
                    console.warn('Could not generate metadata.csv');
                }

                // If speaker_id is provided, only export that speaker's data
                if (speakerId) {
                    const audioDir = getAudioPath(speakerId);
                    const textDir = getTranscriptionsPath(speakerId);

                    try {
                        await fs.access(audioDir);
                        archive.directory(audioDir, `audio/${speakerId}`);
                    } catch {
                        // No audio for this speaker
                    }

                    try {
                        await fs.access(textDir);
                        archive.directory(textDir, `transcriptions/${speakerId}`);
                    } catch {
                        // No transcriptions for this speaker
                    }
                } else {
                    // Export all data
                    const audioDir = getAudioPath();
                    const textDir = getTranscriptionsPath();

                    try {
                        await fs.access(audioDir);
                        archive.directory(audioDir, 'audio');
                    } catch {
                        // No audio folder
                    }

                    try {
                        await fs.access(textDir);
                        archive.directory(textDir, 'transcriptions');
                    } catch {
                        // No transcriptions folder
                    }
                }

                archive.finalize();
            } catch (error) {
                console.error('Error creating archive:', error);
                controller.error(error);
            }
        }
    });

    const filename = speakerId ? `dataset_${speakerId}.zip` : 'dataset_full.zip';

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${filename}"`
        }
    });
}
