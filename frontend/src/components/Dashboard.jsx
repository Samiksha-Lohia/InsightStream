import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import { useToast } from '../context/ToastProvider';
import { API_URL } from '../config';
import { generateTitle } from '../utils/titleGenerator';

export default function Dashboard({ onSelectItem }) {
  const { activeJobs } = useSocket();
  const { addToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Delete tracking states
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDocuments = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('insightstream_token');
      const response = await fetch(`${API_URL}/api/documents?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalItems);
      } else {
        throw new Error(data.message || 'Failed to retrieve history');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(currentPage);
  }, [currentPage]);

  const handleDelete = async (docId) => {
    setDeletingId(docId);
    try {
      const token = localStorage.getItem('insightstream_token');
      const response = await fetch(`${API_URL}/api/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        addToast('Analysis deleted successfully', 'success');
        
        // Evict from local chips if exists
        try {
          const stored = localStorage.getItem('insightstream-session-chips');
          if (stored) {
            const chips = JSON.parse(stored);
            const filtered = chips.filter(id => id !== docId);
            localStorage.setItem('insightstream-session-chips', JSON.stringify(filtered));
          }
        } catch (e) {
          console.warn(e);
        }

        // Reload
        setDeleteConfirmId(null);
        fetchDocuments(currentPage);
      } else {
        throw new Error(data.message || 'Failed to delete');
      }
    } catch (err) {
      addToast(err.message || 'Delete operation failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const getFilteredDocs = () => {
    return documents.filter((doc) => {
      // 1. Status Filter
      const wsJob = activeJobs[doc._id];
      const status = wsJob ? wsJob.status : doc.status;
      const isCompleted = status === 'Completed';
      
      if (activeFilter === 'done' && !isCompleted) return false;
      if (activeFilter === 'proc' && isCompleted) return false;

      // 2. Search Text Match
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const matchContent = doc.content?.toLowerCase().includes(term);
      const matchInsights = doc.insights?.toLowerCase().includes(term);
      const matchId = doc._id.toLowerCase().includes(term);
      return matchContent || matchInsights || matchId;
    });
  };

  const getDocType = (doc) => {
    // Attempt parsing type from filename
    const mockTitles = ['report', 'contract', 'feedback', 'notes'];
    const text = (doc.content || '').toLowerCase();
    if (text.includes('feedback') || text.includes('survey')) return 'CSV';
    if (text.includes('contract') || text.includes('agreement')) return 'DOCX';
    if (text.includes('report') || text.includes('audit')) return 'PDF';
    return 'TXT';
  };

  const generateSimpleSummary = (doc) => {
    if (doc.status !== 'Completed') {
      return 'Extracting themes and summarizing document layout...';
    }
    const cleanInsights = (doc.insights || '').replace(/[#*`\-•]/g, '').trim();
    if (cleanInsights.length > 120) {
      return cleanInsights.substring(0, 117) + '...';
    }
    return cleanInsights || 'Analysis completed. Open full report to inspect findings.';
  };

  const typeIcons = {
    PDF: <svg className="icon" viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>,
    CSV: <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg>,
    DOCX: <svg className="icon" viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M9 13h6M9 17h6"/></svg>,
    TXT: <svg className="icon" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h16"/></svg>
  };

  const filtered = getFilteredDocs();

  return (
    <section className="view wrap" id="view-dashboard" style={{ position: 'relative' }}>
      <div className="view-head">
        <div>
          <span className="eyebrow">Your workspace</span>
          <h2>Analysis history</h2>
        </div>
        
        {/* Filters */}
        <div className="filters">
          <button
            type="button"
            className={`chip ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`chip ${activeFilter === 'done' ? 'active' : ''}`}
            onClick={() => setActiveFilter('done')}
          >
            Completed
          </button>
          <button
            type="button"
            className={`chip ${activeFilter === 'proc' ? 'active' : ''}`}
            onClick={() => setActiveFilter('proc')}
          >
            Processing
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="field" style={{ width: '100%', marginBottom: '28px', position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', paddingLeft: '36px' }}
        />
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          <svg style={{ width: '14px', height: '14px', color: 'var(--text-soft)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--danger)', marginBottom: '20px' }}>
          Failed to load registry: {error}
        </div>
      )}

      {/* Grid of Cards */}
      <div className="grid-cards">
        {loading ? (
          <div className="empty-state">
            <div className="dicon" style={{ animation: 'spin 2s linear infinite' }}>
              <svg className="icon" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
            </div>
            <h3>Loading history logs...</h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="dicon">
              <svg className="icon" viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
            </div>
            <h3>Nothing here yet</h3>
            <p>Analyses you run will show up in this view.</p>
          </div>
        ) : (
          filtered.map((doc) => {
            const wsJob = activeJobs[doc._id];
            const status = wsJob ? wsJob.status : doc.status;
            const progress = wsJob ? wsJob.progress : 100;
            const isCompleted = status === 'Completed';

            const docType = getDocType(doc);
            const simpleSummary = generateSimpleSummary(doc);
            const dateStr = new Date(doc.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div key={doc._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '22px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <h3 style={{ textTransform: 'capitalize', fontSize: '16.5px', fontWeight: 'bold', margin: 0, color: 'var(--text)' }}>
                    {isCompleted ? generateTitle(doc.insights, doc.content) : 'Processing payload...'}
                  </h3>
                  <span className="card-type" style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-alt)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {typeIcons[docType] || typeIcons.TXT}
                  </span>
                </div>
                
                <div style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '-4px' }}>
                  Analysis: {dateStr}
                </div>
                
                <p 
                  className="summary" 
                  style={{ 
                    fontSize: '13.5px', 
                    color: 'var(--text-soft)', 
                    lineHeight: '1.5', 
                    margin: '8px 0', 
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {simpleSummary}
                </p>
                             <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: 'auto' }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      padding: 0
                    }}
                    onClick={() => onSelectItem(doc._id)}
                  >
                    <svg className="icon" style={{ width: '15px', height: '15px', stroke: 'var(--accent)' }} viewBox="0 0 24 24" fill="none" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Preview
                  </button>
                  
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    onClick={() => setDeleteConfirmId(doc._id)}
                    title="Delete"
                  >
                    <svg className="icon" style={{ width: '15px', height: '15px', stroke: 'var(--accent)' }} viewBox="0 0 24 24" fill="none" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6h12z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* Delete Confirm Overlay */}
                <div className={`confirm-bar ${deleteConfirmId === doc._id ? 'show' : ''}`}>
                  <p>Delete this analysis?</p>
                  <div className="confirm-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm cancel-del"
                      onClick={() => setDeleteConfirmId(null)}
                      disabled={deletingId !== null}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm confirm-del"
                      style={{ background: 'var(--danger)', color: '#fff' }}
                      onClick={() => handleDelete(doc._id)}
                      disabled={deletingId !== null}
                    >
                      {deletingId === doc._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination (Only show if totalPages > 1) */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '34px', borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>Page {currentPage} of {totalPages}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
