import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import ProgressSection from './components/ProgressSection';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { SocketProvider, useSocket } from './context/SocketProvider';
import { ToastProvider, useToast } from './context/ToastProvider';

// Main routes container to handle AnimatePresence location hooks
function AnimatedApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackJob } = useSocket();
  const { addToast } = useToast();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme-preference') || 'dark');
  const [activeDocId, setActiveDocId] = useState(null);

  // Sync visual theme with root document body and html elements
  useEffect(() => {
    const body = document.body;
    body.className = 'tech-grid min-h-screen relative';
    body.classList.add(`theme-${theme}`);
    
    const html = document.documentElement;
    html.className = `theme-${theme}`;

    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  // Handle uploading document text content
  const handleUploadSubmit = async (content) => {
    try {
      addToast('Uploading document to analysis queue...', 'info');
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to trigger queue');
      }

      // Track active document inside socket connection and view processing
      trackJob(data.documentId);
      setActiveDocId(data.documentId);
      addToast('Job successfully registered in Redis queue', 'success');
    } catch (err) {
      addToast(`Upload failed: ${err.message}`, 'error');
    }
  };

  // Navigates from History list selection straight into the result morph
  const handleSelectHistoryItem = (docId) => {
    setActiveDocId(docId);
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen text-txt-primary">
      {/* Sticky navigation header */}
      <Navbar />

      {/* Primary Workspace View Area */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12 max-w-7xl w-full mx-auto">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            {/* 1. Upload & Processing Engine (Home Route) */}
            <Route
              path="/"
              element={
                <PageWrapper>
                  {!activeDocId ? (
                    <div className="flex flex-col items-center justify-center space-y-6 w-full py-8">
                      <div className="text-center space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-txt-primary tracking-tight">
                          Immersive AI Document Insights
                        </h1>
                        <p className="text-sm md:text-base text-txt-secondary max-w-lg mx-auto">
                          Submit text payloads to run structural summaries, entity linkages, and keyword analysis in real-time.
                        </p>
                      </div>
                      <UploadZone onUpload={handleUploadSubmit} />
                    </div>
                  ) : (
                    <ProgressSection
                      documentId={activeDocId}
                      onBack={() => setActiveDocId(null)}
                    />
                  )}
                </PageWrapper>
              }
            />

            {/* 2. The Dashboard (History Route) */}
            <Route
              path="/history"
              element={
                <PageWrapper>
                  <Dashboard onSelectItem={handleSelectHistoryItem} />
                </PageWrapper>
              }
            />

            {/* 3. The Settings Panel (Preferences Route) */}
            <Route
              path="/preferences"
              element={
                <PageWrapper>
                  <Settings theme={theme} onThemeChange={setTheme} />
                </PageWrapper>
              }
            />

          </Routes>
        </AnimatePresence>
      </main>
      
      {/* Dynamic footer status */}
      <footer className="py-6 border-t border-border-main/55 text-center text-xs text-txt-secondary font-mono">
        InsightStream Pipeline &copy; {new Date().getFullYear()} // System operational.
      </footer>
    </div>
  );
}

// Framer Motion Page transition wrapper
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="w-full flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
}

// Global App wrapper injection
export default function App() {
  return (
    <ErrorBoundary>
      <SocketProvider>
        <ToastProvider>
          <Router>
            <AnimatedApp />
          </Router>
        </ToastProvider>
      </SocketProvider>
    </ErrorBoundary>
  );
}