'use client';

import React from 'react';
import { X, Keyboard, Mic, Save, Search, SkipForward, Bookmark, HelpCircle } from 'lucide-react';
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
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 max-h-[85vh] overflow-y-auto"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <HelpCircle className="w-5 h-5 text-primary" />
                                        <span>Help & Documentation</span>
                                    </div>
                                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                                        <X className="w-5 h-5" />
                                    </button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Quick Start */}
                                <section className="space-y-3">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        🚀 Quick Start
                                    </h3>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
                                        <li>Enter a <strong>Speaker ID</strong> and <strong>Dataset Name</strong>.</li>
                                        <li>Paste your text sentences into the text area and click <strong>Load Sentences</strong>.</li>
                                        <li>Press <strong>Spacebar</strong> or click the microphone to start recording.</li>
                                        <li>Rate the recording and select an emotion (optional).</li>
                                        <li>Press <strong>Ctrl + S</strong> or click "Save & Next" to save and move to the next sentence.</li>
                                        <li>When finished, go to <strong>Settings</strong> to export your dataset.</li>
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
                                                <Mic className="w-4 h-4 mt-0.5 text-primary" />
                                                <span><strong>Emotion Tagging:</strong> Label recordings with emotions like Happy, Sad, or Whisper.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Bookmark className="w-4 h-4 mt-0.5 text-primary" />
                                                <span><strong>Bookmarks:</strong> Flag difficult sentences to review later.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Search className="w-4 h-4 mt-0.5 text-primary" />
                                                <span><strong>Search:</strong> Find specific sentences by keyword.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <SkipForward className="w-4 h-4 mt-0.5 text-primary" />
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
                                                <kbd className="bg-background border border-border px-1.5 rounded text-xs">Space</kbd>
                                            </div>
                                            <div className="flex justify-between items-center bg-secondary/30 p-2 rounded">
                                                <span>Save & Next</span>
                                                <kbd className="bg-background border border-border px-1.5 rounded text-xs">Ctrl + S</kbd>
                                            </div>
                                            <div className="flex justify-between items-center bg-secondary/30 p-2 rounded">
                                                <span>Next Sentence</span>
                                                <kbd className="bg-background border border-border px-1.5 rounded text-xs">→</kbd>
                                            </div>
                                            <div className="flex justify-between items-center bg-secondary/30 p-2 rounded">
                                                <span>Previous Sentence</span>
                                                <kbd className="bg-background border border-border px-1.5 rounded text-xs">←</kbd>
                                            </div>
                                            <div className="flex justify-between items-center bg-secondary/30 p-2 rounded">
                                                <span>Focus Search</span>
                                                <kbd className="bg-background border border-border px-1.5 rounded text-xs">Ctrl + F</kbd>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
