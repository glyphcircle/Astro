import React from 'react';

interface AlreadyPaidBannerProps {
  transaction: any;
}

const AlreadyPaidBanner: React.FC<AlreadyPaidBannerProps> = ({ transaction }) => {
  if (!transaction) return null;

  const dateStr = new Date(transaction.created_at).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="w-full mb-8 animate-fade-in-up">
      <div className="bg-green-900/20 border-2 border-green-500/40 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-pulse">
            ✅
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-green-300 font-cinzel font-black uppercase tracking-widest text-sm">Retrieved from History</h4>
            <p className="text-amber-100/60 text-[10px] uppercase font-bold tracking-widest mt-1">No additional charge for today's duplicate request</p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1 font-mono text-[9px] text-gray-400">
          <div><span className="text-amber-500/50 uppercase">Order:</span> <span className="text-white font-bold">{transaction.order_id}</span></div>
          <div><span className="text-amber-500/50 uppercase">Paid:</span> <span className="text-white font-bold">₹{transaction.amount} on {dateStr}</span></div>
          <div className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 mt-1 uppercase font-black tracking-tighter">Status: Active Scribe</div>
        </div>
      </div>
    </div>
  );
};

export default AlreadyPaidBanner;