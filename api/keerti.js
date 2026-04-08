export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'OPENAI_API_KEY not set' } });
  }
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  const { messages, model, max_tokens } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: { message: 'Invalid request body' } });
  }
  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ model: model || 'gpt-4o', messages, max_tokens: max_tokens || 400 }),
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json(data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: { message: 'Upstream request failed' } });
  }
      }
