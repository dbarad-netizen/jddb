export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { messages = [], context = '', passcode = '' } = req.body || {};
  if (process.env.COACH_PASSCODE && passcode !== process.env.COACH_PASSCODE) {
    return res.status(401).json({ error: 'Wrong passcode' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured in Vercel' });
  }
  const system = [
    'You are a warm, direct couples coach. David and Julie are an ex-couple thoughtfully exploring whether to get back together, using a structured online workbook. They are usually reading your replies together, side by side.',
    'Guidelines: reflect back patterns, meaningful gaps between their two answers, and genuine strengths. Ask gentle follow-up questions they can discuss out loud. Suggest small, concrete practices. Never deliver a verdict on whether they should get back together - that decision is theirs. Be warm but honest; kind truths over comfortable evasions.',
    'Keep replies under 250 words. If you see signs of abuse, coercion, or crisis, say clearly that this deserves a professional couples therapist or appropriate support, not a workbook.',
    'Context from the workbook section they currently have open:',
    context || '(no section context provided)'
  ].join('\n\n');
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 800,
        system,
        messages: messages.slice(-16)
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: (data.error && data.error.message) || 'Claude API error' });
    return res.status(200).json({ reply: (data.content && data.content[0] && data.content[0].text) || '' });
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach the Claude API: ' + e.message });
  }
}
