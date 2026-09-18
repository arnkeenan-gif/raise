// The coach proxy. The app posts a Messages API body here; this adds the
// Anthropic key from the environment and forwards it, so the key never
// lives on a phone. Set ANTHROPIC_API_KEY in the Vercel project settings.
module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).end(); return; }
  if (req.headers["x-raise-app"] !== "app.tryraise.Raise") { res.status(403).json({ error: "forbidden" }); return; }
  // Trim: a pasted key often carries a newline, a space or wrapping quotes.
  const key = (process.env.ANTHROPIC_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!key) { res.status(503).json({ error: "The coach isn't configured yet." }); return; }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { res.status(400).json({ error: "bad json" }); return; } }
  if (!body || !Array.isArray(body.messages)) { res.status(400).json({ error: "bad request" }); return; }
  body.max_tokens = Math.min(Number(body.max_tokens) || 600, 1000);
  body.model = "claude-haiku-4-5-20251001";
  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();
    if (upstream.status === 401) {
      res.status(502).json({ error: "The coach key was rejected. Check ANTHROPIC_API_KEY in Vercel." });
      return;
    }
    res.status(upstream.status).setHeader("content-type", "application/json").send(text);
  } catch (e) {
    res.status(502).json({ error: "upstream unreachable" });
  }
};
