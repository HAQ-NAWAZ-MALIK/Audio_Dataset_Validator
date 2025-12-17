'use client';

import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Issue, IssueType } from '@/types/audio';
import { cn } from '@/lib/utils';

interface IssueTagProps {
    issue: Issue;
    compact?: boolean;
}

const issueIcons: Record<IssueType, string> = {
    silence_start: '🔇',
    silence_end: '🔇',
    clipping: '📢',
    low_volume: '🔉',
    high_volume: '📈',
    dc_offset: '⚡',
    stereo: '🔀',
    low_sample_rate: '📉',
    short_duration: '⏱️',
    long_duration: '⏰',
};

export default function IssueTag({ issue, compact = false }: IssueTagProps) {
    const getSeverityStyles = (severity: Issue['severity']) => {
        switch (severity) {
            case 'error':
                return 'badge-error';
            case 'warning':
                return 'badge-warning';
            case 'info':
                return 'badge-info';
        }
    };

    const getSeverityIcon = (severity: Issue['severity']) => {
        switch (severity) {
            case 'error':
                return <AlertCircle className="w-3 h-3" />;
            case 'warning':
                return <AlertTriangle className="w-3 h-3" />;
            case 'info':
                return <Info className="w-3 h-3" />;
        }
    };

    if (compact) {
        return (
            <span className={cn('badge', getSeverityStyles(issue.severity))}>
                {getSeverityIcon(issue.severity)}
            </span>
        );
    }

    return (
        <div className={cn('badge', getSeverityStyles(issue.severity))}>
            <span>{issueIcons[issue.type]}</span>
            <span>{issue.message}</span>
        </div>
    );
}

interface IssueListProps {
    issues: Issue[];
}

export function IssueList({ issues }: IssueListProps) {
    if (issues.length === 0) {
        return (
            <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">No issues found</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {issues.map((issue, index) => (
                <div
                    key={`${issue.type}-${index}`}
                    className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30"
                >
                    <span className="text-lg">{issueIcons[issue.type]}</span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <IssueTag issue={issue} />
                        </div>
                        <p className="text-sm text-muted-foreground">{issue.suggestion}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
