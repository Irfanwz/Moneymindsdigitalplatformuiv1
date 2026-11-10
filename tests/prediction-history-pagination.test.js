import { afterEach, expect, it, vi } from "vitest";
import { createSupabaseStore } from "../server/store/supabaseStore.js";
afterEach(() => vi.unstubAllGlobals());

it("does not skip a checked loss when ordinary posts are deleted between history pages", async () => {
  const rows = Array.from({length:501},(_,i)=>({id:String(i).padStart(6,"0"),advisor_id:"fixture",tags:[],created_at:"2020-01-01T00:00:00Z",
    prediction_checked_at:i<5 || i===500 ? "2020-01-08T00:00:00Z" : null,
    prediction_result:i<5 ? "correct" : i===500 ? "incorrect" : null,
    prediction_accuracy:i<5 ? 100 : i===500 ? 0 : null}));
  let calls=0;
  vi.stubGlobal("fetch",vi.fn(async input => {
    const url = new URL(input instanceof Request ? input.url : input);
    expect(url.pathname).toContain("advisor_signals");
    const cursor = url.searchParams.get("id")?.replace(/^gt\./,"");
    const selected = rows.filter(r=>!cursor || r.id>cursor).slice(0,Number(url.searchParams.get("limit")));
    if (++calls===1) rows.splice(10,1); // Delete a filler from the first page.
    return Response.json(selected);
  }));
  const store = createSupabaseStore({supabaseUrl:"https://fixture.supabase.co",supabaseServiceRoleKey:"fixture"});
  const history = await store.listPredictionHistoryByAdvisor("fixture");
  expect(history.filter(s=>s.predictionCheckedAt)).toHaveLength(6);
  expect(history.find(s=>s.id==="000500").predictionResult).toBe("incorrect");
  expect(calls).toBe(3);
});
