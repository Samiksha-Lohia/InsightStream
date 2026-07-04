import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastProvider';

export default function Register({ theme, onThemeChange }) {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [nameInvalid, setNameInvalid] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [confirmInvalid, setConfirmInvalid] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    
    setNameInvalid(username.length === 0);
    setEmailInvalid(!emailOk);
    setPasswordInvalid(password.length < 6);
    setConfirmInvalid(confirmPassword !== password || confirmPassword.length === 0);

    if (username.length === 0 || !emailOk || password.length < 6 || confirmPassword !== password) {
      addToast('Please satisfy all registration constraints', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      addToast('Registration successful! Welcome to InsightStream.', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Registration failed. Try a different username/email.', 'error');
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
            <button type="button" onClick={() => navigate('/login')}>Log in</button>
            <button type="button" className="active">Create account</button>
          </div>

          <form onSubmit={handleSubmit} id="registerForm">
            <h2>Create your account</h2>
            <p className="sub">Start reading your documents differently.</p>
            
            <div className={`field ${nameInvalid ? 'invalid' : ''}`}>
              <label htmlFor="regName">Full name</label>
              <input
                type="text"
                id="regName"
                placeholder="Jordan Shah"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setNameInvalid(false);
                }}
              />
              <div className="err">Enter your name.</div>
            </div>

            <div className={`field ${emailInvalid ? 'invalid' : ''}`}>
              <label htmlFor="regEmail">Email</label>
              <input
                type="email"
                id="regEmail"
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
              <label htmlFor="regPass">Password</label>
              <input
                type="password"
                id="regPass"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordInvalid(false);
                }}
              />
              <div className="err">Password must be at least 6 characters.</div>
            </div>

            <div className={`field ${confirmInvalid ? 'invalid' : ''}`}>
              <label htmlFor="regConfirm">Confirm password</label>
              <input
                type="password"
                id="regConfirm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmInvalid(false);
                }}
              />
              <div className="err">Passwords don't match.</div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            <div className="auth-foot">
              Already have an account? <button type="button" onClick={() => navigate('/login')}>Log in</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
