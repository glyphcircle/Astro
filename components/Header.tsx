
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';
import MasterToolsModal from './MasterToolsModal';
import { ADMIN_EMAILS } from '../constants';

const DEFAULT_LOGO = 'https://lh3.googleusercontent.com/d/1Mt-LsfsxuxNpGY0hholo8qkBv58S6VNO';

const Header: React.FC<{ onLogout: () => void; isMobile?: boolean }> = ({ onLogout, isMobile }) => {
  const { t } = useTranslation();
  const { isAdminVerified, user } = useAuth();
  const { theme, toggleMode } = useTheme();
  const [isMasterToolsOpen, setIsMasterToolsOpen] = useState(false);
  const navigate = useNavigate();

  // 🛡️ REINFORCED ADMIN VISIBILITY
  const isSovereign = isAdminVerified || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));

  return (
    <header className="bg-[#0F0F23]/95 backdrop-blur-xl shadow-2xl sticky top-0 z-50 border-b-2 border-amber-500/30 transition-colors duration-500" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500/50 overflow-hidden bg-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-transform group-hover:scale-110">
                <img src={DEFAULT_LOGO} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-amber-500 tracking-[0.2em] font-cinzel uppercase drop-shadow-md text-skin-accent">
              {t('glyphCircle')}
            </h1>
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden sm:flex items-center gap-3">
                {/* ⚙️ CONFIG BUTTON (RED BOX LOCATION: Left of Moon) */}
                {isSovereign && (
                    <button 
                        onClick={() => setIsMasterToolsOpen(true)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-amber-500 hover:text-black backdrop-blur-md border border-amber-500/30 transition-all shadow-lg text-xl active:scale-90"
                        title="Master Registry Tools"
                    >
                        ⚙️
                    </button>
                )}
                
                {/* 🌙 MOON ICON (Theme Toggle) */}
                <button 
                    onClick={toggleMode}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-amber-500 hover:text-black backdrop-blur-md border border-amber-500/30 transition-all shadow-lg text-xl active:scale-90"
                    title={theme.mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme.mode === 'dark' ? '🌙' : '☀️'}
                </button>
                
                {/* 🌐 LANGUAGE SWITCHER (US/EN) */}
                <LanguageSwitcher />
            </div>

            {/* Mobile Icons */}
            <div className="sm:hidden flex items-center gap-2">
                <button onClick={toggleMode} className="text-xl p-1 text-skin-accent">
                    {theme.mode === 'dark' ? '🌙' : '☀️'}
                </button>
                {isSovereign && (
                    <button 
                        onClick={() => setIsMasterToolsOpen(true)} 
                        className="text-2xl text-amber-500 p-1"
                    >
                        ⚙️
                    </button>
                )}
            </div>

            <button 
                onClick={onLogout} 
                className="bg-gray-800 border border-white/10 text-white hover:bg-red-900/40 hover:text-red-200 transition-all font-bold rounded-full py-2 px-6 text-[10px] uppercase tracking-widest shadow-xl"
            >
                {t('logout')}
            </button>
            {isSovereign && <MasterToolsModal isVisible={isMasterToolsOpen} onClose={() => setIsMasterToolsOpen(false)} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
