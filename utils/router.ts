import { useState, useEffect } from 'react';

export const useHashLocation = () => {
  const getHash = () => window.location.hash.replace('#', '') || 'home';
  
  const [loc, setLoc] = useState(getHash());

  useEffect(() => {
    const handler = () => setLoc(getHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return [loc, navigate] as const;
};