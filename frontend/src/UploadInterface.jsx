import { useState } from 'react';
import { API_URL } from './config';

export default function UploadInterface({ onUploadSuccess }) {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsUploading(true);
    setError(null);

    try {
      // Sending the payload to your Express Phase 1/2 POST route
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document');
      }

      // The 202 Accepted response returns the documentId
      // We pass this ID up to the main app layout to trigger the WebSocket phase
      onUploadSuccess(data.documentId);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2>Submit Document for AI Analysis</h2>
      
      <form onSubmit={handleUpload}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your raw text payload here..."
          rows={10}
          style={{ width: '100%', padding: '1rem', marginBottom: '1rem' }}
          disabled={isUploading}
        />
        
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        
        <button 
          type="submit" 
          disabled={isUploading || !content.trim()}
          style={{ padding: '0.75rem 1.5rem', cursor: isUploading ? 'not-allowed' : 'pointer' }}
        >
          {isUploading ? 'Initializing Queue...' : 'Analyze Document'}
        </button>
      </form>
    </div>
  );
}