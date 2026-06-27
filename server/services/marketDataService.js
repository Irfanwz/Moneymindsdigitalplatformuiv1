/**
 * MarketDataService — CoinGecko + Alpha Vantage + Finnhub
 * Uses in-memory cache to avoid hammering external APIs.
 * Falls back to mock data when API keys are not set.
 */

import NodeCache from "node-cache";
import { config } from "../config.js";

// Cache TTLs (seconds)
const CRYPTO_TTL = 300;   // 5 minutes
const STOCKS_TTL = 900;   // 15 minutes
const NEWS_TTL   = 600;   // 10 minutes

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

async function safeFetch(url, label) {
  try {
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "MoneyMinds/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[MarketData] ${label} fetch failed:`, err.message);
    return null;
  }
}

/* ─────────────────────────────────────────
   CRYPTO — CoinGecko (free, no key needed)
───────────────────────────────────────── */

const MOCK_CRYPTO = [
  { id: "bitcoin",  symbol: "BTC", name: "Bitcoin",  price: 67420.50, change24h: 2.34,  marketCap: 1.32e12, volume24h: 28.4e9 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", price: 3512.80,  change24h: 1.87,  marketCap: 4.22e11, volume24h: 14.1e9 },
  { id: "solana",   symbol: "SOL", name: "Solana",   price: 178.40,   change24h: -0.95, marketCap: 8.1e10,  volume24h: 3.2e9  },
  { id: "bnb",      symbol: "BNB", name: "BNB",      price: 592.30,   change24h: 0.62,  marketCap: 8.8e10,  volume24h: 1.8e9  },
  { id: "xrp",      symbol: "XRP", name: "XRP",      price: 0.5820,   change24h: -1.24, marketCap: 3.2e10,  volume24h: 1.4e9  },
];

async function getCryptoPrices(limit = 20) {
  const cacheKey = `crypto_top_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: "cache" };

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`;
  const raw = await safeFetch(url, "CoinGecko top coins");

  if (!raw) {
    return { data: MOCK_CRYPTO, source: "mock" };
  }

  const data = raw.map((c) => ({
    id: c.id,
    symbol: c.symbol?.toUpperCase(),
    name: c.name,
    price: c.current_price,
    change24h: c.price_change_percentage_24h,
    marketCap: c.market_cap,
    volume24h: c.total_volume,
    image: c.image,
  }));

  cache.set(cacheKey, data, CRYPTO_TTL);
  return { data, source: "live" };
}

async function getCoinDetail(coinId) {
  const cacheKey = `crypto_detail_${coinId}`;
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: "cache" };

  const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
  const raw = await safeFetch(url, `CoinGecko detail ${coinId}`);

  if (!raw) return { data: null, source: "mock" };

  const data = {
    id: raw.id,
    symbol: raw.symbol?.toUpperCase(),
    name: raw.name,
    price: raw.market_data?.current_price?.usd,
    change24h: raw.market_data?.price_change_percentage_24h,
    change7d: raw.market_data?.price_change_percentage_7d,
    marketCap: raw.market_data?.market_cap?.usd,
    volume24h: raw.market_data?.total_volume?.usd,
    description: raw.description?.en?.slice(0, 500),
    homepage: raw.links?.homepage?.[0],
  };

  cache.set(cacheKey, data, CRYPTO_TTL);
  return { data, source: "live" };
}

/* ─────────────────────────────────────────
   STOCKS — Alpha Vantage
───────────────────────────────────────── */

const MOCK_STOCKS = {
  AAPL: { symbol: "AAPL", name: "Apple Inc.", price: 189.50, change: 1.23, changePercent: 0.65, volume: 54e6 },
  MSFT: { symbol: "MSFT", name: "Microsoft",  price: 415.20, change: -2.10, changePercent: -0.50, volume: 21e6 },
  GOOGL:{ symbol: "GOOGL",name: "Alphabet",   price: 172.80, change: 0.95, changePercent: 0.55, volume: 18e6 },
  NVDA: { symbol: "NVDA", name: "NVIDIA",     price: 875.40, change: 12.30, changePercent: 1.43, volume: 42e6 },
  TSLA: { symbol: "TSLA", name: "Tesla",      price: 245.60, change: -5.80, changePercent: -2.31, volume: 89e6 },
};

