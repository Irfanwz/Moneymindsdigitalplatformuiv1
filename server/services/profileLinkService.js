import { isIP } from "node:net";
import { config } from "../config.js";

const MAX_LINKS = 12;
const MAX_TEXT = 16000;
const linkKeys = new Set(["linkedin", "website", "twitter", "sourceUrl", "profileUrl", "portfolioUrl"]);

export function publicProfileUrl(value) {
  try {
    if (typeof value !== "string" || value.length > 2048) return null;
    const url = new URL(value);
    const host = url.hostname.replace(/\.$/, "").toLowerCase();
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.port ||
        !host.includes(".") || isIP(host) || host.includes(":") ||
        /(^|\.)(localhost|local|internal|lan|home|onion)$/.test(host)) return null;
    url.hash = "";
    return url.href;
  } catch { return null; }
}

export function collectProfileLinks(context) {
  const links = new Map();
  function visit(value, key, field, path = field.id) {
    if (linkKeys.has(key) && typeof value === "string" && value.trim()) {
      const providedUrl = value.trim();
      const url = publicProfileUrl(providedUrl);
      const dedup = url || providedUrl;
      if (!links.has(dedup)) links.set(dedup, {
        id:`profile-link:${links.size + 1}`, providedUrl, url,
        fieldIds:[], roles:[], origins:[], accessStatus:"not_checked", comparisons:[],
      });
      const link = links.get(dedup);
      for (const [property, item] of [["fieldIds",path],["roles",field.role],["origins",field.origin]]) {
        if (!link[property].includes(item)) link[property].push(item);
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, "", field, `${path}.${item?.id || index}`));
    } else if (value && typeof value === "object") {
      for (const [child, item] of Object.entries(value)) visit(item, child, field, `${path}.${child}`);
    }
  }
  for (const field of context.fields) {
    if (field.policy === "manual" || field.id.includes(".references")) continue;
    visit(field.value, field.id.split(".").at(-1), field);
  }
  return [...links.values()];
}

