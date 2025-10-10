const fetch = require("node-fetch");
const cheerio = require("cheerio");
const crypto = require("crypto");
const { connect } = require("nats");
const cron = require("node-cron");
const { createClient } = require("@supabase/supabase-js");

const sb = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);
const wait = ms => new Promise(r => setTimeout(r, ms));

// ----------------- HTTP utils -----------------
async function get(url) {
    const r = await fetch(url, { headers: { "User-Agent": process.env?.USER_AGENT || "RocketMVP-InfoHunter/1.0 (+https://trading-mvp.com)" } });
    if (!r?.ok) throw new Error(`HTTP ${r.status} @ ${url}`);
    return await r?.text();
}

// ----------------- Parsers CMV ----------------
async function parseBuffett() {
    const html = await get(`${process.env?.BASE_CMV || "https://www.currentmarketvaluation.com"}/models/buffett-indicator.php`);
    const $ = cheerio?.load(html);
    const txt = $("body")?.text();
    const ratio = /ratio.*?(\d{2,3})%/i?.exec(txt)?.[1] || null;      // 217 (%)
    const updated = /As of\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i?.exec(txt)?.[1] || null;
    return { 
        model: "buffett", 
        ratio_pct: ratio ? Number(ratio) : null, 
        updated_at: updated, 
        source: "CMV", 
        url: `${process.env?.BASE_CMV || "https://www.currentmarketvaluation.com"}/models/buffett-indicator.php` 
    };
}

async function parsePE() {
    const html = await get(`${process.env?.BASE_CMV || "https://www.currentmarketvaluation.com"}/models/price-earnings.php`);
    const $ = cheerio?.load(html);
    const txt = $("body")?.text();
    const cape = /10-year P\/E.*?is\s+([\d\.]+)/i?.exec(txt)?.[1] || null;
    const stance = /(Strongly Overvalued|Overvalued|Fairly Valued|Undervalued)/i?.exec(txt)?.[1] || null;
    const zsd = /standard deviations? above.*?(\d\.\d)/i?.exec(txt)?.[1] || null;
    return { 
        model: "pe10", 
        cape: cape ? Number(cape) : null, 
        zscore_sd: zsd ? Number(zsd) : null, 
        stance, 
        source: "CMV", 
        url: `${process.env?.BASE_CMV || "https://www.currentmarketvaluation.com"}/models/price-earnings.php` 
    };
}

async function parsePS() {
    const html = await get(`${process.env?.BASE_CMV || "https://www.currentmarketvaluation.com"}/models/price-sales.php`);
    const txt = cheerio?.load(html)("body")?.text();
    const stance = /(Strongly Overvalued|Overvalued|Fairly Valued|Undervalued)/i?.exec(txt)?.[1] || null;
    return { 
        model: "pricesales", 
        stance, 
        source: "CMV", 
        url: `${process.env?.BASE_CMV || "https://www.currentmarketvaluation.com"}/models/price-sales.php` 
    };
}

// ----------------- Parsers Wilshire -----------
async function parsePlatform() {
    const html = await get(`${process.env?.BASE_WILSHIRE || "https://www.wilshireindexes.com"}/our-platform`);
    const $ = cheerio?.load(html);
    const h1 = $("h1,h2")?.first()?.text()?.trim();
    return { 
        page: "our-platform", 
        title: h1 || "Our Platform", 
        source: "Wilshire", 
        url: `${process.env?.BASE_WILSHIRE || "https://www.wilshireindexes.com"}/our-platform` 
    };
}

async function parseIndexes() {
    const html = await get(`${process.env?.BASE_WILSHIRE || "https://www.wilshireindexes.com"}/products/all-indexes`);
    const $ = cheerio?.load(html);
    const items = [];
    $("a, h2, h3")?.each((_, el) => {
        const t = $(el)?.text()?.trim();
        if (/Index/i?.test(t)) items?.push(t);
    });
    return { 
        page: "all-indexes", 
        sample: items?.slice(0, 10), 
        source: "Wilshire", 
        url: `${process.env?.BASE_WILSHIRE || "https://www.wilshireindexes.com"}/products/all-indexes` 
    };
}

async function parseMethodology() {
    const html = await get(`${process.env?.BASE_WILSHIRE || "https://www.wilshireindexes.com"}/index-documents/ft-wilshire-5000-index-series`);
    const $ = cheerio?.load(html);
    const title = $("h1,h2")?.first()?.text()?.trim() || "Methodology";
    return { 
        page: "methodology_ft-w5000", 
        title, 
        source: "Wilshire", 
        url: `${process.env?.BASE_WILSHIRE || "https://www.wilshireindexes.com"}/index-documents/ft-wilshire-5000-index-series` 
    };
}

// ----------------- NATS publish ---------------
async function withNATS(fn) {
    if (!process.env?.NATS_URL) {
        console.log('NATS_URL not configured, skipping NATS operations');
        return;
    }
    const nc = await connect({ servers: process.env?.NATS_URL });
    try { return await fn(nc); } finally { await nc?.drain(); }
}

function fingerprint(obj) {
    const s = JSON.stringify(obj, Object.keys(obj)?.sort());
    return crypto?.createHash("sha256")?.update(s)?.digest("hex");
}

