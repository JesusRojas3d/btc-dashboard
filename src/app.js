const BINANCE_REST = "https://api.binance.com/api/v3/klines";
const BINANCE_WS = "wss://stream.binance.com:9443/ws";
const COINGECKO_RANGE = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range";
const USD_COP_RATE = "https://open.er-api.com/v6/latest/USD";
const symbol = "btcusdt";

const chartCanvas = document.querySelector("#btcChart");
const profileGate = document.querySelector("#profileGate");
const profileLoginButtons = document.querySelectorAll("[data-profile-login]");
const profileAuthForm = document.querySelector("#profileAuthForm");
const profilePasswordInput = document.querySelector("#profilePasswordInput");
const profilePasswordSubmit = document.querySelector("#profilePasswordSubmit");
const profileAuthLabel = document.querySelector("#profileAuthLabel");
const profileAuthTitle = document.querySelector("#profileAuthTitle");
const profileAuthFeedback = document.querySelector("#profileAuthFeedback");
const activeProfileNameElement = document.querySelector("#activeProfileName");
const activeProfileBadgeElement = document.querySelector("#activeProfileBadge");
const switchProfileButton = document.querySelector("#switchProfileButton");
const logoutButton = document.querySelector("#logoutButton");
const openSimulationModalButton = document.querySelector("#openSimulationModalButton");
const simulationModal = document.querySelector("#simulationModal");
const simulationModalClose = document.querySelector("#simulationModalClose");
const viewButtons = document.querySelectorAll("[data-view-target]");
const viewPanels = document.querySelectorAll("[data-view-panel]");
const heroCurrentPriceElement = document.querySelector("#heroCurrentPrice");
const heroCurrentPriceCopElement = document.querySelector("#heroCurrentPriceCop");
const currentPriceElement =
  document.querySelector("#currentPrice") || document.querySelector("#heroCurrentPrice");
const priceChangeElement = document.querySelector("#priceChange");
const priceChangeNoteElement = document.querySelector("#priceChangeNote");
const rangeReturnElement = document.querySelector("#rangeReturn");
const rangeReturnPercentElement = document.querySelector("#rangeReturnPercent");
const rangeReturnAmountElement = document.querySelector("#rangeReturnAmount");
const rangeReturnLabelElement = document.querySelector("#rangeReturnLabel");
const connectionDot = document.querySelector("#connectionDot");
const connectionStatus = document.querySelector("#connectionStatus");
const timeframeButtons = document.querySelectorAll("[data-range]");
const purchaseViewButtons = document.querySelectorAll("[data-purchase-view]");
const purchaseCountElement = document.querySelector("#purchaseCount");
const summaryVisibilityButton = document.querySelector("#summaryVisibilityButton");
const summaryVisibilityIcon = document.querySelector("#summaryVisibilityIcon");
const summaryVisibilityLabel = document.querySelector("#summaryVisibilityLabel");
const totalSpentElement = document.querySelector("#totalSpent");
const totalSpentUsdElement = document.querySelector("#totalSpentUsd");
const totalBtcElement = document.querySelector("#totalBtc");
const totalValueElement = document.querySelector("#totalValue");
const totalValueUsdElement = document.querySelector("#totalValueUsd");
const totalProfitCopElement = document.querySelector("#totalProfitCop");
const totalProfitUsdElement = document.querySelector("#totalProfitUsd");
const simulationCurrentPriceUsdElement = document.querySelector("#simulationCurrentPriceUsd");
const simulationCurrentPriceCopElement = document.querySelector("#simulationCurrentPriceCop");
const simulationTargetPriceUsdElement = document.querySelector("#simulationTargetPriceUsd");
const simulationTargetPriceCopElement = document.querySelector("#simulationTargetPriceCop");
const simulationPriceRangeInput = document.querySelector("#simulationPriceRange");
const simulationPanelElement = document.querySelector(".simulation-panel");
const simulationTargetCardElement = document.querySelector(".simulation-card-target");
const simulationValueCardElement = document.querySelector(".simulation-card-value");
const simulationProfitCardElement = document.querySelector(".simulation-card-profit");
const simulationSliderWrapElement = document.querySelector(".simulation-slider-wrap");
const simulationEquilibriumMarkerElement = document.querySelector("#simulationEquilibriumMarker");
const simulationUseLivePriceButton = document.querySelector("#simulationUseLivePrice");
const simulationDeltaBadgeElement = document.querySelector("#simulationDeltaBadge");
const simulationScenarioHintElement = document.querySelector("#simulationScenarioHint");
const simulationValueCopElement = document.querySelector("#simulationValueCop");
const simulationValueUsdElement = document.querySelector("#simulationValueUsd");
const simulationProfitCopElement = document.querySelector("#simulationProfitCop");
const simulationProfitUsdElement = document.querySelector("#simulationProfitUsd");
const simulationBanterPanelElement = document.querySelector("#simulationBanterPanel");
const simulationBanterTextElement = document.querySelector("#simulationBanterText");
const simulationBanterSubtextElement = document.querySelector("#simulationBanterSubtext");
const newsTitleElement = document.querySelector("#newsTitle");
const newsListElement = document.querySelector("#newsList");
const newsUpdatedAtElement = document.querySelector("#newsUpdatedAt");
const purchaseForm = document.querySelector("#purchaseForm");
const purchaseBtcInput = document.querySelector("#purchaseBtc");
const purchaseDateInput = document.querySelector("#purchaseDate");
const purchaseUsdInput = document.querySelector("#purchaseUsd");
const purchaseList = document.querySelector("#purchaseList");
const deletePurchaseModal = document.querySelector("#deletePurchaseModal");
const deletePurchaseCancel = document.querySelector("#deletePurchaseCancel");
const deletePurchaseConfirm = document.querySelector("#deletePurchaseConfirm");
const context = chartCanvas.getContext("2d");
const purchasesStorageKey = "btc-dashboard-purchases";
const purchasesApiBase = "/api/purchases";
const authApiBase = "/api/auth";
const summaryVisibilityStorageKey = "btc-dashboard-summary-masked";
const usdCopStorageKey = "btc-dashboard-usd-cop";
const newsStorageKey = "btc-dashboard-catano-feed";
const dayMs = 24 * 60 * 60 * 1000;
const bitcoinStartTime = new Date("2010-07-17T00:00:00Z").getTime();
const catanoAvatarPath = window.__CATANO_AVATAR_DATA_URI__ || "./catano-avatar.png";
const catanoFeedConfigs = [
  { id: "today", label: "Hoy", rangeLabel: "hoy", interval: "30m", days: 1 },
  { id: "week", label: "7D", rangeLabel: "la ultima semana", interval: "2h", days: 7 },
  { id: "month", label: "30D", rangeLabel: "el ultimo mes", interval: "6h", days: 30 },
];
const rangePresets = {
  realtime: { label: "tiempo real", provider: "binance", interval: "1m", days: 0.25 },
  "1d": { label: "1 día", provider: "binance", interval: "5m", days: 1 },
  "5d": { label: "5 días", provider: "binance", interval: "15m", days: 5 },
  "1m": { label: "1 mes", provider: "binance", interval: "1h", days: 30 },
  "6m": { label: "6 meses", provider: "binance", interval: "6h", days: 183 },
  "1y": { label: "1 año", provider: "binance", interval: "12h", days: 365 },
  "2y": { label: "2 años", provider: "binance", interval: "1d", days: 730 },
  "3y": { label: "3 años", provider: "binance", interval: "1d", days: 1095 },
  "5y": { label: "5 años", provider: "coingecko", bucketDays: 7, days: 1825 },
  "10y": { label: "10 años", provider: "coingecko", bucketDays: 14, days: 3650 },
  all: { label: "todo el histórico", provider: "coingecko", bucketDays: 30, all: true },
};

const state = {
  candles: [],
  range: "1m",
  interval: rangePresets["1m"].interval,
  liveChart: true,
  socket: null,
  reconnectTimer: null,
  fallbackTimer: null,
  rateTimer: null,
  newsTimer: null,
  visibleCount: 140,
  offsetFromRight: 0,
  dragStart: null,
  selectedRange: null,
  selectionDraft: null,
  hoverIndex: null,
  lastClose: null,
  usdCop: null,
  usdCopPrevious: null,
  purchases: [],
  pendingDeletePurchaseId: null,
  activeProfileId: null,
  purchaseOverlayMode: "markers",
  activeView: "dashboard",
  profileGateVisible: false,
  pendingProfileId: null,
  summaryMasked: false,
  simulationPriceUsd: null,
  newsItems: [],
};

async function readErrorMessage(response, fallbackMessage) {
  const responseText = await response.text().catch(() => "");

  if (!responseText) {
    return fallbackMessage;
  }

  try {
    const payload = JSON.parse(responseText);
    return payload?.error || fallbackMessage;
  } catch {
    return `${fallbackMessage} (${response.status})`;
  }
}

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const formatCop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatBtc = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 8,
  maximumFractionDigits: 8,
});

const formatUsdValue = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatTableCop = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formatUsdCopRate = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const bogotaDatePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatTableUsd = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCompactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const chartFont =
  "-apple-system, BlinkMacSystemFont, SF Pro Text, Helvetica Neue, Arial, sans-serif";
const profileCatalog = {
  jesus: { id: "jesus", name: "Jesus" },
  alzate: { id: "alzate", name: "Alzate" },
};
const profilePurchaseBundles =
  window.__BTC_PROFILE_PURCHASES__ ||
  (Array.isArray(window.__BTC_BUNDLED_PURCHASES__)
    ? { jesus: window.__BTC_BUNDLED_PURCHASES__, alzate: [] }
    : { jesus: [], alzate: [] });
