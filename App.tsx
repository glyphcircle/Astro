import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';

// Component imports - using relative paths for stability
import Home from './components/Home';
import Palmistry from './components/Palmistry';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import Footer from './components/Footer';
import Remedy from './components/Remedy';
import FaceReading from './components/FaceReading';
import DreamAnalysis from './components/DreamAnalysis';
import Matchmaking from './components/Matchmaking';
import AdminDashboard from './components/AdminDashboard';
import AdminConfig from './components/AdminConfig';
import AdminCloudConfig from './components/AdminCloudConfig';
import AdminPaymentConfig from './components/AdminPaymentConfig';
import AdminPaymentSettings from './pages/AdminPaymentSettings';
import AdminDB from './components/AdminDB';
import AdminBatchEditor from './components/AdminBatchEditor';
import MasterLogin from './components/MasterLogin';
import RevenueDashboard from './components/RevenueDashboard';
import NumerologyAstrology from './components/NumerologyAstrology';
import Tarot from './components/Tarot';
import Store from './components/Store';
import AdminGuard from './components/AdminGuard';
import BackupManager from './components/BackupManager';
import ReadingHistory from './components/ReadingHistory';
import GemstoneGuide from './components/GemstoneGuide';
import Ayurveda from './components/Ayurveda';
import MoonJournal from './components/MoonJournal';
import MuhuratPicker from './components/MuhuratPicker';
import CosmicSync from './components/CosmicSync';
import VoiceOracle from './components/VoiceOracle';
import PanchangBar from './components/PanchangBar';
import SigilGallery from './components/SigilGallery';
import ReportDesigner from './components/ReportDesigner';
import KalnirnayeCalendar from './components/KalnirnayeCalendar';
import ComingSoon from './components/ComingSoon';
import ReportTemplateManager from './components/ReportTemplateManager';

// Context and Provider imports
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PushNotifications } from './components/PushNotifications';
import DailyReminder from './components/DailyReminder';
import BadgeCounter from './components/BadgeCounter';
import { AnalyticsProvider } from './components/Analytics';
import { ABTestStatus } from './components/ABTesting';
import { AccessibilityProvider } from './context/AccessibilityContext';
import LargeTextMode from './components/LargeTextMode';
import ReferralProgram from './components/ReferralProgram';
import Leaderboard from './components/Leaderboard';
import GamificationHUD from './components/GamificationHUD';
import ContextDbNavigator from './components/ContextDbNavigator';
import ErrorBoundary from './components/shared/ErrorBoundary';
import MobileNavBar from './components/MobileNavBar';
import { useDevice } from './hooks/useDevice';

// Idle Cursor Component
const IdleCursor: React.FC = () => {
  const [isIdle, setIsIdle] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const idleTimer = useRef<any | null>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setIsIdle(false);
      setPos({ x: e.clientX, y: e.clientY });
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIsIdle(true), 3000);
    };

    const handleClick = () => setIsIdle(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleClick);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  if (!isIdle) return null;

  return (
    <div
      className="fixed pointer-events-none z-[9999] select-none animate-pulse-glow"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)', cursor: 'none' }}
    >
      <span className="text-5xl text-amber-400 font-bold drop-shadow-[0_0_20px_rgba(245,158,11,0.9)] select-none">
        ॐ
      </span>
      <style>{`body, button, a, input { cursor: none !important; }`}</style>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-skin-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// App Routes Component
