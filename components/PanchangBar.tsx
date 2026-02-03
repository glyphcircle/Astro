
import React, { useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const PanchangBar: React.FC = () => {
    const { t } = useTranslation();
    
    const panchangData = useMemo(() => {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeInMinutes = (currentHours * 60) + currentMinutes;

        // Vedic Rahu Kaal lookup (Approximate standard windows)
        // Values stored in minutes from midnight for easy comparison
        const rahuKaalSchedule: Record<number, { label: string, start: number, end: number }> = {
            1: { label: "07:30 - 09:00", start: 450, end: 540 }, // Monday
            2: { label: "15:00 - 16:30", start: 900, end: 990 }, // Tuesday
            3: { label: "12:00 - 13:30", start: 720, end: 810 }, // Wednesday
            4: { label: "13:30 - 15:00", start: 810, end: 900 }, // Thursday
            5: { label: "10:30 - 12:00", start: 630, end: 720 }, // Friday
            6: { label: "09:00 - 10:30", start: 540, end: 630 }, // Saturday
            0: { label: "16:30 - 18:00", start: 990, end: 1080 } // Sunday
        };

        let day = now.getDay();
        let todayConfig = rahuKaalSchedule[day];
        let isPast = currentTimeInMinutes > todayConfig.end;
        let isDuring = currentTimeInMinutes >= todayConfig.start && currentTimeInMinutes <= todayConfig.end;

        // If today's window is over, show tomorrow's
        if (isPast) {
            day = (day + 1) % 7;
            todayConfig = rahuKaalSchedule[day];
        }

        // Simulated Moon Sign (changes roughly every 2.25 days)
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
        const moonIdx = Math.floor(dayOfYear / 2.25) % 12;

        return {
            date: now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }),
            rahuKaal: todayConfig.label,
            isNext: isPast,
            isDuring: isDuring,
            moonSign: signs[moonIdx]
        };
    }, []);

    return (
        <div className="bg-skin-surface border border-skin-border rounded-lg p-3 mb-6 flex flex-wrap justify-between items-center text-xs text-skin-text/80 animate-fade-in-up shadow-sm gap-y-2">
            <div className="flex items-center gap-2">
                <span className="text-skin-accent font-bold uppercase tracking-widest mr-2">Today's Panchang</span>
                <span className="hidden xs:inline">{panchangData.date}</span>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6">
                <span className="flex items-center gap-1">
                    <span className="opacity-60">🌙 Moon:</span> 
                    <strong className="text-skin-accent">{panchangData.moonSign}</strong>
                </span>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                        <span className="opacity-60">⏳ {panchangData.isNext ? "Next" : ""} Rahu Kaal:</span> 
                        <strong className={`${panchangData.isDuring ? 'text-red-400' : 'text-skin-accent'}`}>
                            {panchangData.rahuKaal}
                        </strong>
                    </span>
                    {panchangData.isDuring && (
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PanchangBar;
