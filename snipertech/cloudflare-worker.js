// ================================================================
// Sniper Proxy — Cloudflare Worker
// ໃຊ້ໄດ້ທັງ Claude + OpenAI + Gemini + FCM Push
// ================================================================
// Environment Variables:
//   ANTHROPIC_API_KEY  = sk-ant-xxxxxxxx
//   OPENAI_API_KEY     = sk-proj-xxxxxxxx
//   GEMINI_API_KEY     = AIzaSyxxxxxxxx
//   FCM_CLIENT_EMAIL   = firebase-adminsdk-fbsvc@snipertech-c8bfd.iam.gserviceaccount.com
//   FCM_PRIVATE_KEY    = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
// ================================================================

const ALLOWED_ORIGIN = "https://kanhstartup-netizen.github.io";
const FCM_PROJECT_ID = "snipertech-c8bfd";

export default {
  async fetch(request, env) {

    // ── CORS preflight ──────────────────────────────────────────
    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/openai") return cors(await proxyOpenAI(request, env));
      if (url.pathname === "/gemini") return cors(await proxyGemini(request, env));
      if (url.pathname === "/push")   return cors(await sendFCMPush(request, env));
      return cors(await proxyClaude(request, env));
    } catch (err) {
      return cors(new Response(
        JSON.stringify({ error: { message: err.message } }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      ));
    }
  }
};

// ── FCM Push Notification ───────────────────────────────────────
async function sendFCMPush(request, env) {
  if (!env.FCM_CLIENT_EMAIL || !env.FCM_PRIVATE_KEY) {
    return new Response(JSON.stringify({ error: "FCM keys not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const { tokens, title, body, data } = await request.json();
  if (!tokens || !tokens.length) {
    return new Response(JSON.stringify({ error: "No tokens" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  // Get OAuth2 access token using JWT
  const accessToken = await getFCMAccessToken(env.FCM_CLIENT_EMAIL, env.FCM_PRIVATE_KEY);

  // Send to each token (FCM HTTP v1 sends one at a time)
  const results = await Promise.allSettled(tokens.map(async (token) => {
    const resp = await fetch(
      `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken,
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            webpush: {
              notification: {
                title,
                body,
                icon: "https://kanhstartup-netizen.github.io/snipertech-/snipertech/logo.png",
                badge: "https://kanhstartup-netizen.github.io/snipertech-/snipertech/logo.png",
                tag: "sniper-signal",
                renotify: true,
                requireInteraction: true,
                actions: [
                  { action: "open", title: "📊 ເບິ່ງສັນຍານ" },
                  { action: "close", title: "ປິດ" }
                ]
              },
              fcm_options: {
                link: "https://kanhstartup-netizen.github.io/snipertech-/snipertech/"
              }
            },
            data: data || {}
          }
        })
      }
    );
    return { token: token.slice(0, 20) + "...", status: resp.status, ok: resp.ok };
  }));

  const success = results.filter(r => r.status === "fulfilled" && r.value.ok).length;
  return new Response(
    JSON.stringify({ sent: success, total: tokens.length, results: results.map(r => r.value || r.reason?.message) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

// ── Generate FCM OAuth2 Access Token via JWT ────────────────────
async function getFCMAccessToken(clientEmail, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);

  // Build JWT header + payload
  const header  = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  const payload = btoa(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  })).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");

  // Sign with RS256
  const signingInput = header + "." + payload;
  const pemBody = privateKeyPem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(signingInput));
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");

  const jwt = signingInput + "." + sig;

  // Exchange JWT for access token
  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  const tokenData = await tokenResp.json();
  return tokenData.access_token;
}

// ── Claude proxy ────────────────────────────────────────────────
async function proxyClaude(request, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: { message: "ANTHROPIC_API_KEY not set" } }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  const body = await request.text();
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body,
  });
  const data = await resp.text();
  return new Response(data, { status: resp.status, headers: { "Content-Type": "application/json" } });
}

// ── OpenAI proxy ────────────────────────────────────────────────
async function proxyOpenAI(request, env) {
  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: { message: "OPENAI_API_KEY not set" } }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  const body = await request.text();
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
    body,
  });
  const data = await resp.text();
  return new Response(data, { status: resp.status, headers: { "Content-Type": "application/json" } });
}

// ── Gemini proxy ────────────────────────────────────────────────
async function proxyGemini(request, env) {
  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: { message: "GEMINI_API_KEY not set" } }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  const body = await request.json();
  const contents = (body.messages || []).map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: typeof m.content === "string" ? m.content : m.content.map(c => c.text || "").join("") }]
  }));
  if (body.system) contents.unshift({ role: "user", parts: [{ text: body.system }] });
  const geminiResp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: body.max_tokens || 2048, temperature: body.temperature ?? 0 } }) }
  );
  const gData = await geminiResp.json();
  const text = gData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const converted = { id: "gemini-" + Date.now(), type: "message", role: "assistant", content: [{ type: "text", text }], model: "gemini-1.5-flash", stop_reason: "end_turn", usage: { input_tokens: 0, output_tokens: 0 } };
  return new Response(JSON.stringify(converted), { status: geminiResp.ok ? 200 : geminiResp.status, headers: { "Content-Type": "application/json" } });
}

// ── CORS helper ─────────────────────────────────────────────────
function cors(response) {
  const r = new Response(response.body, response);
  r.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  r.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  r.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return r;
}
