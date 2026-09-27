import React, { useState } from 'react';
import { I18nProvider, useTranslation } from './i18n/index.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LandingPage } from './pages/LandingPage.jsx';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { Dashboard } from './pages/Dashboard.js';
import { AnalysisResultPage } from './pages/AnalysisResult.js';
import { ChatbotFloatingButton } from './components/ChatbotFloatingButton.js';
import { FullProductAnalysisReport } from './types/analysis';
import { RefreshCw } from 'lucide-react';

function MainRouter() {
  const { user, isLoading } = useAuth();
  const { lang, setLang } = useTranslation();

  const [activeView, setActiveView] = useState<
    'landing' | 'dashboard' | 'result' | 'login' | 'register'
  >('landing');

  const [currentReport, setCurrentReport] = useState<FullProductAnalysisReport | null>(null);
  const [jurisdiction, setJurisdiction] = useState<'India' | 'International'>(
    () => ((typeof window !== 'undefined' && localStorage.getItem('ip_sakti_jurisdiction')) as 'India' | 'International') || 'India'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            Initializing IP-SAKTI Sahayak...
          </p>
        </div>
      </div>
    );
  }

  // SCREEN: Authentication (Login / Register) if user requested
  if (activeView === 'login') {
    return (
      <Login
        onNavigateRegister={() => setActiveView('register')}
        onLoginSuccess={() => setActiveView('dashboard')}
        onCancel={() => setActiveView(user ? 'dashboard' : 'landing')}
      />
    );
  }

  if (activeView === 'register') {
    return (
      <Register
        onNavigateLogin={() => setActiveView('login')}
        onRegisterSuccess={() => setActiveView('dashboard')}
        onCancel={() => setActiveView(user ? 'dashboard' : 'landing')}
      />
    );
  }

  // If user is not authenticated, show the public Landing Page (where analysis requires login)
  if (!user && (activeView === 'landing' || activeView === 'dashboard')) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-between">
        <LandingPage
          onNavigateLogin={() => setActiveView('login')}
          onNavigateRegister={() => setActiveView('register')}
          onStartAnalysis={() => {
            if (user) {
              setActiveView('dashboard');
            } else {
              setActiveView('login');
            }
          }}
        />

        {/* Floating Real-RAG Chatbot Assistant */}
        <ChatbotFloatingButton
          currentJurisdiction={jurisdiction}
          productContext={currentReport?.productSummary}
          onNavigateLogin={() => setActiveView('login')}
          onNavigateRegister={() => setActiveView('register')}
        />
      </div>
    );
  }

  // Authenticated User Journey: Dashboard & Analysis
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <main className="flex-1">
        {/* View 1: Primary Simplified Dashboard & Formulation Analysis */}
        {(activeView === 'dashboard' || activeView === 'landing') && (
          <Dashboard
            onOpenAuth={(mode) => setActiveView(mode)}
            onViewFullReport={(report) => {
              setCurrentReport(report);
              setActiveView('result');
            }}
            currentJurisdiction={jurisdiction}
            onJurisdictionChange={(newJur) => {
              setJurisdiction(newJur);
              setCurrentReport((prev) => prev ? { ...prev, jurisdiction: newJur } : null);
            }}
            onProductAnalyzed={(productSummary) => {
              setCurrentReport((prev) => ({
                ...(prev || ({} as any)),
                jurisdiction: jurisdiction,
                productSummary: productSummary
              }));
            }}
          />
        )}

        {/* View 2: Full Grounded Statutory Report */}
        {activeView === 'result' && currentReport && (
          <AnalysisResultPage
            report={currentReport}
            onNewAnalysis={() => setActiveView('dashboard')}
          />
        )}
      </main>

      {/* Floating Real-RAG Chatbot Assistant */}
      <ChatbotFloatingButton
        currentJurisdiction={jurisdiction}
        productContext={currentReport?.productSummary}
        onNavigateLogin={() => setActiveView('login')}
        onNavigateRegister={() => setActiveView('register')}
      />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </I18nProvider>
  );
}
