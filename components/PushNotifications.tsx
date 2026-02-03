
import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import Button from './shared/Button';
import Modal from './shared/Modal';

export interface NotificationPreferences {
  daily: boolean;
  store: boolean;
  reminders: boolean;
}

interface NotificationContextType {
  permission: NotificationPermission;
  preferences: NotificationPreferences;
  requestPermission: () => void;
  updatePreferences: (prefs: NotificationPreferences) => void;
  sendNotification: (title: string, body?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within PushNotifications wrapper");
  return context;
};

export const PushNotifications: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    daily: true,
    store: true,
    reminders: true
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    const storedPrefs = localStorage.getItem('glyph_notif_prefs');
    if (storedPrefs) {
      setPreferences(JSON.parse(storedPrefs));
    }
  }, []);

  const openPermissionModal = () => {
      setShowModal(true);
  };

  const confirmSubscription = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      // Save preferences explicitly
      localStorage.setItem('glyph_notif_prefs', JSON.stringify(preferences));

      if (result === 'granted') {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        new Notification("🔮 Cosmic Connection Established", {
          body: "Your preferences have been recorded in the stars.",
          icon: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png"
        });
      }
      setShowModal(false);
    } catch (error) {
      console.error("Permission request failed", error);
    }
  };

  const updatePreferences = (prefs: NotificationPreferences) => {
      setPreferences(prefs);
      localStorage.setItem('glyph_notif_prefs', JSON.stringify(prefs));
  };

  const sendNotification = (title: string, body?: string) => {
    if (permission === 'granted') {
      if (navigator.vibrate) navigator.vibrate([200]);
      
      const options: any = {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
        vibrate: [200, 100, 200],
        tag: 'glyph-circle-alert',
        renotify: true
      };

      try {
          new Notification(title, options);
      } catch (e) {
          console.error("Notification dispatch error", e);
      }
    }
  };

  return (
    <NotificationContext.Provider value={{ permission, preferences, requestPermission: openPermissionModal, updatePreferences, sendNotification }}>
      {children}
      {permission === 'default' && !showModal && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-900/80 border-t border-amber-500/30 p-4 z-[100] animate-fade-in-up backdrop-blur-xl shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
           <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/50 animate-pulse">
                     <span className="text-xl">🔔</span>
                  </div>
                  <div>
                      <h4 className="text-amber-300 font-bold font-cinzel text-lg">Enable Cosmic Updates?</h4>
                      <p className="text-amber-100/70 text-sm font-lora">Customize your daily insights and alerts.</p>
                  </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setPermission('denied')} 
                    className="flex-1 sm:flex-none px-4 py-2 text-sm text-amber-200/60 hover:text-amber-100 font-bold transition-colors"
                  >
                    Later
                  </button>
                  <Button onClick={openPermissionModal} className="flex-1 sm:flex-none py-2 px-6 text-sm bg-amber-600 hover:bg-amber-500 border-none shadow-lg">
                    Customize
                  </Button>
              </div>
           </div>
        </div>
      )}

      {/* Preferences Modal (GDPR Consent) */}
      <Modal isVisible={showModal} onClose={() => setShowModal(false)}>
          <div className="p-6 bg-gray-900 text-amber-50 rounded-lg">
              <h3 className="text-xl font-cinzel font-bold text-amber-300 mb-2">Cosmic Signals</h3>
              <p className="text-xs text-gray-400 mb-6">GDPR Consent: Select the types of messages you wish to receive. You can disable these at any time via browser settings.</p>
              
              <div className="space-y-3 mb-8">
                  <label className="flex items-start gap-3 p-3 bg-black/30 rounded border border-gray-700 cursor-pointer hover:border-amber-500/30 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={preferences.daily} 
                        onChange={e => setPreferences({...preferences, daily: e.target.checked})} 
                        className="mt-1 form-checkbox h-4 w-4 text-amber-600 bg-gray-800 border-gray-600 focus:ring-amber-500 rounded" 
                      />
                      <div>
                          <div className="font-bold text-sm text-amber-100">Daily Horoscope</div>
                          <div className="text-[10px] text-gray-500">Morning celestial guidance at 8:00 AM</div>
                      </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 bg-black/30 rounded border border-gray-700 cursor-pointer hover:border-amber-500/30 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={preferences.store} 
                        onChange={e => setPreferences({...preferences, store: e.target.checked})} 
                        className="mt-1 form-checkbox h-4 w-4 text-amber-600 bg-gray-800 border-gray-600 focus:ring-amber-500 rounded" 
                      />
                      <div>
                          <div className="font-bold text-sm text-amber-100">Store Treasures</div>
                          <div className="text-[10px] text-gray-500">Alerts for new artifacts and flash sales</div>
                      </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-black/30 rounded border border-gray-700 cursor-pointer hover:border-amber-500/30 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={preferences.reminders} 
                        onChange={e => setPreferences({...preferences, reminders: e.target.checked})} 
                        className="mt-1 form-checkbox h-4 w-4 text-amber-600 bg-gray-800 border-gray-600 focus:ring-amber-500 rounded" 
                      />
                      <div>
                          <div className="font-bold text-sm text-amber-100">Ritual Reminders</div>
                          <div className="text-[10px] text-gray-500">Streak alerts and gamification updates</div>
                      </div>
                  </label>
              </div>

              <div className="flex gap-3">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-400 hover:text-white text-sm font-bold">Cancel</button>
                  <Button onClick={confirmSubscription} className="flex-1 bg-green-700 hover:bg-green-600 border-green-500">Confirm & Allow</Button>
              </div>
          </div>
      </Modal>
    </NotificationContext.Provider>
  );
};
