import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastProvider';

export default function Settings({ theme, onThemeChange }) {
  const { user, updatePassword } = useAuth();
  const { addToast } = useToast();

  // Settings states loaded from localStorage
  const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem('setting-email-alerts') === 'true');
  const [browserAlerts, setBrowserAlerts] = useState(() => localStorage.getItem('setting-browser-alerts') !== 'false');
  const [audioAlerts, setAudioAlerts] = useState(() => localStorage.getItem('setting-audio-alerts') === 'true');

  // Change password states
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [currentInvalid, setCurrentInvalid] = useState(false);
  const [newInvalid, setNewInvalid] = useState(false);
  const [confirmInvalid, setConfirmInvalid] = useState(false);

  const handleToggle = (setting, stateSetter, stateVal) => {
    const newVal = !stateVal;
    stateSetter(newVal);
    localStorage.setItem(`setting-${setting}`, newVal.toString());
    addToast(`Preferences updated: ${setting.replace('-', ' ')} is now ${newVal ? 'ENABLED' : 'DISABLED'}`, 'success');
  };

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
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      addToast(err.message || 'Incorrect current password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = () => {
    if (!user || !user.username) return 'JS';
    return user.username.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  };

  return (
    <section className="view wrap" id="view-settings">
      <div className="view-head">
        <div>
          <span className="eyebrow">Account</span>
          <h2>Settings</h2>
        </div>
        <p>Manage how InsightStream looks and how you sign in.</p>
      </div>

      <div className="settings-grid">
        {/* Left Column: Appearance and Account Info */}
        <div className="settings-card">
          <h3>Appearance</h3>
          <p className="sub">Switch between light and dark at any time.</p>
          
          <div className="segmented" id="settingsThemeSwitch" style={{ maxWidth: '280px' }}>
            <button
              type="button"
              className={theme === 'light' ? 'active' : ''}
              onClick={() => onThemeChange('light')}
            >
              <svg className="icon" style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
              </svg>
              Light
            </button>
            <button
              type="button"
              className={theme === 'dark' || theme === 'cyberpunk' ? 'active' : ''}
              onClick={() => onThemeChange('dark')}
            >
              <svg className="icon" style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24">
                <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>
              </svg>
              Dark
            </button>
          </div>

          <div style={{ marginTop: '26px' }}>
            <h3>Account</h3>
            <p className="sub">Signed in as</p>
            <div className="account-row">
              <span className="avatar">{getInitials()}</span>
              <div>
                <div className="name">{user?.username}</div>
                <div className="mail">{user?.email}</div>
              </div>
            </div>
          </div>


        </div>

        {/* Right Column: Password Form */}
        <div className="settings-card">
          <h3>Change password</h3>
          <p className="sub">Choose a new password for your account.</p>
          
          <form onSubmit={handlePasswordSubmit} id="passwordForm">
            <div className={`field ${currentInvalid ? 'invalid' : ''}`}>
              <label htmlFor="currentPass">Current password</label>
              <input
                type="password"
                id="currentPass"
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
              <label htmlFor="newPass">New password</label>
              <input
                type="password"
                id="newPass"
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
              <label htmlFor="confirmPass">Confirm new password</label>
              <input
                type="password"
                id="confirmPass"
                placeholder="••••••••"
                value={confirmPass}
                onChange={(e) => {
                  setConfirmPass(e.target.value);
                  setConfirmInvalid(false);
                }}
              />
              <div className="err">Passwords don't match.</div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
              {passwordLoading ? 'Saving...' : 'Save password'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
