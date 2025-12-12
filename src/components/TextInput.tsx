'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TextInputProps {
    onSentencesLoaded: (sentences: string[]) => void;
}

export default function TextInput({ onSentencesLoaded }: TextInputProps) {
    const [text, setText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processText = (inputText: string) => {
        if (!inputText.trim()) return;

        // Simple sentence splitting (can be improved or use API)
        // Split by . ! ? followed by space or newline
        const sentences = inputText
            .replace(/([.!?])\s+/g, '$1|')
            .split('|')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (sentences.length > 0) {
            onSentencesLoaded(sentences);
            toast.success(`Loaded ${sentences.length} sentences`);
            setText('');
        } else {
            toast.error('No valid sentences found');
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
                        accept=".txt"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium">Drop text file or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">.txt files supported</p>
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
                        className="input min-h-[100px] resize-none"
                        placeholder="Paste your sentences here (one per line)..."
                        value={text}
                        onChange={handleTextChange}
                    />
                    <button
                        onClick={handlePaste}
                        disabled={!text.trim()}
                        className="btn btn-secondary w-full"
                    >
                        Load Sentences
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
