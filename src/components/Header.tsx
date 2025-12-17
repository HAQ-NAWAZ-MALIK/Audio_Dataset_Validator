'use client';

import { useState } from 'react';
import { Moon, Sun, HelpCircle, Github } from 'lucide-react';
import HelpModal from './HelpModal';

export default function Header() {
    const [isDark, setIsDark] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        document.documentElement.classList.toggle('dark', newIsDark);
        localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    };

    // Initialize theme on mount
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = stored ? stored === 'dark' : prefersDark;
        if (shouldBeDark !== isDark) {
            document.documentElement.classList.toggle('dark', shouldBeDark);
        }
    }

    return (
        <>
            <header className="glass-panel flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl">
                        🎚️
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Audio Dataset Validator
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Quality analysis for TTS/ASR datasets
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href="https://github.com/HAQ-NAWAZ-MALIK/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-icon btn-ghost"
                        title="GitHub - HAQ-NAWAZ-MALIK"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                    <button
                        onClick={toggleTheme}
                        className="btn-icon btn-ghost"
                        title={isDark ? 'Light mode' : 'Dark mode'}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        className="btn-icon btn-ghost"
                        title="Help & Guide"
                    >
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </>
    );
}
