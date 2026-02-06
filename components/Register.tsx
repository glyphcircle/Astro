import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabaseClient';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<'form' | 'phone' | 'otp'>('form');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const { register, signInWithGoogle, signInWithPhone, verifyOtp, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConfigError(true);
    }
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address";
    if (formData.password.length < 6) newErrors.password = "Password must be 6+ characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (configError) {
      alert("Database connection is not configured.");
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    try {
        await register(formData.name, formData.email, formData.password);
        setSuccessMsg("An invitation has been sent to your email. Check your mystical scrolls (inbox and spam) to activate your Seeker profile.");
    } catch (err: any) {
        const msg = err.message || String(err);
        if (msg.includes('Location.assign') || msg.includes('script denied') || msg.includes('BAD_URI')) {
            setSuccessMsg("Connection initiated! Please check your email to proceed.");
        } else {
            console.error("Registration Error:", msg);
        }
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
    try {
      await signInWithPhone(phone);
      setMode('otp');
    } catch (err: any) {
      setErrors({ phone: err.message || "Failed to send OTP" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await verifyOtp(phone, otp);
      navigate('/home');
    } catch (err: any) {
      setErrors({ otp: err.message || "Invalid OTP" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthBars = () => {
      if (!formData.password) return [false, false, false, false];
      const bars = [true];
      if (formData.password.length > 8) bars.push(true);
      if (/[0-9]/.test(formData.password)) bars.push(true);
      if (/[A-Z]/.test(formData.password)) bars.push(true);
      while (bars.length < 4) bars.push(false);
      return bars;
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-md bg-skin-surface border border-skin-border rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl animate-fade-in-up">
        <div className="p-8">
          <div className="text-center mb-10">
              <h2 className="text-3xl font-cinzel font-bold text-skin-accent mb-2 uppercase tracking-widest drop-shadow-md">JOIN THE CIRCLE</h2>
              <p className="text-skin-text/60 font-lora italic text-sm">Begin your mystical journey.</p>
          </div>

          {successMsg ? (
              <div className="bg-skin-accent/10 border border-skin-accent/30 p-8 rounded-xl text-skin-text text-center animate-fade-in-up">
                  <div className="text-5xl mb-6 animate-pulse">✉️</div>
                  <h3 className="text-xl font-cinzel font-bold mb-4 text-skin-accent uppercase tracking-widest">Gateway Awaiting</h3>
                  <p className="font-lora italic leading-relaxed mb-8 text-sm">{successMsg}</p>
                  <Link to="/login">
                    <button className="w-full bg-transparent border border-skin-accent/50 hover:bg-skin-accent/10 text-skin-accent font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-widest">
                        Return to Login
                    </button>
                  </Link>
              </div>
          ) : mode === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                    <label className="block text-skin-accent font-cinzel font-bold text-[10px] mb-1.5 uppercase tracking-[0.2em]">Phone Number</label>
                    <input
                        autoFocus
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3.5 bg-black/40 border border-skin-border/50 rounded-xl text-skin-text focus:outline-none focus:border-skin-accent transition-all placeholder-skin-text/20"
                        placeholder="+91 99999 99999"
                        required
                    />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-skin-accent text-skin-button-text font-bold py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm">
                    {isSubmitting ? 'SENDING...' : 'GET ACCESS CODE'}
                </button>
                <button type="button" onClick={() => setMode('form')} className="w-full text-xs text-skin-text/40 hover:text-skin-accent uppercase font-bold tracking-widest">
                    Back to Email
                </button>
            </form>
          ) : mode === 'otp' ? (
            <form onSubmit={handleOtpVerify} className="space-y-6">
                <div className="text-center mb-6">
                    <p className="text-sm text-skin-text/60 italic">Sent to {phone}</p>
                </div>
                <div>
                    <label className="block text-skin-accent font-cinzel font-bold text-[10px] mb-1.5 uppercase tracking-[0.2em]">Access Code</label>
                    <input
                        autoFocus
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full p-3.5 bg-black/40 border border-skin-border/50 rounded-xl text-skin-text text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-skin-accent transition-all"
                        placeholder="••••••"
                        required
                    />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-skin-accent text-skin-button-text font-bold py-4 rounded-xl shadow-lg uppercase tracking-widest text-sm">
                    {isSubmitting ? 'VERIFYING...' : 'ENTER SANCTUM'}
                </button>
                <button type="button" onClick={() => setMode('phone')} className="w-full text-xs text-skin-text/40 hover:text-skin-accent uppercase font-bold tracking-widest">
                    Edit Number
                </button>
            </form>
          ) : (
            <>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {configError && (
                        <div className="bg-red-900/20 border border-red-500/50 p-3 rounded text-red-400 text-[10px] text-center uppercase font-bold tracking-wider">
                            ⚠️ Database connection not configured
                        </div>
                    )}

                    <div>
                        <label className="block text-skin-accent font-cinzel font-bold text-[10px] mb-1.5 uppercase tracking-[0.2em]">Full Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className={`w-full p-3.5 bg-black/40 border rounded-xl text-skin-text focus:outline-none focus:border-skin-accent transition-all placeholder-skin-text/20 ${errors.name ? 'border-red-500' : 'border-skin-border/50'}`}
                            placeholder="Mystic Seeker"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-skin-accent font-cinzel font-bold text-[10px] mb-1.5 uppercase tracking-[0.2em]">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className={`w-full p-3.5 bg-black/40 border rounded-xl text-skin-text focus:outline-none focus:border-skin-accent transition-all placeholder-skin-text/20 ${errors.email ? 'border-red-500' : 'border-skin-border/50'}`}
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-skin-accent font-cinzel font-bold text-[10px] mb-1.5 uppercase tracking-[0.2em]">Passphrase</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className={`w-full p-3.5 bg-black/40 border rounded-xl text-skin-text focus:outline-none focus:border-skin-accent transition-all placeholder-skin-text/20 ${errors.password ? 'border-red-500' : 'border-skin-border/50'}`}
                            placeholder="••••••••"
                            required
                        />
                        
                        <div className="flex gap-1.5 mt-3 px-1">
                            {getStrengthBars().map((active, i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${active ? 'bg-skin-accent/80 shadow-[0_0_10px_var(--color-primary-glow)]' : 'bg-gray-800'}`}></div>
                            ))}
                        </div>
                    </div>

                    {(authError || Object.keys(errors).length > 0) && (
                        <div className="bg-red-900/20 border border-red-500/50 p-3 rounded text-red-400 text-xs text-center">
                            {authError || Object.values(errors)[0]}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full bg-gradient-to-r from-skin-accent to-amber-700 hover:brightness-110 text-skin-button-text font-bold py-4 rounded-xl shadow-lg font-cinzel tracking-widest text-sm border border-white/10 transition-all transform active:scale-95 disabled:opacity-50 uppercase"
                    >
                        {isSubmitting ? 'BINDING SPIRIT...' : 'Create Account'}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-skin-border/20"></span></div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]"><span className="bg-skin-surface px-4 text-skin-text/40">Or continue with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 border border-gray-200"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-xs uppercase tracking-wider">Google</span>
                    </button>
                    <button 
                        onClick={() => setMode('phone')}
                        className="flex items-center justify-center gap-3 bg-gray-900 hover:bg-black text-amber-500 font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 border border-amber-500/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs uppercase tracking-wider">Mobile</span>
                    </button>
                </div>
            </>
          )}

          <div className="mt-10 text-center">
            <p className="text-skin-text/40 text-xs font-lora">
              Already have an account? {' '}
              <Link 
                to="/login" 
                className="text-skin-accent hover:underline font-bold font-cinzel tracking-tight cursor-pointer"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;