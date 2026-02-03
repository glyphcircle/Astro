
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabaseClient';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const { register, error: authError } = useAuth();
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
          ) : (
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
