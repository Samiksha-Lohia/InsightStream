import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [activeJobs, setActiveJobs] = useState({});
  const activeJobsRef = useRef({});

  // Keep ref up to date so socket handlers can access current state
  useEffect(() => {
    activeJobsRef.current = activeJobs;
  }, [activeJobs]);

  useEffect(() => {
    // Connect to backend Socket.io server
    const socketInstance = io('http://localhost:3000');

    socketInstance.on('connect', () => {
      console.log('[🔌 WebSocket] Connected at root level');
    });

    // Listen to global progress events
    socketInstance.on('progress', (data) => {
      const { documentId, progress, status } = data;
      console.log(`[🔌 WebSocket] Progress update for ${documentId}: ${progress}% - ${status}`);
      
      // Update our track map
      setActiveJobs((prev) => {
        const existing = prev[documentId] || {};
        return {
          ...prev,
          [documentId]: {
            ...existing,
            progress: progress !== undefined ? progress : existing.progress || 0,
            status: status || existing.status || 'Processing',
            updatedAt: Date.now()
          }
        };
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('[🔌 WebSocket] Disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const trackJob = (documentId, initialStatus = 'Pending') => {
    setActiveJobs((prev) => ({
      ...prev,
      [documentId]: {
        progress: 0,
        status: initialStatus,
        startedAt: Date.now(),
        updatedAt: Date.now()
      }
    }));
  };

  const removeJob = (documentId) => {
    setActiveJobs((prev) => {
      const updated = { ...prev };
      delete updated[documentId];
      return updated;
    });
  };

  return (
    <SocketContext.Provider value={{ socket, activeJobs, trackJob, removeJob }}>
      {children}
    </SocketContext.Provider>
  );
};
