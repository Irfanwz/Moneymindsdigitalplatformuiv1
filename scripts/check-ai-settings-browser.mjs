// Run in an isolated source copy after npm run build. No provider calls or real DB.
import assert from "node:assert/strict";
import path from "node:path";
import puppeteer from "puppeteer";
import express from "express";
process.env.NODE_ENV="test";
for(const key of Object.keys(process.env)) if(/SUPABASE|SENDGRID|API_KEY|STRIPE|GROQ|GEMINI|ANTHROPIC|AI_CONFIG_ENCRYPTION/.test(key)) delete process.env[key];
const [{createApp},{createMemoryStore},{createToken},{config},{setAiConfigClient},{decryptKey}]=await Promise.all([
  import("../server/app.js"),import("../server/store/memoryStore.js"),import("../server/auth.js"),import("../server/config.js"),import("../server/services/aiConfigStore.js"),import("../server/services/aiEncryption.js"),
]);
Object.assign(config,{aiProvider:"auto",groqApiKeys:["fixture-groq-key-001","fixture-groq-key-002","fixture-groq-key-003"],geminiApiKey:"fixture-gemini-key-004",anthropicApiKey:""});
let row=null;
setAiConfigClient({from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:row,error:null})})}),upsert:async patch=>{row={...row,...patch};return {error:null};}})});
globalThis.fetch=async()=>{throw new Error("External requests are disabled in browser verification");};
const store=createMemoryStore();
const admin=await store.ensureAdminAccount({fullName:"AI Settings Tester",email:"settings@example.test",passwordHash:"unused"});
const app=createApp(store,{backgroundJobs:false});
app.use(express.static(path.resolve("dist")));
app.get("/{*splat}",(_req,res)=>res.sendFile(path.resolve("dist/index.html")));
const server=app.listen(0,"127.0.0.1");await new Promise(resolve=>server.once("listening",resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",args:["--no-sandbox"]});
const page=await browser.newPage(),errors=[];
page.on("pageerror",error=>errors.push(error.message));
await page.setRequestInterception(true);
page.on("request",request=>request.url().startsWith(origin) || request.url().startsWith("data:") ? request.continue() : request.abort());
async function button(text) {
  const handle=await page.evaluateHandle(text=>[...document.querySelectorAll("button")].find(el=>el.textContent.trim()===text),text);
  assert(handle.asElement(),`Missing button: ${text}`);await handle.asElement().click();await handle.dispose();
}
async function fill(selector,value) {await page.click(selector);await page.keyboard.down("Control");await page.keyboard.press("A");await page.keyboard.up("Control");await page.type(selector,value);}
async function save() {
  const response=page.waitForResponse(res=>res.url().endsWith("/api/admin/ai-config") && res.request().method()==="PUT");
  await button("Save configuration");assert.equal((await response).status(),200);
  await page.waitForFunction(()=>[...document.querySelectorAll("button")].some(el=>el.textContent.trim()==="Save configuration" && !el.disabled));
}
try {
  await page.setCookie({name:"mm_token",value:createToken(admin),url:origin,httpOnly:true,sameSite:"Strict"});
  await page.goto(origin+"/admin/ai-config",{waitUntil:"networkidle0"});
  await page.waitForSelector('input[aria-label="Daily token limit"]');
  let text=await page.$eval("body",el=>el.textContent);
  for(const slot of [1,2,3]) assert(text.includes(`Groq key ${slot}`));
  assert(text.includes("Gemini key 1"));
  for(const key of [...config.groqApiKeys,config.geminiApiKey]) assert(!text.includes(key));
  const daily='input[aria-label="Daily token limit"]',unlimited='input[aria-label="Daily token limit — No limit"]';
  assert(await page.$eval(unlimited,el=>el.checked));assert(await page.$eval(daily,el=>el.disabled));
  await page.click(unlimited);await fill(daily,"1234");await save();assert.equal(row.daily_token_limit,1234);
  await fill(daily,"100");await save();assert.equal(row.daily_token_limit,100);
  await page.click(unlimited);await save();assert.equal(row.daily_token_limit,null);
  await page.reload({waitUntil:"networkidle0"});await page.waitForSelector(unlimited);assert(await page.$eval(unlimited,el=>el.checked));
  await page.click(unlimited);await fill(daily,"0");await save();assert.equal(row.daily_token_limit,0);
  await page.click('input[aria-label="Background verification — No limit"]');
  await fill('input[aria-label="Background verification"]',"600");await save();assert.equal(row.agent_token_limits.verification,600);
  await page.click('input[aria-label="Background verification — No limit"]');await save();assert.equal(row.agent_token_limits.verification,undefined);
  await fill('input[aria-label="New Groq key 1"]',"replacement-groq-001");
  await fill('input[aria-label="New Groq key 2"]',"replacement-groq-002");
  await button("gemini");await save();assert.equal(row.active_provider,"gemini");
  assert.deepEqual(JSON.parse(decryptKey(row.groq_key_enc)),["replacement-groq-001","replacement-groq-002"]);
  assert.equal(await page.$eval('input[aria-label="New Groq key 1"]',el=>el.value),"");
  await button("Auto");await save();assert.equal(row.active_provider,"auto");
  await page.setViewport({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.goto(origin+"/admin/agents",{waitUntil:"networkidle0"});
  await page.waitForFunction(()=>document.body.textContent.includes("Agent check results"));
  text=await page.$eval("body",el=>el.textContent);
  assert(text.includes("No recent run"));assert(text.includes("no automatic AI moderation agent"));
  const documentRun=await store.createAgentRun({userId:admin.id,agentKey:"document",targetId:"fixture-document"});
  await store.createAgentRun({userId:admin.id,agentKey:"verification",targetId:"fixture-verification"});
  await page.goto(origin+"/admin/agents/documents",{waitUntil:"networkidle0"});
  await page.waitForFunction(()=>document.body.textContent.includes("upload the document again"));
  assert(!(await page.$eval("body",el=>el.textContent)).includes("Resume queued run"));
  await page.goto(origin+"/admin/agents/verification",{waitUntil:"networkidle0"});
  await page.waitForFunction(()=>document.body.textContent.includes("Resume queued run"));
  await store.updateAgentRun(documentRun.id,{status:"failed",usage:{calls:[{provider:"gemini",model:"unpriced-fixture",startedAt:new Date().toISOString(),inputTokens:9,outputTokens:3,totalTokens:12}]}});
  await page.goto(origin+"/admin/token-report",{waitUntil:"networkidle0"});
  await page.waitForFunction(()=>document.body.textContent.includes("Unavailable"));
  text=await page.$eval("body",el=>el.textContent);
  assert(text.includes("UTC"));
  assert(await page.evaluate(()=>[...document.querySelectorAll("tbody tr")].some(row=>row.textContent.includes("12") && row.textContent.includes("Unavailable"))));
  assert.deepEqual(errors,[]);
  console.log("Browser checks passed: masked keys, routing selection, token limits, saved key replacement, mobile layout, agent evidence panel, document re-upload guidance, supported resume action, and failed-run token report with unavailable pricing.");
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
