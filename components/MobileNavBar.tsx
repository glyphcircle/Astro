
import React from 'react';
// @ts-ignore
import { Link, useLocation } from 'react-router-dom';

const MobileNavBar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const NAV_ITEMS = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/history', icon: '📜', label: 'History' },
    { path: '/store', icon: '🛒', label: 'Store' },
    { path: '/remedy', icon: '🧘', label: 'Guide' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#0F0F23]/95 backdrop-blur-xl border-t border-amber-500/20 z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.path) ? 'text-amber-400' : 'text-gray-500 hover:text-amber-200'}`}
          >
            <span className={`text-xl transition-transform ${isActive(item.path) ? '-translate-y-1' : ''}`}>
                {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            {isActive(item.path) && (
                <span className="absolute bottom-1 w-1 h-1 bg-amber-400 rounded-full"></span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavBar;
