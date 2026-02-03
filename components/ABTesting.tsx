
import React, { useState, useEffect } from 'react';
import { useAnalytics } from './Analytics';

type Variant = 'A' | 'B';

interface ExperimentConfig {
    id: string;
    variants: Variant[];
    weights: number[]; // [0.5, 0.5]
}

export const useABTest = (experimentId: string, defaultValue: any = 49) => {
    const { track } = useAnalytics();
    const [variant, setVariant] = useState<Variant>('A');
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        // Check local storage for consistency
        const storageKey = `glyph_exp_${experimentId}`;
        let assigned = localStorage.getItem(storageKey) as Variant;

        if (!assigned) {
            // Random assignment
            assigned = Math.random() > 0.5 ? 'B' : 'A';
            localStorage.setItem(storageKey, assigned);
            
            // Track assignment only once
            track('Experiment Assigned', {
                experiment: experimentId,
                variant: assigned
            });
        }

        setVariant(assigned);

        // Config logic for specific experiments
        if (experimentId === 'pricing_model_v1') {
            // A = 49 (Control), B = 29 (Test)
            setValue(assigned === 'A' ? 49 : 29);
        }
        
    }, [experimentId, track]);

    return { variant, value };
};

// Helper component to visualize active tests in Admin
export const ABTestStatus: React.FC = () => {
    return (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 border border-gray-700 p-2 rounded text-[10px] text-gray-400 font-mono pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
            <div>TEST: Pricing V1</div>
            <div>VARIANT: {localStorage.getItem('glyph_exp_pricing_model_v1') || 'Unassigned'}</div>
        </div>
    );
}
