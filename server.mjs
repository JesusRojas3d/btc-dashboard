import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const purchasesSeedDbPath = join(root, "data", "profile-purchases.seed.json");
const purchasesRuntimeDbPath = join(root, "data", "profile-purchases.runtime.json");
const profileIds = ["jesus", "alzate"];
const newsSources = [
  { url: "https://news.google.com/rss/search?q=bitcoin&hl=es-419&gl=CO&ceid=CO:es-419", source: "Google News" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml", source: "CoinDesk" },
  { url: "https://cointelegraph.com/rss/tag/bitcoin", source: "Cointelegraph" },
  { url: "https://bitcoinmagazine.com/.rss/full/", source: "Bitcoin Magazine" },
];
const newsCache = {
  items: [],
  updatedAt: null,
  expiresAt: 0,
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function createEmptyPurchasesDb() {
  return Object.fromEntries(profileIds.map((profileId) => [profileId, []]));
}

function normalizePurchase(rawPurchase) {
  if (!rawPurchase || typeof rawPurchase !== "object") {
    return null;
  }

  const normalizedPurchase = {
    id: String(rawPurchase.id || randomUUID()),
    date: rawPurchase.date,
    btc: Number(rawPurchase.btc),
    priceUsd: Number(rawPurchase.priceUsd || rawPurchase.purchaseBtcPriceUsd || rawPurchase.usd || 0),
  };

  if (
    !normalizedPurchase.date ||
    !Number.isFinite(normalizedPurchase.btc) ||
    normalizedPurchase.btc <= 0 ||
    !Number.isFinite(normalizedPurchase.priceUsd) ||
    normalizedPurchase.priceUsd <= 0
  ) {
    return null;
  }

  return normalizedPurchase;
}

function dedupeAndSortPurchases(purchases) {
  const uniquePurchases = new Map();

  purchases.forEach((purchase) => {
    const normalizedPurchase = normalizePurchase(purchase);
    if (!normalizedPurchase) {
      return;
    }

    const purchaseKey = [
      normalizedPurchase.date,
      Number(normalizedPurchase.btc).toFixed(8),
      Number(normalizedPurchase.priceUsd).toFixed(2),
    ].join("|");

    if (!uniquePurchases.has(purchaseKey)) {
      uniquePurchases.set(purchaseKey, normalizedPurchase);
    }
  });

  return Array.from(uniquePurchases.values()).sort((left, right) => {
    const leftTime = new Date(left.date).getTime();
    const rightTime = new Date(right.date).getTime();
    return rightTime - leftTime;
  });
}

function normalizePurchasesDb(rawDb) {
  const normalizedDb = createEmptyPurchasesDb();

  if (!rawDb || typeof rawDb !== "object") {
    return normalizedDb;
  }

  profileIds.forEach((profileId) => {
    normalizedDb[profileId] = dedupeAndSortPurchases(Array.isArray(rawDb[profileId]) ? rawDb[profileId] : []);
  });

  return normalizedDb;
}

function ensurePurchasesDb() {
  mkdirSync(join(root, "data"), { recursive: true });
  if (!existsSync(purchasesRuntimeDbPath)) {
    const seededDb = existsSync(purchasesSeedDbPath)
      ? normalizePurchasesDb(JSON.parse(readFileSync(purchasesSeedDbPath, "utf8")))
      : createEmptyPurchasesDb();
    writeFileSync(purchasesRuntimeDbPath, `${JSON.stringify(seededDb, null, 2)}\n`, "utf8");
  }
}

function readPurchasesDb() {
  ensurePurchasesDb();

  try {
    const rawDb = JSON.parse(readFileSync(purchasesRuntimeDbPath, "utf8"));
    return normalizePurchasesDb(rawDb);
  } catch {
    const fallbackDb = createEmptyPurchasesDb();
    writeFileSync(purchasesRuntimeDbPath, `${JSON.stringify(fallbackDb, null, 2)}\n`, "utf8");
    return fallbackDb;
  }
}

function writePurchasesDb(purchasesDb) {
  ensurePurchasesDb();
  writeFileSync(
    purchasesRuntimeDbPath,
    `${JSON.stringify(normalizePurchasesDb(purchasesDb), null, 2)}\n`,
    "utf8",
  );
}

function isValidProfileId(profileId) {
  return profileIds.includes(profileId);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function resolvePath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const safePath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(root)) {
    return null;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    return join(filePath, "index.html");
  }

  return filePath;
}

function decodeEntities(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickTag(content, tagName) {
  const match = content.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function pickAtomLink(content) {
  const hrefMatch = content.match(/<link\b[^>]*href="([^"]+)"[^>]*\/?>/i);
  if (hrefMatch) {
    return decodeEntities(hrefMatch[1]);
  }

  return pickTag(content, "link");
}

function normalizeNewsItems(items) {
  const dedupedItems = new Map();

  items.forEach((item) => {
    if (!item.title || !item.link) {
      return;
    }

    const key = `${item.title.toLowerCase()}|${item.link.toLowerCase()}`;
    if (!dedupedItems.has(key)) {
      dedupedItems.set(key, item);
    }
  });

  return Array.from(dedupedItems.values())
    .sort((left, right) => {
      const leftTime = new Date(left.publishedAt || 0).getTime();
      const rightTime = new Date(right.publishedAt || 0).getTime();
      return rightTime - leftTime;
    })
    .slice(0, 8);
}

function parseFeed(xmlText, defaultSource = "Bitcoin News") {
  const rssItems = [...xmlText.matchAll(/<item\b[\s\S]*?>([\s\S]*?)<\/item>/gi)].map((match) => {
    const rawItem = match[1];
    return {
      title: pickTag(rawItem, "title"),
      link: pickTag(rawItem, "link"),
      source: pickTag(rawItem, "source") || defaultSource,
      publishedAt: pickTag(rawItem, "pubDate"),
    };
  });

  const atomEntries = [...xmlText.matchAll(/<entry\b[\s\S]*?>([\s\S]*?)<\/entry>/gi)].map((match) => {
    const rawEntry = match[1];
    return {
      title: pickTag(rawEntry, "title"),
      link: pickAtomLink(rawEntry),
      source: pickTag(rawEntry, "source") || defaultSource,
      publishedAt: pickTag(rawEntry, "updated") || pickTag(rawEntry, "published"),
    };
  });

  return normalizeNewsItems([...rssItems, ...atomEntries]);
}

function withTimeout(resource, ms = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
    resource,
  };
}

async function fetchBitcoinNews() {
  if (Date.now() < newsCache.expiresAt && newsCache.items.length) {
    return newsCache;
  }

  const sourceResults = [];

  for (const { url, source } of newsSources) {
    const request = withTimeout(url, 5000);

    try {
      const response = await fetch(request.resource, {
        signal: request.signal,
        headers: {
          "user-agent": "BTCDashboard/1.0",
          accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
      });
      request.clear();

      if (!response.ok) {
        continue;
      }

      const xmlText = await response.text();
      sourceResults.push(...parseFeed(xmlText, source));
    } catch {
      request.clear();
      continue;
    }
  }

  const items = normalizeNewsItems(sourceResults);
  if (items.length) {
    newsCache.items = items;
    newsCache.updatedAt = new Date().toISOString();
    newsCache.expiresAt = Date.now() + 5 * 60 * 1000;
    return newsCache;
  }

  if (newsCache.items.length) {
    return newsCache;
  }

  throw new Error("No se pudieron cargar noticias de Bitcoin");
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);

  const purchasesCollectionMatch = requestUrl.pathname.match(/^\/api\/profiles\/([^/]+)\/purchases$/);
  if (purchasesCollectionMatch) {
    const profileId = purchasesCollectionMatch[1];

    if (!isValidProfileId(profileId)) {
      sendJson(response, 404, { error: "Perfil no encontrado" });
      return;
    }

    if (request.method === "GET") {
      const purchasesDb = readPurchasesDb();
      sendJson(response, 200, { purchases: purchasesDb[profileId] || [] });
      return;
    }

    if (request.method === "PUT") {
      try {
        const body = await readJsonBody(request);
        const purchasesDb = readPurchasesDb();
        purchasesDb[profileId] = dedupeAndSortPurchases(body.purchases);
        writePurchasesDb(purchasesDb);
        sendJson(response, 200, { purchases: purchasesDb[profileId] });
      } catch {
        sendJson(response, 400, { error: "No se pudo actualizar el historial de compras" });
      }
      return;
    }

    if (request.method === "POST") {
      try {
        const body = await readJsonBody(request);
        const purchasesDb = readPurchasesDb();
        const newPurchase = normalizePurchase(body.purchase);

        if (!newPurchase) {
          sendJson(response, 400, { error: "Compra inválida" });
          return;
        }

        purchasesDb[profileId] = dedupeAndSortPurchases([newPurchase, ...(purchasesDb[profileId] || [])]);
        writePurchasesDb(purchasesDb);
        sendJson(response, 201, { purchase: newPurchase, purchases: purchasesDb[profileId] });
      } catch {
        sendJson(response, 400, { error: "No se pudo guardar la compra" });
      }
      return;
    }

    sendJson(response, 405, { error: "Método no permitido" });
    return;
  }

  const purchaseDeleteMatch = requestUrl.pathname.match(/^\/api\/profiles\/([^/]+)\/purchases\/([^/]+)$/);
  if (purchaseDeleteMatch) {
    const profileId = purchaseDeleteMatch[1];
    const purchaseId = purchaseDeleteMatch[2];

    if (!isValidProfileId(profileId)) {
      sendJson(response, 404, { error: "Perfil no encontrado" });
      return;
    }

    if (request.method !== "DELETE") {
      sendJson(response, 405, { error: "Método no permitido" });
      return;
    }

    const purchasesDb = readPurchasesDb();
    const currentPurchases = purchasesDb[profileId] || [];
    const nextPurchases = currentPurchases.filter((purchase) => purchase.id !== purchaseId);

    if (nextPurchases.length === currentPurchases.length) {
      sendJson(response, 404, { error: "Compra no encontrada" });
      return;
    }

    purchasesDb[profileId] = nextPurchases;
    writePurchasesDb(purchasesDb);
    sendJson(response, 200, { purchases: nextPurchases });
    return;
  }

  if (requestUrl.pathname === "/api/bitcoin-news") {
    try {
      const news = await fetchBitcoinNews();
      sendJson(response, 200, news);
    } catch (error) {
      sendJson(response, 502, { error: error.message });
    }
    return;
  }

  const filePath = resolvePath(request.url || "/");

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
    "cache-control": "no-store",
  });

  createReadStream(filePath).pipe(response);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`El puerto ${port} ya esta ocupado. Cierra el otro servidor o usa otro PORT.`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`BTC Dashboard running at http://${host}:${port}`);
});
