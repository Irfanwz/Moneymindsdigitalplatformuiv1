import { afterEach, expect, it, vi } from "vitest";
import { getHistoricalPrice } from "../server/services/marketPriceFetcher.js";
import { config } from "../server/config.js";
const originalKey = config.alphaVantageKey;
afterEach(() => { vi.unstubAllGlobals(); config.alphaVantageKey=originalKey; });
const respond = body => vi.stubGlobal("fetch",vi.fn(async()=>({ok:true,json:async()=>body})));

it("uses the latest crypto sample before deadline, ignoring later and invalid samples", async () => {
  const deadline = "2020-01-08T12:00:00.000Z", t=Date.parse(deadline);
  respond({prices:[[t+1,999],[t-3600000,90],[t-1000,110],[t-500,-1]]});
  expect(await getHistoricalPrice("BTC",deadline)).toMatchObject({price:110,observedAt:new Date(t-1000).toISOString(),source:"CoinGecko"});
  expect(fetch.mock.calls[0][0]).toContain("market_chart/range");
});
it("leaves stale or missing historical observations unscored", async () => {
  respond({prices:[[Date.parse("2020-01-08T00:00:00Z"),99]]});
  expect(await getHistoricalPrice("BTC","2020-01-08T12:00:00Z")).toBeNull();
  respond({error:"provider unavailable"});
  expect(await getHistoricalPrice("BTC","2020-01-08T12:00:00Z")).toBeNull();
});
it("uses a completed stock trading day and discloses daily resolution", async () => {
  config.alphaVantageKey="fixture";
  respond({"Meta Data":{"2. Symbol":"AAPL","5. Time Zone":"US/Eastern"},"Time Series (Daily)":{"2020-01-08":{"4. close":"999"},"2020-01-07":{"4. close":"100"}}});
  expect(await getHistoricalPrice("AAPL","2020-01-08T15:00:00Z")).toMatchObject({price:100,tradingDate:"2020-01-07",resolution:"completed-day-close"});
  expect(await getHistoricalPrice("AAPL","2020-02-08T15:00:00Z")).toBeNull();
  // A known price from before publication cannot become a perfect prediction.
  expect(await getHistoricalPrice("AAPL","2020-01-08T22:00:00Z",{after:"2020-01-07T22:00:00Z",assetType:"stock"})).toBeNull();
});
it("retains crypto IDs outside the built-in symbol aliases", async () => {
  const t=Date.parse("2020-01-08T12:00:00Z");
  respond({prices:[[t-1000,110]]});
  expect(await getHistoricalPrice("LITECOIN",new Date(t).toISOString(),{after:"2020-01-01T00:00:00Z",assetType:"crypto"})).toMatchObject({price:110});
  expect(fetch.mock.calls[0][0]).toContain("/coins/litecoin/market_chart/range");
  expect(await getHistoricalPrice("LITECOIN",new Date(t).toISOString(),{after:new Date(t-500).toISOString(),assetType:"crypto"})).toBeNull();
});
