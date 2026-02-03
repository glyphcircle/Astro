
import React, { useState, useRef, useEffect } from 'react';

interface HelpStep {
  title: string;
  desc: string;
}

interface AdminContextHelpProps {
  context: 'db' | 'cloud' | 'payment' | 'dashboard' | 'setup';
}

const HELP_CONTENT: Record<string, { title: string, steps: HelpStep[] }> = {
  dashboard: {
    title: 'Admin Dashboard Overview',
    steps: [
      { title: 'System Status', desc: 'Check the health of your Cloud (Supabase) and Cache (Local) connections.' },
      { title: 'Navigation', desc: 'Use the grid buttons to jump to specific configuration sections.' },
      { title: 'Security', desc: 'Use the "De-Authorize" button to safely lock the admin panel.' },
      { title: 'Setup Wizard', desc: 'Click the (?) bubble for the initial setup checklist (Auth/Roles).' }
    ]
  },
  setup: {
    title: 'Initial Setup Checklist',
    steps: [
      { title: '1. Disable Confirm Email', desc: 'Go to Authentication > Providers > Email and toggle "Confirm email" to OFF. This allows instant login during development.' },
      { title: '2. Assign Admin Role', desc: 'In the Supabase Table Editor, find your user in the "users" table. Change the "role" column from "seeker" to "admin" and set "credits" to 999999.' },
      { title: '3. Storage Buckets', desc: 'Create a public bucket named "assets" in Supabase Storage if you intend to host custom images directly on your cloud.' },
      { title: '4. Redirect URLs', desc: 'Under Auth > URL Configuration, set your Site URL and Redirect URLs to include your GitHub Pages domain with a wildcard (**).' }
    ]
  },
  db: {
    title: 'Database Management Guide',
    steps: [
      { title: 'Enable/Disable Records', desc: 'Locate the "Active/Inactive" button in the Actions column. Click it to toggle the status instantly.' },
      { title: 'Edit Content', desc: 'Click blue "Edit" to modify fields. Ensure image paths are resolved via active Cloud Providers.' },
      { title: 'Syncing', desc: 'If data looks stale, use the Refresh button (↻) to force a cloud re-fetch.' }
    ]
  },
  cloud: {
    title: 'Cloud Provider Setup',
    steps: [
      { title: 'Add New Provider', desc: 'Click "+ NEW" in the sidebar. Select a provider type (e.g., Google Drive).' },
      { title: 'Activation', desc: 'Locate the provider in the list. Click the "OFF" button to toggle it to "● LIVE".' }
    ]
  },
  payment: {
    title: 'Payment Gateway Setup',
    steps: [
      { title: 'Select Provider', desc: 'Choose Razorpay (IN), Stripe (Global), or PayPal.' },
      { title: 'Testing', desc: 'Use "Initiate ₹1 Test" to verify your credentials work before going live.' }
    ]
  }
};

const AdminContextHelp: React.FC<AdminContextHelpProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContext, setActiveContext] = useState(context);
  const content = HELP_CONTENT[activeContext] || HELP_CONTENT['db'];
  
  // Dragging State
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // --- MOUSE EVENTS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  // --- TOUCH EVENTS ---
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    dragOffset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (isDragging) {
        let newX = clientX - dragOffset.current.x;
        let newY = clientY - dragOffset.current.y;
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;
        newX = Math.max(10, Math.min(newX, maxX));
        newY = Math.max(10, Math.min(newY, maxY));
        setPosition({ x: newX, y: newY });
      }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging]);

  const handleClick = (e: React.MouseEvent) => {
      if (!isDragging) {
          setIsOpen(!isOpen);
      }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            touchAction: 'none'
        }}
        className={`fixed z-[1000] w-14 h-14 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] font-bold text-xl flex items-center justify-center border-2 border-white/20 transition-transform active:scale-95 cursor-move ${isDragging ? 'bg-cyan-700 scale-110' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-105'}`}
        title="Admin Help Guide"
      >
        <span className="text-white pointer-events-none text-2xl drop-shadow-md">?</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-md bg-gray-900 border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden relative">
            <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex gap-2">
                 <button onClick={() => setActiveContext('setup')} className={`text-[9px] px-2 py-1 rounded uppercase font-bold border ${activeContext === 'setup' ? 'bg-cyan-500 text-black border-cyan-400' : 'text-cyan-500 border-cyan-800'}`}>Initial Setup</button>
                 <button onClick={() => setActiveContext(context)} className={`text-[9px] px-2 py-1 rounded uppercase font-bold border ${activeContext !== 'setup' ? 'bg-cyan-500 text-black border-cyan-400' : 'text-cyan-500 border-cyan-800'}`}>Context Guide</button>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cyan-200 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <h4 className="text-sm font-bold text-white mb-4 border-b border-gray-700 pb-2">{content.title}</h4>
              
              <div className="space-y-4">
                {content.steps.map((step, index) => (
                  <div key={index} className="relative pl-4 border-l-2 border-cyan-800">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-cyan-500"></div>
                    <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">{step.title}</h5>
                    <p className="text-sm text-gray-300 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <button 
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-800 hover:bg-gray-700 text-cyan-400 px-6 py-2 rounded text-xs font-bold uppercase tracking-wider"
                >
                    Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminContextHelp;
