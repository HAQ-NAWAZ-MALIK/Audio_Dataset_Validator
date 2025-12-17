'use client';

import { BarChart3, CheckCircle, AlertTriangle, XCircle, Clock, Download } from 'lucide-react';
import { AudioFile, DatasetStats, IssueType } from '@/types/audio';
import { formatDuration, cn } from '@/lib/utils';
import HealthScore from './HealthScore';
import { toast } from 'sonner';

interface SummaryCardProps {
    files: AudioFile[];
}

export default function SummaryCard({ files }: SummaryCardProps) {
    const stats = calculateStats(files);

    const handleExportJSON = () => {
        const report = files
            .filter(f => f.status === 'done' && f.analysis)
            .map(f => ({
                filename: f.name,
                size: f.size,
                ...f.analysis,
            }));

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audio-analysis-report.json';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report exported as JSON');
    };

    const handleExportCSV = () => {
        const headers = ['Filename', 'Duration', 'Sample Rate', 'Channels', 'Health Score', 'Issues'];
        const rows = files
            .filter(f => f.status === 'done' && f.analysis)
            .map(f => [
                f.name,
                f.analysis!.duration.toFixed(2),
                f.analysis!.sampleRate,
                f.analysis!.channels,
                f.analysis!.healthScore,
                f.analysis!.issues.length,
            ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audio-analysis-report.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report exported as CSV');
    };

    if (files.length === 0) {
        return (
            <div className="glass-card">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Summary
                </h2>
                <p className="text-muted-foreground text-sm">
                    Upload files to see analysis summary
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                Summary
            </h2>

            {/* Average Health Score */}
            {stats.analyzedFiles > 0 && (
                <div className="flex justify-center mb-6">
                    <HealthScore score={stats.averageHealthScore} size="lg" />
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <StatItem
                    icon={<CheckCircle className="w-4 h-4 text-success" />}
                    label="Pass"
                    value={stats.passCount}
                    color="text-success"
                />
                <StatItem
                    icon={<AlertTriangle className="w-4 h-4 text-warning" />}
                    label="Warning"
                    value={stats.warnCount}
                    color="text-warning"
                />
                <StatItem
                    icon={<XCircle className="w-4 h-4 text-destructive" />}
                    label="Error"
                    value={stats.errorCount}
                    color="text-destructive"
                />
                <StatItem
                    icon={<Clock className="w-4 h-4 text-muted-foreground" />}
                    label="Total"
                    value={formatDuration(stats.totalDuration)}
                />
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Analyzed</span>
                    <span>{stats.analyzedFiles} / {stats.totalFiles}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(stats.analyzedFiles / stats.totalFiles) * 100}%` }}
                    />
                </div>
            </div>

            {/* Export Buttons */}
            {stats.analyzedFiles > 0 && (
                <div className="space-y-2">
                    <button onClick={handleExportJSON} className="btn btn-secondary w-full text-sm">
                        <Download className="w-4 h-4" />
                        Export JSON Report
                    </button>
                    <button onClick={handleExportCSV} className="btn-ghost w-full text-sm flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            )}
        </div>
    );
}

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color?: string;
}

function StatItem({ icon, label, value, color }: StatItemProps) {
    return (
        <div className="p-3 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className={cn('text-xl font-bold', color)}>{value}</p>
        </div>
    );
}

function calculateStats(files: AudioFile[]): DatasetStats {
    const analyzed = files.filter(f => f.status === 'done' && f.analysis);

    let passCount = 0;
    let warnCount = 0;
    let errorCount = 0;
    let totalScore = 0;
    let totalDuration = 0;
    const issueBreakdown: Record<IssueType, number> = {} as Record<IssueType, number>;

    for (const file of analyzed) {
        const score = file.analysis!.healthScore;
        totalScore += score;
        totalDuration += file.analysis!.duration;

        if (score >= 80) passCount++;
        else if (score >= 50) warnCount++;
        else errorCount++;

        for (const issue of file.analysis!.issues) {
            issueBreakdown[issue.type] = (issueBreakdown[issue.type] || 0) + 1;
        }
    }

    return {
        totalFiles: files.length,
        analyzedFiles: analyzed.length,
        passCount,
        warnCount,
        errorCount,
        averageHealthScore: analyzed.length > 0 ? totalScore / analyzed.length : 0,
        totalDuration,
        issueBreakdown,
    };
}
