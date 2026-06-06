import { Router } from "express";

const CACHE_TTL = 5 * 60 * 1000;
let marketCache = { data: null, fetchedAt: 0 };

export function createPublicRouter(store) {
  const router = Router();

  router.get("/market", async (_req, res, next) => {
    try {
      if (marketCache.data && Date.now() - marketCache.fetchedAt < CACHE_TTL) {
        return res.json(marketCache.data);
      }

      const [priceRes, chartRes] = await Promise.all([
        fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true"),
        fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1"),
      ]);

      if (!priceRes.ok || !chartRes.ok) {
        return res.status(502).json({ message: "Failed to fetch market data." });
      }

      const prices = await priceRes.json();
      const chart = await chartRes.json();

      const chartData = (chart.prices || [])
        .filter((_, i) => i % 3 === 0)
        .slice(0, 24)
        .map((point) => ({
          time: new Date(point[0]).toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
          btc: Math.round(point[1]),
        }));

      const btc = prices.bitcoin || {};
      const eth = prices.ethereum || {};
      const sol = prices.solana || {};

      const result = {
        stats: [
          { label: "Bitcoin", value: `$${(btc.usd || 0).toLocaleString()}`, change: `${(btc.usd_24h_change || 0) >= 0 ? "+" : ""}${(btc.usd_24h_change || 0).toFixed(1)}%` },
          { label: "Ethereum", value: `$${(eth.usd || 0).toLocaleString()}`, change: `${(eth.usd_24h_change || 0) >= 0 ? "+" : ""}${(eth.usd_24h_change || 0).toFixed(1)}%` },
          { label: "24h Volume", value: `$${((btc.usd_24h_vol || 0) / 1e9).toFixed(1)}B`, change: `${(btc.usd_24h_change || 0) >= 0 ? "+" : ""}${(btc.usd_24h_change || 0).toFixed(1)}%` },
          { label: "Solana", value: `$${(sol.usd || 0).toLocaleString()}`, change: `${(sol.usd_24h_change || 0) >= 0 ? "+" : ""}${(sol.usd_24h_change || 0).toFixed(1)}%` },
        ],
        cryptoChart: chartData,
        prices: {
          btc: btc.usd || 0, eth: eth.usd || 0, sol: sol.usd || 0,
          btcChange: btc.usd_24h_change || 0, ethChange: eth.usd_24h_change || 0, solChange: sol.usd_24h_change || 0,
          btcMarketCap: btc.usd_market_cap || 0,
        },
      };

      marketCache = { data: result, fetchedAt: Date.now() };
      res.json(result);
    } catch (error) { next(error); }
  });

  router.get("/stats", async (_req, res, next) => {
    try {
      const allUsers = await store.listUsers({});
      const approved = allUsers.filter((u) => u.status === "approved" || u.isAdmin);
      res.json({
        totalUsers: approved.length,
        startups: approved.filter((u) => u.approvedRoles?.includes("startup")).length,
        investors: approved.filter((u) => u.approvedRoles?.includes("investor")).length,
        advisors: approved.filter((u) => u.approvedRoles?.includes("advisor")).length,
      });
    } catch (error) { next(error); }
  });

  return router;
}
