// Reports whether the coach key is present and well formed. It never
// returns the key, only its shape, so it is safe to open in a browser.
module.exports = async (req, res) => {
  const raw = process.env.ANTHROPIC_API_KEY || "";
  const key = raw.trim().replace(/^["']|["']$/g, "");
  const shape = {
    set: raw.length > 0,
    length: key.length,
    startsWith_sk_ant: key.startsWith("sk-ant-"),
    hadWhitespaceOrQuotes: raw !== key,
  };
  if (!key) { res.status(200).json({ ok: false, reason: "ANTHROPIC_API_KEY is not set on this deployment", shape }); return; }
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 5, messages: [{ role: "user", content: "hi" }] }),
    });
    res.status(200).json({ ok: r.status === 200, upstreamStatus: r.status, shape });
  } catch (e) {
    res.status(200).json({ ok: false, reason: "could not reach Anthropic", shape });
  }
};
