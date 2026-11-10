import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ProfileLinkChecks } from "../src/app/components/agents/ProfileLinkChecks";
import { AgentResult } from "../src/app/components/agents/AgentRunCard";
import type { ProfileLinkCheck } from "../src/app/types/profile-links";
const link:ProfileLinkCheck={id:"profile-link:1",providedUrl:"https://www.linkedin.com/in/example-person",url:"https://www.linkedin.com/in/example-person",origins:["Registration application"],accessStatus:"read",checkedAt:"2026-11-08T00:00:00Z",comparisonStatus:"inconsistent",reason:"Page read",summary:"One detail differs",comparisons:[{fieldId:"personal.fullName",label:"Full name",claimed:"Example Person",status:"inconsistent",reasoning:"Different name on supplied page",quotes:["Different Person works at Example Company"]}]};
it("shows the supplied URL, mismatch, claim and actual page excerpt in the returned agent report",()=>{
  const html=renderToStaticMarkup(<AgentResult result={{summary:"Background check",findings:{profileLinks:[link]}}}/>);
  for(const text of ["Supplied profile links","Public page read","Details differ",link.url!,"Example Person","Different Person works at Example Company"]) expect(html).toContain(text);
});
it("clearly reports login barriers without a success badge or fabricated comparison",()=>{
  const html=renderToStaticMarkup(<ProfileLinkChecks links={[{...link,accessStatus:"login_required",comparisonStatus:"inconclusive",comparisons:[],summary:"The page requires login; the profile could not be checked."}]}/>);
  expect(html).toContain("Login or private access required");
  expect(html).not.toContain("Public page read");
  expect(html).not.toContain("Details supported by page");
});
