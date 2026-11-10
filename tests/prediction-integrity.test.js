import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { createApp } from "../server/app.js";
import { createToken } from "../server/auth.js";
import { recalculateForAdvisor } from "../server/services/credibilityService.js";
import { scheduleSignalPrediction, checkOnePrediction } from "../server/services/predictionCheckerService.js";
import { generateJSON } from "../server/services/aiProvider.js";
import { getHistoricalPrice } from "../server/services/marketPriceFetcher.js";

vi.mock("../server/services/aiProvider.js", () => ({configuredProviders:()=>["test"],generateJSON:vi.fn()}));
vi.mock("../server/services/marketPriceFetcher.js", () => ({getStockPrice:vi.fn(async()=>null),getCryptoPrice:vi.fn(async()=>100),getHistoricalPrice:vi.fn()}));
let store, app, advisor, group;
const post = {title:"BTC outlook",content:"Bitcoin will rise next week",tags:[],postType:"signal",signalType:"buy"};
const prediction = {predictionTicker:"BTC",predictionDirection:"up",predictionCheckDate:"2020-01-08T00:00:00.000Z",baselinePrice:100,predictionTargetPrice:110};
const auth = user => ({Cookie:`mm_token=${createToken(user)}`});
beforeEach(async () => {
  vi.restoreAllMocks(); vi.clearAllMocks();
  store = createMemoryStore();
  advisor = await store.createUserProfile({fullName:"Advisor",email:"advisor@example.test",passwordHash:"unused",requestedRoles:["advisor"]});
  await store.updateApproval(advisor.id,{status:"approved",approvedRoles:["advisor"]});
  advisor = await store.findUserById(advisor.id);
  await store.upsertAdvisorProfile(advisor.id,{title:"Advisor",expertiseAreas:[],industries:[],certifications:[]});
  group = await store.createGroup(advisor.id,{name:"History",description:"Fixture",category:"crypto",isPaid:false,isPrivate:false});
  app = createApp(store,{backgroundJobs:false});
  getHistoricalPrice.mockResolvedValue({price:110,description:"fixture before deadline"});
});

describe("Prediction history integrity", () => {
  it("cannot remove a losing result directly or through its group; ordinary content remains deletable", async () => {
    let loss;
    for (let i=0;i<6;i++) {
      const signal = await store.createSignal(group.id,advisor.id,post);
      loss = await store.updateSignalPrediction(signal.id,{...prediction,actualPrice:i===5 ? 90 : 110,predictionAccuracy:i===5 ? 0 : 100,predictionResult:i===5 ? "incorrect" : "correct",predictionCheckedAt:`2020-01-0${i+1}T00:00:00.000Z`});
    }
    const original = await recalculateForAdvisor(advisor.id,store);
    await request(app).delete(`/api/advisor/groups/${group.id}/signals/${loss.id}`).set(auth(advisor)).expect(409);
    await request(app).delete(`/api/advisor/groups/${group.id}`).set(auth(advisor)).expect(409);
    expect(await recalculateForAdvisor(advisor.id,store)).toEqual(original);
    expect((await store.listPredictionHistoryByAdvisor(advisor.id))).toHaveLength(6);
    const normal = await store.createSignal(group.id,advisor.id,{...post,postType:"discussion"});
    await request(app).delete(`/api/advisor/groups/${group.id}/signals/${normal.id}`).set(auth(advisor)).expect(200);
    const empty = await store.createGroup(advisor.id,{name:"Empty",description:"Fixture",category:"crypto"});
    await request(app).delete(`/api/advisor/groups/${empty.id}`).set(auth(advisor)).expect(200);
    await request(app).delete(`/api/advisor/groups/${group.id}/signals/${loss.id}`).expect(401);
  });

  it("moderation hides content while preserving due checks, credibility, and aggregate counts", async () => {
    const signal = await store.createSignal(group.id,advisor.id,post);
    await store.updateSignalPrediction(signal.id,prediction);
    vi.spyOn(store,"listContentModeration").mockResolvedValue([{entityType:"group",entityId:group.id,hidden:true}]);
    expect(await store.listSignalsByAdvisor(advisor.id)).toEqual([]);
    const due = await store.listSignalsDueForCheck();
    expect(due).toHaveLength(1);
    await checkOnePrediction(due[0],store);
    expect((await recalculateForAdvisor(advisor.id,store)).totalPredictions).toBe(1);
    const stats = await request(app).get(`/api/advisors/${advisor.id}/accuracy`).set(auth(advisor)).expect(200);
    expect(stats.body.totalPredictions).toBe(1);
    expect(JSON.stringify(stats.body)).not.toContain(post.content);
  });

  it("rejects store-level edits and extraction replays after commitment", async () => {
    const signal = await store.createSignal(group.id,advisor.id,post);
    const scheduled = await store.updateSignalPrediction(signal.id,prediction);
    await expect(store.updateSignal(signal.id,{content:"BTC down",resetAnalysis:true})).rejects.toMatchObject({status:409});
    await expect(store.updateSignalPrediction(signal.id,{predictionCheckDate:null})).rejects.toMatchObject({status:409});
    await scheduleSignalPrediction(signal.id,signal,store,{strict:true});
    expect(generateJSON).not.toHaveBeenCalled();
    expect(await store.findSignalById(signal.id)).toEqual(scheduled);
  });

  it("discards extraction from an edited or deleted snapshot", async () => {
    const signal = await store.createSignal(group.id,advisor.id,post);
    let release;
    generateJSON.mockImplementation(() => new Promise(resolve => { release=resolve; }));
    const run = scheduleSignalPrediction(signal.id,signal,store,{strict:true});
    const assertion = expect(run).rejects.toThrow("could not be saved");
    await vi.waitFor(() => expect(release).toBeTypeOf("function"));
    await store.updateSignal(signal.id,{content:"Changed content",resetAnalysis:true});
    release({provider:"test",data:{ticker:"BTC",direction:"up",targetPrice:110,timeframe:"1 week",timeframeDays:7}});
    await assertion;
    expect((await store.findSignalById(signal.id)).baselinePrice).toBeNull();
    await store.deleteSignal(signal.id);
    expect(await store.updateSignalPrediction(signal.id,prediction,{expectedUpdatedAt:signal.updatedAt})).toBeNull();
  });

  it("commits one result under competing checks and never rechecks a recorded outcome", async () => {
    const signal = await store.createSignal(group.id,advisor.id,post);
    const scheduled = await store.updateSignalPrediction(signal.id,prediction);
    const results = await Promise.all([checkOnePrediction(scheduled,store),checkOnePrediction(scheduled,store)]);
    expect(results.filter(Boolean)).toHaveLength(1);
    const checked = await store.findSignalById(signal.id);
    getHistoricalPrice.mockClear();
    expect(await checkOnePrediction(checked,store)).toBeNull();
    expect(getHistoricalPrice).not.toHaveBeenCalled();
    await expect(store.updateSignalPrediction(signal.id,{predictionAccuracy:0})).rejects.toMatchObject({status:409});
  });
});

