import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getFontsPath, sanitizePath } from '@/lib/dataPath';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;

        // Security check: prevent directory traversal
        if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return new NextResponse('Invalid filename', { status: 400 });
        }

        // Validate file extension
        const ext = path.extname(filename).toLowerCase();
        if (ext !== '.ttf' && ext !== '.otf') {
            return new NextResponse('Invalid font file type', { status: 400 });
        }

        // Sanitize filename (but preserve extension)
        const baseName = sanitizePath(path.basename(filename, ext), 100);
        const safeFilename = `${baseName}${ext}`;

        const fontsDir = getFontsPath();
        const filePath = path.join(fontsDir, filename); // Use original filename for lookup

        try {
            const fileBuffer = await fs.readFile(filePath);
            const contentType = ext === '.otf' ? 'font/otf' : 'font/ttf';

            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        } catch {
            return new NextResponse('Font not found', { status: 404 });
        }
    } catch (error) {
        console.error('Error serving font:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
