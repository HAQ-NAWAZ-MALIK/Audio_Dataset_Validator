'use client';

import React from 'react';
import { X, Keyboard, Mic, Save, Search, SkipForward, Bookmark, HelpCircle, FolderDown, FileAudio, FileText, FileJson } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <Card className="w-full max-w-3xl max-h-[85vh] overflow-y-auto">
                            <CardHeader className="sticky top-0 bg-card z-10 border-b border-border">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <HelpCircle className="w-5 h-5 text-primary" />
                                        <span>Help & Documentation</span>
                                    </div>
                                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary">
                                        <X className="w-5 h-5" />
                                    </button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Quick Start */}
                                <section className="space-y-3">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        🚀 Quick Start
                                    </h3>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
                                        <li>Enter a <strong className="text-foreground">Speaker ID</strong> and <strong className="text-foreground">Dataset Name</strong>.</li>
                                        <li>Paste your text sentences into the text area and click <strong className="text-foreground">Load Sentences</strong>.</li>
                                        <li>Press <kbd className="bg-secondary border border-border px-1.5 py-0.5 rounded text-xs">Space</kbd> or click the microphone to start recording.</li>
                                        <li>Rate the recording and select an emotion (optional).</li>
                                        <li>Press <kbd className="bg-secondary border border-border px-1.5 py-0.5 rounded text-xs">Ctrl + S</kbd> or click "Save & Next" to save.</li>
                                        <li>When finished, click <strong className="text-foreground">Download Dataset</strong> in Settings.</li>
                                    </ol>
                                </section>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Features */}
                                    <section className="space-y-3">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            ✨ Features
                                        </h3>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <Mic className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                                <span><strong>Emotion Tagging:</strong> Label recordings with emotions like Happy, Sad, or Whisper.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Bookmark className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                                <span><strong>Bookmarks:</strong> Flag difficult sentences to review later.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Search className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                                <span><strong>Search:</strong> Find specific sentences by keyword.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <SkipForward className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                                <span><strong>Skip:</strong> Skip irrelevant or problematic sentences.</span>
                                            </li>
                                        </ul>
                                    </section>

                                    {/* Keyboard Shortcuts */}
                                    <section className="space-y-3">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            ⌨️ Shortcuts
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center bg-secondary/30 p-2 rounded">
                                                <span>Start/Stop Recording</span>
                                                <kbd className="bg-background border border-border px-2 py-0.5 rounded text-xs font-mono">Space</kbd>
                                            </div>
                                            <div className="flex justify-between items-center bg-secondary/30 p-2 rounded">
                                                <span>Save & Next</span>
                                                <kbd className="bg-background border border-border px-2 py-0.5 rounded text-xs font-mono">Ctrl + S</kbd>
                                            </div>
                                            <div className="flex justify-between items-center bg-secondary/30 p-2 rounded">
                                                <span>Next Sentence</span>
                                                <kbd className="bg-background border border-border px-2 py-0.5 rounded text-xs font-mono">→</kbd>
                                            </div>
                                            <div className="flex justify-between items-center bg-secondary/30 p-2 rounded">
                                                <span>Previous Sentence</span>
                                                <kbd className="bg-background border border-border px-2 py-0.5 rounded text-xs font-mono">←</kbd>
                                            </div>
                                            <div className="flex justify-between items-center bg-secondary/30 p-2 rounded">
                                                <span>Focus Search</span>
                                                <kbd className="bg-background border border-border px-2 py-0.5 rounded text-xs font-mono">Ctrl + F</kbd>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Dataset Format */}
                                <section className="space-y-3 border-t border-border pt-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <FolderDown className="w-5 h-5 text-primary" />
                                        Dataset Export Format
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        When you download your dataset, you'll get a ZIP file with the following structure:
                                    </p>

                                    <div className="bg-secondary/30 rounded-lg p-4 font-mono text-sm">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <FolderDown className="w-4 h-4 text-yellow-500" />
                                                <span className="font-semibold">dataset.zip</span>
                                            </div>
                                            <div className="ml-6 space-y-1 border-l-2 border-border pl-4">
                                                <div className="flex items-center gap-2">
                                                    <FolderDown className="w-4 h-4 text-yellow-500" />
                                                    <span>audio/</span>
                                                </div>
                                                <div className="ml-6 space-y-1 border-l-2 border-border pl-4">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <FileAudio className="w-4 h-4 text-blue-500" />
                                                        <span>speaker_001_line1_hello_world.wav</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <FileAudio className="w-4 h-4 text-blue-500" />
                                                        <span>speaker_001_line2_how_are_you.wav</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FolderDown className="w-4 h-4 text-yellow-500" />
                                                    <span>transcriptions/</span>
                                                </div>
                                                <div className="ml-6 space-y-1 border-l-2 border-border pl-4">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <FileText className="w-4 h-4 text-green-500" />
                                                        <span>speaker_001_line1_hello_world.txt</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <FileText className="w-4 h-4 text-green-500" />
                                                        <span>speaker_001_line2_how_are_you.txt</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transcription Format */}
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-green-500" />
                                            Transcription File Format
                                        </h4>
                                        <div className="bg-secondary/30 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                                            <pre className="text-muted-foreground">{`[METADATA]
Recording_ID: speaker_001_line1_hello_world.wav
Speaker_ID: speaker_001
Dataset_Name: my_dataset
Timestamp: 2024-12-13T10:30:00Z
Emotion: neutral
Rating: 5
Duration: 2.5
[TEXT]
Hello world, this is a sample sentence.`}</pre>
                                        </div>
                                    </div>

                                    {/* Audio Format */}
                                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <FileAudio className="w-4 h-4 text-blue-500" />
                                                Audio Format
                                            </h4>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• Format: <strong className="text-foreground">WAV</strong></li>
                                                <li>• Sample Rate: <strong className="text-foreground">48kHz</strong></li>
                                                <li>• Channels: <strong className="text-foreground">Mono</strong></li>
                                                <li>• Bit Depth: <strong className="text-foreground">16-bit</strong></li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <FileJson className="w-4 h-4 text-purple-500" />
                                                Compatible With
                                            </h4>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• Coqui TTS</li>
                                                <li>• Mozilla TTS</li>
                                                <li>• VITS / SoVITS</li>
                                                <li>• Hugging Face Datasets</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>
                            </CardContent>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
