import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastProvider';

export default function Login({ theme, onThemeChange }) {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    
    setEmailInvalid(!emailOk);
    setPasswordInvalid(password.length < 6);

    if (!emailOk || password.length < 6) {
      addToast('Please enter a valid email and a password of at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      addToast('Logged in successfully!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="screen-auth" className="w-full min-h-screen flex flex-col">
      {/* Auth Topbar */}
      <div className="auth-topbar">
        <span className="brand">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24">
              <path d="M3 15c3-6 6 6 9 0s6-6 9 0" stroke="#FFF4EC" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
          </span>
          InsightStream
        </span>
        <div className="segmented" style={{ width: '120px' }}>
          <button
            type="button"
            className={theme === 'light' ? 'active' : ''}
            onClick={() => onThemeChange('light')}
            title="Light Theme"
          >
            <svg className="icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
            </svg>
          </button>
          <button
            type="button"
            className={theme === 'dark' || theme === 'cyberpunk' ? 'active' : ''}
            onClick={() => onThemeChange('dark')}
            title="Dark Theme"
          >
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Auth Body */}
      <div className="auth-body">
        {/* Left Side: Pitch */}
        <div className="auth-pitch">
          <span className="eyebrow">Document intelligence</span>
          <h1>Every document has a story. <em>We read between the lines.</em></h1>
          <p>Upload reports, contracts or research data — InsightStream extracts structure, highlights what matters, and keeps every analysis in one place.</p>
          <div className="pitch-points">
            <div>
              <span className="dot">
                <svg className="icon" viewBox="0 0 24 24"><path d="M12 19V6M6 12l6-6 6 6"/></svg>
              </span>
              Drop in a file, get a structured read in seconds
            </div>
            <div>
              <span className="dot">
                <svg className="icon" viewBox="0 0 24 24"><path d="M4 6h12M4 12h8M4 18h5"/></svg>
              </span>
              Highlight key passages and leave notes as you read
            </div>
            <div>
              <span className="dot">
                <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>
              </span>
              Every analysis saved to your dashboard
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="auth-card">
          <div className="segmented" style={{ marginBottom: '22px' }}>
            <button type="button" className="active">Log in</button>
            <button type="button" onClick={() => navigate('/register')}>Create account</button>
          </div>

          <form onSubmit={handleSubmit} id="loginForm">
            <h2>Welcome back</h2>
            <p className="sub">Log in to see your recent analyses.</p>
            
            <div className={`field ${emailInvalid ? 'invalid' : ''}`}>
              <label htmlFor="loginEmail">Email</label>
              <input
                type="email"
                id="loginEmail"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailInvalid(false);
                }}
              />
              <div className="err">Enter a valid email address.</div>
            </div>

            <div className={`field ${passwordInvalid ? 'invalid' : ''}`}>
              <label htmlFor="loginPass">Password</label>
              <input
                type="password"
                id="loginPass"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordInvalid(false);
                }}
              />
              <div className="err">Password must be at least 6 characters.</div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
            
            <div className="demo-hint">Demo mode — any email + a password of 6+ characters will work.</div>
            <div className="auth-foot">
              New here? <button type="button" onClick={() => navigate('/register')}>Create an account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
