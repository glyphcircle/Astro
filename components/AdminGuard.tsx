import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

const AdminGuard: React.FC<Props> = ({ children }) => {
  const { user, isAdminVerified, isAdminLoading, isLoading, isAuthenticated } = useAuth();
  
  // 1. Initial Auth Load
  if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
  }

  // 2. Sovereign Verification in Progress
  if (isAdminLoading) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono">
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(37,99,235,0.4)]"></div>
            <h2 className="text-blue-500 text-sm tracking-[0.4em] uppercase animate-pulse">Verifying Sovereign Clearance</h2>
            <p className="text-gray-600 text-[10px] mt-4 uppercase">Handshaking with Private Schema...</p>
        </div>
    );
  }

  // 3. 🛡️ DEFINITIVE SECURITY CHECK
  // Check if standard admin verified OR recovery session exists
  const masterSession = localStorage.getItem('glyph_admin_session');
  if (isAdminVerified || masterSession) {
      return <>{children}</>;
  }

  // 4. Verification Failed
  if (isAuthenticated) {
      // Logged in but NOT an admin -> Redirect to app home
      console.warn("⛔ AdminGuard: Access Denied for standard user. Returning to Home.");
      return <Navigate to="/home" replace />;
  }

  // Not logged in at all -> Redirect to standard login
  return <Navigate to="/login" replace />;
};

export default AdminGuard;