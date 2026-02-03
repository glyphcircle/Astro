import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { dbService, User, Reading } from '../services/db';

interface PendingReading {
  type: Reading['type'];
  title: string;
  content: string;
  subtitle?: string;
  image_url?: string;
  meta_data?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdminVerified: boolean;
  isAdminLoading: boolean;
  isLoading: boolean;
  error: string | null;
  history: Reading[];
  credits: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
  saveReading: (reading: PendingReading) => void;
  register: any; sendMagicLink: any; toggleFavorite: any; pendingReading: any; setPendingReading: any; commitPendingReading: any; awardKarma: any; newSigilUnlocked: any; clearSigilNotification: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [history, setHistory] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshInProgress = useRef(false);
  const dbHanging = useRef(false);

  const refreshUser = useCallback(async () => {
    // 🛡️ PREVENT RECURSION & OVERLAPPING REFRESHES
    if (refreshInProgress.current) {
      console.log('🔄 [Auth] Refresh already in progress, skipping...');
      return;
    }
    refreshInProgress.current = true;

    try {
      // Emergency recovery check from local session
      const recoverySession = localStorage.getItem('glyph_admin_session');
      if (recoverySession) {
        try {
          const sess = JSON.parse(recoverySession);
          if (sess.role === 'admin') {
            setIsAdminVerified(true);
            setUser(prev => prev || { id: 'recovery-id', email: sess.user || 'admin@local', name: 'Recovery Admin', role: 'admin', credits: 999999, currency: 'INR', status: 'active', created_at: new Date().toISOString() });
          }
        } catch (e) {
          localStorage.removeItem('glyph_admin_session');
        }
      }

      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        refreshInProgress.current = false;
        return;
      }

      // 1. Get current Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        // If the signal was aborted, don't throw a fatal exception
        if (sessionError.message?.toLowerCase().includes('abort') || sessionError.message?.toLowerCase().includes('signal')) {
          console.warn('⚠️ [Auth] Session check aborted due to timeout.');
          refreshInProgress.current = false;
          setIsLoading(false);
          return;
        }
        throw sessionError;
      }
      
      if (session?.user) {
        const jwtRole = (session.user.app_metadata?.role as any) || 'seeker';
        
        const initialUser: User = { 
          id: session.user.id, 
          email: session.user.email!, 
          name: (session.user.user_metadata?.full_name as string) || 'Seeker', 
          role: jwtRole, 
          credits: (session.user.user_metadata?.credits as number) || 0, 
          currency: 'INR', 
          status: 'active',
          created_at: session.user.created_at,
          gamification: { karma: 0, streak: 0, readingsCount: 0, unlockedSigils: [] }
        };
        
        setUser(prev => (prev?.id === initialUser.id && prev.role === initialUser.role) ? prev : initialUser);
        setIsLoading(false);

        // 🛡️ SOVEREIGN HANDSHAKE (Background)
        setIsAdminLoading(true);
        try {
            const verifiedAdmin = await dbService.checkIsAdmin();
            setIsAdminVerified(verifiedAdmin);
            if (verifiedAdmin) {
                setUser(prev => prev ? { ...prev, role: 'admin' } : null);
            }
        } catch (verifErr) {
            console.warn("⚠️ [Auth] Sovereign Handshake slow or blocked.");
        } finally {
            setIsAdminLoading(false);
        }

        // 2. Fetch profile and history if not hanging
        if (!dbHanging.current) {
            try {
                const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
                if (profile) {
                    setUser(prev => ({ ...prev, ...profile }));
                    const { data: readings } = await supabase.from('readings').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
                    setHistory(readings || []);
                }
            } catch (e: any) {
                if (e.message?.toLowerCase().includes('abort') || e.name === 'AbortError') {
                    console.warn("⚠️ [Auth] Data fetch timed out, will retry on next interaction.");
                } else {
                    dbHanging.current = true;
                }
            }
        }
      } else {
        setUser(null);
        setIsAdminVerified(false);
        setIsLoading(false);
      }
    } catch (e: any) {
      if (e.message?.toLowerCase().includes('abort') || e.name === 'AbortError') {
        console.warn("⚠️ [Auth] User refresh aborted.");
      } else {
        console.error("💥 [Auth] Refresh Exception:", e);
      }
      setIsLoading(false);
    } finally {
      refreshInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    refreshUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      console.log(`🔌 [Auth] Auth Event: ${event}`);
      if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
        await refreshUser();
      }
      if (event === 'SIGNED_OUT') { 
        setUser(null); 
        setHistory([]); 
        setIsAdminVerified(false);
        localStorage.removeItem('glyph_admin_session');
        setIsLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Force immediate refresh state cleanup before calling refreshUser
      refreshInProgress.current = false; 
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('glyph_admin_session');
    setUser(null);
    setIsAdminVerified(false);
    setHistory([]);
    await supabase.auth.signOut();
  };

  const saveReading = useCallback(async (readingData: PendingReading) => {
    if (user) {
      try {
          const { data, error } = await dbService.saveReading({ ...readingData, user_id: user.id });
          if (error) throw error;
          if (data) {
            setHistory((prev: Reading[]) => [data as Reading, ...prev]);
          }
      } catch (e) {
        console.error("Failed to save reading:", e);
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isAdminVerified, isAdminLoading, credits: user?.credits || 0, isLoading, error, history,
      login, logout, refreshUser, saveReading,
      register: null, sendMagicLink: null, toggleFavorite: null, pendingReading: null,
      setPendingReading: null, commitPendingReading: null, awardKarma: () => {},
      newSigilUnlocked: null, clearSigilNotification: () => {}
    }}>
      {children}
    </AuthContext.Provider>
  );
};