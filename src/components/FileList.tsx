'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileAudio, CheckCircle, AlertTriangle, XCircle, Loader2, Trash2 } from 'lucide-react';
import { AudioFile } from '@/types/audio';
import { formatDuration, formatFileSize, cn } from '@/lib/utils';
import HealthScore from './HealthScore';

interface FileListProps {
    files: AudioFile[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
    onClearAll: () => void;
}

export default function FileList({ files, selectedId, onSelect, onRemove, onClearAll }: FileListProps) {
    if (files.length === 0) {
        return (
            <div className="glass-card h-full flex flex-col items-center justify-center text-center py-12">
                <FileAudio className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No files uploaded yet</p>
                <p className="text-sm text-muted-foreground/70">Drop audio files to start</p>
            </div>
        );
    }

    const getStatusIcon = (status: AudioFile['status'], healthScore?: number) => {
        switch (status) {
            case 'pending':
                return <div className="w-2 h-2 rounded-full bg-muted-foreground" />;
            case 'analyzing':
                return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
            case 'error':
                return <XCircle className="w-4 h-4 text-destructive" />;
            case 'done':
                if (healthScore !== undefined) {
                    if (healthScore >= 80) return <CheckCircle className="w-4 h-4 text-success" />;
                    if (healthScore >= 50) return <AlertTriangle className="w-4 h-4 text-warning" />;
                    return <XCircle className="w-4 h-4 text-destructive" />;
                }
                return <CheckCircle className="w-4 h-4 text-success" />;
        }
    };

    return (
        <div className="glass-card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileAudio className="w-5 h-5 text-primary" />
                    Files
                    <span className="text-sm font-normal text-muted-foreground">({files.length})</span>
                </h2>
                {files.length > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 -mx-2 px-2">
                <AnimatePresence>
                    {files.map((file) => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            layout
                            className={cn(
                                'group relative p-3 rounded-xl cursor-pointer transition-all',
                                'hover:bg-secondary/50',
                                selectedId === file.id && 'bg-primary/10 ring-1 ring-primary/30'
                            )}
                            onClick={() => onSelect(file.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    {getStatusIcon(file.status, file.analysis?.healthScore)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{formatFileSize(file.size)}</span>
                                        {file.analysis && (
                                            <>
                                                <span>•</span>
                                                <span>{formatDuration(file.analysis.duration)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {file.status === 'done' && file.analysis && (
                                    <div className="flex-shrink-0">
                                        <HealthScore score={file.analysis.healthScore} size="sm" showLabel={false} />
                                    </div>
                                )}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(file.id);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {file.status === 'error' && file.error && (
                                <p className="text-xs text-destructive mt-2 pl-7">{file.error}</p>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
