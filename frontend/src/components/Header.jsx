import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastProvider';
import ProfileDropdown from './ProfileDropdown';

export default function Header({ theme, onThemeChange }) {
  const { user, updatePassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Change password states
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [currentInvalid, setCurrentInvalid] = useState(false);
  const [newInvalid, setNewInvalid] = useState(false);
  const [confirmInvalid, setConfirmInvalid] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setCurrentInvalid(currentPass.length === 0);
    setNewInvalid(newPass.length < 6);
    setConfirmInvalid(confirmPass !== newPass || confirmPass.length === 0);

    if (currentPass.length === 0 || newPass.length < 6 || confirmPass !== newPass) {
      addToast('Please satisfy all password update requirements', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(currentPass, newPass);
      addToast('Password updated successfully!', 'success');
      setPasswordModalOpen(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      addToast(err.message || 'Incorrect current password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (!user && currentPath !== '/login' && currentPath !== '/register') {
      navigate('/login');
    }
  }, [user, currentPath, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = () => {
    if (!user || !user.username) return 'JS';
    return user.username.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  };

  const isAuthPage = currentPath === '/login' || currentPath === '/register';

  if (isAuthPage || !user) return null;

  return (
    <>
      <header className="nav">
        <div className="wrap nav-row">
        {/* Brand */}
        <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 'bold' }}>
          <span className="brand-mark" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '20px', height: '20px' }}>
              <circle cx="9" cy="12" r="5" />
              <circle cx="15" cy="12" r="5" />
            </svg>
          </span>
          Insight Stream
        </Link>

        {/* Profile Menu actions */}
        <div className="nav-actions">
          <div className="profile" ref={dropdownRef}>
            <button 
              type="button" 
              className="avatar" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--bg-alt)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {getInitials()}
            </button>
            
            {dropdownOpen && (
              <ProfileDropdown
                theme={theme}
                onThemeChange={onThemeChange}
                onChangePasswordClick={() => {
                  setPasswordModalOpen(true);
                  setDropdownOpen(false);
                }}
                onClose={() => setDropdownOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Change Password Modal */}
    {passwordModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 1000,
          padding: '40px 20px',
          overflowY: 'auto'
        }}>
          <div className="auth-card" style={{ position: 'relative', width: '100%', maxWidth: '420px', zIndex: 1010, margin: 'auto' }}>
            <button
              type="button"
              onClick={() => {
                setPasswordModalOpen(false);
                setCurrentPass('');
                setNewPass('');
                setConfirmPass('');
                setCurrentInvalid(false);
                setNewInvalid(false);
                setConfirmInvalid(false);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-soft)',
                cursor: 'pointer'
              }}
            >
              <svg className="icon" style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            
            <h2>Change password</h2>
            <p className="sub">Enter your details to change your account password.</p>
            
            <form onSubmit={handlePasswordSubmit} id="passwordForm">
              <div className={`field ${currentInvalid ? 'invalid' : ''}`}>
                <label htmlFor="modalCurrentPass">Current password</label>
                <input
                  type="password"
                  id="modalCurrentPass"
                  placeholder="••••••••"
                  value={currentPass}
                  onChange={(e) => {
                    setCurrentPass(e.target.value);
                    setCurrentInvalid(false);
                  }}
                />
                <div className="err">Enter your current password.</div>
              </div>

              <div className={`field ${newInvalid ? 'invalid' : ''}`}>
                <label htmlFor="modalNewPass">New password</label>
                <input
                  type="password"
                  id="modalNewPass"
                  placeholder="At least 6 characters"
                  value={newPass}
                  onChange={(e) => {
                    setNewPass(e.target.value);
                    setNewInvalid(false);
                  }}
                />
                <div className="err">New password must be at least 6 characters.</div>
              </div>

              <div className={`field ${confirmInvalid ? 'invalid' : ''}`}>
                <label htmlFor="modalConfirmPass">Confirm new password</label>
                <input
                  type="password"
                  id="modalConfirmPass"
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={(e) => {
                    setConfirmPass(e.target.value);
                    setConfirmInvalid(false);
                  }}
                />
                <div className="err">Passwords don't match.</div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '16px' }} disabled={passwordLoading}>
                {passwordLoading ? 'Saving...' : 'Save password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
