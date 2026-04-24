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

  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  // ── GET ─────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    if (!hasToken) return res.json({ platforms: [], posts: {}, _error: 'BLOB_READ_WRITE_TOKEN missing' });
    try {
      const { blobs } = await list({ prefix: BLOB_PATH });
      if (!blobs.length) return res.json({ platforms: [], posts: {}, _debug: 'no blobs' });
      const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
      const r = await fetch(latest.downloadUrl);
      if (!r.ok) return res.json({ platforms: [], posts: {}, _error: `fetch ${r.status}` });
      const data = await r.json();
      return res.json(data);
    } catch (e) {
      return res.json({ platforms: [], posts: {}, _error: e.message });
    }
  }

  // ── POST ────────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    if (!hasToken) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN missing' });
    try {
      const body = await readBody(req);
      const json = JSON.stringify(body);
      const { blobs } = await list({ prefix: BLOB_PATH });
      if (blobs.length) await Promise.all(blobs.map(b => del(b.url)));
      const result = await put(BLOB_PATH, json, {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
      });
      return res.json({ ok: true, url: result.url });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
