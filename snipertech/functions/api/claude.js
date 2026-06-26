// Cloudflare Pages Function — named exports (correct for Pages, not Workers)
export async function onRequest(context) {
  const { request, env } = context;
  
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key, anthropic-version",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST", method: request.method }), {
      status: 405, headers: { ...cors, "Content-Type": "application/json" }
    });
  }

  if (!env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing ANTHROPIC_API_KEY" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" }
    });
  }

  let body;
  try { body = await request.json(); }
  catch (e) {
    return new Response(JSON.stringify({ error: "Bad JSON: " + e.message }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" }
    });
  }

  if (!body.max_tokens || body.max_tokens > 4096) body.max_tokens = 4096;

  let resp;
  try {
    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Fetch failed: " + e.message }), {
      status: 502, headers: { ...cors, "Content-Type": "application/json" }
    });
  }

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
