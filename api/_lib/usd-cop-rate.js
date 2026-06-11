const binanceP2pUrl = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
const fallbackRateUrl = "https://open.er-api.com/v6/latest/USD";
const cacheMs = 8_000;

let cachedPayload = null;
let cachedUntil = 0;

function withTimeout(ms = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

function average(values) {
  const finiteValues = values.filter((value) => Number.isFinite(value) && value > 0);

  if (!finiteValues.length) {
    return null;
  }

  return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}

async function fetchBinanceP2pPrices(tradeType) {
  const request = withTimeout(5000);

  try {
    const response = await fetch(binanceP2pUrl, {
      method: "POST",
      signal: request.signal,
      headers: {
        "content-type": "application/json",
        "user-agent": "BTCDashboard/1.0",
      },
      body: JSON.stringify({
        page: 1,
        rows: 5,
        payTypes: [],
        countries: [],
        publisherType: null,
        asset: "USDT",
        fiat: "COP",
        tradeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Binance P2P ${response.status}`);
    }

    const payload = await response.json();
    return Array.isArray(payload?.data)
      ? payload.data
          .map((item) => Number(item?.adv?.price))
          .filter((price) => Number.isFinite(price) && price > 0)
      : [];
  } finally {
    request.clear();
  }
}

async function fetchBinanceUsdCopRate() {
  const [askPrices, bidPrices] = await Promise.all([
    fetchBinanceP2pPrices("BUY"),
    fetchBinanceP2pPrices("SELL"),
  ]);
  const askRate = average(askPrices);
  const bidRate = average(bidPrices);

  if (!Number.isFinite(askRate) && !Number.isFinite(bidRate)) {
    throw new Error("Binance P2P no retorno precios USDT/COP");
  }

  const rate =
    Number.isFinite(askRate) && Number.isFinite(bidRate)
      ? (askRate + bidRate) / 2
      : askRate || bidRate;

  return {
    rate,
    askRate,
    bidRate,
    source: "binance-p2p",
    updatedAt: new Date().toISOString(),
    refreshMs: 10_000,
  };
}

async function fetchFallbackUsdCopRate() {
  const request = withTimeout(5000);

  try {
    const response = await fetch(fallbackRateUrl, {
      signal: request.signal,
      headers: {
        "user-agent": "BTCDashboard/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`USD/COP fallback ${response.status}`);
    }

    const payload = await response.json();
    const rate = Number(payload?.rates?.COP);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("Fallback USD/COP invalido");
    }

    return {
      rate,
      askRate: null,
      bidRate: null,
      source: "open-er-api",
      updatedAt: payload?.time_last_update_utc
        ? new Date(payload.time_last_update_utc).toISOString()
        : new Date().toISOString(),
      refreshMs: 60_000,
    };
  } finally {
    request.clear();
  }
}

export async function fetchUsdCopRate() {
  if (cachedPayload && Date.now() < cachedUntil) {
    return cachedPayload;
  }

  try {
    cachedPayload = await fetchBinanceUsdCopRate();
  } catch {
    cachedPayload = await fetchFallbackUsdCopRate();
  }

  cachedUntil = Date.now() + cacheMs;
  return cachedPayload;
}
