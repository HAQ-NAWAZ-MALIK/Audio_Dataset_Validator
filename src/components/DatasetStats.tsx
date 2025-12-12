'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Clock, Mic, Users, History, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Recording {
    filename: string;
    text: string;
    duration: number;
    timestamp: string;
    emotion: string;
    rating: number;
}

interface Stats {
    total_recordings: number;
    total_duration: number;
    speakers: number;
    recent_recordings: Recording[];
}

export default function DatasetStats() {
    const [stats, setStats] = useState<Stats>({
        total_recordings: 0,
        total_duration: 0,
        speakers: 0,
        recent_recordings: []
    });

    const fetchStats = () => {
        fetch('/api/dataset-stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Error fetching stats:', err));
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/10">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Session Stats
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mic className="w-4 h-4" />
                            <span>Recordings</span>
                        </div>
                        <span className="font-mono font-bold">{stats.total_recordings}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Duration</span>
                        </div>
                        <span className="font-mono font-bold">{(stats.total_duration / 60).toFixed(1)}m</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>Speakers</span>
                        </div>
                        <span className="font-mono font-bold">{stats.speakers}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="max-h-[400px] flex flex-col">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Recent History
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {stats.recent_recordings.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No recordings yet</p>
                    ) : (
                        stats.recent_recordings.map((rec, i) => (
                            <div key={i} className="p-3 rounded-lg bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[150px]" title={rec.filename}>
                                        {rec.filename}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                        {rec.emotion}
                                    </Badge>
                                </div>
                                <p className="text-sm line-clamp-2 mb-2 text-foreground/90">{rec.text}</p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {rec.duration.toFixed(1)}s
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(rec.rating)].map((_, i) => (
                                            <span key={i} className="text-yellow-500">★</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
