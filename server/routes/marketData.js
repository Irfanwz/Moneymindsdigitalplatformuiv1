/**
 * Market Data Routes
 * GET /api/market/crypto
 * GET /api/market/crypto/:coinId
 * GET /api/market/stocks/:symbol
 * GET /api/market/news
 * GET /api/market/news/:category
 * GET /api/market/snapshot  (combined — for AI agent context)
 */

import { Router } from "express";
import { marketDataService } from "../services/marketDataService.js";

export function createMarketDataRouter() {
  const router = Router();

  // GET /api/market/crypto — top 20 coins
  router.get("/crypto", async (req, res, next) => {
    try {
      const limit = Math.min(parseInt(req.query.limit ?? "20"), 100);
      const result = await marketDataService.getCryptoPrices(limit);
      res.json({ ok: true, ...result });
    } catch (err) { next(err); }
  });

  // GET /api/market/crypto/:coinId — single coin detail
  router.get("/crypto/:coinId", async (req, res, next) => {
    try {
      const result = await marketDataService.getCoinDetail(req.params.coinId);
      if (!result.data) return res.status(404).json({ error: "Coin not found" });
      res.json({ ok: true, ...result });
    } catch (err) { next(err); }
  });

  // GET /api/market/stocks/:symbol — single stock
  router.get("/stocks/:symbol", async (req, res, next) => {
    try {
      const result = await marketDataService.getStockData(req.params.symbol);
      if (!result.data) return res.status(404).json({ error: "Stock not found" });
      res.json({ ok: true, ...result });
    } catch (err) { next(err); }
  });

  // GET /api/market/news — general financial news
  router.get("/news", async (req, res, next) => {
    try {
      const limit = Math.min(parseInt(req.query.limit ?? "20"), 50);
      const result = await marketDataService.getFinancialNews("general", limit);
      res.json({ ok: true, ...result });
    } catch (err) { next(err); }
  });

  // GET /api/market/news/:category — sector news (crypto, forex, merger, etc.)
  router.get("/news/:category", async (req, res, next) => {
    try {
      const limit = Math.min(parseInt(req.query.limit ?? "20"), 50);
      const result = await marketDataService.getFinancialNews(req.params.category, limit);
      res.json({ ok: true, ...result });
    } catch (err) { next(err); }
  });

  // GET /api/market/snapshot — combined data for AI context
  router.get("/snapshot", async (req, res, next) => {
    try {
      const snapshot = await marketDataService.getMarketSnapshot();
      res.json({ ok: true, data: snapshot });
    } catch (err) { next(err); }
  });

  return router;
}
