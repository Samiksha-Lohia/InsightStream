import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function ProgressTracker({ documentId, onBack }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Pending');
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [originalContent, setOriginalContent] = useState('');

  useEffect(() => {
    // 1. Establish connection to Socket.io server
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('[🔌 WebSocket] Connected to server');
    });

    // 2. Listen for 'progress' events
    socket.on('progress', (data) => {
      // Check if this progress event is for our current document
      if (data.documentId === documentId) {
        setProgress(data.progress);
        
        if (data.status) {
          setStatus(data.status);
        } else if (data.progress >= 70) {
          setStatus('Saving');
        } else if (data.progress >= 20) {
          setStatus('Processing');
        } else if (data.progress >= 10) {
          setStatus('Queued');
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('[🔌 WebSocket] Disconnected from server');
    });

    // Cleanup socket on unmount
    return () => {
      socket.disconnect();
    };
  }, [documentId]);

  // Fetch final document when complete
  useEffect(() => {
    if (progress === 100 || status === 'Completed') {
      const fetchDocument = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/documents/${documentId}`);
          const data = await response.json();
          if (data.success && data.document) {
            setInsights(data.document.insights);
            setOriginalContent(data.document.content);
            setStatus('Completed');
          } else {
            throw new Error(data.message || 'Failed to retrieve insights.');
          }
        } catch (err) {
          setError(err.message);
        }
      };

      // Delay slightly for smooth transition
      const timer = setTimeout(fetchDocument, 800);
      return () => clearTimeout(timer);
    }
  }, [progress, status, documentId]);

  // Map progress to friendly text
  const getStatusMessage = () => {
    if (error) return 'Error encountered';
    switch (status) {
      case 'Pending':
        return 'Queueing document in database...';
      case 'Queued':
        return 'Job picked up by Redis worker...';
      case 'Processing':
        return 'Gemini AI is analyzing the document...';
      case 'Saving':
        return 'Synthesizing and storing insights...';
      case 'Completed':
        return 'Analysis complete!';
      case 'Failed':
        return 'Processing failed. Please check logs.';
      default:
        return 'Processing...';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      
      {/* CARD CONTAINER */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        transition: 'all 0.3s ease'
      }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#4f46e5',
              backgroundColor: '#e0e7ff',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px'
            }}>
              ID: {documentId.substring(0, 8)}...
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginTop: '0.5rem', marginBottom: 0 }}>
              Analysis Status
            </h2>
          </div>
          
          {/* STATUS DOT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              height: '10px',
              width: '10px',
              borderRadius: '50%',
              backgroundColor: status === 'Completed' ? '#10b981' : status === 'Failed' ? '#ef4444' : '#f59e0b',
              display: 'inline-block',
              animation: status !== 'Completed' && status !== 'Failed' ? 'pulse 1.5s infinite' : 'none'
            }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4b5563' }}>{status}</span>
          </div>
        </div>

        {/* PROGRESS METRICS & BAR */}
        {status !== 'Completed' && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.925rem', color: '#4b5563', fontWeight: 500 }}>
                {getStatusMessage()}
              </span>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>
                {progress}%
              </span>
            </div>
            
            {/* PROGRESS TRACK */}
            <div style={{
              height: '10px',
              width: '100%',
              backgroundColor: '#f3f4f6',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              {/* ANIMATED PROGRESS FILL */}
              <div style={{
                height: '100%',
                width: `${progress}%`,
                backgroundImage: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)',
                borderRadius: '9999px',
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* SHEEN EFFECT */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)',
                  animation: 'shimmer 1.5s infinite'
                }} />
              </div>
            </div>
          </div>
        )}

        {/* ERROR DISPLAY */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            padding: '1rem',
            borderRadius: '8px',
            color: '#991b1b',
            marginBottom: '1.5rem'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* RESULTS PANEL */}
        {status === 'Completed' && insights && (
          <div style={{
            marginTop: '1.5rem',
            animation: 'fadeIn 0.6s ease'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' }}>
              ✨ Generated Insights
            </h3>
            
            {/* INSIGHTS CONTENT CONTAINER */}
            <div style={{
              backgroundColor: '#fafafa',
              border: '1px solid #f3f4f6',
              padding: '1.5rem',
              borderRadius: '12px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#374151',
              whiteSpace: 'pre-wrap', // Keeps the formatting from Gemini API
              marginBottom: '2rem'
            }}>
              {insights}
            </div>

            {/* ORIGINAL CONTENT ACCORDION PREVIEW */}
            <details style={{ marginBottom: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <summary style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#4b5563',
                userSelect: 'none'
              }}>
                View Original Document Source
              </summary>
              <div style={{
                padding: '1rem',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e5e7eb',
                fontSize: '0.875rem',
                color: '#6b7280',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {originalContent}
              </div>
            </details>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={onBack}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            ← Back to Upload
          </button>
        </div>

      </div>

      {/* STYLES */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
