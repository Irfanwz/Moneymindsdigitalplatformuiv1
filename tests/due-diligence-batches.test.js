import { describe, expect, it } from "vitest";
import { planEvidenceRequests } from "../server/services/dueDiligenceBatches.js";
import { estimateAIInput } from "../server/services/aiTokenEstimate.js";

describe("Due diligence token-aware evidence planning", () => {
  const system = "Check each claim against the supplied evidence.";
  const makeInput = sources => ({ fields: [{ id: "startup.companyName", value: "Example" }], sources });

  it("packs ordinary GPT-OSS text efficiently while retaining conservative bounds for other models", () => {
    const text = "The company registration was reviewed by the issuing office. ".repeat(220);
    const sources = [{ id: "doc:registry", kind: "document", text }];
    const efficient = planEvidenceRequests(system, sources, makeInput, { model: "openai/gpt-oss-20b" });
    expect(efficient).toHaveLength(1);
    expect(efficient[0].sources[0].text).toBe(text);
    expect(estimateAIInput(system, efficient[0].prompt, "openai/gpt-oss-20b")).toBeLessThanOrEqual(5000);
    for (const model of [undefined, "llama-3.3-70b-versatile"]) {
      const requests = planEvidenceRequests(system, sources, makeInput, { model });
      expect(requests.length).toBeGreaterThan(1);
      const covered = new Uint8Array(text.length);
      for (const request of requests) {
        expect(estimateAIInput(system, request.prompt, model)).toBeLessThanOrEqual(5000);
        for (const excerpt of request.sources) {
          expect(excerpt.id).toBe("doc:registry");
          expect(excerpt.text).toBe(text.slice(excerpt.excerptStart, excerpt.excerptEnd));
          covered.fill(1, excerpt.excerptStart, excerpt.excerptEnd);
        }
      }
      expect(covered.every(Boolean)).toBe(true);
    }
  });
});
