import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { useTheme } from '../context/ThemeContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<'form' | 'phone' | 'otp'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cachedSecret, setCachedSecret] = useState<string | null>(null);
  
  const { login, signInWithGoogle, signInWithPhone, verifyOtp } = useAuth();
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

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google Auth failed", err);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    try {
      await signInWithPhone(phone);
      setMode('otp');
    } catch (err: any) {
      setLocalError(err.message || "Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    try {
      await verifyOtp(phone, otp);
      navigate('/home');
    } catch (err: any) {
      setLocalError(err.message || "Invalid OTP");
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

          {mode === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                    <label className={`block font-cinzel font-bold text-[9px] uppercase tracking-widest ml-1 mb-1.5 ${isLight ? 'text-amber-800' : 'text-amber-500/60'}`}>Phone Number</label>
                    <input
                        autoFocus
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full p-3.5 border rounded-xl outline-none transition-all font-mono text-xs shadow-inner ${
                          isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950' : 'bg-black border-gray-800 text-white'
                        }`}
                        placeholder="+91 99999 99999"
                        required
                    />
                </div>
                <button type="submit" disabled={isSubmitting} className={`w-full font-black py-4 rounded-xl shadow-xl font-cinzel tracking-widest uppercase text-xs ${
                  isLight ? 'bg-amber-800 text-white' : 'bg-amber-600 text-black'
                }`}>
                    {isSubmitting ? 'SENDING...' : 'GET ACCESS CODE'}
                </button>
                <button type="button" onClick={() => setMode('form')} className="w-full text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                    Back to Email
                </button>
            </form>
          ) : mode === 'otp' ? (
            <form onSubmit={handleOtpVerify} className="space-y-6">
                <div>
                    <label className={`block font-cinzel font-bold text-[9px] uppercase tracking-widest ml-1 mb-1.5 ${isLight ? 'text-amber-800' : 'text-amber-500/60'}`}>Access Code</label>
                    <input
                        autoFocus
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className={`w-full p-3.5 border rounded-xl outline-none transition-all font-mono text-center text-2xl tracking-[0.5em] shadow-inner ${
                          isLight ? 'bg-amber-50/50 border-amber-200 text-amber-950' : 'bg-black border-gray-800 text-white'
                        }`}
                        placeholder="••••••"
                        required
                    />
                </div>
                <button type="submit" disabled={isSubmitting} className={`w-full font-black py-4 rounded-xl shadow-xl font-cinzel tracking-widest uppercase text-xs ${
                  isLight ? 'bg-amber-800 text-white' : 'bg-amber-600 text-black'
                }`}>
                    {isSubmitting ? 'VERIFYING...' : 'ENTER SANCTUM'}
                </button>
            </form>
          ) : (
            <>
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

              <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center"><span className={`w-full border-t ${isLight ? 'border-amber-200' : 'border-gray-800'}`}></span></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]"><span className={`${isLight ? 'bg-white' : 'bg-gray-900'} px-4 text-gray-500`}>Or continue with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <button 
                      onClick={handleGoogleLogin}
                      className={`flex items-center justify-center gap-3 font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 border ${
                        isLight ? 'bg-white border-gray-200 text-gray-700' : 'bg-gray-800 border-gray-700 text-white'
                      }`}
                  >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="text-[10px] uppercase tracking-wider">Google</span>
                  </button>
                  <button 
                      onClick={() => setMode('phone')}
                      className={`flex items-center justify-center gap-3 font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 border ${
                        isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-black border-amber-500/20 text-amber-500'
                      }`}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] uppercase tracking-wider">Mobile</span>
                  </button>
              </div>
            </>
          )}

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