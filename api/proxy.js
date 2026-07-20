// What are you doing looking at this code bro?
const ALLOWED_ORIGINS = [
  'https://syonxstool.vercel.app',
  'http://localhost:3000' // buat testing lokal
];

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer || '';

  const isAllowed = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
  if (!isAllowed) {
    return res.status(403).json({ error: 'Origin tidak diizinkan' });
  }

  const { target } = req.query;
  if (!target) {
    return res.status(400).json({ error: 'Parameter target wajib diisi' });
  }

  try {
    const targetUrl = decodeURIComponent(target);
    const response = await fetch(targetUrl);
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
