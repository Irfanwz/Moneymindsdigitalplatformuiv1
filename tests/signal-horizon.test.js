import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveSignalHorizon } from "../shared/signalHorizon.js";
import { normalizeSignalInput } from "../server/advisorGroups.js";
vi.mock("../server/services/predictionParserService.js", () => ({parseSignalPrediction:vi.fn(async()=>({ticker:"BTC",direction:"up",timeframe:"1week",timeframeDays:7,targetPrice:110}))}));
vi.mock("../server/services/marketPriceFetcher.js", () => ({getStockPrice:vi.fn(async()=>null),getCryptoPrice:vi.fn(async()=>100),getHistoricalPrice:vi.fn(async()=>null)}));
vi.mock("node-cron", () => ({default:{schedule:vi.fn()}}));
vi.mock("../server/services/agentService.js", () => ({queueAgent:vi.fn(async()=>({status:"queued"}))}));
import cron from "node-cron";
import { queueAgent } from "../server/services/agentService.js";
import { startPredictionCron } from "../server/cron/predictionCron.js";
import { scheduleSignalPrediction, checkOnePrediction } from "../server/services/predictionCheckerService.js";
import { getCryptoPrice, getHistoricalPrice } from "../server/services/marketPriceFetcher.js";
const start = "2026-01-31T12:00:00.000Z";
beforeEach(()=>{vi.clearAllMocks();vi.useFakeTimers({toFake:["Date"]});vi.setSystemTime(new Date(start));});
afterEach(()=>vi.useRealTimers());

it("resolves hours, days, calendar months and explicit UTC dates exactly",()=>{
  expect(resolveSignalHorizon("1hours", start).checkDate).toBe("2026-01-31T13:00:00.000Z");
  expect(resolveSignalHorizon("2days", start).checkDate).toBe("2026-02-02T12:00:00.000Z");
  expect(resolveSignalHorizon("1months", start).checkDate).toBe("2026-02-28T12:00:00.000Z");
  expect(resolveSignalHorizon("until:2026-02-01T15:30:00.000Z", start).checkDate).toBe("2026-02-01T15:30:00.000Z");
  expect(resolveSignalHorizon("short",start)).toBeNull();
});
it.each(["0hours","-1hours","1.5hours","until:invalid","until:2026-01-31T12:30:00.000Z","until:2020-01-01T00:00:00.000Z","999999months"])("rejects invalid horizon %s at the API input boundary",value=>{
  expect(()=>normalizeSignalInput({timeHorizon:value})).toThrow();
  try { normalizeSignalInput({timeHorizon:value}); } catch(error) { expect(error.status).toBe(400); }
});
it("preserves an hour deadline despite AI extracting a week",async()=>{
  const signal={id:"fixture",createdAt:start,updatedAt:start,timeHorizon:"1hours",title:"BTC rises",content:"BTC will rise next week"};
  const store={findSignalById:vi.fn(async()=>signal),updateSignalPrediction:vi.fn(async(_id,patch)=>({...signal,...patch}))};
  await scheduleSignalPrediction(signal.id,signal,store,{strict:true});
  expect(store.updateSignalPrediction.mock.calls[0][1]).toMatchObject({predictionCheckDate:"2026-01-31T13:00:00.000Z",predictionTimeframe:"1 hour",predictionTimeframeDays:1,baselinePrice:100});
  expect(getCryptoPrice).toHaveBeenCalledWith("BTC",{fresh:true});
});
it("does not score an hourly prediction with missing near-deadline evidence",async()=>{
  const store={updateSignalPrediction:vi.fn()};
  await checkOnePrediction({id:"fixture",createdAt:"2026-01-31T10:00:00Z",baselineFetchedAt:"2026-01-31T10:00:00Z",predictionCheckDate:"2026-01-31T11:00:00Z",baselinePrice:100,predictionTicker:"BTC",predictionDirection:"up",predictionAssetType:"crypto"},store);
  expect(getHistoricalPrice.mock.calls[0][2].maxAgeMs).toBe(300000);
  expect(store.updateSignalPrediction).not.toHaveBeenCalled();
});
it("does not lock a signal if its baseline arrives after expiry",async()=>{
  const signal={id:"late",createdAt:start,updatedAt:start,timeHorizon:"1hours",title:"BTC rises"};
  vi.setSystemTime(new Date("2026-01-31T12:59:59Z"));
  getCryptoPrice.mockImplementationOnce(async()=>{vi.setSystemTime(new Date("2026-01-31T13:00:01Z"));return 100;});
  const store={findSignalById:vi.fn(async()=>signal),updateSignalPrediction:vi.fn(async(_id,patch)=>({...signal,...patch}))};
  const result=await scheduleSignalPrediction(signal.id,signal,store,{strict:true});
  expect(result.eligible).toBe(false);
  expect(store.updateSignalPrediction.mock.calls[0][1]).toMatchObject({baselinePrice:null,predictionCheckDate:null});
});
it("polls every minute, skips empty queues and prevents overlapping runs",async()=>{
  const store={listSignalsDueForCheck:vi.fn(async()=>[]),listAgentRuns:vi.fn(async()=>[]),listUsers:vi.fn(async()=>[{id:"admin",isAdmin:true}])};
  startPredictionCron(store);
  expect(cron.schedule.mock.calls[0][0]).toBe("* * * * *");
  await Promise.resolve();
  expect(queueAgent).not.toHaveBeenCalled();
  store.listSignalsDueForCheck.mockResolvedValue([{id:"due"}]);
  const tick=cron.schedule.mock.calls[0][1];
  await tick();
  expect(queueAgent).toHaveBeenCalledTimes(1);
  store.listAgentRuns.mockResolvedValue([{status:"running"}]);
  await tick();
  expect(queueAgent).toHaveBeenCalledTimes(1);
});
