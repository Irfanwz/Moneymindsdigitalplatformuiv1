import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { config } from "../server/config.js";
import { collectProfileLinks, readProfileUrl, readProvidedProfileLinks } from "../server/services/profileLinkService.js";

const originalKey=config.tavilyApiKey;
const url="https://www.linkedin.com/in/example-person";
const content="Example Person is a Financial Advisor at Example Firm. Experience: five years of financial planning and consulting.";
beforeEach(()=>{ config.tavilyApiKey="fixture-secret"; vi.stubGlobal("fetch",vi.fn()); });
afterEach(()=>{ config.tavilyApiKey=originalKey; vi.unstubAllGlobals(); });
const respond=body=>fetch.mockResolvedValue(Response.json(body));
const field=(id,value)=>({id,value,role:"advisor",origin:"Registration application",policy:"evidence"});

it("extracts the exact supplied URL through the fixed reader and retains its timestamp",async()=>{
  respond({results:[{url,raw_content:content}],failed_results:[]});
  const result=await readProfileUrl(url);
  expect(result).toMatchObject({accessStatus:"read",resolvedUrl:url,text:content,truncated:false});
  expect(Date.parse(result.checkedAt)).not.toBeNaN();
  const [endpoint,init]=fetch.mock.calls[0];
  expect(endpoint).toBe("https://api.tavily.com/extract");
  expect(JSON.parse(init.body).urls).toEqual([url]);
  expect(init.redirect).toBe("error");
  expect(init.headers.Cookie).toBeUndefined();
});
it.each([
  ["Sign in to view this profile. Authentication required.","login_required"],
  ["Access denied. Please verify you are human.","blocked"],
  ["Page not found. This page does not exist.","not_found"],
])("does not use a successful extraction of an access/error page (%s)",async(text,status)=>{
  respond({results:[{url,raw_content:text.repeat(5)}]});
  expect(await readProfileUrl(url)).toMatchObject({accessStatus:status});
});
it("does not substitute another URL or a same-name person's profile",async()=>{
  respond({results:[{url:"https://www.linkedin.com/in/another-person",raw_content:content}]});
  const result=await readProfileUrl(url);
  expect(result.accessStatus).toBe("different_url");
  expect(result.text).toBeUndefined();
});
it("handles per-URL failures even when HTTP succeeds and never exposes raw provider errors",async()=>{
  respond({results:[],failed_results:[{url,error:"403 forbidden fixture-secret"}]});
  const result=await readProfileUrl(url);
  expect(result.accessStatus).toBe("blocked");
  expect(JSON.stringify(result)).not.toContain("fixture-secret");
});
it("reports provider outage, missing configuration and timeouts without inventing a visit",async()=>{
  fetch.mockResolvedValue(new Response("unavailable",{status:503}));
  expect((await readProfileUrl(url)).accessStatus).toBe("unavailable");
  fetch.mockRejectedValue(new Error("Timeout"));
  expect((await readProfileUrl(url)).accessStatus).toBe("unavailable");
  config.tavilyApiKey=""; fetch.mockClear();
  expect((await readProfileUrl(url)).accessStatus).toBe("not_configured");
  expect(fetch).not.toHaveBeenCalled();
});
it.each(["file:///etc/passwd","http://127.0.0.1/","http://2130706433/","http://[::1]/","http://localhost/","https://service.internal/","https://name:password@example.com/","https://example.com:444/"])("rejects non-public or credential-bearing URL %s",async value=>{
  expect((await readProfileUrl(value)).accessStatus).toBe("invalid_url");
  expect(fetch).not.toHaveBeenCalled();
});
it("bounds extracted text and rejects excessively large responses",async()=>{
  respond({results:[{url,raw_content:content.repeat(200)}]});
  expect(await readProfileUrl(url)).toMatchObject({accessStatus:"read",truncated:true});
  respond({results:[{url,raw_content:"a".repeat(1024*1024+1)}]});
  expect((await readProfileUrl(url)).accessStatus).toBe("unavailable");
});
it("collects original/current/nested links, deduplicates pages and skips private reference contacts",()=>{
  const links=collectProfileLinks({fields:[field("advisor.linkedin",url),field("current.advisor.linkedin",url+"#about"),
    field("current.advisor.clientReviews",[{id:"review1",sourceUrl:"https://example.com/review"}]),
    field("advisor.references.ref1.contact","https://private.example.com/")]});
  expect(links).toHaveLength(2);
  expect(links[0].fieldIds).toEqual(["advisor.linkedin","current.advisor.linkedin"]);
  expect(links[1].fieldIds).toEqual(["current.advisor.clientReviews.review1.sourceUrl"]);
});
it("lists every supplied URL while explicitly marking links beyond the per-run budget",async()=>{
  fetch.mockImplementation(async(_endpoint,init)=>Response.json({results:[{url:JSON.parse(init.body).urls[0],raw_content:content}]}));
  const context={fields:Array.from({length:13},(_,i)=>field(`advisor.clientReviews.${i}.sourceUrl`,`https://example.com/review/${i}`))};
  const result=await readProvidedProfileLinks(context);
  expect(fetch).toHaveBeenCalledTimes(12);
  expect(result.links).toHaveLength(13);
  expect(result.sources).toHaveLength(12);
  expect(result.links[12].accessStatus).toBe("not_checked");
});
