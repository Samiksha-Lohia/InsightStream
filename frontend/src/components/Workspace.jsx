import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketProvider';
import { useToast } from '../context/ToastProvider';
import { useAuth } from '../context/AuthProvider';
import { API_URL } from '../config';
import { generateTitle } from '../utils/titleGenerator';

const technicalVerbs = [
  "Scanning document metadata and structure...",
  "Hashing payload chunks and compiling bytecode...",
  "Synthesizing multi-dimensional semantic embeddings...",
  "Initializing isolated AI sandboxed runtime...",
  "Routing neural queries through generative hubs...",
  "Evaluating linguistic syntax and structural hierarchy...",
  "Resolving contextual dependency linkages...",
  "Extracting entity networks and key thematic clusters...",
  "Executing compliance validation and token constraints...",
  "Refining generative summarization nodes...",
  "Encrypting processed insights inside memory buffers...",
  "Finalizing data persistence and caching vectors..."
];

export default function Workspace({ activeDocId, setActiveDocId }) {
  const { activeJobs, trackJob, removeJob } = useSocket();
  const { addToast } = useToast();
  const { token } = useAuth();

  // Upload/input states
  const [activeInputTab, setActiveInputTab] = useState('upload');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Right Panel States
  const [documentData, setDocumentData] = useState(null);
  const [savedHtml, setSavedHtml] = useState('');
  const [searchWord, setSearchWord] = useState('');
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  
  // Progress states
  const [localProgress, setLocalProgress] = useState(0);
  const [currentVerbIdx, setCurrentVerbIdx] = useState(0);
  const [socketStatus, setSocketStatus] = useState('Pending');
  const [shouldSimulate, setShouldSimulate] = useState(false);

  // Selection Highlight Toolbar ref
  const savedRangeRef = useRef(null);

  // Recent Session Chips
  const [justAnalyzedIds, setJustAnalyzedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('insightstream-session-chips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveSessionChips = (ids) => {
    setJustAnalyzedIds(ids);
    localStorage.setItem('insightstream-session-chips', JSON.stringify(ids));
  };

  // Sound Synthesizer Chime
  const playChime = (type = 'success') => {
    if (localStorage.getItem('setting-audio-alerts') !== 'true') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (type === 'success') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1174.66, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.6);
        osc2.stop(ctx.currentTime + 0.6);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.25);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("Audio Context playback blocked:", e);
    }
  };

  // Get list of matching lines for search scroll mapping
  const getSearchMatches = () => {
    if (!searchWord.trim() || !documentData || !documentData.insights) return [];
    const lines = documentData.insights.split('\n');
    const matches = [];
    let idx = 0;
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      idx++;
      const cleanText = trimmed.replace(/[#*`\-•]/g, '').trim();
      if (cleanText.toLowerCase().includes(searchWord.toLowerCase())) {
        matches.push({
          id: `analysis-el-${idx}`,
          text: cleanText
        });
      }
    });
    return matches;
  };

  // Convert markdown insights to initial HTML representation
  const markdownToHtml = (markdown) => {
    if (!markdown) return '';
    const lines = markdown.split('\n');
    let idx = 0;
    let html = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      idx++;
      const elementId = `analysis-el-${idx}`;
      if (trimmed.startsWith('## ')) {
        return `<h3 id="${elementId}">${trimmed.slice(3)}</h3>`;
      }
      if (trimmed.startsWith('# ')) {
        return `<h2 id="${elementId}">${trimmed.slice(2)}</h2>`;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return `<p id="${elementId}">• ${trimmed.slice(2)}</p>`;
      }
      return `<p id="${elementId}">${trimmed}</p>`;
    }).filter(Boolean).join('');
    
    return html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  };

  // 1. Check/Load Document State on activeDocId Shift
  useEffect(() => {
    if (!activeDocId) {
      setDocumentData(null);
      setSavedHtml('');
      setNotes([]);
      setShouldSimulate(false);
      return;
    }

    const fetchDoc = async () => {
      try {
        const currentToken = token || localStorage.getItem('insightstream_token');
        const res = await fetch(`${API_URL}/api/documents/${activeDocId}`, {
          headers: {
            'Authorization': `Bearer ${currentToken}`
          }
        });
        const data = await res.json();
        
        if (data.success && data.document) {
          setDocumentData(data.document);
          if (data.document.status === 'Completed') {
            // Document already analyzed
            const storedHtml = localStorage.getItem(`insightstream-highlights-${activeDocId}`);
            if (storedHtml && storedHtml.includes('analysis-el-')) {
              setSavedHtml(storedHtml);
            } else {
              const parsedHtml = markdownToHtml(data.document.insights || '');
              setSavedHtml(parsedHtml);
              localStorage.setItem(`insightstream-highlights-${activeDocId}`, parsedHtml);
            }

            // Load notes
            const storedNotes = localStorage.getItem(`insightstream-notes-${activeDocId}`);
            setNotes(storedNotes ? JSON.parse(storedNotes) : []);
            setLocalProgress(100);
            setSocketStatus('Completed');
            setShouldSimulate(false);
          } else {
            // Wait / Track in queue
            setShouldSimulate(true);
            setLocalProgress(0);
          }
        } else {
          addToast(data.message || 'Failed to fetch document insights', 'error');
        }
      } catch (err) {
        addToast(err.message, 'error');
      }
    };

    fetchDoc();
  }, [activeDocId]);

  // 2. Simulated Progress Increments (Min 30s)
  useEffect(() => {
    if (!shouldSimulate || activeDocId === null) return;

    const job = activeJobs[activeDocId];
    const startedAt = job?.startedAt || Date.now();
    const duration = 30000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progressPercent = Math.min((elapsed / duration) * 100, 99);
      setLocalProgress(Math.floor(progressPercent));

      const verbIndex = Math.min(
        Math.floor((progressPercent / 100) * technicalVerbs.length),
        technicalVerbs.length - 1
      );
      setCurrentVerbIdx(verbIndex);
    }, 100);

    return () => clearInterval(timer);
  }, [shouldSimulate, activeDocId]);

  // 3. Monitor WS Pipeline updates
  const wsJob = activeDocId ? activeJobs[activeDocId] : null;
  const wsProgress = wsJob?.progress || 0;
  const wsStatus = wsJob?.status || 'Pending';

  useEffect(() => {
    if (!activeDocId) return;
    if (wsStatus) setSocketStatus(wsStatus);

    if (wsStatus === 'Failed') {
      addToast('Analysis queue execution failed', 'error');
      playChime('error');
      setShouldSimulate(false);
    }
  }, [wsStatus, activeDocId]);

  useEffect(() => {
    if (!activeDocId) return;
    if (wsProgress === 100 || wsStatus === 'Completed') {
      const fetchCompleted = async () => {
        try {
          const currentToken = token || localStorage.getItem('insightstream_token');
          const res = await fetch(`${API_URL}/api/documents/${activeDocId}`, {
            headers: {
              'Authorization': `Bearer ${currentToken}`
            }
          });
          const data = await res.json();
          if (data.success && data.document) {
            setDocumentData(data.document);
            const parsedHtml = markdownToHtml(data.document.insights || '');
            setSavedHtml(parsedHtml);
            localStorage.setItem(`insightstream-highlights-${activeDocId}`, parsedHtml);
            
            // Trigger alerts
            playChime('success');
            if (localStorage.getItem('setting-browser-alerts') !== 'false') {
              addToast('Document successfully analyzed!', 'success');
            }

            setLocalProgress(100);
            setSocketStatus('Completed');
            setShouldSimulate(false);
            removeJob(activeDocId);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchCompleted();
    }
  }, [wsProgress, wsStatus, activeDocId]);

  // File drag handlers
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.json') && !file.name.endsWith('.md')) {
      addToast('Only plain text, markdown or JSON payload files are supported.', 'error');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setContent(e.target?.result || '');
    reader.readAsText(file);
  };

  const handlePaste = async () => {
    // Focus the textarea automatically to ensure cursor is active
    setTimeout(() => textareaRef.current?.focus(), 50);

    if (!navigator.clipboard || !navigator.clipboard.readText) {
      addToast('Paste clipboard content manually (Ctrl+V).', 'info');
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setContent(text);
        setFileName('Pasted Payload.txt');
        addToast('Clipboard text pasted automatically', 'success');
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
      addToast('Press Ctrl+V to paste your clipboard text.', 'info');
    }
  };

  const loadSample = () => {
    setContent("InsightStream is a premium asynchronous document analysis platform built on the MERN stack. It leverages Redis-buffered queues (BullMQ) and WebSockets to process unstructured text payloads. System latency is minimized under 15ms via strict memory-caching layers, allowing sub-second NLP generation. This is a sample unstructured document to demonstrate real-time pipeline status tracking, multi-node step updates, and markdown insights rendering.");
    setFileName("Sample Payload.txt");
  };

  const triggerUpload = async () => {
    if (!content.trim()) return;
    setUploading(true);
    try {
      const currentToken = token || localStorage.getItem('insightstream_token');
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit payload');
      }

      // Add to session chips
      const updatedChips = [data.documentId, ...justAnalyzedIds.filter(id => id !== data.documentId)].slice(0, 5);
      saveSessionChips(updatedChips);

      // Reset upload panel
      setContent('');
      setFileName('');

      // Track the job
      trackJob(data.documentId);
      setActiveDocId(data.documentId);
      
      if (localStorage.getItem('setting-browser-alerts') !== 'false') {
        addToast('Job added to processing queue', 'success');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Text selection highlighters
  const hideToolbar = () => {
    window.getSelection().removeAllRanges();
    savedRangeRef.current = null;
    const toolbar = document.getElementById('hl-selection-toolbar');
    if (toolbar) {
      toolbar.style.display = 'none';
      toolbar.classList.remove('show');
    }
  };

  const handleMouseUp = (e) => {
    // Ignore selection toolbar if clicking inside notes sidebar or note inputs
    if (e.target.closest('.notes-sidebar') || e.target.closest('textarea') || e.target.closest('input')) {
      return;
    }

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      hideToolbar();
      return;
    }
    const range = sel.getRangeAt(0);
    const container = document.getElementById('analysisText');
    if (!container || !container.contains(range.commonAncestorContainer)) {
      hideToolbar();
      return;
    }
    
    // Cache the range using a Ref to bypass React state re-renders
    savedRangeRef.current = range.cloneRange();
    
    const rect = range.getBoundingClientRect();
    const toolbar = document.getElementById('hl-selection-toolbar');
    if (toolbar) {
      const x = Math.max(8, rect.left + rect.width / 2 - 60 + window.scrollX);
      const y = rect.top - 44 + window.scrollY;
      toolbar.style.left = `${x}px`;
      toolbar.style.top = `${y}px`;
      toolbar.style.display = 'flex';
      toolbar.classList.add('show');
    }
  };

  const applyHighlight = (color) => {
    const range = savedRangeRef.current;
    if (!range || !activeDocId) {
      hideToolbar();
      return;
    }
    
    // Ignore collapsed selection ranges to prevent empty capsule markers
    if (range.collapsed) {
      hideToolbar();
      return;
    }

    try {
      const mark = document.createElement('mark');
      mark.className = `hl-${color}`;
      range.surroundContents(mark);
      
      const container = document.getElementById('analysisText');
      if (container) {
        const newHtml = container.innerHTML;
        setSavedHtml(newHtml);
        localStorage.setItem(`insightstream-highlights-${activeDocId}`, newHtml);
        addToast('Highlight added', 'success');
      }
    } catch (e) {
      addToast("Cannot highlight across multiple tags", 'error');
    }
    hideToolbar();
  };

  const removeHighlight = () => {
    const range = savedRangeRef.current;
    if (!range || !activeDocId) {
      hideToolbar();
      return;
    }
    
    try {
      const container = document.getElementById('analysisText');
      if (container) {
        const commonAncestor = range.commonAncestorContainer;
        const parentMark = commonAncestor.nodeType === 3 ? commonAncestor.parentNode.closest('mark') : commonAncestor.closest('mark');
        
        let removedAny = false;
        if (parentMark && !parentMark.classList.contains('search-match')) {
          const parent = parentMark.parentNode;
          while (parentMark.firstChild) {
            parent.insertBefore(parentMark.firstChild, parentMark);
          }
          parent.removeChild(parentMark);
          removedAny = true;
        } else {
          const allMarks = (commonAncestor.nodeType === 3 ? commonAncestor.parentNode : commonAncestor).querySelectorAll('mark');
          allMarks.forEach(mark => {
            if (range.intersectsNode(mark) && !mark.classList.contains('search-match')) {
              const parent = mark.parentNode;
              while (mark.firstChild) {
                parent.insertBefore(mark.firstChild, mark);
              }
              parent.removeChild(mark);
              removedAny = true;
            }
          });
        }

        if (removedAny) {
          const newHtml = container.innerHTML;
          setSavedHtml(newHtml);
          localStorage.setItem(`insightstream-highlights-${activeDocId}`, newHtml);
          addToast('Highlight removed', 'success');
        }
      }
    } catch (e) {
      console.error("Error removing highlight:", e);
    }
    hideToolbar();
  };

  const handleTextClick = (e) => {
    const mark = e.target.closest('mark');
    if (mark && !mark.classList.contains('search-match')) {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      const container = document.getElementById('analysisText');
      if (container) {
        const newHtml = container.innerHTML;
        setSavedHtml(newHtml);
        localStorage.setItem(`insightstream-highlights-${activeDocId}`, newHtml);
        addToast('Highlight removed', 'success');
      }
    }
  };

  // Search matches highlighters
  const highlightSearchTerm = (html, term) => {
    if (!term || !term.trim()) return html;
    const cleanTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const parts = html.split(/(<[^>]+>)/g);
    return parts.map(part => {
      if (part.startsWith('<')) return part;
      const regex = new RegExp(`(${cleanTerm})`, 'gi');
      return part.replace(regex, '<mark class="search-match" style="background-color: var(--amber-tint); border-bottom: 2px solid var(--accent); color: var(--text);">$1</mark>');
    }).join('');
  };

  // Notes comment logic
  const handleAddNote = () => {
    if (!newNoteText.trim() || !activeDocId) return;
    const newNote = {
      id: 'n' + Date.now(),
      text: newNoteText.trim(),
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem(`insightstream-notes-${activeDocId}`, JSON.stringify(updatedNotes));
    setNewNoteText('');
    addToast('Note added', 'success');
  };

  const handleDeleteNote = (noteId) => {
    if (!activeDocId) return;
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem(`insightstream-notes-${activeDocId}`, JSON.stringify(updatedNotes));
    addToast('Note deleted', 'success');
  };

  // Helper size format
  const formatSize = (chars) => {
    const bytes = chars * 2; // approximation
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const steps = [
    { label: 'Queued', pct: 10 },
    { label: 'Processing', pct: 20 },
    { label: 'Generating Insights', pct: 70 },
    { label: 'Completed', pct: 100 }
  ];

  const activeStepIdx = localProgress >= 100 ? 3 : localProgress >= 70 ? 2 : localProgress >= 20 ? 1 : localProgress >= 10 ? 0 : -1;
  const fillWidthPercent = activeStepIdx === -1 ? 0 : (activeStepIdx / 3) * 100;

  return (
    <section className="view wrap" id="view-workspace">
      {/* Selection toolbar overlay */}
      <div
        id="hl-selection-toolbar"
        className="hl-toolbar"
        style={{ display: 'none', position: 'absolute' }}
        onMouseDown={e => e.preventDefault()}
      >
        <button type="button" data-color="amber" title="Amber" onClick={() => applyHighlight('amber')} />
        <button type="button" data-color="clay" title="Clay" onClick={() => applyHighlight('clay')} />
        <button type="button" data-color="moss" title="Moss" onClick={() => applyHighlight('moss')} />
        <button type="button" className="hl-remove" title="Remove Highlight" onClick={removeHighlight}>
          <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
        </button>
      </div>

      {/* Head */}
      <div className="view-head">
        <div>
          <span className="eyebrow">Workspace</span>
          <h2>Upload &amp; analyze</h2>
        </div>
        <p>Select your input mode on the left. Preview, edit, and analyze in the pane on the right.</p>
      </div>

      <div className="workspace">
        {/* Left Column: Upload Modes Stack */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
          <div className="panel-head" style={{ borderBottom: 'none', padding: '0 0 4px 0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Upload &amp; Analyze</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {/* Card 1: Upload Document */}
            <div
              onClick={() => {
                setActiveDocId(null);
                setActiveInputTab('upload');
                fileInputRef.current?.click();
              }}
              style={{
                border: activeInputTab === 'upload' ? '2.5px dashed var(--accent)' : '2px dashed var(--border-strong)',
                background: activeInputTab === 'upload' ? 'var(--accent-tint)' : 'var(--bg-alt)',
                borderRadius: 'var(--radius-md)',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease-in-out',
                color: activeInputTab === 'upload' ? 'var(--accent)' : 'var(--text-soft)'
              }}
              className="upload-mode-card"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.json,.md"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processFile(e.target.files[0]);
                  }
                }}
              />
              <svg className="icon" style={{ width: '28px', height: '28px', color: activeInputTab === 'upload' ? 'var(--accent)' : 'var(--text-soft)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V6M6 12l6-6 6 6M4 21h16" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: '600', fontSize: '14.5px', color: activeInputTab === 'upload' ? 'var(--text)' : 'var(--text-soft)' }}>Upload Document</span>
            </div>

            {/* Card 2: Paste Text */}
            <div
              onClick={() => {
                setActiveDocId(null);
                setActiveInputTab('paste');
                handlePaste();
              }}
              style={{
                border: activeInputTab === 'paste' ? '2.5px dashed var(--accent)' : '2px dashed var(--border-strong)',
                background: activeInputTab === 'paste' ? 'var(--accent-tint)' : 'var(--bg-alt)',
                borderRadius: 'var(--radius-md)',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease-in-out',
                color: activeInputTab === 'paste' ? 'var(--accent)' : 'var(--text-soft)'
              }}
              className="upload-mode-card"
            >
              <svg className="icon" style={{ width: '28px', height: '28px', color: activeInputTab === 'paste' ? 'var(--accent)' : 'var(--text-soft)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: '600', fontSize: '14.5px', color: activeInputTab === 'paste' ? 'var(--text)' : 'var(--text-soft)' }}>Paste Text</span>
            </div>

            {/* Card 3: Try Sample */}
            <div
              onClick={() => {
                setActiveDocId(null);
                setActiveInputTab('sample');
                loadSample();
              }}
              style={{
                border: activeInputTab === 'sample' ? '2.5px dashed var(--accent)' : '2px dashed var(--border-strong)',
                background: activeInputTab === 'sample' ? 'var(--accent-tint)' : 'var(--bg-alt)',
                borderRadius: 'var(--radius-md)',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease-in-out',
                color: activeInputTab === 'sample' ? 'var(--accent)' : 'var(--text-soft)'
              }}
              className="upload-mode-card"
            >
              <svg className="icon" style={{ width: '28px', height: '28px', color: activeInputTab === 'sample' ? 'var(--accent)' : 'var(--text-soft)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18v-6M9 15h6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: '600', fontSize: '14.5px', color: activeInputTab === 'sample' ? 'var(--text)' : 'var(--text-soft)' }}>Try Sample</span>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis or Payload Previews */}
        <div className="panel" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>
          
          {/* Header of Right Panel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '20px 26px', position: 'relative' }}>
            <h3 style={{ textTransform: 'capitalize', margin: 0, fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              {activeDocId && documentData && documentData.status === 'Completed'
                ? `Analysis: ${generateTitle(documentData.insights, documentData.content)}`
                : activeInputTab === 'upload' ? 'Upload Preview' : activeInputTab === 'paste' ? 'Pasted Text' : 'Sample Payload'}
            </h3>
            
            {activeDocId && documentData && documentData.status === 'Completed' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    style={{
                      padding: '8px 12px 8px 32px',
                      borderRadius: 'var(--radius-sm)',
                      border: searchWord ? '1.5px solid var(--accent)' : '1px solid var(--border-strong)',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: '13.5px',
                      width: '200px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                    <svg style={{ width: '14px', height: '14px', color: 'var(--text-soft)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {searchWord && (
                    <button
                      type="button"
                      onClick={() => setSearchWord('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-soft)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                    >
                      <svg style={{ width: '10px', height: '10px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  
                  {/* Floating Search Dropdown */}
                  {searchWord.trim() && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      width: '280px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-lift)',
                      zIndex: 200,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      padding: '4px'
                    }}>
                      {(() => {
                        const matches = getSearchMatches();
                        if (matches.length === 0) {
                          return <div style={{ padding: '8px 12px', fontSize: '12.5px', color: 'var(--text-soft)', fontStyle: 'italic' }}>No matches found.</div>;
                        }
                        return matches.map((match, mIdx) => {
                          const text = match.text;
                          const regex = new RegExp(`(${searchWord})`, 'gi');
                          const highlightedText = text.replace(regex, '<mark style="background: #fef08a; color: #1e293b; padding: 1px 3px; border-radius: 2px; font-weight: 500;">$1</mark>');
                          
                          // Extract line number
                          const matchLineNum = match.id.split('-').pop() || '';

                          return (
                            <button
                              key={mIdx}
                              type="button"
                              style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                fontSize: '12.5px',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text)',
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--border)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              className="search-dropdown-item"
                              onClick={() => {
                                const el = document.getElementById(match.id);
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  
                                  // Clear active highlight
                                  document.querySelectorAll('#analysisText [id^="analysis-el-"]').forEach(item => {
                                    item.classList.remove('active-line-highlight');
                                  });
                                  
                                  // Add active highlight
                                  el.classList.add('active-line-highlight');
                                }
                              }}
                              dangerouslySetInnerHTML={{
                                __html: `<span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-soft); margin-right: 6px;">Lin ${matchLineNum}</span> ${highlightedText}`
                              }}
                            />
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
                
                {/* Toggle icon */}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-soft)'
                  }}
                >
                  <svg style={{ width: '14px', height: '14px', stroke: 'currentColor' }} viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M7 15l5 5 5-5M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>



          {/* Edit / Payload Input Mode */}
          {!activeDocId && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '26px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-soft)' }}>
                  {fileName ? `Loaded Payload: ${fileName}` : 'Enter or paste document contents to analyze'}
                </label>
                <textarea
                  ref={textareaRef}
                  style={{
                    flex: 1,
                    width: '100%',
                    background: 'var(--bg-alt)',
                    color: 'var(--text)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    resize: 'none',
                    minHeight: '260px'
                  }}
                  placeholder="Paste text contents here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start', gap: '10px' }}>
                {content.trim() && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setContent(''); setFileName(''); }}>
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ background: 'var(--accent)', color: '#fff', padding: '12px 28px', borderRadius: '999px', cursor: 'pointer' }}
                  onClick={triggerUpload}
                  disabled={uploading || !content.trim()}
                >
                  {uploading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
          )}

          {/* Loading / Stepper State */}
          {activeDocId && documentData && documentData.status !== 'Completed' && socketStatus !== 'Failed' && (
            <div style={{ padding: '34px 26px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-dark)', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold' }}>
                  <svg className="icon" style={{ animation: 'spin 2s linear infinite' }} viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                  <span>{technicalVerbs[currentVerbIdx] || 'Pipeline processing...'}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: '900' }}>{localProgress}%</span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-alt)', borderRadius: '99px', overflow: 'hidden', marginBottom: '32px' }}>
                <div style={{ width: `${localProgress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }} />
              </div>

              {/* Steps Node timeline */}
              <div style={{ position: 'relative', userSelect: 'none', paddingTop: '8px' }}>
                <div style={{ left: '12.5%', right: '12.5%', top: '24px', height: '2px', background: 'var(--border)', zIndex: 0, position: 'absolute' }} />
                <div style={{ left: '12.5%', top: '24px', height: '2px', background: 'var(--accent)', zIndex: 0, transition: 'width 0.4s', width: `${fillWidthPercent}%`, position: 'absolute' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', position: 'relative', zIndex: 10 }}>
                  {steps.map((st, idx) => {
                    const done = localProgress >= st.pct;
                    const active = activeStepIdx === idx;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', border: '2px solid',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)',
                          borderColor: done ? 'var(--accent)' : active ? 'var(--accent-dark)' : 'var(--border-strong)',
                          color: done || active ? 'var(--accent-dark)' : 'var(--text-soft)',
                          fontWeight: 'bold', zIndex: 20
                        }}>
                          {done ? (
                            <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : idx + 1}
                        </div>
                        <span style={{ fontSize: '11px', marginTop: '8px', fontWeight: done || active ? 'bold' : 'normal', color: done || active ? 'var(--text)' : 'var(--text-soft)' }}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Failed State */}
          {activeDocId && socketStatus === 'Failed' && (
            <div className="analysis-empty">
              <div className="dicon" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Pipeline Stalled</h3>
              <p>The background worker failed to process this payload.</p>
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: '14px' }} onClick={() => setActiveDocId(null)}>Clear View</button>
            </div>
          )}

          {/* Completed State: Document Insights Display */}
          {activeDocId && documentData && documentData.status === 'Completed' && (
            <div id="analysisBody" onMouseUp={handleMouseUp} style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
              <div style={{ display: 'flex', gap: '32px', padding: '26px', alignItems: 'flex-start', flex: 1 }}>
                
                {/* Text Area */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: '12px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div
                    className="analysis-text"
                    id="analysisText"
                    onClick={handleTextClick}
                    style={{ padding: 0, flex: 1, overflowY: 'auto' }}
                    dangerouslySetInnerHTML={{
                      __html: highlightSearchTerm(savedHtml, searchWord)
                    }}
                  />
                  
                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexShrink: 0 }}>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={() => setActiveDocId(null)}
                      style={{ background: 'var(--accent)', color: '#fff', padding: '10px 24px', borderRadius: '999px', cursor: 'pointer' }}
                    >
                      Analyze
                    </button>
                  </div>
                </div>

                {/* Sticky Notes Sidebar */}
                <div className="notes-sidebar" style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-soft)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg style={{ width: '14px', height: '14px', color: 'var(--accent-dark)' }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 12V4h1v-2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                    </svg>
                    Sticky Notes
                  </h4>
                  
                  {/* Note input field inside sidebar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <textarea
                      rows="2"
                      placeholder="Type a note..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '12.5px',
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-strong)',
                        background: 'var(--bg-alt)',
                        color: 'var(--text)',
                        resize: 'none',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', padding: '8px 16px', background: 'var(--accent)', color: '#fff', borderRadius: '999px', cursor: 'pointer' }}
                      onClick={handleAddNote}
                    >
                      Pin Note
                    </button>
                  </div>

                  {/* Notes List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '10px' }}>
                    {notes.length === 0 ? (
                      <div className="notes-empty" style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>
                        No notes yet — write one above.
                      </div>
                    ) : (
                      notes.map((n) => (
                        <div key={n.id} className="note-item" style={{ width: '100%', position: 'relative', minHeight: '70px' }}>
                          <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center' }}>
                            <svg style={{ width: '16px', height: '16px', color: 'var(--accent-dark)', filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.25))' }} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M16 12V4h1v-2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                            </svg>
                          </div>
                          <div style={{ flex: 1, marginTop: '4px' }}>
                            <div className="ntext" style={{ wordBreak: 'break-word' }}>{n.text}</div>
                            <div className="ntime">{n.time}</div>
                          </div>
                          <button 
                            type="button" 
                            className="ndel" 
                            onClick={() => handleDeleteNote(n.id)} 
                            style={{ 
                              padding: '2px', 
                              alignSelf: 'flex-start',
                              background: 'none',
                              border: 'none',
                              color: 'rgba(34,32,27,0.4)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <svg style={{ width: '8px', height: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
