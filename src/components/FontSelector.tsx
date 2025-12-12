'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Type, Upload, Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSuggestedFont } from '@/lib/language';

interface Font {
    name: string;
    family: string;
    css: string;
    url?: string;
}

interface FontSelectorProps {
    currentFont: string;
    onFontChange: (font: string) => void;
    detectedLang?: string;
}

export default function FontSelector({ currentFont, onFontChange, detectedLang }: FontSelectorProps) {
    const [fonts, setFonts] = useState<Font[]>([]);
    const [loading, setLoading] = useState(true);
    const [suggestedFont, setSuggestedFont] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFonts = async () => {
        try {
            const res = await fetch('/api/fonts');
            const data = await res.json();
            if (data.fonts) {
                setFonts(data.fonts);

                // Inject custom fonts styles
                data.fonts.forEach((font: Font) => {
                    if (font.url) {
                        const style = document.createElement('style');
                        style.textContent = `
              @font-face {
                font-family: '${font.family}';
                src: url('${font.url}') format('truetype');
              }
            `;
                        document.head.appendChild(style);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to fetch fonts', error);
            toast.error('Failed to load fonts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFonts();
    }, []);

    useEffect(() => {
        if (detectedLang) {
            const suggested = getSuggestedFont(detectedLang);
            setSuggestedFont(suggested);
        }
    }, [detectedLang]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('font', file);

        const promise = fetch('/api/upload-font', {
            method: 'POST',
            body: formData,
        }).then(async (res) => {
            if (!res.ok) throw new Error('Upload failed');
            await fetchFonts();
            return 'Font uploaded successfully';
        });

        toast.promise(promise, {
            loading: 'Uploading font...',
            success: (data) => data,
            error: 'Failed to upload font',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Typography
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="label">Display Font</label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {fonts.map((font) => (
                            <div
                                key={font.family}
                                className={`
                                    p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group
                                    ${currentFont === font.family
                                        ? 'bg-primary/10 border-primary shadow-sm'
                                        : 'bg-background hover:bg-secondary/50 border-border/50 hover:border-border'
                                    }
                                `}
                                onClick={() => onFontChange(font.family)}
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium" style={{ fontFamily: font.family }}>
                                        {font.name}
                                    </span>
                                    {suggestedFont === font.name && (
                                        <Badge variant="secondary" className="text-[10px] w-fit px-1.5 h-4 gap-1">
                                            <Star className="w-2 h-2 fill-current" /> Recommended
                                        </Badge>
                                    )}
                                </div>
                                {currentFont === font.family && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Select a font optimized for the target language.
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Custom Font</span>
                    </div>
                </div>

                <button
                    className="btn btn-secondary w-full"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload .ttf File
                </button>
                <input
                    type="file"
                    accept=".ttf"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                />
            </CardContent>
        </Card>
    );
}
