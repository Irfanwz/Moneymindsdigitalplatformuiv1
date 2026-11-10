import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { createMemoryStore } from "../server/store/memoryStore.js";
import { runForUser } from "../server/services/verificationAgent.js";
import { generateJSON } from "../server/services/aiProvider.js";
import { searchService } from "../server/services/searchService.js";
import { config } from "../server/config.js";

vi.mock("../server/services/aiProvider.js",()=>({generateJSON:vi.fn(),configuredProviders:()=>["test"]}));
vi.mock("../server/services/searchService.js",()=>({searchService:{batchSearch:vi.fn()}}));
const oldKey=config.tavilyApiKey;
const url="https://www.linkedin.com/in/example-person";
const pageText="Different Person works as a Software Engineer at Example Company. This public profile describes their engineering experience.";
const report={recommendation:"accept",confidence:95,credibility_score:90,summary:"An assessment",findings:{linkedin_found:true,linkedin_url:url,company_verified:false,company_url:null,news_mentions:0,red_flags:[],positive_signals:[]},sources:[],report_markdown:"A background report"};
let store,user;
beforeEach(async()=>{
  vi.clearAllMocks(); config.tavilyApiKey="fixture";
  store=createMemoryStore();
  user=await store.createUserProfile({fullName:"Example Person",email:"person@example.test",passwordHash:"private-hash",requestedRoles:["advisor"]});
  await store.upsertAdvisorProfile(user.id,{title:"Financial Advisor",linkedin:url,expertiseAreas:[],industries:[],certifications:[]});
  vi.stubGlobal("fetch",vi.fn(async()=>Response.json({results:[{url,raw_content:pageText}],failed_results:[]})));
  searchService.batchSearch.mockResolvedValue([{url:"https://example.com/search-evidence",title:"Similar name",content:"Example Person works in finance."}]);
  generateJSON.mockImplementation(async(_system,prompt,options)=>({provider:"test",data:options.validate({...report,profile_link_checks:[{linkId:"profile-link:1",fieldId:"personal.fullName",status:"inconsistent",reasoning:"The supplied page names a different person.",quote:"Different Person works as a Software Engineer at Example Company."}]})}));
});
afterEach(()=>{ config.tavilyApiKey=oldKey; vi.unstubAllGlobals(); });

it("reads the supplied profile, persists its mismatch and does not accept it using a same-name search hit",async()=>{
  const result=await runForUser(user.id,store);
  expect(result.status).toBe("complete");
  expect(result.recommendation).toBe("review");
  expect(result.findings.profileLinks[0]).toMatchObject({url,accessStatus:"read",comparisonStatus:"inconsistent"});
  expect(result.findings.profileLinks[0].comparisons[0]).toMatchObject({claimed:"Example Person",quotes:["Different Person works as a Software Engineer at Example Company."]});
  expect(result.sources.some(s=>s.url===url)).toBe(true);
  expect((await store.findVerification(user.id)).findings.profileLinks).toEqual(result.findings.profileLinks);
  expect(JSON.stringify(generateJSON.mock.calls)).not.toContain("private-hash");
  expect((await store.findUserById(user.id)).status).toBe("pending");
});
it("returns a useful access report when every supplied link is blocked and no search evidence is available",async()=>{
  fetch.mockResolvedValue(Response.json({results:[],failed_results:[{url,error:"login required"}]}));
  searchService.batchSearch.mockResolvedValue([]);
  const result=await runForUser(user.id,store);
  expect(result).toMatchObject({status:"complete",recommendation:"review",credibilityScore:null,confidence:null});
  expect(result.findings.profileLinks[0]).toMatchObject({accessStatus:"login_required",comparisons:[]});
  expect(generateJSON).not.toHaveBeenCalled();
});
it("does not attach invented quotes to a successfully retrieved profile",async()=>{
  generateJSON.mockResolvedValue({data:{...report,profile_link_checks:[{linkId:"profile-link:1",fieldId:"personal.fullName",status:"supported",reasoning:"Looks correct",quote:"Example Person is a licensed advisor"}]}});
  const result=await runForUser(user.id,store);
  expect(result.findings.profileLinks[0].comparisons).toEqual([]);
  expect(result.recommendation).toBe("review");
});
it("does not show a different search profile as confirmation of the supplied blocked LinkedIn page",async()=>{
  fetch.mockResolvedValue(Response.json({results:[],failed_results:[{url,error:"403 forbidden"}]}));
  generateJSON.mockResolvedValue({data:{...report,summary:"The profile is verified",findings:{...report.findings,linkedin_url:"https://www.linkedin.com/in/someone-else"}}});
  const result=await runForUser(user.id,store);
  expect(result).toMatchObject({recommendation:"review",confidence:null,credibilityScore:null});
  expect(result.findings).toMatchObject({linkedin_found:false,linkedin_url:url});
  expect(result.summary).toContain("0 read, 1 not read");
  expect(result.summary).not.toContain("profile is verified");
});
it("can compare a supplied page even if broad search returns no results",async()=>{
  searchService.batchSearch.mockResolvedValue([]);
  const result=await runForUser(user.id,store);
  expect(result.status).toBe("complete");
  expect(result.findings.profileLinks[0].accessStatus).toBe("read");
  expect(generateJSON.mock.calls[0][1]).toContain(pageText);
});