function accessFailure(error) {
  const message = String(error || "").toLowerCase();
  if (/login|log in|sign in|authwall|authentication|private profile/.test(message))
    return {accessStatus:"login_required",reason:"The page requires login or is private. Its profile content could not be checked."};
  if (/403|999|forbidden|denied|captcha|robot|challenge|verify.{0,15}human|unusual traffic/.test(message))
    return {accessStatus:"blocked",reason:"The site blocked public access. Its profile content could not be checked."};
  if (/404|not found|does not exist|doesn't exist|page.{0,10}unavailable/.test(message))
    return {accessStatus:"not_found",reason:"The supplied page could not be found or is unavailable."};
  return {accessStatus:"unavailable",reason:"The page reader could not retrieve this URL. This is not evidence that the profile is false."};
}

async function limitedJson(response) {
  if (!response.body) throw new Error("Empty provider response");
  const reader = response.body.getReader();
  const parts = [];
  let size = 0;
  try {
    for (;;) {
      const {done,value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024 * 1024) throw new Error("Provider response exceeded limit");
      parts.push(Buffer.from(value));
    }
  } finally { await reader.cancel().catch(() => {}); }
  return JSON.parse(Buffer.concat(parts).toString("utf8"));
}

// Only this fixed provider endpoint is contacted by our server. The submitted
// URL is data for public-page extraction; no app cookies or login are supplied.
export async function readProfileUrl(value) {
  const url = publicProfileUrl(value);
  const checkedAt = new Date().toISOString();
  if (!url) return {accessStatus:"invalid_url",reason:"Provide a public HTTP or HTTPS profile URL without login details or a custom port.",checkedAt};
  if (!config.tavilyApiKey) return {accessStatus:"not_configured",reason:"Public page reading is not configured. This URL was not visited.",checkedAt};
  try {
    const response = await fetch("https://api.tavily.com/extract", {
      method:"POST", redirect:"error", signal:AbortSignal.timeout(15000),
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${config.tavilyApiKey}`},
      body:JSON.stringify({urls:[url],extract_depth:"advanced",format:"text",include_images:false,timeout:12}),
    });
    if (!response.ok) return {accessStatus:"unavailable",reason:"The page-reading provider is unavailable. The supplied profile was not verified.",checkedAt};
    const body = await limitedJson(response);
    const results = Array.isArray(body.results) ? body.results : [];
    const page = results.find(item => publicProfileUrl(item.url) === url);
    if (!page) {
      const otherUrl = results.map(item => publicProfileUrl(item.url)).find(Boolean);
      if (otherUrl) return {accessStatus:"different_url",resolvedUrl:otherUrl,reason:"The provider returned a different URL. It was not used as evidence for the supplied profile.",checkedAt};
      const failed = (Array.isArray(body.failed_results) ? body.failed_results : []).find(item => publicProfileUrl(item.url) === url);
      return {...accessFailure(failed?.error),checkedAt};
    }
    const text = typeof page.raw_content === "string" ? page.raw_content.trim() : "";
    const heading = text.slice(0, 600);
    // Do not mistake a successful extraction of a login/challenge page for a profile.
    if (/^\s*(?:#+\s*)?(?:linkedin\s*[-|:]?\s*)?(?:sign in|log in|login|join linkedin|access denied|page not found|verify you are human|security verification)/i.test(heading) ||
        /authwall|captcha|verify.{0,15}human|unusual traffic|sign in to (?:view|see|continue)|log in to (?:view|see|continue)/i.test(heading)) {
      return {...accessFailure(heading),checkedAt};
    }
    if (text.length < 80) return {accessStatus:"insufficient_content",reason:"Too little public profile text was returned to compare the supplied details.",checkedAt};
    return {accessStatus:"read",checkedAt,resolvedUrl:url,title:String(page.title || url).slice(0,300),
      text:text.slice(0,MAX_TEXT),truncated:text.length > MAX_TEXT,
      reason:"Public page text was retrieved. It may be partial and does not establish who controls the profile."};
  } catch { return {...accessFailure(""),checkedAt}; }
}

export async function readProvidedProfileLinks(context, progress = async () => {}) {
  const links = collectProfileLinks(context);
  const sources = [];
  for (let i=0;i<links.length;i+=2) {
    await Promise.all(links.slice(i,i+2).map(async (link,index) => {
      if (i+index >= MAX_LINKS) {
        Object.assign(link,{accessStatus:"not_checked",reason:`This run reads up to ${MAX_LINKS} distinct supplied links. Review this additional link manually.`});
        return;
      }
      const {text, ...result} = await readProfileUrl(link.providedUrl);
      Object.assign(link,result);
      const personLink = link.fieldIds.some(id => /^(?:current\.)?(advisor|investor)\.(linkedin|website|twitter)$/.test(id));
      if (result.accessStatus === "read") sources.push({id:link.id,kind:"profile_link",url:link.url,title:result.title,text,
        checkedAt:result.checkedAt,truncated:result.truncated,prefixes:[...link.roles.map(role => `${role}.`),...(personLink ? ["personal."] : [])]});
    }));
    await progress(`Processed ${Math.min(i+2,links.length)} of ${links.length} supplied profile links`,30);
  }
  return {links,sources};
}

export function profileLinkComparisons(links, fieldChecks) {
  return links.map(link => {
    const comparisons = link.accessStatus === "read" ? fieldChecks.flatMap(field => {
      if (linkKeys.has(field.id.split(".").at(-1))) return [];
      const quotes = (field.evidence || []).filter(ref => ref.sourceId === link.id).map(ref => ref.quote);
      return quotes.length ? [{fieldId:field.id,label:field.label,claimed:field.value,status:field.status,reasoning:field.reasoning,quotes}] : [];
    }) : [];
    const different = comparisons.filter(c => c.status === "inconsistent").length;
    const supported = comparisons.filter(c => c.status === "supported").length;
    return {...link,comparisons,comparisonStatus:different ? "inconsistent" : supported ? "supported" : "inconclusive",
      summary:link.accessStatus !== "read" ? link.reason : comparisons.length
        ? `Supported claims: ${supported}; conflicting claims: ${different}. Profile ownership and authenticity still require confirmation.`
        : "The page was read, but no claim comparison with a matching page excerpt was returned. Manual review is required."};
  });
}
