import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastProvider';

export default function ProfileDropdown({ theme, onThemeChange, onChangePasswordClick, onClose }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const getInitials = () => {
    if (!user || !user.username) return 'US';
    return user.username.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  };

  const handleLogout = () => {
    logout();
    onClose();
    // Toast alerts are silenced globally, so this is just for internal state consistency
    addToast('Goodbye! Session ended.', 'info');
    navigate('/login');
  };

  const navigateTo = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div 
      className="profile-menu-custom open" 
      style={{ 
        width: '260px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lift)',
        padding: '12px',
        position: 'absolute',
        right: 0,
        top: 'calc(100% + 12px)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      {/* Top Section: User identity */}
      <div className="profile-head" style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
        <span 
          style={{ 
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--accent-tint)',
            color: 'var(--accent-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {getInitials()}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="name" style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--text)' }}>{user?.username}</div>
          <div className="mail" style={{ fontSize: '12px', color: 'var(--text-soft)' }}>{user?.email}</div>
        </div>
      </div>

      {/* Navigation List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 0' }}>
        <button
          type="button"
          onClick={() => navigateTo('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '8px 12px',
            background: 'none',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'left',
            cursor: 'pointer',
            color: 'var(--text)',
            fontSize: '13.5px',
            transition: 'background 0.2s'
          }}
          className="menu-item-custom"
        >
          <svg className="icon" style={{ width: '16px', height: '16px', stroke: 'var(--text-soft)' }} viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <path d="M12 19V6M6 12l6-6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Workspace
        </button>

        <button
          type="button"
          onClick={() => navigateTo('/history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '8px 12px',
            background: 'none',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'left',
            cursor: 'pointer',
            color: 'var(--text)',
            fontSize: '13.5px',
            transition: 'background 0.2s'
          }}
          className="menu-item-custom"
        >
          <svg className="icon" style={{ width: '16px', height: '16px', stroke: 'var(--text-soft)' }} viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 9h18M8 3v3M16 3v3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          History
        </button>


      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

      {/* Security Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button
          type="button"
          className="menu-item-custom"
          onClick={() => {
            onChangePasswordClick();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '8px 12px',
            background: 'none',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'left',
            cursor: 'pointer',
            color: 'var(--text)',
            fontSize: '13.5px',
            transition: 'background 0.2s'
          }}
        >
          <svg className="icon" style={{ width: '16px', height: '16px', stroke: 'var(--text-soft)' }} viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Change Password
        </button>

        <button
          type="button"
          className="menu-item-custom"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '8px 12px',
            background: 'none',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'left',
            cursor: 'pointer',
            color: 'var(--text)',
            fontSize: '13.5px',
            transition: 'background 0.2s'
          }}
        >
          <svg className="icon" style={{ width: '16px', height: '16px', stroke: 'var(--text-soft)' }} viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

      {/* Bottom Section: Theme pill toggle switch */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px 4px' }}>
        <span style={{ fontSize: '13.5px', color: 'var(--text-soft)', fontWeight: '500' }}>Theme</span>
        
        {/* Toggle container */}
        <div 
          onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-alt)',
            borderRadius: '999px',
            padding: '3px',
            width: '110px',
            height: '32px',
            cursor: 'pointer',
            border: '1px solid var(--border)',
            position: 'relative',
            userSelect: 'none'
          }}
        >
          {/* Active selection capsule background sliding */}
          <div 
            style={{
              position: 'absolute',
              top: '2px',
              left: theme === 'light' ? '2px' : 'calc(50% + 1px)',
              width: 'calc(50% - 3px)',
              height: 'calc(100% - 4px)',
              background: 'var(--accent)',
              borderRadius: '999px',
              transition: 'left 0.2s ease-in-out',
              zIndex: 1
            }}
          />

          {/* Light toggle label */}
          <div 
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              zIndex: 2,
              color: theme === 'light' ? '#fff' : 'var(--text-soft)',
              fontSize: '11px',
              fontWeight: 'bold',
              transition: 'color 0.2s'
            }}
          >
            <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
            </svg>
            {theme === 'light' && <span>Light</span>}
          </div>

          {/* Dark toggle label */}
          <div 
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              zIndex: 2,
              color: theme === 'dark' ? '#fff' : 'var(--text-soft)',
              fontSize: '11px',
              fontWeight: 'bold',
              transition: 'color 0.2s'
            }}
          >
            <svg style={{ width: '11px', height: '11px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
            {theme === 'dark' && <span>Dark</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
