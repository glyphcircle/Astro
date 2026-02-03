
import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const SkeletonLine: React.FC<SkeletonProps> = ({ className = "h-4 w-full" }) => (
    <div className={`bg-white/5 rounded animate-pulse ${className}`}></div>
);

export const SkeletonBlock: React.FC<SkeletonProps> = ({ className = "h-32 w-full" }) => (
    <div className={`bg-white/5 rounded-lg animate-pulse ${className}`}></div>
);

export const SkeletonReport: React.FC = () => (
    <div className="space-y-4 w-full animate-fade-in-up">
        <SkeletonLine className="h-8 w-3/4 mb-6 bg-amber-500/10" />
        <SkeletonBlock className="h-48 border border-amber-500/10 bg-black/20" />
        <div className="space-y-2 mt-4">
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-5/6" />
            <SkeletonLine className="w-4/6" />
        </div>
    </div>
);