it("production SQL protects existing rows, group cascades, replay and stale edits", async () => {
  const db = new PGlite();
  const read = path => readFileSync(new URL(path,import.meta.url),"utf8");
  try {
    await db.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;");
    await db.exec(read("../supabase/schema.sql").match(/create table if not exists public\.platform_users[\s\S]*?\n\);/i)[0]);
    await db.exec(read("../supabase/migrations/20261101084337_repair_agent_runtime.sql"));
    // Existing installations also have this trigger from the original schema.
    await db.exec("CREATE FUNCTION public.set_advisor_signals_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=clock_timestamp(); RETURN NEW; END; $$; CREATE TRIGGER set_advisor_signals_updated_at BEFORE UPDATE ON advisor_signals FOR EACH ROW EXECUTE FUNCTION public.set_advisor_signals_updated_at();");
    const user = (await db.query("INSERT INTO platform_users(full_name,email,password_hash) VALUES ('Fixture','fixture@example.test','unused') RETURNING id")).rows[0];
    const groupRow = (await db.query("INSERT INTO advisor_groups(advisor_id,name,description,category) VALUES ($1,'Fixture','Fixture','crypto') RETURNING id",[user.id])).rows[0];
    const signal = (await db.query("INSERT INTO advisor_signals(advisor_id,group_id,title,content,signal_type,prediction_check_date,baseline_price,prediction_checked_at,prediction_result,prediction_accuracy) VALUES ($1,$2,'Prediction','BTC up','buy',now(),100,now(),'incorrect',0) RETURNING id",[user.id,groupRow.id])).rows[0];
    const sql = read("../supabase/migrations/20261107210009_protect_prediction_history.sql");
    await db.exec(sql); await db.exec(sql);
    for (const [query,id] of [
      ["DELETE FROM advisor_signals WHERE id=$1",signal.id],
      ["DELETE FROM advisor_groups WHERE id=$1",groupRow.id],
      ["UPDATE advisor_signals SET prediction_check_date=null WHERE id=$1",signal.id],
      ["UPDATE advisor_signals SET prediction_accuracy=100 WHERE id=$1",signal.id],
      ["UPDATE advisor_signals SET content='BTC down' WHERE id=$1",signal.id],
    ]) await expect(db.query(query,[id])).rejects.toThrow("PREDICTION_HISTORY_LOCKED");
    await db.query("UPDATE advisor_signals SET sentiment='bearish' WHERE id=$1",[signal.id]);
    const fresh = (await db.query("INSERT INTO advisor_signals(advisor_id,group_id,title,content,signal_type) VALUES ($1,$2,'Ordinary','Discuss','buy') RETURNING id,updated_at::text AS version",[user.id,groupRow.id])).rows[0];
    await db.query("UPDATE advisor_signals SET sentiment='bullish' WHERE id=$1",[fresh.id]);
    expect((await db.query("SELECT updated_at::text AS version FROM advisor_signals WHERE id=$1",[fresh.id])).rows[0].version).toBe(fresh.version);
    await db.query("UPDATE advisor_signals SET content='Edit' WHERE id=$1",[fresh.id]);
    const stale = await db.query("UPDATE advisor_signals SET baseline_price=100 WHERE id=$1 AND updated_at=$2::timestamptz RETURNING id",[fresh.id,fresh.version]);
    expect(stale.rows).toHaveLength(0);
    await db.query("DELETE FROM advisor_signals WHERE id=$1",[fresh.id]);
    expect((await db.query("SELECT prediction_accuracy FROM advisor_signals WHERE id=$1",[signal.id])).rows[0].prediction_accuracy).toBe(0);
  } finally { await db.close(); }
},60000);
