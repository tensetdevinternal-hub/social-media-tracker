import { put, list, del } from '@vercel/blob';

const BLOB_PATH = 'calendar-data.json';

async function readBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let raw = '';
    req.on('data', chunk => (raw += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); }
    });
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: return current data ────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH });
      if (!blobs.length) return res.json({ platforms: [], posts: {} });
      const latest = blobs.sort(
        (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
      )[0];
      const r = await fetch(latest.url);
      const data = await r.json();
      return res.json(data);
    } catch {
      return res.json({ platforms: [], posts: {} });
    }
  }

  // ── POST: save new data ─────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const body = await readBody(req);
      const json = JSON.stringify(body);

      // Delete old blobs, then write fresh
      const { blobs } = await list({ prefix: BLOB_PATH });
      if (blobs.length) await Promise.all(blobs.map(b => del(b.url)));

      await put(BLOB_PATH, json, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      });
      return res.json({ ok: true });
    } catch (e) {
      console.error('Blob write error:', e);
      return res.status(500).json({ error: 'Failed to save data' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