const simulationPositiveBanter = [
  "UY PAI QUE GONORREA",
  "UY MANO ESO VA PA ARRIBA",
  "UY JUEPUCTA",
  "PAPI ESO SE VE SABROSO",
  "ESO ESTA PRENDIDO",
  "AY HOMBE ESO ESTA REFINO",
  "MI REY AHI HAY PLATICA",
  "ESO ESTA VERDE VERDE",
  "PAPI ESA VAINA ESTA ROMPIENDO",
  "NAAA MANO QUE LOCURA",
  "ESO HUELE A CELEBRACION",
  "PONGA MUSICA QUE ESO DESPEGO",
  "ESO VA COMO COHETE",
  "PAPI AHI SI HAY CON QUE",
  "ESO ESTA MELAZA",
  "QUE BARBARIDAD TAN LINDA",
  "PAPI EL BTC SE PUSO ELEGANTE",
  "ESO ESTA PICANDO ALTO",
  "NOOO SOCIO ESO CORONO",
  "MANO ESO PIDE CAPTURA",
  "ESA SIMULACION ESTA BENDITA",
  "PAPI ESO DA HASTA RISA",
  "ESO ESTA MAS BUENO QUE COBRAR",
  "UY ESA CURVA ESTA CRIMINAL",
  "PAPI ESO SI ES HACER MERCADO",
  "ESO ESTA MODO CASINO PREMIUM",
  "QUE LOCURA TAN DECENTE",
  "PAPI AHI EL PORTAFOLIO SONRIE",
  "ESO ESTA PASADO DE FINO",
  "MANO ESO ESTA HECHO UNA JOYA",
];
const simulationNegativeBanter = [
  "AA NO PAPI",
  "GAS ESO JAJA",
  "UY NO MANO BAJESE DE AHI",
  "PAPI ESO ESTA TIESO",
  "ESO SE PUSO FEO",
  "AY DIOS MIO ESA SI DOLIO",
  "NO MI REY AHI NO ERA",
  "ESO ESTA COMO APRETADO",
  "PAPI ESA CUENTA ESTA LLORANDO",
  "NOOO MANO QUE CASTIGO",
  "ESO SI ESTA TIRANDO DURO",
  "PAPI RECOJA ESO UN MOMENTO",
  "ESA SIMULACION DA FRIO",
  "NO PAI ESO ESTA PELIGROSO",
  "GAS ESA BAJADA TAN ASQUEROSA",
  "ESO ESTA MODO AUXILIO",
  "PAPI AHI HAY QUE RESPIRAR",
  "NO JODA ESO QUEMO",
  "MANO ESO PIDE CAFECITO",
  "PAPI ESA VELA ESTA MALCRIADA",
  "ESO ESTA MODO NO MIRAR",
  "AY HOMBE QUIEN MANEJA ESO",
  "PAPI ESE ESCENARIO NO PROVOCA",
  "ESO ESTA PA CERRAR Y VOLVER",
  "NO REY AHI NO HAY GLORIA",
  "PAPI ESA SIMULACION DA GAS",
  "ESO ESTA COMO MALUCO",
  "MANO ESO ESTA MAS ROJO QUE SEMAFORO",
  "PAPI AHI TOCA AGUANTAR BARRA",
  "NOOO ESO ESTA MUY SALVAJE",
];
const simulationNeutralBanter = [
  "ESTO ESTA EN TABLAS MI REY",
  "NI FRIO NI CALIENTE",
  "AHI VAN MIDIENDO FUERZAS",
  "TRANQUI, ESTO SIGUE PENSANDO",
  "ESO ESTA PA FOTO, PERO SIN GRITO",
];
const catanoTweetOpeners = {
  today: {
    positive: [
      "Hoy el BTC salio bien parado, mi papacho.",
      "Hoy el Bitcoin se desperto con ganas de joder, pero pa arriba.",
      "Hoy esto no estuvo una mierda, estuvo sabroso.",
      "Hoy el BTC metio hombro y se vio fino.",
      "Hoy la cosa vino con gasolina, socio.",
      "Hoy el Bitcoin amanecio picante y con hambre.",
      "Hoy este hp mercado salio respondon, pero del bueno.",
      "Hoy el BTC dijo quitense que voy subiendo.",
    ],
    negative: [
      "Hoy el BTC estuvo una mierda, no joda.",
      "Hoy el Bitcoin salio atravesado y fastidioso.",
      "Hoy esta vaina se puso tiesa desde temprano.",
      "Hoy el BTC arranco como con guayabo.",
      "Hoy el mercado vino malgeniado y se noto.",
      "Hoy esto se fue pa abajo feisimo, mi rey.",
      "Hoy el Bitcoin no colaboro ni cinco.",
      "Hoy esta vuelta estuvo pa apagar el monitor.",
    ],
    neutral: [
      "Hoy el BTC esta ahi como mirando a ver que hace.",
      "Hoy el Bitcoin no hizo una locura, pero tampoco se murio.",
      "Hoy esta vaina esta tibia, sin tanta pelicula.",
      "Hoy el mercado esta como pensando la jugada.",
      "Hoy el BTC esta lateralito, ni fu ni fa.",
      "Hoy esto esta calmado, pero uno no se confia.",
    ],
  },
  week: {
    positive: [
      "En la ultima semana el BTC subio pero de lo lindo, mi papacho.",
      "Estos 7 dias dejaron al Bitcoin bien parado, socio.",
      "La semana del BTC estuvo sabrosa y con colmillito.",
      "En 7 dias esto se acomodo y cogio vuelo.",
      "La ultima semana fue de las que alegran la app.",
      "Estos dias el Bitcoin se sacudio y empujo con ganas.",
      "En la semana el mercado se porto fino, no joda.",
      "Estos 7 dias tuvieron sazoncito verde del bueno.",
    ],
    negative: [
      "La ultima semana del BTC fue bien maluca, pa que.",
      "En 7 dias esto se vio vuelto mierda, no joda.",
      "La semana del Bitcoin pego una desinflada fea.",
      "Estos dias el mercado estuvo canson y tirando pa abajo.",
      "La ultima semana fue de aguantar barra, papi.",
      "En 7 dias el BTC se puso fastidioso con ganas.",
      "Esta semana fue pa masticar rabia mirando velas.",
      "En la semana esto no dejo sino caras largas.",
    ],
    neutral: [
      "La ultima semana del BTC estuvo mas bien en veremos.",
      "En 7 dias esto no exploto ni se desbarato.",
      "La semana del Bitcoin fue tranquila, sin tanto show.",
      "Estos dias se sintieron como de estudio, no de fiesta.",
      "La ultima semana estuvo plana, pero viva.",
      "En 7 dias el BTC apenas se movio lo justo.",
    ],
  },
  month: {
    positive: [
      "En el ultimo mes el BTC dejo buena pinta, mi rey.",
      "Este mes Bitcoin se vio fuertecito y con ganas.",
      "En 30 dias esto agarro vuelo y se noto durisimo.",
      "El ultimo mes del BTC estuvo bonito, pa que te digo que no.",
      "En el mes el mercado se puso elegante y subio sabroso.",
      "Estos 30 dias fueron de los que emocionan, gonorrea.",
      "En el ultimo mes el BTC saco pecho con categoria.",
      "Este mes el Bitcoin se vio refinito y respondon.",
    ],
    negative: [
      "En el ultimo mes el BTC si estuvo medio vuelto mierda.",
      "Este mes Bitcoin dio fue pelea de la mala.",
      "En 30 dias esto se desinflo bien feo, socio.",
      "El ultimo mes estuvo pa respirar hondo y no mirar tanto.",
      "En el mes el mercado vino pesado y canson.",
      "Estos 30 dias fueron de aguantar ese dolorcito.",
      "En el ultimo mes el BTC no dio tregua ni media.",
      "Este mes estuvo pa decir gas y seguir derecho.",
    ],
    neutral: [
      "En el ultimo mes el BTC estuvo como tanteando terreno.",
      "Estos 30 dias fueron calmados, sin tanta gritadera.",
      "El ultimo mes del Bitcoin quedo ahi, decentico.",
      "En el mes no paso una locura, pero tampoco nada muerto.",
      "Estos 30 dias estuvieron mas pensados que acelerados.",
      "En el ultimo mes esto se movio justo pa no dormirse.",
    ],
  },
};
const catanoTweetClosers = {
  positive: [
    "Eso huele a confianza del barrio.",
    "Ahi si provoca sonreir, papa.",
    "Se siente sabroso ese empujoncito.",
    "Eso esta pa capturazo.",
    "Ahi hay con que ponerse fino.",
    "Eso deja buen sabor, no joda.",
    "Va bonito la vuelta, socio.",
    "Eso esta como pa celebrar bajito.",
  ],
  negative: [
    "Eso si da como rabiecita, pa que.",
    "Ahi toca no paniquear, pero gas.",
    "Eso esta pa coger aire y no tocar nada.",
    "No esta pa presumirle a nadie, la verdad.",
    "Ahi toca aguantar el totazo con dignidad.",
    "Eso deja el cuerpo raro, mano.",
    "No esta lindo, pero toca mirar de frente.",
    "Eso esta bien maluco, mi rey.",
  ],
  neutral: [
    "Toca seguirle el pulso sin inventar.",
    "Ahi lo llevamos, sin alboroto.",
    "Eso esta pa mirar con cafecito.",
    "No asusta ni emociona demasiado.",
    "Esta quietico, pero vivo.",
    "Aun no suelta el chisme completo.",
  ],
};
const catanoTweetDescriptors = {
  positive: [
    "Le metio una estiradita seria",
    "Se sacudio con elegancia",
    "Apreto duro y respondio",
    "Se vio con momentum del bueno",
    "Trajo velitas verdes bien decentes",
    "Camino con mas actitud de la esperada",
  ],
  negative: [
    "Se fue de trompa un ratico",
    "Dejo velas flojas y caras largas",
    "Se desordeno feo por momentos",
    "Metio un retroceso bien canson",
    "Se vio blandito y sin mucha gracia",
    "Le falto fuerza y se noto",
  ],
  neutral: [
    "Se la paso tanteando",
    "Quedo en modo espera",
    "Se movio sin comprometerse",
    "Se quedo cocinando la jugada",
    "Anduvo midiendo fuerzas",
    "Se mantuvo sin tanta pelicula",
  ],
};
const catanoTweetCompactComments = {
  today: {
    positive: [
      "oi el btc rompio resitencia y se ve berraco.",
      "oi esa vela cerro arriva, nojoda se ve fuerte.",
      "oi el btc aguanto soporte y salio con webos.",
      "oi esto marco fuerza arriva, hp cosa linda.",
      "oi el volumen entro y el btc se puso serio.",
    ],
    negative: [
      "oi el btc perdio soporte, q vaina tan hp.",
      "oi esa vela se desarmo feisimo, gas.",
      "oi el btc no pudo con la resitencia, paila.",
      "oi entro venta dura, esto quedo vuelto mierda.",
      "oi el grafico se ve flojito, q gonorrea.",
    ],
    neutral: [
      "oi el btc ta lateral, ni chicha ni limona.",
      "oi ta mascando rango, sin aser gran cosa.",
      "oi el precio ta en pausa, calma nomas.",
      "oi ta entre soporte y resitencia, ahi ahi.",
      "oi esto no define na, pero tampoko jode.",
    ],
  },
  week: {
    positive: [
      "en la semana el btc va alcista, nojoda se noto.",
      "7d y sigue ensima de soporte, bien ai.",
      "esta semana metio maximos mas altos, sabroso.",
      "en 7d la media va pa rriba, hp buen sintoma.",
      "la semana se ve fuerte en grafico, sin tanta joda.",
    ],
    negative: [
      "en la semana el btc quedo flojo, q mierda.",
      "7d con velas malas y poco empuje, gas.",
      "esta semana perdio nivel clave, paila ome.",
      "en 7d se ve bajista, una gonorrea.",
      "la semana no levanta ni a palo, feo feo.",
    ],
    neutral: [
      "en la semana ta en rango, sin mucha ciencia.",
      "7d y esto sigue empantanao, ni sube ni baja.",
      "la semanal ta neutra, toca esperar ombe.",
      "estos dias tan laterales, sin tanta maricada.",
      "en 7d no define tendencia, pero ai va.",
    ],
  },
  month: {
    positive: [
      "en el mes el btc se ve alcistta, hp va bien.",
      "30d y la estructura sigue bonita, nojoda.",
      "el mensual va por encima del soporte, fino.",
      "este mes a dejao maximos altos, se ve serio.",
      "30d con fuerza compradora, bien berraco eso.",
    ],
    negative: [
      "en el mes esto se ve jodido, q gonorrea.",
      "30d y el btc no puede recuperar, gas.",
      "el mensual quedo por debajo del nivel, paila.",
      "este mes ta bajista y medio vuelto mierda.",
      "30d con debilidad dura, feo ese asunto.",
    ],
    neutral: [
      "en el mes esto ta neutro, sin apuro.",
      "30d y el btc ta mas bien en rango.",
      "la mensual sigue tibia, toca paciencia.",
      "este mes no define gran cosa, ai vamos.",
      "30d tranquilongo, sin euforia ni paniko.",
    ],
  },
};
const catanoTweetCompactVibes = {
  positive: ["se ve fuerte.", "buen pulso ai.", "ta alcistta.", "va con fuerza.", "se ve serio."],
  negative: ["se ve paila.", "gas esa vuelta.", "ta flojito.", "muy feito eso.", "toca aguantar."],
  neutral: ["toca mirar.", "ta lateral.", "sin afan.", "ai va ai va.", "esperar nomas."],
};

function parseCandle(kline) {
  return {
    time: Number(kline[0]),
    open: Number(kline[1]),
    high: Number(kline[2]),
    low: Number(kline[3]),
    close: Number(kline[4]),
    volume: Number(kline[5]),
  };
}

async function loadCandles() {
  const preset = rangePresets[state.range];
  setConnection("loading", `Cargando ${preset.label}`);

  state.interval = preset.interval || "1d";
  state.liveChart = preset.provider === "binance";

  if (preset.provider === "binance") {
    state.candles = await loadBinanceCandles(preset);
  } else {
    try {
      state.candles = await loadCoinGeckoCandles(preset);
    } catch (error) {
      console.warn(error);
      state.candles = await loadBinanceCandles({
        ...preset,
        provider: "binance",
        interval: "1w",
        days: preset.all ? 3650 : preset.days,
      });
    }
  }

  state.offsetFromRight = 0;
  state.visibleCount = Math.max(1, state.candles.length);
  updatePrice();
  draw();
}

async function loadBinanceCandles(preset) {
  const startTime = Date.now() - preset.days * dayMs;
  let nextStartTime = startTime;
  const candles = [];

  while (nextStartTime < Date.now()) {
    const url = new URL(BINANCE_REST);
    url.searchParams.set("symbol", symbol.toUpperCase());
    url.searchParams.set("interval", preset.interval);
    url.searchParams.set("limit", "1000");
    url.searchParams.set("startTime", String(Math.floor(nextStartTime)));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`No se pudo cargar Binance (${response.status})`);
    }

    const batch = await response.json();
    if (!batch.length) {
      break;
    }

    candles.push(...batch.map(parseCandle));
    const lastOpenTime = Number(batch.at(-1)[0]);
    nextStartTime = lastOpenTime + 1;

    if (batch.length < 1000) {
      break;
    }
  }

  return dedupeCandles(candles);
}

