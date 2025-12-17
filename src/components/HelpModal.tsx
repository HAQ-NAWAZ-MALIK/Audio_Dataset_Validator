'use client';

import { useState } from 'react';
import { X, Book, Keyboard, FileAudio, Wand2, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
    const [activeTab, setActiveTab] = useState<'guide' | 'standards' | 'shortcuts'>('guide');

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-[700px] max-h-[85vh] glass-card overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Book className="w-5 h-5 text-primary" />
                                Audio Dataset Validator Guide
                            </h2>
                            <button onClick={onClose} className="btn-ghost p-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            {[
                                { id: 'guide', label: 'Quick Guide', icon: Book },
                                { id: 'standards', label: 'Audio Standards', icon: FileAudio },
                                { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {activeTab === 'guide' && <GuideContent />}
                            {activeTab === 'standards' && <StandardsContent />}
                            {activeTab === 'shortcuts' && <ShortcutsContent />}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function GuideContent() {
    return (
        <div className="space-y-6">
            <Section title="🚀 Getting Started">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Drag & drop audio files or click to browse</li>
                    <li>Files are automatically analyzed for quality issues</li>
                    <li>Review the health score and detected issues</li>
                    <li>Use the Audio Processor to fix problems</li>
                    <li>Download the processed audio file</li>
                </ol>
            </Section>

            <Section title="🎚️ Visualization Modes">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <Feature icon="〰️" title="Waveform" desc="Classic amplitude view" />
                    <Feature icon="📊" title="Bars" desc="Colorful frequency bars" />
                    <Feature icon="📈" title="Mirror" desc="Symmetric waveform" />
                    <Feature icon="📻" title="Spectrum" desc="Frequency heatmap" />
                </div>
            </Section>

            <Section title="🔧 Audio Processor">
                <div className="space-y-2 text-sm">
                    <Feature icon="🔊" title="Normalize" desc="Adjust volume to target level (-3dB recommended)" />
                    <Feature icon="✂️" title="Trim Silence" desc="Remove leading/trailing silence" />
                    <Feature icon="🔇" title="Noise Gate" desc="Reduce background noise" />
                    <Feature icon="⚡" title="DC Offset" desc="Center the waveform around zero" />
                    <Feature icon="✨" title="AI Auto-Clean" desc="Apply all fixes automatically for TTS-ready audio" />
                </div>
            </Section>

            <Section title="📤 Export Options">
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Download processed audio as WAV (16-bit, original sample rate)</li>
                    <li>Export analysis report as JSON or CSV</li>
                    <li>Batch process multiple files</li>
                </ul>
            </Section>
        </div>
    );
}

function StandardsContent() {
    return (
        <div className="space-y-6">
            <Section title="📋 TTS/ASR Dataset Standards">
                <p className="text-sm text-muted-foreground mb-4">
                    The following parameters are recommended for professional TTS and ASR datasets:
                </p>

                <div className="space-y-3">
                    <StandardRow
                        param="Sample Rate"
                        recommended="22,050 Hz or 44,100 Hz"
                        note="22kHz is standard for TTS, 44.1kHz for high quality"
                    />
                    <StandardRow
                        param="Channels"
                        recommended="Mono (1 channel)"
                        note="Stereo should be converted to mono"
                    />
                    <StandardRow
                        param="Bit Depth"
                        recommended="16-bit"
                        note="24-bit acceptable, 8-bit too low"
                    />
                    <StandardRow
                        param="Format"
                        recommended="WAV (PCM)"
                        note="Lossless format, no compression artifacts"
                    />
                    <StandardRow
                        param="Duration"
                        recommended="1-15 seconds"
                        note="Too short or too long causes training issues"
                    />
                    <StandardRow
                        param="Peak Level"
                        recommended="-3 dB to -1 dB"
                        note="Normalized but not clipping"
                    />
                    <StandardRow
                        param="Noise Floor"
                        recommended="< -50 dB"
                        note="Clean, quiet background"
                    />
                    <StandardRow
                        param="Leading Silence"
                        recommended="< 0.1 seconds"
                        note="Minimal silence at start"
                    />
                    <StandardRow
                        param="Trailing Silence"
                        recommended="< 0.3 seconds"
                        note="Small gap at end is acceptable"
                    />
                    <StandardRow
                        param="DC Offset"
                        recommended="< 0.5%"
                        note="Waveform centered at zero"
                    />
                </div>
            </Section>

            <Section title="🏆 Popular Dataset Formats">
                <div className="space-y-3 text-sm">
                    <DatasetFormat
                        name="LJSpeech"
                        specs="22050 Hz, Mono, 16-bit WAV, 1-10s"
                    />
                    <DatasetFormat
                        name="Common Voice"
                        specs="48000 Hz, Mono, MP3/WAV, 1-10s"
                    />
                    <DatasetFormat
                        name="LibriSpeech"
                        specs="16000 Hz, Mono, FLAC, variable"
                    />
                    <DatasetFormat
                        name="VCTK"
                        specs="48000 Hz, Mono, WAV, 1-15s"
                    />
                </div>
            </Section>
        </div>
    );
}

function ShortcutsContent() {
    return (
        <div className="space-y-6">
            <Section title="⌨️ Keyboard Shortcuts">
                <div className="space-y-2">
                    <Shortcut keys={['Space']} action="Play / Pause audio" />
                    <Shortcut keys={['R']} action="Reset playback to start" />
                    <Shortcut keys={['←', '→']} action="Seek backward / forward" />
                    <Shortcut keys={['+']} action="Zoom in" />
                    <Shortcut keys={['-']} action="Zoom out" />
                    <Shortcut keys={['1-4']} action="Switch visualization mode" />
                    <Shortcut keys={['Esc']} action="Close modal / Exit fullscreen" />
                    <Shortcut keys={['?']} action="Open this help guide" />
                </div>
            </Section>

            <Section title="🖱️ Mouse Actions">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                        <span>Click on waveform</span>
                        <span className="text-muted-foreground">Seek to position</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                        <span>Scroll on waveform</span>
                        <span className="text-muted-foreground">Scroll horizontally (when zoomed)</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span>Drag & drop files</span>
                        <span className="text-muted-foreground">Add files for analysis</span>
                    </div>
                </div>
            </Section>
        </div>
    );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-3">{title}</h3>
            {children}
        </div>
    );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
    return (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
            <span className="text-lg">{icon}</span>
            <div>
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
        </div>
    );
}

function StandardRow({ param, recommended, note }: { param: string; recommended: string; note: string }) {
    return (
        <div className="p-3 rounded-lg bg-secondary/30">
            <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{param}</span>
                <span className="text-sm text-primary">{recommended}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{note}</p>
        </div>
    );
}

function DatasetFormat({ name, specs }: { name: string; specs: string }) {
    return (
        <div className="flex justify-between items-center p-2 rounded-lg bg-secondary/30">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">{specs}</span>
        </div>
    );
}

function Shortcut({ keys, action }: { keys: string[]; action: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-border">
            <div className="flex gap-1">
                {keys.map((key) => (
                    <kbd
                        key={key}
                        className="px-2 py-1 text-xs font-mono bg-secondary rounded border border-border"
                    >
                        {key}
                    </kbd>
                ))}
            </div>
            <span className="text-sm text-muted-foreground">{action}</span>
        </div>
    );
}
