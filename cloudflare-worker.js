// ══════════════════════════════════════════════════════════════════════════════
// Unified Solutions Inc. — GovCon Proxy Worker v3
//
// Routes:
//   /usa/*   → api.usaspending.gov  (no API key required — public data)
//   /v1/*    → api.notion.com       (requires NOTION_TOKEN secret)
//
// Environment secrets (Settings → Variables and Secrets):
//   NOTION_TOKEN  — your Notion integration secret (ntn_... or secret_...)
//   SAM_API_KEY   — optional, kept for future SAM.gov re-enablement
//
// Deploy to Cloudflare Workers free tier (100,000 req/day)
// ══════════════════════════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const path = new URL(request.url).pathname;

    if (path.startsWith('/usa')) return handleUSASpending(request, env);
    return handleNotion(request, env);
  },
};

// ── USAspending.gov ────────────────────────────────────────────────────────────
async function handleUSASpending(request, env) {
  const url    = new URL(request.url);
  // Strip /usa prefix → forward the rest as the USAspending path
  const usaPath = url.pathname.replace(/^\/usa/, '') || '/';
  const usaUrl  = `https://api.usaspending.gov/api/v2${usaPath}${url.search}`;

  const body = request.method !== 'GET' ? await request.text() : undefined;

  const resp = await fetch(usaUrl, {
    method:  request.method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body,
  });

  const data = await resp.text();
  return new Response(data, {
    status: resp.status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// ── Notion ─────────────────────────────────────────────────────────────────────
async function handleNotion(request, env) {
  const url      = new URL(request.url);
  const notionPath = url.pathname.replace(/^\/notion-proxy/, '');
  const notionUrl  = `https://api.notion.com${notionPath}${url.search}`;
  const body = request.method !== 'GET' ? await request.text() : undefined;

  const resp = await fetch(notionUrl, {
    method: request.method,
    headers: {
      'Authorization':  `Bearer ${env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type':   'application/json',
    },
    body,
  });

  const data = await resp.text();
  return new Response(data, {
    status: resp.status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