async function saveIfChanged(source, payload) {
    const fp = fingerprint(payload);
    const { data: row } = await sb?.from("external_sources_state")?.select("fingerprint")?.eq("source", source)?.maybeSingle();
    if (row?.fingerprint === fp) return { changed: false, fp };
    await sb?.from("external_sources_state")?.upsert({ 
        source, 
        fingerprint: fp, 
        payload, 
        updated_at: new Date()?.toISOString() 
    });
    return { changed: true, fp };
}

async function alert(msg) {
    // Telegram en priorité si configuré
    if (process.env?.TELEGRAM_BOT_TOKEN && process.env?.TELEGRAM_CHAT_ID) {
        try {
            await fetch(`https://api.telegram.org/bot${process.env?.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST", 
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ chat_id: process.env?.TELEGRAM_CHAT_ID, text: msg })
            });
            console.log(`Telegram alert sent: ${msg}`);
        } catch (e) {
            console.error('Telegram alert failed:', e?.message);
        }
    }
    
    // Log alert for monitoring
    console.log(`ALERT: ${msg}`);
}

// ----------------- Scans + publish ------------
async function scanCMV() {
    const out = [];
    try {
        const b = await parseBuffett(); out?.push(b); await wait(+(process.env?.RATE_LIMIT_MS || 1500));
        const pe = await parsePE(); out?.push(pe); await wait(+(process.env?.RATE_LIMIT_MS || 1500));
        try { out?.push(await parsePS()); } catch { }
        
        // publish NATS
        await withNATS(async (nc) => {
            for (const it of out) {
                if (it?.model === "buffett") {
                    await nc?.publish("macro.valuation.cmv.buffett", Buffer.from(JSON.stringify(it)));
                    const s = await saveIfChanged("cmv.buffett", it);
                    if (s?.changed) await alert(`CMV Buffett changé: ratio=${it?.ratio_pct}% (${it?.updated_at || "n/a"})`);
                }
                if (it?.model === "pe10") {
                    await nc?.publish("macro.valuation.cmv.pe10", Buffer.from(JSON.stringify(it)));
                    const s = await saveIfChanged("cmv.pe10", it);
                    if (s?.changed) await alert(`CMV CAPE changé: cape=${it?.cape} stance=${it?.stance || "?"}`);
                }
                if (it?.model === "pricesales") {
                    await nc?.publish("macro.valuation.cmv.pricesales", Buffer.from(JSON.stringify(it)));
                    const s = await saveIfChanged("cmv.pricesales", it);
                    if (s?.changed) await alert(`CMV Price/Sales changé: stance=${it?.stance || "?"}`);
                }
            }
        });
        return out;
    } catch (error) {
        console.error('CMV scan error:', error);
        throw error;
    }
}

async function scanWilshire() {
    const out = [];
    try {
        const p = await parsePlatform(); out?.push(p); await wait(+(process.env?.RATE_LIMIT_MS || 1500));
        const i = await parseIndexes(); out?.push(i); await wait(+(process.env?.RATE_LIMIT_MS || 1500));
        const m = await parseMethodology(); out?.push(m);
        
        await withNATS(async (nc) => {
            await nc?.publish("index.wilshire.platform", Buffer.from(JSON.stringify(p)));
            const s1 = await saveIfChanged("wilshire.platform", p); 
            if (s1?.changed) await alert(`Wilshire Platform page MAJ: ${p?.title}`);

            await nc?.publish("index.wilshire.all-indexes", Buffer.from(JSON.stringify(i)));
            const s2 = await saveIfChanged("wilshire.all-indexes", i); 
            if (s2?.changed) await alert(`Wilshire All Indexes MAJ (échantillon)`);

            await nc?.publish("index.wilshire.methodology.ftw5000", Buffer.from(JSON.stringify(m)));
            const s3 = await saveIfChanged("wilshire.methodology.ftw5000", m); 
            if (s3?.changed) await alert(`Wilshire Methodology MAJ: ${m?.title}`);
        });
        return out;
    } catch (error) {
        console.error('Wilshire scan error:', error);
        throw error;
    }
}

// ----------------- Routes HTTP ----------------
async function scanCMVRoute(_req, res) { 
    try { 
        res?.json({ ok: true, results: await scanCMV() }); 
    } catch (e) { 
        res?.status(500)?.json({ ok: false, error: String(e) }); 
    } 
}

async function scanWilshireRoute(_req, res) { 
    try { 
        res?.json({ ok: true, results: await scanWilshire() }); 
    } catch (e) { 
        res?.status(500)?.json({ ok: false, error: String(e) }); 
    } 
}

// ----------------- Scheduler ------------------
function startScheduler() {
    const cronExpr = process.env?.CMV_WIL_SCHEDULE_CRON || "30 7 * * *"; // 07:30 chaque jour
    console.log(`Starting scheduler with cron: ${cronExpr} in timezone: ${process.env?.TZ || "Europe/Zurich"}`);
    
    cron?.schedule(cronExpr, async () => {
        console.log('Starting scheduled CMV/Wilshire scan...');
        try {
            await scanCMV();
            await wait(2000);
            await scanWilshire();
            console.log('Scheduled scan completed successfully');
        } catch (e) {
            await alert("Scheduler CMV/Wilshire erreur: " + String(e)?.slice(0, 200));
        }
    }, { timezone: process.env?.TZ || "Europe/Zurich" });
}

// Démarrer le scheduler au chargement du service
if (process.env?.NODE_ENV !== 'test') {
    startScheduler();
}

module.exports = { 
    scanCMVRoute, 
    scanWilshireRoute,
    scanCMV,
    scanWilshire,
    startScheduler
};