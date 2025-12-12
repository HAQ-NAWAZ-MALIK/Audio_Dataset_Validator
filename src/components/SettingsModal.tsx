'use client';

import React from 'react';
import { X, Download, Save, Trash2, Mic, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    autoAdvance: boolean;
    setAutoAdvance: (value: boolean) => void;
    autoSave: boolean;
    setAutoSave: (value: boolean) => void;
    silenceThreshold: number;
    setSilenceThreshold: (value: number) => void;
    datasetName: string;
}

export default function SettingsModal({
    isOpen,
    onClose,
    autoAdvance,
    setAutoAdvance,
    autoSave,
    setAutoSave,
    silenceThreshold,
    setSilenceThreshold,
    datasetName
}: SettingsModalProps) {
    const handleExport = async () => {
        try {
            // Trigger download by navigating to the API endpoint
            window.location.href = `/api/export-dataset?dataset_name=${datasetName}`;
            toast.success('Export started');
        } catch (error) {
            console.error(error);
            toast.error('Error exporting dataset');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Settings</span>
                                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                                        <X className="w-5 h-5" />
                                    </button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium">Auto-advance</label>
                                            <p className="text-xs text-muted-foreground">
                                                Go to next sentence after saving
                                            </p>
                                        </div>
                                        <Switch checked={autoAdvance} onCheckedChange={setAutoAdvance} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-medium">Auto-save</label>
                                            <p className="text-xs text-muted-foreground">
                                                Save automatically when recording stops
                                            </p>
                                        </div>
                                        <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-medium">Silence Threshold</label>
                                            <span className="text-xs text-muted-foreground">{silenceThreshold}%</span>
                                        </div>
                                        <Slider
                                            value={[silenceThreshold]}
                                            onValueChange={(vals) => setSilenceThreshold(vals[0])}
                                            max={100}
                                            step={1}
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <h4 className="text-sm font-medium mb-3">Data Management</h4>
                                        <button
                                            onClick={handleExport}
                                            className="btn btn-secondary w-full flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export Dataset (ZIP)
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