async function loadCoinGeckoCandles(preset) {
  const now = Date.now();
  const from = preset.all ? bitcoinStartTime : now - preset.days * dayMs;
  const url = new URL(COINGECKO_RANGE);
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("from", String(Math.floor(from / 1000)));
  url.searchParams.set("to", String(Math.floor(now / 1000)));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo cargar histórico (${response.status})`);
  }

  const data = await response.json();
  return aggregatePricesToCandles(data.prices || [], preset.bucketDays * dayMs);
}

function aggregatePricesToCandles(prices, bucketSize) {
  const buckets = new Map();

  prices.forEach(([timestamp, price]) => {
    const bucketTime = Math.floor(timestamp / bucketSize) * bucketSize;
    const bucket = buckets.get(bucketTime);

    if (!bucket) {
      buckets.set(bucketTime, {
        time: bucketTime,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: 0,
      });
      return;
    }

    bucket.high = Math.max(bucket.high, price);
    bucket.low = Math.min(bucket.low, price);
    bucket.close = price;
  });

  return [...buckets.values()].sort((a, b) => a.time - b.time);
}

function dedupeCandles(candles) {
  return [...new Map(candles.map((candle) => [candle.time, candle])).values()].sort(
    (a, b) => a.time - b.time,
  );
}

function connectSocket() {
  clearTimeout(state.reconnectTimer);
  if (state.socket) {
    state.socket.removeEventListener("close", scheduleReconnect);
    state.socket.close(1000, "Changing stream");
  }

  const stream = state.liveChart ? `${symbol}@kline_${state.interval}` : `${symbol}@ticker`;
  state.socket = new WebSocket(`${BINANCE_WS}/${stream}`);
  state.socket.addEventListener("open", () => setConnection("live", "En vivo"));
  state.socket.addEventListener("message", handleSocketMessage);
  state.socket.addEventListener("close", scheduleReconnect);
  state.socket.addEventListener("error", () => {
    setConnection("error", "Reconectando");
    state.socket?.close();
  });
}

function scheduleReconnect() {
  setConnection("error", "Reconectando");
  clearTimeout(state.reconnectTimer);
  state.reconnectTimer = setTimeout(connectSocket, 2500);
}

function handleSocketMessage(event) {
  const message = JSON.parse(event.data);
  if (!message.k) {
    handleTickerMessage(message);
    return;
  }

  const kline = message.k;
  const candle = {
    time: kline.t,
    open: Number(kline.o),
    high: Number(kline.h),
    low: Number(kline.l),
    close: Number(kline.c),
    volume: Number(kline.v),
  };

  const lastIndex = state.candles.length - 1;
  if (state.candles[lastIndex]?.time === candle.time) {
    state.candles[lastIndex] = candle;
  } else {
    state.candles.push(candle);
    state.candles = state.candles.slice(-1000);
  }

  updatePrice();
  draw();
}

function handleTickerMessage(message) {
  const price = Number(message.c);

  if (!Number.isFinite(price)) {
    return;
  }

  currentPriceElement.textContent = formatCurrency.format(price);
  state.lastClose = price;
  updatePurchaseSummary();
  updateUsdCopBadge();
  updateUsdCopTrendNote();

  if (!state.liveChart) {
    updateRangeReturn();
  }

}

function setConnection(type, text) {
  connectionDot.className = `dot ${type === "live" ? "live" : type === "error" ? "error" : ""}`;
  connectionStatus.textContent = text;
}

function updatePrice() {
  const last = state.candles.at(-1);

  if (!last) {
    return;
  }

  currentPriceElement.textContent = formatCurrency.format(last.close);
  if (heroCurrentPriceElement) {
    heroCurrentPriceElement.textContent = formatCurrency.format(last.close);
  }
  updateHeroCopPrice();
  updateUsdCopBadge();
  updateUsdCopTrendNote();

  state.lastClose = last.close;
  initializeSimulationPrice();
  updatePurchaseSummary();
}

async function loadUsdCopRate() {
  const storedRate = readStoredUsdCopRate();
  if (storedRate) {
    state.usdCop = Number(storedRate.rate);
    state.usdCopPrevious = Number.isFinite(storedRate.previousRate) ? Number(storedRate.previousRate) : null;
    updateHeroCopPrice();
    updateUsdCopBadge();
    updateUsdCopTrendNote();
    updatePurchaseSummary();
  }

  try {
    const response = await fetch(USD_COP_RATE, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`No se pudo cargar USD/COP (${response.status})`);
    }

    const data = await response.json();
    const rate = Number(data.rates?.COP);
    const updatedAt = data.time_last_update_utc
      ? new Date(data.time_last_update_utc).toISOString()
      : new Date().toISOString();

    if (Number.isFinite(rate) && rate > 0) {
      let previousRate = Number.isFinite(storedRate?.previousRate) ? Number(storedRate.previousRate) : null;
      let previousUpdatedAt = storedRate?.previousUpdatedAt || null;

      if (Number.isFinite(storedRate?.rate) && storedRate.rate > 0 && storedRate?.updatedAt) {
        const storedDayKey = getBogotaDateKey(storedRate.updatedAt);
        const nextDayKey = getBogotaDateKey(updatedAt);

        if (storedDayKey && nextDayKey && storedDayKey !== nextDayKey) {
          previousRate = Number(storedRate.rate);
          previousUpdatedAt = storedRate.updatedAt;
        }
      }

      state.usdCop = rate;
      state.usdCopPrevious = previousRate;
      updateHeroCopPrice();
      updateUsdCopBadge();
      updateUsdCopTrendNote();
      localStorage.setItem(
        usdCopStorageKey,
        JSON.stringify({
          rate,
          updatedAt,
          previousRate,
          previousUpdatedAt,
        }),
      );
      updatePurchaseSummary();
    }
  } catch (error) {
    console.warn(error);
  }
}

function readStoredUsdCopRate() {
  try {
    const storedRate = JSON.parse(localStorage.getItem(usdCopStorageKey) || "null");
    if (Number.isFinite(storedRate?.rate) && storedRate.rate > 0) {
      return storedRate;
    }
  } catch {
    localStorage.removeItem(usdCopStorageKey);
  }

  return null;
}

function getBogotaDateKey(dateLike) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const dateParts = Object.fromEntries(
    bogotaDatePartsFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

function updateHeroCopPrice() {
  if (!heroCurrentPriceCopElement) {
    return;
  }

  heroCurrentPriceCopElement.textContent =
    Number.isFinite(state.lastClose) && Number.isFinite(state.usdCop)
      ? `Equivalente ${formatTableCop.format(state.lastClose * state.usdCop)} COP`
      : "Equivalente - COP";
}

function updateUsdCopBadge() {
  if (!priceChangeElement) {
    return;
  }

  priceChangeElement.textContent = Number.isFinite(state.usdCop)
    ? `Hoy el dolar está en $ ${formatUsdCopRate.format(state.usdCop)} COP`
    : "Hoy el dolar está en - COP";
  priceChangeElement.style.color = "var(--text-secondary)";
}

function updateUsdCopTrendNote() {
  if (!priceChangeNoteElement) {
    return;
  }

  if (!Number.isFinite(state.usdCop) || !Number.isFinite(state.usdCopPrevious)) {
    priceChangeNoteElement.textContent = "Sin referencia frente a ayer.";
    priceChangeNoteElement.style.color = "var(--text-tertiary)";
    return;
  }

  const difference = state.usdCop - state.usdCopPrevious;
  const absoluteDifference = Math.round(Math.abs(difference));

  if (absoluteDifference === 0) {
    priceChangeNoteElement.textContent = "Sigue igual que ayer hasta este momento.";
    priceChangeNoteElement.style.color = "var(--text-tertiary)";
    return;
  }

  const wentUp = difference > 0;
  priceChangeNoteElement.textContent = `${wentUp ? "Subió" : "Bajó"} $${formatUsdCopRate.format(absoluteDifference)} de ayer hasta este momento`;
  priceChangeNoteElement.style.color = wentUp ? "var(--green)" : "var(--red)";
}

function formatNewsTimestamp(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Ahora";
  }

  return new Intl.DateTimeFormat("es-CO", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getDailySeed(input) {
  const dateKey = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Bogota",
  }).format(new Date());

  return `${dateKey}-${input}`.split("").reduce((accumulator, character) => {
    return accumulator + character.charCodeAt(0);
  }, 0);
}

function pickBySeed(options, seed) {
  if (!Array.isArray(options) || !options.length) {
    return "";
  }

  return options[Math.abs(seed) % options.length];
}

function getMarketTone(percent) {
  if (percent > 0.75) {
    return "positive";
  }

  if (percent < -0.75) {
    return "negative";
  }

  return "neutral";
}

function formatSignedUsdAmount(value) {
  const absoluteLabel = formatTableUsd.format(Math.abs(value));
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${absoluteLabel}`;
}

function buildCatanoTweet(config, candles) {
  if (!Array.isArray(candles) || candles.length < 2) {
    return null;
  }

  const firstCandle = candles[0];
  const lastCandle = candles.at(-1);
  const startPrice = Number(firstCandle?.open || firstCandle?.close || 0);
  const endPrice = Number(lastCandle?.close || 0);

  if (!Number.isFinite(startPrice) || startPrice <= 0 || !Number.isFinite(endPrice) || endPrice <= 0) {
    return null;
  }

  const deltaUsd = endPrice - startPrice;
  const percent = (deltaUsd / startPrice) * 100;
  const tone = getMarketTone(percent);
  const seed = getDailySeed(`${config.id}-${Math.round(percent * 10)}`);
  const opener = pickBySeed(catanoTweetCompactComments[config.id]?.[tone], seed);
  const quickVibe = pickBySeed(catanoTweetCompactVibes[tone], seed + 7);

  return {
    id: config.id,
    tone,
    label: config.label,
    author: "Catano",
    handle: "@Catano",
    avatar: catanoAvatarPath,
    body: opener,
    vibe: quickVibe,
  };
}

function renderNewsPanel() {
  if (!newsListElement || !newsUpdatedAtElement) {
    return;
  }

  if (!state.newsItems.length) {
    newsListElement.innerHTML = `<div class="news-empty">Catano esta sin chisme por ahora.</div>`;
    newsUpdatedAtElement.textContent = "Sin feed";
    return;
  }

  if (newsTitleElement) {
    newsTitleElement.textContent = "Catano en vivo";
  }

  newsListElement.innerHTML = state.newsItems
    .map((item) => {
      const toneClass = item.tone || "neutral";
      const badgeLabel = item.label || "BTC";
      return `
        <article class="news-item tweet-card ${toneClass}">
          <div class="tweet-head">
            <img class="tweet-avatar" src="${item.avatar}" alt="${item.author}" />
            <div class="tweet-author">
              <strong>${item.author}</strong>
              <span>${item.handle} · ${badgeLabel}</span>
            </div>
            <span class="tweet-badge ${toneClass}">${badgeLabel}</span>
          </div>
          <p class="news-item-title">${item.body}</p>
          <span class="news-item-meta">${item.vibe || ""}</span>
        </article>
      `;
    })
    .join("");

  newsUpdatedAtElement.textContent = state.newsUpdatedAt
    ? `Feed ${formatNewsTimestamp(state.newsUpdatedAt)}`
    : "Feed ahora";
}

function readStoredNews() {
  try {
    const storedNews = JSON.parse(localStorage.getItem(newsStorageKey) || "null");
    if (storedNews?.version === 2 && Array.isArray(storedNews?.items) && storedNews.items.length) {
      return storedNews;
    }
  } catch {
    localStorage.removeItem(newsStorageKey);
  }

  return null;
}

async function loadBitcoinNews() {
  const storedNews = readStoredNews();
  if (storedNews && !state.newsItems.length) {
    state.newsItems = storedNews.items;
    state.newsUpdatedAt = storedNews.updatedAt || null;
    renderNewsPanel();
  }

  if (newsListElement && !state.newsItems.length) {
    newsListElement.innerHTML = `<div class="news-empty">Catano esta mirando el mercado...</div>`;
  }

  try {
    const feedResults = await Promise.allSettled(
      catanoFeedConfigs.map(async (config) => {
        const candles = await loadBinanceCandles({
          provider: "binance",
          interval: config.interval,
          days: config.days,
        });

        return buildCatanoTweet(config, candles);
      }),
    );

    state.newsItems = feedResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value)
      .filter(Boolean);
    state.newsUpdatedAt = new Date().toISOString();
    if (state.newsItems.length) {
      localStorage.setItem(
        newsStorageKey,
        JSON.stringify({
          version: 2,
          items: state.newsItems,
          updatedAt: state.newsUpdatedAt,
        }),
      );
    }
  } catch (error) {
    console.warn(error);
  }

  renderNewsPanel();
}

function initializeSimulationPrice() {
  if (!Number.isFinite(state.lastClose) || state.lastClose <= 0 || state.simulationPriceUsd !== null) {
    return;
  }

  setSimulationPrice(clampToSimulationStep(state.lastClose));
}

function resetSimulationToLivePrice() {
  state.simulationPriceUsd = null;

  if (Number.isFinite(state.lastClose) && state.lastClose > 0) {
    setSimulationPrice(state.lastClose);
    return;
  }

  if (simulationPriceRangeInput) {
    simulationPriceRangeInput.value = simulationPriceRangeInput.defaultValue;
  }

  updateSimulationPanel();
}

function clampToSimulationStep(value) {
  const min = Number(simulationPriceRangeInput?.min || 10000);
  const max = Number(simulationPriceRangeInput?.max || 300000);
  const step = Number(simulationPriceRangeInput?.step || 10000);
  const clampedValue = clamp(value, min, max);
  return Math.round(clampedValue / step) * step;
}

