// The coach proxy. The app posts a Messages API body here; this adds the
// Anthropic key from the environment and forwards it, so the key never lives
// on a phone. Set ANTHROPIC_API_KEY in the Vercel project settings.
//
// The header check is not a secret — anyone can read it out of the app — so
// the real protection is the cost ceiling below: a per-address rate limit, a
// cap on how much conversation may be sent, and a cap on the reply length.
// The limiter is per warm instance, which is enough to stop one phone (or one
// script) running up a bill, without needing a store.

const WINDOW_MS = 60 * 60 * 1000;   // an hour
const PER_HOUR = 40;                // asks per address per hour
const PER_MINUTE = 6;               // and a short-burst ceiling
const MAX_BODY_BYTES = 600 * 1024;  // a photo plus a short conversation
const MAX_MESSAGES = 24;

const seen = new Map();             // address -> timestamps

function tooMany(ip, now) {
  const hits = (seen.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  seen.set(ip, hits);
  if (seen.size > 5000) {           // keep the map from growing without bound
    for (const [k, v] of seen) if (!v.some((t) => now - t < WINDOW_MS)) seen.delete(k);
  }
  const lastMinute = hits.filter((t) => now - t < 60 * 1000).length;
  return hits.length > PER_HOUR || lastMinute > PER_MINUTE;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).end(); return; }
  if (req.headers["x-raise-app"] !== "app.tryraise.Raise") { res.status(403).json({ error: "forbidden" }); return; }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (tooMany(ip, Date.now())) {
    res.status(429).json({ error: "That's a lot of questions at once. Give it a minute." });
    return;
  }

  const key = (process.env.ANTHROPIC_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!key) { res.status(503).json({ error: "The coach isn't configured yet." }); return; }

  let body = req.body;
  const raw = typeof body === "string" ? body : JSON.stringify(body || "");
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    res.status(413).json({ error: "That message is too big." });
    return;
  }
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { res.status(400).json({ error: "bad json" }); return; } }
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) { res.status(400).json({ error: "bad request" }); return; }

  body.messages = body.messages.slice(-MAX_MESSAGES);
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