async function getStockData(symbol) {
  const upper = symbol.toUpperCase();
  const cacheKey = `stock_${upper}`;
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: "cache" };

  if (!config.alphaVantageKey) {
    return { data: MOCK_STOCKS[upper] ?? null, source: "mock" };
  }

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${upper}&apikey=${config.alphaVantageKey}`;
  const raw = await safeFetch(url, `Alpha Vantage ${upper}`);
  const q = raw?.["Global Quote"];

  if (!q || !q["05. price"]) {
    return { data: MOCK_STOCKS[upper] ?? null, source: "mock" };
  }

  const data = {
    symbol: upper,
    price: parseFloat(q["05. price"]),
    change: parseFloat(q["09. change"]),
    changePercent: parseFloat(q["10. change percent"]),
    volume: parseInt(q["06. volume"]),
    previousClose: parseFloat(q["08. previous close"]),
  };

  cache.set(cacheKey, data, STOCKS_TTL);
  return { data, source: "live" };
}

/* ─────────────────────────────────────────
   FINANCIAL NEWS — Finnhub
───────────────────────────────────────── */

const MOCK_NEWS = [
  { headline: "Fed signals potential rate cuts amid cooling inflation data", source: "Reuters", datetime: Date.now() / 1000, url: "#", category: "macro" },
  { headline: "Bitcoin surges past $67K as institutional demand grows", source: "CoinDesk", datetime: Date.now() / 1000 - 3600, url: "#", category: "crypto" },
  { headline: "AI startup valuations hit record highs in Q2 2026", source: "TechCrunch", datetime: Date.now() / 1000 - 7200, url: "#", category: "tech" },
  { headline: "Clean energy investments reach $500B globally in 2026", source: "Bloomberg", datetime: Date.now() / 1000 - 10800, url: "#", category: "cleantech" },
  { headline: "SaaS metrics show recovery as enterprise spending rebounds", source: "Forbes", datetime: Date.now() / 1000 - 14400, url: "#", category: "saas" },
];

async function getFinancialNews(category = "general", limit = 20) {
  const cacheKey = `news_${category}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: "cache" };

  if (!config.finnhubApiKey) {
    return { data: MOCK_NEWS.slice(0, limit), source: "mock" };
  }

  const url = `https://finnhub.io/api/v1/news?category=${category}&token=${config.finnhubApiKey}`;
  const raw = await safeFetch(url, `Finnhub news ${category}`);

  if (!raw || !Array.isArray(raw)) {
    return { data: MOCK_NEWS.slice(0, limit), source: "mock" };
  }

  const data = raw.slice(0, limit).map((n) => ({
    headline: n.headline,
    summary: n.summary,
    source: n.source,
    datetime: n.datetime,
    url: n.url,
    image: n.image,
    category: n.category,
  }));

  cache.set(cacheKey, data, NEWS_TTL);
  return { data, source: "live" };
}

/* ─────────────────────────────────────────
   COMBINED SNAPSHOT — for AI agent context
───────────────────────────────────────── */

async function getMarketSnapshot() {
  const [crypto, news] = await Promise.allSettled([
    getCryptoPrices(10),
    getFinancialNews("general", 5),
  ]);

  return {
    crypto: crypto.status === "fulfilled" ? crypto.value.data.slice(0, 10) : [],
    news: news.status === "fulfilled"   ? news.value.data.slice(0, 5)   : [],
    timestamp: new Date().toISOString(),
  };
}

export const marketDataService = {
  getCryptoPrices,
  getCoinDetail,
  getStockData,
  getFinancialNews,
  getMarketSnapshot,
};
