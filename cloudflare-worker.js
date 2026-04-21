// ══════════════════════════════════════════════════════════════════════════
// Unified Solutions Inc. — Notion Proxy Worker
// Deploy this to Cloudflare Workers (free.tier, 100K req/day)
// Set env variable NOTION_TOKEN = your Notion Integration Secret
// ══════════════════════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    // Strip /notion-proxy prefix if present, forward rest to Notion
    const notionPath = url.pathname.replace(/^\/notion-proxy/, '');
    const notionUrl = `https://api.notion.com${notionPath}${url.search}`;

    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    const notionResponse = await fetch(notionUrl, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: body || undefined,
    });

    const data = await notionResponse.text();

    return new Response(data, {
      status: notionResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  },
};

// ── HOW TO DEPLOY ──────────────────────────────────────────────────────────
// 1. Go to workers.cloudflare.com → Create Worker
// 2. Replace the default code with this file
// 3. Click Settings → Variables → Add: NOTION_TOKEN = your integration secret
// 4. Save and deploy — your Worker URL will be something like:
//    https://notion-proxy.yourname.workers.dev
// 5. In the GovCon dashboard Setup screen, paste that URL
//
// ── NOTION INTEGRATION SETUP ───────────────────────────────────────────────
// 1. Go to notion.so/my-integrations → New Integration
// 2. Name it "GovCon Dashboard", select your workspace
// 3. Copy the "Internal Integration Secret" token
// 4. Paste it as NOTION_TOKEN in Cloudflare Worker settings
// 5. In Notion, open each of the 5 GovCon databases:
//    - Click ••• → Connections → Connect to → GovCon Dashboard
//    Do this for: Opportunities Pipeline, Decision-Maker CRM,
//    Outreach Log, Marketing Assets Library, SBA Readiness Tracker
