// functions/api/push.js — Cloudflare Pages Function
// Route: /api/push  (POST)
// Sends FCM push notification to all registered devices

const FCM_PROJECT_ID = "snipertech-c8bfd";
const ALLOWED_ORIGIN = "https://kanhstartup-netizen.github.io";

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    if (!env.FCM_CLIENT_EMAIL || !env.FCM_PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: "FCM keys not set in environment" }), { status: 500, headers: corsHeaders });
    }

    const { tokens, title, body, data } = await request.json();

    if (!tokens || !tokens.length) {
      return new Response(JSON.stringify({ error: "No tokens provided" }), { status: 400, headers: corsHeaders });
    }

    // Get OAuth2 access token
    const accessToken = await getFCMAccessToken(env.FCM_CLIENT_EMAIL, env.FCM_PRIVATE_KEY);

    // Send to all tokens
    const results = await Promise.allSettled(
      tokens.map(token =>
        fetch(`https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`, {
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
        }).then(r => ({ token: token.slice(0, 20) + "...", status: r.status, ok: r.ok }))
      )
    );

    const success = results.filter(r => r.status === "fulfilled" && r.value?.ok).length;
    const failed  = tokens.length - success;

    return new Response(
      JSON.stringify({ success: true, sent: success, failed, total: tokens.length }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}

// ── JWT → OAuth2 Access Token for FCM ──────────────────────────
async function getFCMAccessToken(clientEmail, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);

  const encode = obj =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const header  = encode({ alg: "RS256", typ: "JWT" });
  const payload = encode({
    iss:   clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud:   "https://oauth2.googleapis.com/token",
    iat:   now,
    exp:   now + 3600,
  });

  const signingInput = header + "." + payload;

  // Clean PEM
  const pemBody = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const jwt = signingInput + "." + sig;

  // Exchange JWT → Access Token
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const data = await resp.json();
  if (!data.access_token) throw new Error("FCM token error: " + JSON.stringify(data));
  return data.access_token;
}