function setSimulationPrice(value) {
  const normalizedValue = clampToSimulationStep(Number(value) || 0);
  state.simulationPriceUsd = normalizedValue;

  if (simulationPriceRangeInput) {
    simulationPriceRangeInput.value = String(normalizedValue);
  }

  updateSimulationPanel();
}

function updateRangeReturn(visibleCandles = getVisibleCandles()) {
  if (!rangeReturnElement || visibleCandles.length < 2) {
    setRangeReturnNeutral();
    return;
  }

  const firstClose = visibleCandles[0].close;
  const lastClose = visibleCandles.at(-1).close;
  const amount = lastClose - firstClose;
  const percent = (amount / firstClose) * 100;
  const direction = amount > 0 ? "positive" : amount < 0 ? "negative" : "neutral";
  const arrow = amount > 0 ? "↗" : amount < 0 ? "↘" : "→";

  rangeReturnElement.className = `range-return ${direction}`;
  rangeReturnPercentElement.textContent = `${arrow} ${formatPercent(percent)}`;
  rangeReturnAmountElement.textContent = `${amount >= 0 ? "+" : ""}${formatCurrency.format(amount)}`;
  rangeReturnLabelElement.textContent = rangePresets[state.range]?.label || "Rango";
}

function setRangeReturnNeutral() {
  if (!rangeReturnElement) {
    return;
  }

  rangeReturnElement.className = "range-return neutral";
  rangeReturnPercentElement.textContent = "-";
  rangeReturnAmountElement.textContent = "-";
  rangeReturnLabelElement.textContent = rangePresets[state.range]?.label || "Rango";
}

function formatPercent(value) {
  return `${new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} %`;
}

function formatSignedNumber(value) {
  const formattedValue = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return value > 0 ? `+${formattedValue}` : formattedValue;
}

function getVisibleCandles() {
  const total = state.candles.length;
  const visibleCount = Math.min(state.visibleCount, total);
  const end = Math.max(visibleCount, total - state.offsetFromRight);
  const start = Math.max(0, end - visibleCount);
  return state.candles.slice(start, end);
}

