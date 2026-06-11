const newsSources = [
  { url: "https://news.google.com/rss/search?q=bitcoin&hl=es-419&gl=CO&ceid=CO:es-419", source: "Google News" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml", source: "CoinDesk" },
  { url: "https://cointelegraph.com/rss/tag/bitcoin", source: "Cointelegraph" },
  { url: "https://bitcoinmagazine.com/.rss/full/", source: "Bitcoin Magazine" },
];

const globalCache = globalThis.__BTC_NEWS_CACHE__ || {
  items: [],
  updatedAt: null,
  expiresAt: 0,
};

globalThis.__BTC_NEWS_CACHE__ = globalCache;

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

export async function fetchBitcoinNews() {
  if (Date.now() < globalCache.expiresAt && globalCache.items.length) {
    return globalCache;
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
    }
  }

  const items = normalizeNewsItems(sourceResults);
  if (items.length) {
    globalCache.items = items;
    globalCache.updatedAt = new Date().toISOString();
    globalCache.expiresAt = Date.now() + 5 * 60 * 1000;
    return globalCache;
  }

  if (globalCache.items.length) {
    return globalCache;
  }

  throw new Error("No se pudieron cargar noticias de Bitcoin");
}
