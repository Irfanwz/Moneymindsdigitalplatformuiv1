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

async function safeFetch(url) {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "MoneyMinds/1.0" },
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
