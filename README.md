# GovCon Command Center
**Unified Solutions Inc. | SDVOSB | CAGE 8CX74 | UEI LU14TAVD5JS7**

Private government contracting dashboard for federal opportunity tracking, decision-maker outreach, and pipeline management. Connected to Notion backend databases.

---

## 🔒 Access

Default access code: `USC2026`

To change it: open `index.html`, find `const ACCESS_CODE = 'USC2026'` near the bottom, and update to your preferred code.

---

## 🚀 Setup (one-time, ~10 minutes)

### Step 1 — Enable GitHub Pages

Go to your repo **Settings → Pages** → Source: **Deploy from branch** → Branch: `main` / `/ (root)` → Save.

Your dashboard will be live at:
```
https://[your-github-username].github.io/GovCon/
```

> **For a private repo:** GitHub Pages on private repos requires GitHub Pro ($4/mo) or Team plan. Alternatively, keep the repo public — the access code gate protects the app, and `noindex` prevents search engine discovery.

### Step 2 — Create a Notion Integration

1. Go to [notion.so/my-integrations](https://notion.so/my-integrations) → **New integration**
2. Name it `GovCon Dashboard`, select your workspace → Submit
3. Copy the **Internal Integration Secret** (starts with `ntn_...`)

### Step 3 — Share your 5 Notion databases

In each Notion database, click **••• → Connections → Connect to → GovCon Dashboard**:
- 🎯 Opportunities Pipeline
- 👥 Decision-Maker CRM  
- ✉️ Outreach Log
- 📁 Marketing Assets Library
- ✅ SBA Profile & Contract Readiness Tracker

### Step 4 — Deploy Cloudflare Worker proxy

Notion's API blocks direct browser requests (CORS policy), so a tiny free proxy is required:

1. Go to [workers.cloudflare.com](https://workers.cloudflare.com) → free account → **Create Worker**
2. Replace the default code with the contents of `cloudflare-worker.js` from this repo
3. Click **Settings → Variables → Add Variable**:
   - Name: `NOTION_TOKEN`
   - Value: your token from Step 2
4. Click **Deploy**
5. Your Worker URL will look like: `https://notion-proxy.yourname.workers.dev`

### Step 5 — Connect the dashboard

1. Visit your GitHub Pages URL
2. Enter access code: `USC2026`
3. The Setup screen appears — paste your Cloudflare Worker URL
4. Click **Connect & Launch Dashboard**

---

## 📂 Files

| File | Purpose |
|------|---------|
| `index.html` | Complete dashboard — all logic, UI, and templates in one file |
| `cloudflare-worker.js` | Deploy to Cloudflare Workers as Notion API proxy |
| `README.md` | This setup guide |
| `.nojekyll` | Prevents GitHub Pages Jekyll processing |

---

## 🔧 Customization

**Change access code:** Find `const ACCESS_CODE = 'USC2026'` in `index.html`

**Update Cloudflare Worker URL:** Click ⚙ Setup in the top-right of the dashboard

**Add opportunities:** Go to your Notion Opportunities Pipeline → add as `🔍 Identified` → they appear in the queue after clicking Sync

**Notion backend:** [Open GovCon Command Center in Notion](https://www.notion.so/349b92d026ff816fa45fd27977206f24)

---

## 🏛️ Notion Database IDs

```
Opportunities Pipeline:  d66cf182-0ad9-4aa3-b2be-19ba995e9d45
Decision-Maker CRM:      f18d3e1a-e2a7-4f98-a9fe-34b8e72d4824
Outreach Log:            9d3735cd-f7dc-4140-88e3-778f63368373
Marketing Assets:        218cb4a2-1b8a-4846-8fd4-fb213d15a5a4
```

---

## 🔗 Key Links

- [SAM.gov NAICS 611430](https://sam.gov/search/?index=opp&naicsCode=611430)
- [SBA VetCert Portal](https://veterans.certify.sba.gov)
- [VA OSDBU Vets First](https://www.va.gov/osdbu/)
- [USAspending.gov](https://www.usaspending.gov)
- [unifiedsolutionsinc.com/government](https://unifiedsolutionsinc.com/government)

---

*Private repository — Unified Solutions Inc. · SDVOSB · © 2026*
