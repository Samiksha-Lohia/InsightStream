import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketProvider';
import { Search, Calendar, FileText, ArrowRight, RefreshCw, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { generateTitle } from '../utils/titleGenerator';
import ResultCard from './ResultCard';
import { API_URL } from '../config';

export default function Dashboard({ onSelectItem }) {
  const { activeJobs } = useSocket();
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20; // Limit items per page for clean dashboard design

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

  // Poll database history periodically (e.g. every 10 seconds) if there are active background jobs
  useEffect(() => {
    const hasActiveJobs = Object.values(activeJobs).some(job => job.status === 'Processing' || job.status === 'Pending');
    if (!hasActiveJobs) return;

    const interval = setInterval(() => {
      fetchDocuments(currentPage);
    }, 8000);

    return () => clearInterval(interval);
  }, [activeJobs, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Filter local document array based on search input (checks content & ID)
  const filteredDocuments = documents.filter((doc) => {
    const term = search.toLowerCase();
    return (
      doc._id.toLowerCase().includes(term) ||
      doc.content.toLowerCase().includes(term) ||
      (doc.insights && doc.insights.toLowerCase().includes(term))
    );
  });

  if (selectedDocId) {
    const selectedDoc = documents.find(d => d._id === selectedDocId);
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="max-w-5xl w-full mx-auto space-y-6 py-2"
      >
        <button
          onClick={() => setSelectedDocId(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-border-main text-xs font-semibold hover:bg-white/10 transition-all text-txt-primary cursor-pointer group w-fit"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>
        {selectedDoc && <ResultCard document={selectedDoc} />}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-5xl w-full mx-auto space-y-6"
    >
      {/* Dashboard Summary Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-txt-primary tracking-tight">
            Pipeline History Dashboard
          </h1>
          <p className="text-sm text-txt-secondary mt-1">
            Access, inspect, and trace all documents pushed to the AI queue. Total: <span className="text-brand-primary font-bold">{totalCount}</span> documents.
          </p>
        </div>

        <button
          onClick={() => fetchDocuments(currentPage)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-border-main text-sm font-semibold hover:bg-white/10 hover:border-brand-primary/30 transition-all text-txt-primary cursor-pointer active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-primary' : ''}`} />
          Refresh Registry
        </button>
      </div>

      {/* Search Filter input */}
      <div className="glass-panel p-4 rounded-2xl border border-border-main flex items-center gap-3">
        <Search className="w-5 h-5 text-txt-secondary" />
        <input
          type="text"
          placeholder="Search by Document Content, ID, or Analysis Results..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none border-none text-txt-primary placeholder:text-txt-secondary"
        />
      </div>

      {/* Database Error Alert */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-300 text-sm">
          Failed to load database history: {error}
        </div>
      )}

      {/* Grid List View */}
      <div className="relative min-h-[350px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-txt-secondary font-mono">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-primary" />
            <span>Querying ledger database...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-border-main space-y-4">
            <div className="inline-flex p-4 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-txt-primary">No Documents Found</h3>
            <p className="text-sm text-txt-secondary max-w-sm mx-auto">
              We couldn't locate any records matching your description. Submit a document to start processing.
            </p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredDocuments.map((doc, idx) => {
                // Determine active status: check if the job is active in WebSocket tracking
                const wsJob = activeJobs[doc._id];
                const status = wsJob ? wsJob.status : doc.status;
                const progress = wsJob ? wsJob.progress : 100;

                const isProcessing = status === 'Processing' || status === 'Pending' || status === 'Queued' || status === 'Saving';
                const isFailed = status === 'Failed';
                
                const createdDate = new Date(doc.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <motion.div
                    key={doc._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    onClick={() => !isProcessing && setSelectedDocId(doc._id)}
                    className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between gap-4 group cursor-pointer transition-all duration-300 hover:border-brand-primary/40 hover:-translate-y-0.5 hover:shadow-lg ${
                      isProcessing ? 'border-amber-500/20 bg-amber-500/5 cursor-not-allowed pointer-events-none' : ''
                    } ${isFailed ? 'border-rose-500/20 bg-rose-500/5' : 'border-border-main'}`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-center pb-3 border-b border-border-main/50">
                        <div className="flex items-center gap-1.5 text-xs text-txt-secondary font-mono">
                          <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                          {createdDate}
                        </div>

                        {/* Dynamic Status Badge */}
                        <div className="flex items-center gap-2">
                          {isProcessing ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-500/35 text-amber-600 dark:text-amber-400 flex items-center gap-1.5 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                              {status} ({progress}%)
                            </span>
                          ) : isFailed ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                              Failed
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Snippet */}
                      <div className="mt-3 space-y-1.5">
                        <h4 className="text-sm font-bold text-txt-primary truncate group-hover:text-brand-primary transition-colors">
                          {status === 'Completed' ? generateTitle(doc.insights, doc.content) : 'Processing Analysis...'}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-txt-secondary">
                          <FileText className="w-3.5 h-3.5" />
                          ID: {doc._id.substring(0, 16)}...
                        </div>
                        <p className="text-xs text-txt-secondary line-clamp-2 leading-relaxed mt-1 font-mono">
                          {doc.content}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Trigger Action */}
                    {!isProcessing && (
                      <div className="flex justify-end pt-3 border-t border-border-main/50 text-xs font-bold text-brand-primary group-hover:text-brand-secondary flex items-center gap-1 transition-colors">
                        View Full Report
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-6 border-t border-border-main/50 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-border-main text-xs font-semibold hover:bg-white/10 transition-all text-txt-primary disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Page
          </button>

          <span className="text-xs font-mono text-txt-secondary">
            Page <span className="text-txt-primary font-bold">{currentPage}</span> of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-border-main text-xs font-semibold hover:bg-white/10 transition-all text-txt-primary disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            Next Page
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