function resizeCanvas() {
  const bounds = chartCanvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  chartCanvas.width = Math.floor(bounds.width * ratio);
  chartCanvas.height = Math.floor(bounds.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function draw() {
  resizeCanvas();

  const width = chartCanvas.clientWidth;
  const height = chartCanvas.clientHeight;
  const padding = { top: 26, right: 78, bottom: 34, left: 16 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const visibleCandles = getVisibleCandles();

  context.clearRect(0, 0, width, height);
  drawBackground(width, height, padding, plotWidth, plotHeight);

  if (!visibleCandles.length) {
    updateRangeReturn([]);
    drawEmptyState(width, height);
    return;
  }

  updateRangeReturn(visibleCandles);

  const prices = visibleCandles.flatMap((candle) => [candle.high, candle.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const pricePadding = (maxPrice - minPrice) * 0.08 || maxPrice * 0.01;
  const priceMin = minPrice - pricePadding;
  const priceMax = maxPrice + pricePadding;
  const candleWidth = plotWidth / visibleCandles.length;

  const xForIndex = (index) => padding.left + index * candleWidth + candleWidth / 2;
  const yForPrice = (price) =>
    padding.top + ((priceMax - price) / (priceMax - priceMin)) * plotHeight;

  drawPriceGrid(padding, plotWidth, plotHeight, priceMin, priceMax, yForPrice);
  drawCandles(visibleCandles, candleWidth, xForIndex, yForPrice);
  drawPurchases(visibleCandles, candleWidth, xForIndex, yForPrice, padding, plotHeight, plotWidth);
  drawCurrentPriceLine(width, padding, plotWidth, yForPrice);
  drawTimeAxis(visibleCandles, padding, plotWidth, plotHeight, xForIndex);
  drawSelectedReturn(visibleCandles, padding, plotWidth, plotHeight, xForIndex);
  drawCrosshair(visibleCandles, candleWidth, padding, plotWidth, plotHeight, xForIndex, yForPrice);
}

function drawBackground(width, height, padding, plotWidth, plotHeight) {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#fbfbfd");
  gradient.addColorStop(1, "#f5f5f7");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(29, 29, 31, 0.012)";
  context.fillRect(padding.left, padding.top, plotWidth, plotHeight);
}

function drawEmptyState(width, height) {
  context.fillStyle = "#6e6e73";
  context.textAlign = "center";
  context.font = `14px ${chartFont}`;
  context.fillText("Cargando gráfico BTC...", width / 2, height / 2);
}

function drawPriceGrid(padding, plotWidth, plotHeight, priceMin, priceMax, yForPrice) {
  context.save();
  context.setLineDash([]);
  context.strokeStyle = "rgba(29, 29, 31, 0.06)";
  context.fillStyle = "#86868b";
  context.font = `12px ${chartFont}`;
  context.textAlign = "left";
  context.textBaseline = "middle";

  for (let step = 0; step <= 9; step += 1) {
    const price = priceMin + ((priceMax - priceMin) / 9) * step;
    const y = yForPrice(price);
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(padding.left + plotWidth, y);
    context.stroke();
    context.fillText(formatCompactCurrency.format(price), padding.left + plotWidth + 10, y);
  }
  context.restore();
}

function drawCandles(visibleCandles, candleWidth, xForIndex, yForPrice) {
  const bodyWidth = Math.max(2, Math.min(8, candleWidth * 0.54));

  visibleCandles.forEach((candle, index) => {
    const x = xForIndex(index);
    const openY = yForPrice(candle.open);
    const closeY = yForPrice(candle.close);
    const highY = yForPrice(candle.high);
    const lowY = yForPrice(candle.low);
    const isUp = candle.close >= candle.open;
    const color = isUp ? "#1f7a52" : "#b43a45";

    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 1.15;
    context.beginPath();
    context.moveTo(x, highY);
    context.lineTo(x, lowY);
    context.stroke();
    context.fillRect(
      x - bodyWidth / 2,
      Math.min(openY, closeY),
      bodyWidth,
      Math.max(1, Math.abs(closeY - openY)),
    );
  });
}

function getVisiblePurchasesForChart(visibleCandles, xForIndex, yForPrice) {
  if (!state.purchases.length) {
    return [];
  }

  const firstTime = visibleCandles[0].time;
  const lastTime = visibleCandles.at(-1).time;
  const averageStep = visibleCandles.length > 1 ? visibleCandles[1].time - visibleCandles[0].time : 1;

  return state.purchases.flatMap((purchase) => {
    const purchaseTime = new Date(purchase.date).getTime();
    if (Number.isNaN(purchaseTime) || purchaseTime < firstTime || purchaseTime > lastTime) {
      return [];
    }

    const index = (purchaseTime - firstTime) / averageStep;
    const x = xForIndex(index);
    const price = Number.isFinite(Number(purchase.priceUsd)) && Number(purchase.priceUsd) > 0
      ? Number(purchase.priceUsd)
      : Number(findNearestClose(purchaseTime));
    const y = yForPrice(price);
    return [{ purchase, purchaseTime, x, y }];
  });
}

function drawPurchases(visibleCandles, candleWidth, xForIndex, yForPrice, padding, plotHeight, plotWidth) {
  const visiblePurchases = getVisiblePurchasesForChart(visibleCandles, xForIndex, yForPrice);
  if (!visiblePurchases.length) {
    return;
  }

  if (state.purchaseOverlayMode === "bands") {
    drawPurchaseBands(visiblePurchases, padding, plotHeight, plotWidth);
    return;
  }

  context.save();
  context.font = `700 11px ${chartFont}`;
  context.textAlign = "center";
  context.textBaseline = "bottom";

  visiblePurchases.forEach(({ x, y }) => {
    context.fillStyle = "#ff9f0a";
    context.strokeStyle = "rgba(255, 255, 255, 0.95)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x, y - 11);
    context.lineTo(x + 8, y + 7);
    context.lineTo(x - 8, y + 7);
    context.closePath();
    context.fill();
    context.stroke();
    context.fillText("Compra", x, y - 16);
  });
  context.restore();
}

function drawPurchaseBands(visiblePurchases, padding, plotHeight, plotWidth) {
  context.save();
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.font = `700 10px ${chartFont}`;

  visiblePurchases.forEach(({ y }) => {
    const left = padding.left;
    const right = padding.left + plotWidth;
    const bandHeight = 10;

    context.fillStyle = "rgba(255, 159, 10, 0.06)";
    context.fillRect(left, y - bandHeight / 2, plotWidth, bandHeight);

    context.strokeStyle = "rgba(255, 159, 10, 0.74)";
    context.lineWidth = 1.4;
    context.setLineDash([6, 6]);
    context.beginPath();
    context.moveTo(left, y);
    context.lineTo(right, y);
    context.stroke();

    context.setLineDash([]);
    context.fillStyle = "#ff9f0a";
    roundRect(left + 10, y - 9, 52, 18, 9);
    context.fill();
    context.fillStyle = "#ffffff";
    context.fillText("Compra", left + 18, y + 0.5);
  });
  context.restore();
}

function drawCurrentPriceLine(width, padding, plotWidth, yForPrice) {
  if (!state.lastClose) {
    return;
  }

  const y = yForPrice(state.lastClose);
  context.save();
  context.strokeStyle = "rgba(29, 29, 31, 0.22)";
  context.setLineDash([3, 6]);
  context.beginPath();
  context.moveTo(padding.left, y);
  context.lineTo(padding.left + plotWidth, y);
  context.stroke();

  context.setLineDash([]);
  context.fillStyle = "#1d1d1f";
  roundRect(width - padding.right + 5, y - 12, padding.right - 10, 24, 12);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = `700 11px ${chartFont}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(formatCompactCurrency.format(state.lastClose), width - padding.right / 2, y);
  context.restore();
}

function drawCrosshair(
  visibleCandles,
  candleWidth,
  padding,
  plotWidth,
  plotHeight,
  xForIndex,
  yForPrice,
) {
  if (state.hoverIndex === null || !visibleCandles[state.hoverIndex]) {
    return;
  }

  const candle = visibleCandles[state.hoverIndex];
  const x = xForIndex(state.hoverIndex);
  const y = yForPrice(candle.close);
  const chartBottom = padding.top + plotHeight;
  const priceLabel = formatCurrency.format(candle.close);
  const dateLabel = formatTooltipDate(candle.time);
  const axisDateLabel = formatAxisHoverDate(candle.time);

  context.save();
  context.strokeStyle = "rgba(29, 29, 31, 0.42)";
  context.lineWidth = 1;
  context.setLineDash([2, 5]);
  context.beginPath();
  context.moveTo(x, padding.top);
  context.lineTo(x, chartBottom);
  context.stroke();

  context.strokeStyle = "rgba(29, 29, 31, 0.12)";
  context.beginPath();
  context.moveTo(padding.left, y);
  context.lineTo(padding.left + plotWidth, y);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = candle.close >= candle.open ? "#1f7a52" : "#b43a45";
  context.beginPath();
  context.arc(x, y, Math.max(4, Math.min(6, candleWidth * 0.35)), 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 3;
  context.strokeStyle = "rgba(255, 255, 255, 0.95)";
  context.stroke();

  drawTooltipBox(x, y, priceLabel, dateLabel, padding, plotWidth);
  drawAxisDateLabel(x, chartBottom, axisDateLabel, padding, plotWidth);
  context.restore();
}

function drawSelectedReturn(visibleCandles, padding, plotWidth, plotHeight, xForIndex) {
  const selectedRange = state.selectionDraft;
  if (!selectedRange || visibleCandles.length < 2) {
    return;
  }

  const startIndex = findNearestVisibleIndex(visibleCandles, selectedRange.startTime);
  const endIndex = findNearestVisibleIndex(visibleCandles, selectedRange.endTime);
  if (startIndex === endIndex) {
    return;
  }

  const leftIndex = Math.min(startIndex, endIndex);
  const rightIndex = Math.max(startIndex, endIndex);
  const startCandle = visibleCandles[leftIndex];
  const endCandle = visibleCandles[rightIndex];
  const startX = xForIndex(leftIndex);
  const endX = xForIndex(rightIndex);
  const chartBottom = padding.top + plotHeight;
  const amount = endCandle.close - startCandle.close;
  const percent = (amount / startCandle.close) * 100;
  const isPositive = amount >= 0;
  const color = isPositive ? "#1f7a52" : "#b43a45";
  const rangeLabel = `${formatShortDate(startCandle.time)} - ${formatShortDate(endCandle.time)}`;
  const valueLabel = `${formatSignedNumber(amount)} (${formatPercent(percent)})`;

  context.save();
  context.fillStyle = isPositive ? "rgba(31, 122, 82, 0.045)" : "rgba(180, 58, 69, 0.045)";
  context.fillRect(startX, padding.top, endX - startX, plotHeight);

  context.strokeStyle = "rgba(29, 29, 31, 0.38)";
  context.lineWidth = 1;
  context.setLineDash([2, 5]);
  [startX, endX].forEach((x) => {
    context.beginPath();
    context.moveTo(x, padding.top);
    context.lineTo(x, chartBottom);
    context.stroke();
  });
  context.setLineDash([]);

  drawSelectionPoint(startX, chartBottom, color);
  drawSelectionPoint(endX, chartBottom, color);
  drawSelectionTooltip((startX + endX) / 2, padding.top + 10, valueLabel, rangeLabel, color, padding, plotWidth);
  context.restore();
}

function drawSelectionPoint(x, chartBottom, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, chartBottom - 4, 4.5, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = "rgba(255, 255, 255, 0.96)";
  context.stroke();
}

function drawSelectionTooltip(x, y, valueLabel, dateLabel, color, padding, plotWidth) {
  context.font = `600 12px ${chartFont}`;
  const width = Math.max(context.measureText(valueLabel).width, context.measureText(dateLabel).width) + 22;
  const height = 48;
  const boxX = clamp(x - width / 2, padding.left + 4, padding.left + plotWidth - width - 4);

  context.shadowColor = "rgba(0, 0, 0, 0.12)";
  context.shadowBlur = 18;
  context.shadowOffsetY = 8;
  context.fillStyle = "rgba(255, 255, 255, 0.96)";
  roundRect(boxX, y, width, height, 9);
  context.fill();
  context.shadowColor = "transparent";
  context.strokeStyle = "rgba(29, 29, 31, 0.08)";
  context.stroke();

  context.fillStyle = color;
  context.textAlign = "left";
  context.textBaseline = "top";
  context.font = `600 12px ${chartFont}`;
  context.fillText(valueLabel, boxX + 11, y + 8);

  context.fillStyle = "#6e6e73";
  context.font = `12px ${chartFont}`;
  context.fillText(dateLabel, boxX + 11, y + 27);
}

function findNearestVisibleIndex(visibleCandles, time) {
  return visibleCandles.reduce((nearestIndex, candle, index) => {
    const currentDistance = Math.abs(candle.time - time);
    const nearestDistance = Math.abs(visibleCandles[nearestIndex].time - time);
    return currentDistance < nearestDistance ? index : nearestIndex;
  }, 0);
}

function formatShortDate(time) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(time);
}

function drawTooltipBox(x, y, priceLabel, dateLabel, padding, plotWidth) {
  context.font = `600 12px ${chartFont}`;
  const width = Math.max(context.measureText(priceLabel).width, context.measureText(dateLabel).width) + 24;
  const height = 48;
  const boxX = clamp(x - width / 2, padding.left + 4, padding.left + plotWidth - width - 4);
  const boxY = Math.max(padding.top + 8, y - height - 18);

  context.shadowColor = "rgba(0, 0, 0, 0.12)";
  context.shadowBlur = 18;
  context.shadowOffsetY = 8;
  context.fillStyle = "rgba(255, 255, 255, 0.94)";
  roundRect(boxX, boxY, width, height, 9);
  context.fill();
  context.shadowColor = "transparent";

  context.strokeStyle = "rgba(29, 29, 31, 0.08)";
  context.stroke();

  context.fillStyle = "#1d1d1f";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.font = `600 12px ${chartFont}`;
  context.fillText(priceLabel, boxX + 12, boxY + 8);

  context.fillStyle = "#6e6e73";
  context.font = `12px ${chartFont}`;
  context.fillText(dateLabel, boxX + 12, boxY + 27);
}

function drawAxisDateLabel(x, chartBottom, dateLabel, padding, plotWidth) {
  context.font = `11px ${chartFont}`;
  const width = context.measureText(dateLabel).width + 18;
  const height = 22;
  const boxX = clamp(x - width / 2, padding.left + 2, padding.left + plotWidth - width - 2);
  const boxY = chartBottom + 6;

  context.fillStyle = "#f5f5f7";
  roundRect(boxX, boxY, width, height, 8);
  context.fill();
  context.strokeStyle = "rgba(29, 29, 31, 0.08)";
  context.stroke();

  context.fillStyle = "#6e6e73";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(dateLabel, boxX + width / 2, boxY + height / 2);
}

function formatTooltipDate(time) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(time);
}

function formatAxisHoverDate(time) {
  return new Intl.DateTimeFormat("es-CO", {
    month: "short",
    year: "numeric",
  }).format(time);
}

function drawTimeAxis(visibleCandles, padding, plotWidth, plotHeight, xForIndex) {
  context.save();
  context.fillStyle = "#86868b";
  context.font = `11px ${chartFont}`;
  context.textAlign = "center";
  context.textBaseline = "top";

  const ticks = 5;
  for (let step = 0; step <= ticks; step += 1) {
    const index = Math.min(
      visibleCandles.length - 1,
      Math.floor((visibleCandles.length - 1) * (step / ticks)),
    );
    const candle = visibleCandles[index];
    const x = xForIndex(index);
    const label = new Intl.DateTimeFormat("es-CO", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(candle.time);
    context.fillText(label, x, padding.top + plotHeight + 12);
  }
  context.restore();
}

function roundRect(x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function findNearestClose(time) {
  return state.candles.reduce((nearest, candle) => {
    return Math.abs(candle.time - time) < Math.abs(nearest.time - time) ? candle : nearest;
  }, state.candles[0]).close;
}

updatePurchaseSummary = function () {
  const totalSpentUsd = sumFinite(state.purchases.map(getPurchaseCostUsd));
  const totalSpent = totalSpentUsd !== null && state.usdCop ? totalSpentUsd * state.usdCop : null;
  const totalBtc = state.purchases.reduce((sum, purchase) => sum + Number(purchase.btc || 0), 0);
  const currentValueUsd = state.lastClose ? totalBtc * state.lastClose : null;
  const currentValueCop =
    currentValueUsd !== null && state.usdCop ? currentValueUsd * state.usdCop : null;
  const profitCop = currentValueCop !== null && totalSpent !== null ? currentValueCop - totalSpent : null;
  const profitUsd =
    currentValueUsd !== null && totalSpentUsd !== null ? currentValueUsd - totalSpentUsd : null;
  const profitPercent = profitUsd !== null && totalSpentUsd ? (profitUsd / totalSpentUsd) * 100 : null;

  purchaseCountElement.textContent = state.summaryMasked
    ? getMaskedSummaryText()
    : String(state.purchases.length);
  totalSpentElement.innerHTML = state.summaryMasked
    ? formatMaskedKpiMoney("COP")
    : Number.isFinite(totalSpent)
      ? formatKpiMoney(totalSpent, formatTableCop, "COP")
      : "-";
  totalSpentUsdElement.innerHTML = state.summaryMasked
    ? `Equivalente ${getMaskedSummaryText()} USD`
    : totalSpentUsd !== null
      ? `Equivalente ${formatKpiInlineMoney(totalSpentUsd, formatTableUsd, "USD")}`
      : "Equivalente - USD";
  totalBtcElement.textContent = state.summaryMasked
    ? getMaskedSummaryText(8)
    : formatBtc.format(totalBtc);
  if (totalValueElement && totalValueUsdElement) {
    totalValueElement.innerHTML = state.summaryMasked
      ? formatMaskedKpiMoney("COP")
      : Number.isFinite(currentValueCop)
        ? formatKpiMoney(currentValueCop, formatTableCop, "COP")
        : "-";
    totalValueUsdElement.innerHTML = state.summaryMasked
      ? `Equivalente ${getMaskedSummaryText()} USD`
      : Number.isFinite(currentValueUsd)
        ? `Equivalente ${formatKpiInlineMoney(currentValueUsd, formatTableUsd, "USD")}`
        : "Equivalente - USD";
  }
  updateProfitCard(profitCop, profitUsd, profitPercent);
  updateSimulationPanel();
  renderPurchaseList();
};

updateProfitCard = function (profitCop, profitUsd, profitPercent) {
  if (!totalProfitCopElement || !totalProfitUsdElement) {
    return;
  }

  const profitClass = !Number.isFinite(profitCop)
    ? ""
    : profitCop >= 0
      ? "positive-value"
      : "negative-value";

  totalProfitCopElement.className = profitClass;
  totalProfitCopElement.innerHTML = state.summaryMasked
    ? formatMaskedKpiMoney("COP")
    : Number.isFinite(profitCop)
      ? formatKpiMoney(profitCop, formatTableCop, "COP", true)
      : "-";

  const profitUsdLabel = state.summaryMasked
    ? `${getMaskedSummaryText()} USD`
    : Number.isFinite(profitUsd)
      ? formatKpiInlineMoney(profitUsd, formatTableUsd, "USD", true)
      : "- USD";

  const profitPercentLabel = state.summaryMasked
    ? `${getMaskedSummaryText()} %`
    : Number.isFinite(profitPercent)
      ? formatSignedPercent(profitPercent)
      : "- %";

  totalProfitUsdElement.className = profitClass;
  totalProfitUsdElement.textContent = `${profitUsdLabel} · ${profitPercentLabel}`;
};
function formatKpiMoney(value, formatter, currencyCode, showSign = false) {
  return `<span class="kpi-money">${formatMetricNumber(value, formatter, showSign)}<em>${currencyCode}</em></span>`;
}

function formatKpiInlineMoney(value, formatter, currencyCode, showSign = false) {
  return `${formatMetricNumber(value, formatter, showSign)} ${currencyCode}`;
}

function getMaskedSummaryText(length = 4) {
  return "*".repeat(length);
}

function formatMaskedKpiMoney(currencyCode, length = 4) {
  return `<span class="kpi-money">${getMaskedSummaryText(length)}<em>${currencyCode}</em></span>`;
}

function updateSummaryVisibilityButton() {
  if (!summaryVisibilityButton || !summaryVisibilityIcon || !summaryVisibilityLabel) {
    return;
  }

  summaryVisibilityButton.classList.toggle("is-masked", state.summaryMasked);
  summaryVisibilityButton.setAttribute("aria-pressed", String(state.summaryMasked));
  summaryVisibilityButton.setAttribute(
    "aria-label",
    state.summaryMasked ? "Mostrar cifras del resumen" : "Ocultar cifras del resumen",
  );
  summaryVisibilityIcon.textContent = state.summaryMasked ? "O" : "O";
  summaryVisibilityLabel.textContent = state.summaryMasked ? "Mostrar cifras" : "Ocultar cifras";
}

function restoreSummaryVisibility() {
  state.summaryMasked = localStorage.getItem(summaryVisibilityStorageKey) === "true";
  updateSummaryVisibilityButton();
}

function getPortfolioMetrics(simulatedBtcUsd = state.lastClose) {
  const totalSpentUsd = sumFinite(state.purchases.map(getPurchaseCostUsd));
  const totalSpentCop = totalSpentUsd !== null && state.usdCop ? totalSpentUsd * state.usdCop : null;
  const totalBtc = state.purchases.reduce((sum, purchase) => sum + Number(purchase.btc || 0), 0);
  const breakEvenPriceUsd = totalSpentUsd !== null && totalBtc > 0 ? totalSpentUsd / totalBtc : null;
  const currentValueUsd = Number.isFinite(simulatedBtcUsd) ? totalBtc * simulatedBtcUsd : null;
  const currentValueCop =
    currentValueUsd !== null && state.usdCop ? currentValueUsd * state.usdCop : null;
  const profitUsd =
    currentValueUsd !== null && totalSpentUsd !== null ? currentValueUsd - totalSpentUsd : null;
  const profitCop = profitUsd !== null && state.usdCop ? profitUsd * state.usdCop : null;
  const profitPercent = profitUsd !== null && totalSpentUsd ? (profitUsd / totalSpentUsd) * 100 : null;

  return {
    totalSpentUsd,
    totalSpentCop,
    totalBtc,
    breakEvenPriceUsd,
    currentValueUsd,
    currentValueCop,
    profitUsd,
    profitCop,
    profitPercent,
  };
}

function updateSimulationPanel() {
  if (
    !simulationCurrentPriceUsdElement ||
    !simulationCurrentPriceCopElement ||
    !simulationTargetPriceUsdElement ||
    !simulationTargetPriceCopElement ||
    !simulationDeltaBadgeElement ||
    !simulationScenarioHintElement ||
    !simulationValueCopElement ||
    !simulationValueUsdElement ||
    !simulationProfitCopElement ||
    !simulationProfitUsdElement ||
    !simulationBanterPanelElement ||
    !simulationBanterTextElement ||
    !simulationBanterSubtextElement
  ) {
    return;
  }

  const currentPriceUsd = Number.isFinite(state.lastClose) ? state.lastClose : null;
  const currentPriceCop = currentPriceUsd !== null && state.usdCop ? currentPriceUsd * state.usdCop : null;
  const targetPriceUsd = Number.isFinite(state.simulationPriceUsd)
    ? state.simulationPriceUsd
    : currentPriceUsd;
  const targetPriceCop = targetPriceUsd !== null && state.usdCop ? targetPriceUsd * state.usdCop : null;
  const metrics = getPortfolioMetrics(targetPriceUsd);
  const profitClass = !Number.isFinite(metrics.profitCop)
    ? ""
    : metrics.profitCop >= 0
      ? "positive-value"
      : "negative-value";
  const deltaUsd =
    Number.isFinite(targetPriceUsd) && Number.isFinite(currentPriceUsd)
      ? targetPriceUsd - currentPriceUsd
      : null;
  const deltaPercent =
    Number.isFinite(deltaUsd) && currentPriceUsd
      ? (deltaUsd / currentPriceUsd) * 100
      : null;
  const deltaClass = !Number.isFinite(deltaUsd)
    ? "neutral"
    : deltaUsd > 0
      ? "positive"
      : deltaUsd < 0
        ? "negative"
        : "neutral";

  simulationCurrentPriceUsdElement.textContent = currentPriceUsd !== null
    ? `${formatTableUsd.format(currentPriceUsd)} USD`
    : "-";
  simulationCurrentPriceCopElement.textContent = currentPriceCop !== null
    ? `${formatTableCop.format(currentPriceCop)} COP`
    : "-";
  simulationTargetPriceUsdElement.textContent = targetPriceUsd !== null
    ? `${formatTableUsd.format(targetPriceUsd)} USD`
    : "-";
  simulationTargetPriceCopElement.textContent = targetPriceCop !== null
    ? `${formatTableCop.format(targetPriceCop)} COP`
    : "-";

  simulationDeltaBadgeElement.className = `simulation-delta-badge ${deltaClass}`;
  simulationDeltaBadgeElement.textContent = Number.isFinite(deltaUsd)
    ? `${deltaUsd > 0 ? "▲" : deltaUsd < 0 ? "▼" : "•"} ${formatTableUsd.format(Math.abs(deltaUsd))} ${deltaUsd === 0 ? "igual" : formatPercent(Math.abs(deltaPercent)).replace(" %", "%")}`
    : "Sin cambio";
  simulationScenarioHintElement.textContent = Number.isFinite(deltaUsd)
    ? deltaUsd > 0
      ? "Escenario alcista: este precio esta por encima del BTC actual."
      : deltaUsd < 0
        ? "Escenario conservador: este precio esta por debajo del BTC actual."
        : "Estas simulando exactamente el precio actual del Bitcoin."
    : "Ajusta el precio objetivo para simular tu proximo escenario.";

  simulationPanelElement?.classList.remove("is-winning", "is-losing", "is-neutral");
  simulationTargetCardElement?.classList.remove("is-winning", "is-losing", "is-neutral");
  simulationValueCardElement?.classList.remove("positive-glow", "negative-glow");
  simulationProfitCardElement?.classList.remove("positive-glow", "negative-glow");
  if (profitClass === "positive-value") {
    simulationPanelElement?.classList.add("is-winning");
    simulationTargetCardElement?.classList.add("is-winning");
    simulationValueCardElement?.classList.add("positive-glow");
    simulationProfitCardElement?.classList.add("positive-glow");
  } else if (profitClass === "negative-value") {
    simulationPanelElement?.classList.add("is-losing");
    simulationTargetCardElement?.classList.add("is-losing");
    simulationValueCardElement?.classList.add("negative-glow");
    simulationProfitCardElement?.classList.add("negative-glow");
  } else {
    simulationPanelElement?.classList.add("is-neutral");
    simulationTargetCardElement?.classList.add("is-neutral");
  }

  simulationValueCopElement.className = profitClass;
  simulationValueCopElement.textContent = Number.isFinite(metrics.currentValueCop)
    ? `${formatTableCop.format(metrics.currentValueCop)} COP`
    : "-";
  simulationValueUsdElement.textContent = Number.isFinite(metrics.currentValueUsd)
    ? `Equivalente ${formatTableUsd.format(metrics.currentValueUsd)} USD`
    : "Equivalente - USD";

  simulationProfitCopElement.className = profitClass;
  simulationProfitCopElement.textContent = Number.isFinite(metrics.profitCop)
    ? `${metrics.profitCop >= 0 ? "+" : "-"}${formatTableCop.format(Math.abs(metrics.profitCop))} COP`
    : "-";
  simulationProfitUsdElement.textContent = Number.isFinite(metrics.profitUsd)
    ? `${metrics.profitUsd >= 0 ? "+" : "-"}${formatTableUsd.format(Math.abs(metrics.profitUsd))} USD · ${formatSignedPercent(metrics.profitPercent)}`
    : "-";
  if (simulationEquilibriumMarkerElement && simulationPriceRangeInput) {
    const min = Number(simulationPriceRangeInput.min || 10000);
    const max = Number(simulationPriceRangeInput.max || 300000);
    if (Number.isFinite(metrics.breakEvenPriceUsd) && max > min) {
      const clampedBreakEven = clamp(metrics.breakEvenPriceUsd, min, max);
      const trackWidth = simulationPriceRangeInput.clientWidth || 0;
      const thumbSize = 26;
      const usableWidth = Math.max(trackWidth - thumbSize, 0);
      const ratio = (clampedBreakEven - min) / (max - min);
      const positionPx =
        simulationPriceRangeInput.offsetLeft + thumbSize / 2 + usableWidth * ratio;
      simulationEquilibriumMarkerElement.hidden = false;
      simulationEquilibriumMarkerElement.style.left = `${positionPx}px`;
      simulationEquilibriumMarkerElement.title = `Punto de equilibrio: ${formatTableUsd.format(metrics.breakEvenPriceUsd)} USD`;
    } else {
      simulationEquilibriumMarkerElement.hidden = true;
    }
  }

  updateSimulationBanter({ deltaUsd, currentPriceUsd, targetPriceUsd, metrics });
}

function updateSimulationBanter({ deltaUsd, currentPriceUsd, targetPriceUsd, metrics }) {
  const tone = Number.isFinite(metrics.profitUsd)
    ? metrics.profitUsd > 0
      ? "positive"
      : metrics.profitUsd < 0
        ? "negative"
        : "neutral"
    : "neutral";
  const source =
    tone === "positive"
      ? simulationPositiveBanter
      : tone === "negative"
        ? simulationNegativeBanter
        : simulationNeutralBanter;
  const message = source[Math.floor(Math.random() * source.length)];
  const relativeText = Number.isFinite(deltaUsd)
    ? deltaUsd > 0
      ? "Si BTC llega a ese precio, el portafolio se te pone modo fiesta."
      : deltaUsd < 0
        ? "Si BTC cae hasta ahi, prepara el corazon porque el golpe se siente."
        : "Estas exacto sobre el precio actual, asi que todo queda quietico."
    : "Mueve el precio y te tiro la reaccion del mercado.";

  simulationBanterPanelElement.className = `simulation-banter ${tone}`;
  simulationBanterTextElement.textContent = message;
  simulationBanterSubtextElement.textContent = relativeText;
  simulationBanterPanelElement.classList.remove("is-refreshing");
  void simulationBanterPanelElement.offsetWidth;
  simulationBanterPanelElement.classList.add("is-refreshing");
}

async function loadPurchases() {
  if (!state.activeProfileId) {
    state.purchases = [];
    updatePurchaseSummary();
    return;
  }

  let serverPurchases = [];
  let canSyncSharedPurchases = true;

  try {
    serverPurchases = await fetchProfilePurchases(state.activeProfileId);
  } catch (error) {
    canSyncSharedPurchases = false;
    console.warn("[btc-dashboard] No se pudo cargar el historial compartido, usando compras incluidas.", error);
  }

  const legacyPurchases = getLegacyPurchasesForProfile(state.activeProfileId);
  state.purchases = dedupePurchases(normalizePurchases([...serverPurchases, ...legacyPurchases]));

  if (legacyPurchases.length && canSyncSharedPurchases) {
    try {
      await replaceProfilePurchases(state.activeProfileId, state.purchases);
      clearLegacyPurchasesForProfile(state.activeProfileId);
    } catch (error) {
      console.warn("[btc-dashboard] No se pudo sincronizar el historial inicial al servidor.", error);
    }
  }

  updatePurchaseSummary();
}

async function fetchProfilePurchases(profileId) {
  const response = await fetch(`${purchasesApiBase}?profileId=${encodeURIComponent(profileId)}`, {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "No se pudo cargar el historial compartido");
  }

  const payload = await response.json();
  return Array.isArray(payload.purchases) ? payload.purchases : [];
}

async function replaceProfilePurchases(profileId, purchases) {
  const response = await fetch(`${purchasesApiBase}?profileId=${encodeURIComponent(profileId)}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ purchases }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "No se pudo sincronizar el historial de compras");
  }
}

async function createProfilePurchase(profileId, purchase) {
  const response = await fetch(`${purchasesApiBase}?profileId=${encodeURIComponent(profileId)}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ purchase }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "No se pudo guardar la compra");
  }

  const payload = await response.json();
  return payload.purchase;
}

async function removeProfilePurchase(profileId, purchaseId) {
  const response = await fetch(
    `${purchasesApiBase}?profileId=${encodeURIComponent(profileId)}&purchaseId=${encodeURIComponent(purchaseId)}`,
    {
      method: "DELETE",
      credentials: "same-origin",
    },
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "No se pudo eliminar la compra");
  }
}

function getBundledPurchasesForProfile(profileId) {
  return Array.isArray(profilePurchaseBundles?.[profileId]) ? profilePurchaseBundles[profileId] : [];
}

function getProfilePurchasesStorageKey(profileId) {
  return `${purchasesStorageKey}:${profileId}`;
}

function getLegacyPurchasesForProfile(profileId) {
  const profileLegacyKey = getProfilePurchasesStorageKey(profileId);
  const storedProfilePurchases = localStorage.getItem(profileLegacyKey);
  const legacyPayloads = [];

  if (storedProfilePurchases) {
    try {
      legacyPayloads.push(...JSON.parse(storedProfilePurchases));
    } catch {
      localStorage.removeItem(profileLegacyKey);
    }
  }

  if (profileId === "jesus") {
    const oldSharedPurchases = localStorage.getItem(purchasesStorageKey);
    if (oldSharedPurchases) {
      try {
        legacyPayloads.push(...JSON.parse(oldSharedPurchases));
      } catch {
        localStorage.removeItem(purchasesStorageKey);
      }
    }
  }

  return normalizePurchases([
    ...getBundledPurchasesForProfile(profileId),
    ...legacyPayloads,
  ]);
}

function clearLegacyPurchasesForProfile(profileId) {
  localStorage.removeItem(getProfilePurchasesStorageKey(profileId));
  if (profileId === "jesus") {
    localStorage.removeItem(purchasesStorageKey);
  }
}

function normalizePurchases(purchases) {
  if (!Array.isArray(purchases)) {
    return [];
  }

  return purchases
    .map((purchase) => ({
      id: purchase.id || createId(),
      date: purchase.date,
      btc: Number(purchase.btc),
      priceUsd: Number(purchase.priceUsd || purchase.purchaseBtcPriceUsd || purchase.usd || 0),
    }))
    .filter((purchase) => purchase.date && purchase.btc > 0 && purchase.priceUsd > 0);
}

function dedupePurchases(purchases) {
  const uniquePurchases = new Map();

  purchases.forEach((purchase) => {
    const purchaseKey = [
      purchase.date,
      Number(purchase.btc).toFixed(8),
      Number(purchase.priceUsd).toFixed(2),
    ].join("|");

    if (!uniquePurchases.has(purchaseKey)) {
      uniquePurchases.set(purchaseKey, purchase);
    }
  });

  return sortPurchasesByDateDesc(Array.from(uniquePurchases.values()));
}

function sortPurchasesByDateDesc(purchases) {
  return [...purchases].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return timeB - timeA;
  });
}

function createId() {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  return `purchase-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderPurchaseList() {
  if (!purchaseList) {
    return;
  }

  state.purchases = sortPurchasesByDateDesc(state.purchases);

  if (!state.purchases.length) {
    purchaseList.innerHTML = `<div class="purchase-empty">Todavía no hay compras registradas.</div>`;
    return;
  }

  purchaseList.innerHTML = `
    <div class="purchase-table-wrap">
      <table class="purchase-table">
        <thead>
          <tr>
            <th>Fecha de compra</th>
            <th>Precio de compra BTC</th>
            <th>Cantidad BTC</th>
            <th>Ganancia / pérdida</th>
            <th>Rentabilidad</th>
            <th>Valor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${state.purchases.map(renderPurchaseRow).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderPurchaseRow(purchase) {
  const metrics = calculatePurchaseMetrics(purchase);
  const profitClass = !Number.isFinite(metrics.profitCop)
    ? ""
    : metrics.profitCop >= 0
      ? "positive"
      : "negative";

  return `
    <tr>
      <td>${formatPurchaseDate(purchase.date)}</td>
      <td>${formatBtcPriceStack(metrics.purchaseBtcPriceUsd, metrics.purchaseBtcPriceCop)}</td>
      <td>${formatBtc.format(purchase.btc)}</td>
      <td class="${profitClass}">${formatMoneyStack(metrics.profitCop, metrics.profitUsd, true)}</td>
      <td class="${profitClass}">${formatSignedPercent(metrics.returnPercent)}</td>
      <td>${formatMoneyStack(metrics.currentValueCop, metrics.currentValueUsd)}</td>
      <td>
        <button class="purchase-delete" type="button" data-purchase-id="${purchase.id}" aria-label="Eliminar compra">X</button>
      </td>
    </tr>
  `;
}

function calculatePurchaseMetrics(purchase) {
  const currentBtcUsd = Number(state.lastClose || 0);
  const usdCop = Number(state.usdCop || 0);
  const costUsd = getPurchaseCostUsd(purchase);
  const purchaseBtcPriceUsd = Number(purchase.priceUsd || 0);
  const purchaseBtcPriceCop =
    purchaseBtcPriceUsd && usdCop ? purchaseBtcPriceUsd * usdCop : null;
  const currentValueUsd = currentBtcUsd ? purchase.btc * currentBtcUsd : null;
  const currentValueCop = currentValueUsd !== null && usdCop ? currentValueUsd * usdCop : null;
  const profitUsd = currentValueUsd !== null && costUsd !== null ? currentValueUsd - costUsd : null;
  const profitCop = profitUsd !== null && usdCop ? profitUsd * usdCop : null;
  const returnPercent = profitUsd !== null && costUsd ? (profitUsd / costUsd) * 100 : null;

  return {
    purchaseBtcPriceCop,
    purchaseBtcPriceUsd,
    currentValueUsd,
    currentValueCop,
    profitUsd,
    profitCop,
    returnPercent,
  };
}

function getPurchaseCostUsd(purchase) {
  if (Number.isFinite(purchase.priceUsd) && purchase.priceUsd > 0) {
    return purchase.priceUsd * purchase.btc;
  }

  return null;
}

function sumFinite(values) {
  const finiteValues = values.filter((value) => Number.isFinite(value));
  if (!finiteValues.length) {
    return null;
  }

  return finiteValues.reduce((sum, value) => sum + value, 0);
}

function formatBtcPriceStack(usdValue, copValue) {
  const usdLabel = Number.isFinite(usdValue) ? formatMetricNumber(usdValue, formatTableUsd, false) : "-";
  const copLabel = Number.isFinite(copValue) ? formatMetricNumber(copValue, formatTableCop, false) : "-";

  return `
    <span class="money-stack">
      <strong>${usdLabel}<em>USD</em></strong>
      <small>${copLabel}<em>COP</em></small>
    </span>
  `;
}

function formatMoneyStack(copValue, usdValue, showSign = false, showUsdSign = showSign) {
  const copLabel = formatMetricNumber(copValue, formatTableCop, showSign);
  const usdLabel = Number.isFinite(usdValue)
    ? formatMetricNumber(usdValue, formatTableUsd, showUsdSign)
    : "-";

  return `
    <span class="money-stack">
      <strong>${copLabel}<em>COP</em></strong>
      <small>${usdLabel}<em>USD</em></small>
    </span>
  `;
}

function formatUnitValue(value, formatter, currencyCode, showSign = false) {
  return `
    <span class="money-stack single">
      <strong>${formatMetricNumber(value, formatter, showSign)}<em>${currencyCode}</em></strong>
    </span>
  `;
}

function formatMetricNumber(value, formatter, showSign = true) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  const absoluteValue = Math.abs(value);
  const sign = showSign && value !== 0 ? (value > 0 ? "+" : "-") : "";
  return `${sign}${formatter.format(absoluteValue)}`;
}

function formatMetricCurrency(value, formatter, showSign = true) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  if (!showSign || value === 0) {
    return formatter.format(value);
  }

  return `${value > 0 ? "+" : ""}${formatter.format(value)}`;
}

function formatSignedPercent(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return `${value > 0 ? "↗ " : value < 0 ? "↘ " : ""}${formatPercent(value)}`;
}

function formatPurchaseDate(date) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

async function addPurchase(event) {
  event.preventDefault();

  if (!state.activeProfileId) {
    alert("Primero inicia sesión en un perfil para poder registrar compras.");
    return;
  }

  const btc = parseBtcValue(purchaseBtcInput.value);
  const date = purchaseDateInput.value;
  const priceUsd = parseMoneyValue(purchaseUsdInput.value);

  if (!btc || !date || !priceUsd) {
    alert("Revisa la compra: BTC, fecha y precio de compra deben tener valores válidos.");
    return;
  }

  try {
    const newPurchase = await createProfilePurchase(state.activeProfileId, {
      id: createId(),
      btc,
      date: new Date(`${date}T12:00:00`).toISOString(),
      priceUsd,
    });

    state.purchases = normalizePurchases([newPurchase, ...state.purchases]);
    updatePurchaseSummary();
    purchaseForm.reset();
    setDefaultPurchaseDate();
    draw();
  } catch (error) {
    alert(error.message || "No se pudo guardar la compra en el servidor.");
  }
}

function parseBtcValue(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return 0;
  }

  const compactValue = rawValue.replace(/\s/g, "").replace(",", ".");
  if (/^0+\d+$/.test(compactValue)) {
    const fractionalDigits = compactValue.replace(/^0+/, "").padStart(8, "0").slice(-8);
    return Number(`0.${fractionalDigits}`);
  }

  const parsedValue = Number(compactValue);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

function parseMoneyValue(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return 0;
  }

  const compactValue = rawValue.replace(/\s/g, "");
  const hasComma = compactValue.includes(",");
  const hasDot = compactValue.includes(".");

  if (hasComma && hasDot) {
    const lastComma = compactValue.lastIndexOf(",");
    const lastDot = compactValue.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    const normalizedValue = compactValue
      .replaceAll(thousandsSeparator, "")
      .replace(decimalSeparator, ".");
    const parsedValue = Number(normalizedValue);
    return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
  }

  if (hasComma) {
    const normalizedValue = compactValue.replace(",", ".");
    const parsedValue = Number(normalizedValue);
    return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
  }

  const parsedValue = Number(compactValue);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

async function deletePurchase(id) {
  try {
    await removeProfilePurchase(state.activeProfileId, id);
    state.purchases = state.purchases.filter((purchase) => purchase.id !== id);
    updatePurchaseSummary();
    draw();
  } catch (error) {
    alert(error.message || "No se pudo eliminar la compra del servidor.");
  }
}

function openDeletePurchaseModal(id) {
  state.pendingDeletePurchaseId = id;

  if (!deletePurchaseModal) {
    deletePurchase(id);
    return;
  }

  if (typeof deletePurchaseModal.showModal === "function") {
    deletePurchaseModal.showModal();
    return;
  }

  const shouldDelete = window.confirm("¿Deseas borrar esta mierda?");
  if (shouldDelete) {
    deletePurchase(id);
  }
  state.pendingDeletePurchaseId = null;
}

function closeDeletePurchaseModal() {
  state.pendingDeletePurchaseId = null;
  deletePurchaseModal?.close();
}

function confirmDeletePurchase() {
  if (state.pendingDeletePurchaseId) {
    deletePurchase(state.pendingDeletePurchaseId);
  }
  closeDeletePurchaseModal();
}

function openSimulationModal() {
  if (!simulationModal || typeof simulationModal.showModal !== "function") {
    return;
  }

  if (simulationModal.open) {
    return;
  }

  resetSimulationToLivePrice();
  simulationModal.showModal();
  requestAnimationFrame(() => updateSimulationPanel());
  document.body.classList.add("simulation-modal-open");
  openSimulationModalButton?.classList.add("active");
  openSimulationModalButton?.setAttribute("aria-pressed", "true");
}

function closeSimulationModal() {
  if (simulationModal?.open) {
    simulationModal.close();
  }

  document.body.classList.remove("simulation-modal-open");
  openSimulationModalButton?.classList.remove("active");
  openSimulationModalButton?.setAttribute("aria-pressed", "false");
}

function updateActiveView() {
  viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.viewTarget === state.activeView);
  });

  viewPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.viewPanel === state.activeView);
  });
}

function setProfileAuthFeedback(message, tone = "") {
  if (!profileAuthFeedback) {
    return;
  }

  profileAuthFeedback.textContent = message;
  profileAuthFeedback.classList.toggle("is-empty", !message);
  profileAuthFeedback.classList.remove("is-error", "is-success");
  if (tone) {
    profileAuthFeedback.classList.add(tone);
  }
}

function updateProfileAuthUI() {
  const pendingProfile = profileCatalog[state.pendingProfileId] || null;
  const hasPendingProfile = Boolean(pendingProfile);
  profileAuthForm?.classList.toggle("is-visible", hasPendingProfile);

  if (profileAuthLabel) {
    profileAuthLabel.textContent = hasPendingProfile ? `Perfil: ${pendingProfile.name}` : "Selecciona un perfil";
  }

  if (profileAuthTitle) {
    profileAuthTitle.textContent = hasPendingProfile
      ? `Ingresa la contraseña de ${pendingProfile.name}`
      : "Ingresa la contraseña del perfil";
  }

  if (profilePasswordInput) {
    profilePasswordInput.disabled = !hasPendingProfile;
    profilePasswordInput.placeholder = "Contraseña";
    profilePasswordInput.setAttribute(
      "aria-label",
      hasPendingProfile ? `Contraseña de ${pendingProfile.name}` : "Contraseña",
    );
    if (!hasPendingProfile) {
      profilePasswordInput.value = "";
    }
  }

  if (profilePasswordSubmit) {
    profilePasswordSubmit.disabled = !hasPendingProfile;
  }

  if (!hasPendingProfile) {
    setProfileAuthFeedback("");
  }
}

function openProfileSwitcher() {
  state.profileGateVisible = true;
  state.pendingProfileId = null;
  if (profilePasswordInput) {
    profilePasswordInput.value = "";
  }
  setProfileAuthFeedback("");
  updateProfileSessionUI();
  updateProfileAuthUI();
}

function closeProfileSwitcher() {
  state.profileGateVisible = false;
  state.pendingProfileId = null;
  updateProfileSessionUI();
  updateProfileAuthUI();
}

function updateProfileSessionUI() {
  const activeProfile = profileCatalog[state.activeProfileId] || null;
  const isGateVisible = state.profileGateVisible || !activeProfile;
  const profileNoteText = activeProfile
    ? `Estás viendo el dashboard de ${activeProfile.name}.`
    : "Selecciona un perfil para ver su dashboard.";

  if (activeProfileNameElement) {
    activeProfileNameElement.textContent = activeProfile ? activeProfile.name : "Sin sesión";
  }

  if (activeProfileBadgeElement) {
    activeProfileBadgeElement.textContent = activeProfile ? activeProfile.name : "Sin sesión";
  }

  let profileNoteElement = document.querySelector("#activeProfileNote");
  if (!profileNoteElement && activeProfileNameElement?.parentElement) {
    profileNoteElement = document.createElement("small");
    profileNoteElement.id = "activeProfileNote";
    profileNoteElement.className = "sidebar-profile-note";
    activeProfileNameElement.insertAdjacentElement("afterend", profileNoteElement);
  }

  if (profileNoteElement) {
    profileNoteElement.textContent = profileNoteText;
  }

  if (logoutButton) {
    logoutButton.hidden = true;
  }

  profileGate?.classList.toggle("is-visible", isGateVisible);
  profileGate?.setAttribute("aria-hidden", String(!isGateVisible));
  document.body.classList.toggle("profile-gate-open", isGateVisible);

  profileLoginButtons.forEach((button) => {
    const selectedProfileId = isGateVisible ? state.pendingProfileId : state.activeProfileId;
    button.classList.toggle("is-selected", button.dataset.profileLogin === selectedProfileId);
  });
}

async function restoreProfileSession() {
  try {
    const response = await fetch(`${authApiBase}/session`, {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!response.ok) {
      state.activeProfileId = null;
      updateProfileSessionUI();
      updateProfileAuthUI();
      return;
    }

    const payload = await response.json();
    state.activeProfileId =
      payload?.authenticated && profileCatalog[payload?.profile?.id] ? payload.profile.id : null;
  } catch {
    state.activeProfileId = null;
  }

  updateProfileSessionUI();
  updateProfileAuthUI();
}

async function loginProfile(profileId, password) {
  if (!profileCatalog[profileId]) {
    return;
  }

  const response = await fetch(`${authApiBase}/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      profileId,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "No se pudo iniciar sesion"));
  }

  const payload = await response.json();
  state.activeProfileId = profileId;
  state.pendingProfileId = null;
  state.profileGateVisible = false;
  closeSimulationModal();
  resetSimulationToLivePrice();
  state.activeProfileId = profileCatalog[payload?.profile?.id] ? payload.profile.id : profileId;
  updateProfileSessionUI();
  updateProfileAuthUI();
  await loadPurchases();
  draw();
}

async function logoutProfile() {
  state.activeProfileId = null;
  state.pendingProfileId = null;
  state.purchases = [];
  closeSimulationModal();
  resetSimulationToLivePrice();

  try {
    await fetch(`${authApiBase}/logout`, {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {}

  updatePurchaseSummary();
  updateProfileSessionUI();
  updateProfileAuthUI();
  draw();
}

function attachEvents() {
  purchaseForm?.addEventListener("submit", addPurchase);
  logoutButton?.addEventListener("click", logoutProfile);
  switchProfileButton?.addEventListener("click", openProfileSwitcher);
  summaryVisibilityButton?.addEventListener("click", () => {
    state.summaryMasked = !state.summaryMasked;
    localStorage.setItem(summaryVisibilityStorageKey, String(state.summaryMasked));
    updateSummaryVisibilityButton();
    updatePurchaseSummary();
  });
  profileLoginButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingProfileId = button.dataset.profileLogin;
      if (profilePasswordInput) {
        profilePasswordInput.value = "";
      }
      setProfileAuthFeedback("");
      updateProfileSessionUI();
      updateProfileAuthUI();
      profilePasswordInput?.focus();
    });
  });
  profileAuthForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const pendingProfileId = state.pendingProfileId;
    const password = profilePasswordInput?.value || "";
    if (!pendingProfileId || !profileCatalog[pendingProfileId]) {
      return;
    }

    try {
      setProfileAuthFeedback("");
      await loginProfile(pendingProfileId, password);
    } catch (error) {
      setProfileAuthFeedback(error.message || "Contraseña incorrecta. Intenta de nuevo.", "is-error");
      if (profilePasswordInput) {
        profilePasswordInput.value = "";
        profilePasswordInput.focus();
      }
    }
  });
  openSimulationModalButton?.addEventListener("click", openSimulationModal);
  simulationModalClose?.addEventListener("click", closeSimulationModal);
  simulationModal?.addEventListener("close", () => {
    document.body.classList.remove("simulation-modal-open");
    openSimulationModalButton?.classList.remove("active");
    openSimulationModalButton?.setAttribute("aria-pressed", "false");
  });
  simulationModal?.addEventListener("cancel", () => {
    document.body.classList.remove("simulation-modal-open");
    openSimulationModalButton?.classList.remove("active");
    openSimulationModalButton?.setAttribute("aria-pressed", "false");
  });
  simulationModal?.addEventListener("click", (event) => {
    if (event.target === simulationModal) {
      closeSimulationModal();
    }
  });
  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.viewTarget;
      if (state.activeView === "simulation") {
        resetSimulationToLivePrice();
      }
      updateActiveView();
    });
  });
  simulationPriceRangeInput?.addEventListener("input", (event) => {
    setSimulationPrice(event.target.value);
  });
  simulationPriceRangeInput?.addEventListener("pointerdown", () => {
    simulationSliderWrapElement?.classList.add("is-dragging");
  });
  simulationPriceRangeInput?.addEventListener("pointerup", () => {
    simulationSliderWrapElement?.classList.remove("is-dragging");
  });
  simulationPriceRangeInput?.addEventListener("pointercancel", () => {
    simulationSliderWrapElement?.classList.remove("is-dragging");
  });
  simulationPriceRangeInput?.addEventListener("blur", () => {
    simulationSliderWrapElement?.classList.remove("is-dragging");
  });
  simulationUseLivePriceButton?.addEventListener("click", () => {
    resetSimulationToLivePrice();
  });
  profileGate?.addEventListener("click", (event) => {
    if (event.target !== profileGate) {
      return;
    }

    state.pendingProfileId = null;
    if (profilePasswordInput) {
      profilePasswordInput.value = "";
    }
    setProfileAuthFeedback("");
    updateProfileAuthUI();

    if (state.activeProfileId) {
      closeProfileSwitcher();
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.profileGateVisible && state.activeProfileId) {
      closeProfileSwitcher();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      resetSimulationToLivePrice();
    }
  });
  purchaseViewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.purchaseView === state.purchaseOverlayMode) {
        return;
      }

      state.purchaseOverlayMode = button.dataset.purchaseView;
      purchaseViewButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      draw();
    });
  });
  deletePurchaseCancel?.addEventListener("click", closeDeletePurchaseModal);
  deletePurchaseConfirm?.addEventListener("click", confirmDeletePurchase);
  deletePurchaseModal?.addEventListener("cancel", () => {
    state.pendingDeletePurchaseId = null;
  });
  deletePurchaseModal?.addEventListener("close", () => {
    state.pendingDeletePurchaseId = null;
  });
  purchaseList?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-purchase-id]");
    if (deleteButton) {
      openDeletePurchaseModal(deleteButton.dataset.purchaseId);
    }
  });

  timeframeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.dataset.range === state.range) {
        return;
      }

      timeframeButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.range = button.dataset.range;
      state.hoverIndex = null;
      state.selectedRange = null;
      state.selectionDraft = null;
      await start();
    });
  });

  chartCanvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const direction = Math.sign(event.deltaY);
    state.visibleCount = clamp(
      state.visibleCount + direction * 12,
      Math.min(35, state.candles.length || 35),
      Math.max(60, state.candles.length),
    );
    draw();
  }, { passive: false });

  chartCanvas.addEventListener("pointerdown", (event) => {
    const candle = getCandleFromPointer(event);
    if (!candle) {
      return;
    }

    chartCanvas.setPointerCapture(event.pointerId);
    state.dragStart = { startTime: candle.time };
    state.selectionDraft = {
      startTime: candle.time,
      endTime: candle.time,
    };
    state.hoverIndex = null;
    draw();
  });

  chartCanvas.addEventListener("pointermove", (event) => {
    if (!state.dragStart) {
      updateHoverFromPointer(event);
      return;
    }

    const candle = getCandleFromPointer(event);
    if (candle) {
      state.selectionDraft = {
        startTime: state.dragStart.startTime,
        endTime: candle.time,
      };
      draw();
    }
  });

  chartCanvas.addEventListener("pointerup", (event) => {
    state.dragStart = null;
    state.selectedRange = null;
    state.selectionDraft = null;
    draw();
  });

  chartCanvas.addEventListener("pointerleave", () => {
    state.hoverIndex = null;
    if (state.dragStart) {
      state.dragStart = null;
      state.selectionDraft = null;
    }
    draw();
  });

  chartCanvas.addEventListener("dblclick", () => {
    state.offsetFromRight = 0;
    state.hoverIndex = null;
    state.selectedRange = null;
    state.selectionDraft = null;
    draw();
  });

  window.addEventListener("resize", () => {
    draw();
    updateSimulationPanel();
  });
}