function AppRoutes() {
  const { isAuthenticated, isAdminVerified, logout } = useAuth();
  const location = useLocation();
  const { isMobile } = useDevice();

  const isAuthPage = ['/login', '/register', '/master-login'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname === '/master-login';
  const showLayout = isAuthenticated && !isAuthPage && !isAdminPage;

  return (
    <CartProvider>
      <div className="bg-skin-base min-h-screen text-skin-text flex flex-col font-lora overflow-x-hidden transition-colors duration-500">
        <IdleCursor />

        {showLayout && <Header onLogout={logout} isMobile={isMobile} />}

        {isAuthenticated && (
          <>
            <DailyReminder />
            {!isMobile && <BadgeCounter />}
            <LargeTextMode />
            {isAdminVerified && <ContextDbNavigator />}
            {isAdminVerified && <ABTestStatus />}
            {!isAdminPage && <GamificationHUD />}
            {!isAdminPage && !isMobile && (
              <Link to="/referrals" className="fixed bottom-6 left-6 z-40 animate-pulse-glow group">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center border-2 border-white/20 transform group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎁</span>
                </div>
              </Link>
            )}
          </>
        )}

        <main className={`flex-grow ${showLayout ? `container mx-auto px-4 ${isMobile ? 'pb-24 pt-4' : 'py-8'}` : ''}`}>
          {location.pathname === '/home' && isAuthenticated && <PanchangBar />}

          <Routes>
            <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/home" /> : <Register />} />
            <Route path="/master-login" element={<MasterLogin />} />

            <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/config" element={<AdminGuard><AdminConfig /></AdminGuard>} />
            <Route path="/admin/cloud" element={<AdminGuard><AdminCloudConfig /></AdminGuard>} />
            <Route path="/admin/payments" element={<AdminGuard><AdminPaymentConfig /></AdminGuard>} />
            <Route path="/admin/payment-settings" element={<AdminGuard><AdminPaymentSettings /></AdminGuard>} />
            <Route path="/admin/revenue" element={<AdminGuard><RevenueDashboard /></AdminGuard>} />
            <Route path="/admin/db/:table" element={<AdminGuard><AdminDB /></AdminGuard>} />
            <Route path="/admin/batch-editor" element={<AdminGuard><AdminBatchEditor /></AdminGuard>} />
            <Route path="/admin/backup" element={<AdminGuard><BackupManager /></AdminGuard>} />
            <Route path="/admin/report-designer" element={<AdminGuard><ReportDesigner /></AdminGuard>} />
            <Route path="/admin/report-templates" element={<AdminGuard><ReportTemplateManager /></AdminGuard>} />

            <Route path="/home" element={<ProtectedRoute><ErrorBoundary><Home /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><ErrorBoundary><ReadingHistory /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/palmistry" element={<ProtectedRoute><ErrorBoundary><Palmistry /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/numerology" element={<ProtectedRoute><ErrorBoundary><NumerologyAstrology mode="numerology" /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/astrology" element={<ProtectedRoute><ErrorBoundary><NumerologyAstrology mode="astrology" /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/tarot" element={<ProtectedRoute><ErrorBoundary><Tarot /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/face-reading" element={<ProtectedRoute><ErrorBoundary><FaceReading /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/dream-analysis" element={<ProtectedRoute><ErrorBoundary><DreamAnalysis /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/matchmaking" element={<ProtectedRoute><ErrorBoundary><Matchmaking /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/remedy" element={<ProtectedRoute><ErrorBoundary><Remedy /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><ErrorBoundary><Store /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/gemstones" element={<ProtectedRoute><ErrorBoundary><GemstoneGuide /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/referrals" element={<ProtectedRoute><ReferralProgram /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><ErrorBoundary><SigilGallery /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/ayurveda" element={<ProtectedRoute><ErrorBoundary><Ayurveda /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/moon-journal" element={<ProtectedRoute><ErrorBoundary><MoonJournal /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/muhurat" element={<ProtectedRoute><ErrorBoundary><MuhuratPicker /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/cosmic-sync" element={<ProtectedRoute><ErrorBoundary><CosmicSync /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/voice-oracle" element={<ProtectedRoute><ErrorBoundary><VoiceOracle /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><ErrorBoundary><KalnirnayeCalendar /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/coming-soon" element={<ComingSoon />} />

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>

        {showLayout && isMobile && <MobileNavBar />}
        {showLayout && !isMobile && <Footer />}
      </div>
    </CartProvider>
  );
}

// Main App Component
function App() {
  return (
    <AccessibilityProvider>
      <AnalyticsProvider>
        <PushNotifications>
          <AppRoutes />
        </PushNotifications>
      </AnalyticsProvider>
    </AccessibilityProvider>
  );
}

export default App;
