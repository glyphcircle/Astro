import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { useTheme } from '../context/ThemeContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cachedSecret, setCachedSecret] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme.mode === 'light';

  const brandLogo = 'https://lh3.googleusercontent.com/d/1Mt-LsfsxuxNpGY0hholo8qkBv58S6VNO';

  useEffect(() => {
    const fetchSecret = async () => {
        try {
            const secret = await dbService.getConfigValue('admin_portal_secret');
            if (secret) setCachedSecret(secret);
        } catch (e) {
            console.debug("Trapdoor pre-fetch skipped (offline/unconfigured)");
        }
    };
    fetchSecret();
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (cachedSecret && val.trim() === cachedSecret) {
        if (navigator.vibrate) navigator.vibrate([30, 30]);
        navigate('/master-login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      if (cachedSecret && (email.trim() === cachedSecret || password.trim() === cachedSecret)) {
          navigate('/master-login');
          return;
      }
      await login(email, password);
    } catch (err: any) {
      setLocalError(err.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 pb-12 transition-colors duration-500 font-lora ${
      isLight ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50' : 'bg-black'
    }`}>
      <div className={`w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl animate-fade-in-up transition-all ${
        isLight ? 'bg-white/90 border-amber-200' : 'bg-gray-900/60 border-amber-500/20'
      }`}>
        <div className="p-8">
          <div className="text-center mb-10">
             <div className="mx-auto w-24 h-24 mb-6 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-purple-600 shadow-xl flex items-center justify-center overflow-hidden bg-black border border-amber-500/20">
                <img src={brandLogo} alt="Logo" className="w-[80%] h-[80%] object-contain" />
             </div>
             <h1 className={`text-3xl font-cinzel font-black tracking-widest uppercase ${isLight ? 'text-amber-900' : 'text-amber-500'}`}>Registry Access</h1>
             <p className="text-gray-500 italic text-[10px] uppercase mt-2 tracking-[0.3em]">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className={`block font-cinzel font-bold text-[9px] uppercase tracking-widest ml-1 mb-1.5 ${isLight ? 'text-amber-800' : 'text-amber-500/60'}`}>Administrative ID</label>
                <input 
                    type="text" 
                    value={email} 
                    onChange={(e) => handleEmailChange(e.target.value)} 
                    className={`w-full p-3.5 border rounded-xl outline-none transition-all font-mono text-xs shadow-inner ${
                      isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600' : 'bg-black border-gray-800 text-white focus:border-amber-500'
                    }`} 
                    placeholder="user@glyphcircle.com" required 
                />
            </div>
            
            <div>
                <label className={`block font-cinzel font-bold text-[9px] uppercase tracking-widest ml-1 mb-1.5 ${isLight ? 'text-amber-800' : 'text-amber-500/60'}`}>Secret Key</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className={`w-full p-3.5 border rounded-xl outline-none transition-all font-mono text-xs shadow-inner ${
                      isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950 focus:border-amber-600' : 'bg-black border-gray-800 text-white focus:border-amber-500'
                    }`} 
                    placeholder="••••••••" required 
                />
            </div>

            {localError && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-xs text-center animate-shake">
                {localError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className={`w-full font-black py-4 rounded-xl shadow-xl font-cinzel tracking-widest uppercase disabled:opacity-50 transition-all active:scale-95 text-xs ${
              isLight ? 'bg-amber-800 text-white hover:bg-black' : 'bg-amber-600 hover:bg-amber-500 text-black'
            }`}>
                {isSubmitting ? 'ESTABLISHING LINK...' : 'AUTHORIZE ACCESS'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-800 pt-6">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest leading-relaxed">
                Protected by Imperial Cryptography<br/>
                Unauthorized entry attempts are logged
              </p>
          </div>
        </div>
      </div>
      <button onClick={() => navigate('/home')} className="mt-8 text-gray-700 hover:text-amber-500 text-[10px] uppercase font-bold tracking-[0.4em] transition-all">Return to Home Portal</button>
    </div>
  );
};

export default Login;