import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getFontsPath, ensureDir, sanitizePath } from '@/lib/dataPath';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const fontFile = formData.get('font') as File;

        if (!fontFile) {
            return NextResponse.json({ error: 'No font file provided' }, { status: 400 });
        }

        if (!fontFile.name.endsWith('.ttf') && !fontFile.name.endsWith('.otf')) {
            return NextResponse.json({ error: 'Only .ttf and .otf files are supported' }, { status: 400 });
        }

        // Validate file size (max 10MB)
        const MAX_FONT_SIZE = 10 * 1024 * 1024; // 10MB
        if (fontFile.size > MAX_FONT_SIZE) {
            return NextResponse.json({ error: 'Font file too large (max 10MB)' }, { status: 400 });
        }

        const fontsDir = getFontsPath();
        await ensureDir(fontsDir);

        // Sanitize original name and add timestamp for uniqueness
        const timestamp = Date.now();
        const safeName = sanitizePath(fontFile.name.replace(/\.(ttf|otf)$/i, ''), 40);
        const extension = fontFile.name.endsWith('.otf') ? '.otf' : '.ttf';
        const fileName = `font_${timestamp}_${safeName}${extension}`;

        const buffer = Buffer.from(await fontFile.arrayBuffer());
        await fs.writeFile(path.join(fontsDir, fileName), buffer);

        return NextResponse.json({ success: true, filename: fileName });
    } catch (error) {
        console.error('Error uploading font:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
