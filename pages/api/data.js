export default async function handler(req, res) {
  res.status(410).json({ error: 'This endpoint is deprecated. Use /api/menu-editor/:slug/save instead.' });
}
