import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useSocket } from '../context/SocketProvider';
import { API_URL } from '../config';
import { useToast } from '../context/ToastProvider';
import { useAuth } from '../context/AuthProvider';
import SkeletonView from './SkeletonView';
import ResultCard from './ResultCard';
import { Terminal, Cpu, ArrowLeft, RefreshCw } from 'lucide-react';

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

export default function ProgressSection({ documentId, onBack }) {
  const { activeJobs, removeJob } = useSocket();
  const { addToast } = useToast();
  const { user } = useAuth();

  // Programmatic audio synthesizer chime
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
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1174.66, ctx.currentTime); // D6
        
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
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.25); // A2
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("Audio Context playback blocked or unsupported:", e);
    }
  };
  
  const [localProgress, setLocalProgress] = useState(0);
  const [currentVerbIdx, setCurrentVerbIdx] = useState(0);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const [socketStatus, setSocketStatus] = useState('Pending');
  const hasFetchedRef = useRef(false);

  // DOM Refs for GSAP
  const skeletonRef = useRef(null);
  const resultRef = useRef(null);
  const progressUIRef = useRef(null);

  const [shouldSimulate, setShouldSimulate] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // 1. Check Initial State on Mount (helps avoid 30s delay for completed logs)
  useEffect(() => {
    const checkInitialState = async () => {
      try {
        const token = localStorage.getItem('insightstream_token');
        const res = await fetch(`${API_URL}/api/documents/${documentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (data.success && data.document) {
          setDocumentData(data.document);
          if (data.document.status === 'Completed') {
            // Already completed! Display immediately, skip progress bar
            setInsights(data.document.insights);
            setLocalProgress(100);
            setIsDone(true);
            setSocketStatus('Completed');
            
            // Hide progress tracking panel, hide skeleton, fade-in result card instantly
            gsap.set(progressUIRef.current, { display: 'none', opacity: 0 });
            gsap.set(skeletonRef.current, { display: 'none', opacity: 0 });
            gsap.set(resultRef.current, { display: 'block', opacity: 0, y: 15 });
            gsap.to(resultRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
          } else {
            // Document is in queue (Pending / Processing). Start/resume simulation
            setShouldSimulate(true);
          }
        } else {
          setError(data.message || 'Failed to fetch document state');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingInitial(false);
      }
    };

    checkInitialState();
  }, [documentId]);

  // 2. Minimum 30s Simulated Progress Engine
  useEffect(() => {
    if (!shouldSimulate || isDone) return;

    // Catch up elapsed simulated progress if page navigation remount occurred
    const activeJob = activeJobs[documentId];
    const startedAt = activeJob?.startedAt || Date.now();
    const duration = 30000; // 30 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progressPercent = Math.min((elapsed / duration) * 100, 99); // Cap at 99% until fully done

      setLocalProgress(Math.floor(Math.max(progressPercent, 0)));

      // Rotate verbs based on progress
      const verbIndex = Math.min(
        Math.floor((Math.max(progressPercent, 0) / 100) * technicalVerbs.length),
        technicalVerbs.length - 1
      );
      setCurrentVerbIdx(verbIndex);
    }, 100);

    return () => clearInterval(timer);
  }, [shouldSimulate, documentId, isDone]);

  // 3. Monitor WebSocket / Database State for Completion
  const jobState = activeJobs[documentId];
  const backendProgress = jobState?.progress || 0;
  const backendStatus = jobState?.status || 'Pending';

  useEffect(() => {
    if (backendStatus) {
      setSocketStatus(backendStatus);
    }

    if (backendStatus === 'Failed') {
      setError('The background document worker failed to process the request.');
      playChime('error');
      if (localStorage.getItem('setting-browser-alerts') !== 'false') {
        addToast('Document processing failed', 'error');
      }
    }
  }, [backendStatus]);

  // Fetch document insights when completed
  const fetchDocumentData = async () => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    try {
      const token = localStorage.getItem('insightstream_token');
      const res = await fetch(`${API_URL}/api/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.document) {
        setDocumentData(data.document);
        setInsights(data.document.insights);
        
        // Trigger alerts depending on user preferences settings
        playChime('success');
        
        if (localStorage.getItem('setting-browser-alerts') !== 'false') {
          addToast('Document successfully analyzed!', 'success');
        }
        
        if (localStorage.getItem('setting-email-alerts') === 'true') {
          addToast(`[Email Alert] Digest report sent to ${user?.email || 'user@example.com'}`, 'info');
        }
      } else {
        hasFetchedRef.current = false;
        throw new Error(data.message || 'Failed to fetch insights');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Trigger data fetch if backend progress completes
  useEffect(() => {
    if (backendProgress === 100 || backendStatus === 'Completed') {
      fetchDocumentData();
    }
  }, [backendProgress, backendStatus]);

  // 4. Complete Pipeline Transition
  // We transition immediately when insights and documentData are fetched (fast-forwarding)
  useEffect(() => {
    if (insights && documentData && !isDone) {
      setShouldSimulate(false);
      setLocalProgress(100);
      setIsDone(true);
      removeJob(documentId); // Clear job tracking
      runGSAPRevealTimeline();
    }
  }, [insights, documentData, isDone, removeJob, documentId]);

  // 4. GSAP Morphing Transition Timeline
  const runGSAPRevealTimeline = () => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Ensure result card is prepared but transparent/shifted
      gsap.set(resultRef.current, { display: 'block', opacity: 0, y: 40 });

      tl.to(progressUIRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: 'power3.inOut'
      })
      .to(progressUIRef.current, {
        display: 'none',
        duration: 0
      })
      .to(skeletonRef.current, {
        opacity: 0.2,
        scale: 0.98,
        filter: 'blur(4px)',
        duration: 0.6,
        ease: 'power2.inOut'
      }, '-=0.2')
      .to(skeletonRef.current, {
        display: 'none',
        opacity: 0,
        duration: 0.2
      })
      .to(resultRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.2)'
      }, '-=0.1')
      // Stagger child elements of ResultCard for premium feel
      .fromTo('.results-card > *', 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
        '-=0.4'
      );
    });

    return () => ctx.revert();
  };

  // GSAP Pulsing Skeleton animation on mount
  useEffect(() => {
    const pulseCtx = gsap.context(() => {
      gsap.to('.shimmer-bg', {
        opacity: 0.6,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, skeletonRef);

    return () => pulseCtx.revert();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
      
      {/* 1. Header Navigation */}
      <div className="flex justify-between items-center pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-txt-secondary hover:text-txt-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Abort Analysis
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-txt-secondary">
          <span className={`w-2 h-2 rounded-full ${
            (isDone || insights) ? 'bg-emerald-500' :
            socketStatus === 'Failed' ? 'bg-rose-500' :
            'bg-brand-primary animate-pulse'
          }`} />
          SOCKET: {(isDone || insights) ? 'COMPLETED' : socketStatus === 'Failed' ? 'FAILED' : 'PENDING'}
        </div>
      </div>

      {/* 2. Progress Tracker UI Section */}
      <div ref={progressUIRef} className="glass-panel p-6 rounded-2xl border border-border-main space-y-4">
        <div className="flex justify-between items-center text-sm">
          {/* Rotating Verb Terminal (Framer Motion) */}
          <div className="flex items-center gap-2 font-mono text-brand-primary font-bold">
            <Terminal className="w-4.5 h-4.5 animate-pulse" />
            <div className="h-5 overflow-hidden relative w-80 md:w-120">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentVerbIdx}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="absolute left-0 text-xs md:text-sm truncate w-full"
                >
                  {technicalVerbs[currentVerbIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <span className="text-lg font-extrabold text-txt-primary tracking-tighter">
            {localProgress}%
          </span>
        </div>

        {/* Framer Motion Progress Bar */}
        <div className="w-full h-2.5 bg-black/10 dark:bg-black/35 rounded-full overflow-hidden border border-border-main/50 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${localProgress}%` }}
            transition={{ ease: 'linear', duration: 0.1 }}
            className="h-full rounded-full bg-gradient-to-r from-brand-primary via-purple-500 to-brand-secondary neon-glow relative"
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>

      {/* 3. Error Handling */}
      {error && (
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-300 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 flex-shrink-0 animate-spin text-rose-400" />
          <div className="text-sm">
            <p className="font-bold">Pipeline Stalled</p>
            <p className="text-xs text-txt-secondary mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* 4. Animation Wrapper Container */}
      <div className="relative">
        
        {/* Pulsing Skeleton View (Targeted by GSAP) */}
        <div ref={skeletonRef} className="w-full">
          <SkeletonView />
        </div>

        {/* Result Card (Starts Hidden, Targeted by GSAP) */}
        <div ref={resultRef} className="w-full" style={{ display: 'none' }}>
          {documentData && <ResultCard document={documentData} />}
        </div>

      </div>
    </div>
  );
}
