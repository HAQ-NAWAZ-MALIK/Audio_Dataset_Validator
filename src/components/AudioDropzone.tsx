'use client';

import { useCallback } from 'react';
import { Upload, FileAudio, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface AudioDropzoneProps {
    onFilesAdded: (files: File[]) => void;
    isProcessing: boolean;
}

const ACCEPTED_TYPES = [
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/flac',
    'audio/ogg',
    'audio/webm',
    'audio/m4a',
    'audio/x-m4a',
];

const ACCEPTED_EXTENSIONS = ['.wav', '.mp3', '.flac', '.ogg', '.webm', '.m4a'];

export default function AudioDropzone({ onFilesAdded, isProcessing }: AudioDropzoneProps) {
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processFiles(files);
        e.target.value = ''; // Reset for same file selection
    }, []);

    const processFiles = (files: File[]) => {
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        for (const file of files) {
            const ext = '.' + file.name.split('.').pop()?.toLowerCase();
            const isValidType = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext);

            if (isValidType) {
                if (file.size > 100 * 1024 * 1024) { // 100MB limit
                    invalidFiles.push(`${file.name} (too large)`);
                } else {
                    validFiles.push(file);
                }
            } else {
                invalidFiles.push(`${file.name} (unsupported format)`);
            }
        }

        if (invalidFiles.length > 0) {
            toast.error(`Skipped ${invalidFiles.length} file(s)`, {
                description: invalidFiles.slice(0, 3).join(', ') + (invalidFiles.length > 3 ? '...' : ''),
            });
        }

        if (validFiles.length > 0) {
            onFilesAdded(validFiles);
            toast.success(`Added ${validFiles.length} file(s) for analysis`);
        }
    };

    return (
        <div className="glass-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-primary" />
                Upload Audio Files
            </h2>

            <label
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`dropzone flex flex-col items-center gap-3 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input
                    type="file"
                    multiple
                    accept={ACCEPTED_EXTENSIONS.join(',')}
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={isProcessing}
                />

                <AnimatePresence mode="wait">
                    {isProcessing ? (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground mt-3">Analyzing...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                <Upload className="w-7 h-7 text-primary" />
                            </div>
                            <p className="font-medium">Drop audio files here</p>
                            <p className="text-sm text-muted-foreground">or click to browse</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </label>

            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                    Supported: WAV, MP3, FLAC, OGG, WebM, M4A • Max 100MB per file • Up to 50 files
                </p>
            </div>
        </div>
    );
}
