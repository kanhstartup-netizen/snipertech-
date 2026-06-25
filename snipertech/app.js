"use strict";
const { useState, useRef, useCallback, useEffect, useMemo, useReducer, useContext } = React;
// Embedded Startup FX logo (black made transparent)
const LOGO = "./logo.png";
// ───────────────────────────────────────────────────────────
// Sniper Desk × Startup FX
// Brand: electric blue on black · multi-TF · news · confluence
// ───────────────────────────────────────────────────────────
// `C` is the LIVE theme object. It is mutated in place by applyTheme()
// so every existing C.x reference picks up the selected theme automatically.
const C = {
    bg: "#05070D",
    bg2: "#0A0E18",
    panel: "#0F1422",
    panel2: "#151B2D",
    line: "#1F2740",
    blue: "#2682FF",
    blueLt: "#7FC0FF",
    cyan: "#A9E0FF",
    glow: "rgba(38,130,255,0.45)",
    text: "#EAF1FB",
    mut: "#8794AE",
    green: "#3FD98A",
    red: "#FF6B6B",
    amber: "#FFC24B",
    wa: "#25D366",
};
// ── Theme registry ──────────────────────────────────────────
// Each theme provides a full palette. green/red/amber/wa are kept
// consistent across most themes so trading signals stay readable.
const SIGNAL = { green: "#3FD98A", red: "#FF6B6B", amber: "#FFC24B", wa: "#25D366" };
const THEMES = {
    blue: {
        name: "⚡ Electric Blue", emoji: "⚡", swatch: "#2682FF",
        p: { bg: "#05070D", bg2: "#0A0E18", panel: "#0F1422", panel2: "#151B2D", line: "#1F2740",
            blue: "#2682FF", blueLt: "#7FC0FF", cyan: "#A9E0FF", glow: "rgba(38,130,255,0.45)",
            text: "#EAF1FB", mut: "#8794AE", ...SIGNAL },
    },
    ai: {
        name: "🤖 AI Neon", emoji: "🤖", swatch: "#9B5CFF",
        p: { bg: "#060418", bg2: "#0C0A24", panel: "#120F2E", panel2: "#1A1640", line: "#2C2660",
            blue: "#9B5CFF", blueLt: "#C9A8FF", cyan: "#6EE7FF", glow: "rgba(155,92,255,0.5)",
            text: "#F2ECFF", mut: "#9A8FC4", green: "#3FD98A", red: "#FF6B9D", amber: "#FFC24B", wa: "#25D366" },
    },
    cute: {
        name: "🌸 Sweet Pink", emoji: "🌸", swatch: "#FF7EB6",
        p: { bg: "#1A0A14", bg2: "#240E1C", panel: "#2E1426", panel2: "#3A1A30", line: "#54264A",
            blue: "#FF7EB6", blueLt: "#FFB3D6", cyan: "#FFD6EC", glow: "rgba(255,126,182,0.5)",
            text: "#FFF0F7", mut: "#D69CBC", green: "#5FE0A6", red: "#FF6B6B", amber: "#FFD36B", wa: "#25D366" },
    },
    men: {
        name: "🐺 Steel Carbon", emoji: "🐺", swatch: "#4DA3FF",
        p: { bg: "#070809", bg2: "#0D0F12", panel: "#13161B", panel2: "#1B1F26", line: "#2A2F38",
            blue: "#4DA3FF", blueLt: "#9CC9FF", cyan: "#B9D6F2", glow: "rgba(77,163,255,0.4)",
            text: "#E8EDF2", mut: "#7E8794", green: "#3FD98A", red: "#FF6B6B", amber: "#FFC24B", wa: "#25D366" },
    },
    gold: {
        name: "👑 Royal Gold", emoji: "👑", swatch: "#E8B341",
        p: { bg: "#0C0A05", bg2: "#14110A", panel: "#1B1710", panel2: "#251F15", line: "#3A301E",
            blue: "#E8B341", blueLt: "#F4D589", cyan: "#FFE9B0", glow: "rgba(232,179,65,0.45)",
            text: "#FBF4E6", mut: "#A99770", green: "#5FD98A", red: "#FF6B6B", amber: "#FFD36B", wa: "#25D366" },
    },
    emerald: {
        name: "💚 Emerald Mint", emoji: "💚", swatch: "#21D9A0",
        p: { bg: "#04100C", bg2: "#071A14", panel: "#0B241B", panel2: "#0F2E23", line: "#1C4A39",
            blue: "#21D9A0", blueLt: "#7FECCB", cyan: "#B0F5E2", glow: "rgba(33,217,160,0.45)",
            text: "#E6FBF4", mut: "#76A99A", green: "#3FD98A", red: "#FF6B6B", amber: "#FFC24B", wa: "#25D366" },
    },
    sunset: {
        name: "🔥 Sunset Coral", emoji: "🔥", swatch: "#FF7A4D",
        p: { bg: "#140806", bg2: "#1E0D0A", panel: "#28130E", panel2: "#341A13", line: "#4E2A1E",
            blue: "#FF7A4D", blueLt: "#FFB089", cyan: "#FFD2BC", glow: "rgba(255,122,77,0.45)",
            text: "#FFF0EA", mut: "#C49A88", green: "#5FE0A6", red: "#FF5B5B", amber: "#FFC24B", wa: "#25D366" },
    },
    light: {
        name: "☀️ Daylight", emoji: "☀️", swatch: "#2682FF",
        p: { bg: "#EEF2F8", bg2: "#FFFFFF", panel: "#FFFFFF", panel2: "#F2F6FC", line: "#D5DEEB",
            blue: "#1F6FE0", blueLt: "#2682FF", cyan: "#0E8FB8", glow: "rgba(31,111,224,0.25)",
            text: "#14213A", mut: "#5C6B86", green: "#16A66B", red: "#E0504F", amber: "#D69412", wa: "#25D366" },
    },
};
const THEME_ORDER = ["blue", "ai", "cute", "men", "gold", "emerald", "sunset", "light"];
const DEFAULT_THEME = "blue";
// Mutate the live C object in place so all existing references update.
function applyTheme(key) {
    const th = THEMES[key] || THEMES[DEFAULT_THEME];
    Object.assign(C, th.p);
    return key in THEMES ? key : DEFAULT_THEME;
}
// ─────────────────────────────────────────────────────────────
// Academy config — edit freely
// ─────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "8562092694499"; // intl format, no '+'
const WHATSAPP_MSG = "Startup FX — XAU/USD";
// ── Supabase (Phase 2 — Signal History) ──────────────────────
const SUPABASE_URL = "https://wxnejgpbofvywkijfjmx.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bmVqZ3Bib2Z2eXdraWpmam14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDc1MjMsImV4cCI6MjA5Nzk4MzUyM30.pfw4ZcUUiEop5gi6K0F6rCs4-MmO5b_tmM9B4Fpa7yM";
const sbFetch = (path, opts={}) => fetch(SUPABASE_URL + path, { ...opts, headers: { "apikey": SUPABASE_ANON, "Authorization": "Bearer " + SUPABASE_ANON, "Content-Type": "application/json", "Prefer": "return=representation", ...(opts.headers||{}) } });
// ── Firebase FCM (Phase 3 — Push Notification) ───────────────
const FB_CONFIG = {
    apiKey: "AIzaSyAhPABr48S-MQduuiGU1QGsr-4vLAHLPAQ",
    authDomain: "snipertech-c8bfd.firebaseapp.com",
    projectId: "snipertech-c8bfd",
    storageBucket: "snipertech-c8bfd.firebasestorage.app",
    messagingSenderId: "538937895261",
    appId: "1:538937895261:web:1a8e55bfc34e1b67fde0b4"
};
const FCM_VAPID = "BIJ4e318v32vIuXCg9rpRiN5MBKTQJ2AtvhfqeStyrEHK9bcKpb0IKPz4XkNm9Q1DudciloGKIeL7-ugM4KiGKE";
// FCM token save to Supabase
const saveFcmToken = async (token, email) => {
    try {
        await sbFetch("/rest/v1/fcm_tokens", {
            method: "POST",
            headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
            body: JSON.stringify({ token, email, updated_at: new Date().toISOString() })
        });
    } catch(e) {}
};
// Init FCM after user logs in
const initFCM = async (userEmail) => {
    try {
        if (!("serviceWorker" in navigator) || !("Notification" in window)) return;
        const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
        const { getMessaging, getToken, onMessage } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js");
        const fbApp = getApps().length ? getApps()[0] : initializeApp(FB_CONFIG);
        const messaging = getMessaging(fbApp);
        const swReg = await navigator.serviceWorker.register("./firebase-messaging-sw.js");
        const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
        if (perm !== "granted") return;
        const token = await getToken(messaging, { vapidKey: FCM_VAPID, serviceWorkerRegistration: swReg });
        if (token) await saveFcmToken(token, userEmail);
        // Foreground message handler
        onMessage(messaging, (payload) => {
            const { title, body } = payload.notification || {};
            if (title) new Notification(title, { body, icon: "./logo.png", tag: "sniper-fg" });
        });
    } catch(e) { console.warn("FCM init:", e.message); }
};
const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;
const KCM_REGISTER_URL = "https://auth-login.kcmtrade.com/th/links/go/19137";
const KVB_REGISTER_URL = "https://cnf5g62e6.plusiaa.com";
const KVB_LOGO = "./img1.jpeg";
// Embedded payment assets (QR images + KCM logo)
const QR_USDT = "./img2.jpeg";
const QR_LAK = "./img3.jpeg";
const QR_THB = "./img4.jpeg";
const KCM_LOGO = "./img5.jpeg";
// Subscription: 3-day free trial, then monthly
const TRIAL_DAYS = 3;

// Activation codes — Static fallback codes
const ACTIVATION_CODES = {
    "VIP30":    { days: 30,  plan: "VIP" },
    "VIP365":   { days: 365, plan: "VIP" },
    "SFX2025":  { days: 30,  plan: "VIP" },
    "STARTUP1": { days: 30,  plan: "VIP" },
};

// Google Sheets Web App URL — Admin paste URL here after setup
// Leave empty "" to use only static codes above
const SHEETS_URL = "https://script.google.com/macros/s/AKfycby2V0hiCyTsSpxp1h91U6vW0eyd1sueOhdBhSQLCO7rKSAO261VIW9FrnxYIUChzZem/exec";
const PLANS = [
    { ccy: "LAK", price: "700,000 ກີບ", qr: QR_LAK, label: "ກີບ (LAK)", note: "BCEL One · LAPNet QR" },
    { ccy: "THB", price: "1,000 บาท", qr: QR_THB, label: "บาท (THB)", note: "BCEL One · LAPNet QR" },
    { ccy: "USDT", price: "35 USDT", qr: QR_USDT, label: "USDT (Crypto)", note: "Tron TRC20" },
];
const USDT_ADDRESS = "TPd2aadFBKuKX5Wd6bezGgEsFpuAdKuFVx";
// ── Course: edit these lessons. Use YouTube or Vimeo "embed" URLs. ──
// Academy: replace the placeholder IDs with your real video IDs.
const COURSE_PRICE_USDT = "35"; // also accepts the same QR as membership; price shown is 100$ in copy
const COURSE_LESSONS = [
    { title: "Intro · Market Structure & BOS/CHoCH", dur: "18:24", embed: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { title: "Order Block & Fair Value Gap (FVG)", dur: "22:10", embed: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { title: "Liquidity & Stop Hunt / Sweep", dur: "25:48", embed: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { title: "Premium / Discount + Fibonacci entries", dur: "19:33", embed: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { title: "Order Flow & Displacement", dur: "21:07", embed: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { title: "Full Gold Sniper playbook + risk mgmt", dur: "28:52", embed: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
];
// Admin access is now EMAIL-BASED only (see ADMIN_EMAIL below). Clients never see any
// admin unlock field. The old password constant is kept only so existing references don't break;
// it is no longer used to unlock anything. For real security, verify the admin on a backend.
const ADMIN_PASS = "academy2026"; // (deprecated — not used for unlocking anymore)
// Admin login: sign in with one of these emails (any password 6+) to unlock admin mode automatically.
// Add the owner's real email(s) here. Clients never see admin controls.
const ADMIN_EMAILS = ["admin@startupfx.app", "kanh.startup@gmail.com"];
// Backend endpoint that proxies to Claude (keeps the API key server-side).
// Relative path works automatically on the same Cloudflare Pages site.
// ── Push Notification endpoint (Cloudflare Pages Function) ──────
const PUSH_ENDPOINT = "https://kanhstartup-netizen.github.io/snipertech-/snipertech/api/push";
const CLAUDE_ENDPOINT = "https://sniper-proxy.kanh-startup-602.workers.dev";
const OPENAI_ENDPOINT = "https://sniper-proxy.kanh-startup-602.workers.dev/openai";
const GEMINI_ENDPOINT = "https://sniper-proxy.kanh-startup-602.workers.dev/gemini";
const OPENAI_API_KEY = "";

// ── Multi-AI: call a specific engine ──────────────────────────
async function callAI(engine, body, signal) {
    if (engine === "claude") {
        const r = await fetch(CLAUDE_ENDPOINT, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body), signal
        });
        return r;
    }
    if (engine === "gpt") {
        const msgs = (body.messages || []).map(m => {
            if (typeof m.content === "string") return { role: m.role, content: m.content };
            const parts = m.content.map(c => {
                if (c.type === "text") return { type: "text", text: c.text };
                if (c.type === "image") return { type: "image_url", image_url: { url: "data:" + c.source.media_type + ";base64," + c.source.data } };
                return { type: "text", text: JSON.stringify(c) };
            });
            return { role: m.role, content: parts };
        });
        if (body.system) msgs.unshift({ role: "system", content: body.system });
        const r = await fetch(OPENAI_ENDPOINT, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "gpt-4o", messages: msgs, max_tokens: body.max_tokens || 4096, temperature: body.temperature ?? 0 }),
            signal
        });
        const d = await r.json();
        const text = d.choices?.[0]?.message?.content || "";
        const converted = { id: d.id || "gpt-"+Date.now(), type: "message", role: "assistant",
            content: [{ type: "text", text }], model: d.model || "gpt-4o", stop_reason: "end_turn",
            usage: { input_tokens: d.usage?.prompt_tokens || 0, output_tokens: d.usage?.completion_tokens || 0 } };
        return new Response(JSON.stringify(converted), { status: r.ok ? 200 : r.status, headers: { "Content-Type": "application/json" } });
    }
    if (engine === "gemini") {
        const r = await fetch(GEMINI_ENDPOINT, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body), signal
        });
        return r;
    }
    throw new Error("unknown_engine");
}
// Kept for backward-compat (news tab etc.)
async function callWithFallback(body, signal) {
    return callAI("claude", body, signal);
}
const ADMIN_EMAIL = ADMIN_EMAILS[0]; // kept for backward-compat references
const isAdminEmail = (email) => !!email && ADMIN_EMAILS.some((a) => a.toLowerCase() === String(email).trim().toLowerCase());
const REFERRAL_PCT = 20; // % the referrer earns from each monthly payment (edit freely)
const WITHDRAW_MIN = 10; // minimum USDT withdrawal
// ── Free self-learning resources (curated, real links) ──
// Grouped by level. Academy can add/remove freely.
// ── In-house free lessons (read directly in the app, no external links) ──
// Each lesson has: id, icon, level, and multilingual {lo, th, en} content.
// Content fields: title, minutes, intro, sections[{h, p}], highlights[], summary.
// "img" is an inline SVG illustration key rendered by <LessonArt/>.
const FREE_LESSONS = [
    {
        id: "structure", icon: "🧭", level: "basics", art: "structure", free: true,
        lo: {
            title: "ໂຄງສ້າງຕະຫຼາດ (Market Structure)",
            minutes: 6,
            intro: "ໂຄງສ້າງຕະຫຼາດ ຄືພື້ນຖານທີ່ສຳຄັນທີ່ສຸດ. ມັນບອກໃຫ້ເຮົາຮູ້ວ່າ ຕະຫຼາດກຳລັງ ຂຶ້ນ, ລົງ ຫຼື ອອກຂ້າງ ກ່ອນທີ່ເຮົາຈະຕັດສິນໃຈເຂົ້າເທຣດ.",
            sections: [
                { h: "ແນວໂນ້ມຂາຂຶ້ນ (Uptrend)", p: "ລາຄາສ້າງ ຈຸດສູງໃໝ່ສູງຂຶ້ນ (Higher High) ແລະ ຈຸດຕ່ຳໃໝ່ສູງຂຶ້ນ (Higher Low) ຕໍ່ເນື່ອງ. ເມື່ອເຫັນແບບນີ້ ໃຫ້ຫາໂອກາດ ຊື້ (Buy) ເປັນຫຼັກ." },
                { h: "ແນວໂນ້ມຂາລົງ (Downtrend)", p: "ລາຄາສ້າງ ຈຸດສູງໃໝ່ຕ່ຳລົງ (Lower High) ແລະ ຈຸດຕ່ຳໃໝ່ຕ່ຳລົງ (Lower Low). ເມື່ອເຫັນແບບນີ້ ໃຫ້ຫາໂອກາດ ຂາຍ (Sell) ເປັນຫຼັກ." },
                { h: "ການປ່ຽນໂຄງສ້າງ (BOS & CHoCH)", p: "BOS (Break of Structure) ຄືລາຄາທະລຸຈຸດເກົ່າໄປຕາມທິດເດີມ ຢືນຢັນແນວໂນ້ມ. CHoCH (Change of Character) ຄືສັນຍານທຳອິດທີ່ບອກວ່າ ແນວໂນ້ມອາດກຳລັງຈະປ່ຽນທິດ." },
            ],
            highlights: [
                "ຢ່າເທຣດສວນແນວໂນ້ມ — ໄປຕາມທິດທາງຫຼັກສະເໝີ.",
                "Higher High + Higher Low = ຂາຂຶ້ນ. Lower High + Lower Low = ຂາລົງ.",
                "CHoCH ເຕືອນກ່ອນ, BOS ຢືນຢັນ.",
            ],
            summary: "ກ່ອນເຂົ້າເທຣດທຸກຄັ້ງ ໃຫ້ຖາມຕົວເອງ: ຕອນນີ້ໂຄງສ້າງເປັນ ຂາຂຶ້ນ, ຂາລົງ ຫຼື ອອກຂ້າງ? ເທຣດໄປຕາມໂຄງສ້າງ ຈະເພີ່ມໂອກາດຊະນະຫຼາຍຂຶ້ນ.",
        },
        th: {
            title: "โครงสร้างตลาด (Market Structure)",
            minutes: 6,
            intro: "โครงสร้างตลาดคือพื้นฐานที่สำคัญที่สุด มันบอกเราว่าตลาดกำลัง ขึ้น ลง หรือ ออกข้าง ก่อนที่เราจะตัดสินใจเข้าเทรด",
            sections: [
                { h: "แนวโน้มขาขึ้น (Uptrend)", p: "ราคาสร้าง จุดสูงใหม่สูงขึ้น (Higher High) และ จุดต่ำใหม่สูงขึ้น (Higher Low) ต่อเนื่อง เมื่อเห็นแบบนี้ให้หาโอกาส ซื้อ (Buy) เป็นหลัก" },
                { h: "แนวโน้มขาลง (Downtrend)", p: "ราคาสร้าง จุดสูงใหม่ต่ำลง (Lower High) และ จุดต่ำใหม่ต่ำลง (Lower Low) เมื่อเห็นแบบนี้ให้หาโอกาส ขาย (Sell) เป็นหลัก" },
                { h: "การเปลี่ยนโครงสร้าง (BOS & CHoCH)", p: "BOS (Break of Structure) คือราคาทะลุจุดเดิมไปตามทิศทางเดิม ยืนยันแนวโน้ม CHoCH (Change of Character) คือสัญญาณแรกที่บอกว่าแนวโน้มอาจกำลังจะเปลี่ยนทิศ" },
            ],
            highlights: [
                "อย่าเทรดสวนแนวโน้ม — ไปตามทิศทางหลักเสมอ",
                "Higher High + Higher Low = ขาขึ้น, Lower High + Lower Low = ขาลง",
                "CHoCH เตือนก่อน, BOS ยืนยัน",
            ],
            summary: "ก่อนเข้าเทรดทุกครั้ง ให้ถามตัวเอง: ตอนนี้โครงสร้างเป็น ขาขึ้น ขาลง หรือ ออกข้าง? เทรดไปตามโครงสร้างจะเพิ่มโอกาสชนะมากขึ้น",
        },
        en: {
            title: "Market Structure",
            minutes: 6,
            intro: "Market structure is the most important foundation. It tells us whether the market is trending up, down, or ranging — before we decide to enter a trade.",
            sections: [
                { h: "Uptrend", p: "Price makes Higher Highs and Higher Lows in sequence. When you see this, look mainly for Buy opportunities." },
                { h: "Downtrend", p: "Price makes Lower Highs and Lower Lows. When you see this, look mainly for Sell opportunities." },
                { h: "Structure shift (BOS & CHoCH)", p: "BOS (Break of Structure) is price breaking a prior point in the same direction, confirming the trend. CHoCH (Change of Character) is the first sign that the trend may be about to reverse." },
            ],
            highlights: [
                "Don't trade against the trend — always go with the main direction.",
                "Higher High + Higher Low = uptrend. Lower High + Lower Low = downtrend.",
                "CHoCH warns first, BOS confirms.",
            ],
            summary: "Before every trade, ask yourself: is the structure currently up, down, or ranging? Trading with the structure greatly improves your win rate.",
        },
    },
    {
        id: "orderblock", icon: "🟦", level: "smc", art: "orderblock", free: true,
        lo: {
            title: "Order Block & Fair Value Gap (FVG)",
            minutes: 7,
            intro: "Order Block ແລະ FVG ຄືບ່ອນທີ່ເງິນໃຫຍ່ (ສະຖາບັນ) ເຂົ້າຕະຫຼາດ. ມັນເປັນ 'ໂຊນເຂົ້າເທຣດ' ທີ່ມີຄຸນນະພາບ ສຳລັບການ ຊື້/ຂາຍ.",
            sections: [
                { h: "Order Block ຄືຫຍັງ?", p: "ຄືແທ່ງທຽນ ສຸດທ້າຍ ກ່ອນທີ່ລາຄາຈະພຸ່ງແຮງໄປທິດໜຶ່ງ. ແທ່ງນັ້ນຄືບ່ອນທີ່ສະຖາບັນຕັ້ງຄຳສັ່ງໄວ້. ເມື່ອລາຄາກັບມາແຕະໂຊນນີ້ ມັກຈະເດັ້ງກັບ." },
                { h: "Fair Value Gap (FVG)", p: "ຄືຊ່ອງຫວ່າງລະຫວ່າງ 3 ແທ່ງທຽນ ທີ່ລາຄາພຸ່ງໄວຈົນເຫຼືອ 'ຊ່ອງວ່າງ'. ຕະຫຼາດມັກຈະກັບມາ ຕື່ມຊ່ອງ (fill) ນີ້ ກ່ອນໄປຕໍ່." },
                { h: "ວິທີໃຊ້", p: "ລໍຖ້າລາຄາກັບມາທີ່ Order Block ຫຼື FVG ໃນທິດທາງດຽວກັບແນວໂນ້ມ ແລ້ວຈຶ່ງຫາສັນຍານຢືນຢັນ (ເຊັ່ນ CHoCH ນ້ອຍໆ) ກ່ອນເຂົ້າ." },
            ],
            highlights: [
                "Order Block = ແທ່ງສຸດທ້າຍກ່ອນລາຄາພຸ່ງແຮງ.",
                "FVG = ຊ່ອງວ່າງທີ່ລາຄາມັກກັບມາຕື່ມ.",
                "ໃຊ້ໃຫ້ກົງກັບແນວໂນ້ມຫຼັກ ຈຶ່ງມີໂອກາດສູງ.",
            ],
            summary: "Order Block ແລະ FVG ຊ່ວຍໃຫ້ເຮົາ ເຂົ້າເທຣດໃນລາຄາທີ່ດີ ແທນທີ່ຈະໄລ່ຕາມລາຄາ. ລໍຖ້າລາຄາກັບມາໂຊນ ແລ້ວຈຶ່ງເຂົ້າ.",
        },
        th: {
            title: "Order Block & Fair Value Gap (FVG)",
            minutes: 7,
            intro: "Order Block และ FVG คือบริเวณที่เงินใหญ่ (สถาบัน) เข้าตลาด มันเป็น 'โซนเข้าเทรด' ที่มีคุณภาพสำหรับการ ซื้อ/ขาย",
            sections: [
                { h: "Order Block คืออะไร?", p: "คือแท่งเทียน สุดท้าย ก่อนที่ราคาจะพุ่งแรงไปทิศหนึ่ง แท่งนั้นคือบริเวณที่สถาบันวางคำสั่งไว้ เมื่อราคากลับมาแตะโซนนี้มักจะเด้งกลับ" },
                { h: "Fair Value Gap (FVG)", p: "คือช่องว่างระหว่าง 3 แท่งเทียนที่ราคาพุ่งเร็วจนเหลือ 'ช่องว่าง' ตลาดมักกลับมา เติมช่อง (fill) นี้ก่อนไปต่อ" },
                { h: "วิธีใช้", p: "รอราคากลับมาที่ Order Block หรือ FVG ในทิศทางเดียวกับแนวโน้ม แล้วจึงหาสัญญาณยืนยัน (เช่น CHoCH เล็กๆ) ก่อนเข้า" },
            ],
            highlights: [
                "Order Block = แท่งสุดท้ายก่อนราคาพุ่งแรง",
                "FVG = ช่องว่างที่ราคามักกลับมาเติม",
                "ใช้ให้ตรงกับแนวโน้มหลักจึงมีโอกาสสูง",
            ],
            summary: "Order Block และ FVG ช่วยให้เราเข้าเทรดในราคาที่ดี แทนที่จะไล่ตามราคา รอราคากลับมาโซนแล้วจึงเข้า",
        },
        en: {
            title: "Order Block & Fair Value Gap (FVG)",
            minutes: 7,
            intro: "Order Blocks and FVGs are where big money (institutions) enter the market. They are high-quality entry zones for buying and selling.",
            sections: [
                { h: "What is an Order Block?", p: "It is the last candle before price moves sharply in one direction. That candle is where institutions placed orders. When price returns to this zone, it often bounces." },
                { h: "Fair Value Gap (FVG)", p: "It is a gap between 3 candles where price moved so fast it left an imbalance. The market often returns to fill this gap before continuing." },
                { h: "How to use it", p: "Wait for price to return to an Order Block or FVG in the same direction as the trend, then look for a confirmation (like a small CHoCH) before entering." },
            ],
            highlights: [
                "Order Block = the last candle before a strong move.",
                "FVG = a gap price tends to come back and fill.",
                "Use it in line with the main trend for higher odds.",
            ],
            summary: "Order Blocks and FVGs let us enter at good prices instead of chasing. Wait for price to return to the zone, then enter.",
        },
    },
    {
        id: "liquidity", icon: "💧", level: "smc", art: "liquidity", free: false,
        lo: {
            title: "Liquidity & Stop Hunt (ການກວາດ)",
            minutes: 6,
            intro: "ສະຖາບັນຕ້ອງການ 'ສະພາບຄ່ອງ' (liquidity) ເພື່ອເຂົ້າອໍເດີໃຫຍ່. ບ່ອນທີ່ມີຄຳສັ່ງ Stop Loss ຫຼາຍ ຄືບ່ອນທີ່ລາຄາມັກຈະຖືກ 'ກວາດ' ກ່ອນປ່ຽນທິດ.",
            sections: [
                { h: "Liquidity ຢູ່ໃສ?", p: "ມັກຢູ່ ເໜືອຈຸດສູງ (Buy stops) ແລະ ໃຕ້ຈຸດຕ່ຳ (Sell stops) ທີ່ເຫັນໄດ້ຊັດເຈນ. ຍິ່ງມີຄົນວາງ Stop ໄວ້ຫຼາຍ ຍິ່ງເປັນເປົ້າໝາຍ." },
                { h: "Stop Hunt / Sweep", p: "ລາຄາພຸ່ງທະລຸຈຸດສູງ/ຕ່ຳ ໄວໆ ເພື່ອ 'ກິນ' Stop Loss ຂອງລາຍຍ່ອຍ ແລ້ວ ເດັ້ງກັບ ທັນທີ. ນີ້ຄືກັບດັກ ບໍ່ແມ່ນການທະລຸຈິງ." },
                { h: "ໃຊ້ປະໂຫຍດແນວໃດ", p: "ຢ່າຟ້າວໄລ່ຕາມການທະລຸ. ລໍຖ້າເຫັນການ Sweep + ເດັ້ງກັບ ເຂົ້າໂຊນ Discount/Premium ແລ້ວຈຶ່ງເຂົ້າຕາມທິດເດັ້ງ." },
            ],
            highlights: [
                "ຈຸດສູງ/ຕ່ຳທີ່ຊັດເຈນ = ບ່ອນລວມ Stop = ເປົ້າກວາດ.",
                "Sweep ໄວແລ້ວເດັ້ງກັບ = ສັນຍານກັບໂຕທີ່ດີ.",
                "ການທະລຸ 'ປອມ' ມັກເກີດກ່ອນລາຄາໄປທິດກົງກັນຂ້າມ.",
            ],
            summary: "ໃຫ້ຄິດຄືສະຖາບັນ: ເຂົາ ກວາດ Stop ກ່ອນ ແລ້ວຈຶ່ງດັນລາຄາໄປທິດທີ່ຕ້ອງການ. ລໍຖ້າການກວາດ ແລ້ວຄ່ອຍຕາມ.",
        },
        th: {
            title: "Liquidity & Stop Hunt (การกวาด)",
            minutes: 6,
            intro: "สถาบันต้องการ 'สภาพคล่อง' (liquidity) เพื่อเข้าออเดอร์ใหญ่ บริเวณที่มีคำสั่ง Stop Loss เยอะคือที่ที่ราคามักถูก 'กวาด' ก่อนเปลี่ยนทิศ",
            sections: [
                { h: "Liquidity อยู่ไหน?", p: "มักอยู่ เหนือจุดสูง (Buy stops) และ ใต้จุดต่ำ (Sell stops) ที่เห็นชัดเจน ยิ่งมีคนวาง Stop ไว้เยอะยิ่งเป็นเป้าหมาย" },
                { h: "Stop Hunt / Sweep", p: "ราคาพุ่งทะลุจุดสูง/ต่ำเร็วๆ เพื่อ 'กิน' Stop Loss ของรายย่อย แล้ว เด้งกลับ ทันที นี่คือกับดัก ไม่ใช่การทะลุจริง" },
                { h: "ใช้ประโยชน์อย่างไร", p: "อย่ารีบไล่ตามการทะลุ รอเห็นการ Sweep + เด้งกลับ เข้าโซน Discount/Premium แล้วจึงเข้าตามทิศเด้ง" },
            ],
            highlights: [
                "จุดสูง/ต่ำที่ชัดเจน = ที่รวม Stop = เป้ากวาด",
                "Sweep เร็วแล้วเด้งกลับ = สัญญาณกลับตัวที่ดี",
                "การทะลุ 'ปลอม' มักเกิดก่อนราคาไปทิศตรงข้าม",
            ],
            summary: "ให้คิดเหมือนสถาบัน: เขา กวาด Stop ก่อน แล้วจึงดันราคาไปทิศที่ต้องการ รอการกวาดแล้วค่อยตาม",
        },
        en: {
            title: "Liquidity & Stop Hunt (Sweep)",
            minutes: 6,
            intro: "Institutions need liquidity to fill large orders. Areas with many Stop Loss orders are where price often gets 'swept' before reversing.",
            sections: [
                { h: "Where is liquidity?", p: "Usually above obvious highs (Buy stops) and below obvious lows (Sell stops). The more stops resting there, the bigger the target." },
                { h: "Stop Hunt / Sweep", p: "Price spikes through a high/low quickly to 'grab' retail Stop Losses, then snaps back immediately. This is a trap, not a real breakout." },
                { h: "How to use it", p: "Don't chase the breakout. Wait for a sweep + snap-back into a Discount/Premium zone, then enter in the direction of the bounce." },
            ],
            highlights: [
                "Clear highs/lows = pools of stops = sweep targets.",
                "A fast sweep then snap-back = a strong reversal signal.",
                "'Fake' breakouts often happen right before price reverses.",
            ],
            summary: "Think like an institution: they sweep stops first, then push price the way they want. Wait for the sweep, then follow.",
        },
    },
    {
        id: "premdisc", icon: "⚖️", level: "advanced", art: "premdisc", free: false,
        lo: {
            title: "Premium / Discount + Fibonacci",
            minutes: 5,
            intro: "ຫຼັກການງ່າຍໆ: ຊື້ຂອງຖືກ, ຂາຍຂອງແພງ. ໃນຕະຫຼາດ ເຮົາໃຊ້ Fibonacci ເພື່ອຮູ້ວ່າ ລາຄາ ຖືກ (Discount) ຫຼື ແພງ (Premium).",
            sections: [
                { h: "ແບ່ງເຄິ່ງ (50%)", p: "ລາກ Fibonacci ຈາກຈຸດຕ່ຳສຸດ ຫາ ຈຸດສູງສຸດ ຂອງຄື້ນຫຼ້າສຸດ. ເສັ້ນ 50% ຄືຈຸດສົມດຸນ (equilibrium)." },
                { h: "Discount vs Premium", p: "ລາຄາ ຕ່ຳກວ່າ 50% = ໂຊນຖືກ (Discount) → ເໝາະ ຊື້. ລາຄາ ສູງກວ່າ 50% = ໂຊນແພງ (Premium) → ເໝາະ ຂາຍ." },
                { h: "ໂຊນທອງ (OTE)", p: "ໂຊນ Fibonacci 0.62–0.79 ຄືບ່ອນເຂົ້າທີ່ດີທີ່ສຸດ (Optimal Trade Entry) ເມື່ອລວມກັບ Order Block." },
            ],
            highlights: [
                "ຕ່ຳກວ່າ 50% = ຊື້, ສູງກວ່າ 50% = ຂາຍ.",
                "ຢ່າຊື້ໃນໂຊນແພງ, ຢ່າຂາຍໃນໂຊນຖືກ.",
                "0.62–0.79 = ໂຊນເຂົ້າທີ່ດີທີ່ສຸດ.",
            ],
            summary: "Premium/Discount ຊ່ວຍໃຫ້ເຮົາ ບໍ່ເຂົ້າເທຣດໃນລາຄາທີ່ແພງເກີນ ຫຼື ຖືກເກີນ. ໃຫ້ທິດທາງເທຣດ ກົງກັບ ໂຊນ ສະເໝີ.",
        },
        th: {
            title: "Premium / Discount + Fibonacci",
            minutes: 5,
            intro: "หลักการง่ายๆ: ซื้อของถูก ขายของแพง ในตลาดเราใช้ Fibonacci เพื่อรู้ว่าราคา ถูก (Discount) หรือ แพง (Premium)",
            sections: [
                { h: "แบ่งครึ่ง (50%)", p: "ลาก Fibonacci จากจุดต่ำสุด ไป จุดสูงสุด ของคลื่นล่าสุด เส้น 50% คือจุดสมดุล (equilibrium)" },
                { h: "Discount vs Premium", p: "ราคา ต่ำกว่า 50% = โซนถูก (Discount) → เหมาะ ซื้อ ราคา สูงกว่า 50% = โซนแพง (Premium) → เหมาะ ขาย" },
                { h: "โซนทอง (OTE)", p: "โซน Fibonacci 0.62–0.79 คือจุดเข้าที่ดีที่สุด (Optimal Trade Entry) เมื่อรวมกับ Order Block" },
            ],
            highlights: [
                "ต่ำกว่า 50% = ซื้อ, สูงกว่า 50% = ขาย",
                "อย่าซื้อในโซนแพง อย่าขายในโซนถูก",
                "0.62–0.79 = โซนเข้าที่ดีที่สุด",
            ],
            summary: "Premium/Discount ช่วยให้เราไม่เข้าเทรดในราคาที่แพงเกินหรือถูกเกิน ให้ทิศทางเทรดตรงกับโซนเสมอ",
        },
        en: {
            title: "Premium / Discount + Fibonacci",
            minutes: 5,
            intro: "A simple principle: buy cheap, sell expensive. In the market we use Fibonacci to know whether price is cheap (Discount) or expensive (Premium).",
            sections: [
                { h: "The 50% midpoint", p: "Draw Fibonacci from the low to the high of the latest swing. The 50% line is equilibrium." },
                { h: "Discount vs Premium", p: "Price below 50% = Discount zone → good to Buy. Price above 50% = Premium zone → good to Sell." },
                { h: "The golden zone (OTE)", p: "The Fibonacci 0.62–0.79 zone is the Optimal Trade Entry, especially when it lines up with an Order Block." },
            ],
            highlights: [
                "Below 50% = buy, above 50% = sell.",
                "Don't buy in a premium zone, don't sell in a discount zone.",
                "0.62–0.79 = the best entry zone.",
            ],
            summary: "Premium/Discount keeps us from entering at prices that are too expensive or too cheap. Always match trade direction to the zone.",
        },
    },
    {
        id: "risk", icon: "🛡️", level: "advanced", art: "risk", free: false,
        lo: {
            title: "ການຄຸ້ມຄອງຄວາມສ່ຽງ (Risk Management)",
            minutes: 6,
            intro: "ນັກເທຣດທີ່ຢູ່ລອດໄດ້ດົນ ບໍ່ແມ່ນຍ້ອນຊະນະທຸກໄມ້ ແຕ່ຍ້ອນ ຄຸ້ມຄອງຄວາມສ່ຽງເກັ່ງ. ນີ້ຄືສ່ວນສຳຄັນທີ່ສຸດທີ່ຫຼາຍຄົນຂ້າມ.",
            sections: [
                { h: "ສ່ຽງຕໍ່ໄມ້ (Risk per trade)", p: "ຢ່າສ່ຽງເກີນ 1–2% ຂອງທຶນ ຕໍ່ການເທຣດໜຶ່ງຄັ້ງ. ເຖິງແມ່ນເສຍ 5 ໄມ້ຕິດ ບັນຊີກໍຍັງຢູ່ລອດ." },
                { h: "Risk:Reward (RR)", p: "ຫາໄມ້ທີ່ ກຳໄລຫຼາຍກວ່າຄວາມສ່ຽງ ຢ່າງໜ້ອຍ 1:2. ໝາຍຄວາມວ່າ ສ່ຽງ 1 ເພື່ອໄດ້ 2. ເຖິງຊະນະພຽງ 40% ກໍຍັງມີກຳໄລ." },
                { h: "ຕັ້ງ Stop Loss ສະເໝີ", p: "ທຸກໄມ້ຕ້ອງມີ Stop Loss ກ່ອນເຂົ້າ. ວາງໄວ້ ເໜືອ/ໃຕ້ ໂຄງສ້າງ ບໍ່ແມ່ນວາງມົ້ວໆ. ຢ່າຍ້າຍ Stop ໜີຄວາມຈິງ." },
            ],
            highlights: [
                "ສ່ຽງ 1–2% ຕໍ່ໄມ້ ເທົ່ານັ້ນ.",
                "RR ຢ່າງໜ້ອຍ 1:2 ສະເໝີ.",
                "ບໍ່ມີ Stop Loss = ບໍ່ເຂົ້າເທຣດ.",
            ],
            summary: "ການຮັກສາທຶນ ສຳຄັນກວ່າ ການຫາກຳໄລ. ຄຸມຄວາມສ່ຽງໃຫ້ດີ ແລ້ວກຳໄລຈະຕາມມາເອງໃນໄລຍະຍາວ.",
        },
        th: {
            title: "การจัดการความเสี่ยง (Risk Management)",
            minutes: 6,
            intro: "นักเทรดที่อยู่รอดได้นาน ไม่ใช่เพราะชนะทุกไม้ แต่เพราะ จัดการความเสี่ยงเก่ง นี่คือส่วนสำคัญที่สุดที่หลายคนข้าม",
            sections: [
                { h: "เสี่ยงต่อไม้ (Risk per trade)", p: "อย่าเสี่ยงเกิน 1–2% ของทุน ต่อการเทรดหนึ่งครั้ง แม้เสีย 5 ไม้ติดบัญชีก็ยังอยู่รอด" },
                { h: "Risk:Reward (RR)", p: "หาไม้ที่ กำไรมากกว่าความเสี่ยง อย่างน้อย 1:2 หมายความว่าเสี่ยง 1 เพื่อได้ 2 แม้ชนะเพียง 40% ก็ยังมีกำไร" },
                { h: "ตั้ง Stop Loss เสมอ", p: "ทุกไม้ต้องมี Stop Loss ก่อนเข้า วางไว้ เหนือ/ใต้ โครงสร้าง ไม่ใช่วางมั่วๆ อย่าย้าย Stop หนีความจริง" },
            ],
            highlights: [
                "เสี่ยง 1–2% ต่อไม้เท่านั้น",
                "RR อย่างน้อย 1:2 เสมอ",
                "ไม่มี Stop Loss = ไม่เข้าเทรด",
            ],
            summary: "การรักษาทุนสำคัญกว่าการหากำไร คุมความเสี่ยงให้ดี แล้วกำไรจะตามมาเองในระยะยาว",
        },
        en: {
            title: "Risk Management",
            minutes: 6,
            intro: "Traders who survive long-term don't win every trade — they manage risk well. This is the most important part that many people skip.",
            sections: [
                { h: "Risk per trade", p: "Never risk more than 1–2% of your capital on a single trade. Even after 5 losses in a row, your account survives." },
                { h: "Risk:Reward (RR)", p: "Take trades where the reward is bigger than the risk, at least 1:2 — risk 1 to make 2. Even winning just 40% of the time stays profitable." },
                { h: "Always set a Stop Loss", p: "Every trade needs a Stop Loss before entry. Place it above/below structure, not randomly. Never move your stop to avoid reality." },
            ],
            highlights: [
                "Risk only 1–2% per trade.",
                "Always aim for at least 1:2 RR.",
                "No Stop Loss = no trade.",
            ],
            summary: "Protecting capital matters more than chasing profit. Manage risk well and profit follows over the long run.",
        },
    },
    {
        id: "institutional", icon: "🏦", level: "advanced", art: "liquidity", free: false,
        lo: {
            title: "ເທັກນິກສະຖາບັນ & ສອບກອງທຶນ (Prop Firm)",
            minutes: 8,
            intro: "ນີ້ຄືວິທີທີ່ນັກເທຣດລະດັບສະຖາບັນ ແລະ ຄົນທີ່ສອບຜ່ານກອງທຶນ (prop firm) ໃຊ້ຈິງ — ເປັນຄວາມຮູ້ດຽວກັນທີ່ AI ໃນແອັບນີ້ໃຊ້ວິເຄາະ.",
            sections: [
                { h: "ລຳດັບການເທຣດຫຼັກ (Core Sequence)", p: "1) ໝາຍລະດັບ HTF (ຈຸດສູງ/ຕ່ຳເກົ່າ, OB, FVG) → 2) ລໍຖ້າລາຄາມາ ບໍ່ທາຍ → 3) ລໍຖ້າ Sweep (ກວາດ Stop) → 4) ຢືນຢັນ BOS/displacement ໃນ TF ນ້ອຍ → 5) ເຂົ້າທີ່ FVG/OB → 6) ໄປເປົ້າ Liquidity ຕໍ່ໄປ." },
                { h: "ນິໄສຂອງທອງຄຳ", p: "XAU/USD ໄວ ແລະ ກວາດ Stop ແຮງ ມີ wick ຍາວຫຼອກ. ໃຫ້ລໍ ແທ່ງປິດ (body close) ທະລຸລະດັບ ບໍ່ແມ່ນພຽງ wick ຈຶ່ງເຊື່ອ BOS. ໂຊນເຂົ້າຕ້ອງລະອຽດໃນ TF ນ້ອຍ ໃຫ້ SL ສັ້ນ." },
                { h: "ວິທີຕັ້ງ TP ແບບມືອາชีพ", p: "ຕັ້ງ TP ທີ່ Liquidity pool ຕໍ່ໄປ ບໍ່ແມ່ນເລກມົ້ວໆ. ໃຊ້ປິດເປັນຊັ້ນ: TP1 ປິດ ⅓-½ ແລ້ວຍ້າຍ SL ມາเบรกอีเวน, TP2 ກາງ, TP3 ໄກ + ເຫຼືອ runner ນ້ອຍ. ໃຫ້ TP1 ໄດ້ RR ຢ່າງໜ້ອຍ 1:2." },
                { h: "ວິໄນຄວາມສ່ຽງແບບ Prop Firm", p: "ສ່ຽງພຽງ 0.5-1% ຕໍ່ໄມ້, ບໍ່ averaging/martingale, ຢຸດເມື່ອเสีย 2-3 ໄມ້ຕິດ, ເຄົາລົບ daily loss limit. ໄມ້ A+ ໜຶ່ງ ດີກວ່າ ໄມ້ທຳມະດາ 10 ໄມ້. ‘ບໍ່ຜິດດົນ’ ສຳຄັນກວ່າ ‘ຖືກ’." },
            ],
            highlights: [
                "ລໍ Sweep + BOS ກ່ອນເຂົ້າ ສະເໝີ.",
                "Sell ຈาก Premium, Buy ຈาก Discount ເທົ່ານັ້ນ.",
                "TP ທີ່ Liquidity ຕໍ່ໄປ + ປິດເປັນຊັ້ນ.",
                "ສ່ຽງ 0.5-1% — ชนะ 40% ທີ່ RR 1:3 ກໍກຳໄລ.",
            ],
            summary: "ສະຖາບັນ ‘ສ້າງ’ ການເຄື່ອນໄຫວ ບໍ່ໄລ່ຕາມ. ລໍລະດັບ → Sweep → ຢືນຢັນ → ເຂົ້າ → ໄປ Liquidity ຕໍ່ໄປ ພ້ອມວິໄນຄວາມສ່ຽງເຂັ້ມ ຄືກະแจสำคัญ.",
        },
        th: {
            title: "เทคนิคสถาบัน & สอบผ่านกองทุน (Prop Firm)",
            minutes: 8,
            intro: "นี่คือวิธีที่นักเทรดระดับสถาบันและคนที่สอบผ่านกองทุน (prop firm) ใช้จริง — เป็นความรู้เดียวกับที่ AI ในแอปนี้ใช้วิเคราะห์",
            sections: [
                { h: "ลำดับการเทรดหลัก (Core Sequence)", p: "1) มาร์กระดับ HTF (จุดสูง/ต่ำเดิม, OB, FVG) → 2) รอราคามา อย่าทาย → 3) รอ Sweep (กวาด Stop) → 4) ยืนยัน BOS/displacement ใน TF เล็ก → 5) เข้าที่ FVG/OB → 6) ไปเป้า Liquidity ถัดไป" },
                { h: "นิสัยของทองคำ", p: "XAU/USD เร็วและกวาด Stop แรง มี wick ยาวหลอก ให้รอ แท่งปิด (body close) ทะลุระดับ ไม่ใช่แค่ wick จึงเชื่อ BOS โซนเข้าต้องละเอียดใน TF เล็ก ให้ SL สั้น" },
                { h: "วิธีตั้ง TP แบบมืออาชีพ", p: "ตั้ง TP ที่ Liquidity pool ถัดไป ไม่ใช่เลขมั่ว ใช้ปิดเป็นชั้น: TP1 ปิด ⅓-½ แล้วย้าย SL มาเบรกอีเวน, TP2 กลาง, TP3 ไกล + เหลือ runner เล็ก ให้ TP1 ได้ RR อย่างน้อย 1:2" },
                { h: "วินัยความเสี่ยงแบบ Prop Firm", p: "เสี่ยงเพียง 0.5-1% ต่อไม้, ไม่ averaging/martingale, หยุดเมื่อเสีย 2-3 ไม้ติด, เคารพ daily loss limit ไม้ A+ หนึ่งดีกว่าไม้ธรรมดา 10 ไม้ ‘ไม่ผิดนาน’ สำคัญกว่า ‘ถูก’" },
            ],
            highlights: [
                "รอ Sweep + BOS ก่อนเข้าเสมอ",
                "Sell จาก Premium, Buy จาก Discount เท่านั้น",
                "TP ที่ Liquidity ถัดไป + ปิดเป็นชั้น",
                "เสี่ยง 0.5-1% — ชนะ 40% ที่ RR 1:3 ก็กำไร",
            ],
            summary: "สถาบัน ‘สร้าง’ การเคลื่อนไหว ไม่ไล่ตาม รอระดับ → Sweep → ยืนยัน → เข้า → ไป Liquidity ถัดไป พร้อมวินัยความเสี่ยงเข้ม คือกุญแจสำคัญ",
        },
        en: {
            title: "Institutional & Prop-Firm Techniques",
            minutes: 8,
            intro: "This is how institutional traders and funded prop-firm traders actually operate — the same knowledge the AI in this app uses to analyze your charts.",
            sections: [
                { h: "The core sequence", p: "1) Mark HTF levels (prior highs/lows, OB, FVG) → 2) Wait for price to arrive, never predict → 3) Wait for a liquidity sweep (stop hunt) → 4) Confirm BOS/displacement on a lower timeframe → 5) Enter at the FVG/OB → 6) Target the next liquidity pool." },
                { h: "Gold's personality", p: "XAU/USD is fast and hunts stops hard with long misleading wicks. Require a candle BODY close beyond a level (not just a wick) to trust a BOS. Refine the entry on a lower timeframe so the stop stays tight in dollars." },
                { h: "Pro take-profit method", p: "Set TPs at the next liquidity pools, not round guesses. Use tiered partials: TP1 bank ⅓-½ then move SL to break-even, TP2 mid, TP3 far + leave a small runner. Ensure TP1 alone gives at least 1:2 R." },
                { h: "Prop-firm risk discipline", p: "Risk only 0.5-1% per trade, no averaging/martingale, stop after 2-3 losses, respect the daily loss limit. One A+ setup beats ten mediocre ones. 'Not being wrong for long' beats 'being right'." },
            ],
            highlights: [
                "Always wait for a sweep + BOS before entering.",
                "Sell only from premium, buy only from discount.",
                "Target the next liquidity pool, scale out in tiers.",
                "Risk 0.5-1% — 40% wins at 1:3 R is still profitable.",
            ],
            summary: "Institutions engineer moves, they don't chase. Wait for the level → sweep → confirmation → entry → next liquidity pool, paired with strict risk discipline — that's the real edge.",
        },
    },
    {
        id: "candles", icon: "🕯️", level: "basics", art: "candles", free: true,
        lo: {
            title: "ການອ່ານແທ່ງທຽນ (Candlestick)",
            minutes: 6,
            intro: "ແທ່ງທຽນບອກວ່າ ໃຜຊະນະ ລະຫວ່າງຜູ້ຊື້ກັບຜູ້ຂາຍ. ອ່ານໃຫ້ເປັນ ຈະເຫັນສັນຍານກັບໂຕກ່ອນຄົນອື່ນ.",
            sections: [
                { h: "ໂຄງສ້າງຂອງແທ່ງ", p: "ໂຕແທ່ງ (body) = ໄລຍະລາຄາ ເປີດ-ປິດ. ໄສ້ (wick) = ລາຄາສູງສຸດ/ຕ່ຳສຸດທີ່ໄປແຕະ. ໂຕຍາວ = ແຮງຫຼາຍ, ໄສ້ຍາວ = ຖືກປະຕິເສດ." },
                { h: "ແທ່ງກັບໂຕສຳຄັນ", p: "Pin Bar / Hammer (ໄສ້ຍາວດ້ານດຽວ) = ປະຕິເສດລາຄາແຮງ. Engulfing (ແທ່ງກືນແທ່ງກ່ອນ) = ແຮງປ່ຽນຂ້າງ. Doji = ລັງເລ ໃຫ້ລໍຢືນຢັນ." },
                { h: "ໃຊ້ຢູ່ໃສ", p: "ສັນຍານແທ່ງທຽນມີນ້ຳໜັກທີ່ສຸດເມື່ອເກີດຢູ່ ໂຊນສຳຄັນ (OB, supply/demand, ແນວรับ-ແນວຕ້ານ) ບໍ່ແມ່ນກາງอากาศ." },
            ],
            highlights: ["ໂຕຍາວ = ແຮງ, ໄສ້ຍາວ = ຖືກປະຕິເສດ.", "Pin Bar / Engulfing = ສັນຍານກັບໂຕເດັ່ນ.", "ເບິ່ງແທ່ງທີ່ໂຊນສຳຄັນເທົ່ານັ້ນ."],
            summary: "ແທ່ງທຽນຄືພາສາຂອງຕະຫຼาด. ເບິ່ງ body/wick + ຕຳແໜ່ງທີ່ເກີດ ແລ້ວຈະອ່ານແຮງຊື້ແຮງຂາຍออก.",
        },
        th: {
            title: "การอ่านแท่งเทียน (Candlestick)",
            minutes: 6,
            intro: "แท่งเทียนบอก 'ใครชนะ' ระหว่างผู้ซื้อกับผู้ขาย อ่านเป็นจะเห็นสัญญาณกลับตัวก่อนคนอื่น",
            sections: [
                { h: "โครงสร้างแท่ง", p: "ตัวแท่ง (body) = ช่วงเปิด-ปิด ไส้ (wick) = ราคาสูงสุด/ต่ำสุดที่ไปแตะ ตัวยาว = แรงเยอะ, ไส้ยาว = ถูกปฏิเสธ" },
                { h: "แท่งกลับตัวสำคัญ", p: "Pin Bar / Hammer (ไส้ยาวข้างเดียว) = ปฏิเสธราคาแรง Engulfing (แท่งกลืนแท่งก่อน) = แรงเปลี่ยนข้าง Doji = ลังเล รอยืนยัน" },
                { h: "ใช้ตรงไหน", p: "สัญญาณแท่งเทียนมีน้ำหนักที่สุดเมื่อเกิดตรงโซนสำคัญ (OB, supply/demand, แนวรับต้าน) ไม่ใช่กลางอากาศ" },
            ],
            highlights: ["ตัวยาว = แรง, ไส้ยาว = ถูกปฏิเสธ", "Pin Bar / Engulfing = สัญญาณกลับตัวเด่น", "ดูแท่งที่โซนสำคัญเท่านั้น"],
            summary: "แท่งเทียนคือภาษาของตลาด ดูที่ body/wick + ตำแหน่งที่เกิด แล้วจะอ่านแรงซื้อแรงขายออก",
        },
        en: {
            title: "Reading Candlesticks",
            minutes: 6,
            intro: "Candles show who is winning between buyers and sellers. Read them well and you'll spot reversals before others.",
            sections: [
                { h: "Anatomy of a candle", p: "The body = open-to-close range. The wick = the high/low it reached. Long body = strong momentum, long wick = rejection." },
                { h: "Key reversal candles", p: "Pin Bar / Hammer (one long wick) = strong rejection. Engulfing (swallows the prior candle) = momentum shift. Doji = indecision, wait for confirmation." },
                { h: "Where to use them", p: "Candle signals matter most at key zones (OB, supply/demand, support/resistance), not in the middle of nowhere." },
            ],
            highlights: ["Long body = strength, long wick = rejection.", "Pin Bar / Engulfing = strong reversal signals.", "Only trust candles at key zones."],
            summary: "Candles are the market's language. Read the body/wick plus where it forms, and you'll see buying vs selling pressure.",
        },
    },
    {
        id: "supplydemand", icon: "📦", level: "smc", art: "orderblock", free: false,
        lo: {
            title: "Supply & Demand (ໂຊນອຸປະທານ-ອຸປະສงค์)",
            minutes: 7,
            intro: "ໂຊນ Supply/Demand ຄືບ່ອນທີ່ລາຄາເຄີຍພຸ່ງແຮງ — ເປັນຮ່ອງຮอยຂອງຄຳສັ່ງໃຫຍ່ທີ່ຍັງເຫຼືອຢູ່.",
            sections: [
                { h: "Demand zone (ແຮງຊື້)", p: "ບໍລິເວນທີ່ລາຄາເຄີຍເດັ້ງຂຶ້ນແຮງ. ເມື່ອລາຄາກັບລົງມາແຕะ ມັກมีແຮງຊື້ລໍຢູ່ → ຫາจังหวะ Buy." },
                { h: "Supply zone (ແຮງຂາຍ)", p: "ບໍລິເວນທີ່ລາຄາເຄີຍຮ່ວງແຮງ. ເມື່ອລາຄາຂຶ້ນມາແຕະ ມັກມີແຮງຂາຍລໍຢູ່ → ຫາจังหวะ Sell." },
                { h: "ໂຊນສົດ vs ໂຊນใช้แล้ว", p: "ໂຊນທີ່ຍັງບໍ່ຖືກແຕะ (fresh) ແຮງທີ່ສຸດ. ຍິ່ງຖືກແຕະຫຼາຍຄັ້ງ ຍິ່ງອ່ອນລົງ ແລະ ມີໂອกาດທະລຸ." },
            ],
            highlights: ["Demand = ແຮງຊື້ (Buy), Supply = ແຮງຂາຍ (Sell).", "ໂຊນສົດ (fresh) ແຮງທີ່ສຸດ.", "ລວມกับ candle ຢືนยันก่อนเข้า."],
            summary: "Supply/Demand ໃຫ້ກรอบว่าจะ Buy/Sell ຢູ່ໃສ. ລໍລາຄາມາທີ່ໂຊນສົດ + ແທ່ງຢືนยัน ແລ້ວค่อยเข้า.",
        },
        th: {
            title: "Supply & Demand (โซนอุปทาน-อุปสงค์)",
            minutes: 7,
            intro: "โซน Supply/Demand คือบริเวณที่ราคาเคยพุ่งแรง เป็นร่องรอยของคำสั่งใหญ่ที่ยังเหลืออยู่",
            sections: [
                { h: "Demand zone (แรงซื้อ)", p: "บริเวณที่ราคาเคยเด้งขึ้นแรง เมื่อราคากลับลงมาแตะ มักมีแรงซื้อรออยู่ → หาจังหวะ Buy" },
                { h: "Supply zone (แรงขาย)", p: "บริเวณที่ราคาเคยร่วงแรง เมื่อราคาขึ้นมาแตะ มักมีแรงขายรออยู่ → หาจังหวะ Sell" },
                { h: "โซนสด vs โซนใช้แล้ว", p: "โซนที่ยังไม่ถูกแตะ (fresh) แรงที่สุด ยิ่งถูกแตะหลายครั้ง ยิ่งอ่อนลงและมีโอกาสทะลุ" },
            ],
            highlights: ["Demand = แรงซื้อ (Buy), Supply = แรงขาย (Sell)", "โซนสด (fresh) แรงที่สุด", "รวมกับ candle ยืนยันก่อนเข้า"],
            summary: "Supply/Demand ให้กรอบว่าจะ Buy/Sell ตรงไหน รอราคามาที่โซนสด + แท่งยืนยัน แล้วค่อยเข้า",
        },
        en: {
            title: "Supply & Demand Zones",
            minutes: 7,
            intro: "Supply/Demand zones are areas where price moved sharply before — footprints of large orders still resting there.",
            sections: [
                { h: "Demand zone (buyers)", p: "An area price rallied from strongly. When price returns, buyers often wait there → look for Buys." },
                { h: "Supply zone (sellers)", p: "An area price dropped from strongly. When price rises back, sellers often wait there → look for Sells." },
                { h: "Fresh vs used zones", p: "Untouched (fresh) zones are strongest. The more a zone is tapped, the weaker it gets and the likelier it breaks." },
            ],
            highlights: ["Demand = buyers (Buy), Supply = sellers (Sell).", "Fresh zones are strongest.", "Combine with a confirmation candle before entry."],
            summary: "Supply/Demand frames where to Buy/Sell. Wait for price to reach a fresh zone with a confirmation candle, then enter.",
        },
    },
    {
        id: "trendline", icon: "📐", level: "basics", art: "structure", free: false,
        lo: {
            title: "ເສັ້ນແນວໂນ້ມ & ແນວรับແນວຕ້ານ",
            minutes: 5,
            intro: "ເຄື່ອງມືພื้นฐานที่ทรงพลัง: ເສັ້ນແນວໂນ້ມ (trendline) ແລະ ແນວรับ-ແນວຕ້ານ ຊ່ວຍບອກທິດ ແລະ ຈຸດກັບໂຕ.",
            sections: [
                { h: "ເສັ້ນແນວໂນ້ມ (Trendline)", p: "ລາກເຊື່ອມຈຸດຕ່ຳທີ່ສູງຂຶ້ນ (ຂາຂຶ້ນ) ຫຼື ຈຸດສູງທີ່ຕ່ຳລົງ (ຂາລົງ). ຍິ່ງລາຄາແຕະເສັ້ນຫຼາຍຄັ້ງໂດຍບໍ່ທະລຸ ເສັ້ນຍິ່ງແຂງແຮง." },
                { h: "ແນວรับ-ແນວຕ້ານ", p: "ແນວรับ = ລາຄາທີ່ມັກເດັ້ງຂຶ້ນ, ແນວຕ້ານ = ລາຄາທີ່ມັກຖືກກົດ. ເມື່ອທະລຸແນວຕ້ານ ມັນມັກກາຍເປັນແນວรับใหม่ (ແລະ ກັບກັນ)." },
                { h: "ການທະລຸ (Breakout)", p: "ລໍ ແທ່ງปิด ທະລຸจริง ບໍ່ແມ່ນพຽງໄສ້. ລະວັງ fake breakout — ລໍ retest ເສັ້ນເກົ່າກ່ອນເຂົ້າຈะปลอดภัยกว่า." },
            ],
            highlights: ["ເສັ້ນທີ່ຖືກແຕະຫຼາຍຄັ້ງ = ແຂງແຮง.", "ແນວຕ້ານທີ່ທະລຸ → ກາຍເປັນແນວรับ.", "ລໍ retest ຫຼັງ breakout ปลอดภัยกว่า."],
            summary: "ເສັ້ນແນວໂນ້ມ ແລະ ແນວรับຕ້ານ ໃຫ້ໂຄງສ້າງง่ายๆ ທີ່ໃຊ້ໄດ້จริง. ລວມกับ price action ເພື່ອจังหวะเข้าที่ดี.",
        },
        th: {
            title: "เส้นแนวโน้ม & แนวรับแนวต้าน",
            minutes: 5,
            intro: "เครื่องมือพื้นฐานที่ทรงพลัง: เส้นแนวโน้ม (trendline) และแนวรับ-แนวต้าน ช่วยบอกทิศและจุดกลับตัว",
            sections: [
                { h: "เส้นแนวโน้ม (Trendline)", p: "ลากเชื่อมจุดต่ำที่สูงขึ้น (ขาขึ้น) หรือจุดสูงที่ต่ำลง (ขาลง) ยิ่งราคาแตะเส้นหลายครั้งโดยไม่ทะลุ เส้นยิ่งแข็งแรง" },
                { h: "แนวรับ-แนวต้าน", p: "แนวรับ = ราคาที่มักเด้งขึ้น แนวต้าน = ราคาที่มักถูกกด เมื่อทะลุแนวต้าน มันมักกลายเป็นแนวรับใหม่ (และกลับกัน)" },
                { h: "การทะลุ (Breakout)", p: "รอ แท่งปิด ทะลุจริง ไม่ใช่แค่ไส้ ระวัง fake breakout — รอ retest เส้นเดิมก่อนเข้าจะปลอดภัยกว่า" },
            ],
            highlights: ["เส้นที่ถูกแตะหลายครั้ง = แข็งแรง", "แนวต้านที่ทะลุ → กลายเป็นแนวรับ", "รอ retest หลัง breakout ปลอดภัยกว่า"],
            summary: "เส้นแนวโน้มและแนวรับต้านให้โครงสร้างง่ายๆ ที่ใช้ได้จริง รวมกับ price action เพื่อจังหวะเข้าที่ดี",
        },
        en: {
            title: "Trendlines & Support/Resistance",
            minutes: 5,
            intro: "Simple but powerful tools: trendlines and support/resistance help define direction and reversal points.",
            sections: [
                { h: "Trendlines", p: "Connect rising lows (uptrend) or falling highs (downtrend). The more times price touches without breaking, the stronger the line." },
                { h: "Support & Resistance", p: "Support = price tends to bounce up; resistance = price tends to get capped. A broken resistance often becomes new support (and vice versa)." },
                { h: "Breakouts", p: "Wait for a candle CLOSE through the level, not just a wick. Beware fake breakouts — waiting for a retest is safer." },
            ],
            highlights: ["A line touched many times = strong.", "Broken resistance → becomes support.", "Waiting for a retest after a breakout is safer."],
            summary: "Trendlines and S/R give a simple, real structure. Combine them with price action for good entries.",
        },
    },
    {
        id: "fibonacci", icon: "🌀", level: "advanced", art: "premdisc", free: false,
        lo: {
            title: "Fibonacci ໃຊ້ຈິງແບບມືອາชีพ",
            minutes: 6,
            intro: "Fibonacci ບໍ່ແມ່ນເວດมนตร์ ແຕ່ເປັນແຜนที่ของ ລາຄາທີ່ຕະຫຼາດມັກກັບມາ. ໃຊ້คู่กับ structure ຈະແມ່ນຂຶ້ນຫຼາຍ.",
            sections: [
                { h: "ລະດັບສຳຄັນ", p: "0.5 ແລະ 0.618 = ຈຸດย่อตัวที่ตลาดชอบกลับตัว. 0.705-0.79 = ໂຊນ OTE (ເຂົ້າດີສຸด). ສ່ວນ 0 ແລະ 1 ຄືต้นและปลายคลื่น." },
                { h: "ວິທີລາກທີ່ຖືກ", p: "ລາກจาก swing low → swing high (ຂາຂຶ້ນ) ຫຼື ກັບກັນ. ໃຊ້ຄື້ນທີ່ สะอาด ຊັດເຈນ ບໍ່ແມ່ນລາກมั่ว." },
                { h: "ລວມກັບ Confluence", p: "Fib ຈະແມ່ນທີ່ສຸດເມື່ອລະດັບມັນທັບກັບ OB / FVG / ແນວรับต้าน — ນັ້ນຄືຈຸດເຂົ້າคุณภาพสูง." },
            ],
            highlights: ["0.618 ແລະ OTE 0.705-0.79 = ໂຊນເຂົ້າເດັ່ນ.", "ລາກจาก swing ທີ່ສະອາດເທົ່ານັ້ນ.", "Fib ທັບ OB/FVG = ຈຸດເຂົ້າคุณภาพ."],
            summary: "Fibonacci ຊ່ວຍຫາ ລາຄາທີ່ດີ ໃນการเข้า. ໃຊ້คู่ structure + OB ສະເໝີ ຢ່າໃຊ້ດ່ຽວໆ.",
        },
        th: {
            title: "Fibonacci ใช้จริงแบบมืออาชีพ",
            minutes: 6,
            intro: "Fibonacci ไม่ใช่เวทมนตร์ แต่เป็นแผนที่ของ 'ราคาที่ตลาดมักกลับมา' ใช้คู่กับ structure จะแม่นขึ้นมาก",
            sections: [
                { h: "ระดับที่สำคัญ", p: "0.5 และ 0.618 = จุดย่อตัวที่ตลาดชอบกลับตัว 0.705-0.79 = โซน OTE (เข้าที่ดีสุด) ส่วน 0 และ 1 คือต้นและปลายคลื่น" },
                { h: "วิธีลากที่ถูก", p: "ลากจาก swing low → swing high (ขาขึ้น) หรือกลับกัน ใช้คลื่นที่ 'สะอาด' ชัดเจน ไม่ใช่ลากมั่ว" },
                { h: "รวมกับ Confluence", p: "Fib จะแม่นที่สุดเมื่อระดับมันทับกับ OB / FVG / แนวรับต้าน — นั่นคือจุดเข้าคุณภาพสูง" },
            ],
            highlights: ["0.618 และ OTE 0.705-0.79 = โซนเข้าเด่น", "ลากจาก swing ที่สะอาดเท่านั้น", "Fib ทับ OB/FVG = จุดเข้าคุณภาพ"],
            summary: "Fibonacci ช่วยหา 'ราคาที่ดี' ในการเข้า ใช้คู่ structure + OB เสมอ อย่าใช้เดี่ยวๆ",
        },
        en: {
            title: "Fibonacci Like a Pro",
            minutes: 6,
            intro: "Fibonacci isn't magic — it's a map of prices the market tends to return to. Paired with structure, it gets far more accurate.",
            sections: [
                { h: "Key levels", p: "0.5 and 0.618 = retracement points the market loves to reverse from. 0.705-0.79 = the OTE (best entry) zone. 0 and 1 are the wave's start and end." },
                { h: "Drawing it right", p: "Draw from swing low → swing high (uptrend) or vice versa. Use clean, obvious swings — not random ones." },
                { h: "Stack confluence", p: "Fib is sharpest when its levels overlap an OB / FVG / S&R — that's a high-quality entry." },
            ],
            highlights: ["0.618 and OTE 0.705-0.79 = prime entry zones.", "Only draw from clean swings.", "Fib overlapping OB/FVG = quality entry."],
            summary: "Fibonacci helps find a good entry price. Always pair it with structure + OB; never use it alone.",
        },
    },
    {
        id: "mtf", icon: "🔭", level: "smc", art: "structure", free: false,
        lo: {
            title: "ວິເຄາະຫຼາຍ Timeframe (Top-Down)",
            minutes: 6,
            intro: "ມືອາชีพບໍ່ເບິ່ງ TF ດຽວ. ເຂົາໄລ່จากใหญ่ไปเล็ก (top-down) ເພື່ອເທຣดตามทิศเงินใหญ่ ແລະ ເຂົ້າໃຫ້ແມ່ນ.",
            sections: [
                { h: "TF ໃຫຍ່ = ທິດທາງ", p: "D1/H4 ບອກ bias ຫຼັກ (ຂຶ້ນ/ລົງ) ແລະ ໂຊນສຳຄັນ (HTF OB, supply/demand). ຫ້າມສວນທິດນີ້." },
                { h: "TF ກາງ = จังหวะ", p: "H1/M15 ຫາວ່າລາຄາກຳລັງເຂົ້າໃກ້ໂຊນຂອງ TF ໃຫຍ່ບໍ ແລະ ເລີ່ມມີ sweep/CHoCH ຫຼືຍັງ." },
                { h: "TF ນ້ອຍ = ຈຸດເຂົ້າ", p: "M5/M1 ໃຊ້ຫາ entry ທີ່ແມ່น (OB/FVG ນ້ອຍ + ແທ່ງຢືนยัน) ເຮັດໃຫ້ SL ສັ້ນແຕ່ທິດຕรงกับเงินใหญ่." },
            ],
            highlights: ["ໃຫຍ່ບອກທິດ, ກາງບອກจังหวะ, ນ້ອຍບອกຈຸດເຂົ້າ.", "ຫ້າມສວນ bias ຂອງ TF ໃຫຍ່.", "ເຂົ້າ TF ນ້ອຍ = SL ສັ້ນ RR ດີ."],
            summary: "Top-down ຄືຫົວໃຈຂອງການເທຣดสถาบัน: ເທຣดตามทิศ HTF, ເຂົ້າແມ່ນທີ່ LTF. RR ຈະດີຂຶ້ນຊັດເຈນ.",
        },
        th: {
            title: "วิเคราะห์หลาย Timeframe (Top-Down)",
            minutes: 6,
            intro: "มืออาชีพไม่ดู TF เดียว เขาไล่จากใหญ่ไปเล็ก (top-down) เพื่อเทรดตามทิศเงินใหญ่ และเข้าให้แม่น",
            sections: [
                { h: "TF ใหญ่ = ทิศทาง", p: "D1/H4 บอก bias หลัก (ขึ้น/ลง) และโซนสำคัญ (HTF OB, supply/demand) ห้ามสวนทิศนี้" },
                { h: "TF กลาง = จังหวะ", p: "H1/M15 หาว่าราคากำลังเข้าใกล้โซนของ TF ใหญ่ไหม และเริ่มมี sweep/CHoCH หรือยัง" },
                { h: "TF เล็ก = จุดเข้า", p: "M5/M1 ใช้หา entry ที่แม่น (OB/FVG เล็ก + แท่งยืนยัน) ทำให้ SL สั้นแต่ทิศตรงกับเงินใหญ่" },
            ],
            highlights: ["ใหญ่บอกทิศ, กลางบอกจังหวะ, เล็กบอกจุดเข้า", "ห้ามสวน bias ของ TF ใหญ่", "เข้า TF เล็ก = SL สั้น RR ดี"],
            summary: "Top-down คือหัวใจของการเทรดสถาบัน: เทรดตามทิศ HTF, เข้าแม่นที่ LTF RR จะดีขึ้นชัดเจน",
        },
        en: {
            title: "Multi-Timeframe (Top-Down) Analysis",
            minutes: 6,
            intro: "Pros don't look at one timeframe — they go top-down, trading with big-money direction and entering precisely.",
            sections: [
                { h: "Higher TF = direction", p: "D1/H4 give the main bias (up/down) and key zones (HTF OB, supply/demand). Never trade against this." },
                { h: "Mid TF = timing", p: "H1/M15 check whether price is approaching the higher-TF zone and whether a sweep/CHoCH has started." },
                { h: "Lower TF = entry", p: "M5/M1 find the precise entry (small OB/FVG + confirmation candle), keeping the stop tight while aligned with big money." },
            ],
            highlights: ["Higher = direction, mid = timing, lower = entry.", "Never fight the higher-TF bias.", "Entering on lower TF = tight SL, better RR."],
            summary: "Top-down is the heart of institutional trading: trade the HTF direction, enter precisely on the LTF. RR improves clearly.",
        },
    },
    {
        id: "session", icon: "🌍", level: "smc", art: "liquidity", free: false,
        lo: {
            title: "Session & Killzone (ເວລາທອງ)",
            minutes: 5,
            intro: "ທອງຄຳເຄື່ອນໄຫວແຮງສະເພາະບາງຊ່ວງເວລາ. ຮູ້ ເວລາທອງ ຈະເທຣดน้อยลงแต่ได้มากขึ้น.",
            sections: [
                { h: "London (ບ່າຍ)", p: "ຊ່ວງເປີດລອນดอน ເປັນຊ່ວງທີ່ທອງແລ່ນແຮງ ມີ sweep ແລະ move ຫຼັກຂອງມື້บ่อย." },
                { h: "New York (ກາງຄືນ)", p: "ເປີດ NY ທັບກັບລອນดอน = volume ສູງສຸด. ຂ່າວສະຫະรัฐส่วนใหญ่ออกช่วงนี้ ລະວັງความผันผวน." },
                { h: "Asian (ເຊົ້າ-ສາຍ)", p: "ຊ່ວງເອເຊຍມັກນິ່ງ ສ້າງ range ແຄບ ໃຊ້ดักหา liquidity ໄວ້ໃຫ້ London/NY ມາກວາด." },
            ],
            highlights: ["London & NY open = ເວລາທອງຂອງທອງ.", "Asian range = ແຫຼ່ງ liquidity.", "ເລี่ยงเทรดช่วงตลาดเงียบ."],
            summary: "ເທຣดถูกเวลา = ເຄິ່ງໜຶ່ງຂອງຄວາມສຳເລັດ. ເນັ້ນ killzone London/NY ແລ້ວคุณภาพสัญญาณจะสูงขึ้น.",
        },
        th: {
            title: "Session & Killzone (เวลาทอง)",
            minutes: 5,
            intro: "ทองคำเคลื่อนไหวแรงเฉพาะบางช่วงเวลา รู้ 'เวลาทอง' จะเทรดน้อยลงแต่ได้มากขึ้น",
            sections: [
                { h: "London (บ่ายไทย)", p: "ช่วงเปิดลอนดอน (~14:00-17:00 เวลาไทย) เป็นช่วงที่ทองวิ่งแรง มี sweep และ move หลักของวันบ่อย" },
                { h: "New York (กลางคืน)", p: "เปิด NY (~19:30-22:30) ทับกับลอนดอน = volume สูงสุด ข่าวสหรัฐส่วนใหญ่ออกช่วงนี้ ระวังความผันผวน" },
                { h: "Asian (เช้า-สาย)", p: "ช่วงเอเชียมักนิ่ง สร้าง range แคบ ใช้ดักหา liquidity ไว้ให้ London/NY มากวาด" },
            ],
            highlights: ["London & NY open = เวลาทองของทอง", "Asian range = แหล่ง liquidity", "เลี่ยงเทรดช่วงตลาดเงียบ"],
            summary: "เทรดถูกเวลา = ครึ่งหนึ่งของความสำเร็จ เน้น killzone London/NY แล้วคุณภาพสัญญาณจะสูงขึ้น",
        },
        en: {
            title: "Sessions & Killzones (Golden Hours)",
            minutes: 5,
            intro: "Gold only moves strongly in certain windows. Knowing the 'golden hours' means trading less but earning more.",
            sections: [
                { h: "London", p: "The London open is when gold runs hard, with frequent sweeps and the day's main move." },
                { h: "New York", p: "The NY open overlapping London = peak volume. Most US news drops here — watch the volatility." },
                { h: "Asian", p: "The Asian session is usually quiet, building tight ranges that create liquidity for London/NY to sweep." },
            ],
            highlights: ["London & NY opens = gold's golden hours.", "Asian range = a liquidity source.", "Avoid trading dead market hours."],
            summary: "Trading at the right time is half the battle. Focus on London/NY killzones and signal quality rises.",
        },
    },
    {
        id: "psychology", icon: "🧠", level: "advanced", art: "risk", free: false,
        lo: {
            title: "ຈິດຕະວິທະຍາການເທຣด (Mindset)",
            minutes: 7,
            intro: "ລະບົບດີແຄ່ໃດກໍ່ໄຮ້ຄ່າຖ້າໃຈບໍ່ນິ່ງ. 80% ຂອງຄວາມສຳເລັດຄືจิตวิทยา ບໍ່ແມ່ນກລະยุทธ์.",
            sections: [
                { h: "ສັດຕູໂຕจริง: ອາລົມ", p: "ຄວາມໂລບ (ເພີ່ມ lot, ບໍ່ TP), ຄວາມຢ້ານ (ບໍ່ກ້າເຂົ້າ, ປິดเร็ว), revenge trade ຄືສາເຫດທີ່ພອร์ตພັງ ບໍ່ແມ່ນກຣາฟ." },
                { h: "ວິໄນ = ອິສระภาพ", p: "ມີແຜนก่อนเข้าสะเໝี (entry/SL/TP) ແລ້ວเຮັดตามแผน ບໍ່ປ່ຽนกลางคัน. ຍอมรับการขาดทุนເປັນຕົ້ນທຶນທຸระกิจ." },
                { h: "ເທຣดเหมือนนักธุรกิจ", p: "ຄິดเป็นความน่าจะเป็นในระยะยาว. ໄມ້ດຽວບໍ່ສຳຄັນ ສຳຄັນທີ່ทำซ้ำระบบที่มี edge ໄດ້ຢ່າງນິ່ງໆ 100 ໄມ້." },
            ],
            highlights: ["80% ຄືจิตวิทยา ບໍ່ແມ່ນກລะยุทธ์.", "ຫ້າມ revenge trade ເດັດขาด.", "ເຮັดตามแผน = ອິສระภาพ."],
            summary: "ຕະຫຼาดจ่ายเงินให้คนใจนิ่งและมีวินัย. ຄວບຄຸມອາລົມໄດ້ = ຄວບຄຸມພອร์ตได้ ນີ້ຄືທັกษะที่แพงที่สุด.",
        },
        th: {
            title: "จิตวิทยาการเทรด (Mindset)",
            minutes: 7,
            intro: "ระบบดีแค่ไหนก็ไร้ค่าถ้าใจไม่นิ่ง 80% ของความสำเร็จคือจิตวิทยา ไม่ใช่กลยุทธ์",
            sections: [
                { h: "ศัตรูตัวจริง: อารมณ์", p: "ความโลภ (เพิ่ม lot, ไม่ TP), ความกลัว (ไม่กล้าเข้า, ปิดเร็ว), การแก้แค้นตลาด (revenge trade) คือสาเหตุที่พอร์ตพัง ไม่ใช่กราฟ" },
                { h: "วินัย = อิสรภาพ", p: "มีแผนก่อนเข้าเสมอ (entry/SL/TP) แล้วทำตามแผน ไม่เปลี่ยนกลางคัน ยอมรับการขาดทุนเป็นต้นทุนทำธุรกิจ" },
                { h: "เทรดเหมือนนักธุรกิจ", p: "คิดเป็นความน่าจะเป็นในระยะยาว ไม้เดียวไม่สำคัญ สำคัญที่ทำซ้ำระบบที่มี edge ได้อย่างนิ่งๆ 100 ไม้" },
            ],
            highlights: ["80% คือจิตวิทยา ไม่ใช่กลยุทธ์", "ห้าม revenge trade เด็ดขาด", "ทำตามแผน = อิสรภาพ"],
            summary: "ตลาดจ่ายเงินให้คนใจนิ่งและมีวินัย ควบคุมอารมณ์ได้ = ควบคุมพอร์ตได้ นี่คือทักษะที่แพงที่สุด",
        },
        en: {
            title: "Trading Psychology (Mindset)",
            minutes: 7,
            intro: "The best system is worthless if your mind isn't calm. 80% of success is psychology, not strategy.",
            sections: [
                { h: "The real enemy: emotion", p: "Greed (oversizing, no TP), fear (won't enter, closes early), and revenge trades blow accounts — not the charts." },
                { h: "Discipline = freedom", p: "Always have a plan before entry (entry/SL/TP) and follow it without changing mid-trade. Accept losses as a cost of business." },
                { h: "Trade like a businessperson", p: "Think in long-run probabilities. One trade doesn't matter; repeating a system with an edge calmly over 100 trades does." },
            ],
            highlights: ["80% is psychology, not strategy.", "Never revenge trade.", "Following the plan = freedom."],
            summary: "The market pays the calm and disciplined. Control your emotions and you control your account — the most valuable skill.",
        },
    },
    {
        id: "newstrading", icon: "📰", level: "advanced", art: "liquidity", free: false,
        lo: {
            title: "ເທຣดข่าว & DXY ກັບທອງຄຳ",
            minutes: 6,
            intro: "ທອງຄຳອ່ອນไหวต่อข่าวสหรัฐ ແລະ ຄ່າເງินดอลลาร์ຫຼາຍ. ເຂົ້າໃຈຄວາມສຳพันธ์นี้ = ໄດ້ປຽບ ແລະ ເລี่ยงโดนกวาด.",
            sections: [
                { h: "DXY ↔ ທອງ (ສວນທາງ)", p: "ດอลลาร์ขึ้น (DXY up) → ທອງມັກລົງ. ດอลลาร์ลง → ທອງມັກຂຶ້ນ. ເຊັກ DXY ກ່ອນເຂົ້າສະເໝี ຖ້າສວນທາງກັບແຜน ໃຫ້ລະວັງ." },
                { h: "ຂ່າວແຮງທີ່ຕ້ອງຮູ້", p: "FOMC, ดอกเบี้ย Fed, NFP (จ้างงาน), CPI/PCE (เงินเฟ้อ) — ຂ່າວพวกนี้ทำทองวิ่งแรงมากແລະ ຄາດເດົາຍາກ." },
                { h: "ກລະยุทธ์ช่วงข่าว", p: "ມືใหม่: ຢ່າເທຣดก่อน-ระหว่างข่าวแรง (สเปรดกว้าง ໂດนกวาดง่าย). ມືອາชีพ: ລໍຂ່າວออก ລໍ sweep + ໂຄງສ້າງนิ่ง ແລ້ວค่อยตาม." },
            ],
            highlights: ["DXY ຂຶ້ນ = ທອງລົງ (ສວນທາງ).", "FOMC/NFP/CPI = ລະວັງສຸด.", "ມືใหม่เลี่ยงเทรดตอนข่าวแรง."],
            summary: "ຂ່າວ ແລະ DXY ຄືພະລັງเบื้องหลังทอง. ຢ່າເທຣดตาบอด ເຊັກປະຕິທິນຂ່າວ + ທິດ DXY ກ່ອນສະເໝี.",
        },
        th: {
            title: "เทรดข่าว & DXY กับทองคำ",
            minutes: 6,
            intro: "ทองคำอ่อนไหวต่อข่าวสหรัฐและค่าเงินดอลลาร์มาก เข้าใจความสัมพันธ์นี้ = ได้เปรียบ และเลี่ยงโดนกวาด",
            sections: [
                { h: "DXY ↔ ทอง (สวนทาง)", p: "ดอลลาร์ขึ้น (DXY up) → ทองมักลง ดอลลาร์ลง → ทองมักขึ้น เช็ก DXY ก่อนเข้าเสมอ ถ้าสวนทางกับแผน ให้ระวัง" },
                { h: "ข่าวแรงที่ต้องรู้", p: "FOMC, อัตราดอกเบี้ย Fed, NFP (จ้างงาน), CPI/PCE (เงินเฟ้อ) — ข่าวพวกนี้ทำทองวิ่งแรงมากและคาดเดายาก" },
                { h: "กลยุทธ์ช่วงข่าว", p: "มือใหม่: อย่าเทรดก่อน-ระหว่างข่าวแรง (สเปรดกว้าง โดนกวาดง่าย) มืออาชีพ: รอข่าวออก รอ sweep + โครงสร้างนิ่ง แล้วค่อยตาม" },
            ],
            highlights: ["DXY ขึ้น = ทองลง (สวนทาง)", "FOMC/NFP/CPI = ระวังสุด", "มือใหม่เลี่ยงเทรดตอนข่าวแรง"],
            summary: "ข่าวและ DXY คือพลังเบื้องหลังทอง อย่าเทรดตาบอด เช็กปฏิทินข่าว + ทิศ DXY ก่อนเสมอ",
        },
        en: {
            title: "News Trading & DXY vs Gold",
            minutes: 6,
            intro: "Gold is very sensitive to US news and the dollar. Understanding this relationship gives you an edge and avoids getting swept.",
            sections: [
                { h: "DXY ↔ gold (inverse)", p: "Dollar up (DXY up) → gold usually down; dollar down → gold usually up. Always check DXY before entry; if it contradicts your plan, be careful." },
                { h: "High-impact news", p: "FOMC, Fed rate decisions, NFP (jobs), CPI/PCE (inflation) — these make gold move violently and unpredictably." },
                { h: "News strategy", p: "Beginners: don't trade before/during big news (wide spreads, easy sweeps). Pros: wait for the release, a sweep, and a calm structure, then follow." },
            ],
            highlights: ["DXY up = gold down (inverse).", "FOMC/NFP/CPI = highest caution.", "Beginners avoid trading during big news."],
            summary: "News and DXY are the forces behind gold. Don't trade blind — always check the news calendar and DXY direction first.",
        },
    },
    {
        id: "tradeplan", icon: "📋", level: "advanced", art: "risk", free: false,
        lo: {
            title: "ສ້າງແຜนເທຣด & ຈົດบันทึก (Journal)",
            minutes: 6,
            intro: "ເທຣดເດີ້ທີ່ກຳໄລสม่ำเสมอมีແຜนชัดและจดทุกไม้ ບໍ່ແມ່ນເທຣดตามอารมณ์. ນີ້ຄືສິ່ງທີ່ແຍກມືโปรกับมือสมัครเล่น.",
            sections: [
                { h: "ແຜนເທຣด (Trading Plan)", p: "ກຳນົดล่วงหน้า: ເທຣดคู่ไหน, TF ໃດ, setup ແບບໃດທີ່ຈะเข้า, ຄວາມສ່ຽງຕໍ່ໄມ້, ເວລາທີ່ເທຣด. ຖ້າບໍ່ຕรงเงื่อนไข = ບໍ່ເຂົ້າ." },
                { h: "ຈົດบันทึก (Journal)", p: "ທຸກໄມ້ຈົด: ເຫດຜົนเข้า, ภาพกราฟ, ຜົนลัพธ์, ອາລົມຕอนนั้น. ທົບທວນທຸกสัปดาห์เพื่อหาจุดที่ทำผิดซ้ำ." },
                { h: "ວັດຜົนด้วยตัวเลข", p: "ເບິ່ງ win rate, RR ສະເລ່ຍ, ໄມ້ທີ່ดีที่สุด/แย่ที่สุด. ປັບປຸງจากข้อมูลจริง ບໍ່ແມ່ນຄວາມຮູ້ສຶກ." },
            ],
            highlights: ["ບໍ່ມີແຜน = ບໍ່ເຂົ້າ.", "ຈົດທຸກໄມ້ + ທົບທວນທຸกสัปดาห์.", "ປັບປຸງจากตัวเลขจริง."],
            summary: "ແຜน + journal ປ່ຽนการเทรดจากการพนัน ເປັນທຸระกิจที่วัดผลและพัฒนาได้. ນີ້ຄືເສັ້นทางสู่ความสม่ำเสมอ.",
        },
        th: {
            title: "สร้างแผนเทรด & จดบันทึก (Journal)",
            minutes: 6,
            intro: "เทรดเดอร์ที่กำไรสม่ำเสมอมีแผนชัดและจดทุกไม้ ไม่ใช่เทรดตามอารมณ์ นี่คือสิ่งที่แยกมือโปรกับมือสมัครเล่น",
            sections: [
                { h: "แผนเทรด (Trading Plan)", p: "กำหนดล่วงหน้า: เทรดคู่ไหน, TF ไหน, setup แบบไหนที่จะเข้า, ความเสี่ยงต่อไม้, เวลาที่เทรด ถ้าไม่ตรงเงื่อนไข = ไม่เข้า" },
                { h: "จดบันทึก (Journal)", p: "ทุกไม้จด: เหตุผลเข้า, ภาพกราฟ, ผลลัพธ์, อารมณ์ตอนนั้น ทบทวนทุกสัปดาห์เพื่อหาจุดที่ทำผิดซ้ำ" },
                { h: "วัดผลด้วยตัวเลข", p: "ดู win rate, RR เฉลี่ย, ไม้ที่ดีที่สุด/แย่ที่สุด ปรับปรุงจากข้อมูลจริง ไม่ใช่ความรู้สึก" },
            ],
            highlights: ["ไม่มีแผน = ไม่เข้า", "จดทุกไม้ + ทบทวนทุกสัปดาห์", "ปรับปรุงจากตัวเลขจริง"],
            summary: "แผน + journal เปลี่ยนการเทรดจากการพนัน เป็นธุรกิจที่วัดผลและพัฒนาได้ นี่คือเส้นทางสู่ความสม่ำเสมอ",
        },
        en: {
            title: "Build a Trading Plan & Journal",
            minutes: 6,
            intro: "Consistently profitable traders have a clear plan and journal every trade — not emotional trading. This separates pros from amateurs.",
            sections: [
                { h: "Trading Plan", p: "Decide in advance: which pair, which TF, which setups you'll take, risk per trade, and when you trade. If conditions aren't met = no entry." },
                { h: "Journal", p: "For every trade log: entry reason, chart screenshot, result, and your emotion. Review weekly to find repeated mistakes." },
                { h: "Measure with numbers", p: "Track win rate, average RR, best/worst trades. Improve from real data, not feelings." },
            ],
            highlights: ["No plan = no entry.", "Journal every trade + review weekly.", "Improve from real numbers."],
            summary: "A plan + journal turns trading from gambling into a measurable, improvable business — the path to consistency.",
        },
    },
    {
        id: "goldsniper", icon: "🎯", level: "advanced", art: "premdisc", free: false,
        lo: {
            title: "Gold Sniper Entry (ເຂົ້າແມ່ນແບບສະໄນເປີ້)",
            minutes: 8,
            intro: "ລວມທຸກຢ່າງເຂົ້າด้วยกันเป็นระบบเข้าออเดอร์ทองแบบ ສະໄນເປີ້ — ເຂົ້ານ້ອຍ ແຕ່ແມ່ນແລະ RR ສູງ.",
            sections: [
                { h: "1. ກรอง bias (HTF)", p: "H4/H1 ເບິ່ງທິດຫຼັກ + premium/discount. ຈะเล็ง Buy ສະເພາະ discount, Sell ສະເພາະ premium ເທົ່ານັ້ນ ຕັดไม้สวนทิ้งหมด." },
                { h: "2. ລໍ Liquidity Sweep", p: "ລໍໃຫ້ລາຄາກວາด high/low ສຳຄັນ (stop hunt) ກ່ອນ. ຢ່າເຂົ້າກ່ອນ sweep ເດັດขาด — ນີ້ຄືກັບດักที่ดักรายย่อย." },
                { h: "3. ຢືนยัน LTF", p: "M5/M1 ລໍ CHoCH/BOS + ແທ່ງปิดຢືนยัน ເຂົ້າທີ່ OB/FVG ນ້ອຍ ເຮັດໃຫ້ SL ສັ້ນຫຼາຍ (ຈຸดที่ผิดแผนชัดเจน)." },
                { h: "4. ຕັ້ງ TP ເປັນຊັ້ນ", p: "TP1 = liquidity ໃກ້ສຸด (ປິดบางส่วน + ເລື່ອน SL break-even), TP2 ກາງ, TP3 ໄກ. RR ລວมควรได้ 1:3 ຂຶ້ນไป." },
            ],
            highlights: ["ເຂົ້າສະເພาะ discount(Buy)/premium(Sell).", "ຫ້າມເຂົ້າກ່ອນ sweep.", "ຢືนยัน LTF ກ່ອນ → SL ສັ້ນ.", "TP ເປັນຊັ້ນ RR 1:3+."],
            summary: "Sniper entry = ອົດທົນລໍຈຸด A+ ທີ່ທຸກຢ່າງຕรงกัน ແລ້ວເຂົ້າແມ່ນໆ ຄັ້ງດຽວ. คุณภาพชนะปริมาณສະເໝີ.",
        },
        th: {
            title: "Gold Sniper Entry (เข้าแม่นแบบสไนเปอร์)",
            minutes: 8,
            intro: "รวมทุกอย่างเข้าด้วยกันเป็นระบบเข้าออเดอร์ทองแบบ 'สไนเปอร์' — เข้าน้อย แต่แม่นและ RR สูง",
            sections: [
                { h: "1. กรอง bias (HTF)", p: "H4/H1 ดูทิศหลัก + premium/discount จะเล็ง Buy เฉพาะ discount, Sell เฉพาะ premium เท่านั้น ตัดไม้สวนทิ้งหมด" },
                { h: "2. รอ Liquidity Sweep", p: "รอให้ราคากวาด high/low สำคัญ (stop hunt) ก่อน อย่าเข้าก่อน sweep เด็ดขาด — นี่คือกับดักที่ดักรายย่อย" },
                { h: "3. ยืนยัน LTF", p: "M5/M1 รอ CHoCH/BOS + แท่งปิดยืนยัน เข้าที่ OB/FVG เล็ก ทำให้ SL สั้นมาก (จุดที่ผิดแผนชัดเจน)" },
                { h: "4. ตั้ง TP เป็นชั้น", p: "TP1 = liquidity ใกล้สุด (ปิดบางส่วน + เลื่อน SL break-even), TP2 กลาง, TP3 ไกล RR รวมควรได้ 1:3 ขึ้นไป" },
            ],
            highlights: ["เข้าเฉพาะ discount(Buy)/premium(Sell)", "ห้ามเข้าก่อน sweep", "ยืนยัน LTF ก่อน → SL สั้น", "TP เป็นชั้น RR 1:3+"],
            summary: "Sniper entry = อดทนรอจุด A+ ที่ทุกอย่างตรงกัน แล้วเข้าแม่นๆ ครั้งเดียว คุณภาพชนะปริมาณเสมอ",
        },
        en: {
            title: "Gold Sniper Entry",
            minutes: 8,
            intro: "Combining everything into a 'sniper' gold entry system — trade rarely, but precisely and with high RR.",
            sections: [
                { h: "1. Filter bias (HTF)", p: "On H4/H1 read the main direction + premium/discount. Aim Buys only in discount, Sells only in premium. Drop all counter-trend trades." },
                { h: "2. Wait for a sweep", p: "Wait for price to sweep a key high/low (stop hunt) first. Never enter before the sweep — that's the trap that catches retail." },
                { h: "3. Confirm on LTF", p: "On M5/M1 wait for CHoCH/BOS + a confirmation close. Enter at a small OB/FVG to keep the stop very tight (clear invalidation)." },
                { h: "4. Tiered take-profit", p: "TP1 = nearest liquidity (partial + move SL to break-even), TP2 mid, TP3 far. Aim for an overall 1:3+ RR." },
            ],
            highlights: ["Buy only in discount, Sell only in premium.", "Never enter before the sweep.", "Confirm on LTF → tight SL.", "Tiered TPs, 1:3+ RR."],
            summary: "A sniper entry means patiently waiting for the A+ point where everything aligns, then entering precisely once. Quality always beats quantity.",
        },
    },
];
// Promotions — Academy can edit freely (keys map into i18n later; plain text ok)
const PROMOS = [
    { tag: "course", title: "Gold Sniper Masterclass", descKey: "promo1", cta: "joinCourse", goTab: "course" },
    { tag: "signal", title: "VIP Signal Room", descKey: "promo2", cta: "joinVip", goTab: "room" },
    { tag: "free", title: "Free Weekly Workshop", descKey: "promo3", cta: "bookSeat", goWa: true },
];
const BIAS_KEYS = ["biasAuto", "biasLong", "biasShort"];
const MAX_CHARTS = 6;
let UID = 0;
// ─────────────────────────────────────────────────────────────
// i18n — Lao / Thai / English. Auto-detect by locale, switchable.
// ─────────────────────────────────────────────────────────────
const LANGS = [
    { id: "lo", label: "Laos", flag: "🇱🇦" },
    { id: "th", label: "Thai", flag: "🇹🇭" },
    { id: "en", label: "English", flag: "EN" },
];
function detectLang() {
    // Default to English on first open (per spec). Users switch language in Profile.
    return "en";
}
const T = {
    lo: {
        planLifetime: "Lifetime Pro",
        pfCourseInc: "ຄອສ Gold Sniper",
        pfEa: "EA Expert",
        pfFuture: "ຟັງຊັນໃໝ່ອະນາຄົດ",
        planLifeBadge: "ຄຸ້ມສຸດ",
        pfCourseExtra: "ຊື້ແຍກ",
        howToUse: "ວິທີໃຊ້",
        howToTitle: "ວິທີຖ່າຍຮູບກຣາຟໃຫ້ AI ວິເຄາະໄດ້ແມ່ນ",
        howToIntro: "ເພື່ອໃຫ້ AI ວິເຄາະຖືກຕ້ອງ ກະລຸນາຖ່າຍຮູບ (screenshot) ກຣາฟຕາມນີ້:",
        howTo1Title: "1. ເປີດ Timeframe ໃຫ້ເຫັນ",
        howTo1Desc: "ໃຫ້ເຫັນ Timeframe (M5, M15, H1, H4, D1) ຢູ່ໃນຮູບ ເພື່ອໃຫ້ AI ຮູ້ກອບເວລາ. ແນະນຳສົ່ງຫຼາຍ Timeframe (ເຊັ່ນ H1 + M15).",
        howTo2Title: "2. ເປີດ Indicator ທີ່ຈຳເປັນ",
        howTo2Desc: "ເປີດ EMA/MA, RSI ຫຼື Volume ຖ້າມີ. ໃຫ້ເຫັນລາຄາ ແລະ ແທ່ງທຽນຊັດເຈນ ບໍ່ບັງດ້ວຍເສັ້ນຫຼາຍເກີນ.",
        howTo3Title: "3. ຖ່າຍໃຫ້ຄົບ ແລະ ຊັດ",
        howTo3Desc: "ໃຫ້ເຫັນແທ່ງທຽນຫຼ້າສຸດ ແລະ ລາຄາປັจจุบัน. ຮູບຊັດ ບໍ່ມົວ ບໍ່ຕັດຂອບ. ໃຊ້ XAU/USD (ຄຳ) ເປັນຫຼັກ.",
        howToTip: "ເຄັດລັບ: ຮູບຍິ່ງຊັດ ແລະ ຂໍ້ມູນຍິ່ງຄົບ AI ຍິ່ງວິเคາะแม่น.",
        howToClose: "ເຂົ້າໃจແລ້ว",
        secWallet: "ກະເປົາເງິນ",
        walletBalance: "ຍອດຄົງເຫຼືອ",
        walletEarned: "ລາຍຮັບລວມ",
        walletPending: "ລໍຖອນ",
        secReferral: "ແນະນຳໝູ່",
        refDesc: "ຊວນໝູ່ສະໝັກ VIP — ໄດ້ຮັບສ່ວນຫຼຸດ {pct}% ຂອງທຸກໆເດືອນທີ່ໝູ່ສະໝັກ",
        refYourCode: "ໂຄ້ດແນະນຳຂອງເຈົ້າ",
        refYourLink: "ລິ້ງຊວນໝູ່",
        refCopy: "ສຳເນົາ",
        refCopied: "ສຳເນົາແລ້ວ!",
        refShare: "ແຊຣ໌ລິ້ງ",
        refInvited: "ຊວນສຳເລັດ",
        refEarnings: "ລາຍຮັບຈາກ referral",
        refPeople: "ຄົນ",
        refHowTitle: "ໄດ້ສ່ວນຫຼຸດແບບໃດ?",
        refHow: "1) ແຊຣ໌ລິ້ງ → 2) ໝູ່ສະໝັກ VIP ຜ່ານລິ້ງ → 3) ໂທຫາ Admin ທາງ WhatsApp ສົ່ງຫຼັກຖານ → 4) ຮັບສ່ວນຫຼຸດ {pct}% ຈາກຄ່າສະໝັກໝູ່ (ຫັກຈາກເດືອນຕໍ່ໄປ)",
        secWithdraw: "ຖອນເງິນ (USDT)",
        wdAmount: "ຈຳນວນທີ່ຖອນ",
        wdAddress: "ທີ່ຢູ່ USDT (TRC20)",
        wdAddrPlaceholder: "ວາງ USDT address (TRC20)",
        wdMin: "ຂັ້ນຕ່ຳ {min} USDT",
        wdBtn: "ຖອນເງິນ",
        wdNote: "ໝາຍເຫດ: ການຖອນ USDT ຈິງ ຕ້ອງເຊື່ອມ backend + crypto gateway. ຕອນນີ້ເປັນ UI demo.",
        wdInsufficient: "ຍອດບໍ່ພໍ",
        wdSuccess: "ສົ່ງຄຳຂໍຖອນແລ້ວ (demo)",
        wdHistory: "ປະຫວັດການຖອນ",
        wdNone: "ຍັງບໍ່ມີການຖອນ",
        demoBadge: "Demo",
        comingSoon: "ເຊື່ອມ backend ເພື່ອໃຊ້ງານຈິງ",
        learnTabPaid: "ຄອສວິດີໂອ",
        learnTabFree: "ບົດຮຽນ",
        lessonFreeTag: "ບົດຟຣີ",
        lessonUnlockTitle: "ປົດລັອກບົດຮຽນທັງໝົດ",
        lessonUnlockDesc: "ອ່ານຟຣີໄດ້ບາງບົດ. ສະໝັກ VIP ເພື່ອປົດລັອກອີກ {n} ບົດ ພ້ອມຄອສວິດີໂອເຕັມ.",
        lessonUnlockBtn: "ປົດລັອກ VIP",
        freeTitle: "ບົດຮຽນຟຣີຄຸນນະພາບ",
        freeDesc: "ບົດຮຽນພາຍໃນແອັບ ມີຮູບປະກອບ — ອ່ານຟຣີບາງບົດ, ບົດເລິກໆປົດລັອກด้วย VIP.",
        freeWarn: "ໝາຍເຫດ: ບົດຮຽນນີ້ເພື່ອການສຶກສາ. ການເທຣດມີຄວາມສ່ຽງ — ຝຶກໃນບັນຊີ demo ກ່ອນສະເໝີ.",
        freeRead: "ອ່ານບົດຮຽນ",
        freeBack: "ກັບຄືນ",
        freeSummary: "ສະຫຼຸບ",
        freeKeyPoints: "ຈຸດສຳຄັນ",
        freeMin: "ນາທີ",
        freeDone: "ຮຽນຈົບແລ້ວ ✓",
        freeCatBasics: "ພື້ນຖານ (ມືໃໝ່)",
        freeCatSmc: "Smart Money / ICT",
        freeCatAdvanced: "ຂັ້ນສູງ & ປຶ້ມ",
        freeOpen: "ເປີດຮຽນ",
        freeBy: "ໂດຍ",
        forgotPw: "ລືມລະຫັດຜ່ານ?",
        forgotPwNote: "ກະລຸນາຕິດຕໍ່ Startup FX ທາງ WhatsApp ເພື່ອກູ້ຄືນລະຫັດຜ່ານ (ຕ້ອງເຊື່ອມ backend ສຳລັບ reset ອັດຕະໂນມັດ).",
        obSkip: "ຂ້າມ",
        obNext: "ຕໍ່ໄປ",
        obStart: "ເລີ່ມໃຊ້ເລີຍ",
        obStep: "ຂັ້ນຕອນ",
        ob1Title: "ຍິນດີຕ້ອນຮັບ! 🎉",
        ob1Desc: "SniperTech AI ຊ່ວຍວິເຄາະກຣາຟ XAU/USD ແລະ ທຸກຄູ່ເງິນ ດ້ວຍ AI ລະດັບ institutional (SMC · Liquidity · ICT).",
        ob2Title: "📊 ວິເຄາະກຣາຟ",
        ob2Desc: "ໄປທີ່ເມນູ \"ເຄື່ອງມື AI\" → ອັບຮູບກຣາຟ (ໄດ້ເຖິງ 6 ຮູບ) → ກົດ \"ສ້າງສັນຍານ\" → AI ຈະບອກ Buy/Sell + ຈຸດເຂົ້າ/SL/TP ໃຫ້.",
        ob3Title: "🎓 ຮຽນ & ຂ່າວສານ",
        ob3Desc: "ເມນູ \"ການຮຽນຮູ້\" ມີຄອສ Gold Sniper. ເມນູ \"ຂ່າວສານ\" ມີປະກາດ ແລະ ສັນຍານຈາກແອດມິນ.",
        ob4Title: "💰 ຮັບ Cashback",
        ob4Desc: "ເປີດບັນຊີເທຣດຜ່ານ KCM ຫຼື KVB ໃນແອັບ → ຮັບເງິນຄືນ 15$ ຕໍ່ 1 lot ທີ່ເທຣດ. ກົດທີ່ການ໌ດໂບຣກເກີໃນໜ້າຫຼັກ.",
        planCompare: "ປຽບທຽບແພັກເກັດ",
        planFree: "ຟຣີ (ທົດລອງ)",
        planVip: "VIP",
        planFeature: "ຟັງຊັ່ນ",
        planPrice: "ລາຄາ",
        planFreePrice: "ຟຣີ 3 ມື້",
        planUpgrade: "ອັບເກຣດເປັນ VIP",
        pfAnalysis: "ວິເຄາະ AI",
        pfAnalysisFree: "ບໍ່ຈຳກັດ (3 ມື້)",
        pfAnalysisVip: "ບໍ່ຈຳກັດ",
        pfNews: "ວິເຄາະຂ່າວ",
        pfCharts: "ອັບຮູບພ້ອມກັນ",
        pfCourse: "ຄອສ Gold Sniper",
        pfSignal: "ສັນຍານ VIP",
        pfSupport: "ຊ່ວຍເຫຼືອ",
        pfYes: "✓",
        pfNo: "✗",
        pfLimited: "ຈຳກັດ",
        planMostPop: "ນິຍົມສຸດ",
        planBestValue: "ຄຸ້ມສຸດ",
        planSave: "ປະຫຍັດ",
        planPerMonth: "/ເດືອນ",
        planOneTime: "ຈ່າຍຄັ້ງດຽວ ໃຊ້ຕລອດຊີວິດ",
        planCurrent: "ແພັກເກັດປັດຈຸບັນ",
        planChoose: "ເລືອກແພັກນີ້",
        planFreeTag: "ທົດລອງຟຣີ 3 ມື້ — ໃຊ້ໄດ້ທຸກຟັງຊັ່ນ (ຍົກເວັ້ນຄອສ VIP)",
        planVipTag: "ນັກເທຣດທີ່ຈິງຈັງ",
        planProTag: "ຈ່າຍຄັ້ງດຽວ ໄດ້ທຸກຢ່າງຕລອດໄປ",
        planAllFeatures: "ທຸກຟັງຊັ່ນໃນ VIP",
        pfPrediction: "🔮 AI ຄາດການຂ່າວ",
        pfThemes: "ຫລາກຫລາຍ Theme",
        adminOnly: "ສະເພາະແອດມິນ",
        aiAdminNote: "ຜູ້ໃຊ້ທົ່ວໄປຈະບໍ່ເຫັນສ່ວນນີ້ — ລູກຄ້າໃຊ້ AI ໄດ້ເລີຍໂດຍບໍ່ຮູ້ເບື້ອງຫຼັງ. ແອດມິນເຊື່ອມຕໍ່ 3 AI ທີ່ນີ້.",
        aiUnlockAdmin: "ປົດລັອກໂໝດແອດມິນ",
        dailyUsed: "ໃຊ້ໄປ {n}/{max} ມື້ນີ້",
        dailyLimitHit: "ໃຊ້ຄົບ 5 ຄັ້ງແລ້ວມື້ນີ້ — ອັບເກຣດ VIP ໃຊ້ບໍ່ຈຳກັດ",
        aiEngine: "ເຄື່ອງຈັກ AI",
        aiConsensus: "ການລົງມະຕິ AI",
        aiActive: "ໃຊ້ງານ",
        aiReady: "ພ້ອມ (ຕໍ່ backend)",
        aiSoon: "ໄວໆ ນີ້",
        aiClaudeDesc: "ເກັ່ງ SMC · ໂຄງສ້າງ · ເຫດຜົນ",
        aiGptDesc: "ເກັ່ງ pattern · ສະຖິຕິ",
        aiGeminiDesc: "ເກັ່ງ multimodal · ຮູບ",
        aiConsensusHigh: "AI ສ່ວນໃຫຍ່ເຫັນຕ້ອງກັນ",
        aiConsensusMixed: "AI ເຫັນຕ່າງກັນ — ລະວັງ",
        aiConsensusSingle: "ວິເຄາະໂດຍ Claude",
        aiNote: "ໝາຍເຫດ: ຕອນນີ້ Claude ໃຊ້ໄດ້ຈິງ. ການເພີ່ມ Gemini + ChatGPT ມາຊ່ວຍລົງມະຕິ ຕ້ອງເຊື່ອມ backend + API key ຂອງແຕ່ລະເຈົ້າ.",
        aiVote: "ລົງມະຕິ",
        aiAgreement: "ລະດັບຄວາມເຫັນຕ້ອງກັນ",
        orContinue: "ຫຼື ດຳເນີນການດ້ວຍ",
        continueGoogle: "ດຳເນີນການດ້ວຍ Google",
        continueApple: "ດຳເນີນການດ້ວຍ Apple",
        socialNote: "ໝາຍເຫດ: ການເຂົ້າສູ່ລະບົບດ້ວຍ Google/Apple ຕ້ອງເຊື່ອມ backend (Firebase Auth / OAuth). ປຸ່ມນີ້ເປັນ demo.",
        rebateTitleKvb: "ເປີດບັນຊີ KVB — ຮັບເງິນຄືນ 15$ / 1 Lot",
        registerKvb: "ລົງທະບຽນເປີດບັນຊີ KVB",
        rAdvanced: "ການອ່ານຂັ້ນສູງ",
        navHome: "ໜ້າຫຼັກ",
        navTools: "ເຄື່ອງມື AI",
        navLearn: "ການຮຽນຮູ້",
        navNews: "ຂ່າວສານ",
        navProfile: "ໂປຣໄຟລ໌",
        homeWelcome: "ສະບາຍດີ",
        homeSubtitle: "ພ້ອມເທຣດແລ້ວບໍ? ເລືອກເຄື່ອງມືທາງລຸ່ມ",
        homeQuickTools: "ເຄື່ອງມືດ່ວນ",
        homeAnnounce: "ປະກາດລ່າສຸດ",
        profileTitle: "ໂປຣໄຟລ໌",
        profileMember: "ສະມາຊິກ",
        secLanguage: "ພາສາ",
        secTheme: "ຮູບແບບສີ (Theme)",
        themeDesc: "ເລືອກສີສັນແອັບຕາມໃຈມັກ",
        secNotify: "ການແຈ້ງເຕືອນ",
        secSettings: "ການຕັ້ງຄ່າແອັບ",
        secHelp: "ການຊ່ວຍເຫຼືອ",
        setNotifyDesc: "ຮັບແຈ້ງເຕືອນເມື່ອມີປະກາດ ຫຼື ສັນຍານໃໝ່",
        helpContact: "ຕິດຕໍ່ທີມງານ",
        helpFaq: "ຄຳຖາມທີ່ພົບເລື້ອຍ",
        helpAbout: "ກ່ຽວກັບແອັບ",
        helpTerms: "ເງື່ອນໄຂ & ຄວາມສ່ຽງ",
        setDarkMode: "ໂໝດມືດ",
        setSound: "ສຽງແຈ້ງເຕືອນ",
        aboutVer: "ເວີຊັນ",
        memberSince: "ສະມາຊິກແຕ່",
        daysRemaining: "ເຫຼືອ {n} ມື້",
        tabCourse: "ຄອສ",
        tabNews2: "ຫ້ອງຂ່າວ",
        courseTitle: "Gold Sniper Masterclass",
        courseSub: "ຮຽນ SMC · Order Block · Liquidity · Order Flow ຄົບຊຸດ",
        courseLocked: "ຄອສນີ້ລັອກຢູ່",
        courseLockedDesc: "ຊຳລະ 100$ ເທື່ອດຽວ ເພື່ອປົດລັອກ ແລະ ຮຽນຄລິບໄດ້ບໍ່ຈຳກັດຕະຫຼອດໄປ.",
        coursePrice: "100$ (ຈ່າຍເທື່ອດຽວ)",
        courseUnlock: "ປົດລັອກຄອສ 100$",
        courseUnlocked: "ປົດລັອກແລ້ວ ✓ ຮຽນໄດ້ບໍ່ຈຳກັດ",
        courseLessons: "ບົດຮຽນ",
        courseLesson: "ບົດທີ",
        courseWatch: "▶ ເບິ່ງຄລິບ",
        courseLockedTag: "🔒 ລັອກ",
        courseDemoUnlock: "ສົ່ງສະລິບ + ປົດລັອກ (Demo)",
        courseBackendNote: "ໝາຍເຫດ: ການຢືນຢັນການຊຳລະ + ການເກັບຄລິບຈິງ ຕ້ອງເຊື່ອມ backend (ເຊັ່ນ Vimeo/YouTube + ລະບົບສະມາຊິກ).",
        roomTitle: "ຫ້ອງຂ່າວສານ & ປະກາດ",
        roomSub: "ປະກາດຈາກທີມ Startup FX",
        roomEmpty: "ຍັງບໍ່ມີປະກາດ",
        roomNotifyOn: "🔔 ເປີດການແຈ້ງເຕືອນ",
        roomNotifyOff: "🔕 ປິດການແຈ້ງເຕືອນ",
        roomNotifyDenied: "ຖືກບລັອກ — ເປີດໃນ settings ຂອງ browser",
        roomAdmin: "ໂໝດແອດມິນ",
        roomPostPlaceholder: "ພິມປະກາດ... (ແອດມິນເທົ່ານັ້ນ)",
        roomPostBtn: "ລົງປະກາດ",
        roomNew: "ໃໝ່",
        roomBackendNote: "ໝາຍເຫດ: ການແຈ້ງເຕືອນ real-time ໄປມືຖືລູກຄ້າທຸກຄົນ ຕ້ອງໃຊ້ push backend (Firebase Cloud Messaging). ໃນ artifact ນີ້ ການແຈ້ງເຕືອນເຮັດວຽກສະເພາະ browser ນີ້.",
        rSmc: "ການອ່ານແບບ Smart Money",
        rPremDisc: "Premium / Discount",
        rLiquidity: "Liquidity / Sweep",
        rOrderFlow: "Order Flow",
        rOrderBook: "Order Book / DOM",
        rNewsAlert: "⚠️ ແຈ້ງເຕືອນຂ່າວ",
        rDxy: "DXY (ໂຕເສີມ)",
        rOil: "ນ້ຳມັນ (Oil)",
        rIntermarket: "ປັດໄຈຕລາດ",
        wrTitle: "ໂອກາດສຳເລັດ (ປະເມີນ)",
        wrConfidence: "ຄວາມໝັ້ນໃຈ AI",
        wrGrade: "ລະດັບ Confluence",
        wrFactors: "ປັດໄຈສະໜັບສະໜູນ",
        wrNote: "ປະເມີນຈາກ confluence — ບໍ່ແມ່ນການຮັບປະກັນ. ທຸກ setup ຜິດພາດໄດ້.",
        wrLow: "ຕ່ຳ",
        wrMed: "ກາງ",
        wrHigh: "ສູງ",
        footer: "© Startup FX · ເຄື່ອງມືນີ້ໃຫ້ການວິເຄາະເພື່ອການສຶກສາ ບໍ່ແມ່ນຄຳແນະນຳທາງການເງິນ ຫຼື ສັນຍານທີ່ຮັບປະກັນ. ບໍ່ມີລະບົບໃດຊະນະ 90% ຂອງການເທຣດ — ທຸກ setup ຜິດພາດໄດ້. ເທຣດດ້ວຍເງິນທີ່ສ່ຽງໄດ້ ແລະ ໃຊ້ stop ສະເໝີ.",
        rInstrument: "ເຄື່ອງມື",
        rTimeframe: "ກອບເວລາ",
        rTrend: "ແນວໂນ້ມ",
        rMacro: "ບໍລິບົດຂ່າວ / ມະຫາພາກ",
        rZones: "ໂຊນ Sniper",
        rSupport: "ແນວຮັບ",
        rResist: "ແນວຕ້ານ",
        rLong: "ໂຊນຊື້ (Buy)",
        rShort: "ໂຊນຂາຍ (Sell)",
        rReady: "ພ້ອມເຂົ້າ",
        rWait: "ລໍຖ້າ",
        rGrade: "ຄຸນນະພາບ",
        rConf: "ໝັ້ນໃຈ",
        rEntry: "ໂຊນເຂົ້າ",
        rStop: "ຕັດຂາດທຶນ",
        rInvalid: "ເງື່ອນໄຂຍົກເລີກ:",
        rNext: "ແຜນຮອບຖັດໄປ (Next Move)",
        rNoTrade: "ເມື່ອໃດຄວນຢຸດເທຣດ",
        rQuickMap: "ສະຫຼຸບແຜນເທຣດ",
        rCantRead: "ອ່ານກຣາฟນີ້ບໍ່ໄດ້",
        rBias: "ທິດທາງຫຼັກ",
        rReasons: "ເຫດຜົນຢືນຢັນ",
        rChecklist: "ເຊັກລິສ ກ່ອນເຂົ້າໄມ້",
        rChk1: "ລໍຖ້າແທ່ງທຽນຢືນຢັນ (ສຳຄັນທີ່ສຸດ)",
        rChk2: "ບໍ່ໄລ່ລາຄາ",
        rChk3: "SL ຕ້ອງຍອມຮັບໄດ້",
        rSetupTitle: "ແຜນການເທຣດ",
        nTitle: "ວິເຄາະຂ່າວເສດຖະກິດມື້ນີ້",
        nDesc: "AI ຈະດຶງປະຕິທິນຂ່າວມື້ນີ້ (ອິງ ForexFactory + Investing.com) ແລ້ວແຍກ ຂ່າວ 3 ດາວ / ກ່ອງແດງ ກັບຂ່າວອື່ນ ແລະ ຂ່າວນອກຕາຕະລາງ ໃຫ້ອ່ານງ່າຍ.",
        nFetch: "🔍 ດຶງ & ວິເຄາະຂ່າວມື້ນີ້",
        nFetching: "ກຳລັງດຶງຂ່າວ…",
        nGold: "ທອງຄຳ:",
        nHigh: "🔴 ຂ່າວ 3 ດາວ / ກ່ອງແດງ (ກະທົບແຮງ)",
        nHighEmpty: "ມື້ນີ້ບໍ່ມີຂ່າວ 3 ດາວ",
        nOther: "🟡 ຂ່າວອື່ນໆ (ກະທົບປານກາງ/ໜ້ອຍ)",
        nOtherEmpty: "ບໍ່ມີຂ່າວອື່ນທີ່ສຳຄັນ",
        nOff: "📢 ຂ່າວນອກຕາຕະລາງ / ດ່ວນ",
        nOffEmpty: "ບໍ່ມີຂ່າວນອກຕາຕະລາງ",
        nGlanceHigh: "🔴 ຂ່າວແຮງ",
        nGlanceOther: "🟡 ຂ່າວອື່ນ",
        nGlanceOff: "📢 ນອກຕາຕະລາງ",
        nTradeNote: "ຄຳແນະນຳການເທຣດມື້ນີ້",
        nItems: "ລາຍການ",
        nForecast: "ຄາດການ",
        nPrevious: "ຄັ້ງກ່ອນ",
        nPrediction: "🔮 AI ຄາດການ",
        nPredLock: "🔒 AI ຄາດການ — ສະເພາະ VIP",
        nPredLockDesc: "ປົດລັອກການຄາດການຕົວເລກຂ່າວ ແລະ ທິດທາງ USD/ຄຳ ດ້ວຍ VIP.",
        nPredUnlock: "👑 ອັບເກຣດ VIP ເພື່ອປົດລັອກ",
        nUsdEffect: "ຜົນຕໍ່ USD",
        nGoldEffect: "ຜົນຕໍ່ຄຳ",
        nLocalTime: "ເວລາລາວ",
        usdStrong: "USD ແຂງ 💵↑",
        usdWeak: "USD ອ່ອນ 💵↓",
        usdNeutral: "USD ຊົງໂຕ",
        goldUp: "ຄຳຂຶ້ນ 🟢",
        goldDown: "ຄຳລົງ 🔴",
        goldVol: "ຄຳຜັນຜວນ 🟡",
        memberOnly: "ສະເພາະສະມາຊິກ", login: "ເຂົ້າສູ່ລະບົບ", signup: "ສະໝັກສະມາຊິກ",
        email: "ອີເມລ", password: "ລະຫັດຜ່ານ", fullname: "ຊື່ ແລະ ນາມສະກຸນ", yourName: "ຊື່ຂອງເຈົ້າ",
        brokerAcc: "ບັນຊີເທຣດ (ໂບຣກເກີ + ເລກບັນຊີ)", brokerHint: "ລູກຄ້າທີ່ເປີດບັນຊີຜ່ານ Startup FX",
        startUsing: "ສະໝັກ ແລະ ເລີ່ມໃຊ້", noAccount: "ຍັງບໍ່ມີບັນຊີ?", agree: "ຂ້ອຍເຂົ້າໃຈວ່າການເທຣດມີຄວາມສ່ຽງ, Startup FX ບໍ່ໄດ້ຮັບປະກັນກຳໄລ ຫຼື winrate, ແລະ ສັນຍານເປັນເພື່ອການສຶກສາເທົ່ານັ້ນ.",
        errEmail: "ກະລຸນາໃສ່ອີເມລໃຫ້ຖືກຕ້ອງ ແລະ ລະຫັດຜ່ານ 6 ໂຕຂຶ້ນໄປ.", errName: "ກະລຸນາໃສ່ຊື່ ແລະ ຍອມຮັບເງື່ອນໄຂກ່ອນ.",
        waHelp: "ສອບຖາມການສະໝັກ / ເປີດບັນຊີ ທາງ WhatsApp", logout: "ອອກລະບົບ",
        analyzeChart: "ວິເຄາະກຣາຟ", analyzeNews: "ວິເຄາະຂ່າວ", analyzeRoom: "ຫ້ອງວິເຄາະ", maxImgs: "ສູງສຸດ {n} ຮູບ",
        direction: "ທິດທາງ", checkNews: "ກວດຂ່າວ (DXY · Fed · ຂ່າວແຮງ)", on: "ເປີດ", off: "ປິດ",
        dropHere: "ລາກ screenshot ກຣາຟມາວາງບ່ອນນີ້", clickChoose: "ກົດເພື່ອເລືອກ — ໄດ້ເຖິງ {n} ຮູບ · AI ກວດຄູ່ເງິນ & ກອບເວລາເອງ · PNG / JPG",
        addImg: "+ ເພີ່ມຮູບ", makeSignal: "⚡ ສ້າງສັນຍານ", clearAll: "ລ້າງທັງໝົດ", analyzing: "ກຳລັງວິເຄາະ…",
        biasAuto: "ກວດອັດຕະໂນມັດ", biasLong: "ຊື້ຢ່າງດຽວ (Buy)", biasShort: "ຂາຍຢ່າງດຽວ (Sell)", styleSwing: "📊 ປົກກະຕິ", styleScalp: "⚡ Scalping",
        heroDesc: "ວິເຄາະກຣາຟທຸກຄູ່ເງິນ + Crypto ດ້ວຍ AI — ໝາຍ Order Block · Liquidity · Confluence ແລ້ວສ້າງສັນຍານພ້ອມໃຊ້.",
        secondOpinion: "ຄວາມເຫັນທີສອງ, ບໍ່ແມ່ນສັນຍານຮັບປະກັນ.",
        promoTitle: "ໂປຣໂມຊັ່ນ & ຄອສ", promo1: "ຮຽນ SMC · Order Block · Liquidity ຄົບ 8 ອາທິດ", promo2: "ສັນຍານປະຈຳວັນ + ການບໍລິຫານທຶນລາຍຕົວ", promo3: "ສຳລັບມືໃໝ່ — ປູພື້ນຖານ Price Action",
        joinCourse: "ສະໝັກຮຽນ", joinVip: "ເຂົ້າຮ່ວມ VIP", bookSeat: "ຈອງບ່ອນນັ່ງ",
        contactTitle: "ສົນໃຈຄອສ ຫຼື ສັນຍານ VIP?", contactDesc: "ແຊັດກັບທີມ Startup FX ໂດຍກົງ.", chatWa: "ແຊັດ WhatsApp",
        // trial / payment
        trialLeft: "ທົດລອງໃຊ້ຟຣີ ເຫຼືອ {n} ມື້", trialEndsToday: "ໝົດທົດລອງມື້ນີ້", expired: "ບັນຊີໝົດອາຍຸແລ້ວ",
        locked: "ບັນຊີຖືກລັອກ", lockedDesc: "ການທົດລອງ/ສະມາຊິກໝົດອາຍຸແລ້ວ. ກະລຸນາຊຳລະເພື່ອໃຊ້ຕໍ່.", payNow: "ຊຳລະເພື່ອປົດລັອກ", actCodePlaceholder: "ໃສ່ລະຫັດ VIP ຂອງທ່ານ", actCodeBtn: "ຢືນຢັນລະຫັດ", actCodeOk: "✅ ປົດລັອກສຳເລັດ! ໄດ້ VIP {n} ວັນ", actCodeErr: "❌ ລະຫັດບໍ່ຖືກຕ້ອງ ຫຼື ໃຊ້ແລ້ວ",
        payTitle: "ຕໍ່ອາຍຸສະມາຊິກ", payDesc: "ເລືອກສະກຸນເງິນ ແລ້ວສະແກນ QR ເພື່ອຊຳລະ ({price}/ເດືອນ)", perMonth: "/ເດືອນ",
        scanToPay: "ສະແກນ QR ເພື່ອຊຳລະ", afterPay: "ຫຼັງຊຳລະແລ້ວ ສົ່ງສະລິບໃຫ້ Startup FX ທາງ WhatsApp ເພື່ອເປີດໃຊ້ງານ.",
        sentSlip: "ສົ່ງສະລິບ + ປົດລັອກ (Demo)", copyAddr: "ສຳເນົາ address", copied: "ສຳເນົາແລ້ວ!",
        rebateTitle: "ເປີດບັນຊີ KCM — ຮັບເງິນຄືນ 15$ / 1 Lot", rebateDesc: "ລົງທະບຽນຜ່ານ Startup FX ແລ້ວຮັບ rebate ທຸກ lot ທີ່ເທຣດ.", registerKcm: "ລົງທະບຽນເປີດບັນຊີ KCM",
        backToApp: "ກັບໄປໜ້າວິເຄາະ",
        backendNote: "ໝາຍເຫດ: ການຢືນຢັນການຊຳລະ + ລັອກ/ປົດລັອກຈິງ ຕ້ອງເຊື່ອມ backend ຂອງ Startup FX.",
    },
    th: {
        planLifetime: "Lifetime Pro",
        pfCourseInc: "คอร์ส Gold Sniper",
        pfEa: "EA Expert",
        pfFuture: "ฟีเจอร์ใหม่ในอนาคต",
        planLifeBadge: "คุ้มสุด",
        pfCourseExtra: "ซื้อแยก",
        howToUse: "วิธีใช้",
        howToTitle: "วิธีแคปกราฟให้ AI วิเคราะห์แม่น",
        howToIntro: "เพื่อให้ AI วิเคราะห์ได้แม่นยำ กรุณาแคปภาพ (screenshot) กราฟตามนี้:",
        howTo1Title: "1. เปิด Timeframe ให้เห็น",
        howTo1Desc: "ให้เห็น Timeframe (M5, M15, H1, H4, D1) อยู่ในภาพ เพื่อให้ AI รู้กรอบเวลา แนะนำส่งหลาย Timeframe (เช่น H1 + M15).",
        howTo2Title: "2. เปิด Indicator ที่จำเป็น",
        howTo2Desc: "เปิด EMA/MA, RSI หรือ Volume ถ้ามี ให้เห็นราคาและแท่งเทียนชัดเจน อย่าให้เส้นบังมากเกินไป.",
        howTo3Title: "3. แคปให้ครบและชัด",
        howTo3Desc: "ให้เห็นแท่งเทียนล่าสุดและราคาปัจจุบัน ภาพชัด ไม่เบลอ ไม่ตัดขอบ ใช้ XAU/USD (ทองคำ) เป็นหลัก.",
        howToTip: "เคล็ดลับ: ภาพยิ่งชัดและข้อมูลยิ่งครบ AI ยิ่งวิเคราะห์แม่น.",
        howToClose: "เข้าใจแล้ว",
        secWallet: "กระเป๋าเงิน",
        walletBalance: "ยอดคงเหลือ",
        walletEarned: "รายรับรวม",
        walletPending: "รอถอน",
        secReferral: "แนะนำเพื่อน",
        refDesc: "ชวนเพื่อนสมัคร VIP — รับส่วนลด {pct}% ของทุกเดือนที่เพื่อนสมัคร",
        refYourCode: "โค้ดแนะนำของคุณ",
        refYourLink: "ลิงก์ชวนเพื่อน",
        refCopy: "คัดลอก",
        refCopied: "คัดลอกแล้ว!",
        refShare: "แชร์ลิงก์",
        refInvited: "ชวนสำเร็จ",
        refEarnings: "รายรับจาก referral",
        refPeople: "คน",
        refHowTitle: "ได้ % แบบใด?",
        refHow: "1) แชร์ลิงก์ → 2) เพื่อนสมัคร VIP ผ่านลิงก์ → 3) แจ้ง Admin ทาง WhatsApp → 4) รับส่วนลด {pct}% จากค่าสมัครของเพื่อน (หักเดือนถัดไป)",
        secWithdraw: "ถอนเงิน (USDT)",
        wdAmount: "จำนวนที่ถอน",
        wdAddress: "ที่อยู่ USDT (TRC20)",
        wdAddrPlaceholder: "วาง USDT address (TRC20)",
        wdMin: "ขั้นต่ำ {min} USDT",
        wdBtn: "ถอนเงิน",
        wdNote: "หมายเหตุ: การถอน USDT จริง ต้องเชื่อม backend + crypto gateway ตอนนี้เป็น UI demo",
        wdInsufficient: "ยอดไม่พอ",
        wdSuccess: "ส่งคำขอถอนแล้ว (demo)",
        wdHistory: "ประวัติการถอน",
        wdNone: "ยังไม่มีการถอน",
        demoBadge: "Demo",
        comingSoon: "เชื่อม backend เพื่อใช้งานจริง",
        learnTabPaid: "คอร์สวิดีโอ",
        learnTabFree: "บทเรียน",
        lessonFreeTag: "บทฟรี",
        lessonUnlockTitle: "ปลดล็อกบทเรียนทั้งหมด",
        lessonUnlockDesc: "อ่านฟรีได้บางบท สมัคร VIP เพื่อปลดล็อกอีก {n} บท พร้อมคอร์สวิดีโอเต็ม",
        lessonUnlockBtn: "ปลดล็อก VIP",
        freeTitle: "บทเรียนฟรีคุณภาพ",
        freeDesc: "บทเรียนภายในแอป มีรูปประกอบ — อ่านฟรีบางบท, บทเชิงลึกปลดล็อกด้วย VIP",
        freeWarn: "หมายเหตุ: บทเรียนนี้เพื่อการศึกษา การเทรดมีความเสี่ยง — ฝึกในบัญชี demo ก่อนเสมอ",
        freeRead: "อ่านบทเรียน",
        freeBack: "กลับ",
        freeSummary: "สรุป",
        freeKeyPoints: "จุดสำคัญ",
        freeMin: "นาที",
        freeDone: "เรียนจบแล้ว ✓",
        freeCatBasics: "พื้นฐาน (มือใหม่)",
        freeCatSmc: "Smart Money / ICT",
        freeCatAdvanced: "ขั้นสูง & หนังสือ",
        freeOpen: "เปิดเรียน",
        freeBy: "โดย",
        forgotPw: "ลืมรหัสผ่าน?",
        forgotPwNote: "กรุณาติดต่อ Startup FX ทาง WhatsApp เพื่อกู้คืนรหัสผ่าน (ต้องเชื่อม backend สำหรับ reset อัตโนมัติ)",
        obSkip: "ข้าม",
        obNext: "ต่อไป",
        obStart: "เริ่มใช้เลย",
        obStep: "ขั้นตอน",
        ob1Title: "ยินดีต้อนรับ! 🎉",
        ob1Desc: "SniperTech AI ช่วยวิเคราะห์กราฟ XAU/USD และทุกคู่เงิน ด้วย AI ระดับ institutional (SMC · Liquidity · ICT)",
        ob2Title: "📊 วิเคราะห์กราฟ",
        ob2Desc: "ไปที่เมนู \"เครื่องมือ AI\" → อัปรูปกราฟ (ได้ถึง 6 รูป) → กด \"สร้างสัญญาณ\" → AI จะบอก Buy/Sell + จุดเข้า/SL/TP ให้",
        ob3Title: "🎓 เรียน & ข่าวสาร",
        ob3Desc: "เมนู \"การเรียนรู้\" มีคอร์ส Gold Sniper เมนู \"ข่าวสาร\" มีประกาศและสัญญาณจากแอดมิน",
        ob4Title: "💰 รับ Cashback",
        ob4Desc: "เปิดบัญชีเทรดผ่าน KCM หรือ KVB ในแอป → รับเงินคืน 15$ ต่อ 1 lot ที่เทรด กดที่การ์ดโบรกเกอร์ในหน้าหลัก",
        planCompare: "เปรียบเทียบแพ็กเกจ",
        planFree: "ฟรี (ทดลอง)",
        planVip: "VIP",
        planFeature: "ฟีเจอร์",
        planPrice: "ราคา",
        planFreePrice: "ฟรี 3 วัน",
        planUpgrade: "อัปเกรดเป็น VIP",
        pfAnalysis: "วิเคราะห์ AI",
        pfAnalysisFree: "ไม่จำกัด (3 วัน)",
        pfAnalysisVip: "ไม่จำกัด",
        pfNews: "วิเคราะห์ข่าว",
        pfCharts: "อัปรูปพร้อมกัน",
        pfCourse: "คอร์ส Gold Sniper",
        pfSignal: "สัญญาณ VIP",
        pfSupport: "ช่วยเหลือ",
        pfYes: "✓",
        pfNo: "✗",
        pfLimited: "จำกัด",
        planMostPop: "นิยมสุด",
        planBestValue: "คุ้มสุด",
        planSave: "ประหยัด",
        planPerMonth: "/เดือน",
        planOneTime: "จ่ายครั้งเดียว ใช้ตลอดชีพ",
        planCurrent: "แพ็กเกจปัจจุบัน",
        planChoose: "เลือกแพ็กนี้",
        planFreeTag: "ทดลองฟรี 3 วัน — ใช้ได้ทุกฟังก์ชัน (ยกเว้นคอร์ส VIP)",
        planVipTag: "เทรดเดอร์จริงจัง",
        planProTag: "จ่ายครั้งเดียว ได้ทุกอย่างตลอดไป",
        planAllFeatures: "ทุกฟังก์ชันใน VIP",
        pfPrediction: "🔮 AI คาดการณ์ข่าว",
        pfThemes: "หลากหลาย Theme",
        adminOnly: "เฉพาะแอดมิน",
        aiAdminNote: "ผู้ใช้ทั่วไปจะไม่เห็นส่วนนี้ — ลูกค้าใช้ AI ได้เลยโดยไม่รู้เบื้องหลัง แอดมินเชื่อมต่อ 3 AI ที่นี่",
        aiUnlockAdmin: "ปลดล็อกโหมดแอดมิน",
        dailyUsed: "ใช้ไป {n}/{max} วันนี้",
        dailyLimitHit: "ใช้ครบ 5 ครั้งแล้ววันนี้ — อัปเกรด VIP ใช้ไม่จำกัด",
        aiEngine: "เครื่องจักร AI",
        aiConsensus: "การลงมติ AI",
        aiActive: "ใช้งาน",
        aiReady: "พร้อม (ต้องเชื่อม backend)",
        aiSoon: "เร็วๆนี้",
        aiClaudeDesc: "เก่ง SMC · โครงสร้าง · เหตุผล",
        aiGptDesc: "เก่ง pattern · สถิติ",
        aiGeminiDesc: "เก่ง multimodal · รูป",
        aiConsensusHigh: "AI ส่วนใหญ่เห็นตรงกัน",
        aiConsensusMixed: "AI เห็นต่างกัน — ระวัง",
        aiConsensusSingle: "วิเคราะห์โดย Claude",
        aiNote: "หมายเหตุ: ตอนนี้ Claude ใช้ได้จริง การเพิ่ม Gemini + ChatGPT มาช่วยลงมติ ต้องเชื่อม backend + API key ของแต่ละเจ้า",
        aiVote: "ลงมติ",
        aiAgreement: "ระดับความเห็นตรงกัน",
        orContinue: "หรือ ดำเนินการด้วย",
        continueGoogle: "ดำเนินการด้วย Google",
        continueApple: "ดำเนินการด้วย Apple",
        socialNote: "หมายเหตุ: การเข้าสู่ระบบด้วย Google/Apple ต้องเชื่อม backend (Firebase Auth / OAuth) ปุ่มนี้เป็น demo",
        rebateTitleKvb: "เปิดบัญชี KVB — รับเงินคืน 15$ / 1 Lot",
        registerKvb: "ลงทะเบียนเปิดบัญชี KVB",
        rAdvanced: "การอ่านขั้นสูง",
        navHome: "หน้าหลัก",
        navTools: "เครื่องมือ AI",
        navLearn: "การเรียนรู้",
        navNews: "ข่าวสาร",
        navProfile: "โปรไฟล์",
        homeWelcome: "สวัสดี",
        homeSubtitle: "พร้อมเทรดแล้วหรือยัง? เลือกเครื่องมือด้านล่าง",
        homeQuickTools: "เครื่องมือด่วน",
        homeAnnounce: "ประกาศล่าสุด",
        profileTitle: "โปรไฟล์",
        profileMember: "สมาชิก",
        secLanguage: "ภาษา",
        secTheme: "ธีมสี (Theme)",
        themeDesc: "เลือกสีสันแอปตามใจชอบ",
        secNotify: "การแจ้งเตือน",
        secSettings: "การตั้งค่าแอป",
        secHelp: "การช่วยเหลือ",
        setNotifyDesc: "รับแจ้งเตือนเมื่อมีประกาศหรือสัญญาณใหม่",
        helpContact: "ติดต่อทีมงาน",
        helpFaq: "คำถามที่พบบ่อย",
        helpAbout: "เกี่ยวกับแอป",
        helpTerms: "เงื่อนไข & ความเสี่ยง",
        setDarkMode: "โหมดมืด",
        setSound: "เสียงแจ้งเตือน",
        aboutVer: "เวอร์ชัน",
        memberSince: "สมาชิกตั้งแต่",
        daysRemaining: "เหลือ {n} วัน",
        tabCourse: "คอร์ส",
        tabNews2: "ห้องข่าว",
        courseTitle: "Gold Sniper Masterclass",
        courseSub: "เรียน SMC · Order Block · Liquidity · Order Flow ครบชุด",
        courseLocked: "คอร์สนี้ล็อกอยู่",
        courseLockedDesc: "ชำระ 100$ ครั้งเดียว เพื่อปลดล็อกและเรียนคลิปได้ไม่จำกัดตลอดไป",
        coursePrice: "100$ (จ่ายครั้งเดียว)",
        courseUnlock: "ปลดล็อกคอร์ส 100$",
        courseUnlocked: "ปลดล็อกแล้ว ✓ เรียนได้ไม่จำกัด",
        courseLessons: "บทเรียน",
        courseLesson: "บทที่",
        courseWatch: "▶ ดูคลิป",
        courseLockedTag: "🔒 ล็อก",
        courseDemoUnlock: "ส่งสลิป + ปลดล็อก (Demo)",
        courseBackendNote: "หมายเหตุ: การยืนยันการชำระ + การเก็บคลิปจริง ต้องเชื่อม backend (เช่น Vimeo/YouTube + ระบบสมาชิก)",
        roomTitle: "ห้องข่าวสาร & ประกาศ",
        roomSub: "ประกาศจากทีม Startup FX",
        roomEmpty: "ยังไม่มีประกาศ",
        roomNotifyOn: "🔔 เปิดการแจ้งเตือน",
        roomNotifyOff: "🔕 ปิดการแจ้งเตือน",
        roomNotifyDenied: "ถูกบล็อก — เปิดใน settings ของ browser",
        roomAdmin: "โหมดแอดมิน",
        roomPostPlaceholder: "พิมพ์ประกาศ... (แอดมินเท่านั้น)",
        roomPostBtn: "ลงประกาศ",
        roomNew: "ใหม่",
        roomBackendNote: "หมายเหตุ: การแจ้งเตือน real-time ไปมือถือลูกค้าทุกคน ต้องใช้ push backend (Firebase Cloud Messaging) ในแอปนี้การแจ้งเตือนทำงานเฉพาะ browser นี้",
        rSmc: "การอ่านแบบ Smart Money",
        rPremDisc: "Premium / Discount",
        rLiquidity: "Liquidity / Sweep",
        rOrderFlow: "Order Flow",
        rOrderBook: "Order Book / DOM",
        rNewsAlert: "⚠️ แจ้งเตือนข่าว",
        rDxy: "DXY (ตัวเสริม)",
        rOil: "น้ำมัน (Oil)",
        rIntermarket: "ปัจจัยตลาด",
        wrTitle: "โอกาสสำเร็จ (ประเมิน)",
        wrConfidence: "ความมั่นใจ AI",
        wrGrade: "ระดับ Confluence",
        wrFactors: "ปัจจัยสนับสนุน",
        wrNote: "ประเมินจาก confluence — ไม่ใช่การรับประกัน ทุก setup ผิดพลาดได้",
        wrLow: "ต่ำ",
        wrMed: "กลาง",
        wrHigh: "สูง",
        footer: "© Startup FX · เครื่องมือนี้ให้การวิเคราะห์เพื่อการศึกษา ไม่ใช่คำแนะนำทางการเงินหรือสัญญาณรับประกัน ไม่มีระบบใดชนะ 90% ของการเทรด — ทุก setup ผิดพลาดได้ เทรดด้วยเงินที่เสี่ยงได้และใช้ stop เสมอ",
        rInstrument: "เครื่องมือ",
        rTimeframe: "กรอบเวลา",
        rTrend: "แนวโน้ม",
        rMacro: "บริบทข่าว / มหภาค",
        rZones: "โซน Sniper",
        rSupport: "แนวรับ",
        rResist: "แนวต้าน",
        rLong: "โซนซื้อ (Buy)",
        rShort: "โซนขาย (Sell)",
        rReady: "พร้อมเข้า",
        rWait: "รอ",
        rGrade: "คุณภาพ",
        rConf: "มั่นใจ",
        rEntry: "โซนเข้า",
        rStop: "ตัดขาดทุน",
        rInvalid: "เงื่อนไขยกเลิก:",
        rNext: "แผนรอบถัดไป (Next Move)",
        rNoTrade: "เมื่อใดควรหยุดเทรด",
        rQuickMap: "สรุปแผนเทรด",
        rCantRead: "อ่านกราฟนี้ไม่ได้",
        rBias: "ทิศทางหลัก",
        rReasons: "เหตุผลยืนยัน",
        rChecklist: "เช็กลิสต์ก่อนเข้าไม้",
        rChk1: "รอแท่งเทียนยืนยัน (สำคัญที่สุด)",
        rChk2: "ไม่ไล่ราคา",
        rChk3: "SL ต้องยอมรับได้",
        rSetupTitle: "แผนการเทรด",
        nTitle: "วิเคราะห์ข่าวเศรษฐกิจวันนี้",
        nDesc: "AI จะดึงปฏิทินข่าววันนี้ (อิง ForexFactory + Investing.com) แล้วแยก ข่าว 3 ดาว / กรอบแดง กับข่าวอื่น และข่าวนอกตาราง ให้อ่านง่าย",
        nFetch: "🔍 ดึง & วิเคราะห์ข่าววันนี้",
        nFetching: "กำลังดึงข่าว…",
        nGold: "ทองคำ:",
        nHigh: "🔴 ข่าว 3 ดาว / กรอบแดง (กระทบแรง)",
        nHighEmpty: "วันนี้ไม่มีข่าว 3 ดาว",
        nOther: "🟡 ข่าวอื่นๆ (กระทบปานกลาง/น้อย)",
        nOtherEmpty: "ไม่มีข่าวอื่นที่สำคัญ",
        nOff: "📢 ข่าวนอกตาราง / ด่วน",
        nOffEmpty: "ไม่มีข่าวนอกตาราง",
        nGlanceHigh: "🔴 ข่าวแรง",
        nGlanceOther: "🟡 ข่าวอื่น",
        nGlanceOff: "📢 นอกตาราง",
        nTradeNote: "คำแนะนำการเทรดวันนี้",
        nItems: "รายการ",
        nForecast: "คาดการณ์",
        nPrevious: "ครั้งก่อน",
        nPrediction: "🔮 AI คาดการณ์",
        nPredLock: "🔒 AI คาดการณ์ — เฉพาะ VIP",
        nPredLockDesc: "ปลดล็อกการคาดการณ์ตัวเลขข่าว และทิศทาง USD/ทอง ด้วย VIP",
        nPredUnlock: "👑 อัปเกรด VIP เพื่อปลดล็อก",
        nUsdEffect: "ผลต่อ USD",
        nGoldEffect: "ผลต่อทอง",
        nLocalTime: "เวลาไทย",
        usdStrong: "USD แข็ง 💵↑",
        usdWeak: "USD อ่อน 💵↓",
        usdNeutral: "USD ทรงตัว",
        goldUp: "ทองขึ้น 🟢",
        goldDown: "ทองลง 🔴",
        goldVol: "ทองผันผวน 🟡",
        memberOnly: "เฉพาะสมาชิก", login: "เข้าสู่ระบบ", signup: "สมัครสมาชิก",
        email: "อีเมล", password: "รหัสผ่าน", fullname: "ชื่อ-นามสกุล", yourName: "ชื่อของคุณ",
        brokerAcc: "บัญชีเทรด (โบรกเกอร์ + เลขบัญชี)", brokerHint: "ลูกค้าที่เปิดบัญชีผ่าน Startup FX",
        startUsing: "สมัครและเริ่มใช้", noAccount: "ยังไม่มีบัญชี?", agree: "ฉันเข้าใจว่าการเทรดมีความเสี่ยง Startup FX ไม่รับประกันกำไรหรือ winrate และสัญญาณมีไว้เพื่อการศึกษาเท่านั้น",
        errEmail: "กรุณาใส่อีเมลให้ถูกต้องและรหัสผ่าน 6 ตัวขึ้นไป", errName: "กรุณาใส่ชื่อและยอมรับเงื่อนไขก่อน",
        waHelp: "สอบถามการสมัคร / เปิดบัญชี ทาง WhatsApp", logout: "ออกจากระบบ",
        analyzeChart: "วิเคราะห์กราฟ", analyzeNews: "วิเคราะห์ข่าว", analyzeRoom: "ห้องวิเคราะห์", maxImgs: "สูงสุด {n} รูป",
        direction: "ทิศทาง", checkNews: "ตรวจข่าว (DXY · Fed · ข่าวแรง)", on: "เปิด", off: "ปิด",
        dropHere: "ลาก screenshot กราฟมาวางที่นี่", clickChoose: "กดเพื่อเลือก — ได้ถึง {n} รูป · AI ตรวจคู่เงิน & กรอบเวลาเอง · PNG / JPG",
        addImg: "+ เพิ่มรูป", makeSignal: "⚡ สร้างสัญญาณ", clearAll: "ล้างทั้งหมด", analyzing: "กำลังวิเคราะห์…",
        biasAuto: "ตรวจอัตโนมัติ", biasLong: "ซื้ออย่างเดียว (Buy)", biasShort: "ขายอย่างเดียว (Sell)", styleSwing: "📊 ปกติ", styleScalp: "⚡ Scalping",
        heroDesc: "วิเคราะห์กราฟทุกคู่เงิน + Crypto ด้วย AI — มาร์ก Order Block · Liquidity · Confluence แล้วสร้างสัญญาณพร้อมใช้",
        secondOpinion: "ความเห็นที่สอง ไม่ใช่สัญญาณรับประกัน",
        promoTitle: "โปรโมชั่น & คอร์ส", promo1: "เรียน SMC · Order Block · Liquidity ครบ 8 สัปดาห์", promo2: "สัญญาณรายวัน + การบริหารพอร์ตรายตัว", promo3: "สำหรับมือใหม่ — ปูพื้นฐาน Price Action",
        joinCourse: "สมัครเรียน", joinVip: "เข้าร่วม VIP", bookSeat: "จองที่นั่ง",
        contactTitle: "สนใจคอร์ส หรือ สัญญาณ VIP?", contactDesc: "แชทกับทีม Startup FX โดยตรง", chatWa: "แชท WhatsApp",
        trialLeft: "ทดลองใช้ฟรี เหลือ {n} วัน", trialEndsToday: "หมดทดลองวันนี้", expired: "บัญชีหมดอายุแล้ว",
        locked: "บัญชีถูกล็อก", lockedDesc: "การทดลอง/สมาชิกหมดอายุแล้ว กรุณาชำระเพื่อใช้ต่อ", payNow: "ชำระเพื่อปลดล็อก", actCodePlaceholder: "ใส่รหัส VIP ของคุณ", actCodeBtn: "ยืนยันรหัส", actCodeOk: "✅ ปลดล็อกสำเร็จ! ได้ VIP {n} วัน", actCodeErr: "❌ รหัสไม่ถูกต้องหรือใช้แล้ว",
        payTitle: "ต่ออายุสมาชิก", payDesc: "เลือกสกุลเงินแล้วสแกน QR เพื่อชำระ ({price}/เดือน)", perMonth: "/เดือน",
        scanToPay: "สแกน QR เพื่อชำระ", afterPay: "หลังชำระแล้ว ส่งสลิปให้ Startup FX ทาง WhatsApp เพื่อเปิดใช้งาน",
        sentSlip: "ส่งสลิป + ปลดล็อก (Demo)", copyAddr: "คัดลอก address", copied: "คัดลอกแล้ว!",
        rebateTitle: "เปิดบัญชี KCM — รับเงินคืน 15$ / 1 Lot", rebateDesc: "ลงทะเบียนผ่าน Startup FX แล้วรับ rebate ทุก lot ที่เทรด", registerKcm: "ลงทะเบียนเปิดบัญชี KCM",
        backToApp: "กลับไปหน้าวิเคราะห์",
        backendNote: "หมายเหตุ: การยืนยันการชำระ + ล็อก/ปลดล็อกจริง ต้องเชื่อม backend ของ Startup FX",
    },
    en: {
        planLifetime: "Lifetime Pro",
        pfCourseInc: "Gold Sniper course",
        pfEa: "EA Expert",
        pfFuture: "Future features",
        planLifeBadge: "Best value",
        pfCourseExtra: "Separate",
        howToUse: "How to use",
        howToTitle: "How to capture charts for best AI analysis",
        howToIntro: "For accurate AI analysis, please screenshot your chart like this:",
        howTo1Title: "1. Show the Timeframe",
        howTo1Desc: "Make sure the timeframe (M5, M15, H1, H4, D1) is visible in the image so the AI knows the time context. Sending multiple timeframes (e.g. H1 + M15) works best.",
        howTo2Title: "2. Enable key indicators",
        howTo2Desc: "Turn on EMA/MA, RSI or Volume if you use them. Keep price and candles clearly visible — don't bury them under too many lines.",
        howTo3Title: "3. Capture clearly & fully",
        howTo3Desc: "Include the latest candles and the current price. Keep the image sharp, not blurry, not cropped. Use XAU/USD (gold) as the main pair.",
        howToTip: "Tip: the sharper the image and the more complete the data, the more accurate the AI analysis.",
        howToClose: "Got it",
        secWallet: "Wallet",
        walletBalance: "Balance",
        walletEarned: "Total earned",
        walletPending: "Pending",
        secReferral: "Refer a friend",
        refDesc: "Invite friends to VIP — get {pct}% discount for every month your friend subscribes",
        refYourCode: "Your referral code",
        refYourLink: "Your invite link",
        refCopy: "Copy",
        refCopied: "Copied!",
        refShare: "Share link",
        refInvited: "Invited",
        refEarnings: "Referral earnings",
        refPeople: "people",
        refHowTitle: "How do I earn %?",
        refHow: "1) Share your link → 2) Friend subscribes VIP via your link → 3) Contact Admin via WhatsApp with proof → 4) Get {pct}% discount deducted from your next month fee",
        secWithdraw: "Withdraw (USDT)",
        wdAmount: "Amount",
        wdAddress: "USDT address (TRC20)",
        wdAddrPlaceholder: "Paste USDT address (TRC20)",
        wdMin: "Min {min} USDT",
        wdBtn: "Withdraw",
        wdNote: "Note: real USDT withdrawal needs a backend + crypto gateway. This is a UI demo.",
        wdInsufficient: "Insufficient balance",
        wdSuccess: "Withdrawal requested (demo)",
        wdHistory: "Withdrawal history",
        wdNone: "No withdrawals yet",
        demoBadge: "Demo",
        comingSoon: "Connect a backend to go live",
        learnTabPaid: "Video course",
        learnTabFree: "Lessons",
        lessonFreeTag: "free",
        lessonUnlockTitle: "Unlock all lessons",
        lessonUnlockDesc: "Some lessons are free to read. Go VIP to unlock {n} more lessons plus the full video course.",
        lessonUnlockBtn: "Unlock VIP",
        freeTitle: "Quality free lessons",
        freeDesc: "In-app lessons with illustrations — some free to read, deeper ones unlock with VIP.",
        freeWarn: "Note: these lessons are for education. Trading is risky — always practice on a demo account first.",
        freeRead: "Read lesson",
        freeBack: "Back",
        freeSummary: "Summary",
        freeKeyPoints: "Key points",
        freeMin: "min",
        freeDone: "Completed ✓",
        freeCatBasics: "Basics (beginner)",
        freeCatSmc: "Smart Money / ICT",
        freeCatAdvanced: "Advanced & books",
        freeOpen: "Open",
        freeBy: "by",
        forgotPw: "Forgot password?",
        forgotPwNote: "Please contact Startup FX on WhatsApp to recover your password (auto-reset needs a backend).",
        obSkip: "Skip",
        obNext: "Next",
        obStart: "Get started",
        obStep: "Step",
        ob1Title: "Welcome! 🎉",
        ob1Desc: "SniperTech AI analyzes XAU/USD and any pair with institutional-grade AI (SMC · Liquidity · ICT).",
        ob2Title: "📊 Analyze charts",
        ob2Desc: "Go to \"AI Tools\" → upload chart images (up to 6) → tap \"Generate signal\" → AI gives Buy/Sell + entry/SL/TP.",
        ob3Title: "🎓 Learn & News",
        ob3Desc: "\"Learn\" has the Gold Sniper course. \"News\" has announcements and signals from the admin.",
        ob4Title: "💰 Get Cashback",
        ob4Desc: "Open a trading account via KCM or KVB in-app → earn 15$ per lot traded. Tap a broker card on Home.",
        planCompare: "Compare plans",
        planFree: "Free (trial)",
        planVip: "VIP",
        planFeature: "Feature",
        planPrice: "Price",
        planFreePrice: "Free 3 days",
        planUpgrade: "Upgrade to VIP",
        pfAnalysis: "AI analysis",
        pfAnalysisFree: "Unlimited (3 days)",
        pfAnalysisVip: "Unlimited",
        pfNews: "News analysis",
        pfCharts: "Multi-image upload",
        pfCourse: "Gold Sniper course",
        pfSignal: "VIP signals",
        pfSupport: "Support",
        pfYes: "✓",
        pfNo: "✗",
        pfLimited: "Limited",
        planMostPop: "Most popular",
        planBestValue: "Best value",
        planSave: "Save",
        planPerMonth: "/mo",
        planOneTime: "One-time payment, lifetime access",
        planCurrent: "Current plan",
        planChoose: "Choose this plan",
        planFreeTag: "3-day free trial — all features (except VIP course)",
        planVipTag: "For serious traders",
        planProTag: "Pay once, everything forever",
        planAllFeatures: "Everything in VIP",
        pfPrediction: "🔮 AI news prediction",
        pfThemes: "Multiple themes",
        adminOnly: "Admin only",
        aiAdminNote: "Regular users never see this — clients just use the AI without knowing the engine. Admin connects the 3 AIs here.",
        aiUnlockAdmin: "Unlock admin mode",
        dailyUsed: "Used {n}/{max} today",
        dailyLimitHit: "Used all 5 today — upgrade to VIP for unlimited",
        aiEngine: "AI Engine",
        aiConsensus: "AI Consensus",
        aiActive: "Active",
        aiReady: "Ready (needs backend)",
        aiSoon: "Soon",
        aiClaudeDesc: "Strong at SMC · structure · reasoning",
        aiGptDesc: "Strong at patterns · stats",
        aiGeminiDesc: "Strong at multimodal · images",
        aiConsensusHigh: "Most AIs agree",
        aiConsensusMixed: "AIs disagree — caution",
        aiConsensusSingle: "Analyzed by Claude",
        aiNote: "Note: Claude works now. Adding Gemini + ChatGPT to vote needs a backend + each provider API key.",
        aiVote: "Vote",
        aiAgreement: "Agreement level",
        orContinue: "or continue with",
        continueGoogle: "Continue with Google",
        continueApple: "Continue with Apple",
        socialNote: "Note: Google/Apple sign-in needs a backend (Firebase Auth / OAuth). This button is a demo.",
        rebateTitleKvb: "Open a KVB account — get 15$ / 1 Lot cashback",
        registerKvb: "Register a KVB account",
        rAdvanced: "Advanced read",
        navHome: "Home",
        navTools: "AI Tools",
        navLearn: "Learn",
        navNews: "News",
        navProfile: "Profile",
        homeWelcome: "Hello",
        homeSubtitle: "Ready to trade? Pick a tool below",
        homeQuickTools: "Quick tools",
        homeAnnounce: "Latest announcement",
        profileTitle: "Profile",
        profileMember: "Member",
        secLanguage: "Language",
        secTheme: "Color theme",
        themeDesc: "Pick the app's look and feel",
        secNotify: "Notifications",
        secSettings: "App settings",
        secHelp: "Help & support",
        setNotifyDesc: "Get notified about new posts or signals",
        helpContact: "Contact the team",
        helpFaq: "FAQ",
        helpAbout: "About",
        helpTerms: "Terms & risk",
        setDarkMode: "Dark mode",
        setSound: "Notification sound",
        aboutVer: "Version",
        memberSince: "Member since",
        daysRemaining: "{n} days left",
        tabCourse: "Course",
        tabNews2: "News room",
        courseTitle: "Gold Sniper Masterclass",
        courseSub: "Full SMC · Order Block · Liquidity · Order Flow course",
        courseLocked: "This course is locked",
        courseLockedDesc: "Pay 100$ once to unlock and watch all videos unlimited, forever.",
        coursePrice: "100$ (one-time)",
        courseUnlock: "Unlock course 100$",
        courseUnlocked: "Unlocked ✓ unlimited access",
        courseLessons: "Lessons",
        courseLesson: "Lesson",
        courseWatch: "▶ Watch",
        courseLockedTag: "🔒 Locked",
        courseDemoUnlock: "Sent slip + unlock (Demo)",
        courseBackendNote: "Note: real payment verification + video hosting need a backend (e.g. Vimeo/YouTube + membership).",
        roomTitle: "News & announcements",
        roomSub: "Posts from the Startup FX team",
        roomEmpty: "No announcements yet",
        roomNotifyOn: "🔔 Enable notifications",
        roomNotifyOff: "🔕 Notifications off",
        roomNotifyDenied: "Blocked — enable in browser settings",
        roomAdmin: "Admin mode",
        roomPostPlaceholder: "Type an announcement... (admin only)",
        roomPostBtn: "Post",
        roomNew: "New",
        roomBackendNote: "Note: real-time push to every customer phone needs a push backend (Firebase Cloud Messaging). In this artifact, notifications work for this browser only.",
        rSmc: "Smart Money read",
        rPremDisc: "Premium / Discount",
        rLiquidity: "Liquidity / Sweep",
        rOrderFlow: "Order Flow",
        rOrderBook: "Order Book / DOM",
        rNewsAlert: "⚠️ News alert",
        rDxy: "DXY (confirm)",
        rOil: "Oil",
        rIntermarket: "Intermarket",
        wrTitle: "Win probability (est.)",
        wrConfidence: "AI confidence",
        wrGrade: "Confluence grade",
        wrFactors: "Supporting factors",
        wrNote: "Estimated from confluence — not a guarantee. Every setup can fail.",
        wrLow: "Low",
        wrMed: "Med",
        wrHigh: "High",
        footer: "© Startup FX · This tool provides educational analysis, not financial advice or guaranteed signals. No system wins 90% of trades — every setup can fail. Trade only with risk capital and always use a stop.",
        rInstrument: "Instrument",
        rTimeframe: "Timeframe",
        rTrend: "Trend",
        rMacro: "News / Macro context",
        rZones: "Sniper zones",
        rSupport: "Support",
        rResist: "Resistance",
        rLong: "Buy zone",
        rShort: "Sell zone",
        rReady: "Ready",
        rWait: "Wait",
        rGrade: "Grade",
        rConf: "Conf",
        rEntry: "Entry",
        rStop: "Stop",
        rInvalid: "Invalidation:",
        rNext: "Next Move",
        rNoTrade: "When to stay out",
        rQuickMap: "Trade plan summary",
        rCantRead: "Can't read this chart",
        rBias: "Bias",
        rReasons: "Confluences",
        rChecklist: "Checklist before entry",
        rChk1: "Wait for a confirmation candle (most important)",
        rChk2: "Don't chase price",
        rChk3: "SL must be acceptable",
        rSetupTitle: "Trading Setup",
        nTitle: "Today's economic news",
        nDesc: "AI pulls today's calendar (from ForexFactory + Investing.com) and separates high-impact / red-folder events, other events, and off-calendar news for easy reading.",
        nFetch: "🔍 Fetch & analyze today's news",
        nFetching: "Fetching news…",
        nGold: "Gold:",
        nHigh: "🔴 High-impact / red-folder",
        nHighEmpty: "No high-impact news today",
        nOther: "🟡 Other events (med/low)",
        nOtherEmpty: "No other notable events",
        nOff: "📢 Off-calendar / breaking",
        nOffEmpty: "No off-calendar news",
        nGlanceHigh: "🔴 High",
        nGlanceOther: "🟡 Other",
        nGlanceOff: "📢 Off-cal",
        nTradeNote: "Today's trading note",
        nItems: "items",
        nForecast: "Forecast",
        nPrevious: "Previous",
        nPrediction: "🔮 AI prediction",
        nPredLock: "🔒 AI prediction — VIP only",
        nPredLockDesc: "Unlock the AI's number forecast and USD/gold direction with VIP.",
        nPredUnlock: "👑 Upgrade to VIP to unlock",
        nUsdEffect: "USD effect",
        nGoldEffect: "Gold effect",
        nLocalTime: "Local time",
        usdStrong: "USD strong 💵↑",
        usdWeak: "USD weak 💵↓",
        usdNeutral: "USD neutral",
        goldUp: "Gold up 🟢",
        goldDown: "Gold down 🔴",
        goldVol: "Gold volatile 🟡",
        memberOnly: "Members only", login: "Log in", signup: "Sign up",
        email: "Email", password: "Password", fullname: "Full name", yourName: "Your name",
        brokerAcc: "Trading account (broker + number)", brokerHint: "Clients who opened via Startup FX",
        startUsing: "Sign up & start", noAccount: "No account yet?", agree: "I understand trading is risky, Startup FX does not guarantee profit or winrate, and signals are for education only.",
        errEmail: "Enter a valid email and a password of 6+ characters.", errName: "Enter your name and accept the terms first.",
        waHelp: "Ask about signup / account via WhatsApp", logout: "Log out",
        analyzeChart: "Analyze chart", analyzeNews: "Analyze news", analyzeRoom: "Analysis room", maxImgs: "Up to {n} images",
        direction: "Bias", checkNews: "Check news (DXY · Fed · high-impact)", on: "On", off: "Off",
        dropHere: "Drag a chart screenshot here", clickChoose: "Click to choose — up to {n} images · AI detects pair & timeframe · PNG / JPG",
        addImg: "+ Add image", makeSignal: "⚡ Generate signal", clearAll: "Clear all", analyzing: "Analyzing…",
        biasAuto: "Auto-detect", biasLong: "Buy only", biasShort: "Sell only", styleSwing: "📊 Normal", styleScalp: "⚡ Scalping",
        heroDesc: "Analyze any pair + Crypto with AI — mark Order Block · Liquidity · Confluence, then build a ready signal.",
        secondOpinion: "A second opinion, not a guaranteed signal.",
        promoTitle: "Promotions & Courses", promo1: "Learn SMC · Order Block · Liquidity in 8 weeks", promo2: "Daily signals + personal risk coaching", promo3: "For beginners — Price Action foundations",
        joinCourse: "Enroll", joinVip: "Join VIP", bookSeat: "Book seat",
        contactTitle: "Interested in a course or VIP signals?", contactDesc: "Chat with the Startup FX team directly.", chatWa: "Chat on WhatsApp",
        trialLeft: "Free trial — {n} days left", trialEndsToday: "Trial ends today", expired: "Account expired",
        locked: "Account locked", lockedDesc: "Your trial/membership has expired. Please pay to continue.", payNow: "Pay to unlock", actCodePlaceholder: "Enter your VIP code", actCodeBtn: "Activate", actCodeOk: "✅ Activated! VIP for {n} days", actCodeErr: "❌ Invalid or already used code",
        payTitle: "Renew membership", payDesc: "Pick a currency and scan the QR to pay ({price}/month)", perMonth: "/mo",
        scanToPay: "Scan QR to pay", afterPay: "After paying, send the slip to Startup FX on WhatsApp to activate.",
        sentSlip: "Sent slip + unlock (Demo)", copyAddr: "Copy address", copied: "Copied!",
        rebateTitle: "Open a KCM account — get 15$ / 1 Lot cashback", rebateDesc: "Register via Startup FX and earn a rebate on every lot you trade.", registerKcm: "Register a KCM account",
        backToApp: "Back to analysis",
        backendNote: "Note: real payment verification + lock/unlock require connecting Startup FX's backend.",
    },
};
function tr(lang, key, vars) {
    let s = (T[lang] && T[lang][key]) || T.en[key] || key;
    if (vars)
        for (const k in vars)
            s = s.replace(`{${k}}`, vars[k]);
    return s;
}
function extractJson(text) {
    const a = text.indexOf("{");
    const b = text.lastIndexOf("}");
    if (a === -1 || b === -1)
        throw new Error("no json");
    return JSON.parse(text.slice(a, b + 1));
}
// If the model's JSON got cut off (token limit), salvage it by progressively
// trimming from the end until JSON.parse succeeds, closing open brackets/quotes
// at each candidate cut point. Recovers whatever complete fields exist.
function tryRepairJson(text) {
    const start = text.indexOf("{");
    if (start === -1)
        return null;
    const full = text.slice(start);
    const close = (str) => {
        let inStr = false, esc = false, open = 0, openSq = 0;
        for (const ch of str) {
            if (esc) {
                esc = false;
                continue;
            }
            if (ch === "\\") {
                esc = true;
                continue;
            }
            if (ch === '"') {
                inStr = !inStr;
                continue;
            }
            if (inStr)
                continue;
            if (ch === "{")
                open++;
            else if (ch === "}")
                open--;
            else if (ch === "[")
                openSq++;
            else if (ch === "]")
                openSq--;
        }
        let out = str;
        if (inStr)
            out += '"';
        while (openSq-- > 0)
            out += "]";
        while (open-- > 0)
            out += "}";
        return out;
    };
    const seen = new Set();
    for (let i = full.length; i > 0; i--) {
        const c = full[i - 1];
        if (!(c === "}" || c === "]" || c === '"' || /[0-9eltrufalsn]/.test(c)))
            continue;
        if (seen.has(i))
            continue;
        seen.add(i);
        let s = full.slice(0, i);
        s = s.replace(/,\s*"[^"]*"\s*:\s*("[^"]*)?$/g, "");
        s = s.replace(/,\s*"[^"]*"\s*:?\s*$/g, "");
        s = s.replace(/[,\s]*$/g, "");
        try {
            const obj = JSON.parse(close(s));
            if (obj && typeof obj === "object")
                return obj;
        }
        catch { /* try a shorter cut */ }
    }
    return null;
}

// ── Watermark Component ──────────────────────────────────────
function Watermark() {
    const text = "020 7777 7421  |  Startup FX Academy";
    const items = Array.from({ length: 40 }, (_, i) => i);
    // Inject print-only CSS once
    React.useEffect(() => {
        const id = "wm-style";
        if (!document.getElementById(id)) {
            const s = document.createElement("style");
            s.id = id;
            // Hidden on screen, visible only when printing / screenshotting via media print
            s.textContent = `
                #wm-layer { display: none !important; }
                @media print {
                    #wm-layer { display: block !important; }
                    #wm-layer * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `;
            document.head.appendChild(s);
        }
    }, []);
    return React.createElement("div", {
        id: "wm-layer",
        "aria-hidden": true,
        style: {
            position: "fixed", inset: 0, zIndex: 9998,
            pointerEvents: "none", overflow: "hidden",
            userSelect: "none", WebkitUserSelect: "none",
        }
    },
        React.createElement("div", {
            style: {
                position: "absolute", inset: "-50%",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "40px 20px",
                transform: "rotate(-30deg)",
                opacity: 0.18,
            }
        },
            items.map(i => React.createElement("div", {
                key: i,
                style: {
                    color: "#A9E0FF",
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    fontFamily: "'Sora','Inter',sans-serif",
                    letterSpacing: "0.05em",
                    padding: "20px 10px",
                }
            }, text))
        )
    );
}

function SniperTechX() {
    // ── Language (auto-detect, switchable) ──
    const [lang, setLang] = useState(() => { try { return localStorage.getItem("sniper_lang") || "lo"; } catch(e) { return "lo"; } });
    const [showSplash, setShowSplash] = useState(true);
    useEffect(() => { const id = setTimeout(() => setShowSplash(false), 2600); return () => clearTimeout(id); }, []);
    const t = (k, vars) => tr(lang, k, vars);
    // ── Auth + membership (UI demo — connect to your backend for real verification) ──
    const [user, setUser] = useState(() => {
        try { const s = localStorage.getItem("sniper_user"); return s ? JSON.parse(s) : null; } catch(e) { return null; }
    }); // {name, email, plan, expiresAt}
    const [showPay, setShowPay] = useState(false);
    const [nav, setNav] = useState("home"); // home | tools | learn | news | profile
    const [tab, setTab] = useState("chart"); // tools sub-tab: chart | news
    const [courseUnlocked, setCourseUnlocked] = useState(false); // DEMO — backend should verify $100 payment
    const [learnTab, setLearnTab] = useState("paid"); // learn sub-tab: paid | free
    const [notify, setNotify] = useState(typeof Notification !== "undefined" && Notification.permission === "granted");
    // Multi-AI consensus: which engines are enabled. Only Claude runs now; others need a backend.
    const [aiEngines, setAiEngines] = useState({ claude: true, gpt: true, gemini: true });
    const [isAdmin, setIsAdmin] = useState(() => {
        // Restore admin state on reload if user email matches ADMIN_EMAILS
        try { const s = localStorage.getItem("sniper_user"); if (s) { const u = JSON.parse(s); return isAdminEmail(u.email); } } catch(e) {} return false;
    }); // admin unlock — hides AI engine internals from clients
    React.useEffect(() => { if (isAdmin) setCourseUnlocked(true); }, [isAdmin]);
    // ── Theme: mutate live C palette + re-render whole app on change ──
    const [theme, setThemeState] = useState(DEFAULT_THEME);
    const setTheme = (key) => { const applied = applyTheme(key); setThemeState(applied); };
    useEffect(() => { applyTheme(theme); }, [theme]);
    const [dailyCount, setDailyCount] = useState(0); // free-trial daily analysis counter (DEMO)
    const [showOnboard, setShowOnboard] = useState(false); // first-time tutorial
    const [showHowTo, setShowHowTo] = useState(false); // "How to screenshot" guide modal
    const [charts, setCharts] = useState([]);
    const [biasIdx, setBiasIdx] = useState(0);
    const [styleIdx, setStyleIdx] = useState(0); // 0=swing, 1=scalp — resets every session
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState("");
    const [result, setResult] = useState(() => {
        try { const s = localStorage.getItem("sniper_result"); return s ? JSON.parse(s) : null; } catch(e) { return null; }
    });
    const [err, setErr] = useState(null);
    const fileRef = useRef(null);
    const addFiles = useCallback((files) => {
        const list = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
        if (list.length === 0) {
            setErr("ໄຟລ໌ນັ້ນບໍ່ແມ່ນຮູບພາບ. ອັບໂຫຼດ screenshot ກຣາຟ (PNG / JPG).");
            return;
        }
        setErr(null);
        setResult(null);
        setCharts((prev) => {
            const room = MAX_CHARTS - prev.length;
            const take = list.slice(0, room);
            const readers = take.map((file) => new Promise((res) => {
                const r = new FileReader();
                r.onload = (e) => {
                    const url = e.target.result;
                    res({ id: ++UID, url, b64: url.split(",")[1], mime: file.type });
                };
                r.readAsDataURL(file);
            }));
            Promise.all(readers).then((added) => setCharts((c) => [...c, ...added].slice(0, MAX_CHARTS)));
            return prev;
        });
    }, []);
    const onDrop = (e) => { e.preventDefault(); addFiles(e.dataTransfer.files); };
    const removeChart = (id) => setCharts((c) => c.filter((x) => x.id !== id));
    const analyze = async () => {
        if (charts.length === 0) {
            setErr("ກະລຸນາອັບໂຫຼດ screenshot ກຣາຟກ່ອນ.");
            return;
        }
        // Trial = FULL access to all features for 3 days (no per-day cap). The only
        // thing trial users don't get is the VIP video course. Expiry after TRIAL_DAYS
        // is the natural limit. (Real enforcement still needs a backend.)
        setLoading(true);
        setErr(null);
        setResult(null);
        setStage("ກຳລັງວິເຄາະກຣາฟ…");
        const outLang = lang === "th" ? "Thai (ภาษาไทย)" : lang === "en" ? "English" : "Lao (ພາສາລາວ)";
        const biasEn = biasIdx === 1 ? "Buy only" : biasIdx === 2 ? "Sell only" : "Auto-detect";
        const isScalp = styleIdx === 1;
        // No web search — analyze instantly. The model uses its own knowledge to give a
        // GENERAL news/DXY caution (no live lookup), which keeps analysis fast.
        const searchBlock = `STEP 1 — Do NOT use any tool or web search. Work only from the uploaded chart(s) and your own general knowledge. For "news_alert", "dxy_signal" and "oil_signal": give a SHORT general caution from what you already know (e.g. "If near a Fed/FOMC, NFP, CPI or PCE window, expect volatility — confirm the calendar yourself", and the usual DXY↔gold inverse relationship). Do NOT claim live/current prices or today's exact DXY level — keep these as general guidance, and if you have no specific basis, keep them brief or note the trader should check the live calendar.`;
        const scalpRules = "SCALPING — Strict rules: Use H1+M15+M5 only. Entry ONLY after liquidity sweep on M5/M15. M15 OB/FVG must be fresh. M5 must close body beyond OB/FVG + BOS/CHoCH confirmed. SL below OB max 20 pip. TP1 15-20 pip, TP2 30-40 pip, TP3 60 pip max. Skip if fewer than 4/5 conditions align. Confidence<60% = output wait. Flag false-signal risk (low/medium/high).";
        const sys = `You are an elite XAU/USD (gold) ${isScalp ? "SCALPING" : "intraday"} analyst giving a SHORT, ready-to-use trade signal. Bias preference: ${biasEn}. Trading style: ${isScalp ? scalpRules : "SWING INTRADAY — standard SL 30-120 pip, standard TP levels"}. The user uploaded ${charts.length} chart screenshot(s) without timeframe labels.

STEP 0 — DETECT each image's TIMEFRAME yourself from the chart's labels (e.g. "M5","15","1H","H4","D"), axis spacing and candle granularity. Report in "detected_timeframes" (in ${outLang}). Use higher TFs for trend/bias, lower TFs for entry.

${searchBlock}

INTERMARKET RULE (very important — USD drives gold inversely):
- DXY UP → gold pressured DOWN; DXY DOWN → gold supported UP. Factor the DXY direction you found into your bias and state it in "dxy_signal".
- Crude Oil can hint at inflation/risk sentiment; note any meaningful read in "oil_signal" (keep short, secondary).
- If a high-impact news event is imminent, WARN in "news_alert" (one short line: what + when + caution). If nothing major, set "news_alert" to a short "no major news" note.

STEP 2 — Read the chart like an institutional/Smart-Money analyst. Work top-down and require multiple of these to AGREE before trusting a setup:

A) PREMIUM / DISCOUNT (very important for entry quality): Take the most relevant swing (recent impulse leg). Mark its 50% (equilibrium) using Fibonacci. Price BELOW 50% = DISCOUNT zone → favor BUYS there. Price ABOVE 50% = PREMIUM zone → favor SELLS there. State clearly which zone price is in now in "premium_discount". Premium/discount must MATCH the trade direction (don't buy in deep premium or sell in deep discount unless there is a strong reason).

B) LIQUIDITY: Identify obvious liquidity pools — equal highs/lows, prior day/session high-low, trendline liquidity (where stops cluster). A LIQUIDITY SWEEP / GRAB = price spikes through that level then snaps back (stop hunt). A sweep that reverses INTO a discount/premium zone with displacement is a high-quality signal. Describe the key sweep in "liquidity".

C) ORDER FLOW: Read momentum from candle behavior — displacement (strong impulsive candles = institutional intent), absorption (large opposing candles that fail to follow through), break of structure (BOS) confirming direction, change of character (CHoCH) warning of reversal. Summarize the current order-flow read in "order_flow" (which side has control right now).

D) ORDER BLOCKS & FVG: Mark the last opposing candle before a displacement move (order block) and any Fair Value Gap / imbalance left behind. These are high-probability re-entry zones. Fold into the zones/setup.

E) ORDER BOOK / DOM: Only comment on order book / depth-of-market IF the screenshot actually shows DOM, footprint, or a volume profile. If it does, read it. If it does NOT (a normal candlestick chart), say so honestly in "order_book" (e.g. note that DOM is not visible and you used volume/price action instead) — do NOT fabricate bid/ask depth you cannot see.

Confluence target: the BEST setups stack several of the above (e.g. sweep of liquidity + into discount + order block + BOS + DXY agreeing). The more that align, the higher the grade.

STEP 3 — ADVANCED CONFIRMATIONS (apply when the chart clearly shows them; do NOT force a pattern that isn't there — say "not clear" rather than inventing one):
- ELLIOTT WAVE: if a clean impulse/correction is visible, state the likely wave count (e.g. "in wave 3 of 5" or "ABC correction") and what it implies next. Keep it simple.
- WYCKOFF: identify accumulation/distribution schematics if present — spring, upthrust (UTAD), sign of strength/weakness, the phase (A-E). Note which phase price seems to be in.
- HARMONIC PATTERNS: spot Gartley, Bat, Butterfly, Crab, or Shark if the swing ratios fit; give the potential reversal zone (PRZ). Only if ratios actually align.
- ICT KILLZONES (timing): note which session/killzone is active or upcoming (Asian range, London Open 07:00-10:00 UK, New York Open / AM session 08:00-11:00 ET, London close). Gold often runs liquidity during London & NY opens — factor timing into the entry.
- EXPECTED RANGE / IMPLIED VOLATILITY (CME QuikStrike Vol2Vol): if the uploaded image is a CME QuikStrike Vol2Vol Expected Range chart (OG|GC options), read it as follows:
  • RANGES BAR (top of chart): the colored range boxes show 1σ/2σ/3σ standard-deviation expected move from current futures price. The tightest center boxes = highest-probability range for the expiration. Read the dollar values and use them as TP/SL outer limits.
  • INTRADAY VOLUME chart: orange bars = PUT volume by strike, blue bars = CALL volume by strike. Heavy PUT volume at a strike = strong SUPPORT / institutional hedge floor. Heavy CALL volume at a strike = strong RESISTANCE / distribution ceiling. A strike where BOTH put and call volume spike = max pain / pin risk zone — price gravitates there at expiration.
  • OPEN INTEREST (OI) chart: same color coding but shows CUMULATIVE open contracts, not just today's volume. High PUT OI strike = dealers are long gamma / short delta there = acts as magnetic support. High CALL OI strike = dealers are short gamma / long delta = acts as magnetic resistance. The strike with the LARGEST total OI (put+call) = MAX PAIN price — institutions often pin price near max pain into expiration.
  • VOLATILITY SMILE (red dashed line): the U-shaped volatility curve. Where the smile is LOWEST = ATM implied volatility. Where it rises steeply on put side = fear premium. A skewed smile (puts much higher vol than calls) = market fears downside; flat or call-skewed smile = bullish flow. Read the ATM vol level and note direction of skew.
  • VOL CHG field: if shown (e.g. "Vol Chg: -5.68"), negative = IV dropping = market calming / directional move expected soon; positive = IV rising = uncertainty / big move coming.
  • DELTA MARKERS (dashed vertical lines labeled 5ΔP, 15ΔP, 25ΔP, 35ΔP, 45ΔP, 45ΔC, 35ΔC, 25ΔC, 15ΔC, 5ΔC): these show where options with those delta values are struck. The 25ΔP and 25ΔC lines bracket the "expected 1σ move" range. Any price action OUTSIDE the 25Δ lines is statistically in the tail (< 25% probability).
  • DTE (Days To Expiration): shown in title (e.g. "0.89 DTE"). < 1 DTE = same-day or next-day expiry = gamma extremely high = price moves are violent and pinned near max pain or major OI strikes.
  • FUTURE CHG: current futures price change vs prior settle. Combine with where price sits relative to max pain strike — if price is below max pain, dealers are buying futures to hedge (upward pressure); if above max pain, dealers are selling (downward pressure).
  HOW TO TRADE FROM THIS:
  1. Find the MAX PAIN strike (largest total OI) → this is the gravitational center for intraday price.
  2. Find the highest PUT OI strike BELOW current price → this is the floor / strong support.
  3. Find the highest CALL OI strike ABOVE current price → this is the ceiling / strong resistance.
  4. Combine with 25ΔP/25ΔC range → entries inside this range are in the "expected move" zone; entries near the edges are mean-reversion trades.
  5. If Vol Chg is sharply negative AND DTE < 1 → expect a pinning move toward max pain → fade breakouts, trade range.
  6. If Vol Chg is rising AND large directional volume (one side dominant) → expect a breakout toward that side.
  Report findings in "options_flow" field with: max_pain_strike, put_wall, call_wall, expected_range_1sigma, iv_atm, vol_skew_direction, trade_implication (1-2 lines).
- ICT POWER OF 3 (AMD): look for Accumulation (range/consolidation), Manipulation (fake breakout / liquidity grab), then Distribution (real move begins). Identify which phase is active and whether the manipulation candle (stop hunt) has already completed.
- ICT SILVER BULLET: identify if price is in a Silver Bullet window (10:00-11:00 ET or 14:00-15:00 ET New York time). A FVG formed during these windows inside a killzone = premium entry. Flag if visible.
- ICT OPTIMAL TRADE ENTRY (OTE): the highest-probability entry sits in the 0.618-0.786 Fibonacci retracement of the last confirmed swing (AFTER a BOS/CHoCH). If price has retraced into the 62-79% zone overlapping an OB or FVG, flag as OTE = true.
- BREAKER BLOCKS: a prior OB that price broke through decisively becomes a Breaker — it flips polarity (old support → resistance, old resistance → support). Identify any visible Breaker on the chart.
- MITIGATION BLOCKS: if price returned to partially fill an OB (50-100% fill) before moving, that OB may be "mitigated" and weaker. Mark only fresh/untested OBs as high-quality.
- PROPULSION BLOCKS: the last candle BEFORE a strong displacement move (often a small doji/inside bar right before the explosive candle). This is the sharpest entry inside the OB.
- ICT CONSEQUENT ENCROACHMENT (CE): midpoint of a FVG — price often reacts exactly at the 50% of a FVG before continuing. Use as fine-entry inside a FVG.
- TURTLE SOUP / STOP HUNT REVERSAL: equal highs/lows being swept = retail stop hunt by institutions. After sweep + displacement candle reversing = sniper entry. Check for this pattern.
- JUDAS SWING: early-session fake move opposite to the real direction (common London open 08:00-09:00 UK). If price spikes one way then violently reverses during killzone — that reversal is the real move.
- MARKET MAKER MODEL: institutions accumulate → mark up → distribute → mark down. Identify which phase the current structure suggests and trade WITH the market maker, not against.
- SMC MONTHLY/WEEKLY/DAILY BIAS: always frame the D1/W1 bias first. Daily candles closing as displacement = bias confirmed. HTF bias overrules LTF setups — never trade a LTF Buy into a D1/W1 premium resistance.
- VOLUME IMBALANCE / SINGLE PRINT: thin areas on volume profile (single prints) act like FVGs — price is magnetically drawn back to fill them. If visible on chart, mark as high-priority target.

Summarize whatever of STEP 3 is genuinely present in "advanced_read" (one short line each that applies; omit what's not visible).

PROFESSIONAL PLAYBOOK — apply this institutional + prop-firm-funded knowledge to raise accuracy (distilled from how funded/institutional gold traders actually operate):
A) CORE SEQUENCE (the institutional gold routine): (1) mark untapped HTF levels (prior day/session high-low, HTF order block, FVG, equal highs/lows); (2) WAIT for price to reach the level — never predict; (3) wait for a liquidity SWEEP of that level (stop-hunt that traps retail); (4) confirm DISPLACEMENT / BOS / MSS on a lower timeframe (M5/M1) showing intent; (5) enter on the resulting FVG/OB refinement; (6) target the NEXT opposing liquidity pool. If any step is missing, grade lower or set status "wait".
B) GOLD'S PERSONALITY: XAU/USD moves far faster than FX, hunts stops aggressively, and prints long misleading wicks. Demand a candle-BODY close beyond a level (not just a wick) to confirm BOS/CHoCH. Gold needs WIDER stops than FX but the ENTRY must be refined on a lower timeframe so the stop stays tight in dollar terms.
C) PREMIUM/DISCOUNT IS NON-NEGOTIABLE: use the dealing-range 50% (equilibrium). Only SELL from premium (above EQ), only BUY from discount (below EQ). Best entries sit in the 0.62-0.79 OTE zone overlapping an OB/FVG.
D) SESSIONS / KILLZONES: the cleanest institutional moves happen in the London open and New York open killzones. An Asian-range breakout is only trustworthy when confirmed by a killzone. Flag low-volume chop (late NY / Asian mid-range) as lower-confidence.
E) TAKE-PROFIT METHOD (how funded desks bank gold): set TPs at the NEXT real liquidity pools / opposing OB / session high-low — NOT round guesses. Use TIERED partials: TP1 = nearest liquidity (bank ~⅓-½, then move SL to break-even), TP2 = mid pool, TP3 = far pool, and leave a small runner trailed behind structure (don't trail too tight — gold's noise will stop you out). Always ensure TP1 alone gives at least 1:2 R, with overall 1:3+ available. A funded trader needs only ~40% win rate at 1:3 to be profitable, so quality > frequency.
F) PROP-FIRM RISK DISCIPLINE (bake this into the risk_reminder and confidence): risk only 0.5-1% per trade; never average down / martingale; one A+ confluence setup beats many mediocre ones; respect daily loss limits (stop after 2-3 losses); the stop must be a price the trader can accept BEFORE entry. "Not being wrong for long" matters more than being right.
G) CONFLUENCE STACKING decides the grade: HTF bias + premium/discount alignment + liquidity sweep + OB/FVG + BOS/displacement + session timing + DXY agreeing. 5+ aligned = high grade; 2-3 = medium; <2 = wait. Never inflate.
H) ICT SMART MONEY CONCEPTS — ELITE LAYER (from ICT Mentorship 2022-2024 & Inner Circle Trader public teachings):
   • INDUCEMENT (IDM): before a real move, institutions deliberately create a fake level to lure retail entries and grab their stops. Look for a small swing high/low that forms inside consolidation pointing the WRONG direction — that is the inducement. After price sweeps IDM and reverses = sniper entry.
   • DEALING RANGE REFINEMENT: the best ICT entries use a nested discount-within-discount (for buys) or premium-within-premium (for sells). When price is already in the daily discount, find the H1 sub-range and enter in the H1 discount too. Double-layered alignment = highest quality.
   • UNICORN MODEL (ICT 2022): BOS on H1 → price drops into H1 FVG that overlaps with M15 OB → entry. This is one of ICT's cleanest published models. Flag if this structure is visible.
   • SILVER BULLET ENTRY DRILL: the 3-candle FVG during the 10:00 or 14:00 ET Silver Bullet window, aligned with the daily bias, is high probability. Enter on a retest of that FVG if price has not already left the window.
   • DAILY PROFILES: ICT teaches 4 daily price delivery models — Classic Bullish (HTF buy day: manipulate down AM, distribute up PM), Classic Bearish (HTF sell day: pump AM, dump PM), Consolidation, and Trending. Identify which profile best fits the current daily candle action.
   • TIME & PRICE THEORY: institutional algorithms target SPECIFIC price levels at SPECIFIC times (e.g. prior day high at London open, prior week high at NY open). Combine price levels with killzone timing for highest precision.
   • ASIA RANGE BOX: mark the Asian session high/low (22:00-07:00 UK). London often breaks one side (fake) then reverses to take the other. NY then continues the true direction. Note if Asian range is defined and which side was breached.
   • QUARTERLY SHIFTS (ICT): every quarter (Jan, Apr, Jul, Oct) institutions rebalance. The first 2 weeks of a new quarter often establish the quarterly bias (bullish or bearish). If near a quarterly shift, note higher institutional activity.
I) GLOBAL SNIPER TECHNIQUES (from elite SMC communities worldwide — Stacey Burke, The Trading Fraternity, Phantom Trading):
   • STACEY BURKE — FIBONACCI FLOW: the 50% retracement of the LAST impulse leg (not just any swing) = the "Fibonacci Flow" level. Price consistently returns to this exact 50% before continuing. If price is AT the 50% of the last impulse = ultra-high confluence entry zone.
   • MOMENTUM SHIFT ENTRY: after a BOS, wait for price to retrace to the 50-61.8% of the breaking candle itself (not the whole swing) — this micro-entry keeps stops tiny and maximizes RR.
   • PHANTOM TRADING — KILL CANDLE: the first strong displacement candle of the session (the one that breaks a key level with a full-bodied close). The open of that candle + the FVG it creates = the re-entry zone. Never miss a kill candle retest.
   • LIQUIDITY VOID FILL: after a fast displacement (gap-like move with no retracement), price MUST return to fill at least 50% of the void before reaching TP. Account for this retrace in the trade plan — it is not a reversal, it is filling before continuation.
   • MULTI-TIMEFRAME FRACTAL ALIGNMENT: the same OB/FVG structure repeating on D1, H4, H1, and M15 simultaneously = fractal alignment. When 3+ timeframes show the same zone, grade it A+++ regardless of other confluence.
   • SNIPER ENTRY DRILL (prop-firm standard): after all confluences align, zoom to M1-M5 and wait for a micro-CHoCH (1 swing high/low taken out on M1) pointing in trade direction inside the entry zone. This micro-confirmation reduces false entries by ~40% and tightens SL dramatically.

ANALYZE ONLY what is visible. If an image is unclear or not a price chart, set "readable" false and explain briefly in "note".

HARD RULES (protect the trader):
- SNIPER PRECISION (critical): this is a SNIPER signal, not a wide swing zone. The "entry_zone" MUST be TIGHT — for gold (XAU/USD) keep it roughly 3-8 dollars wide (≈ 30-80 pip), and NEVER wider than 10 dollars (100 pip). A wide zone like 4200-4225 (25 dollars) is WRONG — narrow it to the single best refined zone (e.g. an M5/M15 order block or FVG inside the larger area), e.g. 4200-4206. Pick the most precise entry, not the whole range.
- STOP LOSS at a structurally valid level just beyond the OB/swing that invalidates the idea — but keep it REALISTIC and CONTROLLED: target about 30-120 pip (≈ 3-12 dollars) on gold. NEVER report an SL more than 150 pip (15 dollars) away — if structure seems to require more than that, the entry zone is wrong, so refine to a lower-timeframe entry closer to invalidation instead of widening the stop. Report distance in "sl_pips". Also avoid tiny forced stops (an 8-pip stop on gold gets hunted) — the sweet spot is a tight but breathable 30-120 pip.
- The distance from entry to the FINAL target (TP3) should be reasonable for an intraday move — do NOT stretch the whole entry→SL→TP span across hundreds of dollars. If your levels imply a ~2500-pip span, they are far too wide: tighten them.
- TP1/TP2/TP3 at real targets; report honest "rr". Don't invent targets to fake 1:3.
- "confidence" realistic: clean setups ≈60-75%, ordinary 45-65%. A textbook A+ setup (all confluences aligned) may reach up to 80%, but NEVER above 80%, and NEVER claim 90%+. Use a range like "70-78%".
- Grade "ສູງ"/"ກາງ"/"ຕ່ຳ" by genuine confluence (more factors agree, NOT guaranteed win).
- If price hasn't reached a quality zone, set status "ລໍຖ້າ".
- Use "Buy" / "Sell" for direction (NEVER "Long"/"Short").
- For Elliott/Wyckoff/Harmonic: be honest — only name a pattern if the structure truly fits. "not clear" is a valid, respected answer (in the output language).

KEEP IT TIGHT — each text field 1 short sentence (the SMC reads above are 1 line each). Max 2 zones, 1 primary setup + at most 1 alternative, up to 5 confluence factors. Output ONLY the JSON.

Write ALL text values in ${outLang} (keep "status"/"grade" keys in Lao as shown). Numbers, prices, TFs, pips, ratios, % stay as digits.

Respond with ONLY a valid JSON object — no markdown, no backticks. Write every text value in ${outLang} (but keep the "status" and "grade" keys in Lao exactly as shown):
{
  "readable": true,
  "note": "in ${outLang}, only if needed",
  "detected_timeframes": "in ${outLang} — e.g. 1 = H4, 2 = M15",
  "news_alert": "in ${outLang} — high-impact news happening now/soon + caution, or a short 'no major news' note",
  "dxy_signal": "in ${outLang} — DXY direction today + what it means for gold (1 line)",
  "oil_signal": "in ${outLang} — crude oil direction + brief note (1 line, secondary)",
  "instrument_guess": "e.g. XAU/USD",
  "trend": "in ${outLang} — main trend + bias (1 short line)",
  "timeframe_breakdown": [{"tf":"H4|H1|M15|M5","read":"in ${outLang} — ONE very short phrase, e.g. 'Sideway on supply', 'Sweep high then stall'"}],
  "bias": "Buy|Sell|Wait — single word direction bias from the multi-TF read",
  "structure": "in ${outLang}, 1-2 short sentences max",
  "premium_discount": "in ${outLang} — is price in DISCOUNT (below 50%, favor Buy) or PREMIUM (above 50%, favor Sell) now? 1 line",
  "liquidity": "in ${outLang} — key liquidity pool + any sweep/grab seen (1 line)",
  "order_flow": "in ${outLang} — who has control now (displacement/absorption/BOS/CHoCH), 1 line",
  "order_book": "in ${outLang} — only if DOM/volume profile is visible; otherwise note it isn't shown and you used price/volume (1 line)",
  "advanced_read": "in ${outLang} — short notes on Elliott Wave / Wyckoff / Harmonic / ICT killzone / expected-range IF clearly present; omit what's not visible. Keep to 1-3 short lines total.",
  "ict_read": "in ${outLang} — ICT-specific observations IF visible: Power of 3 phase (A/M/D), Silver Bullet window active, OTE zone hit, Breaker block, Inducement level, Daily Profile type, Asia range status, Unicorn Model. 1-2 lines max, omit what isn't clearly present.",
  "options_flow": "in ${outLang} — ONLY if a CME QuikStrike Vol2Vol / OI / Intraday Volume chart is uploaded. Include: max_pain_strike, put_wall (highest put OI strike), call_wall (highest call OI strike), expected_1sigma_range, iv_atm_level, vol_skew (put-skewed/call-skewed/neutral), vol_chg_signal, dte_note, trade_implication. If no options chart uploaded, set to 'ບໍ່ມີ options chart'.",
  "sniper_grade": "A+++ | A+ | A | B | C | WAIT — overall ICT/SMC grade: A+++ = fractal alignment 3+ TFs + all confluences; A+ = 5+ confluences; A = 3-4; B = 2-3 partial; C = weak; WAIT = <2 or no sweep yet",
  "zones": [{"type":"resistance|support","label":"in ${outLang}","range":"TIGHT range, e.g. 2348-2352 (max ~10 dollars wide)","why":"in ${outLang}, short — mention OB/FVG/sweep if relevant"}],
  "setups": [{
    "direction":"Buy|Sell","status":"ພ້ອມເຂົ້າ|ລໍຖ້າ","grade":"ສູງ|ກາງ|ຕ່ຳ",
    "confluence_factors":["in ${outLang}, short — e.g. liquidity sweep, discount zone, order block, BOS, DXY agrees"],
    "entry_zone":"TIGHT price range — 3-8 dollars wide, NEVER >10 (e.g. 4200-4206, not 4200-4225)","stop":"price","sl_pips":"30-120 pip typical, NEVER >150 pip",
    "targets":["TP1 price","TP2 price","TP3 price"],"rr":"e.g. 1:3","confidence":"e.g. 60-65%",
    "rationale":"in ${outLang}, 1 short line","invalidation":"in ${outLang}, short"
  }],
  "next_move": "in ${outLang} — ONE short backup line: what to do if price goes the other way / breaks the level (e.g. 'If breaks 4800: wait BOS up + retest 4785 then Buy')",
  "quick_map":"in ${outLang} — ONE-LINE plan",
  "risk_reminder":"in ${outLang}, short"
}`;
        const content = [];
        charts.forEach((c, i) => {
            content.push({ type: "text", text: `Chart ${i + 1} (timeframe not labelled — detect it):` });
            content.push({ type: "image", source: { type: "base64", media_type: c.mime, data: c.b64 } });
        });
        content.push({ type: "text", text: sys });
        // One attempt. Returns parsed result, or throws an Error with a Lao-friendly .reason
        const attempt = async (withNews) => {
            var _a;
            // Give the model enough room to finish the JSON. More charts → more to describe.
            // Base 3200 + 600 per chart, capped at 5200. (Advanced SMC fields add length.)
            const maxTok = Math.min(3200 + charts.length * 600, 5200);
            const reqBody = {
                model: "claude-sonnet-4-6",
                temperature: 0,
                max_tokens: maxTok,
                messages: [{ role: "user", content }],
                // No tools — analysis runs from the chart + model knowledge only (fast, no web lookup).
            };
            // 55s timeout guard (no web search now, so analysis is faster)
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 90000);
            let response;
            try {
                response = await callWithFallback(reqBody, ctrl.signal);
            }
            catch (netErr) {
                clearTimeout(timer);
                const e = new Error("network");
                e.reason = netErr.name === "AbortError"
                    ? "ໃຊ້ເວລານານເກີນ — ລອງໃໝ່ ຫຼື ໃຊ້ຮູບໜ້ອຍລົງ (1-2 ຮູບ)."
                    : "ເຊື່ອມຕໍ່ AI ບໍ່ໄດ້ — ກວດ internet ແລ້ວລອງໃໝ່.";
                throw e;
            }
            clearTimeout(timer);
            if (!response.ok) {
                let detail = "";
                try {
                    const j = await response.json();
                    detail = ((_a = j === null || j === void 0 ? void 0 : j.error) === null || _a === void 0 ? void 0 : _a.message) || "";
                }
                catch { }
                const e = new Error("http");
                if (response.status === 429)
                    e.reason = "AI ຖືກເອີ້ນຖີ່ເກີນໄປ (rate limit). ລໍຖ້າຈັກໜ່ອຍແລ້ວລອງໃໝ່.";
                else if (response.status === 401 || response.status === 403)
                    e.reason = "ບໍ່ສາມາດເຊື່ອມ AI ໄດ້ — ກວດ internet ແລ້ວລອງໃໝ່.";
                else if (response.status >= 500)
                    e.reason = "ເຊີບເວີ AI ຂັດຂ້ອງຊົ່ວຄາວ. ລອງໃໝ່ອີກເທື່ອ.";
                else
                    e.reason = `AI ຕອບກັບ error (${response.status}). ${detail}`.trim();
                throw e;
            }
            const data = await response.json();
            const blocks = data.content || [];
            const text = blocks.map((i) => (i.type === "text" ? i.text : "")).join("").trim();
            if (!text) {
                const e = new Error("empty");
                e.reason = "AI ບໍ່ໄດ້ສົ່ງຂໍ້ຄວາມກັບມາ. ລອງໃໝ່ອີກເທື່ອ.";
                throw e;
            }
            // Try normal parse first
            try {
                return extractJson(text);
            }
            catch {
                // Maybe the JSON got cut off (token limit). Try to repair by closing it.
                const repaired = tryRepairJson(text);
                if (repaired)
                    return repaired;
                // Still broken
                if (data.stop_reason === "max_tokens") {
                    const e = new Error("truncated");
                    e.reason = "ຜົນວິເຄາະຍາວເກີນຈນຖືກຕັດ. ກຳລັງລອງໃໝ່ໃຫ້ອັດຕະໂນມັດ…";
                    throw e;
                }
                const e = new Error("parse");
                e.reason = "ອ່ານຜົນຈາກ AI ບໍ່ໄດ້ (ຮູບແບບບໍ່ຄົບ). ລອງໃໝ່ ຫຼື ໃຊ້ screenshot ທີ່ຊັດເຈນກວ່າ.";
                throw e;
            }
        };
        try {
            setTimeout(() => setStage(t("analyzing")), 2500);
            let parsed;
            try {
                parsed = await attempt(false);
            }
            catch (firstErr) {
                const retryable = ["truncated", "network", "http", "parse", "empty"].includes(firstErr.message);
                if (retryable) {
                    // Retry once on a transient failure.
                    setStage(t("analyzing"));
                    parsed = await attempt(false);
                }
                else {
                    throw firstErr;
                }
            }
            // ── Multi-AI Consensus ──────────────────────────────────
            const activeEngines = Object.keys(aiEngines).filter(k => aiEngines[k]);
            if (activeEngines.length <= 1) {
                setResult({ ...parsed, consensus: null });
            } else {
                setStage("🤝 ກຳລັງລວມມັດຕິຈາກ AI ທຸກຕົວ...");
                const otherEngines = activeEngines.filter(e => e !== "claude");
                const maxTok2 = Math.min(3200 + charts.length * 600, 5200);
                const otherResults = await Promise.allSettled(otherEngines.map(async (engine) => {
                    try {
                        const ctrl2 = new AbortController();
                        setTimeout(() => ctrl2.abort(), 90000);
                        const rb = { model: engine === "gpt" ? "gpt-4o" : "gemini-1.5-flash", temperature: 0, max_tokens: maxTok2, messages: [{ role: "user", content }] };
                        const r2 = await callAI(engine, rb, ctrl2.signal);
                        if (!r2.ok) return { engine, result: null };
                        const d2 = await r2.json();
                        const txt2 = (d2.content || []).map(i => i.type === "text" ? i.text : "").join("").trim();
                        return { engine, result: extractJson(txt2) };
                    } catch(e2) { return { engine, result: null }; }
                }));
                const votes = [{ engine: "claude", bias: parsed.bias, direction: parsed.setups?.[0]?.direction, confidence: parsed.setups?.[0]?.confidence }];
                otherResults.forEach(r => { if (r.status === "fulfilled" && r.value?.result) { const res = r.value.result; votes.push({ engine: r.value.engine, bias: res.bias, direction: res.setups?.[0]?.direction, confidence: res.setups?.[0]?.confidence }); } });
                const validVotes = votes.filter(v => v.direction);
                const agree = validVotes.length > 1 && validVotes.every(v => v.direction === validVotes[0].direction);
                const majority = validVotes.length > 0 ? validVotes[0].direction : parsed.setups?.[0]?.direction;
                const consensus = { votes, agree, majority, summary: agree ? "✅ AI ທັງໝົດເຫັນດີ — " + majority : validVotes.length < 2 ? "⚠️ AI ບາງຕົວຕອບບໍ່ສຳເລັດ" : "⚠️ AI ບໍ່ຕົກລົງ — ລໍຖ້າ signal" };
                setResult({ ...parsed, consensus });
            }
            try { localStorage.setItem("sniper_result", JSON.stringify(parsed)); } catch(e) {}
            // ── Phase 2: Save signal to Supabase ──────────────────
            try {
                const setup = parsed.setups?.[0] || {};
                const userEmail = (() => { try { return JSON.parse(localStorage.getItem("sniper_user")||"{}").email||""; } catch(e){return "";} })();
                sbFetch("/rest/v1/signals", {
                    method: "POST",
                    body: JSON.stringify({
                        user_email: userEmail,
                        direction: setup.direction || parsed.bias || "",
                        entry: setup.entry_zone || "",
                        sl: setup.stop || "",
                        tp1: setup.targets?.[0] || "",
                        tp2: setup.targets?.[1] || "",
                        tp3: setup.targets?.[2] || "",
                        grade: setup.grade || "",
                        confidence: setup.confidence || "",
                        sniper_grade: parsed.sniper_grade || "",
                        rr: setup.rr || "",
                        result: "pending",
                        lang: lang || "lo",
                    })
                }).catch(() => {});
            } catch(e) {}
        }
        catch (e) {
            setErr(e.reason || "ການວິເຄາະລົ້ມເຫຼວ. ລອງໃໝ່ອີກເທື່ອ.");
        }
        finally {
            setLoading(false);
            setStage("");
        }
    };
    const reset = () => { setCharts([]); setResult(null); setErr(null); try { localStorage.removeItem("sniper_result"); } catch(e) {} if (fileRef.current)
        fileRef.current.value = ""; };
    // Membership status — reactive countdown (updates every minute)
    const [nowMs, setNowMs] = useState(Date.now());
    useEffect(() => { const id = setInterval(() => setNowMs(Date.now()), 60000); return () => clearInterval(id); }, []);
    const msLeft = user ? (user.expiresAt - nowMs) : 0;
    const daysLeft = Math.max(0, Math.ceil(msLeft / 86400000));
    const isLocked = isAdmin ? false : (user ? msLeft <= 0 : false);
    // VIP = a paid (non-trial) active member, or admin. Used to gate premium AI features.
    const isVip = isAdmin || (!!user && user.plan && user.plan !== "Trial" && !isLocked);
    // On successful payment (demo): extend 30 days and unlock
    const onPaid = (days, plan) => {
        const d = days || 30; const p = plan || "VIP";
        setUser((u) => { const nu = { ...u, expiresAt: Date.now() + d * 86400000, plan: p }; try { localStorage.setItem("sniper_user", JSON.stringify(nu)); } catch(e) {} return nu; });
        setShowPay(false);
    };
    // Splash intro animation on app open
    if (showSplash)
        return React.createElement(SplashScreen, { onDone: () => setShowSplash(false) });
    // Show login screen until the customer is signed in
    if (!user)
        return React.createElement(Login, { onLogin: (u) => { setUser(u); try { localStorage.setItem("sniper_user", JSON.stringify(u)); } catch(e) {} if (isAdminEmail(u.email)) { u.expiresAt = Date.now() + 36500 * 86400000; u.plan = "VIP"; try { localStorage.setItem("sniper_user", JSON.stringify(u)); } catch(e) {} }
        if (isAdminEmail(u.email))
                setIsAdmin(true);
            // ── Phase 3: Init Firebase Push Notification ──
            initFCM(u.email).catch(()=>{});
            if (u.plan === "Trial")
                setShowOnboard(true); }, lang: lang, setLang: setLang, t: t });
    // First-time onboarding tutorial (after signup)
    if (showOnboard)
        return React.createElement(Onboarding, { t: t, onDone: () => setShowOnboard(false) });
    // Locked or user opened the payment screen → show payment
    if (isLocked || showPay) {
        return React.createElement(PaymentScreen, { t: t, lang: lang, setLang: setLang, locked: isLocked, onPaid: onPaid, onBack: () => setShowPay(false), onLogout: () => { setUser(null); try { localStorage.removeItem("sniper_user"); } catch(e) {} } });
    }
    return (React.createElement("div", { style: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'LaoOverride','Noto Sans Lao','Inter',system-ui,sans-serif", position: "relative", overflow: "hidden" } },
        React.createElement("style", null, `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        /* Kill any white gap: html/body/root always carry the dark app background, full height */
        html,body{ margin:0; padding:0; background:${C.bg}; min-height:100%; }
        #root,#app{ background:${C.bg}; min-height:100vh; }
        @supports (min-height:100dvh){ html,body{ min-height:100dvh; } #root,#app{ min-height:100dvh; } }
        /* Force Lao Unicode range to always render in Noto Sans Lao, even inside Sora/Inter headings */
        @font-face{ font-family:'LaoOverride'; src:local('Noto Sans Lao'); unicode-range:U+0E80-0EFF, U+200B-200D, U+25CC; font-display:swap; }
        :root,*{ font-feature-settings:"kern" 1; }
        * { box-sizing: border-box; }
        .fx-btn:focus-visible,.fx-chip:focus-visible,.fx-link:focus-visible{ outline:2px solid ${C.blue}; outline-offset:2px; }
        @media (prefers-reduced-motion: reduce){ *{ animation:none!important; transition:none!important; } }
        .spin{ animation:fxspin .9s linear infinite; }
        @keyframes fxspin{ to{ transform:rotate(360deg);} }
        @keyframes fxFloat{ 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-7px);} }
        @keyframes fxGlowPulse{ 0%,100%{ opacity:.5; } 50%{ opacity:1; } }
        @keyframes fxRise{ from{ opacity:0; transform:translateY(14px);} to{ opacity:1; transform:translateY(0);} }
        @keyframes fxGrid{ from{ background-position:0 0;} to{ background-position:0 -48px;} }
        @keyframes fxSheen{ 0%{ transform:translateX(-120%);} 60%,100%{ transform:translateX(220%);} }
        .fx-rise{ animation:fxRise .5s ease both; }
        .fx-card{ transition:transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
        .fx-card:hover{ transform:translateY(-3px); border-color:${C.blue}; box-shadow:0 10px 30px -12px ${C.glow}; }
        .fx-promo:hover .fx-cta{ background:${C.blue}; color:#04101F; }
        .fx-wa:hover{ transform:translateY(-2px); box-shadow:0 12px 28px -10px rgba(37,211,102,.6); }
        .fx-bars span{ display:inline-block; width:4px; margin:0 1.5px; background:linear-gradient(${C.cyan},${C.blue}); border-radius:2px; animation:fxBar 1s ease-in-out infinite; }
        @keyframes fxBar{ 0%,100%{ transform:scaleY(.45);} 50%{ transform:scaleY(1);} }
        @keyframes bgDrift{ from{ transform:translateX(0);} to{ transform:translateX(-50%);} }
        @keyframes bounce{ 0%,100%{ transform:translateY(0); opacity:.5;} 50%{ transform:translateY(-5px); opacity:1;} }
        @keyframes botRingPulse{ 0%{ transform:scale(.85); opacity:.9;} 100%{ transform:scale(1.5); opacity:0;} }
        @keyframes botWiggle{ 0%,88%,100%{ transform:rotate(0deg);} 90%{ transform:rotate(-10deg);} 94%{ transform:rotate(10deg);} 96%{ transform:rotate(-6deg);} 98%{ transform:rotate(6deg);} }
        @keyframes botDot{ 0%,100%{ transform:scale(1); opacity:1;} 50%{ transform:scale(1.35); opacity:.7;} }
        @keyframes popIn{ 0%{ opacity:0; transform:scale(.88) translateY(18px);} 60%{ transform:scale(1.03) translateY(-3px);} 100%{ opacity:1; transform:scale(1) translateY(0);} }
        #root { transform: none !important; -webkit-transform: none !important; }
        #root > * { transform: none !important; -webkit-transform: none !important; }
        html, body { overscroll-behavior: none; }
      `),
        React.createElement(ChartBackdrop, { tint: "#C9A24B" }),
        React.createElement(Watermark, null),
        React.createElement(TradingChatbot, { t: t, lang: lang, user: user }),
        React.createElement("div", { "aria-hidden": true, style: { position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "48px 48px", opacity: 0.12, animation: "fxGrid 6s linear infinite", maskImage: "radial-gradient(120% 80% at 50% 0%, #000 35%, transparent 80%)", WebkitMaskImage: "radial-gradient(120% 80% at 50% 0%, #000 35%, transparent 80%)" } }),
        React.createElement("div", { "aria-hidden": true, style: { position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)", width: 620, height: 360, background: `radial-gradient(closest-side, ${C.glow}, transparent)`, filter: "blur(20px)", animation: "fxGlowPulse 5s ease-in-out infinite", pointerEvents: "none" } }),
        React.createElement("div", { style: { maxWidth: 720, margin: "0 auto", padding: "14px 16px 96px", position: "relative", zIndex: 1 } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", borderRadius: 16, border: `1px solid ${C.line}`, background: "rgba(16,20,30,.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" } },
                !isAdmin && React.createElement("button", { onClick: () => setShowPay(true), className: "fx-btn", style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 99, border: `1px solid ${daysLeft <= 1 ? C.amber : C.line}`, background: daysLeft <= 1 ? "rgba(255,194,75,.12)" : "transparent", color: daysLeft <= 1 ? C.amber : C.mut, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" } },
                    "\u23F3 ",
                    daysLeft <= 0 ? t("trialEndsToday") : t("trialLeft", { n: daysLeft })),
                React.createElement("div", { style: { flex: 1 } }),
                React.createElement("img", { src: LOGO, alt: "Startup FX", style: { height: 30, objectFit: "contain" } }),
                React.createElement("button", { onClick: () => setNotify(function(v){return !v;}), className: "fx-btn", style: { position: "relative", width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.line}`, background: C.panel2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", flexShrink: 0 } },
                    "\uD83D\uDD14",
                    React.createElement("span", { style: { position: "absolute", top: 6, right: 7, width: 8, height: 8, borderRadius: "50%", background: C.red, border: `1.5px solid ${C.bg}`, animation: "fxGlowPulse 2s infinite" } }))),
            nav === "home" && (React.createElement("div", { className: "fx-rise" },
                React.createElement("div", { style: { position: "relative", borderRadius: 22, overflow: "hidden", border: `1px solid ${C.line}`, background: `linear-gradient(120deg, ${C.bg2} 0%, ${C.panel} 55%, rgba(38,130,255,.20) 100%)`, padding: "28px 22px", minHeight: 168 } },
                    React.createElement("span", { "aria-hidden": true, style: { position: "absolute", top: -40, right: -30, width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(closest-side, ${C.glow}, transparent 70%)`, filter: "blur(8px)", animation: "fxGlowPulse 5s ease-in-out infinite", pointerEvents: "none" } }),
                    React.createElement("span", { "aria-hidden": true, style: { position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,.06) 50%, transparent 60%)", animation: "fxSheen 4.5s ease-in-out infinite", pointerEvents: "none" } }),
                    React.createElement("div", { style: { position: "relative" } },
                        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
                            React.createElement("span", { style: { fontSize: 34, lineHeight: 1, filter: `drop-shadow(0 4px 14px ${C.glow})` } }, "\uD83C\uDFAF"),
                            React.createElement("div", null,
                                React.createElement("div", { style: { fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: C.blue, textTransform: "uppercase", marginBottom: 4 } }, "\u26A1 Powered by Startup FX"),
                                React.createElement("h1", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontSize: "clamp(26px,6.5vw,38px)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0, lineHeight: 1.05, display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" } },
                                    React.createElement("span", { style: { color: "#FFFFFF", fontWeight: 800 } }, "Sniper"),
                                    React.createElement("span", { style: { color: "#00FFFF", fontWeight: 900, textShadow: "0 0 20px #00FFFF, 0 0 50px #00BFFF" } }, "Tech"),
                                    React.createElement("span", { style: { color: "#FFD700", fontWeight: 900, textShadow: "0 0 20px #FFD700, 0 0 50px #FFA500", marginLeft: 7 } }, "AI"),
                                    React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(38,130,255,0.15)", border: "1px solid rgba(38,130,255,0.4)", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: C.blueLt, verticalAlign: "middle", marginLeft: 8 } },
                                        React.createElement("span", { style: { width: 5, height: 5, borderRadius: "50%", background: C.blue, animation: "fxGlowPulse 1.5s infinite", display: "inline-block" } }),
                                        "LIVE")))),
                        React.createElement("p", { style: { color: C.mut, fontSize: 13.5, lineHeight: 1.55, margin: "12px 0 0", maxWidth: 380 } },
                            t("homeWelcome"),
                            ", ",
                            React.createElement("b", { style: { color: C.text } }, user.name),
                            " \u2014 ",
                            t("homeSubtitle")),
                        React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap", marginTop: 13 } }, ["SMC", "Liquidity", "DXY", "ICT"].map((tag) => (React.createElement("span", { key: tag, style: { fontSize: 11, fontWeight: 600, color: C.blueLt, border: `1px solid ${C.line}`, background: "rgba(38,130,255,.08)", borderRadius: 99, padding: "3px 10px" } }, tag)))))),
                React.createElement("div", { style: { marginTop: 24 } },
                    React.createElement(SectionTitle, { kicker: "SniperTech AI", title: t("homeQuickTools") }),
                    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 } },
                        React.createElement(HomeCard, { icon: "\uD83D\uDCCA", title: t("analyzeChart"), desc: "AI Intelligence", glowColor: "rgba(38,130,255,.2)", iconBg: "rgba(38,130,255,.15)", onClick: () => { setNav("tools"); setTab("chart"); } }),
                        React.createElement(HomeCard, { icon: "\uD83D\uDCF0", title: t("analyzeNews"), desc: "DXY \u00B7 Fed \u00B7 Oil", glowColor: "rgba(63,217,138,.15)", iconBg: "rgba(63,217,138,.12)", onClick: () => { setNav("tools"); setTab("news"); } }),
                        React.createElement(HomeCard, { icon: "\uD83C\uDF93", title: t("tabCourse"), desc: "Gold Sniper", glowColor: "rgba(255,194,75,.15)", iconBg: "rgba(255,194,75,.12)", onClick: () => setNav("learn") }),
                        React.createElement(HomeCard, { icon: "\uD83D\uDCE2", title: t("tabNews2"), desc: t("homeAnnounce"), glowColor: "rgba(255,107,107,.15)", iconBg: "rgba(255,107,107,.12)", onClick: () => setNav("news") }))),
                React.createElement("div", { style: { marginTop: 26 } },
                    React.createElement(SectionTitle, { kicker: "\uD83D\uDCB0 Cashback", title: "15$ / 1 Lot" }),
                    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginTop: 14 } }, [
                        { logo: KCM_LOGO, alt: "KCM Trade", title: t("rebateTitle"), cta: t("registerKcm"), url: KCM_REGISTER_URL },
                        { logo: KVB_LOGO, alt: "KVB", title: t("rebateTitleKvb"), cta: t("registerKvb"), url: KVB_REGISTER_URL },
                    ].map((b, i) => React.createElement("section", { key: i, style: { borderRadius: 18, border: `1px solid ${C.line}`, background: `linear-gradient(180deg,${C.panel},${C.bg2})`, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", position: "relative", overflow: "hidden" } },
                        React.createElement("span", { "aria-hidden": true, style: { position: "absolute", left: -8, top: -8, width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle,rgba(63,217,138,.12),transparent 70%)", pointerEvents: "none" } }),
                        React.createElement("img", { src: b.logo, alt: b.alt, style: { width: 48, height: 48, objectFit: "contain", borderRadius: 10, border: `1px solid ${C.line}` } }),
                        React.createElement("div", { style: { flex: 1, minWidth: 170 } },
                            React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 15 } }, b.title),
                            React.createElement("div", { style: { color: C.mut, fontSize: 12.5, lineHeight: 1.55, marginTop: 3 } }, t("rebateDesc"))),
                        React.createElement("a", { className: "fx-link", href: b.url, target: "_blank", rel: "noopener noreferrer", style: { display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontWeight: 700, fontSize: 13.5, padding: "11px 16px", borderRadius: 11, whiteSpace: "nowrap" } },
                            b.cta, " \u2192"))))))),
            nav === "tools" && (React.createElement("div", { className: "fx-rise" },
                React.createElement("div", { style: { display: "flex", gap: 6, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 5, maxWidth: 560, margin: "0 auto" } }, [["live", "📡 " + t("navLive") || "📡 Live"], ["chart", "📊 " + t("analyzeChart")], ["news", "📰 " + t("analyzeNews")]].map(([id, label]) => (React.createElement("button", { key: id, className: "fx-btn", onClick: () => setTab(id), style: { flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                        background: tab === id ? `linear-gradient(95deg,${C.blue},${C.blueLt})` : "transparent",
                        color: tab === id ? "#04101F" : C.mut, transition: "all .15s" } }, label)))),
                tab === "live" && React.createElement(LiveChartPanel, { t: t, lang: lang }),
                tab === "chart" && (React.createElement(React.Fragment, null,
                    React.createElement(AIEnginePanel, { t: t, engines: aiEngines, setEngines: setAiEngines }),
                    React.createElement("section", { style: { marginTop: 14, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, padding: "20px 18px", position: "relative", overflow: "hidden" } },
                        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" } },
                            React.createElement(Bars, null),
                            React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 600, fontSize: 16 } }, t("analyzeRoom")),
                            React.createElement("button", { onClick: () => setShowHowTo(true), className: "fx-btn", style: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 99, border: `1px solid ${C.blue}`, background: "rgba(38,130,255,.10)", color: C.blueLt, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" } },
                                "\u2754 ",
                                t("howToUse")),
                            React.createElement("div", { style: { marginLeft: "auto", fontSize: 12, color: C.mut } }, t("maxImgs", { n: MAX_CHARTS }))),
                        React.createElement("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16 } },
                            React.createElement(Control, { label: t("direction") },
                                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
                                    React.createElement("div", { style: { display: "flex", gap: 6 } }, BIAS_KEYS.map((bk, i) => React.createElement("button", { key: bk, className: "fx-chip", onClick: () => setBiasIdx(i), style: chip(biasIdx === i) }, t(bk)))),
                                    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
                                        React.createElement("div", { style: { display: "flex", gap: 6 } },
                                            React.createElement("button", { className: "fx-chip", onClick: () => setStyleIdx(0), style: { ...chip(styleIdx === 0), flex: 1 } }, t("styleSwing")),
                                            React.createElement("button", { className: "fx-chip", onClick: () => setStyleIdx(1), style: { ...chip(styleIdx === 1), flex: 1, borderColor: styleIdx === 1 ? "#FFB800" : undefined, color: styleIdx === 1 ? "#FFB800" : undefined, background: styleIdx === 1 ? "rgba(255,184,0,.12)" : undefined } }, t("styleScalp"))),
                                        React.createElement("div", { style: { fontSize: 11, color: C.mut, lineHeight: 1.6, padding: "8px 10px", borderRadius: 8, background: C.bg2, border: `1px solid ${C.line}` } },
                                            styleIdx === 0
                                                ? React.createElement(React.Fragment, null,
                                                    React.createElement("span", { style: { color: C.cyan, fontWeight: 700 } }, "📊 ປົກກະຕິ — ຕ້ອງການ: "),
                                                    "H4 + H1 + M15 + M5 (4 ຮູບ) · SL 30-120 pip · TP ໄກ")
                                                : React.createElement(React.Fragment, null,
                                                    React.createElement("span", { style: { color: "#FFB800", fontWeight: 700 } }, "⚡ Scalping — ຕ້ອງການ: "),
                                                    "H1 + M15 + M5 (3 ຮູບ) · SL 15-30 pip · TP ໄວ",
                                                    React.createElement("div", { style: { marginTop: 4, color: "#FFB800", fontSize: 10.5 } }, "⚠️ ລະວັງ: ສາຍເທຣດສັ້ນ ສັນຍານຫຼອກສູງ — ຕ້ອງເຫັນ OB/FVG ຊັດ ແລະ ຢືນຢັນດ້ວຍ M15 ກ່ອນ"))))))),
                        charts.length === 0 ? (React.createElement(Dropzone, { onDrop: onDrop, onClick: () => { var _a; return (_a = fileRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, t: t })) : (React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 } },
                            charts.map((c, idx) => (React.createElement("div", { key: c.id, className: "fx-card", style: { borderRadius: 12, overflow: "hidden", border: `1px solid ${C.line}`, background: C.panel2 } },
                                React.createElement("div", { style: { position: "relative" } },
                                    React.createElement("img", { src: c.url, alt: t("analyzeChart"), style: { width: "100%", height: 110, objectFit: "cover", display: "block", background: "#000" } }),
                                    React.createElement("button", { onClick: () => removeChart(c.id), "aria-label": "\u00D7", style: { position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", border: "none", background: "rgba(5,7,13,.8)", color: C.text, cursor: "pointer", fontSize: 14, lineHeight: 1 } }, "\u00D7"),
                                    React.createElement("span", { style: { position: "absolute", left: 6, bottom: 6, fontSize: 10, fontWeight: 600, color: C.blueLt, background: "rgba(5,7,13,.72)", border: `1px solid ${C.line}`, borderRadius: 6, padding: "2px 7px" } }, idx + 1))))),
                            charts.length < MAX_CHARTS && (React.createElement("button", { className: "fx-btn", onClick: () => { var _a; return (_a = fileRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, style: { minHeight: 110, borderRadius: 12, border: `1.5px dashed ${C.line}`, background: "transparent", color: C.mut, cursor: "pointer", fontSize: 13, fontFamily: "inherit" } }, t("addImg"))))),
                        React.createElement("input", { ref: fileRef, type: "file", accept: "image/*", multiple: true, style: { display: "none" }, onChange: (e) => addFiles(e.target.files) }),
                        charts.length > 0 && (React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" } },
                            React.createElement("button", { className: "fx-btn", onClick: analyze, disabled: loading, style: primaryBtn(loading) }, loading ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 } },
                                React.createElement(Spinner, null),
                                " ",
                                stage || t("analyzing")) : t("makeSignal")),
                            React.createElement("button", { className: "fx-btn", onClick: reset, disabled: loading, style: ghostBtn }, t("clearAll")))),
                        err && React.createElement("div", { style: { marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "rgba(255,107,107,.08)", border: `1px solid ${C.red}`, color: "#FFC4C4", fontSize: 14, lineHeight: 1.6 } }, err)),
                    result && React.createElement(Result, { data: result, t: t, engines: aiEngines, isAdmin: isAdmin }))),
                tab === "news" && React.createElement(NewsPanel, { t: t, lang: lang, isVip: isVip, onUpgrade: () => setShowPay(true) }))),
            nav === "learn" && (React.createElement("div", { className: "fx-rise" }, isAdmin ? (React.createElement(React.Fragment, null,
                React.createElement("div", { style: { display: "flex", gap: 6, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 5, maxWidth: 460, margin: "0 auto 4px" } }, [["paid", "🎥 " + t("learnTabPaid") + " (admin)"], ["free", "📖 " + t("learnTabFree")]].map(([id, label]) => (React.createElement("button", { key: id, className: "fx-btn", onClick: () => setLearnTab(id), style: { flex: 1, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600,
                        background: learnTab === id ? `linear-gradient(95deg,${C.blue},${C.blueLt})` : "transparent",
                        color: learnTab === id ? "#04101F" : C.mut, transition: "all .15s" } }, label)))),
                learnTab === "paid"
                    ? React.createElement(CoursePanel, { t: t, unlocked: courseUnlocked, onUnlock: () => setCourseUnlocked(true), waLink: waLink })
                    : React.createElement(FreeLessons, { t: t, lang: lang, unlocked: courseUnlocked, waLink: waLink, onUpgrade: () => setShowPay(true) }))) : (React.createElement(FreeLessons, { t: t, lang: lang, unlocked: courseUnlocked, waLink: waLink, onUpgrade: () => setShowPay(true) })))),
            nav === "news" && (React.createElement("div", { className: "fx-rise" },
                React.createElement(AdminPushPanel, { t: t, isAdmin: isAdmin }),
                React.createElement(NewsRoom, { t: t, notify: notify, setNotify: setNotify, isAdmin: isAdmin }))),
            nav === "profile" && (React.createElement("div", { className: "fx-rise" },
                React.createElement(ProfileErrorBoundary, null,
                    React.createElement(ProfilePage, { t: t, user: user, lang: lang, setLang: setLang, daysLeft: daysLeft, notify: notify, setNotify: setNotify, onPay: () => setShowPay(true), onLogout: () => { setUser(null); try { localStorage.removeItem("sniper_user"); } catch(e) {} }, waLink: waLink, isAdmin: isAdmin, setIsAdmin: setIsAdmin, theme: theme, setTheme: setTheme, onUpdateUser: (u) => setUser(u) })),
                React.createElement(SignalHistory, { user: user, t: t }))),
            React.createElement("footer", { style: { marginTop: 36, paddingTop: 18, borderTop: `1px solid ${C.line}`, color: C.mut, fontSize: 11.5, lineHeight: 1.8, textAlign: "center" } }, t("footer"))),
        React.createElement("nav", { style: { position: "fixed", left: "50%", bottom: 0, transform: "translateX(-50%)", width: "100%", maxWidth: 720, zIndex: 50, padding: "0 12px 12px" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-around", alignItems: "center", gap: 4, padding: "8px 6px", borderRadius: 20, border: `1px solid ${C.line}`, background: "rgba(16,20,30,.82)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", boxShadow: "0 -8px 30px -12px rgba(0,0,0,.7)" } }, [
                { id: "home", icon: "🏠", label: t("navHome") },
                { id: "tools", icon: "🤖", label: t("navTools") },
                { id: "learn", icon: "🎓", label: t("navLearn") },
                { id: "news", icon: "📢", label: t("navNews") },
                { id: "profile", icon: "👤", label: t("navProfile") },
            ].map((item) => {
                const on = nav === item.id;
                return (React.createElement("button", { key: item.id, onClick: () => { setNav(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", position: "relative" } },
                    React.createElement("span", { style: { fontSize: 19, lineHeight: 1, filter: on ? "none" : "grayscale(.5) opacity(.65)", transform: on ? "scale(1.12)" : "scale(1)", transition: "transform .18s" } }, item.icon),
                    React.createElement("span", { style: { fontSize: 10, fontWeight: on ? 700 : 500, color: on ? C.cyan : C.mut, whiteSpace: "nowrap" } }, item.label),
                    on && React.createElement("span", { style: { position: "absolute", top: 0, width: 22, height: 3, borderRadius: 3, background: `linear-gradient(90deg,${C.cyan},${C.blue})` } })));
            }))),
        showHowTo && React.createElement(HowToModal, { t: t, onClose: () => setShowHowTo(false) })));
}
// ── How-to-screenshot guide modal ────────────────────────────
function HowToModal({ t, onClose }) {
    const Step = ({ n, title, desc }) => (React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-start" } },
        React.createElement("div", { style: { flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${C.cyan},${C.blue})`, color: "#04101F", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" } }, n),
        React.createElement("div", null,
            React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 } }, title),
            React.createElement("div", { style: { fontSize: 13, color: C.mut, lineHeight: 1.6 } }, desc))));
    return (React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, zIndex: 9000, background: "rgba(3,6,13,.74)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 } },
        React.createElement("div", { onClick: (e) => e.stopPropagation(), className: "fx-rise", style: { width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 20, padding: "22px 20px", boxShadow: "0 24px 60px -16px rgba(0,0,0,.8)" } },
            React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 } },
                React.createElement("div", { style: { flex: 1, fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 17, lineHeight: 1.3 } }, t("howToTitle")),
                React.createElement("button", { onClick: onClose, "aria-label": "close", style: { flexShrink: 0, width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.line}`, background: C.bg2, color: C.text, cursor: "pointer", fontSize: 16, lineHeight: 1 } }, "\u00D7")),
            React.createElement("div", { style: { borderRadius: 14, overflow: "hidden", border: `1px solid ${C.line}`, marginBottom: 8 } },
                React.createElement("svg", { viewBox: "0 0 640 360", style: { width: "100%", display: "block" }, xmlns: "http://www.w3.org/2000/svg" },
                    React.createElement("rect", { width: "640", height: "360", fill: "#0B1020" }),
                    React.createElement("rect", { width: "640", height: "34", fill: "#121A2E" }),
                    React.createElement("rect", { x: "12", y: "8", width: "92", height: "18", rx: "4", fill: "#1B2742", stroke: C.blue }),
                    React.createElement("text", { x: "58", y: "21", fontFamily: "Arial", fontSize: "12", fill: "#7FB2FF", textAnchor: "middle", fontWeight: "bold" }, "XAU/USD"),
                    React.createElement("rect", { x: "112", y: "8", width: "46", height: "18", rx: "4", fill: "#16233D", stroke: "#3A6FD0" }),
                    React.createElement("text", { x: "135", y: "21", fontFamily: "Arial", fontSize: "12", fill: "#EAF1FB", textAnchor: "middle", fontWeight: "bold" }, "H1"),
                    React.createElement("rect", { x: "166", y: "8", width: "40", height: "18", rx: "4", fill: "#16233D" }),
                    React.createElement("text", { x: "186", y: "21", fontFamily: "Arial", fontSize: "11", fill: "#9FB2D6", textAnchor: "middle" }, "EMA"),
                    React.createElement("rect", { x: "214", y: "8", width: "40", height: "18", rx: "4", fill: "#16233D" }),
                    React.createElement("text", { x: "234", y: "21", fontFamily: "Arial", fontSize: "11", fill: "#9FB2D6", textAnchor: "middle" }, "RSI"),
                    React.createElement("g", { stroke: "#1A2440", strokeWidth: "1" },
                        React.createElement("line", { x1: "0", y1: "80", x2: "640", y2: "80" }),
                        React.createElement("line", { x1: "0", y1: "140", x2: "640", y2: "140" }),
                        React.createElement("line", { x1: "0", y1: "200", x2: "640", y2: "200" }),
                        React.createElement("line", { x1: "0", y1: "250", x2: "640", y2: "250" })),
                    React.createElement("polyline", { fill: "none", stroke: C.blue, strokeWidth: "2.5", points: "40,200 110,185 180,170 250,150 320,160 390,135 460,120 530,130 600,110" }),
                    React.createElement("g", null,
                        React.createElement("line", { x1: "70", y1: "160", x2: "70", y2: "215", stroke: "#22C58A" }),
                        React.createElement("rect", { x: "63", y: "172", width: "14", height: "34", fill: "#22C58A" }),
                        React.createElement("line", { x1: "120", y1: "150", x2: "120", y2: "205", stroke: "#EF5C5C" }),
                        React.createElement("rect", { x: "113", y: "160", width: "14", height: "30", fill: "#EF5C5C" }),
                        React.createElement("line", { x1: "170", y1: "140", x2: "170", y2: "195", stroke: "#22C58A" }),
                        React.createElement("rect", { x: "163", y: "150", width: "14", height: "34", fill: "#22C58A" }),
                        React.createElement("line", { x1: "220", y1: "120", x2: "220", y2: "175", stroke: "#22C58A" }),
                        React.createElement("rect", { x: "213", y: "132", width: "14", height: "34", fill: "#22C58A" }),
                        React.createElement("line", { x1: "270", y1: "128", x2: "270", y2: "185", stroke: "#EF5C5C" }),
                        React.createElement("rect", { x: "263", y: "140", width: "14", height: "32", fill: "#EF5C5C" }),
                        React.createElement("line", { x1: "320", y1: "118", x2: "320", y2: "172", stroke: "#22C58A" }),
                        React.createElement("rect", { x: "313", y: "128", width: "14", height: "32", fill: "#22C58A" }),
                        React.createElement("line", { x1: "370", y1: "100", x2: "370", y2: "158", stroke: "#22C58A" }),
                        React.createElement("rect", { x: "363", y: "112", width: "14", height: "34", fill: "#22C58A" }),
                        React.createElement("line", { x1: "420", y1: "108", x2: "420", y2: "162", stroke: "#EF5C5C" }),
                        React.createElement("rect", { x: "413", y: "118", width: "14", height: "30", fill: "#EF5C5C" }),
                        React.createElement("line", { x1: "470", y1: "92", x2: "470", y2: "150", stroke: "#22C58A" }),
                        React.createElement("rect", { x: "463", y: "104", width: "14", height: "34", fill: "#22C58A" }),
                        React.createElement("line", { x1: "520", y1: "88", x2: "520", y2: "142", stroke: "#22C58A" }),
                        React.createElement("rect", { x: "513", y: "98", width: "14", height: "32", fill: "#22C58A" }),
                        React.createElement("line", { x1: "570", y1: "96", x2: "570", y2: "150", stroke: "#EF5C5C" }),
                        React.createElement("rect", { x: "563", y: "106", width: "14", height: "30", fill: "#EF5C5C" })),
                    React.createElement("rect", { x: "592", y: "92", width: "46", height: "16", fill: C.blue }),
                    React.createElement("text", { x: "615", y: "104", fontFamily: "Arial", fontSize: "10", fill: "#03101F", textAnchor: "middle", fontWeight: "bold" }, "2418"),
                    React.createElement("rect", { x: "0", y: "288", width: "640", height: "72", fill: "#0A0F1C" }),
                    React.createElement("line", { x1: "0", y1: "288", x2: "640", y2: "288", stroke: "#26324F" }),
                    React.createElement("text", { x: "10", y: "304", fontFamily: "Arial", fontSize: "10", fill: "#7C8BA8" }, "RSI 14"),
                    React.createElement("line", { x1: "0", y1: "312", x2: "640", y2: "312", stroke: "#243250", strokeDasharray: "4 4" }),
                    React.createElement("line", { x1: "0", y1: "338", x2: "640", y2: "338", stroke: "#243250", strokeDasharray: "4 4" }),
                    React.createElement("polyline", { fill: "none", stroke: "#C77DFF", strokeWidth: "2", points: "40,330 110,322 180,318 250,326 320,316 390,308 460,314 530,304 600,312" }))),
            React.createElement("div", { style: { fontSize: 11.5, color: C.blueLt, textAlign: "center", marginBottom: 16 } },
                "\u2191 ",
                t("howToIntro")),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
                React.createElement(Step, { n: "1", title: t("howTo1Title"), desc: t("howTo1Desc") }),
                React.createElement(Step, { n: "2", title: t("howTo2Title"), desc: t("howTo2Desc") }),
                React.createElement(Step, { n: "3", title: t("howTo3Title"), desc: t("howTo3Desc") })),
            React.createElement("div", { style: { marginTop: 16, padding: "11px 14px", borderRadius: 12, background: "rgba(38,130,255,.08)", border: `1px solid ${C.blue}`, fontSize: 12.5, color: C.blueLt, lineHeight: 1.6 } },
                "\uD83D\uDCA1 ",
                t("howToTip")),
            React.createElement("button", { onClick: onClose, className: "fx-btn", style: { width: "100%", marginTop: 16, padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, t("howToClose")))));
}
// ── Result ────────────────────────────────────────────────
function Result({ data, t, engines, isAdmin }) {
    var _a;
    if (data.readable === false) {
        return (React.createElement("div", { className: "fx-rise", style: { marginTop: 18, padding: "18px 20px", borderRadius: 14, background: C.panel, border: `1px solid ${C.line}` } },
            React.createElement("div", { style: { color: C.blueLt, fontWeight: 600, marginBottom: 6 } }, t("rCantRead")),
            React.createElement("div", { style: { color: C.text, fontSize: 14, lineHeight: 1.65 } }, data.note)));
    }
    const activeAIs = engines ? Object.keys(engines).filter((k) => engines[k]) : ["claude"];
    const isReady = (st) => st && (st.includes("ພ້ອມ") || st.toLowerCase().includes("ready") || st.includes("พร้อม"));
    const isBuy = (d) => { const x = String(d || "").toLowerCase(); return x.includes("buy") || x.includes("long") || (d === null || d === void 0 ? void 0 : d.includes("ຊື້")) || (d === null || d === void 0 ? void 0 : d.includes("ซื้อ")); };
    const gradeColor = (g) => {
        if (!g)
            return C.mut;
        if (g.includes("ສູງ") || g.toLowerCase().includes("high") || g.includes("สูง"))
            return C.green;
        if (g.includes("ກາງ") || g.toLowerCase().includes("med") || g.includes("กลาง"))
            return C.amber;
        return C.mut;
    };
    const biasIsBuy = isBuy(data.bias);
    const biasIsWait = String(data.bias || "").toLowerCase().includes("wait") || String(data.bias || "").includes("ລໍຖ້າ") || String(data.bias || "").includes("รอ");
    const biasColor = biasIsWait ? C.amber : (biasIsBuy ? C.green : C.red);
    const biasLabel = biasIsWait ? t("rWait") : (biasIsBuy ? "BUY" : "SELL");
    return (React.createElement("div", { className: "fx-rise", style: { marginTop: 22, display: "flex", flexDirection: "column", gap: 14 } },
        data.consensus && (React.createElement("div", { style: { borderRadius: 14, border: `1px solid ${data.consensus.agree ? C.green : C.amber}`, background: data.consensus.agree ? "rgba(63,217,138,.08)" : "rgba(255,194,75,.08)", padding: "12px 15px" } },
            React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5, color: data.consensus.agree ? C.green : C.amber, marginBottom: 8 } }, data.consensus.summary),
            React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, data.consensus.votes.map((v, i) => React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 5, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 99, padding: "4px 10px", fontSize: 11 } },
                React.createElement("span", null, v.engine === "claude" ? "🟣" : v.engine === "gpt" ? "🟢" : "🔵"),
                React.createElement("span", { style: { fontWeight: 700, color: C.text } }, v.engine === "claude" ? "Claude" : v.engine === "gpt" ? "ChatGPT" : "Gemini"),
                React.createElement("span", { style: { color: v.direction === "Buy" ? C.green : v.direction === "Sell" ? C.red : C.amber, fontWeight: 700 } }, v.direction || "—")))))),
        isAdmin && (React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.panel2 } },
            React.createElement("span", { style: { fontSize: 15 } }, activeAIs.length > 1 ? "🧠" : "🤖"),
            React.createElement("span", { style: { fontSize: 12, color: C.mut, flex: 1 } }, activeAIs.length > 1 ? t("aiConsensusHigh") : t("aiConsensusSingle")),
            React.createElement("span", { style: { display: "inline-flex", gap: 4 } }, activeAIs.map((a) => (React.createElement("span", { key: a, style: { fontSize: 10, fontWeight: 700, color: C.cyan, background: "rgba(38,130,255,.12)", border: `1px solid ${C.line}`, borderRadius: 99, padding: "2px 8px" } }, a === "claude" ? "Claude" : a === "gpt" ? "ChatGPT" : "Gemini")))))),
        data.news_alert && (React.createElement("div", { style: { borderRadius: 14, border: `1px solid ${C.amber}`, background: "rgba(255,194,75,.1)", padding: "12px 15px", display: "flex", gap: 11, alignItems: "flex-start" } },
            React.createElement("span", { style: { fontSize: 17, lineHeight: 1.2 } }, "\u26A0\uFE0F"),
            React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color: C.amber, marginBottom: 3 } }, t("rNewsAlert")),
                React.createElement("div", { style: { color: C.text, fontSize: 13, lineHeight: 1.55 } }, data.news_alert)))), (_a = data.setups) === null || _a === void 0 ? void 0 :
        _a.map((s, i) => {
            var _a, _b, _c;
            const ready = isReady(s.status);
            const buy = isBuy(s.direction);
            const dirColor = buy ? C.green : C.red;
            return (React.createElement("div", { key: i, className: "fx-card", style: { borderRadius: 18, border: `1px solid ${ready ? dirColor : C.line}`, background: C.panel, overflow: "hidden", boxShadow: ready ? `0 14px 40px -20px ${buy ? "rgba(34,197,138,.5)" : "rgba(239,92,92,.5)"}` : "none" } },
                React.createElement("div", { style: { padding: "15px 18px", background: `linear-gradient(100deg, ${buy ? "rgba(34,197,138,.14)" : "rgba(239,92,92,.14)"}, transparent)`, borderBottom: `1px solid ${C.line}` } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" } },
                        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9 } },
                            React.createElement("span", { style: { fontSize: 18 } }, "\uD83D\uDCCA"),
                            React.createElement("span", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 16 } }, t("rSetupTitle"))),
                        React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 7 } },
                            React.createElement("span", { style: { fontSize: 15, fontWeight: 800, color: dirColor, letterSpacing: ".03em" } }, buy ? "▲ BUY" : "▼ SELL"),
                            s.status && React.createElement("span", { style: { fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 99, color: "#04101F", background: ready ? dirColor : C.blueLt } }, ready ? t("rReady") : t("rWait")))),
                    data.instrument_guess && React.createElement("div", { style: { marginTop: 6, fontSize: 12.5, color: C.mut } },
                        data.instrument_guess,
                        data.detected_timeframes ? ` · ${data.detected_timeframes}` : "")),
                ((_a = data.timeframe_breakdown) === null || _a === void 0 ? void 0 : _a.length) > 0 && (React.createElement("div", { style: { padding: "12px 18px", borderBottom: `1px solid ${C.line}`, display: "flex", flexDirection: "column", gap: 7 } },
                    data.timeframe_breakdown.map((tf, j) => (React.createElement("div", { key: j, style: { display: "flex", gap: 10, alignItems: "baseline" } },
                        React.createElement("span", { style: { flexShrink: 0, width: 38, fontSize: 11, fontWeight: 800, color: C.blueLt, fontFamily: "'Sora',sans-serif" } }, tf.tf),
                        React.createElement("span", { style: { color: C.text, fontSize: 13, lineHeight: 1.5 } }, tf.read)))),
                    React.createElement("div", { style: { marginTop: 4, display: "flex", alignItems: "center", gap: 8 } },
                        React.createElement("span", { style: { fontSize: 16 } }, "\uD83D\uDD25"),
                        React.createElement("span", { style: { fontSize: 12, color: C.mut } },
                            t("rBias"),
                            ":"),
                        React.createElement("span", { style: { fontSize: 13.5, fontWeight: 800, color: biasColor } }, biasLabel)))),
                React.createElement("div", { style: { padding: "16px 18px", borderBottom: `1px solid ${C.line}` } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } },
                        React.createElement("span", { style: { flexShrink: 0, width: 30, height: 30, borderRadius: 9, background: "rgba(38,130,255,.14)", border: `1px solid ${C.blue}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 } }, "\uD83C\uDFAF"),
                        React.createElement("div", { style: { flex: 1 } },
                            React.createElement("div", { style: { fontSize: 11, color: C.mut } }, t("rEntry")),
                            React.createElement("div", { style: { fontSize: 17, fontWeight: 800, color: C.cyan, fontFamily: "'Sora',sans-serif" } }, s.entry_zone))),
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 } },
                        React.createElement("span", { style: { flexShrink: 0, width: 30, height: 30, borderRadius: 9, background: "rgba(239,92,92,.14)", border: `1px solid ${C.red}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 } }, "\uD83D\uDED1"),
                        React.createElement("div", { style: { flex: 1 } },
                            React.createElement("div", { style: { fontSize: 11, color: C.mut } },
                                t("rStop"),
                                s.sl_pips ? ` · ${s.sl_pips}` : ""),
                            React.createElement("div", { style: { fontSize: 17, fontWeight: 800, color: C.red, fontFamily: "'Sora',sans-serif" } }, s.stop))),
                    (s.targets || []).length > 0 && (React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min((s.targets || []).length, 3)},1fr)`, gap: 8 } }, (s.targets || []).map((tp, j) => (React.createElement("div", { key: j, style: { borderRadius: 11, border: `1px solid ${C.line}`, background: "rgba(34,197,138,.06)", padding: "9px 6px", textAlign: "center" } },
                        React.createElement("div", { style: { fontSize: 10.5, color: C.green, fontWeight: 700 } },
                            "TP",
                            j + 1),
                        React.createElement("div", { style: { fontSize: 14.5, fontWeight: 800, color: C.text, fontFamily: "'Sora',sans-serif", marginTop: 2 } }, tp)))))),
                    s.rr && React.createElement("div", { style: { marginTop: 10, textAlign: "center", fontSize: 12, color: C.mut } },
                        "RR ",
                        React.createElement("b", { style: { color: C.green } }, s.rr))),
                React.createElement(WinGauge, { confidence: s.confidence, grade: s.grade, factors: ((_b = s.confluence_factors) === null || _b === void 0 ? void 0 : _b.length) || 0, t: t, gradeColor: gradeColor }),
                ((_c = s.confluence_factors) === null || _c === void 0 ? void 0 : _c.length) > 0 && (React.createElement("div", { style: { padding: "14px 18px", borderTop: `1px solid ${C.line}` } },
                    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color: C.blueLt, marginBottom: 9 } },
                        "\u2705 ",
                        t("rReasons")),
                    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, s.confluence_factors.map((f, j) => (React.createElement("div", { key: j, style: { display: "flex", gap: 8, alignItems: "flex-start" } },
                        React.createElement("span", { style: { flexShrink: 0, color: C.green, fontWeight: 700, fontSize: 13 } }, "\u2714\uFE0F"),
                        React.createElement("span", { style: { color: C.text, fontSize: 13, lineHeight: 1.5 } }, f))))))),
                (s.rationale || s.invalidation) && (React.createElement("div", { style: { padding: "0 18px 16px" } },
                    s.rationale && React.createElement("div", { style: { color: C.text, fontSize: 13, lineHeight: 1.6 } }, s.rationale),
                    s.invalidation && React.createElement("div", { style: { marginTop: 8, color: "#FFB4B4", fontSize: 12.5, lineHeight: 1.55 } },
                        React.createElement("b", { style: { color: C.red } }, t("rInvalid")),
                        " ",
                        s.invalidation)))));
        }),
        data.next_move && (React.createElement("div", { style: { borderRadius: 14, border: `1px solid ${C.line}`, background: C.panel2, padding: "13px 16px", display: "flex", gap: 11, alignItems: "flex-start" } },
            React.createElement("span", { style: { fontSize: 17 } }, "\uD83D\uDD00"),
            React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color: C.amber, marginBottom: 3 } }, t("rNext")),
                React.createElement("div", { style: { color: C.text, fontSize: 13, lineHeight: 1.55 } }, data.next_move)))),
        data.quick_map && (React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 18px", borderRadius: 14, background: "rgba(38,130,255,.1)", border: `1px solid ${C.blue}` } },
            React.createElement("span", { style: { fontSize: 19, lineHeight: 1.2 } }, "\uD83D\uDCE6"),
            React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: C.blueLt, marginBottom: 4 } }, t("rQuickMap")),
                React.createElement("div", { style: { color: C.cyan, fontSize: 14, fontWeight: 600, lineHeight: 1.55 } }, data.quick_map)))),
        React.createElement("div", { style: { borderRadius: 14, border: `1px solid ${C.line}`, background: C.panel, padding: "14px 18px" } },
            React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color: C.green, marginBottom: 10 } },
                "\uD83D\uDC9B ",
                t("rChecklist")),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 9 } }, [t("rChk1"), t("rChk2"), t("rChk3")].map((c, j) => (React.createElement("div", { key: j, style: { display: "flex", gap: 9, alignItems: "center" } },
                React.createElement("span", { style: { flexShrink: 0, width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${C.mut}`, display: "inline-block" } }),
                React.createElement("span", { style: { color: C.text, fontSize: 13, lineHeight: 1.45 } }, c)))))),
        data.risk_reminder && React.createElement("div", { style: { padding: "11px 15px", borderRadius: 10, background: C.panel2, border: `1px solid ${C.line}`, color: C.mut, fontSize: 12.5, lineHeight: 1.6 } }, data.risk_reminder),
        (data.dxy_signal || data.oil_signal) && (React.createElement("div", { style: { borderRadius: 14, border: `1px solid ${C.line}`, background: C.panel, overflow: "hidden" } },
            React.createElement("div", { style: { padding: "11px 16px", background: C.panel2, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 9 } },
                React.createElement("span", { style: { fontSize: 15 } }, "\uD83C\uDF10"),
                React.createElement("span", { style: { fontSize: 13.5, fontWeight: 700, color: C.text } }, t("rIntermarket"))),
            React.createElement("div", { style: { padding: "6px 16px 12px", display: "flex", flexDirection: "column", gap: 10 } },
                data.dxy_signal && React.createElement(SmcRow, { icon: "\uD83D\uDCB5", k: t("rDxy"), v: data.dxy_signal, color: C.blueLt }),
                data.oil_signal && React.createElement(SmcRow, { icon: "\uD83D\uDEE2\uFE0F", k: t("rOil"), v: data.oil_signal, color: C.amber })))),
        isAdmin && (data.premium_discount || data.liquidity || data.order_flow || data.dxy_signal) && (React.createElement("details", { style: { borderRadius: 14, border: `1px solid ${C.line}`, background: C.panel, padding: "12px 16px" } },
            React.createElement("summary", { style: { cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.mut } },
                "\uD83D\uDD2C ",
                t("rSmc"),
                " (admin)"),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginTop: 12 } },
                data.dxy_signal && React.createElement(SmcRow, { icon: "\uD83D\uDCB5", k: t("rDxy"), v: data.dxy_signal, color: C.blueLt }),
                data.oil_signal && React.createElement(SmcRow, { icon: "\uD83D\uDEE2\uFE0F", k: t("rOil"), v: data.oil_signal, color: C.amber }),
                data.premium_discount && React.createElement(SmcRow, { icon: "\u2696\uFE0F", k: t("rPremDisc"), v: data.premium_discount, color: C.cyan }),
                data.liquidity && React.createElement(SmcRow, { icon: "\uD83D\uDCA7", k: t("rLiquidity"), v: data.liquidity, color: C.blueLt }),
                data.order_flow && React.createElement(SmcRow, { icon: "\uD83C\uDF0A", k: t("rOrderFlow"), v: data.order_flow, color: C.green }),
                data.order_book && React.createElement(SmcRow, { icon: "\uD83D\uDCD6", k: t("rOrderBook"), v: data.order_book, color: C.mut }),
                data.advanced_read && React.createElement(SmcRow, { icon: "\uD83E\uDDEC", k: t("rAdvanced"), v: data.advanced_read, color: C.amber }),
                data.ict_read && React.createElement(SmcRow, { icon: "\uD83C\uDFAF", k: "ICT Read", v: data.ict_read, color: C.cyan }),
                data.sniper_grade && data.sniper_grade !== "WAIT" && React.createElement(SmcRow, { icon: "\u2B50", k: "Sniper Grade", v: data.sniper_grade, color: data.sniper_grade.startsWith("A+++") ? C.green : data.sniper_grade.startsWith("A+") ? C.blueLt : C.amber }),
                data.options_flow && data.options_flow !== "ບໍ່ມີ options chart" && React.createElement("div", { style: { marginTop: 6, padding: "12px 14px", borderRadius: 12, background: "rgba(255,180,0,.07)", border: "1px solid rgba(255,180,0,.3)" } },
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FFB800", marginBottom: 6 } }, "\uD83D\uDCC8 CME Options Flow (QuikStrike)"),
                    React.createElement("div", { style: { fontSize: 12.5, color: C.text, lineHeight: 1.7, whiteSpace: "pre-wrap" } }, data.options_flow)
                ))))));
}
// ── small components ──────────────────────────────────────
function Dropzone({ onDrop, onClick, t }) {
    return (React.createElement("div", { onDragOver: (e) => e.preventDefault(), onDrop: onDrop, onClick: onClick, style: { border: `1.5px dashed ${C.line}`, borderRadius: 14, background: C.bg2, padding: "44px 24px", textAlign: "center", cursor: "pointer", transition: "border-color .2s" }, onMouseEnter: (e) => (e.currentTarget.style.borderColor = C.blue), onMouseLeave: (e) => (e.currentTarget.style.borderColor = C.line) },
        React.createElement("div", { style: { fontSize: 32, marginBottom: 10 } }, "\uD83C\uDFAF"),
        React.createElement("div", { style: { fontWeight: 600, fontSize: 16 } }, t("dropHere")),
        React.createElement("div", { style: { color: C.mut, fontSize: 13, marginTop: 6 } }, t("clickChoose", { n: MAX_CHARTS }))));
}
function SectionTitle({ kicker, title }) {
    return (React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.blue } }, kicker),
        React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 22, marginTop: 4 } }, title)));
}
function Card({ title, children }) {
    return (React.createElement("div", { style: { borderRadius: 14, border: `1px solid ${C.line}`, background: C.panel, padding: "16px 18px" } },
        title && React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: C.blue, marginBottom: 12 } }, title),
        children));
}
function Row({ k, v }) {
    return (React.createElement("div", { style: { display: "flex", gap: 10, padding: "2px 0" } },
        React.createElement("span", { style: { color: C.mut, fontSize: 13, minWidth: 86 } }, k),
        React.createElement("span", { style: { color: C.text, fontSize: 14, fontWeight: 500 } }, v)));
}
function Stat({ k, v, accent }) {
    return (React.createElement("div", null,
        React.createElement("div", { style: { color: C.mut, fontSize: 11, letterSpacing: ".02em", marginBottom: 3 } }, k),
        React.createElement("div", { style: { color: accent || C.text, fontSize: 14.5, fontWeight: 700, fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif" } }, v)));
}
function SmcRow({ icon, k, v, color }) {
    return (React.createElement("div", { style: { display: "flex", gap: 11, alignItems: "flex-start" } },
        React.createElement("span", { style: { fontSize: 16, lineHeight: 1.3, flexShrink: 0 } }, icon),
        React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".02em", color: color || C.blueLt, marginBottom: 2 } }, k),
            React.createElement("div", { style: { color: C.text, fontSize: 13.5, lineHeight: 1.55 } }, v))));
}
// ── Win-probability gauge (honest: derived from AI confidence + confluence) ──
function WinGauge({ confidence, grade, factors, t, gradeColor }) {
    // Parse the AI confidence string (e.g. "60-65%") to a midpoint number.
    const nums = String(confidence || "").match(/\d+/g);
    let pct = nums ? (nums.length >= 2 ? (Number(nums[0]) + Number(nums[1])) / 2 : Number(nums[0])) : null;
    if (pct == null || isNaN(pct))
        pct = 50;
    pct = Math.max(5, Math.min(80, Math.round(pct))); // clamp to honest range (cap 80%)
    const col = pct >= 62 ? C.green : pct >= 52 ? C.amber : C.red;
    const R = 46, CIRC = 2 * Math.PI * R;
    const dash = (pct / 100) * CIRC;
    // confluence bar (0..6 typical)
    const fMax = 6;
    const fPct = Math.min(100, Math.round((factors / fMax) * 100));
    const gColor = gradeColor ? gradeColor(grade) : C.blueLt;
    return (React.createElement("div", { style: { padding: "16px 18px 4px", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" } },
        React.createElement("div", { style: { position: "relative", width: 116, height: 116, flexShrink: 0 } },
            React.createElement("svg", { width: "116", height: "116", viewBox: "0 0 116 116", style: { transform: "rotate(-90deg)" } },
                React.createElement("circle", { cx: "58", cy: "58", r: R, fill: "none", stroke: C.line, strokeWidth: "10" }),
                React.createElement("circle", { cx: "58", cy: "58", r: R, fill: "none", stroke: col, strokeWidth: "10", strokeLinecap: "round", strokeDasharray: `${dash} ${CIRC}`, style: { transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 5px ${col}66)` } })),
            React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" } },
                React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 26, color: col, lineHeight: 1 } },
                    pct,
                    "%"),
                React.createElement("div", { style: { fontSize: 9.5, color: C.mut, marginTop: 2 } }, t("wrConfidence")))),
        React.createElement("div", { style: { flex: 1, minWidth: 180 } },
            React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 600, fontSize: 13.5, color: C.text, marginBottom: 10 } }, t("wrTitle")),
            React.createElement("div", { style: { marginBottom: 9 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: C.mut, marginBottom: 4 } },
                    React.createElement("span", null, t("wrConfidence")),
                    React.createElement("span", { style: { color: col, fontWeight: 700 } }, confidence || `${pct}%`)),
                React.createElement("div", { style: { height: 7, borderRadius: 99, background: C.bg2, overflow: "hidden" } },
                    React.createElement("div", { style: { width: `${pct}%`, height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${col}, ${col}cc)`, transition: "width 1s ease" } }))),
            React.createElement("div", null,
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: C.mut, marginBottom: 4 } },
                    React.createElement("span", null,
                        t("wrGrade"),
                        grade ? ` · ${grade}` : ""),
                    React.createElement("span", { style: { color: gColor, fontWeight: 700 } },
                        factors,
                        " ",
                        t("wrFactors"))),
                React.createElement("div", { style: { height: 7, borderRadius: 99, background: C.bg2, overflow: "hidden" } },
                    React.createElement("div", { style: { width: `${fPct}%`, height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${gColor}, ${gColor}cc)`, transition: "width 1s ease" } }))),
            React.createElement("div", { style: { fontSize: 10.5, color: C.mut, lineHeight: 1.5, marginTop: 9 } }, t("wrNote")))));
}
function Control({ label, children }) {
    return (React.createElement("div", null,
        React.createElement("div", { style: { color: C.mut, fontSize: 11, letterSpacing: ".04em", marginBottom: 7 } }, label),
        children));
}
function Spinner() { return React.createElement("span", { className: "spin", style: { width: 14, height: 14, borderRadius: "50%", border: `2px solid #04101F`, borderTopColor: "transparent", display: "inline-block" } }); }
function Bars() {
    return (React.createElement("span", { className: "fx-bars", "aria-hidden": true, style: { display: "inline-flex", alignItems: "flex-end", height: 18 } }, [0, 0.15, 0.3, 0.45].map((d, i) => React.createElement("span", { key: i, style: { height: 18, animationDelay: `${d}s` } }))));
}
function WhatsAppIcon({ size = 20 }) {
    return (React.createElement("svg", { width: size, height: size, viewBox: "0 0 32 32", fill: "currentColor", "aria-hidden": true },
        React.createElement("path", { d: "M16.01 3C9.39 3 4 8.39 4 15.01c0 2.12.56 4.18 1.62 6L4 29l8.2-1.57a12 12 0 0 0 3.8.62h.01C22.63 28.05 28 22.66 28 16.04 28 9.42 22.63 3 16.01 3Zm0 21.86h-.01c-1.14 0-2.26-.2-3.31-.58l-.24-.09-4.87.93.93-4.75-.16-.25a9.86 9.86 0 0 1-1.5-5.26c0-5.45 4.44-9.88 9.91-9.88 2.65 0 5.13 1.03 7 2.9a9.82 9.82 0 0 1 2.9 6.99c0 5.45-4.44 9.92-9.36 9.92Zm5.43-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" })));
}
function GoogleIcon({ size = 18 }) {
    return (React.createElement("svg", { width: size, height: size, viewBox: "0 0 48 48", "aria-hidden": true },
        React.createElement("path", { fill: "#FFC107", d: "M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5Z" }),
        React.createElement("path", { fill: "#FF3D00", d: "M6.3 14.7l6.6 4.8C14.7 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" }),
        React.createElement("path", { fill: "#4CAF50", d: "M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6c-2.1 1.6-4.8 2.6-7.7 2.6-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44Z" }),
        React.createElement("path", { fill: "#1976D2", d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.6 5.6C41.8 35.8 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5Z" })));
}
function AppleIcon({ size = 18 }) {
    return (React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true },
        React.createElement("path", { d: "M16.36 12.78c.03 3.02 2.64 4.02 2.67 4.04-.02.07-.42 1.43-1.38 2.84-.83 1.22-1.7 2.43-3.07 2.45-1.34.03-1.78-.79-3.31-.79-1.54 0-2.02.77-3.29.82-1.32.05-2.33-1.32-3.17-2.53C2.05 19.05.78 14.5 2.55 11.43c.88-1.52 2.44-2.49 4.15-2.51 1.3-.03 2.52.87 3.31.87.79 0 2.28-1.08 3.84-.92.65.03 2.49.26 3.67 1.99-.1.06-2.19 1.28-2.16 3.82M13.9 7.13c.7-.85 1.18-2.03 1.05-3.21-1.01.04-2.24.68-2.97 1.52-.65.75-1.22 1.95-1.07 3.1 1.13.09 2.28-.57 2.99-1.41" })));
}
// ── style fns ─────────────────────────────────────────────
const chip = (on) => ({
    padding: "7px 13px", borderRadius: 9, border: `1px solid ${on ? C.blue : C.line}`,
    background: on ? "rgba(38,130,255,.14)" : C.bg2, color: on ? C.cyan : C.mut,
    fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all .15s", fontFamily: "inherit",
});
const primaryBtn = (loading) => ({
    padding: "12px 24px", borderRadius: 11, border: "none",
    background: loading ? C.panel2 : `linear-gradient(95deg, ${C.blue}, ${C.blueLt})`,
    color: loading ? C.mut : "#04101F", fontWeight: 700, fontSize: 14.5,
    cursor: loading ? "default" : "pointer", transition: "filter .15s, transform .15s", fontFamily: "inherit",
    boxShadow: loading ? "none" : `0 8px 24px -10px ${C.glow}`,
});
const ghostBtn = {
    padding: "12px 18px", borderRadius: 11, border: `1px solid ${C.line}`, background: "transparent",
    color: C.text, fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
};
// ── Login / Membership (UI only — wire to your backend for real auth) ──
function Login({ onLogin, lang, setLang, t }) {
    const [mode, setMode] = useState("login"); // login | signup
    const [name, setName] = useState("");
    const [email, setEmail] = useState(() => { try { return localStorage.getItem("sniper_saved_email") || ""; } catch(e) { return ""; } });
    const [pw, setPw] = useState(() => { try { return localStorage.getItem("sniper_saved_pw") || ""; } catch(e) { return ""; } });
    const [rememberMe, setRememberMe] = useState(() => { try { return localStorage.getItem("sniper_remember") === "1"; } catch(e) { return false; } });
    const [broker, setBroker] = useState("");
    const [planSel, setPlanSel] = useState("VIP");
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState("");
    const [refInput, setRefInput] = useState(() => { try { return new URLSearchParams(window.location.search).get("ref") || ""; } catch(e) { return ""; } });
    const submit = () => {
        setError("");
        if (!email.includes("@") || pw.length < 6) {
            setError(t("errEmail"));
            return;
        }
        if (mode === "signup" && (!name.trim() || !agree)) {
            setError(t("errName"));
            return;
        }
        // Check for referral code in URL or manual input
        const urlRef = refInput.trim() || new URLSearchParams(window.location.search).get("ref");
        if (mode === "signup" && urlRef) {
            // Notify admin via WhatsApp about referral signup
            const refMsg = encodeURIComponent(`🔔 Referral signup!\nNew user: ${email}\nReferred by code: ${urlRef}\nPlease create +10 day VIP code for referrer.`);
            const adminWa = `https://wa.me/${WHATSAPP_NUMBER}?text=${refMsg}`;
            setTimeout(() => window.open(adminWa, "_blank"), 2000);
        }
        // DEMO ONLY: no real verification. Replace with backend call.
        // New signups get a free trial; logins get a demo active period.
        // Signup: new trial. Login: restore saved expiresAt (don't reset timer!)
        let expiresAt;
        if (mode === "signup") {
            expiresAt = Date.now() + TRIAL_DAYS * 86400000;
        } else {
            // Try to restore saved expiresAt from localStorage
            try {
                const saved = localStorage.getItem("sniper_user");
                const savedUser = saved ? JSON.parse(saved) : null;
                if (savedUser && savedUser.email === email && savedUser.expiresAt) {
                    expiresAt = savedUser.expiresAt; // Keep original expiry
                } else {
                    expiresAt = Date.now() + TRIAL_DAYS * 86400000; // New user
                }
            } catch(e) {
                expiresAt = Date.now() + TRIAL_DAYS * 86400000;
            }
        }
        if (rememberMe) {
            try { localStorage.setItem("sniper_saved_email", email); localStorage.setItem("sniper_saved_pw", pw); localStorage.setItem("sniper_remember", "1"); } catch(e) {}
        } else {
            try { localStorage.removeItem("sniper_saved_email"); localStorage.removeItem("sniper_saved_pw"); localStorage.removeItem("sniper_remember"); } catch(e) {}
        }
        // Restore saved plan on login
        let plan = mode === "signup" ? "Trial" : "Trial";
        try {
            const saved = localStorage.getItem("sniper_user");
            const savedUser = saved ? JSON.parse(saved) : null;
            if (savedUser && savedUser.email === email && savedUser.plan) {
                plan = savedUser.plan;
            }
        } catch(e) {}
        onLogin({ name: name.trim() || email.split("@")[0], email, plan, expiresAt });
    };
    return (React.createElement("div", { style: { minHeight: "100%", background: C.bg, color: C.text, fontFamily: "'LaoOverride','Noto Sans Lao','Inter',system-ui,sans-serif", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 18px" } },
        React.createElement("style", null, `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        *{ box-sizing:border-box; }
        .lg-in{ width:100%; background:${C.bg2}; border:1px solid ${C.line}; border-radius:11px; padding:12px 14px; color:${C.text}; font-size:14px; font-family:inherit; outline:none; transition:border-color .15s; }
        .lg-in:focus{ border-color:${C.blue}; }
        .lg-btn:focus-visible{ outline:2px solid ${C.blue}; outline-offset:2px; }
        @media (prefers-reduced-motion: reduce){ *{ animation:none!important; } }
        @keyframes lgFloat{ 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-6px);} }
        @keyframes lgPulse{ 0%,100%{ opacity:.45;} 50%{ opacity:.95;} }
        @keyframes lgGrid{ from{ background-position:0 0;} to{ background-position:0 -48px;} }
        @keyframes bgDrift{ from{ transform:translateX(0);} to{ transform:translateX(-50%);} }
      `),
        React.createElement(ChartBackdrop, { tint: "#C9A24B" }),
        React.createElement("div", { "aria-hidden": true, style: { position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "48px 48px", opacity: 0.12, animation: "lgGrid 6s linear infinite", maskImage: "radial-gradient(110% 70% at 50% 30%, #000 30%, transparent 78%)", WebkitMaskImage: "radial-gradient(110% 70% at 50% 30%, #000 30%, transparent 78%)" } }),
        React.createElement("div", { "aria-hidden": true, style: { position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)", width: 520, height: 320, background: `radial-gradient(closest-side, ${C.glow}, transparent)`, filter: "blur(22px)", animation: "lgPulse 5s ease-in-out infinite", pointerEvents: "none" } }),
        React.createElement("div", { style: { position: "relative", zIndex: 1, width: "100%", maxWidth: 420 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "center", marginBottom: 14 } },
                React.createElement(LangSwitch, { lang: lang, setLang: setLang })),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 22 } },
                React.createElement("div", { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center" } },
                    React.createElement("span", { "aria-hidden": true, style: { position: "absolute", width: 220, height: 130, borderRadius: "50%", background: `radial-gradient(closest-side, ${C.glow}, transparent 72%)`, filter: "blur(10px)", animation: "lgPulse 5s ease-in-out infinite" } }),
                    React.createElement("img", { src: LOGO, alt: "Startup FX", style: { position: "relative", display: "block", height: 80, maxWidth: "78%", objectFit: "contain", margin: "0 auto", animation: "lgFloat 5s ease-in-out infinite", filter: `drop-shadow(0 8px 28px ${C.glow})` } })),
                React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontSize: 14, color: C.mut, marginTop: 14, letterSpacing: ".02em" } },
                    React.createElement("span", { style: { color: C.blueLt, fontWeight: 600 } }, "SniperTech AI"),
                    " \u00B7 ",
                    t("memberOnly"))),
            React.createElement("div", { style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, padding: "22px 20px", boxShadow: `0 24px 60px -30px ${C.glow}` } },
                React.createElement("div", { style: { display: "flex", gap: 6, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 4, marginBottom: 18 } }, [["login", t("login")], ["signup", t("signup")]].map(([m, label]) => (React.createElement("button", { key: m, className: "lg-btn", onClick: () => { setMode(m); setError(""); }, style: { flex: 1, padding: "9px 10px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600,
                        background: mode === m ? `linear-gradient(95deg,${C.blue},${C.blueLt})` : "transparent",
                        color: mode === m ? "#04101F" : C.mut } }, label)))),
                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
                    mode === "signup" && (React.createElement(Field, { label: t("fullname") },
                        React.createElement("input", { className: "lg-in", value: name, onChange: (e) => setName(e.target.value), placeholder: t("yourName") }))),
                    React.createElement(Field, { label: t("email") },
                        React.createElement("input", { className: "lg-in", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@email.com" })),
                    React.createElement(Field, { label: t("password") },
                        React.createElement("input", { className: "lg-in", type: "password", value: pw, onChange: (e) => setPw(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })),
                    mode === "login" && React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -4 } },
                        React.createElement("label", { style: { display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: C.mut, cursor: "pointer" } },
                            React.createElement("input", { type: "checkbox", checked: rememberMe, onChange: (e) => setRememberMe(e.target.checked), style: { accentColor: C.blue } }),
                            "ຈື່ລະຫັດຜ່ານ"),
                        React.createElement("button", { type: "button", onClick: () => setError(t("forgotPwNote")), style: { background: "none", border: "none", color: C.blueLt, fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: 0 } }, t("forgotPw"))),
                    mode === "signup" && (React.createElement(React.Fragment, null,
                        React.createElement(Field, { label: t("brokerAcc"), hint: t("brokerHint") },
                            React.createElement("input", { className: "lg-in", value: broker, onChange: (e) => setBroker(e.target.value), placeholder: "Exness / KCM #1234567" })),
                        React.createElement(Field, { label: "ລະຫັດຜູ້ແນະນຳ (ຖ້າມີ)", hint: "ໃສ່ລະຫັດຈາກຜູ້ທີ່ແນະນຳທ່ານ" },
                            React.createElement("input", { className: "lg-in", value: refInput, onChange: (e) => setRefInput(e.target.value.toUpperCase()), placeholder: "ເຊັ່ນ: KANHSTARFX" })),
                        React.createElement("label", { style: { display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: C.mut, lineHeight: 1.6, cursor: "pointer" } },
                            React.createElement("input", { type: "checkbox", checked: agree, onChange: (e) => setAgree(e.target.checked), style: { marginTop: 2, accentColor: C.blue } }),
                            React.createElement("span", null, t("agree"))))),
                    error && React.createElement("div", { style: { color: "#FFB4B4", fontSize: 12.5, lineHeight: 1.5 } }, error),
                    React.createElement("button", { className: "lg-btn", onClick: submit, style: { marginTop: 4, padding: "13px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#04101F", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, boxShadow: `0 10px 28px -12px ${C.glow}` } }, mode === "login" ? t("login") : t("startUsing")),
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, margin: "4px 0" } },
                        React.createElement("span", { style: { flex: 1, height: 1, background: C.line } }),
                        React.createElement("span", { style: { fontSize: 11.5, color: C.mut } }, t("orContinue")),
                        React.createElement("span", { style: { flex: 1, height: 1, background: C.line } })),
                    React.createElement("button", { className: "lg-btn", onClick: () => onLogin({ name: "Google User", email: "user@gmail.com", plan: "Trial", expiresAt: Date.now() + TRIAL_DAYS * 86400000 }), style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px", borderRadius: 12, border: `1px solid ${C.line}`, background: "#fff", color: "#1f2937", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" } },
                        React.createElement(GoogleIcon, null),
                        " ",
                        t("continueGoogle")),
                    React.createElement("button", { className: "lg-btn", onClick: () => onLogin({ name: "Apple User", email: "user@icloud.com", plan: "Trial", expiresAt: Date.now() + TRIAL_DAYS * 86400000 }), style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px", borderRadius: 12, border: `1px solid ${C.line}`, background: "#000", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" } },
                        React.createElement(AppleIcon, null),
                        "  ",
                        t("continueApple")),
                    mode === "login" && (React.createElement("div", { style: { textAlign: "center", fontSize: 12.5, color: C.mut } },
                        t("noAccount"),
                        " ",
                        React.createElement("button", { onClick: () => setMode("signup"), style: { background: "none", border: "none", color: C.blueLt, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, padding: 0 } }, t("signup")))),
                    React.createElement("p", { style: { fontSize: 10.5, color: C.mut, lineHeight: 1.6, textAlign: "center", margin: "2px 0 0" } }, t("socialNote")))),
            React.createElement("a", { className: "lg-btn", href: waLink, target: "_blank", rel: "noopener noreferrer", style: { marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, textDecoration: "none", color: C.text, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px", fontSize: 13.5, fontWeight: 600 } },
                React.createElement("span", { style: { color: C.wa, display: "inline-flex" } },
                    React.createElement(WhatsAppIcon, { size: 18 })),
                t("waHelp")),
            React.createElement("p", { style: { marginTop: 14, fontSize: 11, color: C.mut, lineHeight: 1.7, textAlign: "center" } }, t("backendNote")),
            React.createElement("div", { style: { marginTop: 10, textAlign: "center", fontSize: 10, color: C.mut, opacity: 0.6, letterSpacing: ".06em" } }, "UI v18 \u00B7 wallet + referral + withdraw"))));
}
function Field({ label, hint, children }) {
    return (React.createElement("label", { style: { display: "block" } },
        React.createElement("div", { style: { fontSize: 12, color: C.mut, marginBottom: 6, fontWeight: 500 } }, label),
        children,
        hint && React.createElement("div", { style: { fontSize: 11, color: C.mut, marginTop: 4, opacity: .8 } }, hint)));
}
// ── Animated faint gold/forex chart backdrop (self-contained SVG) ──
function ChartBackdrop({ tint = "#C9A24B" }) {
    // deterministic candle data so layout is stable across renders
    const candles = React.useMemo(() => {
        const out = [];
        let price = 60;
        let seed = 7;
        const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
        for (let i = 0; i < 34; i++) {
            const open = price;
            const move = (rnd() - 0.46) * 12;
            const close = Math.max(8, Math.min(112, open + move));
            const high = Math.max(open, close) + rnd() * 6;
            const low = Math.min(open, close) - rnd() * 6;
            out.push({ i, open, close, high, low, up: close >= open });
            price = close;
        }
        return out;
    }, []);
    const W = 1000, H = 480, step = W / candles.length, cw = step * 0.5;
    const linePts = candles.map((c, i) => `${i * step + step / 2},${H - c.close * 3.4}`).join(" ");
    return (React.createElement("div", { "aria-hidden": true, style: { position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 } },
        React.createElement("div", { style: { position: "absolute", inset: 0, opacity: 0.22, display: "flex", width: "200%", animation: "bgDrift 38s linear infinite" } }, [0, 1].map((k) => (React.createElement("svg", { key: k, viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid slice", style: { width: "50%", height: "100%" } },
            React.createElement("defs", null,
                React.createElement("linearGradient", { id: `lg-line-${k}`, x1: "0", y1: "0", x2: "1", y2: "0" },
                    React.createElement("stop", { offset: "0%", stopColor: tint, stopOpacity: "0.1" }),
                    React.createElement("stop", { offset: "50%", stopColor: tint, stopOpacity: "1" }),
                    React.createElement("stop", { offset: "100%", stopColor: "#7FC0FF", stopOpacity: "0.8" }))),
            candles.map((c, i) => {
                const x = i * step + step / 2;
                const col = c.up ? "#3FD98A" : "#FF6B6B";
                return (React.createElement("g", { key: i, stroke: col, fill: col, opacity: 0.7 },
                    React.createElement("line", { x1: x, x2: x, y1: H - c.high * 3.4, y2: H - c.low * 3.4, strokeWidth: "1.8" }),
                    React.createElement("rect", { x: x - cw / 2, y: H - Math.max(c.open, c.close) * 3.4, width: cw, height: Math.max(2, Math.abs(c.close - c.open) * 3.4), rx: "1" })));
            }),
            React.createElement("polyline", { points: linePts, fill: "none", stroke: `url(#lg-line-${k})`, strokeWidth: "3", strokeLinejoin: "round", strokeLinecap: "round" })))))));
}
// ── News / Economic-calendar analysis tab ──
function NewsPanel({ t, lang, isVip = false, onUpgrade }) {
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState("");
    const [data, setData] = useState(() => {
        try { const s = localStorage.getItem("sniper_news"); return s ? JSON.parse(s) : null; } catch(e) { return null; }
    });
    const [err, setErr] = useState(null);
    const run = async () => {
        setLoading(true);
        setErr(null);
        setData(null);
        setStage(t("nFetching"));
        const outLang = lang === "th" ? "Thai (ภาษาไทย)" : lang === "en" ? "English" : "Lao (ພາສາລາວ)";
        const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
        const sys = `You are a macro analyst for a gold (XAU/USD) trader. Today is ${today}. Output language: ${outLang} — EVERY note, summary, reason and headline MUST be written in ${outLang}. This is the most important rule.

Based on your training knowledge, provide TODAY'S high-impact economic calendar and gold-relevant news. Base it on what ForexFactory and Investing.com would show today, plus any breaking headlines. Focus on USD/gold movers: Fed/FOMC, US data (NFP, CPI, PCE, ISM, jobless claims), and major geopolitical/risk headlines.

Classify clearly:
1) HIGH-IMPACT = "3-star" / red-folder events (move gold most).
2) OTHER = medium/low impact worth knowing.
3) OFF-CALENDAR / BREAKING = important headlines NOT on the standard calendar.

TIME — VERY IMPORTANT: convert every event time to LAOS / VIENTIANE local time (UTC+7, ICT), 24-hour format (e.g. "20:30", not "8:30 PM" and not US time). Put that converted time in "time_local". You may also keep the original source time + zone in "time_src" (e.g. "08:30 EST") for reference. If unsure of the exact time, say so in the note and advise confirming on ForexFactory — do NOT invent a precise time.

STRUCTURE each event into clear parts (so the UI can show heading / subheading / data separately):
- "event"   = the MAIN title, short (e.g. "S&P Global Flash PMI", "Non-Farm Payrolls", "CPI").
- "detail"  = a SHORT sub-line / which release it is (e.g. "Manufacturing + Services, June" / "ຂະແໜງຜະລິດ ແລະ ບໍລິການ ເດືອນມິຖຸນາ"), in ${outLang}. Omit if there's nothing to add.
- "forecast" = consensus/expected figure if known (e.g. "52.3"); "previous" = prior figure (e.g. "52.0"). Use real published consensus from the calendar; if you genuinely don't know, use "" (empty) — do NOT fabricate.
- "note"    = ONE short line in ${outLang}: what it means for gold.

FORECAST / PREDICTION (this is the key feature the trader wants) — for EACH high-impact event add:
- "prediction"  = in ${outLang}, AI's read of how the number is likely to come in vs forecast (e.g. "ຄາດອອກສູງກວ່າຄາດ ~52.6" / "likely beats ~52.6", or "ໃກ້ຄຽງຄາດການ"). Base it on recent trend/prior data. Keep it 1 short line and clearly framed as a PROBABILITY, not a certainty.
- "usd_effect" = EXACTLY one of these verbatim keys (do NOT translate): "USD_STRONG" | "USD_WEAK" | "USD_NEUTRAL" — your call on what that predicted outcome does to the US dollar.
- "gold_effect"= EXACTLY one verbatim key: "GOLD_UP" | "GOLD_DOWN" | "GOLD_VOLATILE" — the inverse-of-USD read for gold.

Then an overall "gold_lean" using EXACTLY one of these keys verbatim (do NOT translate the key): "ຂຶ້ນ (Bullish)", "ລົງ (Bearish)", "ຜັນຜວນ/ລໍຖ້າຂ່າວ (Volatile)" — plus a reason and "trading_note", both in ${outLang}.

Do not invent numbers you don't have. Predictions are educated estimates, label them as such.

Reminder: write all text values in ${outLang} (but keep the verbatim keys above untranslated). Respond with ONLY valid JSON, no markdown:
{
  "date_label": "today's date, written in ${outLang}",
  "summary": "1-2 sentences in ${outLang}",
  "gold_lean": "ຂຶ້ນ (Bullish)|ລົງ (Bearish)|ຜັນຜວນ/ລໍຖ້າຂ່າວ (Volatile)",
  "lean_reason": "in ${outLang}",
  "high_impact": [
    {"time_local":"Laos time 24H e.g. 20:30","time_src":"e.g. 08:30 EST","ccy":"e.g. USD","event":"MAIN title in ${outLang}","detail":"short sub-line in ${outLang} or empty","impact":"label in ${outLang}","forecast":"e.g. 52.3 or empty","previous":"e.g. 52.0 or empty","prediction":"AI estimate in ${outLang}","usd_effect":"USD_STRONG|USD_WEAK|USD_NEUTRAL","gold_effect":"GOLD_UP|GOLD_DOWN|GOLD_VOLATILE","note":"in ${outLang}"}
  ],
  "other_events": [
    {"time_local":"Laos time 24H","time_src":"original","ccy":"string","event":"MAIN in ${outLang}","detail":"sub in ${outLang} or empty","impact":"in ${outLang}","forecast":"or empty","previous":"or empty","note":"in ${outLang}"}
  ],
  "off_calendar": [
    {"headline":"in ${outLang}","note":"in ${outLang}"}
  ],
  "trading_note": "in ${outLang}",
  "disclaimer": "in ${outLang} — remind to confirm live on ForexFactory"
}`;
        const attempt = async () => {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 90000);
            let resp;
            try {
                resp = await fetch(CLAUDE_ENDPOINT, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: "claude-sonnet-4-6", temperature: 0, max_tokens: 2600,
                        messages: [{ role: "user", content: sys }],
                        
                    }),
                    signal: ctrl.signal,
                });
            }
            catch (netErr) {
                clearTimeout(timer);
                const e = new Error("net");
                e.reason = netErr.name === "AbortError"
                    ? "ໃຊ້ເວລານານເກີນ. ລອງໃໝ່ອີກເທື່ອ."
                    : "ເຊື່ອມຕໍ່ AI ບໍ່ໄດ້ — ກວດ internet ແລ້ວລອງໃໝ່.";
                throw e;
            }
            clearTimeout(timer);
            if (!resp.ok) {
                const e = new Error("http");
                e.reason = resp.status === 429 ? "ຖືກເອີ້ນຖີ່ເກີນ. ລໍຖ້າຈັກໜ່ອຍ." : `AI error (${resp.status}).`;
                throw e;
            }
            const j = await resp.json();
            const text = (j.content || []).map((i) => (i.type === "text" ? i.text : "")).join("").trim();
            if (!text) {
                const e = new Error("empty");
                e.reason = "ບໍ່ມີຂໍ້ມູນກັບມາ. ລອງໃໝ່.";
                throw e;
            }
            try {
                return extractJson(text);
            }
            catch {
                const r = tryRepairJson(text);
                if (r)
                    return r;
                const e = new Error("parse");
                e.reason = "ອ່ານຜົນບໍ່ໄດ້. ລອງໃໝ່ອີກເທື່ອ.";
                throw e;
            }
        };
        try {
            setTimeout(() => setStage("ກຳລັງສະຫຼຸບຂ່າວ…"), 3500);
            setData(await attempt());
        }
        catch (e) {
            setErr(e.reason || "ດຶງຂ່າວບໍ່ໄດ້. ລອງໃໝ່ອີກເທື່ອ.");
        }
        finally {
            setLoading(false);
            setStage("");
        }
    };
    const leanColor = (l) => {
        if (!l)
            return C.mut;
        if (l.includes("Bullish") || l.includes("ຂຶ້ນ"))
            return C.green;
        if (l.includes("Bearish") || l.includes("ລົງ"))
            return C.red;
        return C.amber;
    };
    return (React.createElement("section", { style: { marginTop: 18, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, padding: "20px 18px" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" } },
            React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 600, fontSize: 16 } },
                "\uD83D\uDCF0 ",
                t("nTitle")),
            React.createElement("div", { style: { marginLeft: "auto", display: "flex", gap: 8 } },
                React.createElement("a", { className: "fx-link", href: "https://www.forexfactory.com/calendar", target: "_blank", rel: "noopener noreferrer", style: newsSrcBtn }, "ForexFactory \u2197"),
                React.createElement("a", { className: "fx-link", href: "https://th.investing.com/economic-calendar/", target: "_blank", rel: "noopener noreferrer", style: newsSrcBtn }, "Investing \u2197"))),
        React.createElement("p", { style: { color: C.mut, fontSize: 13, lineHeight: 1.7, margin: "0 0 14px" } }, t("nDesc")),
        React.createElement("button", { className: "fx-btn", onClick: run, disabled: loading, style: primaryBtn(loading) }, loading ? React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 } },
            React.createElement(Spinner, null),
            " ",
            stage || t("nFetching")) : t("nFetch")),
        err && React.createElement("div", { style: { marginTop: 14, padding: "12px 16px", borderRadius: 10, background: "rgba(255,107,107,.08)", border: `1px solid ${C.red}`, color: "#FFC4C4", fontSize: 14, lineHeight: 1.6 } }, err),
        data && (React.createElement("div", { className: "fx-rise", style: { marginTop: 18, display: "flex", flexDirection: "column", gap: 14 } },
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 } },
                React.createElement(GlanceStat, { n: (data.high_impact || []).length, label: t("nGlanceHigh"), color: C.red }),
                React.createElement(GlanceStat, { n: (data.other_events || []).length, label: t("nGlanceOther"), color: C.amber }),
                React.createElement(GlanceStat, { n: (data.off_calendar || []).length, label: t("nGlanceOff"), color: C.blue })),
            React.createElement("div", { style: { borderRadius: 14, border: `1px solid ${leanColor(data.gold_lean)}`, background: C.panel2, padding: "16px 18px" } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
                    React.createElement("span", { style: { fontSize: 12, color: C.mut } }, data.date_label),
                    React.createElement("span", { style: { marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#04101F", background: leanColor(data.gold_lean), borderRadius: 99, padding: "4px 12px" } },
                        t("nGold"),
                        " ",
                        data.gold_lean)),
                data.summary && React.createElement("div", { style: { color: C.text, fontSize: 14, lineHeight: 1.7, marginTop: 10 } }, data.summary),
                data.lean_reason && React.createElement("div", { style: { color: C.mut, fontSize: 13, lineHeight: 1.6, marginTop: 6 } }, data.lean_reason)),
            React.createElement(NewsGroup, { title: t("nHigh"), color: C.red, empty: t("nHighEmpty"), items: data.high_impact, t: t, premium: true, render: (ev, i) => React.createElement(EventRow, { key: i, ev: ev, accent: C.red, premium: true, first: i === 0, t: t, isVip: isVip, onUpgrade: onUpgrade }) }),
            React.createElement(NewsGroup, { title: t("nOther"), color: C.amber, empty: t("nOtherEmpty"), items: data.other_events, t: t, render: (ev, i) => React.createElement(EventRow, { key: i, ev: ev, accent: C.amber, first: i === 0, t: t, isVip: isVip, onUpgrade: onUpgrade }) }),
            React.createElement(NewsGroup, { title: t("nOff"), color: C.blue, empty: t("nOffEmpty"), items: data.off_calendar, t: t, render: (n, i) => (React.createElement("div", { key: i, style: { padding: "11px 0", borderTop: i ? `1px solid ${C.line}` : "none" } },
                    React.createElement("div", { style: { color: C.text, fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 } }, n.headline),
                    n.note && React.createElement("div", { style: { color: C.mut, fontSize: 12.5, lineHeight: 1.6, marginTop: 4 } }, n.note))) }),
            data.trading_note && (React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 18px", borderRadius: 14, background: "rgba(38,130,255,.1)", border: `1px solid ${C.blue}` } },
                React.createElement("span", { style: { fontSize: 18 } }, "\uD83D\uDCA1"),
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: C.blueLt, marginBottom: 4 } }, t("nTradeNote")),
                    React.createElement("div", { style: { color: C.cyan, fontSize: 13.5, lineHeight: 1.6 } }, data.trading_note)))),
            data.disclaimer && React.createElement("div", { style: { padding: "10px 14px", borderRadius: 10, background: C.panel2, border: `1px solid ${C.line}`, color: C.mut, fontSize: 12, lineHeight: 1.6 } }, data.disclaimer)))));
}
function GlanceStat({ n, label, color }) {
    return (React.createElement("div", { style: { borderRadius: 12, border: `1px solid ${C.line}`, background: C.panel, padding: "12px 10px", textAlign: "center" } },
        React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontSize: 24, fontWeight: 700, color } }, n),
        React.createElement("div", { style: { fontSize: 11, color: C.mut, marginTop: 2 } }, label)));
}
function NewsGroup({ title, color, items, render, empty, t, premium = false }) {
    const has = Array.isArray(items) && items.length > 0;
    return (React.createElement("div", { style: {
            borderRadius: 16,
            border: premium ? `1px solid ${C.red}55` : `1px solid ${C.line}`,
            background: premium
                ? `linear-gradient(180deg, rgba(255,107,107,.07) 0%, ${C.panel} 38%)`
                : C.panel,
            overflow: "hidden",
            boxShadow: premium ? `0 0 0 1px ${C.red}1A, 0 8px 28px -14px ${C.red}55` : "none",
        } },
        React.createElement("div", { style: {
                padding: "12px 16px",
                background: premium
                    ? `linear-gradient(90deg, ${C.red}22, transparent)`
                    : C.panel2,
                borderBottom: premium ? `1px solid ${C.red}33` : `1px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                gap: 9,
            } },
            React.createElement("span", { style: {
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: premium ? `0 0 8px ${color}` : "none",
                    flexShrink: 0,
                } }),
            React.createElement("span", { style: { fontSize: 13.5, fontWeight: 700, color: C.text, letterSpacing: ".01em" } }, title),
            has && (React.createElement("span", { style: {
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 700,
                    color: premium ? "#04101F" : C.mut,
                    background: premium ? color : "transparent",
                    border: premium ? "none" : `1px solid ${C.line}`,
                    borderRadius: 999,
                    padding: premium ? "2px 9px" : "1px 8px",
                } },
                items.length,
                " ",
                t ? t("nItems") : ""))),
        React.createElement("div", { style: { padding: has ? "4px 14px 10px" : "8px 16px 12px" } }, has ? items.map(render) : React.createElement("div", { style: { color: C.mut, fontSize: 13, padding: "10px 2px" } }, empty))));
}
// effect-tag colour + label resolver (USD / Gold direction chips)
function effectTag(key, t) {
    switch (key) {
        case "USD_STRONG": return { color: C.green, label: t("usdStrong") };
        case "USD_WEAK": return { color: C.red, label: t("usdWeak") };
        case "USD_NEUTRAL": return { color: C.mut, label: t("usdNeutral") };
        case "GOLD_UP": return { color: C.green, label: t("goldUp") };
        case "GOLD_DOWN": return { color: C.red, label: t("goldDown") };
        case "GOLD_VOLATILE": return { color: C.amber, label: t("goldVol") };
        default: return null;
    }
}
function EventRow({ ev, accent, premium = false, first = false, t, isVip = false, onUpgrade }) {
    const localTime = ev.time_local || ev.time || "—";
    const usd = effectTag(ev.usd_effect, t);
    const gold = effectTag(ev.gold_effect, t);
    const hasForecast = ev.forecast || ev.previous;
    const hasPrediction = ev.prediction || usd || gold;
    return (React.createElement("div", { style: {
            display: "grid",
            gridTemplateColumns: "66px 1fr",
            columnGap: 14,
            alignItems: "start",
            padding: "13px 4px",
            borderTop: first ? "none" : `1px solid ${C.line}`,
        } },
        React.createElement("div", { style: { textAlign: "left", paddingTop: 1 } },
            React.createElement("div", { style: {
                    fontSize: 14,
                    fontWeight: 800,
                    color: premium ? C.text : C.blueLt,
                    fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif",
                    lineHeight: 1.1,
                    letterSpacing: ".01em",
                    fontVariantNumeric: "tabular-nums",
                } }, localTime),
            React.createElement("div", { style: { fontSize: 8.5, color: C.mut, marginTop: 2, letterSpacing: ".03em" } }, t("nLocalTime")),
            ev.ccy && (React.createElement("span", { style: {
                    display: "inline-block",
                    marginTop: 6,
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: ".04em",
                    color: C.mut,
                    background: C.bg2,
                    border: `1px solid ${C.line}`,
                    borderRadius: 5,
                    padding: "1px 6px",
                } }, ev.ccy)),
            ev.time_src && (React.createElement("div", { style: { fontSize: 8.5, color: C.mut, marginTop: 5, opacity: 0.7, lineHeight: 1.3 } }, ev.time_src))),
        React.createElement("div", { style: { minWidth: 0 } },
            React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 } },
                React.createElement("span", { style: { fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.35 } }, ev.event),
                ev.impact && (React.createElement("span", { style: {
                        flexShrink: 0,
                        fontSize: 9.5,
                        fontWeight: 800,
                        letterSpacing: ".02em",
                        color: "#04101F",
                        background: premium ? `linear-gradient(180deg, ${accent}, ${accent}cc)` : accent,
                        borderRadius: 6,
                        padding: "2px 8px",
                        whiteSpace: "nowrap",
                        boxShadow: premium ? `0 2px 8px -2px ${accent}88` : "none",
                        marginTop: 1,
                    } }, ev.impact))),
            ev.detail && (React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: C.blueLt, lineHeight: 1.45, marginTop: 3 } }, ev.detail)),
            hasForecast && (React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 } },
                ev.forecast && (React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: C.cyan, background: "rgba(38,130,255,.10)", border: `1px solid ${C.blue}55`, borderRadius: 7, padding: "3px 9px" } },
                    React.createElement("span", { style: { color: C.mut, fontWeight: 700 } }, t("nForecast")),
                    " ",
                    ev.forecast)),
                ev.previous && (React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: C.text, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: "3px 9px" } },
                    React.createElement("span", { style: { color: C.mut, fontWeight: 700 } }, t("nPrevious")),
                    " ",
                    ev.previous)))),
            ev.note && (React.createElement("div", { style: { color: C.mut, fontSize: 12.5, lineHeight: 1.6, marginTop: 8 } }, ev.note)),
            hasPrediction && (isVip ? (React.createElement("div", { style: {
                    marginTop: 10,
                    borderRadius: 11,
                    border: `1px solid ${C.blue}40`,
                    background: "linear-gradient(180deg, rgba(38,130,255,.08), rgba(38,130,255,.02))",
                    padding: "10px 12px",
                } },
                React.createElement("div", { style: { fontSize: 10.5, fontWeight: 800, letterSpacing: ".04em", color: C.blueLt, marginBottom: ev.prediction ? 6 : 0 } }, t("nPrediction")),
                ev.prediction && (React.createElement("div", { style: { color: C.text, fontSize: 12.5, lineHeight: 1.55 } }, ev.prediction)),
                (usd || gold) && (React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: ev.prediction ? 9 : 0 } },
                    usd && (React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: "#04101F", background: usd.color, borderRadius: 999, padding: "3px 11px" } }, usd.label)),
                    gold && (React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: "#04101F", background: gold.color, borderRadius: 999, padding: "3px 11px" } }, gold.label)))))) : (React.createElement("div", { style: {
                    marginTop: 10,
                    position: "relative",
                    borderRadius: 11,
                    border: `1px solid ${C.amber}55`,
                    background: "linear-gradient(180deg, rgba(255,194,75,.08), rgba(255,194,75,.02))",
                    padding: "10px 12px",
                    overflow: "hidden",
                } },
                React.createElement("div", { "aria-hidden": true, style: { filter: "blur(5px)", opacity: 0.5, userSelect: "none", pointerEvents: "none" } },
                    React.createElement("div", { style: { height: 9, width: "82%", borderRadius: 5, background: C.line, marginBottom: 7 } }),
                    React.createElement("div", { style: { display: "flex", gap: 8 } },
                        React.createElement("div", { style: { height: 18, width: 78, borderRadius: 999, background: C.line } }),
                        React.createElement("div", { style: { height: 18, width: 70, borderRadius: 999, background: C.line } }))),
                React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "8px 12px", textAlign: "center", background: "rgba(8,11,20,.45)" } },
                    React.createElement("div", { style: { fontSize: 11.5, fontWeight: 800, color: C.amber } }, t("nPredLock")),
                    React.createElement("div", { style: { fontSize: 10.5, color: C.text, lineHeight: 1.45, maxWidth: 280 } }, t("nPredLockDesc")),
                    onUpgrade && (React.createElement("button", { onClick: onUpgrade, className: "fx-btn", style: {
                            marginTop: 2,
                            fontFamily: "inherit",
                            cursor: "pointer",
                            fontSize: 11.5,
                            fontWeight: 800,
                            color: "#04101F",
                            background: `linear-gradient(95deg, ${C.amber}, #FFD98A)`,
                            border: "none",
                            borderRadius: 999,
                            padding: "6px 14px",
                        } }, t("nPredUnlock"))))))))));
}
const newsSrcBtn = {
    fontSize: 11.5, fontWeight: 600, color: C.blueLt, textDecoration: "none",
    border: `1px solid ${C.line}`, background: C.bg2, borderRadius: 8, padding: "5px 10px",
};
// ── Flag renderer: emoji flags shown as-is; text codes (e.g. "EN") as a neat badge ──
function Flag({ code, size = 15 }) {
    // crude emoji detection: regional-indicator pairs are >1 char and high code points
    const isText = /^[A-Za-z]{1,3}$/.test(code);
    if (isText) {
        return (React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.62), fontWeight: 800, letterSpacing: ".02em", color: C.cyan, background: "rgba(38,130,255,.14)", border: `1px solid ${C.blue}`, borderRadius: 6, padding: "2px 6px", lineHeight: 1, minWidth: size + 6 } }, code));
    }
    return React.createElement("span", { style: { fontSize: size } }, code);
}
// ── Language switcher ─────────────────────────────────────
function LangSwitch({ lang, setLang }) {
    const [open, setOpen] = useState(false);
    const cur = LANGS.find((l) => l.id === lang) || LANGS[0];
    return (React.createElement("div", { style: { position: "relative", display: "inline-block" } },
        React.createElement("button", { onClick: () => setOpen((o) => !o), "aria-label": "language", "aria-expanded": open, style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 99, border: `1px solid ${C.line}`, background: C.bg2, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: C.text } },
            React.createElement("span", { style: { fontSize: 14 } }, "\uD83C\uDF10"),
            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
                React.createElement(Flag, { code: cur.flag, size: 15 }),
                " ",
                cur.label),
            React.createElement("span", { style: { fontSize: 9, color: C.mut, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" } }, "\u25BC")),
        open && (React.createElement(React.Fragment, null,
            React.createElement("div", { onClick: () => setOpen(false), style: { position: "fixed", inset: 0, zIndex: 40 } }),
            React.createElement("div", { style: { position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 41, minWidth: 160, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 5, boxShadow: "0 14px 34px -12px rgba(0,0,0,.7)" } }, LANGS.map((l) => (React.createElement("button", { key: l.id, onClick: () => { setLang(l.id); setOpen(false); }, style: { display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 11px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, textAlign: "left",
                    background: lang === l.id ? "rgba(38,130,255,.12)" : "transparent", color: lang === l.id ? C.cyan : C.text } },
                React.createElement(Flag, { code: l.flag, size: 15 }),
                React.createElement("span", { style: { flex: 1 } }, l.label),
                lang === l.id && React.createElement("span", { style: { color: C.green, fontSize: 12 } }, "\u2713")))))))));
}
// ── Payment / Locked screen ───────────────────────────────
// ── Slip Upload Form (real payment submission via WhatsApp) ──────
function SlipUploadForm({ t, plan, waLink, onPaid }) {
    const [slipFile, setSlipFile] = React.useState(null);
    const [email, setEmail] = React.useState(() => { try { return JSON.parse(localStorage.getItem("sniper_user")||"{}").email||""; } catch(e){return "";} });
    const [phone, setPhone] = React.useState(() => { try { return JSON.parse(localStorage.getItem("sniper_user")||"{}").phone||""; } catch(e){return "";} });
    const [sent, setSent] = React.useState(false);
    const [step, setStep] = React.useState(0); // 0=form, 1=sent
    const slipRef = React.useRef(null);

    const pickSlip = (files) => {
        const f = Array.from(files||[])[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = e => setSlipFile({ url: e.target.result, name: f.name, raw: f });
        r.readAsDataURL(f);
    };

    const sendSlip = () => {
        if (!email) { alert("ກະລຸນາໃສ່ Email ກ່ອນ"); return; }
        let name = "";
        try { name = JSON.parse(localStorage.getItem("sniper_user")||"{}").name||""; } catch(e) {}
        const planStr = plan ? plan.ccy + " " + plan.price : "";

        // 1) Send WhatsApp text message (no image in URL - WhatsApp doesn't support it)
        const waMsg = "\uD83E\uDDFE *ສົ່ງສະລິບຊຳລະເງິນ*\n━━━━━━━━━━━━━━━\n"
            + "\uD83D\uDC64 ຊື່: " + name + "\n"
            + "\uD83D\uDCE7 Email: " + email + "\n"
            + "\uD83D\uDCDE ເບີໂທ: " + (phone||"ບໍ່ໄດ້ໃສ່") + "\n"
            + "\uD83D\uDCB0 ແຜນ: " + planStr + "\n"
            + "━━━━━━━━━━━━━━━\n"
            + "\uD83D\uDCCE ສະລິບ: " + (slipFile ? slipFile.name : "-") + "\n"
            + "ກະລຸນາ Activate ແລ້ວສົ່ງ Code ກັບຄືນ \uD83D\uDE4F";
        window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(waMsg), "_blank");

        // 2) Log to Sheets
        if (SHEETS_URL) {
            try { fetch(SHEETS_URL + "?action=logSlip&email=" + encodeURIComponent(email) + "&phone=" + encodeURIComponent(phone) + "&plan=" + encodeURIComponent(planStr) + "&name=" + encodeURIComponent(name) + "&ts=" + Date.now(), { cache: "no-store" }).catch(()=>{}); } catch(e) {}
        }

        setSent(true);
        setStep(1);
    };

    // Step 1: confirm sent — now guide to send image separately
    if (step === 1) return React.createElement("div", { style: { marginTop: 14, background: "rgba(37,211,102,.08)", borderRadius: 14, border: "1px solid rgba(37,211,102,.4)", padding: "16px" } },
        React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: C.green, marginBottom: 10 } }, "✅ ສົ່ງຂໍ້ຄວາມໄປ WhatsApp ແລ້ວ!"),
        slipFile && React.createElement(React.Fragment, null,
            React.createElement("div", { style: { fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 10 } },
                "⚠️ WhatsApp ສົ່ງຮູບຜ່ານ link ບໍ່ໄດ້ — ກະລຸນາ:\n\n1. ເປີດ WhatsApp ທີ່ຫາກໍ່ open\n2. ກົດ 📎 ແນບໄຟລ໌\n3. ເລືອກຮູບສະລິບ: ", React.createElement("strong", null, slipFile.name)),
            React.createElement("img", { src: slipFile.url, alt: "slip preview", style: { width: "100%", maxHeight: 160, objectFit: "contain", borderRadius: 10, border: "1px solid " + C.line, marginTop: 6 } })
        ),
        React.createElement("div", { style: { fontSize: 12, color: C.mut, marginTop: 8 } }, "Admin ຈະ Activate ແລະສົ່ງ Code ກັບໃຫ້ທ່ານ")
    );

    return React.createElement("div", { style: { marginTop: 14, background: C.bg2, borderRadius: 14, border: "1px solid " + C.line, padding: "16px" } },
        React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 12 } }, "\uD83D\uDCE4 ສົ່ງຫຼັກຖານການຊຳລະ"),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
            React.createElement("input", { value: email, onChange: e => setEmail(e.target.value), placeholder: "Email *", type: "email", style: { background: C.bg, border: "1px solid " + C.line, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13.5, fontFamily: "inherit", outline: "none" } }),
            React.createElement("input", { value: phone, onChange: e => setPhone(e.target.value), placeholder: "\uD83D\uDCDE ເບີໂທ (020XXXXXXXX)", type: "tel", style: { background: C.bg, border: "1px solid " + C.line, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13.5, fontFamily: "inherit", outline: "none" } }),
            // Slip image picker (for preview + reference)
            React.createElement("div", { onClick: () => slipRef.current && slipRef.current.click(), style: { borderRadius: 10, border: "1.5px dashed " + (slipFile ? C.green : C.line), background: C.bg, padding: slipFile ? 0 : "16px 12px", textAlign: "center", cursor: "pointer", overflow: "hidden" } },
                slipFile
                    ? React.createElement("img", { src: slipFile.url, alt: "slip", style: { width: "100%", maxHeight: 180, objectFit: "contain", display: "block" } })
                    : React.createElement(React.Fragment, null,
                        React.createElement("div", { style: { fontSize: 22 } }, "\uD83E\uDFFE"),
                        React.createElement("div", { style: { fontSize: 13, color: C.mut, marginTop: 4 } }, "ກົດເພື່ອເລືອກຮູບສະລິບ"))
            ),
            React.createElement("input", { ref: slipRef, type: "file", accept: "image/*", style: { display: "none" }, onChange: e => pickSlip(e.target.files) }),
            React.createElement("div", { style: { fontSize: 11.5, color: C.mut, lineHeight: 1.6, padding: "8px 10px", background: "rgba(255,180,50,.07)", borderRadius: 8, border: "1px solid rgba(255,180,50,.2)" } },
                "⚠️ WhatsApp ບໍ່ຮອງຮັບການສົ່ງຮູບຜ່ານ link — ລະບົບຈະສົ່ງ\u200Bຂໍ້ຄວາມໄປກ່ອນ, ຈາກນັ້ນໃຫ້ທ່ານ\u200Bແນບຮູບໃນ WhatsApp ເອງ"
            ),
            React.createElement("button", { onClick: sendSlip, className: "fx-btn", style: { padding: "12px", borderRadius: 11, border: "none", background: "linear-gradient(95deg," + C.wa + ",#1DA851)", color: "#04130A", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 } },
                React.createElement(WhatsAppIcon, { size: 18 }),
                "\uD83D\uDCE4 ສົ່ງຂໍ້ຄວາມ + ເປີດ WhatsApp")
        )
    );
}
function PaymentScreen({ t, lang, setLang, locked, onPaid, onBack, onLogout }) {
    const [actCode, setActCode] = React.useState("");
    const [actMsg, setActMsg] = React.useState("");
    const activateCode = async () => {
        const code = actCode.trim().toUpperCase();
        setActMsg("⏳ ກຳລັງກວດສອບ...");

        // 1) Static codes (VIP30, VIP365, etc.)
        if (ACTIVATION_CODES[code]) {
            const found = ACTIVATION_CODES[code];
            setActMsg(t("actCodeOk").replace("{n}", found.days));
            setTimeout(() => onPaid(found.days, found.plan), 1200);
            return;
        }

        // 2) Google Sheets — primary source of truth (all via GET to avoid CORS)
        if (SHEETS_URL) {
            try {
                // checkCode via GET
                const checkUrl = `${SHEETS_URL}?action=checkCode&code=${encodeURIComponent(code)}`;
                const r = await fetch(checkUrl, { cache: "no-store" });
                const text = await r.text();
                let d = null;
                try { d = JSON.parse(text); } catch(pe) { console.error("Sheets parse err:", text); }
                if (d !== null) {
                    if (d.valid === true && !d.used) {
                        // Mark used via GET (no-cors POST cannot be read back)
                        const useUrl = `${SHEETS_URL}?action=useCode&code=${encodeURIComponent(code)}`;
                        fetch(useUrl, { cache: "no-store" }).catch(() => {});
                        setActMsg(t("actCodeOk").replace("{n}", d.days || 30));
                        setTimeout(() => onPaid(d.days || 30, "VIP"), 1200);
                        return;
                    } else if (d.used) { setActMsg("❌ Code ນີ້ຖືກໃຊ້ແລ້ວ"); return; }
                    else if (d.valid === false) { setActMsg("❌ Code ບໍ່ຖືກຕ້ອງ"); return; }
                }
            } catch(e) { console.warn("Sheets unreachable:", e); }
        }

        // 3) Fallback: local vip_codes (same device only)
        try {
            const codeMap = JSON.parse(localStorage.getItem("vip_codes") || "{}");
            const entry = codeMap[code];
            if (!entry) { setActMsg("❌ Code ບໍ່ຖືກຕ້ອງ"); return; }
            if (entry.used) { setActMsg("❌ Code ນີ້ຖືກໃຊ້ແລ້ວ"); return; }
            codeMap[code].used = true;
            localStorage.setItem("vip_codes", JSON.stringify(codeMap));
            const hist = JSON.parse(localStorage.getItem("admin_codes") || "[]");
            const idx = hist.findIndex(h => h.code === code);
            if (idx >= 0) { hist[idx].used = true; localStorage.setItem("admin_codes", JSON.stringify(hist)); }
            setActMsg(t("actCodeOk").replace("{n}", entry.days));
            setTimeout(() => onPaid(entry.days, "VIP"), 1200);
        } catch(e) {
            setActMsg("❌ Code ບໍ່ຖືກຕ້ອງ");
        }
    };
    // Lao users: all 3 channels (LAK/THB/USDT). Other countries: USDT only.
    const availablePlans = lang === "lo" ? PLANS : PLANS.filter((p) => p.ccy === "USDT");
    const [sel, setSel] = useState(0);
    const [copied, setCopied] = useState(false);
    const plan = availablePlans[sel] || availablePlans[0];
    const copyAddr = async () => {
        try {
            await navigator.clipboard.writeText(USDT_ADDRESS);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }
        catch { }
    };
    return (React.createElement("div", { style: { minHeight: "100%", background: C.bg, color: C.text, fontFamily: "'LaoOverride','Noto Sans Lao','Inter',system-ui,sans-serif", position: "relative", overflow: "hidden", padding: "26px 18px 60px" } },
        React.createElement("style", null, `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        @media (prefers-reduced-motion: reduce){*{animation:none!important;}}
        @keyframes ppPulse{0%,100%{opacity:.4;}50%{opacity:.9;}}
      `),
        React.createElement("div", { "aria-hidden": true, style: { position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", width: 500, height: 300, background: `radial-gradient(closest-side, ${C.glow}, transparent)`, filter: "blur(22px)", animation: "ppPulse 5s ease-in-out infinite", pointerEvents: "none" } }),
        React.createElement("div", { style: { position: "relative", maxWidth: 440, margin: "0 auto" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 } },
                React.createElement(LangSwitch, { lang: lang, setLang: setLang }),
                !locked && React.createElement("button", { className: "fx-btn", onClick: onBack, style: { ...ghostBtn, padding: "7px 14px", fontSize: 13 } },
                    "\u2190 ",
                    t("backToApp"))),
            React.createElement("div", { style: { textAlign: "center", marginBottom: 18 } },
                React.createElement("img", { src: LOGO, alt: "Startup FX", style: { height: 60, maxWidth: "70%", objectFit: "contain" } })),
            locked && (React.createElement("div", { style: { borderRadius: 14, border: `1px solid ${C.amber}`, background: "rgba(255,194,75,.1)", padding: "16px 18px", marginBottom: 16, textAlign: "center" } },
                React.createElement("div", { style: { fontSize: 26, marginBottom: 4 } }, "\uD83D\uDD12"),
                React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 17, color: C.amber } }, t("locked")),
                React.createElement("div", { style: { color: C.text, fontSize: 13.5, lineHeight: 1.6, marginTop: 6 } }, t("lockedDesc")))),
            React.createElement("div", { style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, padding: "20px 18px" } },
                React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 18, textAlign: "center" } }, t("payTitle")),
                React.createElement("div", { style: { color: C.mut, fontSize: 13, textAlign: "center", lineHeight: 1.6, marginTop: 6 } }, t("payDesc", { price: plan.price })),
                React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${availablePlans.length},1fr)`, gap: 8, marginTop: 16 } }, availablePlans.map((p, i) => (React.createElement("button", { key: p.ccy, onClick: () => setSel(i), style: { borderRadius: 12, padding: "10px 6px", cursor: "pointer", fontFamily: "inherit", textAlign: "center",
                        border: `1px solid ${sel === i ? C.blue : C.line}`, background: sel === i ? "rgba(38,130,255,.12)" : C.bg2 } },
                    React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700, color: sel === i ? C.cyan : C.text } }, p.ccy),
                    React.createElement("div", { style: { fontSize: 10.5, color: C.mut, marginTop: 2 } }, p.price))))),
                React.createElement("div", { style: { marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 } },
                    React.createElement("div", { style: { background: "#fff", padding: 10, borderRadius: 14, border: `1px solid ${C.line}` } },
                        React.createElement("img", { src: plan.qr, alt: `QR ${plan.ccy}`, style: { width: 220, height: "auto", display: "block", borderRadius: 6 } })),
                    React.createElement("div", { style: { fontSize: 13, color: C.blueLt, fontWeight: 600 } },
                        t("scanToPay"),
                        " \u00B7 ",
                        plan.label),
                    React.createElement("div", { style: { fontSize: 11.5, color: C.mut } }, plan.note),
                    plan.ccy === "USDT" && (React.createElement("div", { style: { width: "100%", marginTop: 4 } },
                        React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" } },
                            React.createElement("code", { style: { flex: 1, fontSize: 11, color: C.text, wordBreak: "break-all", lineHeight: 1.4 } }, USDT_ADDRESS),
                            React.createElement("button", { onClick: copyAddr, className: "fx-btn", style: { flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#04101F", background: copied ? C.green : C.blueLt, border: "none", borderRadius: 7, padding: "6px 10px", cursor: "pointer", fontFamily: "inherit" } }, copied ? t("copied") : t("copyAddr")))))),
                React.createElement("div", { style: { marginTop: 16, padding: "11px 14px", borderRadius: 10, background: "rgba(37,211,102,.08)", border: `1px solid rgba(37,211,102,.4)`, color: "#BFF3D2", fontSize: 12.5, lineHeight: 1.6 } }, t("afterPay")),
                React.createElement(SlipUploadForm, { t: t, plan: plan, waLink: waLink, onPaid: onPaid }),
                React.createElement("div", { style: { marginTop: 12, borderTop: `1px solid ${C.line}`, paddingTop: 12 } },
                    React.createElement("div", { style: { fontSize: 12, color: C.mut, textAlign: "center", marginBottom: 8 } }, "— ຫຼື ໃສ່ລະຫັດ VIP —"),
                    React.createElement("div", { style: { display: "flex", gap: 8 } },
                        React.createElement("input", { value: actCode, onChange: (e) => { setActCode(e.target.value.toUpperCase()); setActMsg(""); }, placeholder: t("actCodePlaceholder"), style: { flex: 1, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }, onKeyDown: (e) => e.key === "Enter" && activateCode() }),
                        React.createElement("button", { onClick: activateCode, className: "fx-btn", style: { padding: "10px 14px", borderRadius: 10, border: "none", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" } }, t("actCodeBtn"))),
                    actMsg && React.createElement("div", { style: { marginTop: 8, fontSize: 13, textAlign: "center", color: actMsg.startsWith("✅") ? C.green : "#FFB4B4", fontWeight: 600 } }, actMsg))),
            React.createElement("p", { style: { marginTop: 14, fontSize: 11, color: C.mut, lineHeight: 1.7, textAlign: "center" } }, t("backendNote")),
            React.createElement("div", { style: { textAlign: "center", marginTop: 10 } },
                React.createElement("button", { onClick: onLogout, style: { background: "none", border: "none", color: C.mut, fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" } }, t("logout"))))));
}
// ── Course panel (video lessons, locked until paid) ──────────
function CoursePanel({ t, unlocked, onUnlock, waLink }) {
    const [active, setActive] = useState(null); // index of lesson playing
    return (React.createElement("section", { style: { marginTop: 18 } },
        React.createElement("div", { style: { background: `linear-gradient(180deg, ${C.panel}, ${C.bg2})`, border: `1px solid ${C.line}`, borderRadius: 18, padding: "22px 20px" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" } },
                React.createElement("div", { style: { fontSize: 30 } }, "\uD83C\uDF93"),
                React.createElement("div", { style: { flex: 1, minWidth: 200 } },
                    React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 19 } }, t("courseTitle")),
                    React.createElement("div", { style: { color: C.mut, fontSize: 13, lineHeight: 1.6, marginTop: 4 } }, t("courseSub"))),
                unlocked
                    ? React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#04130A", background: C.green, borderRadius: 99, padding: "6px 14px" } }, t("courseUnlocked"))
                    : React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: C.cyan, background: "rgba(38,130,255,.12)", border: `1px solid ${C.blue}`, borderRadius: 99, padding: "6px 14px" } }, t("coursePrice")))),
        !unlocked ? (React.createElement("div", { style: { marginTop: 14, border: `1px solid ${C.amber}`, background: "rgba(255,194,75,.08)", borderRadius: 16, padding: "22px 20px", textAlign: "center" } },
            React.createElement("div", { style: { fontSize: 30, marginBottom: 6 } }, "\uD83D\uDD12"),
            React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 17, color: C.amber } }, t("courseLocked")),
            React.createElement("div", { style: { color: C.text, fontSize: 13.5, lineHeight: 1.6, marginTop: 6, maxWidth: 420, marginLeft: "auto", marginRight: "auto" } }, t("courseLockedDesc")),
            React.createElement("div", { style: { marginTop: 16, display: "flex", flexDirection: "column", gap: 8, textAlign: "left", maxWidth: 460, marginLeft: "auto", marginRight: "auto" } }, COURSE_LESSONS.map((l, i) => (React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: C.panel2, border: `1px solid ${C.line}`, opacity: 0.75 } },
                React.createElement("span", { style: { fontSize: 12, color: C.mut, minWidth: 46 } },
                    t("courseLesson"),
                    " ",
                    i + 1),
                React.createElement("span", { style: { flex: 1, fontSize: 13, color: C.text } }, l.title),
                React.createElement("span", { style: { fontSize: 11, color: C.mut } }, l.dur),
                React.createElement("span", { style: { fontSize: 11 } }, "\uD83D\uDD12"))))),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 9, marginTop: 18, maxWidth: 360, marginLeft: "auto", marginRight: "auto" } },
                React.createElement("a", { className: "fx-link", href: waLink, target: "_blank", rel: "noopener noreferrer", style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 9, textDecoration: "none", background: C.wa, color: "#04130A", fontWeight: 700, fontSize: 14, padding: "12px", borderRadius: 11 } },
                    React.createElement(WhatsAppIcon, { size: 18 }),
                    " ",
                    t("courseUnlock")),
                React.createElement("button", { onClick: onUnlock, className: "fx-btn", style: { padding: "11px", borderRadius: 11, border: `1px solid ${C.line}`, background: "transparent", color: C.mut, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, t("courseDemoUnlock"))),
            React.createElement("p", { style: { fontSize: 11, color: C.mut, lineHeight: 1.7, marginTop: 14 } }, t("courseBackendNote")))) : (React.createElement("div", { style: { marginTop: 14, display: "flex", flexDirection: "column", gap: 10 } },
            active !== null && (React.createElement("div", { style: { borderRadius: 14, overflow: "hidden", border: `1px solid ${C.blue}`, background: "#000" } },
                React.createElement("div", { style: { position: "relative", width: "100%", paddingTop: "56.25%" } },
                    React.createElement("iframe", { title: COURSE_LESSONS[active].title, src: COURSE_LESSONS[active].embed, style: { position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }, allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true })),
                React.createElement("div", { style: { padding: "10px 14px", fontSize: 13.5, fontWeight: 600, color: C.text, background: C.panel2 } }, COURSE_LESSONS[active].title))),
            COURSE_LESSONS.map((l, i) => (React.createElement("button", { key: i, onClick: () => setActive(i), className: "fx-btn", style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 11, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    background: active === i ? "rgba(38,130,255,.12)" : C.panel, border: `1px solid ${active === i ? C.blue : C.line}` } },
                React.createElement("span", { style: { fontSize: 12, color: C.blueLt, minWidth: 46, fontWeight: 700 } },
                    t("courseLesson"),
                    " ",
                    i + 1),
                React.createElement("span", { style: { flex: 1, fontSize: 13.5, color: C.text } }, l.title),
                React.createElement("span", { style: { fontSize: 11, color: C.mut } }, l.dur),
                React.createElement("span", { style: { fontSize: 12, color: C.green, fontWeight: 700 } }, t("courseWatch")))))))));
}
// ── Live Chart Panel (TradingView real-time widgets) ─────────────
function LiveChartPanel({ t, lang }) {
    const [symbol, setSymbol] = useState("XAUUSD");
    const [interval, setIntervalVal] = useState("15");
    const chartRef = useRef(null);
    const tickerRef = useRef(null);

    const SYMBOLS = [
        { id: "XAUUSD", label: "XAU/USD 🥇" },
        { id: "USINDEX", label: "DXY 💵" },
        { id: "USOIL", label: "Oil 🛢️" },
    ];
    const INTERVALS = [
        { id: "1", label: "M1" }, { id: "5", label: "M5" },
        { id: "15", label: "M15" }, { id: "60", label: "H1" },
        { id: "240", label: "H4" }, { id: "D", label: "D1" },
    ];

    // Inject TradingView ticker tape
    useEffect(() => {
        if (!tickerRef.current) return;
        tickerRef.current.innerHTML = "";
        const s = document.createElement("script");
        s.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        s.async = true;
        s.innerHTML = JSON.stringify({
            symbols: [
                { proName: "OANDA:XAUUSD", title: "Gold" },
                { proName: "TVC:DXY", title: "DXY" },
                { proName: "TVC:USOIL", title: "Oil" },
                { proName: "BITSTAMP:BTCUSD", title: "BTC" },
                { proName: "OANDA:EURUSD", title: "EUR/USD" },
            ],
            showSymbolLogo: true, colorTheme: "dark", isTransparent: true,
            displayMode: "adaptive", locale: "en"
        });
        tickerRef.current.appendChild(s);
    }, []);

    // Inject TradingView advanced chart
    useEffect(() => {
        if (!chartRef.current) return;
        chartRef.current.innerHTML = "";
        const container = document.createElement("div");
        container.className = "tradingview-widget-container__widget";
        chartRef.current.appendChild(container);
        const s = document.createElement("script");
        s.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        s.async = true;
        const tvSymbol = symbol === "XAUUSD" ? "OANDA:XAUUSD" : symbol === "USINDEX" ? "TVC:DXY" : "TVC:USOIL";
        s.innerHTML = JSON.stringify({
            autosize: true, symbol: tvSymbol,
            interval: interval, timezone: "Asia/Bangkok",
            theme: "dark", style: "1",
            locale: "en", backgroundColor: C.panel,
            gridColor: "rgba(38,130,255,0.06)",
            hide_top_toolbar: false, hide_legend: false,
            allow_symbol_change: true, save_image: false,
            calendar: false, hide_volume: false,
            support_host: "https://www.tradingview.com",
            studies: ["STD;Bollinger_Bands", "STD;RSI", "STD;MACD"],
        });
        chartRef.current.appendChild(s);
    }, [symbol, interval]);

    return React.createElement("div", { style: { marginTop: 14 } },
        // Ticker tape
        React.createElement("div", { ref: tickerRef, style: { borderRadius: 12, overflow: "hidden", marginBottom: 14, border: `1px solid ${C.line}` } }),

        // Symbol + TF selector
        React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" } },
            React.createElement("div", { style: { display: "flex", gap: 6, background: C.bg2, borderRadius: 10, padding: 4, border: `1px solid ${C.line}` } },
                SYMBOLS.map(sym => React.createElement("button", { key: sym.id, onClick: () => setSymbol(sym.id), className: "fx-btn", style: { padding: "6px 12px", borderRadius: 7, border: "none", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer", background: symbol === sym.id ? `linear-gradient(95deg,${C.blue},${C.blueLt})` : "transparent", color: symbol === sym.id ? "#04101F" : C.mut } }, sym.label))
            ),
            React.createElement("div", { style: { display: "flex", gap: 4, background: C.bg2, borderRadius: 10, padding: 4, border: `1px solid ${C.line}` } },
                INTERVALS.map(iv => React.createElement("button", { key: iv.id, onClick: () => setIntervalVal(iv.id), className: "fx-btn", style: { padding: "6px 9px", borderRadius: 7, border: "none", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", background: interval === iv.id ? `linear-gradient(95deg,${C.blue},${C.blueLt})` : "transparent", color: interval === iv.id ? "#04101F" : C.mut } }, iv.label))
            )
        ),

        // Chart container
        React.createElement("div", { style: { borderRadius: 16, overflow: "hidden", border: `1px solid ${C.line}`, background: C.panel } },
            React.createElement("div", { ref: chartRef, className: "tradingview-widget-container", style: { height: 520, width: "100%" } })
        ),

        // Hint
        React.createElement("div", { style: { marginTop: 10, padding: "10px 14px", borderRadius: 10, background: C.bg2, border: `1px solid ${C.line}`, fontSize: 11.5, color: C.mut, lineHeight: 1.6 } },
            "💡 Screenshot chart ຈາກ Live Chart → ໄປ 📊 ວິເຄາະກຣາຟ → Upload → AI ວິເຄາະ SMC/ICT ໄດ້ທັນທີ"
        )
    );
}
function NewsRoom({ t, notify: extNotify, setNotify: extSetNotify, isAdmin = false }) {
    const POSTS_KEY = "sniper_news_posts";
    const [posts, setPosts] = useState(() => {
        try { const s = JSON.parse(localStorage.getItem(POSTS_KEY)||"null"); if(s&&s.length>0) return s; } catch(e) {}
        return [{ id: 1, text: "ຍິນດີຕ້ອນຮັບສູ່ຫ້ອງຂ່າວ Startup FX! ປະກາດ ແລະ ສັນຍານສຳຄັນຈະລົງທີ່ນີ້.", ts: Date.now() - 3600000 }];
    });
    useEffect(() => { try { localStorage.setItem(POSTS_KEY, JSON.stringify(posts)); } catch(e) {} }, [posts]);
    const [localNotify, setLocalNotify] = useState(typeof Notification !== "undefined" && Notification.permission === "granted");
    const notify = extNotify !== undefined ? extNotify : localNotify;
    const setNotify = extSetNotify || setLocalNotify;
    const [denied, setDenied] = useState(typeof Notification !== "undefined" && Notification.permission === "denied");
    const [draft, setDraft] = useState("");
    const [postImages, setPostImages] = useState([]);
    const imgRef = React.useRef(null);
    const addPostImages = (files) => {
        Array.from(files||[]).filter(f=>f.type.startsWith('image/')).slice(0,4).forEach(file => {
            const r = new FileReader();
            r.onload = e => setPostImages(prev => [...prev, {url:e.target.result, name:file.name}].slice(0,4));
            r.readAsDataURL(file);
        });
    };
    const enableNotify = async () => {
        if (typeof Notification === "undefined")
            return;
        if (Notification.permission === "granted") {
            setNotify(true);
            return;
        }
        const p = await Notification.requestPermission();
        if (p === "granted")
            setNotify(true);
        else if (p === "denied")
            setDenied(true);
    };
    const post = () => {
        const text = draft.trim();
        if (!text && postImages.length === 0) return;
        const p = { id: Date.now(), text, images: postImages, ts: Date.now() };
        setPosts((arr) => [p, ...arr]);
        setDraft(""); setPostImages([]);
        if (notify && typeof Notification !== "undefined" && Notification.permission === "granted") {
            try { new Notification("Startup FX", { body: (text||"ໂພສຮູບໃໝ່").slice(0, 120) }); } catch { }
        }
    };
    const fmt = (ts) => {
        const d = new Date(ts);
        return d.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    };
    const isNew = (ts) => Date.now() - ts < 86400000;
    return (React.createElement("section", { style: { marginTop: 18 } },
        React.createElement("div", { style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, padding: "20px 18px" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
                React.createElement("div", { style: { flex: 1, minWidth: 180 } },
                    React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 17 } },
                        "\uD83D\uDCE2 ",
                        t("roomTitle")),
                    React.createElement("div", { style: { color: C.mut, fontSize: 12.5, marginTop: 3 } }, t("roomSub"))),
                React.createElement("button", { onClick: enableNotify, className: "fx-btn", style: { fontSize: 12.5, fontWeight: 600, padding: "8px 13px", borderRadius: 99, cursor: "pointer", fontFamily: "inherit",
                        background: notify ? "rgba(37,211,102,.14)" : "transparent", border: `1px solid ${notify ? C.green : C.line}`, color: notify ? C.green : C.mut } }, denied ? t("roomNotifyDenied") : notify ? t("roomNotifyOn") : t("roomNotifyOff"))),
            isAdmin && (React.createElement("div", { style: { marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` } },
                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
                    React.createElement("textarea", { value: draft, onChange: (e) => setDraft(e.target.value), placeholder: t("roomPostPlaceholder"), rows: 3, style: { width: "100%", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13.5, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.6 } }),
                    postImages.length > 0 && React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
                        postImages.map((img, i) => React.createElement("div", { key: i, style: { position: "relative" } },
                            React.createElement("img", { src: img.url, alt: img.name, style: { width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.line}` } }),
                            React.createElement("button", { onClick: () => setPostImages(prev => prev.filter((_,j)=>j!==i)), style: { position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", border: "none", background: "rgba(5,7,13,.85)", color: C.text, cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 0 } }, "\u00D7")))
                    ),
                    React.createElement("div", { style: { display: "flex", gap: 8 } },
                        React.createElement("button", { onClick: () => imgRef.current && imgRef.current.click(), className: "fx-btn", style: { padding: "9px 13px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.bg2, color: C.mut, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" } }, "\uD83D\uDDBC\uFE0F ແນບຮູບ"),
                        React.createElement("button", { onClick: post, className: "fx-btn", style: { flex: 1, padding: "9px 18px", borderRadius: 10, border: "none", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, t("roomPostBtn"))),
                    React.createElement("input", { ref: imgRef, type: "file", accept: "image/*", multiple: true, style: { display: "none" }, onChange: (e) => addPostImages(e.target.files) }))))),
        React.createElement("div", { style: { marginTop: 14, display: "flex", flexDirection: "column", gap: 10 } }, posts.length === 0 ? (React.createElement("div", { style: { color: C.mut, fontSize: 13, textAlign: "center", padding: "24px 0" } }, t("roomEmpty"))) : posts.map((p) => (React.createElement("div", { key: p.id, className: "fx-card", style: { borderRadius: 14, border: `1px solid ${C.line}`, background: C.panel, padding: "14px 16px" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 7 } },
                React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: C.blue } }),
                React.createElement("span", { style: { fontSize: 11.5, color: C.mut } }, fmt(p.ts)),
                isNew(p.ts) && React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#04101F", background: C.cyan, borderRadius: 6, padding: "1px 7px" } }, t("roomNew"))),
            p.text && React.createElement("div", { style: { color: C.text, fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" } }, p.text),
            p.images && p.images.length > 0 && React.createElement("div", { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
                p.images.map((img, i) => React.createElement("img", { key: i, src: img.url, alt: "post", onClick: () => window.open(img.url,"_blank"), style: { maxWidth: "100%", width: p.images.length===1?"100%":"calc(50% - 4px)", borderRadius: 10, objectFit: "cover", maxHeight: 300, cursor: "pointer" } }))
            ),
            isAdmin && React.createElement("button", { onClick: () => setPosts(prev=>prev.filter(x=>x.id!==p.id)), style: { marginTop: 6, background: "none", border: "none", color: C.mut, fontSize: 11, cursor: "pointer", fontFamily: "inherit" } }, "\uD83D\uDDD1 ລຶບ"))))),
        React.createElement("p", { style: { fontSize: 11, color: C.mut, lineHeight: 1.7, marginTop: 14 } }, t("roomBackendNote"))));
}
// ── Home quick-action card ───────────────────────────────────
function HomeCard({ icon, title, desc, onClick, glowColor = "rgba(38,130,255,.2)", iconBg = "rgba(38,130,255,.15)" }) {
    return (React.createElement("button", { onClick: onClick, className: "fx-card fx-btn", style: { textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: "inherit", borderRadius: 16, border: `1px solid ${C.line}`, background: C.panel, padding: "14px 14px 12px", display: "flex", flexDirection: "column", gap: 8, minHeight: 110, position: "relative", overflow: "hidden" } },
        React.createElement("span", { "aria-hidden": true, style: { position: "absolute", top: -14, right: -14, width: 56, height: 56, borderRadius: "50%", background: glowColor, opacity: 0.85, pointerEvents: "none" } }),
        React.createElement("div", { style: { width: 36, height: 36, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, lineHeight: 1, flexShrink: 0 } }, icon),
        React.createElement("div", { style: { marginTop: "auto" } },
            React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 13.5, color: C.text, lineHeight: 1.25 } }, title),
            React.createElement("div", { style: { color: C.mut, fontSize: 10.5, marginTop: 2 } }, desc))));
}
// ── Profile page (language, notifications, settings, help) ───

// ── Admin API Key Renewal Reminder ───────────────────────────
function AdminApiReminder() {
    // Hardcoded reminder dates — update these when you renew keys
    const today = new Date();
    const reminders = [
        { name: "Anthropic (Claude)", emoji: "🟣", renewUrl: "https://console.anthropic.com", note: "ກວດ balance ຫຼື top-up credit", dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1) },
        { name: "OpenAI (ChatGPT)", emoji: "🟢", renewUrl: "https://platform.openai.com/settings/billing", note: "ກວດ billing ຫຼື top-up credit", dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1) },
        { name: "Google (Gemini)", emoji: "🔵", renewUrl: "https://aistudio.google.com/app/apikey", note: "ຟຣີ — ກວດ quota ລາຍວັນ", dueDate: new Date(today.getFullYear(), today.getMonth() + 2, 1) },
    ];
    const urgent = reminders.filter(r => { const diff = (r.dueDate - today) / 86400000; return diff <= 3; });
    if (urgent.length === 0) return null;
    return React.createElement("div", { style: { marginTop: 14, borderRadius: 16, border: `1px solid ${C.amber}`, background: "rgba(255,194,75,.08)", padding: "14px 16px" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 } },
            React.createElement("span", { style: { fontSize: 18 } }, "⏰"),
            React.createElement("span", { style: { fontWeight: 700, fontSize: 14, color: C.amber } }, "ແຈ້ງເຕືອນຕໍ່ອາຍຸ API Key")),
        urgent.map((r, i) => {
            const diff = Math.ceil((r.dueDate - today) / 86400000);
            return React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, background: "rgba(255,194,75,.06)", border: `1px solid rgba(255,194,75,.25)`, marginBottom: 6 } },
                React.createElement("span", { style: { fontSize: 16 } }, r.emoji),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: C.text } }, r.name),
                    React.createElement("div", { style: { fontSize: 11, color: C.mut, marginTop: 2 } }, r.note)),
                React.createElement("div", { style: { textAlign: "right" } },
                    React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: diff <= 0 ? C.red : C.amber } }, diff <= 0 ? "⚠️ ໝົດແລ້ວ!" : `ອີກ ${diff} ມື້`),
                    React.createElement("a", { href: r.renewUrl, target: "_blank", rel: "noopener noreferrer", style: { fontSize: 10, color: C.blueLt, textDecoration: "none", fontWeight: 600 } }, "ຈ່າຍ →")));
        }));
}

// ── VIP Code Generator (Admin only) ─────────────────────────
function VipCodeGenerator({ t }) {
    const [email, setEmail] = React.useState("");
    const [days, setDays] = React.useState("30");
    const [generated, setGenerated] = React.useState("");
    const [copied, setCopied] = React.useState(false);
    const [history, setHistory] = React.useState(() => {
        try { return JSON.parse(localStorage.getItem("admin_codes") || "[]"); } catch(e) { return []; }
    });

    const generateCode = () => {
        if (!email.trim()) return;
        // Create unique code: VIP + days + hash of email + timestamp
        const emailPart = email.split("@")[0].toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6);
        const ts = Date.now().toString(36).toUpperCase().slice(-4);
        const code = `VIP${days}-${emailPart}-${ts}`;
        
        // Save to history
        const entry = { code, email: email.trim().toLowerCase(), days: parseInt(days), created: new Date().toLocaleDateString("lo-LA"), used: false };
        const newHistory = [entry, ...history].slice(0, 50);
        setHistory(newHistory);
        try { localStorage.setItem("admin_codes", JSON.stringify(newHistory)); } catch(e) {}
        
        // Store code locally
        const codeMap = {};
        try { Object.assign(codeMap, JSON.parse(localStorage.getItem("vip_codes") || "{}")); } catch(e) {}
        codeMap[code] = { email: email.trim().toLowerCase(), days: parseInt(days), used: false };
        try { localStorage.setItem("vip_codes", JSON.stringify(codeMap)); } catch(e) {}
        
        // Save to Google Sheets via GET (avoids CORS — all params in URL)
        if (SHEETS_URL) {
            const createUrl = `${SHEETS_URL}?action=createCode&code=${encodeURIComponent(code)}&email=${encodeURIComponent(email.trim().toLowerCase())}&days=${parseInt(days)}`;
            fetch(createUrl, { cache: "no-store" }).catch(() => {});
        }
        
        setGenerated(code);
        setCopied(false);
        setEmail("");
    };

    const copyCode = async () => {
        try { await navigator.clipboard.writeText(generated); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch(e) {}
    };

    const deleteCode = (code) => {
        const newH = history.filter(h => h.code !== code);
        setHistory(newH);
        try { localStorage.setItem("admin_codes", JSON.stringify(newH)); } catch(e) {}
        try {
            const codeMap = JSON.parse(localStorage.getItem("vip_codes") || "{}");
            delete codeMap[code];
            localStorage.setItem("vip_codes", JSON.stringify(codeMap));
        } catch(e) {}
    };

    return React.createElement("div", { style: { marginTop: 16 } },
        React.createElement("div", { style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px" } },
            React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 14, color: C.cyan } }, "🔑 ສ້າງ VIP Code"),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
                React.createElement("input", { value: email, onChange: e => setEmail(e.target.value), placeholder: "Email ຂອງ User (user@gmail.com)", style: { background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" } }),
                React.createElement("div", { style: { display: "flex", gap: 8 } },
                    ["30", "90", "180", "365"].map(d => React.createElement("button", { key: d, onClick: () => setDays(d), className: "fx-btn", style: { flex: 1, padding: "8px 4px", borderRadius: 9, border: `1px solid ${days === d ? C.blue : C.line}`, background: days === d ? "rgba(38,130,255,.15)" : C.bg2, color: days === d ? C.cyan : C.mut, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, `${d}ວ`)),
                ),
                React.createElement("button", { onClick: generateCode, disabled: !email.trim(), className: "fx-btn", style: { padding: "11px", borderRadius: 11, border: "none", background: email.trim() ? `linear-gradient(95deg,${C.blue},${C.blueLt})` : C.bg2, color: email.trim() ? "#04101F" : C.mut, fontWeight: 700, fontSize: 14, cursor: email.trim() ? "pointer" : "default", fontFamily: "inherit" } }, "⚡ ສ້າງ Code"),
            ),
            generated && React.createElement("div", { style: { marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.green}`, background: "rgba(63,217,152,.08)" } },
                React.createElement("div", { style: { fontSize: 11, color: C.mut, marginBottom: 6 } }, "Code ສຳລັບ User:"),
                React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
                    React.createElement("code", { style: { flex: 1, fontSize: 15, fontWeight: 800, color: C.green, letterSpacing: "0.05em" } }, generated),
                    React.createElement("button", { onClick: copyCode, className: "fx-btn", style: { padding: "6px 12px", borderRadius: 8, border: "none", background: copied ? C.green : C.blue, color: "#04101F", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, copied ? "✓ Copied!" : "Copy")
                )
            )
        ),
        history.length > 0 && React.createElement("div", { style: { marginTop: 12, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 16px" } },
            React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: C.mut, marginBottom: 10 } }, "📋 ປະຫວັດ Code"),
            history.map(h => React.createElement("div", { key: h.code, style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.line}` } },
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("code", { style: { fontSize: 12, fontWeight: 700, color: h.used ? C.mut : C.cyan } }, h.code),
                    React.createElement("div", { style: { fontSize: 11, color: C.mut, marginTop: 2 } }, `${h.email} · ${h.days}ວ · ${h.created}${h.used ? " · ✅ ໃຊ້ແລ້ວ" : ""}`),
                ),
                React.createElement("button", { onClick: () => deleteCode(h.code), style: { background: "none", border: "none", color: "#FF6B6B", cursor: "pointer", fontSize: 16, padding: "0 4px" } }, "×")
            ))
        )
    );
}

// ── Profile Error Boundary — prevents crash from wiping whole page ──
class ProfileErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { error: null }; }
    static getDerivedStateFromError(e) { return { error: e }; }
    render() {
        if (this.state.error) {
            return React.createElement("div", { style: { padding: "32px 20px", textAlign: "center", color: C.mut } },
                React.createElement("div", { style: { fontSize: 32 } }, "⚠️"),
                React.createElement("div", { style: { fontWeight: 700, fontSize: 15, color: C.text, marginTop: 10 } }, "ໂປຣໄຟລ໌ load ບໍ່ໄດ້"),
                React.createElement("div", { style: { fontSize: 12, marginTop: 6, color: C.mut } }, this.state.error.message),
                React.createElement("button", { onClick: () => this.setState({ error: null }), style: { marginTop: 16, padding: "10px 24px", borderRadius: 10, border: "none", background: C.blue, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "ລອງໃໝ່")
            );
        }
        return this.props.children;
    }
}
function ProfilePage({ t, user, lang, setLang, daysLeft, notify, setNotify, onPay, onLogout, waLink, isAdmin, setIsAdmin, theme, setTheme, onUpdateUser }) {
    const [adminPass, setAdminPass] = useState("");
    const [showAdminInput, setShowAdminInput] = useState(false);
    const [denied, setDenied] = useState(typeof Notification !== "undefined" && Notification.permission === "denied");
    const [picker, setPicker] = useState(null); // null | "lang" | "theme" | "editProfile"
    // Profile edit state
    const [editName, setEditName] = useState(user?.name || "");
    const [editPhone, setEditPhone] = useState(user?.phone || "");
    const [editAvatar, setEditAvatar] = useState(user?.avatar || null);
    const avatarRef = React.useRef(null);

    // Compress image safely — fallback to original if canvas fails
    const compressImage = (dataUrl, cb) => {
        try {
            const img = new Image();
            img.onload = () => {
                try {
                    const MAX = 180;
                    const scale = Math.min(MAX / img.width, MAX / img.height, 1);
                    const w = Math.round(img.width * scale);
                    const h = Math.round(img.height * scale);
                    const canvas = document.createElement("canvas");
                    canvas.width = w; canvas.height = h;
                    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                    cb(canvas.toDataURL("image/jpeg", 0.7));
                } catch(e) { cb(dataUrl); } // fallback: use original
            };
            img.onerror = () => cb(dataUrl);
            img.src = dataUrl;
        } catch(e) { cb(dataUrl); }
    };

    const saveProfile = () => {
        const updated = { ...user, name: editName.trim() || user.name, phone: editPhone.trim(), avatar: editAvatar };
        try { localStorage.setItem("sniper_user", JSON.stringify(updated)); } catch(e) {
            // If quota exceeded (large avatar) — save without avatar, keep in memory only
            try { localStorage.setItem("sniper_user", JSON.stringify({ ...updated, avatar: null })); } catch(e2) {}
        }
        if (onUpdateUser) onUpdateUser(updated);
        setPicker(null);
    };

    const pickAvatar = (files) => {
        const f = Array.from(files||[])[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = e => compressImage(e.target.result, compressed => setEditAvatar(compressed));
        r.readAsDataURL(f);
    };
    // No scroll lock - users can scroll freely even when picker is open
    useEffect(() => { return () => {}; }, [picker]);
    const toggleNotify = async () => {
        if (typeof Notification === "undefined") return;
        if (notify) { setNotify(false); return; }
        // Request permission + init FCM
        try {
            const p = Notification.permission === "granted"
                ? "granted"
                : await Notification.requestPermission();
            if (p === "granted") {
                setNotify(true);
                // Init FCM to get push token
                initFCM(user?.email || "").catch(()=>{});
            } else if (p === "denied") {
                setDenied(true);
            }
        } catch(e) {}
    };
    const Section = ({ icon, title, children }) => (React.createElement("div", { style: { marginTop: 16 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 } },
            React.createElement("span", { style: { fontSize: 15 } }, icon),
            React.createElement("span", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 13.5, color: C.text, letterSpacing: ".01em" } }, title)),
        React.createElement("div", { style: { borderRadius: 16, border: `1px solid ${C.line}`, background: C.panel, overflow: "hidden" } }, children)));
    const Item = ({ children, last }) => (React.createElement("div", { style: { padding: "13px 16px", borderBottom: last ? "none" : `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10 } }, children));
    const LinkRow = ({ icon, label, href, onClick, last }) => (React.createElement("a", { href: href || undefined, onClick: onClick, target: href ? "_blank" : undefined, rel: href ? "noopener noreferrer" : undefined, style: { padding: "13px 16px", borderBottom: last ? "none" : `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: C.text, cursor: "pointer", fontSize: 13.5 } },
        React.createElement("span", { style: { fontSize: 15 } }, icon),
        React.createElement("span", { style: { flex: 1 } }, label),
        React.createElement("span", { style: { color: C.mut } }, "\u203A")));
    // Tappable row that shows the current value and opens a picker sheet
    const SelectRow = ({ icon, label, value, onClick, last }) => (React.createElement("button", { onClick: onClick, className: "fx-btn", style: { width: "100%", padding: "13px 16px", borderBottom: last ? "none" : `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: C.text } },
        React.createElement("span", { style: { fontSize: 15 } }, icon),
        React.createElement("span", { style: { flex: 1, fontSize: 13.5 } }, label),
        React.createElement("span", { style: { fontSize: 13, color: C.mut, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 } }, value),
        React.createElement("span", { style: { color: C.mut } }, "\u203A")));
    const curLang = LANGS.find((l) => l.id === lang);
    const curTheme = THEMES[theme] || THEMES[DEFAULT_THEME];
    return (React.createElement("section", { style: { marginTop: 8 } },
        React.createElement("div", { style: { borderRadius: 20, border: `1px solid ${C.line}`, background: `radial-gradient(120% 130% at 0% 0%, rgba(38,130,255,.16), transparent 55%), ${C.panel}`, padding: "22px 20px", textAlign: "center" } },
            user.avatar
                ? React.createElement("img", { src: user.avatar, alt: "avatar", style: { width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.blue}`, boxShadow: `0 8px 24px -8px ${C.glow}`, display: "block", margin: "0 auto" } })
                : React.createElement("div", { style: { width: 72, height: 72, borderRadius: "50%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, color: "#04101F", background: `linear-gradient(135deg,${C.cyan},${C.blue})`, boxShadow: `0 8px 24px -8px ${C.glow}` } }, (user.name || "U").charAt(0).toUpperCase()),
            React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 19, marginTop: 12 } }, user.name),
            React.createElement("div", { style: { color: C.mut, fontSize: 13, marginTop: 2 } }, user.email),
            React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, padding: "6px 14px", borderRadius: 99, background: C.bg2, border: `1px solid ${C.line}` } },
                React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#04101F", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, borderRadius: 99, padding: "2px 10px" } }, user.plan),
                React.createElement("span", { style: { fontSize: 12, color: isAdmin ? C.green : (daysLeft <= 1 ? C.amber : C.mut) } }, isAdmin ? "✅ Admin" : (daysLeft <= 0 ? t("trialEndsToday") : t("daysRemaining", { n: daysLeft })))),
            user.phone && React.createElement("div", { style: { color: C.mut, fontSize: 12, marginTop: 3 } }, "📞 " + user.phone),
            React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "center", marginTop: 14 } },
                React.createElement("button", { onClick: () => { setEditName(user.name||""); setEditPhone(user.phone||""); setEditAvatar(user.avatar||null); setPicker("editProfile"); }, className: "fx-btn", style: { padding: "8px 16px", borderRadius: 11, border: `1px solid ${C.line}`, background: C.bg2, color: C.mut, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "✏️ ແກ້ໄຂໂປຣໄຟລ໌"),
                !isAdmin && React.createElement("button", { onClick: onPay, className: "fx-btn", style: { padding: "8px 16px", borderRadius: 11, border: "none", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, t("payNow")))),
        React.createElement(WalletReferral, { t: t, user: user }),
        // FCM Permission Banner — show if not yet granted
        typeof Notification !== "undefined" && Notification.permission === "default" && !notify && (
            React.createElement("div", { style: { marginTop: 14, borderRadius: 14, border: "1px solid rgba(38,130,255,.4)", background: "rgba(38,130,255,.08)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 } },
                React.createElement("span", { style: { fontSize: 24 } }, "🔔"),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5, color: C.text, marginBottom: 3 } }, "ເປີດການແຈ້ງເຕືອນ Signal"),
                    React.createElement("div", { style: { fontSize: 12, color: C.mut, lineHeight: 1.5 } }, "ຮັບ signal ທຸກໆ device ທັນທີ ເຖິງວ່າ app ຈະປິດ")
                ),
                React.createElement("button", { onClick: toggleNotify, className: "fx-btn", style: { padding: "9px 16px", borderRadius: 10, border: "none", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" } }, "Allow 🔔")
            )
        ),
        React.createElement(Section, { icon: "\u2699\uFE0F", title: t("secSettings") },
            React.createElement(SelectRow, { icon: "\uD83C\uDF10", label: t("secLanguage"), onClick: () => setPicker("lang"), value: React.createElement(React.Fragment, null,
                    React.createElement(Flag, { code: curLang ? curLang.flag : "lo", size: 16 }),
                    " ",
                    curLang ? curLang.label : "") }),
            React.createElement(SelectRow, { icon: "\uD83C\uDFA8", label: t("secTheme"), onClick: () => setPicker("theme"), value: React.createElement(React.Fragment, null,
                    React.createElement("span", { style: { width: 12, height: 12, borderRadius: 3, background: curTheme.swatch, display: "inline-block" } }),
                    " ",
                    curTheme.name) }),
            React.createElement(Item, null,
                React.createElement("span", { style: { fontSize: 15 } }, "\uD83D\uDD14"),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontSize: 13.5 } }, t("secNotify")),
                    React.createElement("div", { style: { fontSize: 11, color: C.mut, marginTop: 1, lineHeight: 1.4 } }, denied ? t("roomNotifyDenied") : t("setNotifyDesc"))),
                React.createElement("button", { onClick: toggleNotify, "aria-label": "toggle notifications", style: { width: 46, height: 26, borderRadius: 99, border: "none", cursor: "pointer", background: notify ? C.blue : C.line, position: "relative", transition: "background .15s", flexShrink: 0 } },
                    React.createElement("span", { style: { position: "absolute", top: 3, left: notify ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s" } }))),
            React.createElement(Item, { last: !isAdmin },
                React.createElement("span", { style: { fontSize: 15 } }, "\u2139\uFE0F"),
                React.createElement("span", { style: { flex: 1, fontSize: 13.5 } }, t("aboutVer")),
                React.createElement("span", { style: { fontSize: 12, color: C.mut } }, "v19.0")),
            isAdmin && (React.createElement(Item, { last: true },
                React.createElement("span", { style: { fontSize: 15 } }, "\uD83D\uDD11"),
                React.createElement("span", { style: { flex: 1, fontSize: 13.5 } }, t("adminOnly")),
                React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#04101F", background: C.green, borderRadius: 99, padding: "3px 10px" } }, "ON")))),
        isAdmin && React.createElement(VipCodeGenerator, { t: t }),
        isAdmin && React.createElement(AdminApiReminder, null),
        React.createElement(PlanCompare, { t: t, lang: lang, onUpgrade: onPay, currentPlan: user.plan }),
        React.createElement(Section, { icon: "\u2753", title: t("secHelp") },
            React.createElement(LinkRow, { icon: "\uD83D\uDCAC", label: t("helpContact"), href: waLink }),
            React.createElement(LinkRow, { icon: "\uD83D\uDCCB", label: t("helpTerms"), onClick: () => setPicker("terms") }),
            React.createElement(LinkRow, { icon: "\uD83C\uDFE2", label: t("helpAbout"), onClick: () => setPicker("about"), last: true })),
        React.createElement("button", { onClick: onLogout, className: "fx-btn", style: { width: "100%", marginTop: 18, padding: "13px", borderRadius: 13, border: `1px solid ${C.red}`, background: "rgba(255,107,107,.08)", color: "#FFB4B4", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, t("logout")),
        React.createElement("div", { style: { textAlign: "center", marginTop: 16, fontSize: 10, color: C.mut, opacity: 0.6, letterSpacing: ".06em" } }, "UI v19 \u00B7 clean profile"),
        picker && (React.createElement("div", { onClick: () => setPicker(null), style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: "rgba(0,0,0,.92)", display: "flex", alignItems: picker === "editProfile" ? "flex-start" : "center", justifyContent: "center", padding: picker === "editProfile" ? "12px 16px 16px" : "20px 16px", boxSizing: "border-box" } },
            React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { width: "100%", maxWidth: 420, background: C.panel, borderRadius: 20, border: `1px solid ${C.line}`, padding: "20px 20px 28px", maxHeight: "75vh", overflowY: "auto", boxShadow: "0 32px 80px -16px rgba(0,0,0,.95)", animation: "popIn .28s cubic-bezier(.34,1.56,.64,1) both" } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 } },
                    React.createElement("span", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 800, fontSize: 16, color: C.text } }, picker === "lang" ? "🌐 " + t("secLanguage") : picker === "theme" ? "🎨 " + t("secTheme") : picker === "editProfile" ? "✏️ ແກ້ໄຂໂປຣໄຟລ໌" : picker === "terms" ? "📋 " + t("helpTerms") : "🏢 " + t("helpAbout")),
                    React.createElement("button", { onClick: () => setPicker(null), className: "fx-btn", style: { border: "none", background: C.bg2, color: C.mut, width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 16, fontFamily: "inherit" } }, "\u00D7")),
                picker === "terms" && React.createElement("div", { style: { fontSize: 13, color: C.mut, lineHeight: 1.8 } },
                    React.createElement("p", { style: { color: C.amber, fontWeight: 700, marginBottom: 8 } }, "⚠️ ຄຳເຕືອນຄວາມສ່ຽງ"),
                    React.createElement("p", null, "SniperTech AI ໃຫ້ຂໍ້ມູນການວິເຄາະທາງດ້ານການສຶກສາເທົ່ານັ້ນ ບໍ່ແມ່ນຄຳແນະນຳທາງດ້ານການລົງທຶນ ຫຼື ການເງິນ."),
                    React.createElement("p", null, "• ທອງ XAU/USD ມີຄວາມຜັນຜວນສູງ ລາຄາສາມາດປ່ຽນແປງໄດ້ໄວ"),
                    React.createElement("p", null, "• AI ວິເຄາະຈາກຮູບ chart ເທົ່ານັ້ນ ບໍ່ໄດ້ເຂົ້າເຖິງລາຄາ real-time"),
                    React.createElement("p", null, "• ທຸກ setup ສາມາດຜິດພາດໄດ້ — ບໍ່ມີລະບົບໃດໄດ້ກຳໄລ 90%"),
                    React.createElement("p", null, "• ຕ້ອງໃຊ້ Stop Loss ສະເໝີ — ເທຣດດ້ວຍທຶນທີ່ຮັບຄວາມສ່ຽງໄດ້ເທົ່ານັ້ນ"),
                    React.createElement("p", null, "• Startup FX ບໍ່ຮັບຜິດຊອບຕໍ່ການສູນເສຍໃດໆທີ່ເກີດຈາກການໃຊ້ app ນີ້"),
                    React.createElement("p", { style: { color: C.blue, fontWeight: 600, marginTop: 12 } }, "ການໃຊ້ app ນີ້ຖືວ່າທ່ານຍອມຮັບເງື່ອນໄຂທັງໝົດ")),
                picker === "about" && React.createElement("div", { style: { fontSize: 13, color: C.mut, lineHeight: 1.8 } },
                    React.createElement("div", { style: { textAlign: "center", marginBottom: 16 } },
                        React.createElement("img", { src: LOGO, alt: "Startup FX", style: { height: 60, objectFit: "contain" } }),
                        React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 800, fontSize: 18, color: C.text, marginTop: 8 } }, "SniperTech AI"),
                        React.createElement("div", { style: { color: C.mut, fontSize: 12 } }, "by Startup FX Academy")),
                    React.createElement("p", null, "SniperTech AI ແມ່ນເຄື່ອງມືວິເຄາະ XAU/USD ດ້ວຍ AI ທີ່ພັດທະນາໂດຍ Startup FX Academy ລາວ."),
                    React.createElement("p", null, "• ວິເຄາະ chart ດ້ວຍ AI Claude (Anthropic) ລະດັບ Elite"),
                    React.createElement("p", null, "• ຮອງຮັບ Multi-Timeframe: M5, M15, H1, H4"),
                    React.createElement("p", null, "• ສະໜອງ Entry, Stop Loss, Take Profit ພ້ອມ RR"),
                    React.createElement("p", null, "• ຮອງຮັບ 3 ພາສາ: ລາວ, ໄທ, ອັງກິດ"),
                    React.createElement("div", { style: { marginTop: 12, padding: "10px 12px", borderRadius: 10, background: C.bg2, border: `1px solid ${C.line}` } },
                        React.createElement("div", { style: { fontSize: 12, color: C.cyan, fontWeight: 700 } }, "📞 ຕິດຕໍ່"),
                        React.createElement("div", null, "020 7777 7421"),
                        React.createElement("div", null, "Startup FX Academy"),
                        React.createElement("div", { style: { fontSize: 11, color: C.mut, marginTop: 4 } }, "Version 20.0 · © 2025 Startup FX"))),
                picker === "lang" && LANGS.map((l) => {
                    const active = lang === l.id;
                    return (React.createElement("button", { key: l.id, onClick: () => { setLang(l.id); setPicker(null); }, className: "fx-btn", style: { width: "100%", padding: "13px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, borderRadius: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                            border: active ? `2px solid ${C.blue}` : `1px solid ${C.line}`, background: active ? "rgba(38,130,255,.10)" : C.bg2 } },
                        React.createElement(Flag, { code: l.flag, size: 22 }),
                        React.createElement("span", { style: { flex: 1, fontSize: 14.5, fontWeight: active ? 800 : 600, color: active ? C.cyan : C.text } }, l.label),
                        active && React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#04101F", background: C.green, borderRadius: 99, padding: "3px 11px" } }, "\u2713")));
                }),
                picker === "editProfile" && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
                    React.createElement("div", { style: { textAlign: "center" } },
                        React.createElement("div", { onClick: () => avatarRef.current && avatarRef.current.click(), style: { width: 80, height: 80, borderRadius: "50%", margin: "0 auto", cursor: "pointer", border: `2px dashed ${C.blue}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg2 } },
                            editAvatar
                                ? React.createElement("img", { src: editAvatar, style: { width: "100%", height: "100%", objectFit: "cover" } })
                                : React.createElement("span", { style: { fontSize: 28, color: C.mut } }, "\uD83D\uDCF7")
                        ),
                        React.createElement("div", { style: { fontSize: 11, color: C.mut, marginTop: 6 } }, "ກົດເພື່ອປ່ຽນຮູບ"),
                        React.createElement("input", { ref: avatarRef, type: "file", accept: "image/*", style: { display: "none" }, onChange: e => pickAvatar(e.target.files) })
                    ),
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontSize: 11.5, color: C.mut, marginBottom: 5 } }, "ຊື່"),
                        React.createElement("input", { value: editName, onChange: e => setEditName(e.target.value), placeholder: "ຊື່ຂອງທ່ານ", style: { width: "100%", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "11px 13px", color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none" } })
                    ),
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontSize: 11.5, color: C.mut, marginBottom: 5 } }, "\uD83D\uDCDE ເບີໂທ"),
                        React.createElement("input", { value: editPhone, onChange: e => setEditPhone(e.target.value), placeholder: "+856 20 XXXX XXXX", type: "tel", style: { width: "100%", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "11px 13px", color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none" } })
                    ),
                    React.createElement("button", { onClick: saveProfile, className: "fx-btn", style: { padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, "\uD83D\uDCBE ບັນທຶກ")
                ),
                picker === "theme" && (React.createElement(React.Fragment, null,
                    React.createElement("div", { style: { fontSize: 12, color: C.mut, marginBottom: 12 } }, t("themeDesc")),
                    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 } }, THEME_ORDER.map((key) => {
                        const th = THEMES[key];
                        const active = theme === key;
                        return (React.createElement("button", { key: key, onClick: () => { setTheme(key); setPicker(null); }, className: "fx-btn", style: { cursor: "pointer", fontFamily: "inherit", textAlign: "left", padding: "11px 12px", borderRadius: 13,
                                border: active ? `2px solid ${th.swatch}` : `1px solid ${C.line}`, background: active ? `${th.swatch}1A` : C.bg2,
                                display: "flex", alignItems: "center", gap: 10 } },
                            React.createElement("span", { style: { display: "flex", flexShrink: 0 } },
                                React.createElement("span", { style: { width: 14, height: 22, borderRadius: "5px 0 0 5px", background: th.p.bg, border: `1px solid ${C.line}`, borderRight: "none" } }),
                                React.createElement("span", { style: { width: 14, height: 22, background: th.p.panel2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` } }),
                                React.createElement("span", { style: { width: 14, height: 22, borderRadius: "0 5px 5px 0", background: th.swatch, border: `1px solid ${C.line}`, borderLeft: "none" } })),
                            React.createElement("span", { style: { flex: 1, minWidth: 0, fontSize: 12, fontWeight: active ? 800 : 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, th.name),
                            active && React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#04101F", background: th.swatch, borderRadius: 99, padding: "2px 6px", flexShrink: 0 } }, "\u2713")));
                    })))))))));
}
// ── Splash / intro screen (on app open) ──────────────────────
function SplashScreen({ onDone }) {
    return (React.createElement("div", { onClick: onDone, style: { position: "fixed", inset: 0, width: "100vw", height: "100vh", background: C.bg, color: C.text, fontFamily: "'LaoOverride','Noto Sans Lao','Inter',system-ui,sans-serif", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 24, zIndex: 9999 } },
        React.createElement("style", null, `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        html,body{margin:0;padding:0;background:${C.bg};}
        *{box-sizing:border-box;}
        @media (prefers-reduced-motion: reduce){*{animation-duration:.01ms!important;}}
        @keyframes spLogoIn{ 0%{ opacity:0; transform:scale(.5) translateY(10px);} 55%{ opacity:1; transform:scale(1.08) translateY(0);} 100%{ transform:scale(1);} }
        @keyframes spGlow{ 0%,100%{ opacity:.35; transform:scale(.9);} 50%{ opacity:.95; transform:scale(1.12);} }
        @keyframes spTextIn{ from{ opacity:0; transform:translateY(12px);} to{ opacity:1; transform:translateY(0);} }
        @keyframes spRing{ 0%{ transform:scale(.5); opacity:.8;} 100%{ transform:scale(2); opacity:0;} }
        @keyframes spBar{ from{ width:0; } to{ width:100%; } }
        @keyframes spReticle{ 0%{ transform:rotate(0deg);} 100%{ transform:rotate(360deg);} }
        .sp-logo{ animation:spLogoIn 1s cubic-bezier(.2,.8,.2,1) both; }
        .sp-t1{ animation:spTextIn .7s ease .45s both; }
        .sp-t2{ animation:spTextIn .7s ease .7s both; }
        .sp-bar{ animation:spBar 2.4s linear both; }
        .sp-reticle{ animation:spReticle 14s linear infinite; }
      `),
        React.createElement("div", { "aria-hidden": true, style: { position: "absolute", inset: 0, opacity: 0.4 } },
            React.createElement(ChartBackdrop, { tint: "#C9A24B" })),
        React.createElement("span", { "aria-hidden": true, style: { position: "absolute", width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(closest-side, ${C.glow}, transparent 70%)`, filter: "blur(16px)", animation: "spGlow 2.4s ease-in-out infinite", pointerEvents: "none" } }),
        React.createElement("span", { "aria-hidden": true, style: { position: "absolute", width: 160, height: 160, borderRadius: "50%", border: `2px solid ${C.blue}`, animation: "spRing 1.8s ease-out .3s infinite", pointerEvents: "none" } }),
        React.createElement("span", { "aria-hidden": true, className: "sp-reticle", style: { position: "absolute", width: 240, height: 240, borderRadius: "50%", border: `1px dashed rgba(38,130,255,.35)`, pointerEvents: "none" } }),
        React.createElement("div", { style: { position: "relative", textAlign: "center" } },
            React.createElement("div", { className: "sp-logo", style: { fontSize: 84, lineHeight: 1, filter: `drop-shadow(0 10px 30px ${C.glow})` } }, "\uD83C\uDFAF"),
            React.createElement("h1", { className: "sp-t1", style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontSize: "clamp(34px,9vw,52px)", fontWeight: 800, letterSpacing: "-0.02em", margin: "18px 0 0", lineHeight: 1.05, display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" } },
                React.createElement("span", { style: { color: "#FFFFFF", fontWeight: 800 } }, "Sniper"),
                React.createElement("span", { style: { color: "#00FFFF", fontWeight: 900, textShadow: "0 0 24px #00FFFF, 0 0 60px #00BFFF" } }, "Tech"),
                React.createElement("span", { style: { color: "#FFD700", fontWeight: 900, textShadow: "0 0 24px #FFD700, 0 0 60px #FFA500", marginLeft: 8 } }, "AI")),
            React.createElement("div", { className: "sp-t2", style: { fontFamily: "'Sora','Noto Sans Lao',sans-serif", fontSize: 12.5, letterSpacing: ".26em", color: C.blueLt, marginTop: 10, textTransform: "uppercase" } }, "Smart Trading Analysis"),
            React.createElement("div", { style: { width: 200, height: 3, borderRadius: 99, background: C.bg2, margin: "30px auto 0", overflow: "hidden" } },
                React.createElement("div", { className: "sp-bar", style: { height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${C.cyan},${C.blue})` } })))));
}
// ── Multi-AI engine selector (consensus) ─────────────────────
function AIEnginePanel({ t, engines, setEngines }) {
    const AIS = [
        { id: "claude", name: "Claude", icon: "🟣", desc: t("aiClaudeDesc") },
        { id: "gpt",    name: "ChatGPT", icon: "🟢", desc: t("aiGptDesc") },
        { id: "gemini", name: "Gemini",  icon: "🔵", desc: t("aiGeminiDesc") },
    ];
    // Always force all 3 engines ON — not user-toggleable
    const activeCount = 3;
    return (React.createElement("section", { style: { marginTop: 18, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, padding: "16px 16px" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 } },
            React.createElement("span", { style: { fontSize: 16 } }, "\uD83E\uDDE0"),
            React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 14.5 } }, t("aiEngine")),
            React.createElement("span", { style: { marginLeft: "auto", fontSize: 11, color: C.mut } }, t("aiConsensus") + " · " + activeCount)),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 } }, AIS.map((ai) => (
            React.createElement("div", { key: ai.id, style: { position: "relative", textAlign: "left", fontFamily: "inherit", borderRadius: 13, padding: "11px 11px", border: `1px solid ${C.blue}`, background: "rgba(38,130,255,.1)" } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
                    React.createElement("span", { style: { fontSize: 17 } }, ai.icon),
                    React.createElement("span", { style: { width: 9, height: 9, borderRadius: "50%", background: C.green, boxShadow: `0 0 7px ${C.green}` } })),
                React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700, color: C.cyan, marginTop: 7 } }, ai.name),
                React.createElement("div", { style: { fontSize: 9.5, color: C.mut, lineHeight: 1.4, marginTop: 2, minHeight: 26 } }, ai.desc),
                React.createElement("div", { style: { fontSize: 9, fontWeight: 700, marginTop: 5, color: C.green } }, "● " + t("aiActive")))
        )))));
}
// ── Onboarding tutorial (first-time, after signup) ───────────
function Onboarding({ t, onDone }) {
    const [step, setStep] = useState(0);
    const steps = [
        { title: t("ob1Title"), desc: t("ob1Desc"), emoji: "🎉" },
        { title: t("ob2Title"), desc: t("ob2Desc"), emoji: "📊" },
        { title: t("ob3Title"), desc: t("ob3Desc"), emoji: "🎓" },
        { title: t("ob4Title"), desc: t("ob4Desc"), emoji: "💰" },
    ];
    const last = step === steps.length - 1;
    const s = steps[step];
    return (React.createElement("div", { style: { minHeight: "100%", background: C.bg, color: C.text, fontFamily: "'LaoOverride','Noto Sans Lao','Inter',system-ui,sans-serif", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", padding: "24px 22px" } },
        React.createElement("style", null, `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        @keyframes obIn{ from{ opacity:0; transform:translateY(16px) scale(.98);} to{ opacity:1; transform:translateY(0) scale(1);} }
        @keyframes obPop{ 0%{ transform:scale(.5); opacity:0;} 60%{ transform:scale(1.1);} 100%{ transform:scale(1); opacity:1;} }
        .ob-card{ animation:obIn .4s ease both; }
        .ob-emoji{ animation:obPop .5s cubic-bezier(.2,.8,.2,1) both; }
      `),
        React.createElement("span", { "aria-hidden": true, style: { position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(closest-side, ${C.glow}, transparent 70%)`, filter: "blur(16px)", pointerEvents: "none" } }),
        React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", position: "relative", zIndex: 1 } },
            React.createElement("button", { onClick: onDone, style: { background: "none", border: "none", color: C.mut, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } },
                t("obSkip"),
                " \u2715")),
        React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", zIndex: 1 } },
            React.createElement("div", { key: step, className: "ob-card", style: { maxWidth: 420 } },
                React.createElement("div", { className: "ob-emoji", style: { fontSize: 72, marginBottom: 18 } }, s.emoji),
                React.createElement("h2", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontSize: "clamp(22px,5.5vw,30px)", fontWeight: 700, margin: 0, lineHeight: 1.2 } }, s.title),
                React.createElement("p", { style: { color: C.mut, fontSize: 15, lineHeight: 1.7, marginTop: 14 } }, s.desc))),
        React.createElement("div", { style: { position: "relative", zIndex: 1 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 7, marginBottom: 22 } }, steps.map((_, i) => (React.createElement("span", { key: i, onClick: () => setStep(i), style: { width: i === step ? 22 : 8, height: 8, borderRadius: 99, background: i === step ? `linear-gradient(90deg,${C.cyan},${C.blue})` : C.line, cursor: "pointer", transition: "all .2s" } })))),
            React.createElement("div", { style: { display: "flex", gap: 10, maxWidth: 420, margin: "0 auto" } },
                step > 0 && (React.createElement("button", { onClick: () => setStep(step - 1), className: "fx-btn", style: { flex: "0 0 auto", padding: "14px 20px", borderRadius: 13, border: `1px solid ${C.line}`, background: "transparent", color: C.text, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" } }, "\u2190")),
                React.createElement("button", { onClick: () => (last ? onDone() : setStep(step + 1)), className: "fx-btn", style: { flex: 1, padding: "14px", borderRadius: 13, border: "none", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 10px 28px -12px ${C.glow}` } }, last ? t("obStart") : t("obNext"))))));
}
// ── Plan comparison — clean 3-column table (Trial / VIP / Lifetime) ──
function PlanCompare({ t, lang, onUpgrade, currentPlan }) {
    const priceByLang = {
        lo: { vip: "700,000", vipU: "ກີບ", vipMo: "/ເດືອນ", pro: "15,000,000", proU: "ກີບ" },
        th: { vip: "1,000", vipU: "บาท", vipMo: "/เดือน", pro: "26,000", proU: "บาท" },
        en: { vip: "$35", vipU: "", vipMo: "/mo", pro: "$600", proU: "" },
    };
    const px = priceByLang[lang] || priceByLang.en;
    const Y = React.createElement("span", { style: { color: C.green, fontWeight: 800 } }, "\u2713");
    const N = React.createElement("span", { style: { color: C.mut, opacity: .6 } }, "\u2014");
    // rows: [feature label, free, vip, pro]
    const rows = [
        [t("pfAnalysis"), t("pfAnalysisFree"), t("pfAnalysisVip"), t("pfAnalysisVip")],
        [t("pfNews"), Y, Y, Y],
        [t("pfPrediction"), N, Y, Y],
        [t("pfSignal"), N, Y, Y],
        [t("pfThemes"), Y, Y, Y],
        [t("pfCharts"), "3", "6", "6"],
        [t("pfCourse"), N, N, Y],
        [t("pfSupport"), t("pfLimited"), Y, Y],
    ];
    const isCur = (p) => currentPlan === p;
    const colHead = "1.25fr .85fr 1fr .9fr";
    const cellVal = (v, opts = {}) => (React.createElement("div", { style: { padding: "10px 4px", textAlign: "center", fontSize: 11.5, fontWeight: opts.bold ? 700 : 500, color: opts.color || C.text, lineHeight: 1.3,
            background: opts.bg || "transparent" } }, v));
    return (React.createElement("div", { style: { marginTop: 20 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 } },
            React.createElement("span", { style: { fontSize: 15 } }, "\uD83D\uDC8E"),
            React.createElement("span", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 14 } }, t("planCompare"))),
        React.createElement("div", { style: { borderRadius: 16, border: `1px solid ${C.line}`, background: C.panel, overflow: "hidden" } },
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: colHead, background: C.panel2, borderBottom: `1px solid ${C.line}` } },
                React.createElement("div", { style: { padding: "12px 12px", fontSize: 11, color: C.mut, fontWeight: 700, alignSelf: "center" } }, t("planFeature")),
                React.createElement("div", { style: { padding: "12px 4px", textAlign: "center" } },
                    React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: C.text } }, "\uD83C\uDF81"),
                    React.createElement("div", { style: { fontSize: 10, color: C.mut, marginTop: 2 } }, t("planFree"))),
                React.createElement("div", { style: { padding: "12px 4px", textAlign: "center", background: "rgba(38,130,255,.12)", borderLeft: `1px solid ${C.blue}55`, borderRight: `1px solid ${C.blue}55`, position: "relative" } },
                    React.createElement("div", { style: { fontSize: 9, fontWeight: 800, color: "#04101F", background: C.cyan, borderRadius: 99, padding: "1px 7px", display: "inline-block", marginBottom: 3 } },
                        "\u2605 ",
                        t("planMostPop")),
                    React.createElement("div", { style: { fontSize: 13, fontWeight: 900, color: C.cyan } }, t("planVip"))),
                React.createElement("div", { style: { padding: "12px 4px", textAlign: "center", background: "rgba(201,162,75,.14)" } },
                    React.createElement("div", { style: { fontSize: 13, fontWeight: 900, color: "#E5C77A" } }, "\uD83D\uDC51"),
                    React.createElement("div", { style: { fontSize: 10, color: "#E5C77A", marginTop: 2, fontWeight: 700 } }, t("planLifetime")))),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: colHead, borderBottom: `1px solid ${C.line}`, alignItems: "center", background: "rgba(127,192,255,.04)" } },
                React.createElement("div", { style: { padding: "12px 12px", fontSize: 11.5, color: C.text, fontWeight: 700 } },
                    "\uD83D\uDCB0 ",
                    t("planPrice")),
                cellVal(React.createElement("span", { style: { color: C.green, fontWeight: 800 } }, t("planFreePrice"))),
                React.createElement("div", { style: { padding: "10px 4px", textAlign: "center", background: "rgba(38,130,255,.08)", borderLeft: `1px solid ${C.blue}55`, borderRight: `1px solid ${C.blue}55` } },
                    React.createElement("div", { style: { fontSize: 14, fontWeight: 900, color: C.cyan, lineHeight: 1.1 } }, px.vip),
                    React.createElement("div", { style: { fontSize: 9, color: C.mut } },
                        px.vipU,
                        " ",
                        px.vipMo)),
                React.createElement("div", { style: { padding: "10px 4px", textAlign: "center", background: "rgba(201,162,75,.08)" } },
                    React.createElement("div", { style: { fontSize: 13, fontWeight: 900, color: "#E5C77A", lineHeight: 1.1 } }, px.pro),
                    React.createElement("div", { style: { fontSize: 9, color: C.mut } }, px.proU))),
            rows.map((r, i) => (React.createElement("div", { key: i, style: { display: "grid", gridTemplateColumns: colHead, borderBottom: i < rows.length - 1 ? `1px solid ${C.line}` : "none", alignItems: "center" } },
                React.createElement("div", { style: { padding: "10px 12px", fontSize: 11.5, color: C.text } }, r[0]),
                cellVal(r[1], { color: C.mut }),
                cellVal(r[2], { bold: true, bg: "rgba(38,130,255,.06)" }),
                cellVal(r[3], { bold: true, bg: "rgba(201,162,75,.06)" }))))),
        React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 14 } },
            React.createElement("button", { onClick: onUpgrade, disabled: isCur("VIP"), className: "fx-btn", style: { flex: 1, padding: "13px", borderRadius: 13, border: "none",
                    background: isCur("VIP") ? C.bg2 : `linear-gradient(95deg, ${C.blue}, ${C.blueLt})`,
                    color: isCur("VIP") ? C.mut : "#04101F", fontWeight: 800, fontSize: 13.5, cursor: isCur("VIP") ? "default" : "pointer", fontFamily: "inherit",
                    boxShadow: isCur("VIP") ? "none" : `0 10px 28px -16px ${C.glow}` } }, isCur("VIP") ? "✓ " + t("planCurrent") : "⭐ " + t("planVip")),
            React.createElement("button", { onClick: onUpgrade, disabled: isCur("Lifetime"), className: "fx-btn", style: { flex: 1, padding: "13px", borderRadius: 13, border: "none",
                    background: isCur("Lifetime") ? C.bg2 : "linear-gradient(95deg, #C9A24B, #E5C77A)",
                    color: isCur("Lifetime") ? C.mut : "#1a1206", fontWeight: 800, fontSize: 13.5, cursor: isCur("Lifetime") ? "default" : "pointer", fontFamily: "inherit",
                    boxShadow: isCur("Lifetime") ? "none" : "0 10px 28px -16px rgba(201,162,75,.6)" } }, isCur("Lifetime") ? "✓ " + t("planCurrent") : "👑 " + t("planLifetime"))),
        React.createElement("div", { style: { fontSize: 10.5, color: C.mut, textAlign: "center", marginTop: 10, lineHeight: 1.5 } }, t("planFreeTag"))));
}
// ── Free self-study lessons (curated external resources) ─────
// ── Lesson illustrations (inline SVG, themed) ────────────────
function LessonArt({ kind }) {
    const box = { width: "100%", display: "block" };
    if (kind === "structure") {
        return (React.createElement("svg", { viewBox: "0 0 640 240", style: box, xmlns: "http://www.w3.org/2000/svg" },
            React.createElement("rect", { width: "640", height: "240", fill: "#0B1020" }),
            React.createElement("polyline", { fill: "none", stroke: "#22C58A", strokeWidth: "3", points: "40,200 110,150 90,170 180,110 160,130 250,70 230,90 320,40" }),
            React.createElement("circle", { cx: "180", cy: "110", r: "5", fill: "#22C58A" }),
            React.createElement("text", { x: "188", y: "106", fill: "#7FE3B8", fontSize: "12", fontFamily: "Arial" }, "HH"),
            React.createElement("circle", { cx: "160", cy: "130", r: "5", fill: "#3FC9FF" }),
            React.createElement("text", { x: "120", y: "148", fill: "#9FE0FF", fontSize: "12", fontFamily: "Arial" }, "HL"),
            React.createElement("circle", { cx: "320", cy: "40", r: "5", fill: "#22C58A" }),
            React.createElement("text", { x: "300", y: "32", fill: "#7FE3B8", fontSize: "12", fontFamily: "Arial" }, "HH"),
            React.createElement("polyline", { fill: "none", stroke: "#EF5C5C", strokeWidth: "3", points: "360,60 430,120 410,100 500,160 480,140 570,210" }),
            React.createElement("circle", { cx: "430", cy: "120", r: "5", fill: "#FF9B9B" }),
            React.createElement("text", { x: "438", y: "124", fill: "#FFB4B4", fontSize: "12", fontFamily: "Arial" }, "LH"),
            React.createElement("circle", { cx: "570", cy: "210", r: "5", fill: "#FF9B9B" }),
            React.createElement("text", { x: "540", y: "228", fill: "#FFB4B4", fontSize: "12", fontFamily: "Arial" }, "LL"),
            React.createElement("line", { x1: "340", y1: "20", x2: "340", y2: "220", stroke: "#2682FF", strokeDasharray: "5 5" }),
            React.createElement("text", { x: "346", y: "34", fill: "#7FB2FF", fontSize: "11", fontFamily: "Arial" }, "CHoCH")));
    }
    if (kind === "orderblock") {
        return (React.createElement("svg", { viewBox: "0 0 640 240", style: box, xmlns: "http://www.w3.org/2000/svg" },
            React.createElement("rect", { width: "640", height: "240", fill: "#0B1020" }),
            React.createElement("rect", { x: "120", y: "150", width: "90", height: "46", fill: "rgba(38,130,255,.22)", stroke: "#2682FF" }),
            React.createElement("text", { x: "128", y: "144", fill: "#7FB2FF", fontSize: "12", fontFamily: "Arial" }, "Order Block"),
            React.createElement("g", null,
                React.createElement("line", { x1: "150", y1: "150", x2: "150", y2: "196", stroke: "#EF5C5C" }),
                React.createElement("rect", { x: "143", y: "158", width: "14", height: "30", fill: "#EF5C5C" }),
                React.createElement("line", { x1: "200", y1: "80", x2: "200", y2: "160", stroke: "#22C58A" }),
                React.createElement("rect", { x: "193", y: "92", width: "14", height: "60", fill: "#22C58A" }),
                React.createElement("line", { x1: "250", y1: "60", x2: "250", y2: "120", stroke: "#22C58A" }),
                React.createElement("rect", { x: "243", y: "72", width: "14", height: "40", fill: "#22C58A" })),
            React.createElement("rect", { x: "186", y: "112", width: "120", height: "34", fill: "rgba(199,125,255,.18)", stroke: "#C77DFF", strokeDasharray: "4 3" }),
            React.createElement("text", { x: "312", y: "134", fill: "#D9B3FF", fontSize: "12", fontFamily: "Arial" }, "FVG (gap)"),
            React.createElement("path", { d: "M430,70 C380,70 360,150 250,150", fill: "none", stroke: "#3FC9FF", strokeWidth: "2", strokeDasharray: "5 4" }),
            React.createElement("text", { x: "360", y: "64", fill: "#9FE0FF", fontSize: "11", fontFamily: "Arial" }, "price returns")));
    }
    if (kind === "liquidity") {
        return (React.createElement("svg", { viewBox: "0 0 640 240", style: box, xmlns: "http://www.w3.org/2000/svg" },
            React.createElement("rect", { width: "640", height: "240", fill: "#0B1020" }),
            React.createElement("line", { x1: "40", y1: "70", x2: "600", y2: "70", stroke: "#EF5C5C", strokeDasharray: "6 4" }),
            React.createElement("text", { x: "44", y: "62", fill: "#FFB4B4", fontSize: "11", fontFamily: "Arial" }, "equal highs \u2014 Buy stops (liquidity)"),
            React.createElement("polyline", { fill: "none", stroke: "#EAF1FB", strokeWidth: "2.5", points: "40,150 120,90 200,72 280,95 360,68 420,40 440,95 520,120 600,150" }),
            React.createElement("circle", { cx: "420", cy: "40", r: "6", fill: "#FFC24B" }),
            React.createElement("text", { x: "430", y: "36", fill: "#FFD98A", fontSize: "12", fontFamily: "Arial" }, "SWEEP"),
            React.createElement("path", { d: "M420,40 C440,70 470,150 560,160", fill: "none", stroke: "#22C58A", strokeWidth: "2.5" }),
            React.createElement("text", { x: "470", y: "150", fill: "#7FE3B8", fontSize: "11", fontFamily: "Arial" }, "snap back \u2193")));
    }
    if (kind === "premdisc") {
        return (React.createElement("svg", { viewBox: "0 0 640 240", style: box, xmlns: "http://www.w3.org/2000/svg" },
            React.createElement("rect", { width: "640", height: "240", fill: "#0B1020" }),
            React.createElement("rect", { x: "80", y: "40", width: "480", height: "70", fill: "rgba(239,92,92,.14)" }),
            React.createElement("rect", { x: "80", y: "130", width: "480", height: "70", fill: "rgba(34,197,138,.14)" }),
            React.createElement("line", { x1: "80", y1: "120", x2: "560", y2: "120", stroke: "#2682FF", strokeWidth: "2" }),
            React.createElement("text", { x: "86", y: "60", fill: "#FFB4B4", fontSize: "13", fontFamily: "Arial", fontWeight: "bold" }, "PREMIUM \u2014 look to SELL"),
            React.createElement("text", { x: "86", y: "190", fill: "#7FE3B8", fontSize: "13", fontFamily: "Arial", fontWeight: "bold" }, "DISCOUNT \u2014 look to BUY"),
            React.createElement("text", { x: "470", y: "115", fill: "#7FB2FF", fontSize: "12", fontFamily: "Arial" }, "50% (EQ)"),
            React.createElement("rect", { x: "80", y: "150", width: "480", height: "26", fill: "rgba(255,194,75,.18)", stroke: "#FFC24B", strokeDasharray: "4 3" }),
            React.createElement("text", { x: "86", y: "168", fill: "#FFD98A", fontSize: "11", fontFamily: "Arial" }, "0.62\u20130.79 OTE (best entry)")));
    }
    if (kind === "candles") {
        return (React.createElement("svg", { viewBox: "0 0 640 240", style: box, xmlns: "http://www.w3.org/2000/svg" },
            React.createElement("rect", { width: "640", height: "240", fill: "#0B1020" }),
            React.createElement("line", { x1: "120", y1: "40", x2: "120", y2: "200", stroke: "#22C58A", strokeWidth: "2" }),
            React.createElement("rect", { x: "104", y: "80", width: "32", height: "90", fill: "#22C58A" }),
            React.createElement("text", { x: "120", y: "222", fill: "#7FE3B8", fontSize: "11", fontFamily: "Arial", textAnchor: "middle" }, "Bull"),
            React.createElement("line", { x1: "210", y1: "40", x2: "210", y2: "200", stroke: "#EF5C5C", strokeWidth: "2" }),
            React.createElement("rect", { x: "194", y: "70", width: "32", height: "90", fill: "#EF5C5C" }),
            React.createElement("text", { x: "210", y: "222", fill: "#FFB4B4", fontSize: "11", fontFamily: "Arial", textAnchor: "middle" }, "Bear"),
            React.createElement("line", { x1: "320", y1: "60", x2: "320", y2: "205", stroke: "#3FC9FF", strokeWidth: "2" }),
            React.createElement("rect", { x: "304", y: "60", width: "32", height: "40", fill: "#3FC9FF" }),
            React.createElement("text", { x: "320", y: "222", fill: "#9FE0FF", fontSize: "11", fontFamily: "Arial", textAnchor: "middle" }, "Pin"),
            React.createElement("line", { x1: "420", y1: "70", x2: "420", y2: "190", stroke: "#C7CEDC", strokeWidth: "2" }),
            React.createElement("rect", { x: "402", y: "124", width: "36", height: "6", fill: "#C7CEDC" }),
            React.createElement("text", { x: "420", y: "222", fill: "#C7CEDC", fontSize: "11", fontFamily: "Arial", textAnchor: "middle" }, "Doji"),
            React.createElement("line", { x1: "510", y1: "70", x2: "510", y2: "180", stroke: "#EF5C5C", strokeWidth: "2" }),
            React.createElement("rect", { x: "500", y: "100", width: "20", height: "40", fill: "#EF5C5C" }),
            React.createElement("line", { x1: "545", y1: "55", x2: "545", y2: "195", stroke: "#22C58A", strokeWidth: "2" }),
            React.createElement("rect", { x: "529", y: "90", width: "32", height: "80", fill: "#22C58A" }),
            React.createElement("text", { x: "535", y: "222", fill: "#7FE3B8", fontSize: "11", fontFamily: "Arial", textAnchor: "middle" }, "Engulf")));
    }
    // risk
    return (React.createElement("svg", { viewBox: "0 0 640 240", style: box, xmlns: "http://www.w3.org/2000/svg" },
        React.createElement("rect", { width: "640", height: "240", fill: "#0B1020" }),
        React.createElement("rect", { x: "60", y: "60", width: "220", height: "120", rx: "10", fill: "#121A2E", stroke: "#EF5C5C" }),
        React.createElement("text", { x: "170", y: "100", fill: "#FFB4B4", fontSize: "13", fontFamily: "Arial", textAnchor: "middle", fontWeight: "bold" }, "RISK"),
        React.createElement("rect", { x: "120", y: "110", width: "100", height: "50", fill: "#EF5C5C" }),
        React.createElement("text", { x: "170", y: "142", fill: "#0B1020", fontSize: "16", fontFamily: "Arial", textAnchor: "middle", fontWeight: "bold" }, "1"),
        React.createElement("rect", { x: "360", y: "60", width: "220", height: "120", rx: "10", fill: "#121A2E", stroke: "#22C58A" }),
        React.createElement("text", { x: "470", y: "100", fill: "#7FE3B8", fontSize: "13", fontFamily: "Arial", textAnchor: "middle", fontWeight: "bold" }, "REWARD"),
        React.createElement("rect", { x: "380", y: "80", width: "180", height: "80", fill: "#22C58A" }),
        React.createElement("text", { x: "470", y: "128", fill: "#0B1020", fontSize: "16", fontFamily: "Arial", textAnchor: "middle", fontWeight: "bold" }, "2"),
        React.createElement("text", { x: "320", y: "210", fill: "#7FB2FF", fontSize: "13", fontFamily: "Arial", textAnchor: "middle" }, "Risk : Reward = 1 : 2")));
}
// ── Free lessons — in-house content, read directly in the app ──
function FreeLessons({ t, lang, unlocked = false, waLink, onUpgrade }) {
    const [openId, setOpenId] = useState(null);
    const L = (lesson) => lesson[lang] || lesson.en;
    const levelName = { basics: t("freeCatBasics"), smc: t("freeCatSmc"), advanced: t("freeCatAdvanced") };
    const levelColor = { basics: C.green, smc: C.blue, advanced: C.amber };
    // a lesson is readable if it's free OR the user has unlocked the Premium course
    const canRead = (lesson) => lesson.free === true || unlocked;
    // ── Reading view ──
    if (openId) {
        const lesson = FREE_LESSONS.find((x) => x.id === openId);
        if (!lesson) {
            setOpenId(null);
            return null;
        }
        if (!canRead(lesson)) {
            setOpenId(null);
            return null;
        } // safety: locked lessons never open
        const c = L(lesson);
        return (React.createElement("section", { style: { marginTop: 14 }, className: "fx-rise" },
            React.createElement("button", { onClick: () => setOpenId(null), className: "fx-btn", style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 99, border: `1px solid ${C.line}`, background: C.bg2, color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 14 } },
                "\u2039 ",
                t("freeBack")),
            React.createElement("div", { style: { borderRadius: 18, border: `1px solid ${C.line}`, background: C.panel, overflow: "hidden" } },
                React.createElement(LessonArt, { kind: lesson.art }),
                React.createElement("div", { style: { padding: "18px 18px 22px" } },
                    React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, color: "#04101F", background: levelColor[lesson.level], borderRadius: 99, padding: "3px 11px", marginBottom: 10 } },
                        lesson.icon,
                        " ",
                        levelName[lesson.level],
                        " \u00B7 ",
                        c.minutes,
                        " ",
                        t("freeMin")),
                    React.createElement("h2", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 21, lineHeight: 1.3, margin: "0 0 10px" } }, c.title),
                    React.createElement("p", { style: { color: C.text, fontSize: 14.5, lineHeight: 1.75, margin: "0 0 18px", opacity: .92 } }, c.intro),
                    c.sections.map((sec, i) => (React.createElement("div", { key: i, style: { marginBottom: 16 } },
                        React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 15.5, color: C.blueLt, marginBottom: 5 } }, sec.h),
                        React.createElement("p", { style: { color: C.text, fontSize: 14, lineHeight: 1.75, margin: 0, opacity: .9 } }, sec.p)))),
                    React.createElement("div", { style: { marginTop: 18, borderRadius: 14, border: `1px solid ${C.blue}`, background: "rgba(38,130,255,.08)", padding: "14px 16px" } },
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5, color: C.cyan, marginBottom: 10, display: "flex", alignItems: "center", gap: 7 } },
                            "\u2B50 ",
                            t("freeKeyPoints")),
                        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 9 } }, c.highlights.map((h, i) => (React.createElement("div", { key: i, style: { display: "flex", gap: 9, alignItems: "flex-start" } },
                            React.createElement("span", { style: { flexShrink: 0, color: C.blue, fontWeight: 700, fontSize: 14 } }, "\u2713"),
                            React.createElement("span", { style: { color: C.text, fontSize: 13.5, lineHeight: 1.6 } }, h)))))),
                    React.createElement("div", { style: { marginTop: 14, borderRadius: 14, border: `1px solid ${C.green}`, background: "rgba(34,197,138,.08)", padding: "14px 16px" } },
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5, color: C.green, marginBottom: 7, display: "flex", alignItems: "center", gap: 7 } },
                            "\uD83D\uDCDD ",
                            t("freeSummary")),
                        React.createElement("p", { style: { color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 } }, c.summary)),
                    React.createElement("button", { onClick: () => setOpenId(null), className: "fx-btn", style: { width: "100%", marginTop: 18, padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, t("freeDone")))),
            React.createElement("p", { style: { fontSize: 11, color: C.mut, lineHeight: 1.7, marginTop: 16 } }, t("freeWarn"))));
    }
    // ── List view ──
    const levels = ["basics", "smc", "advanced"];
    const freeCount = FREE_LESSONS.filter((x) => x.free).length;
    const lockedCount = FREE_LESSONS.length - freeCount;
    return (React.createElement("section", { style: { marginTop: 16 } },
        React.createElement("div", { style: { borderRadius: 16, border: `1px solid ${C.line}`, background: `linear-gradient(180deg, ${C.panel}, ${C.bg2})`, padding: "16px 18px" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
                React.createElement("span", { style: { fontSize: 22 } }, "\uD83D\uDCD6"),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 16 } }, t("freeTitle")),
                    React.createElement("div", { style: { color: C.mut, fontSize: 12.5, lineHeight: 1.5, marginTop: 2 } }, t("freeDesc"))),
                unlocked
                    ? React.createElement("span", { style: { flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#04130A", background: C.green, borderRadius: 99, padding: "5px 12px" } }, t("courseUnlocked"))
                    : React.createElement("span", { style: { flexShrink: 0, fontSize: 11, fontWeight: 700, color: C.cyan, background: "rgba(38,130,255,.12)", border: `1px solid ${C.blue}`, borderRadius: 99, padding: "5px 12px" } },
                        freeCount,
                        " ",
                        t("lessonFreeTag")))),
        !unlocked && lockedCount > 0 && (React.createElement("div", { style: { marginTop: 12, borderRadius: 14, border: `1px solid ${C.amber}`, background: "rgba(255,194,75,.08)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" } },
            React.createElement("span", { style: { fontSize: 22 } }, "\uD83D\uDD13"),
            React.createElement("div", { style: { flex: 1, minWidth: 180 } },
                React.createElement("div", { style: { fontSize: 13.5, fontWeight: 700, color: C.amber } }, t("lessonUnlockTitle")),
                React.createElement("div", { style: { fontSize: 12, color: C.text, lineHeight: 1.5, marginTop: 2 } }, t("lessonUnlockDesc", { n: lockedCount }))),
            React.createElement("button", { onClick: onUpgrade, className: "fx-btn", style: { flexShrink: 0, padding: "10px 16px", borderRadius: 10, border: "none", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, t("lessonUnlockBtn")))),
        levels.map((lv) => {
            const list = FREE_LESSONS.filter((x) => x.level === lv);
            if (!list.length)
                return null;
            return (React.createElement("div", { key: lv, style: { marginTop: 18 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 } },
                    React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: levelColor[lv] } }),
                    React.createElement("span", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 14 } }, levelName[lv])),
                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, list.map((lesson) => {
                    const c = L(lesson);
                    const locked = !canRead(lesson);
                    return (React.createElement("button", { key: lesson.id, onClick: () => {
                            if (locked) {
                                onUpgrade && onUpgrade();
                                return;
                            }
                            setOpenId(lesson.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }, className: "fx-card fx-btn", style: { textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: "inherit", borderRadius: 14, border: `1px solid ${locked ? C.line : C.line}`, background: C.panel, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, width: "100%", opacity: locked ? 0.92 : 1 } },
                        React.createElement("span", { style: { position: "relative", flexShrink: 0, fontSize: 26, width: 46, height: 46, borderRadius: 12, background: C.bg2, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.line}`, filter: locked ? "grayscale(.4)" : "none" } }, lesson.icon),
                        React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7 } },
                                React.createElement("span", { style: { fontSize: 14.5, fontWeight: 700, color: C.text, lineHeight: 1.3 } }, c.title),
                                lesson.free
                                    ? React.createElement("span", { style: { flexShrink: 0, fontSize: 9.5, fontWeight: 800, color: "#04130A", background: C.green, borderRadius: 5, padding: "1px 6px", letterSpacing: ".03em" } }, "FREE")
                                    : React.createElement("span", { style: { flexShrink: 0, fontSize: 9.5, fontWeight: 800, color: C.amber, background: "rgba(255,194,75,.14)", border: `1px solid ${C.amber}`, borderRadius: 5, padding: "1px 6px", letterSpacing: ".03em" } }, "VIP")),
                            React.createElement("div", { style: { color: C.mut, fontSize: 12, lineHeight: 1.5, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } }, c.intro),
                            React.createElement("div", { style: { color: C.blueLt, fontSize: 11, marginTop: 5 } },
                                "\u23F1 ",
                                c.minutes,
                                " ",
                                t("freeMin"))),
                        locked
                            ? React.createElement("span", { style: { flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: C.amber, border: `1px solid ${C.amber}`, borderRadius: 9, padding: "8px 12px", whiteSpace: "nowrap" } },
                                "\uD83D\uDD12 ",
                                t("lessonUnlockBtn"))
                            : React.createElement("span", { style: { flexShrink: 0, fontSize: 12, fontWeight: 700, color: C.cyan, border: `1px solid ${C.blue}`, borderRadius: 9, padding: "8px 12px", whiteSpace: "nowrap" } },
                                t("freeRead"),
                                " \u2192")));
                }))));
        }),
        React.createElement("p", { style: { fontSize: 11, color: C.mut, lineHeight: 1.7, marginTop: 18 } }, t("freeWarn"))));
}
// ── Wallet + Referral + Withdraw (UI demo — needs backend for real money) ──
function WalletReferral({ t, user }) {
    var _a;
    // DEMO state. Real balances/referrals/withdrawals must come from a backend.
    const [balance, setBalance] = useState(0); // available USDT (demo starts 0)
    const [earned] = useState(0); // lifetime earned
    const [invited] = useState(0); // referred users count
    const [copied, setCopied] = useState(false);
    const [wdAmt, setWdAmt] = useState("");
    const [wdAddr, setWdAddr] = useState("");
    const [wdMsg, setWdMsg] = useState("");
    const [history, setHistory] = useState([]);
    // Referral code derived from email (demo). Backend should assign a unique code.
    const code = (((_a = user === null || user === void 0 ? void 0 : user.email) === null || _a === void 0 ? void 0 : _a.split("@")[0]) || "user").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) + "FX";
    const link = `https://kanhstartup-netizen.github.io/snipertech-/snipertech/?ref=${code}`;
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }
        catch { }
    };
    const share = async () => {
        const text = `🎯 SniperTech AI — AI ວິເຄາະທອງ XAU/USD\n\nສະໝັກທົດລອງຟຣີ 3 ວັນ ຜ່ານລິ້ງຂອງຂ້ອຍ:\n${link}\n\n(ໃສ່ code ${code} ຕອນສະໝັກ)`;
        try {
            if (navigator.share) {
                await navigator.share({ title: "SniperTech AI", text, url: link });
            }
            else {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
            }
        }
        catch { }
    };
    const withdraw = () => {
        setWdMsg("");
        const amt = parseFloat(wdAmt);
        if (!amt || amt < WITHDRAW_MIN) {
            setWdMsg(t("wdMin", { min: WITHDRAW_MIN }));
            return;
        }
        if (amt > balance) {
            setWdMsg(t("wdInsufficient"));
            return;
        }
        if (!wdAddr.trim()) {
            setWdMsg(t("wdAddress"));
            return;
        }
        // DEMO: deduct + log. Real withdrawal requires backend + crypto gateway + approval.
        setBalance((b) => +(b - amt).toFixed(2));
        setHistory((h) => [{ id: Date.now(), amt, addr: wdAddr.trim(), ts: Date.now() }, ...h]);
        setWdAmt("");
        setWdAddr("");
        setWdMsg(t("wdSuccess"));
    };
    const Section = ({ icon, title, badge, children }) => (React.createElement("div", { style: { marginTop: 16 } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 } },
            React.createElement("span", { style: { fontSize: 15 } }, icon),
            React.createElement("span", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 13.5, color: C.text } }, title),
            badge && React.createElement("span", { style: { marginLeft: "auto", fontSize: 9.5, fontWeight: 700, color: C.amber, background: "rgba(255,194,75,.12)", border: `1px solid rgba(255,194,75,.4)`, borderRadius: 99, padding: "2px 8px" } }, badge)),
        React.createElement("div", { style: { borderRadius: 16, border: `1px solid ${C.line}`, background: C.panel, overflow: "hidden" } }, children)));
    return (React.createElement(React.Fragment, null,
        
        React.createElement(Section, { icon: "\uD83C\uDF81", title: t("secReferral") },
            React.createElement("div", { style: { padding: "16px 18px" } },
                React.createElement("div", { style: { color: C.text, fontSize: 13, lineHeight: 1.6 } }, t("refDesc", { pct: REFERRAL_PCT })),
                React.createElement("div", { style: { marginTop: 13 } },
                    React.createElement("div", { style: { fontSize: 11, color: C.mut, marginBottom: 5 } }, t("refYourCode")),
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, background: C.bg2, border: `1px dashed ${C.blue}`, borderRadius: 10, padding: "11px 14px" } },
                        React.createElement("span", { style: { flex: 1, fontFamily: "'Sora',monospace", fontSize: 18, fontWeight: 800, letterSpacing: ".08em", color: C.cyan } }, code),
                        React.createElement("span", { style: { fontSize: 18 } }, "\uD83C\uDFAF"))),
                React.createElement("div", { style: { marginTop: 12 } },
                    React.createElement("div", { style: { fontSize: 11, color: C.mut, marginBottom: 5 } }, t("refYourLink")),
                    React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" } },
                        React.createElement("code", { style: { flex: 1, fontSize: 11.5, color: C.text, wordBreak: "break-all", lineHeight: 1.4 } }, link),
                        React.createElement("button", { onClick: copyLink, className: "fx-btn", style: { flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#04101F", background: copied ? C.green : C.blueLt, border: "none", borderRadius: 7, padding: "6px 11px", cursor: "pointer", fontFamily: "inherit" } }, copied ? t("refCopied") : t("refCopy")))),
                React.createElement("button", { onClick: share, className: "fx-btn", style: { width: "100%", marginTop: 12, padding: "12px", borderRadius: 11, border: "none", background: `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } },
                    "\uD83D\uDCE4 ",
                    t("refShare")),
                React.createElement("div", { style: { marginTop: 14, padding: "12px 14px", borderRadius: 10, background: C.panel2, border: `1px solid ${C.line}` } },
                    React.createElement("div", { style: { fontSize: 11.5, fontWeight: 700, color: C.blueLt, marginBottom: 5 } },
                        "\uD83D\uDCA1 ",
                        t("refHowTitle")),
                    React.createElement("div", { style: { fontSize: 12, color: C.mut, lineHeight: 1.65 } }, t("refHow", { pct: REFERRAL_PCT })))))));
}

// ── Phase 3: Admin Push Notification Panel ───────────────────
function AdminPushPanel({ t, isAdmin }) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [tokenCount, setTokenCount] = useState(null);

    useEffect(() => {
        // Count registered devices
        sbFetch("/rest/v1/fcm_tokens?select=token")
            .then(r => r.json())
            .then(d => setTokenCount(Array.isArray(d) ? d.length : 0))
            .catch(()=>{});
    }, []);

    const sendPush = async () => {
        if (!title.trim() || !body.trim()) return;
        setSending(true);
        try {
            // Get all FCM tokens from Supabase
            const r = await sbFetch("/rest/v1/fcm_tokens?select=token,email");
            const rows = await r.json();
            if (!Array.isArray(rows) || rows.length === 0) {
                alert("ບໍ່ມີ device ທີ່ລົງທະບຽນ — user ຕ້ອງ Allow Notification ກ່ອນ");
                setSending(false);
                return;
            }
            const tokens = rows.map(r => r.token).filter(Boolean);
            // Send via Cloudflare Pages Function /api/push
            const pushResp = await fetch(PUSH_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tokens, title: title.trim(), body: body.trim(), data: { type: "signal" } })
            });
            const result = await pushResp.json().catch(() => ({}));
            setSent(true);
            setTitle(""); setBody("");
            alert("✅ ສົ່ງສຳເລັດ! " + (result.sent || tokens.length) + "/" + tokens.length + " devices");
            setTimeout(() => setSent(false), 3000);
        } catch(e) {
            alert("❌ Error: " + e.message);
        }
        setSending(false);
    };

    if (!isAdmin) return null;
    return React.createElement("div", { style: { marginTop: 18, borderRadius: 16, border: `1px solid ${C.line}`, background: C.panel, padding: "16px 18px" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 } },
            React.createElement("span", { style: { fontSize: 18 } }, "📡"),
            React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 14.5 } }, "ສົ່ງ Push Notification"),
            tokenCount !== null && React.createElement("span", { style: { marginLeft: "auto", fontSize: 11, color: C.green, background: "rgba(63,217,138,.1)", border: "1px solid rgba(63,217,138,.3)", borderRadius: 99, padding: "2px 10px" } }, tokenCount + " devices")
        ),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
            React.createElement("input", { value: title, onChange: e => setTitle(e.target.value), placeholder: "ຫົວຂໍ້ (ເຊັ່ນ: 🎯 Buy XAUUSD Setup A+)", style: { background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13.5, fontFamily: "inherit", outline: "none" } }),
            React.createElement("textarea", { value: body, onChange: e => setBody(e.target.value), placeholder: "ລາຍລະອຽດ (ເຊັ່ນ: Entry 3285-3290, SL 3275, TP1 3310, Grade A+)", rows: 3, style: { background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13.5, fontFamily: "inherit", outline: "none", resize: "vertical" } }),
            React.createElement("button", { onClick: sendPush, disabled: sending || !title.trim() || !body.trim(), className: "fx-btn", style: { padding: "11px", borderRadius: 11, border: "none", background: sent ? C.green : `linear-gradient(95deg,${C.blue},${C.blueLt})`, color: "#04101F", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } },
                sent ? "✅ ສົ່ງແລ້ວ!" : sending ? "⏳ ກຳລັງສົ່ງ..." : "📡 ສົ່ງໄປທຸກ Device"
            )
        )
    );
}
function SignalHistory({ user, t }) {
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        if (!user?.email) return;
        const email = encodeURIComponent(user.email);
        sbFetch(`/rest/v1/signals?user_email=eq.${email}&order=created_at.desc&limit=50`)
            .then(r => r.json())
            .then(data => { setSignals(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user?.email]);

    const updateResult = async (id, result) => {
        setUpdating(id);
        await sbFetch(`/rest/v1/signals?id=eq.${id}`, {
            method: "PATCH",
            body: JSON.stringify({ result })
        }).catch(()=>{});
        setSignals(prev => prev.map(s => s.id === id ? { ...s, result } : s));
        setUpdating(null);
    };

    const wins   = signals.filter(s => s.result === "win").length;
    const losses = signals.filter(s => s.result === "loss").length;
    const total  = signals.filter(s => s.result !== "pending").length;
    const wr     = total > 0 ? Math.round(wins / total * 100) : null;

    const resultColor = r => r === "win" ? "#3FD98A" : r === "loss" ? "#FF6B6B" : "#888";
    const resultLabel = r => r === "win" ? "✅ ກຳໄລ" : r === "loss" ? "❌ ຂາດທຶນ" : "⏳ ລໍຜົນ";

    return React.createElement("section", { style: { marginTop: 18 } },
        // Win Rate card
        React.createElement("div", { style: { borderRadius: 18, border: `1px solid ${C.line}`, background: C.panel, padding: "18px 18px 14px", marginBottom: 14 } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } },
                React.createElement("span", { style: { fontSize: 20 } }, "📊"),
                React.createElement("div", { style: { fontFamily: "'LaoOverride','Sora','Noto Sans Lao',sans-serif", fontWeight: 700, fontSize: 15 } }, "ສະຖິຕິ Signal"),
                React.createElement("span", { style: { marginLeft: "auto", fontSize: 11, color: C.mut } }, signals.length + " signals ທັງໝົດ")),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 } },
                [
                    { label: "Win Rate", value: wr !== null ? wr + "%" : "—", color: wr >= 60 ? "#3FD98A" : wr >= 40 ? C.amber : "#FF6B6B" },
                    { label: "✅ ກຳໄລ", value: wins, color: "#3FD98A" },
                    { label: "❌ ຂາດທຶນ", value: losses, color: "#FF6B6B" },
                ].map((s, i) => React.createElement("div", { key: i, style: { background: C.bg2, borderRadius: 12, padding: "12px 10px", textAlign: "center", border: `1px solid ${C.line}` } },
                    React.createElement("div", { style: { fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "inherit" } }, s.value),
                    React.createElement("div", { style: { fontSize: 11, color: C.mut, marginTop: 3 } }, s.label)
                ))
            ),
            wr !== null && React.createElement("div", { style: { marginTop: 12, height: 6, borderRadius: 99, background: C.bg2, overflow: "hidden" } },
                React.createElement("div", { style: { height: "100%", width: wr + "%", background: wr >= 60 ? "#3FD98A" : wr >= 40 ? C.amber : "#FF6B6B", borderRadius: 99, transition: "width 1s ease" } })
            )
        ),
        // Signal list
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
            loading
                ? React.createElement("div", { style: { textAlign: "center", color: C.mut, padding: "24px 0", fontSize: 13 } }, "⏳ ກຳລັງໂຫຼດ...")
                : signals.length === 0
                    ? React.createElement("div", { style: { textAlign: "center", color: C.mut, padding: "24px 0", fontSize: 13 } }, "ຍັງບໍ່ທັນມີ signal — ໄປວິເຄາະກຣາຟກ່ອນ 📊")
                    : signals.map(s => React.createElement("div", { key: s.id, style: { borderRadius: 14, border: `1px solid ${C.line}`, background: C.panel, padding: "14px 16px" } },
                        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } },
                            React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: s.direction === "Buy" ? "#3FD98A" : s.direction === "Sell" ? "#FF6B6B" : C.mut, background: s.direction === "Buy" ? "rgba(63,217,138,.12)" : s.direction === "Sell" ? "rgba(255,107,107,.12)" : C.bg2, borderRadius: 6, padding: "2px 10px", border: `1px solid ${s.direction === "Buy" ? "rgba(63,217,138,.3)" : s.direction === "Sell" ? "rgba(255,107,107,.3)" : C.line}` } }, s.direction || "—"),
                            React.createElement("span", { style: { fontSize: 11, color: C.mut } }, new Date(s.created_at).toLocaleString("lo", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })),
                            s.sniper_grade && React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#04101F", background: s.sniper_grade.startsWith("A+++") ? "#3FD98A" : s.sniper_grade.startsWith("A+") ? C.blueLt : C.amber, borderRadius: 6, padding: "2px 7px" } }, s.sniper_grade),
                            React.createElement("span", { style: { marginLeft: "auto", fontSize: 11, fontWeight: 700, color: resultColor(s.result) } }, resultLabel(s.result))
                        ),
                        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, fontSize: 11.5, color: C.mut, marginBottom: 10 } },
                            React.createElement("div", null, "Entry: ", React.createElement("span", { style: { color: C.text } }, s.entry || "—")),
                            React.createElement("div", null, "SL: ", React.createElement("span", { style: { color: "#FF6B6B" } }, s.sl || "—")),
                            React.createElement("div", null, "RR: ", React.createElement("span", { style: { color: C.cyan } }, s.rr || "—")),
                            React.createElement("div", null, "TP1: ", React.createElement("span", { style: { color: "#3FD98A" } }, s.tp1 || "—")),
                            React.createElement("div", null, "TP2: ", React.createElement("span", { style: { color: "#3FD98A" } }, s.tp2 || "—")),
                            React.createElement("div", null, "Conf: ", React.createElement("span", { style: { color: C.text } }, s.confidence || "—"))
                        ),
                        s.result === "pending" && React.createElement("div", { style: { display: "flex", gap: 6 } },
                            React.createElement("button", { onClick: () => updateResult(s.id, "win"), disabled: updating === s.id, className: "fx-btn", style: { flex: 1, padding: "7px", borderRadius: 8, border: "none", background: "rgba(63,217,138,.15)", color: "#3FD98A", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", border: "1px solid rgba(63,217,138,.3)" } }, updating === s.id ? "..." : "✅ ກຳໄລ"),
                            React.createElement("button", { onClick: () => updateResult(s.id, "loss"), disabled: updating === s.id, className: "fx-btn", style: { flex: 1, padding: "7px", borderRadius: 8, border: "none", background: "rgba(255,107,107,.12)", color: "#FF6B6B", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", border: "1px solid rgba(255,107,107,.3)" } }, updating === s.id ? "..." : "❌ ຂາດທຶນ")
                        )
                    ))
        )
    );
}

// ── #5 Trading Chatbot (floating animated bubble) ───────────────
function TradingChatbot({ t, lang, user }) {
    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState([{ role: "assistant", text: lang === "th" ? "สวัสดี! 👋 ฉันคือ SniperBot — ถามเรื่องเทรดหรือแอปได้เลย หรือส่งรูป chart มาวิเคราะห์ได้เลย 📊" : lang === "en" ? "Hey! 👋 I'm SniperBot — ask me anything about trading or send a chart image for analysis 📊" : "ສະບາຍດີ! 👋 ຂ້ອຍແມ່ນ SniperBot — ຖາມໄດ້ທຸກຢ່າງກ່ຽວກັບການເທຣດ ຫຼື ສົ່ງຮູບກຣາຟມາວິເຄາະໄດ້ເລີຍ 📊" }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [pendingImg, setPendingImg] = useState(null); // {url, base64, type}
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const imgRef = useRef(null);
    const langLabel = lang === "th" ? "Thai (ภาษาไทย)" : lang === "en" ? "English" : "Lao (ພາສາລາວ)";

    useEffect(() => { if (open && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

    const pickImg = (files) => {
        const f = Array.from(files||[])[0];
        if (!f || !f.type.startsWith("image/")) return;
        const r = new FileReader();
        r.onload = e => {
            const base64 = e.target.result.split(",")[1];
            setPendingImg({ url: e.target.result, base64, type: f.type });
        };
        r.readAsDataURL(f);
    };

    const send = async () => {
        const text = input.trim();
        if (!text && !pendingImg || loading) return;
        setInput("");

        // Build user message for display
        const displayMsg = { role: "user", text: text || "📊 ສົ່ງຮູບກຣາຟ", img: pendingImg?.url };
        setMsgs(prev => [...prev, displayMsg]);
        const imgToSend = pendingImg;
        setPendingImg(null);
        setLoading(true);

        try {
            // Build history for API (text only for history, current msg with image)
            const history = msgs.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));

            // Current message content - with optional image
            let userContent;
            if (imgToSend) {
                userContent = [
                    { type: "image", source: { type: "base64", media_type: imgToSend.type, data: imgToSend.base64 } },
                    { type: "text", text: text || "ກະລຸນາວິເຄາະ chart ນີ້ ບອກ bias, entry, SL, TP ຕາມຫຼັກ SMC/ICT" }
                ];
            } else {
                userContent = text;
            }

            const apiMessages = [
                ...history,
                { role: "user", content: userContent }
            ];

            const r = await fetch(CLAUDE_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-6",
                    max_tokens: 600,
                    system: "You are SniperBot, a friendly trading assistant for the SniperTech AI app by Startup FX. Speak in " + langLabel + " in a warm casual friend-to-friend tone. ONLY answer about XAU/USD trading, forex, SMC/ICT concepts, risk management, and how to use the SniperTech AI app. If user sends a chart image: analyze it using SMC/ICT — identify bias, key levels, OB/FVG, entry zone, SL, TP. Keep answers SHORT (4-6 sentences). Use emojis naturally.",
                    messages: apiMessages,
                })
            });
            const d = await r.json();
            const reply = d?.content?.[0]?.text || "ຂໍໂທດ, ລອງໃໝ່ 🙏";
            setMsgs(prev => [...prev, { role: "assistant", text: reply }]);
        } catch(e) {
            setMsgs(prev => [...prev, { role: "assistant", text: "ເນັດຂາດ — ລອງໃໝ່ 🙏" }]);
        }
        setLoading(false);
        setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
    };

    const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

    return React.createElement(React.Fragment, null,
        // Floating bubble
        React.createElement("div", { style: { position: "fixed", bottom: 80, right: 18, zIndex: 9990 } },
            React.createElement("span", { "aria-hidden": true, style: { position: "absolute", inset: -6, borderRadius: "50%", border: "2px solid " + C.blue, animation: "botRingPulse 2s ease-out infinite", pointerEvents: "none" } }),
            React.createElement("span", { "aria-hidden": true, style: { position: "absolute", inset: -12, borderRadius: "50%", border: "1.5px solid " + C.cyan, animation: "botRingPulse 2s ease-out .6s infinite", pointerEvents: "none", opacity: 0.5 } }),
            !open && React.createElement("span", { "aria-hidden": true, style: { position: "absolute", top: 0, right: 0, width: 13, height: 13, borderRadius: "50%", background: C.green, border: "2px solid " + C.bg, animation: "botDot 1.4s ease-in-out infinite", zIndex: 2 } }),
            React.createElement("button", { onClick: () => setOpen(v => !v), className: "fx-btn", style: { position: "relative", width: 52, height: 52, borderRadius: "50%", border: "none", background: "linear-gradient(135deg," + C.blue + ",#5B4FFF)", color: "#fff", fontSize: 24, cursor: "pointer", boxShadow: "0 6px 24px -6px " + C.glow, display: "flex", alignItems: "center", justifyContent: "center", animation: open ? "none" : "botWiggle 4s ease-in-out infinite", zIndex: 1 } }, open ? "\u00D7" : "\uD83E\uDD16")
        ),
        // Chat window
        open && React.createElement("div", { style: { position: "fixed", bottom: 142, right: 14, zIndex: 9989, width: "min(360px, calc(100vw - 28px))", height: 480, borderRadius: 20, border: "1px solid " + C.line, background: C.panel, display: "flex", flexDirection: "column", boxShadow: "0 20px 60px -20px rgba(0,0,0,.7)", overflow: "hidden" } },
            // Header
            React.createElement("div", { style: { padding: "12px 16px", borderBottom: "1px solid " + C.line, background: C.bg2, display: "flex", alignItems: "center", gap: 10 } },
                React.createElement("span", { style: { fontSize: 22 } }, "\uD83E\uDD16"),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: C.text } }, "SniperBot"),
                    React.createElement("div", { style: { fontSize: 11, color: C.green } }, "● Online · ເທຣດ + ວິເຄາະກຣາຟ")),
                React.createElement("button", { onClick: () => setMsgs(msgs.slice(0,1)), style: { background: "none", border: "none", color: C.mut, fontSize: 11, cursor: "pointer", fontFamily: "inherit" } }, "ລ້າງ")
            ),
            // Messages
            React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 } },
                msgs.map((m, i) => React.createElement("div", { key: i, style: { display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" } },
                    React.createElement("div", { style: { maxWidth: "85%", display: "flex", flexDirection: "column", gap: 4, alignItems: m.role === "user" ? "flex-end" : "flex-start" } },
                        m.img && React.createElement("img", { src: m.img, alt: "chart", style: { maxWidth: 180, borderRadius: 10, border: "1px solid " + C.line, marginBottom: 2 } }),
                        React.createElement("div", { style: { padding: "9px 12px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "linear-gradient(135deg," + C.blue + ",#5B4FFF)" : C.bg2, color: m.role === "user" ? "#fff" : C.text, fontSize: 13.5, lineHeight: 1.6, border: m.role === "user" ? "none" : "1px solid " + C.line } }, m.text)
                    )
                )),
                loading && React.createElement("div", { style: { display: "flex", gap: 5, padding: "8px 12px", background: C.bg2, borderRadius: "14px 14px 14px 4px", width: "fit-content", border: "1px solid " + C.line } },
                    [0,1,2].map(i => React.createElement("span", { key: i, style: { width: 7, height: 7, borderRadius: "50%", background: C.blue, animation: "bounce .9s ease-in-out infinite", animationDelay: (i*0.2) + "s" } }))
                ),
                React.createElement("div", { ref: bottomRef })
            ),
            // Pending image preview
            pendingImg && React.createElement("div", { style: { padding: "6px 14px", borderTop: "1px solid " + C.line, background: C.bg2, display: "flex", alignItems: "center", gap: 8 } },
                React.createElement("img", { src: pendingImg.url, alt: "pending", style: { width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid " + C.line } }),
                React.createElement("span", { style: { flex: 1, fontSize: 12, color: C.mut } }, "📊 ຮູບກຣາຟ — ກົດ → ເພື່ອສົ່ງ"),
                React.createElement("button", { onClick: () => setPendingImg(null), style: { background: "none", border: "none", color: C.mut, fontSize: 16, cursor: "pointer", padding: 0 } }, "\u00D7")
            ),
            // Input bar
            React.createElement("div", { style: { padding: "10px 10px", borderTop: "1px solid " + C.line, display: "flex", gap: 6, background: C.bg2, alignItems: "center" } },
                // Image upload button
                React.createElement("button", { onClick: () => imgRef.current && imgRef.current.click(), className: "fx-btn", title: "ສົ່ງຮູບກຣາຟ", style: { width: 36, height: 36, borderRadius: 10, border: "1px solid " + C.line, background: pendingImg ? C.blue : C.bg, color: pendingImg ? "#fff" : C.mut, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, "📊"),
                React.createElement("input", { ref: imgRef, type: "file", accept: "image/*", style: { display: "none" }, onChange: e => pickImg(e.target.files) }),
                React.createElement("input", { ref: inputRef, value: input, onChange: e => setInput(e.target.value), onKeyDown: onKey, placeholder: pendingImg ? "ຕັ້ງຄຳຖາມກ່ຽວກັບຮູບ (ຫຼືສົ່ງເລີຍ)..." : "ຖາມໄດ້ເລີຍ...", style: { flex: 1, background: C.bg, border: "1px solid " + C.line, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" } }),
                React.createElement("button", { onClick: send, disabled: loading || (!input.trim() && !pendingImg), className: "fx-btn", style: { width: 36, height: 36, borderRadius: 10, border: "none", background: (input.trim() || pendingImg) ? "linear-gradient(95deg," + C.blue + "," + C.blueLt + ")" : C.bg2, color: (input.trim() || pendingImg) ? "#04101F" : C.mut, fontWeight: 700, fontSize: 16, cursor: (input.trim() || pendingImg) ? "pointer" : "default", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" } }, "\u2192")
            )
        )
    );
}
// Mount SniperTechX
(function(){
  var el = document.getElementById('root');
  if(typeof SniperTechX === 'undefined'){ 
    document.getElementById('bootHint').textContent='App error: SniperTechX not defined'; 
    return; 
  }
  if(window.ReactDOM && ReactDOM.createRoot){ ReactDOM.createRoot(el).render(React.createElement(SniperTechX)); }
  else if(window.ReactDOM){ ReactDOM.render(React.createElement(SniperTechX), el); }
})();
