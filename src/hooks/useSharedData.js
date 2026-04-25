import { useState, useEffect, useRef } from 'react';

const API = '/api/data';
const LOCAL_KEY = 'contentCalendarDataV2';
const POLL_MS = 15000;
const WRITE_GRACE_MS = 10000; // ignore server data for 10s after a local write

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
  const lastWriteAt = useRef(0);

  function applyServerData(d) {
    // Don't overwrite local changes made within the grace period
    if (Date.now() - lastWriteAt.current < WRITE_GRACE_MS) return;
    // Don't overwrite with empty/invalid data
    if (!d || !Array.isArray(d.platforms) || d.platforms.length === 0) return;
    // Merge to preserve fields the server snapshot may not have yet (e.g. launchDays)
    const merged = { ...initialValue, ...d };
    setData(merged);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
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
    lastWriteAt.current = Date.now(); // mark time of local write

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
