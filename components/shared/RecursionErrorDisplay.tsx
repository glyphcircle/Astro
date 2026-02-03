import React from 'react';

const RecursionErrorDisplay: React.FC = () => {

  const handleNavigate = () => {
    // Use hash navigation for compatibility and force a reload to clear state.
    window.location.hash = '/admin/config';
    window.location.reload();
  };

  return (
    <div className="p-6 bg-red-950/30 border-2 border-red-500/50 rounded-xl animate-pulse">
        <h3 className="text-red-300 font-bold text-lg font-cinzel mb-3 flex items-center gap-2">
            <span className="text-2xl">🚨</span> CRITICAL: Database Loop Detected
        </h3>
        <p className="text-red-200/80 text-xs mb-4">
            The database is unresponsive due to an infinite security loop. This must be fixed manually by running a repair script in Supabase.
        </p>
        <div className="space-y-1 text-left text-xs text-gray-300 mb-6 bg-black/40 p-3 rounded-lg border border-gray-700">
            <p className="font-bold text-amber-300">ACTION REQUIRED:</p>
            <p>1. Go to <strong className="text-amber-300">Admin Config</strong>.</p>
            <p>2. Open <strong className="text-red-400">SQL Tools</strong>.</p>
            <p>3. Copy the <strong className="text-amber-300">"Recursion Breaker"</strong> script.</p>
            <p>4. Run it in your <strong className="text-green-400">Supabase SQL Editor</strong>.</p>
        </div>
        <button 
            onClick={handleNavigate}
            className="w-full text-sm bg-amber-700 hover:bg-amber-600 border border-amber-500 text-white font-bold py-3 rounded-lg transition-all"
        >
            🛠️ Go to Admin Config Now
        </button>
    </div>
  );
};

export default RecursionErrorDisplay;
