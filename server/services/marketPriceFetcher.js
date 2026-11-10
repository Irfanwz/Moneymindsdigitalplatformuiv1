/**
 * marketPriceFetcher.js
 * Thin wrapper for fetching a single asset price for prediction accuracy checks.
 * Supports stocks (Alpha Vantage) and crypto (CoinGecko).
 * Returns null on failure — never throws.
 */

import { config } from "../config.js";

const STOCK_TTL_MS = 15 * 60 * 1000; // 15 min
const priceCache = new Map();

function isCacheValid(entry) {
  return entry && Date.now() - entry.ts < STOCK_TTL_MS;
}

async function safeFetch(url, headers = {}) {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "MoneyMinds/1.0", ...headers },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Known crypto tickers → CoinGecko IDs
const CRYPTO_IDS = {
  BTC: "bitcoin", BITCOIN: "bitcoin",
  ETH: "ethereum", ETHEREUM: "ethereum",
  SOL: "solana", SOLANA: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  MATIC: "matic-network",
  LINK: "chainlink",
  UNI: "uniswap",
};

/**
 * Fetch current stock price for a ticker symbol.
 * @param {string} symbol - e.g. "AAPL", "TSLA"
 * @returns {Promise<number|null>}
 */
export async function getStockPrice(symbol) {
  if (!symbol) return null;
  const upper = symbol.toUpperCase();
  if(CRYPTO_IDS[upper]) return null; // Avoid resolving common crypto symbols as stock tickers.
  const cacheKey = `stock_${upper}`;
  const cached = priceCache.get(cacheKey);
  if (isCacheValid(cached)) return cached.price;

  let price=null;
  if(config.alphaVantageKey) {
    const raw=await safeFetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(upper)}&apikey=${config.alphaVantageKey}`);
    const parsed=Number.parseFloat(raw?.["Global Quote"]?.["05. price"]);
    if(Number.isFinite(parsed) && parsed>0) price=parsed;
  }
  if(price===null && config.finnhubApiKey) {
    const raw=await safeFetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(upper)}&token=${config.finnhubApiKey}`);
    if(Number.isFinite(raw?.c) && raw.c>0) price=raw.c;
  }
  if(price===null) return null;

  priceCache.set(cacheKey, { price, ts: Date.now() });
  return price;
}

/**
 * Fetch current crypto price for a symbol or name.
 * @param {string} symbol - e.g. "BTC", "ETH", "bitcoin"
 * @returns {Promise<number|null>}
 */
export async function getCryptoPrice(symbol) {
  if (!symbol) return null;
  const upper = symbol.toUpperCase();
  const coinId = CRYPTO_IDS[upper] ?? symbol.toLowerCase();
  const cacheKey = `crypto_${coinId}`;
  const cached = priceCache.get(cacheKey);
  if (isCacheValid(cached)) return cached.price;

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd`;
  const raw = await safeFetch(url);
  const price = raw?.[coinId]?.usd;
  if (!Number.isFinite(price) || price<=0) return null;

  priceCache.set(cacheKey, { price, ts: Date.now() });
  return price;
}

/** Fetch an observation from before the prediction deadline, never today's quote.
 * Crypto: latest sample at/before deadline, at most two hours old.
 * Stocks: last completed trading day's unadjusted daily close, at most seven
 * calendar days old. Same-day bars are excluded because their close may be later
 * than the deadline. The different resolution is retained with every result.
 */
function dateInZone(timestamp, timeZone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {timeZone, year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(timestamp)).map(p=>[p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export async function getHistoricalPrice(symbol, deadline, {after, assetType} = {}) {
  const cutoff = Date.parse(deadline);
  const earliest = after === undefined ? -Infinity : Date.parse(after);
  if (!symbol || !Number.isFinite(cutoff) || cutoff > Date.now() || Number.isNaN(earliest) || earliest >= cutoff) return null;
  const upper = symbol.toUpperCase();
  // Persisted type disambiguates stocks from CoinGecko IDs outside the aliases.
  // Legacy rows without a type retain only the known, unambiguous aliases.
  const coinId = assetType === "stock" ? null : CRYPTO_IDS[upper] ?? (assetType === "crypto" ? symbol.toLowerCase() : null);
  if (coinId) {
    const params = new URLSearchParams({vs_currency:"usd", from:String(Math.floor((cutoff - 86400000) / 1000)), to:String(Math.floor(cutoff / 1000))});
    const headers = config.coingeckoApiKey ? {"x-cg-demo-api-key":config.coingeckoApiKey} : {};
    const raw = await safeFetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?${params}`, headers);
    const point = (Array.isArray(raw?.prices) ? raw.prices : [])
      .filter(p => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]) && p[1] > 0 && p[0] > earliest && p[0] <= cutoff && cutoff - p[0] <= 7200000)
      .sort((a,b) => b[0] - a[0])[0];
    if (!point) return null;
    const observedAt = new Date(point[0]).toISOString();
    return {price:point[1], observedAt, deadline, source:"CoinGecko", resolution:"historical-sample", description:`CoinGecko historical sample at ${observedAt}`};
  }
  if (!config.alphaVantageKey) return null;
  const params = new URLSearchParams({function:"TIME_SERIES_DAILY", symbol:upper, outputsize:"compact", apikey:config.alphaVantageKey});
  const raw = await safeFetch(`https://www.alphavantage.co/query?${params}`);
  const zone = raw?.["Meta Data"]?.["5. Time Zone"];
  if (!zone || raw?.["Meta Data"]?.["2. Symbol"]?.toUpperCase() !== upper) return null;
  let localDate, earliestDate;
  try {
    localDate = dateInZone(cutoff,zone);
    earliestDate = Number.isFinite(earliest) ? dateInZone(earliest,zone) : "";
  } catch { return null; }
  const point = Object.entries(raw?.["Time Series (Daily)"] ?? {})
    .filter(([day, bar]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && day < localDate && day > earliestDate &&
      Date.parse(`${localDate}T00:00:00Z`) - Date.parse(`${day}T00:00:00Z`) <= 7 * 86400000 &&
      Number.isFinite(Number(bar?.["4. close"])) && Number(bar["4. close"]) > 0)
    .sort(([a],[b]) => b.localeCompare(a))[0];
  if (!point) return null;
  return {price:Number(point[1]["4. close"]), tradingDate:point[0], timeZone:zone, deadline,
    source:"Alpha Vantage", resolution:"completed-day-close", description:`Alpha Vantage daily close for ${point[0]} (${zone}), before the deadline`};
}
