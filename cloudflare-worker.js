// ══════════════════════════════════════════════════════════════════════════════
// Unified Solutions Inc. — GovCon Proxy Worker
// Handles: Notion API + SAM.gov Opportunities API
//
// Environment variables required (Settings → Variables and Secrets):
//   NOTION_TOKEN  — your Notion integration secret (ntn_... or secret_...)
//   SAM_API_KEY   — your SAM.gov API key (get free at api.sam.gov)
//
// Deploy to Cloudflare Workers (free tier: 100,000 req/day)
// ══════════════════════════════════════════════════════════════════════════════

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {

    // ── CORS preflight ──────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ── Route: /sam/* → SAM.gov Opportunities API ───────────────────────────
    if (path.startsWith('/sam')) {
      return handleSAM(request, url, env);
    }

    // ── Route: everything else → Notion API ─────────────────────────────────
    return handleNotion(request, url, env);
  },
};

// ── NOTION HANDLER ────────────────────────────────────────────────────────────
async function handleNotion(request, url, env) {
  const notionPath = url.pathname.replace(/^\/notion-proxy/, '');
  const notionUrl  = `https://api.notion.com${notionPath}${url.search}`;

  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text();
  }

  const resp = await fetch(notionUrl, {
    method: request.method,
    headers: {
      'Authorization':   `Bearer ${env.NOTION_TOKEN}`,
      'Notion-Version':  '2022-06-28',
      'Content-Type':    'application/json',
    },
    body: body || undefined,
  });

  const data = await resp.text();
  return new Response(data, {
    status: resp.status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// ── SAM.GOV HANDLER ───────────────────────────────────────────────────────────
async function handleSAM(request, url, env) {
  // Strip /sam prefix, forward the rest as query params to SAM.gov
  const samParams = new URLSearchParams(url.search);

  // Inject the API key server-side — never exposed to the browser
  samParams.set('api_key', env.SAM_API_KEY || '');

  const samUrl = `https://api.sam.gov/opportunities/v2/search?${samParams.toString()}`;

  const resp = await fetch(samUrl, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  const data = await resp.text();
  return new Response(data, {
    status: resp.status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SETUP INSTRUCTIONS
// ══════════════════════════════════════════════════════════════════════════════
//
// 1. Deploy this Worker to Cloudflare (workers.cloudflare.com)
//
// 2. Add TWO environment variables under Settings → Variables and Secrets:
//    ┌─────────────────┬───────────────────────────────────────────────────┐
//    │ Variable name   │ Value                                             │
//    ├─────────────────┼───────────────────────────────────────────────────┤
//    │ NOTION_TOKEN    │ ntn_xxxxxxx (your Notion integration secret)      │
//    │ SAM_API_KEY     │ your SAM.gov API key (get free at api.sam.gov)   │
//    └─────────────────┴───────────────────────────────────────────────────┘
//    Both should be set as "Secret" type (encrypted at rest).
//
// 3. Get your free SAM.gov API key:
//    → Go to https://api.sam.gov
//    → Click "Sign Up" (uses login.gov — free)
//    → After login, go to "Account Details" → "Public API Key"
//    → Copy the key and paste it as SAM_API_KEY above
//
// 4. Your Worker URL (e.g. https://notion-proxy.yourname.workers.dev)
//    is what you paste into the GovCon dashboard Setup screen.
// ══════════════════════════════════════════════════════════════════════════════
