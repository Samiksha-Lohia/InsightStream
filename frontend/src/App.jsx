import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from './config';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Workspace from './components/Workspace';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { SocketProvider, useSocket } from './context/SocketProvider';
import { ToastProvider, useToast } from './context/ToastProvider';
import { AuthProvider, useAuth } from './context/AuthProvider';

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

  // Sync visual theme with root document body and html elements
  useEffect(() => {
    const activeTheme = theme === 'cyberpunk' ? 'dark' : theme;

    const body = document.body;
    body.className = `theme-${theme}`;
    
    const html = document.documentElement;
    html.className = `theme-${theme}`;
    html.setAttribute('data-theme', activeTheme);

    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg)]">
        <div className="relative font-mono">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--accent)]">IS</div>
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


  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login theme={theme} onThemeChange={setTheme} />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register theme={theme} onThemeChange={setTheme} />
            </PublicRoute>
          }
        />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden text-txt-primary">
      {/* Sticky navigation header */}
      <Header theme={theme} onThemeChange={setTheme} />

      {/* Primary Workspace View Area */}
      <main className="flex-grow flex items-stretch p-6 max-w-7xl w-full mx-auto overflow-hidden">
        <Routes location={location} key={location.pathname}>
            
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <PageWrapper>
                    <Login theme={theme} onThemeChange={setTheme} />
                  </PageWrapper>
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <PageWrapper>
                    <Register theme={theme} onThemeChange={setTheme} />
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
                    <Workspace activeDocId={activeDocId} setActiveDocId={setActiveDocId} theme={theme} onThemeChange={setTheme} />
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
      </main>
    </div>
  );
}

// Light page transition wrapper using standard CSS classes
function PageWrapper({ children }) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
      {children}
    </div>
  );
}

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