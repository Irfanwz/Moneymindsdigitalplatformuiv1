import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { KeyList, TokenLimitField } from "../src/app/components/admin/AIConfigPage";
import { AgentHealthPanel } from "../src/app/components/agents/AgentHealthPanel";
import type { AgentRun } from "../src/app/lib/agents";

it("renders every masked key with a configured, untested explanation",()=>{
  const html=renderToStaticMarkup(<KeyList name="Groq" source="environment" keys={[1,2,3].map(slot=>({slot,hint:`gsk_...00${slot}`}))} />);
  for(const slot of [1,2,3]) expect(html).toContain(`Groq key ${slot}`);
  expect(html).toContain("not necessarily passed a live request");
});

it("distinguishes no limit from zero and disables only the unlimited input",()=>{
  const unlimited=renderToStaticMarkup(<TokenLimitField label="Daily" value={null} onChange={()=>{}} />);
  expect(unlimited).toContain('checked=""');expect(unlimited).toContain('disabled=""');
  expect(unlimited).toContain('aria-label="Daily — No limit"');
  const zero=renderToStaticMarkup(<TokenLimitField label="Daily" value={0} onChange={()=>{}} />);
  expect(zero).not.toContain('checked=""');expect(zero).not.toContain('disabled=""');expect(zero).toContain('value="0"');
});

it("does not label skipped, missing, or rule-based runs as successful provider checks",()=>{
  const runs=[{id:"1",agentKey:"verification",createdAt:"2026-11-10T10:00:00Z",status:"skipped",error:"No profile evidence"},
    {id:"2",agentKey:"credibility",createdAt:"2026-11-10T10:00:00Z",status:"completed",usage:{calls:[]}}] as AgentRun[];
  const html=renderToStaticMarkup(<AgentHealthPanel runs={runs} onInspect={()=>{}} />);
  expect(html).toContain("Skipped — not tested");expect(html).toContain("No recent run");
  expect(html).toContain("Rule-based calculation");expect(html).toContain("no automatic AI moderation agent");
});