function getCandleFromPointer(event) {
  const visibleCandles = getVisibleCandles();
  if (!visibleCandles.length) {
    return null;
  }

  const index = getVisibleIndexFromPointer(event, visibleCandles);
  return index === null ? null : visibleCandles[index];
}

function updateHoverFromPointer(event) {
  const visibleCandles = getVisibleCandles();
  if (!visibleCandles.length) {
    return;
  }

  const hoverIndex = getVisibleIndexFromPointer(event, visibleCandles);
  if (hoverIndex === null) {
    if (state.hoverIndex !== null) {
      state.hoverIndex = null;
      draw();
    }
    return;
  }

  if (state.hoverIndex !== hoverIndex) {
    state.hoverIndex = hoverIndex;
    draw();
  }
}

function getVisibleIndexFromPointer(event, visibleCandles) {
  const bounds = chartCanvas.getBoundingClientRect();
  const padding = { top: 26, right: 78, bottom: 34, left: 16 };
  const plotWidth = chartCanvas.clientWidth - padding.left - padding.right;
  const plotHeight = chartCanvas.clientHeight - padding.top - padding.bottom;
  const pointerX = event.clientX - bounds.left;
  const pointerY = event.clientY - bounds.top;

  if (
    pointerX < padding.left ||
    pointerX > padding.left + plotWidth ||
    pointerY < padding.top ||
    pointerY > padding.top + plotHeight
  ) {
    return null;
  }

  const candleWidth = plotWidth / visibleCandles.length;
  return clamp(
    Math.round((pointerX - padding.left - candleWidth / 2) / candleWidth),
    0,
    visibleCandles.length - 1,
  );
}

