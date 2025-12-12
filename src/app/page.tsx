'use client';

import React, { useState, useEffect } from 'react';
import HelpModal from '@/components/HelpModal';
import QuickTourPopup from '@/components/QuickTourPopup';


import TextInput from '@/components/TextInput';
import AudioRecorder from '@/components/AudioRecorder';
import FontSelector from '@/components/FontSelector';
import DatasetStats from '@/components/DatasetStats';
import SettingsModal from '@/components/SettingsModal';
import { Mic2, Moon, Sun, Settings, Search, SkipForward, SkipBack, Bookmark, Hash, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { detectLanguage, isRTL } from '@/lib/language';

export default function Home() {
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useLocalStorage('currentIndex', 0);
  const [speakerId, setSpeakerId] = useLocalStorage('speakerId', '');
  const [datasetName, setDatasetName] = useLocalStorage('datasetName', 'dataset1');
  const [fontStyle, setFontStyle] = useLocalStorage('fontStyle', 'Times New Roman');
  const [fontFamily, setFontFamily] = useState('Times New Roman'); // Actual CSS font family
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', true);

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [autoAdvance, setAutoAdvance] = useLocalStorage('autoAdvance', true);
  const [autoSave, setAutoSave] = useLocalStorage('autoSave', false);
  const [silenceThreshold, setSilenceThreshold] = useLocalStorage('silenceThreshold', 5);

  // Navigation & Search
  const [jumpIndex, setJumpIndex] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [detectedLang, setDetectedLang] = useState('eng');
  const [isRTLDir, setIsRTLDir] = useState(false);

  useEffect(() => {
    if (sentences.length > 0 && sentences[currentIndex]) {
      const lang = detectLanguage(sentences[currentIndex]);
      setDetectedLang(lang);
      setIsRTLDir(isRTL(lang));
    }
  }, [currentIndex, sentences]);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (speakerId && datasetName) {
      fetch(`/api/bookmarks?speaker_id=${speakerId}&dataset_name=${datasetName}`)
        .then(res => res.json())
        .then(data => setBookmarks(data.bookmarks || []));
    }
  }, [speakerId, datasetName]);

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    'arrowright': () => handleNext(),
    'arrowleft': () => handlePrev(),
    'ctrl+s': () => document.getElementById('save-btn')?.click(),
    ' ': () => document.getElementById('record-btn')?.click(),
    'ctrl+f': () => document.getElementById('search-input')?.focus(),
  });

  const handleSentencesLoaded = (loadedSentences: string[]) => {
    setSentences(loadedSentences);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      toast.info('Reached end of sentences');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const idx = parseInt(jumpIndex) - 1;
    if (idx >= 0 && idx < sentences.length) {
      setCurrentIndex(idx);
      setJumpIndex('');
    } else {
      toast.error('Invalid sentence number');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    // Find next occurrence after current index
    let nextIndex = sentences.findIndex((s, i) => i > currentIndex && s.toLowerCase().includes(searchQuery.toLowerCase()));

    // If not found, wrap around
    if (nextIndex === -1) {
      nextIndex = sentences.findIndex((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (nextIndex !== -1) {
      setCurrentIndex(nextIndex);
      toast.success(`Found match at #${nextIndex + 1}`);
    } else {
      toast.error('No matches found');
    }
  };

  const handleSkip = async () => {
    try {
      const res = await fetch('/api/skip-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speaker_id: speakerId,
          dataset_name: datasetName,
          index: currentIndex,
          text: sentences[currentIndex],
          reason: 'User skipped'
        })
      });

      if (res.ok) {
        toast.info('Sentence skipped');
        handleNext();
      } else {
        toast.error('Failed to skip');
      }
    } catch (err) {
      toast.error('Error skipping');
    }
  };

  const handleFontChange = (font: string) => {
    setFontStyle(font);
    setFontFamily(font);
  };

  const toggleBookmark = async () => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speaker_id: speakerId, dataset_name: datasetName, index: currentIndex })
      });
      const data = await res.json();
      if (data.success) {
        setBookmarks(data.bookmarks);
        toast.success(bookmarks.includes(currentIndex) ? 'Bookmark removed' : 'Bookmarked');
      }
    } catch (err) {
      toast.error('Failed to toggle bookmark');
    }
  };

  return (
    <main className="min-h-screen pb-20 transition-colors duration-300 bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Mic2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              TTS Dataset Collector
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-sm font-medium">
              <span className="opacity-70">Sentence</span>
              <span className="text-primary">{currentIndex + 1}</span>
              <span className="opacity-40">/</span>
              <span className="opacity-70">{sentences.length || 0}</span>
            </div>

            <button
              onClick={() => setIsHelpOpen(true)}
              className="btn btn-ghost rounded-full w-10 h-10 p-0"
              title="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="btn btn-ghost rounded-full w-10 h-10 p-0"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="btn btn-ghost rounded-full w-10 h-10 p-0"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="container grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="label">Speaker ID</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. spk_001"
                    value={speakerId}
                    onChange={(e) => setSpeakerId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Dataset Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. common_voice"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <FontSelector currentFont={fontStyle} onFontChange={handleFontChange} />

          <TextInput onSentencesLoaded={handleSentencesLoaded} />

          <DatasetStats />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {sentences.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Navigation Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <form onSubmit={handleJump} className="flex items-center gap-2">
                    <div className="relative">
                      <Hash className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        className="input w-24 pl-9"
                        placeholder="Jump"
                        value={jumpIndex}
                        onChange={(e) => setJumpIndex(e.target.value)}
                      />
                    </div>
                  </form>

                  <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                      <input
                        id="search-input"
                        type="text"
                        className="input w-32 md:w-48 pl-9"
                        placeholder="Find text..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>

                  <div className="flex-1" />

                  <button onClick={() => setCurrentIndex(0)} className="btn btn-secondary text-xs" title="First">
                    First
                  </button>
                  <button onClick={() => setCurrentIndex(sentences.length - 1)} className="btn btn-secondary text-xs" title="Last">
                    Last
                  </button>
                </div>

                <Card className="border-primary/20 shadow-lg shadow-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="opacity-70">
                          SENTENCE {currentIndex + 1}
                        </Badge>
                        <Badge variant="secondary" className="opacity-50 text-xs uppercase">
                          {detectedLang}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={cn(
                            "p-2 rounded-full transition-colors",
                            bookmarks.includes(currentIndex)
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                              : "hover:bg-secondary opacity-50 hover:opacity-100"
                          )}
                          onClick={toggleBookmark}
                          title="Bookmark"
                        >
                          <Bookmark className={cn("w-4 h-4", bookmarks.includes(currentIndex) && "fill-current")} />
                        </button>
                      </div>
                    </div>

                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "sentence-display",
                        isRTLDir && "text-right"
                      )}
                      style={{ fontFamily: fontFamily, direction: isRTLDir ? 'rtl' : 'ltr' }}
                    >
                      {sentences[currentIndex]}
                    </motion.div>
                  </CardContent>
                </Card>

                {currentIndex < sentences.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    className="rounded-xl border border-dashed border-border p-4 bg-secondary/10"
                  >
                    <div className="text-xs font-bold opacity-50 uppercase tracking-wider mb-2">Next Up</div>
                    <div
                      className="text-lg text-center opacity-70 line-clamp-1"
                      style={{ fontFamily: fontFamily }}
                    >
                      {sentences[currentIndex + 1]}
                    </div>
                  </motion.div>
                )}

                <AudioRecorder
                  speakerId={speakerId}
                  datasetName={datasetName}
                  text={sentences[currentIndex]}
                  fontStyle={fontStyle}
                  index={currentIndex}
                  onSaved={() => { }}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  onSkip={handleSkip}
                  hasPrev={currentIndex > 0}
                  hasNext={currentIndex < sentences.length - 1}
                  autoAdvance={autoAdvance}
                  autoSave={autoSave}
                  silenceThreshold={silenceThreshold}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center opacity-70"
              >
                <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                  <Mic2 className="w-10 h-10 text-primary/50" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No Sentences Loaded</h3>
                <p className="text-lg max-w-md mx-auto text-muted-foreground">
                  Import a text file or paste content to begin your recording session.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        autoAdvance={autoAdvance}
        setAutoAdvance={setAutoAdvance}
        autoSave={autoSave}
        setAutoSave={setAutoSave}
        silenceThreshold={silenceThreshold}
        setSilenceThreshold={setSilenceThreshold}
        datasetName={datasetName}
      />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <QuickTourPopup />
    </main>
  );
}
