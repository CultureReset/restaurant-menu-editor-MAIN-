import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { slug } = req.query;
  const token = req.headers['x-menu-token'];

  if (!slug) return res.status(400).json({ error: 'slug required' });
  if (!token) return res.status(401).json({ error: 'token required' });

  try {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) return res.status(400).json({ error: 'No file' });

    const buffer = fs.readFileSync(file.filepath);
    const type = (fields.type && fields.type[0]) || 'menu-item';
    const itemId = (fields.item_id && fields.item_id[0]) || null;

    // Proxy to gcr-api-clean
    const formData = new FormData();
    formData.append('image', buffer, { filename: file.originalFilename, contentType: file.mimetype });
    formData.append('type', type);
    if (itemId) formData.append('item_id', itemId);

    const API_BASE = process.env.NEXT_PUBLIC_GCR_API || 'https://gcr-api-clean-fresh.vercel.app';
    const uploadRes = await fetch(`${API_BASE}/api/menu-editor/${slug}/upload`, {
      method: 'POST',
      headers: { 'x-menu-token': token },
      body: formData
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      return res.status(uploadRes.status).json(err);
    }

    const result = await uploadRes.json();
    res.status(200).json({ url: result.url, name: file.originalFilename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
