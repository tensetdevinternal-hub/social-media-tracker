import { useState, useEffect, useRef } from 'react';

const API = '/api/data';
const LOCAL_KEY = 'contentCalendarDataV2';
const POLL_MS = 15000;

export function useSharedData(initialValue) {
  const [data, setData] = useState(() => {
    try {
      const item = localStorage.getItem(LOCAL_KEY);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const saveTimer = useRef(null);

  function applyServerData(d) {
    if (d && Array.isArray(d.platforms)) {
      setData(d);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(d));
    }
  }

  // Fetch from server on mount
  useEffect(() => {
    fetch(API).then(r => r.json()).then(applyServerData).catch(() => {});
  }, []);

  // Poll every 15s so all users stay in sync
  useEffect(() => {
    const id = setInterval(() => {
      fetch(API).then(r => r.json()).then(applyServerData).catch(() => {});
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const setValue = (value) => {
    const next = value instanceof Function ? value(data) : value;
    setData(next);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));

    // Debounce saves — 500ms after last change
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      }).catch(() => {});
    }, 500);
  };

  return [data, setValue];
}
