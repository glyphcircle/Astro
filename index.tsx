import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './App.css';
import { PaymentProvider } from './context/PaymentContext';
import { LanguageProvider } from './context/LanguageContext';
import { DbProvider } from './context/DbContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);

// ✅ REMOVED React.StrictMode to prevent duplicate API calls in development
root.render(
  <HashRouter>
    <LanguageProvider>
      <AuthProvider>
        <DbProvider>
          <ThemeProvider>
            <PaymentProvider>
              <App />
            </PaymentProvider>
          </ThemeProvider>
        </DbProvider>
      </AuthProvider>
    </LanguageProvider>
  </HashRouter>
);
