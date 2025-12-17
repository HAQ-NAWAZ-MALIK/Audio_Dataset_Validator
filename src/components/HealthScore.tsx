'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HealthScoreProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function HealthScore({ score, size = 'md', showLabel = true }: HealthScoreProps) {
    const sizes = {
        sm: { container: 'w-12 h-12', stroke: 3, text: 'text-xs' },
        md: { container: 'w-20 h-20', stroke: 4, text: 'text-lg' },
        lg: { container: 'w-28 h-28', stroke: 5, text: 'text-2xl' },
    };

    const { container, stroke, text } = sizes[size];
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const progress = ((100 - score) / 100) * circumference;

    const getColor = (score: number) => {
        if (score >= 80) return 'text-success stroke-success';
        if (score >= 50) return 'text-warning stroke-warning';
        return 'text-destructive stroke-destructive';
    };

    const getLabel = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 60) return 'Fair';
        if (score >= 40) return 'Poor';
        return 'Bad';
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={cn('relative', container)}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        strokeWidth={stroke}
                        className="stroke-secondary"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: progress }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={getColor(score)}
                    />
                </svg>
                <div className={cn(
                    'absolute inset-0 flex items-center justify-center font-bold',
                    text,
                    getColor(score)
                )}>
                    {Math.round(score)}
                </div>
            </div>
            {showLabel && (
                <span className={cn('text-xs font-medium', getColor(score))}>
                    {getLabel(score)}
                </span>
            )}
        </div>
    );
}
