import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Sparkles, X, Clipboard } from 'lucide-react';

export default function UploadZone({ onUpload }) {
  const [content, setContent] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processUploadedFile(file);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file) => {
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt') && !file.name.endsWith('.json') && !file.name.endsWith('.md')) {
      alert('Only plain text, markdown, or JSON files are supported.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setContent(e.target?.result || '');
    };
    reader.readAsText(file);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
      setFileName('Pasted Clipboard.txt');
    } catch (err) {
      // Fallback
      alert('Failed to read clipboard. Please paste manually into the textbox.');
    }
  };

  const handleReset = () => {
    setContent('');
    setFileName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onUpload(content);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl w-full mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Drag and Drop Container */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !content && fileInputRef.current?.click()}
          className={`relative glass-panel rounded-3xl p-10 flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 ${
            content ? 'border-brand-primary/20' : 'cursor-pointer hover:border-brand-primary/60'
          } ${
            isDragActive ? 'border-brand-primary scale-[1.02] neon-glow bg-brand-primary/5' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".txt,.json,.md"
            onChange={handleFileInput}
          />

          {/* Glowing gradient backdrops */}
          <div className="absolute inset-0 rounded-3xl bg-radial-gradient from-brand-primary/5 via-transparent to-transparent pointer-events-none" />

          <AnimatePresence mode="wait">
            {!content ? (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="p-5 rounded-2xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 neon-glow"
                >
                  <UploadCloud className="w-10 h-10" />
                </motion.div>
                
                <div>
                  <h3 className="text-lg font-bold text-txt-primary">
                    Drag & Drop your document
                  </h3>
                  <p className="text-sm text-txt-secondary mt-1">
                    Accepts <code className="text-brand-secondary">.txt</code>, <code className="text-brand-secondary">.json</code>, or <code className="text-brand-secondary">.md</code> files (Max 1MB)
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-border-main text-xs font-semibold hover:bg-white/10 hover:border-brand-primary/40 transition-all cursor-pointer"
                  >
                    Browse Files
                  </button>
                  <span className="text-xs text-txt-secondary">or</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePaste();
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-border-main text-xs font-semibold hover:bg-white/10 hover:border-brand-primary/40 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    Paste Clipboard
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="preview-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex flex-col space-y-4"
                onClick={(e) => e.stopPropagation()} // Prevent click propagation to browse file
              >
                <div className="flex justify-between items-center pb-3 border-b border-border-main">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <FileText className="w-5 h-5 neon-text-glow" />
                    <span className="text-sm font-semibold truncate max-w-md">
                      {fileName || 'Payload Loaded'}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-txt-secondary hover:text-txt-primary transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="w-full bg-black/5 dark:bg-black/35 rounded-xl border border-border-main p-4 font-mono text-sm focus:outline-none focus:border-brand-primary/60 text-txt-primary focus:ring-1 focus:ring-brand-primary/20 resize-none transition-all"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-txt-secondary font-mono">
                    {content.length} characters
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit button */}
        {content && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-6 py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-primary/95 text-white font-bold tracking-wide shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/35 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.01]"
            >
              <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              Initialize Analysis Pipeline
            </button>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}

// Inline import helper to prevent crashes
import { AnimatePresence } from 'framer-motion';
