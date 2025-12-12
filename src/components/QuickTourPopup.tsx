'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic2, HelpCircle } from 'lucide-react';

export default function QuickTourPopup() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show popup after a brief delay
        const showTimer = setTimeout(() => {
            setIsVisible(true);
        }, 500);

        // Hide popup after 3 seconds
        const hideTimer = setTimeout(() => {
            setIsVisible(false);
        }, 3500);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-2xl shadow-primary/25 flex items-center gap-4 max-w-md">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Mic2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Welcome to TTS Dataset Collector!</h3>
                            <p className="text-sm opacity-90 mt-1">
                                Click the <HelpCircle className="w-4 h-4 inline mx-1" /> icon anytime for help & shortcuts
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
