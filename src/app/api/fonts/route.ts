import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getFontsPath, ensureDir } from '@/lib/dataPath';

const DEFAULT_FONTS = [
    { name: "Times New Roman", family: "Times New Roman", css: "font-family: 'Times New Roman', serif;" },
    { name: "Arial", family: "Arial", css: "font-family: Arial, sans-serif;" },
    { name: "Nastaliq", family: "Noto Nastaliq Urdu", css: "font-family: 'Noto Nastaliq Urdu', serif;" },
    { name: "Naskh", family: "Scheherazade New", css: "font-family: 'Scheherazade New', serif;" }
];

export async function GET() {
    try {
        const fontsDir = getFontsPath();
        await ensureDir(fontsDir);

        let files: string[] = [];
        try {
            files = await fs.readdir(fontsDir);
        } catch {
            // Directory might not exist yet
        }

        const customFonts = files
            .filter(file => file.endsWith('.ttf') || file.endsWith('.otf'))
            .map(file => {
                const family = path.basename(file, path.extname(file));
                return {
                    name: file,
                    family: family,
                    css: `font-family: '${family}', serif;`,
                    url: `/api/fonts/${encodeURIComponent(file)}`,
                    isCustom: true
                };
            });

        return NextResponse.json({ fonts: [...DEFAULT_FONTS, ...customFonts] });
    } catch (error) {
        console.error('Error listing fonts:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
