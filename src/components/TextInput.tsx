'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TextInputProps {
    onSentencesLoaded: (sentences: string[]) => void;
}

/**
 * Smart sentence splitting that handles various text formats
 */
function splitIntoSentences(inputText: string): string[] {
    const text = inputText.trim();
    if (!text) return [];

    // Step 1: Normalize line endings
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Step 2: Check if text is already line-separated (common for TTS datasets)
    const lines = normalized.split('\n').map(s => s.trim()).filter(s => s.length > 0);

    // If we have multiple non-empty lines, assume each line is a sentence
    if (lines.length > 1) {
        return lines.filter(line => line.length >= 2);
    }

    // Step 3: Single block of text - need to split by sentence boundaries
    // This regex handles:
    // - Standard punctuation: . ! ?
    // - Ellipsis: ...
    // - Hindi/Urdu: । ۔
    // - Followed by whitespace or end of string
    // - Preserves abbreviations like "Mr.", "Dr.", "etc."

    const singleLine = lines[0] || text;

    // Common abbreviations to protect
    const abbreviations = [
        'Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Sr', 'Jr', 'vs', 'etc', 'i.e', 'e.g',
        'Inc', 'Ltd', 'Corp', 'Co', 'No', 'Vol', 'Rev', 'Fig', 'Eq'
    ];

    // Create placeholder for abbreviations
    let processed = singleLine;
    const placeholders: { [key: string]: string } = {};

    abbreviations.forEach((abbr, index) => {
        const placeholder = `__ABBR${index}__`;
        const regex = new RegExp(`\\b${abbr}\\.\\s`, 'gi');
        processed = processed.replace(regex, (match) => {
            placeholders[placeholder] = match;
            return placeholder;
        });
    });

    // Also protect decimal numbers (e.g., "3.14")
    processed = processed.replace(/(\d+)\.(\d+)/g, '$1__DECIMAL__$2');

    // Split by sentence-ending punctuation
    // Using a more robust pattern that handles multiple punctuation marks
    const sentenceEnders = /([.!?।۔]+)\s+/g;
    const parts = processed.split(sentenceEnders);

    // Reconstruct sentences (split creates alternating text and punctuation)
    const sentences: string[] = [];
    for (let i = 0; i < parts.length; i += 2) {
        let sentence = parts[i];
        if (i + 1 < parts.length) {
            sentence += parts[i + 1]; // Add punctuation back
        }
        sentence = sentence.trim();
        if (sentence) {
            sentences.push(sentence);
        }
    }

    // Restore placeholders
    const restored = sentences.map(s => {
        let result = s;
        Object.entries(placeholders).forEach(([placeholder, original]) => {
            result = result.replace(placeholder, original);
        });
        result = result.replace(/__DECIMAL__/g, '.');
        return result.trim();
    });

    // Filter out very short sentences (less than 2 characters)
    return restored.filter(s => s.length >= 2);
}

export default function TextInput({ onSentencesLoaded }: TextInputProps) {
    const [text, setText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processText = (inputText: string) => {
        if (!inputText.trim()) {
            toast.error('Please enter some text');
            return;
        }

        const sentences = splitIntoSentences(inputText);

        if (sentences.length > 0) {
            onSentencesLoaded(sentences);
            toast.success(`Loaded ${sentences.length} sentence${sentences.length > 1 ? 's' : ''}`);
            setText('');
        } else {
            toast.error('No valid sentences found. Try putting each sentence on a new line.');
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handlePaste = () => {
        processText(text);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setText(content);
            processText(content);
            toast.success(`File loaded: ${file.name}`);
        };
        reader.onerror = () => toast.error('Failed to read file');
        reader.readAsText(file);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Input Data
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-secondary/50 transition-colors cursor-pointer relative group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        accept=".txt,.csv"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium">Drop text file or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">.txt and .csv files supported</p>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or paste text</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <textarea
                        className="input min-h-[120px] resize-y"
                        placeholder="Paste your text here...&#10;&#10;• One sentence per line works best&#10;• Or paste a paragraph - it will be split automatically"
                        value={text}
                        onChange={handleTextChange}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handlePaste}
                            disabled={!text.trim()}
                            className="btn btn-primary flex-1"
                        >
                            Load Sentences
                        </button>
                        <button
                            onClick={() => setText('')}
                            disabled={!text.trim()}
                            className="btn btn-secondary"
                        >
                            Clear
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Tip: For best results, put each sentence on a new line
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