function setDefaultPurchaseDate() {
  if (!purchaseDateInput) {
    return;
  }

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  purchaseDateInput.value = now.toISOString().slice(0, 10);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function updatePurchaseSummary() {
  const totalSpentUsd = sumFinite(state.purchases.map(getPurchaseCostUsd));
  const totalSpent = totalSpentUsd !== null && state.usdCop ? totalSpentUsd * state.usdCop : null;
  const totalBtc = state.purchases.reduce((sum, purchase) => sum + Number(purchase.btc || 0), 0);
  const currentValueUsd = state.lastClose ? totalBtc * state.lastClose : null;
  const currentValueCop =
    currentValueUsd !== null && state.usdCop ? currentValueUsd * state.usdCop : null;
  const profitCop = currentValueCop !== null && totalSpent !== null ? currentValueCop - totalSpent : null;
  const profitUsd =
    currentValueUsd !== null && totalSpentUsd !== null ? currentValueUsd - totalSpentUsd : null;
  const profitPercent = profitUsd !== null && totalSpentUsd ? (profitUsd / totalSpentUsd) * 100 : null;

  purchaseCountElement.textContent = state.summaryMasked
    ? getMaskedSummaryText()
    : String(state.purchases.length);

  totalSpentElement.innerHTML = state.summaryMasked
    ? formatMaskedKpiMoney("COP")
    : Number.isFinite(totalSpent)
      ? formatKpiMoney(totalSpent, formatTableCop, "COP")
      : "-";

  totalSpentUsdElement.innerHTML = state.summaryMasked
    ? `Equivalente ${getMaskedSummaryText()} USD`
    : totalSpentUsd !== null
      ? `Equivalente ${formatKpiInlineMoney(totalSpentUsd, formatTableUsd, "USD")}`
      : "Equivalente - USD";

  totalBtcElement.textContent = state.summaryMasked
    ? getMaskedSummaryText(8)
    : formatBtc.format(totalBtc);

  if (totalValueElement && totalValueUsdElement) {
    totalValueElement.innerHTML = state.summaryMasked
      ? formatMaskedKpiMoney("COP")
      : Number.isFinite(currentValueCop)
        ? formatKpiMoney(currentValueCop, formatTableCop, "COP")
        : "-";
    totalValueUsdElement.innerHTML = state.summaryMasked
      ? `Equivalente ${getMaskedSummaryText()} USD`
      : Number.isFinite(currentValueUsd)
        ? `Equivalente ${formatKpiInlineMoney(currentValueUsd, formatTableUsd, "USD")}`
        : "Equivalente - USD";
  }

  updateProfitCard(profitCop, profitUsd, profitPercent);
  updateSimulationPanel();
  renderPurchaseList();
}

function updateProfitCard(profitCop, profitUsd, profitPercent) {
  if (!totalProfitCopElement || !totalProfitUsdElement) {
    return;
  }

  const profitClass = !Number.isFinite(profitCop)
    ? ""
    : profitCop >= 0
      ? "positive-value"
      : "negative-value";

  totalProfitCopElement.className = profitClass;
  totalProfitCopElement.innerHTML = state.summaryMasked
    ? formatMaskedKpiMoney("COP")
    : Number.isFinite(profitCop)
      ? formatKpiMoney(profitCop, formatTableCop, "COP", true)
      : "-";

  const profitUsdLabel = state.summaryMasked
    ? `${getMaskedSummaryText()} USD`
    : Number.isFinite(profitUsd)
      ? formatKpiInlineMoney(profitUsd, formatTableUsd, "USD", true)
      : "- USD";

  const profitPercentLabel = state.summaryMasked
    ? `${getMaskedSummaryText()} %`
    : Number.isFinite(profitPercent)
      ? formatSignedPercent(profitPercent)
      : "- %";

  totalProfitUsdElement.className = profitClass;
  totalProfitUsdElement.textContent = `${profitUsdLabel} · ${profitPercentLabel}`;
}

async function start() {
  clearInterval(state.fallbackTimer);

  try {
    await loadCandles();
    state.fallbackTimer = setInterval(loadCandles, 60_000);
  } catch (error) {
    console.error(error);
    setConnection("error", "Historial no disponible");
    draw();
  }

  connectSocket();
}

async function main() {
  restoreSummaryVisibility();
  attachEvents();
  await restoreProfileSession();
  updateActiveView();
  resetSimulationToLivePrice();
  setDefaultPurchaseDate();
  await loadPurchases();
  await loadUsdCopRate();
  state.rateTimer = setInterval(loadUsdCopRate, 5 * 60 * 1000);
  await loadBitcoinNews();
  state.newsTimer = setInterval(loadBitcoinNews, 5 * 60 * 1000);
  await start();
}

main();
