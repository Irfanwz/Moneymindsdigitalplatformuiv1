// Built frontend, isolated fixture server, and intercepted publishing: no live data or AI.
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import puppeteer from "puppeteer";
process.env.NODE_ENV = "test";
globalThis.fetch = async () => { throw new Error("External request blocked in browser check"); };
const [{createApp},{createMemoryStore},{createToken},{default:express}] = await Promise.all([
  import("../server/app.js"),import("../server/store/memoryStore.js"),import("../server/auth.js"),import("express"),
]);
const store=createMemoryStore();
const user=await store.createUserProfile({fullName:"Signal Fixture",email:"signal@example.test",passwordHash:"unused",requestedRoles:["advisor"]});
await store.updateApproval(user.id,{status:"approved",approvedRoles:["advisor"]});
await store.upsertAdvisorProfile(user.id,{title:"Advisor",specialization:"Crypto",yearsExperience:"5",linkedin:"https://www.linkedin.com/in/fixture",expertiseAreas:[],industries:[],certifications:[]});
const group=await store.createGroup(user.id,{name:"Signal fixture group",description:"Fixture",category:"crypto",isPaid:false,isPrivate:false});
const app=createApp(store,{backgroundJobs:false});
app.use(express.static(path.resolve("dist")));
app.get("/{*splat}",(_req,res)=>res.sendFile(path.resolve("dist/index.html")));
const server=app.listen(0,"127.0.0.1");
await new Promise(resolve=>server.once("listening",resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
const errors=[];
try {
  browser=await puppeteer.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});
  await fs.mkdir("docs/signal-validation",{recursive:true});
  for(const theme of ["light","dark"]) {
    const context=await browser.createBrowserContext();
    await context.setCookie({name:"mm_token",value:createToken(user),url:origin,httpOnly:true,sameSite:"Strict"});
    const page=await context.newPage();
    await page.emulateTimezone("Asia/Karachi");
    await page.setViewport({width:theme==="dark" ? 390 : 1280,height:900});
    await page.evaluateOnNewDocument(theme=>localStorage.setItem("moneyminds-theme",theme),theme);
    page.on("pageerror",error=>errors.push(error.message));
    let published;
    await page.setRequestInterception(true);
    page.on("request",request=>{
      if(request.method()==="POST" && request.url().endsWith(`/groups/${group.id}/signals`)) {
        published=JSON.parse(request.postData());
        request.respond({status:201,contentType:"application/json",body:JSON.stringify({signal:{id:"fixture"}})});
      } else if(request.url().startsWith(origin) || /^(data|blob):/.test(request.url())) request.continue();
      else request.abort();
    });
    for(const mode of ["hour","duration","date"]) {
      published=null;
      await page.goto(`${origin}/advisor/groups/${group.id}/create-signal`,{waitUntil:"networkidle0",timeout:60000});
      await page.type("#signal-title","BTC forecast");
      await page.type("#signal-content","BTC will rise over the selected duration.");
      let expected="1hours";
      if(mode==="duration") {
        await page.select("select","duration");
        await page.select('[aria-label="Duration unit"]',"months");
        await page.focus('[aria-label="Duration amount"]');
        await page.keyboard.down("Control"); await page.keyboard.press("A"); await page.keyboard.up("Control");
        await page.keyboard.press("Backspace");
        await page.type('[aria-label="Duration amount"]',"3");
        expected="3months";
      }
      if(mode==="date") {
        await page.select("select","date");
        expected=await page.$eval('[aria-label="Expiry date and time"]',input=>{
          const date=new Date(Date.now()+2*86400000);
          const local=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(input,local);
          input.dispatchEvent(new Event("input",{bubbles:true}));
          input.dispatchEvent(new Event("change",{bubbles:true}));
          return `until:${new Date(local).toISOString()}`;
        });
        await page.screenshot({path:`docs/signal-validation/${theme}-${mode}.png`,fullPage:true});
      }
      await page.evaluate(()=>[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="Publish Signal").click());
      await page.waitForFunction(()=>location.pathname==="/advisor/groups",{timeout:30000});
      assert.equal(published?.timeHorizon,expected);
      console.log(`PASS ${theme} ${mode}: published exact selected horizon`);
    }
    await context.close();
  }
  assert.deepEqual(errors,[]);
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
