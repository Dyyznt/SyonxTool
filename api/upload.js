// api/upload.js
// Terima file (base64) dari browser, upload ke catbox dari SERVER (gak kena CORS)

const ALLOWED_ORIGINS = [
  'https://syonxstool.vercel.app',
  'http://localhost:3000'
];

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer || '';
  const isAllowed = ALLOWED_ORIGINS.some(a => origin.startsWith(a));
  if (!isAllowed) {
    return res.status(403).json({ error: 'Origin tidak diizinkan' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method harus POST' });
  }

  try {
    const { base64, filename } = req.body;
    if (!base64 || !filename) {
      return res.status(400).json({ error: 'base64 & filename wajib diisi' });
    }

    // ubah base64 -> Buffer -> Blob (Node 18+ Vercel udah support Blob & FormData native)
    const buffer = Buffer.from(base64, 'base64');
    const blob = new Blob([buffer]);

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, filename);

    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });

    const text = await catboxRes.text();
    if (!text.startsWith('https://')) {
      return res.status(502).json({ error: 'Catbox nolak: ' + text });
    }

    return res.status(200).json({ url: text.trim() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
