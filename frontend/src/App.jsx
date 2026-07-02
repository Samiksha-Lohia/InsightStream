import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { API_URL } from './config';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import UploadZone from './components/UploadZone';
import ProgressSection from './components/ProgressSection';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { SocketProvider, useSocket } from './context/SocketProvider';
import { ToastProvider, useToast } from './context/ToastProvider';
import { AuthProvider, useAuth } from './context/AuthProvider';
import LandingPage from './components/landing/LandingPage';

// Route guard for authenticated users
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-brand-primary">IS</div>
        </div>
      </div>
    );
  }

  return user ? children : null;
}

// Route guard for unauthenticated users (login, register)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
      </div>
    );
  }

  return !user ? children : null;
}

// Main routes container to handle AnimatePresence location hooks
function AnimatedApp({ theme, setTheme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackJob } = useSocket();
  const { addToast } = useToast();
  const { token, user, loading } = useAuth();

  const [activeDocId, setActiveDocId] = useState(null);

  const isLandingPage = !loading && !user && location.pathname === '/';
  // Sync visual theme with root document body and html elements
  useEffect(() => {
    if (isLandingPage) return;

    // Force "dark" purple brand theme if user is not authenticated (login/register)
    const activeTheme = user ? theme : 'dark';

    const body = document.body;
    body.className = 'tech-grid min-h-screen relative';
    body.classList.add(`theme-${activeTheme}`);
    
    const html = document.documentElement;
    html.className = `theme-${activeTheme}`;

    if (user) {
      localStorage.setItem('theme-preference', theme);
    }
  }, [theme, isLandingPage, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0b10]">
        <div className="relative font-mono">
          <div className="w-12 h-12 rounded-full border-2 border-[#a855f7]/20 border-t-[#a855f7] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#a855f7]">IS</div>
        </div>
      </div>
    );
  }

  // Handle uploading document text content
  const handleUploadSubmit = async (content) => {
    const showToasts = localStorage.getItem('setting-browser-alerts') !== 'false';
    try {
      if (showToasts) addToast('Uploading document to analysis queue...', 'info');
      
      const retentionSetting = localStorage.getItem('setting-retention') || 'Indefinite';
      const currentToken = token || localStorage.getItem('insightstream_token');
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ 
          content,
          retention: retentionSetting
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to trigger queue');
      }

      // Track active document inside socket connection and view processing
      trackJob(data.documentId);
      setActiveDocId(data.documentId);
      if (showToasts) addToast('Job successfully registered in Redis queue', 'success');
    } catch (err) {
      if (showToasts) addToast(`Upload failed: ${err.message}`, 'error');
    }
  };

  // Navigates from History list selection straight into the result morph
  const handleSelectHistoryItem = (docId) => {
    setActiveDocId(docId);
    navigate('/');
  };

  if (isLandingPage) {
    return <LandingPage theme={theme} setTheme={setTheme} />;
  }

  return (
    <div className="flex flex-col min-h-screen text-txt-primary">
      {/* Sticky navigation header */}
      <Header theme={theme} onThemeChange={setTheme} />

      {/* Primary Workspace View Area */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12 max-w-7xl w-full mx-auto">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <PageWrapper>
                    <Login />
                  </PageWrapper>
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <PageWrapper>
                    <Register />
                  </PageWrapper>
                </PublicRoute>
              }
            />

            {/* Protected Core Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
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
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <Dashboard onSelectItem={handleSelectHistoryItem} />
                  </PageWrapper>
                </ProtectedRoute>
              }
            />

            <Route
              path="/preferences"
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <Settings theme={theme} onThemeChange={setTheme} />
                  </PageWrapper>
                </ProtectedRoute>
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
  const [theme, setTheme] = useState(() => localStorage.getItem('theme-preference') || 'dark');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <Router>
              <AnimatedApp theme={theme} setTheme={setTheme} />
            </Router>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}