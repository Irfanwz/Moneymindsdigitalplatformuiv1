import { config } from "../config.js";

const TAVILY_URL = "https://api.tavily.com/search";
const TIMEOUT_MS = 10_000;

/**
 * Run a single Tavily search query.
 * Never throws — returns [] on any error so the agent can continue.
 */
async function search(query) {
  if (!config.tavilyApiKey) return [];

  try {
    const response = await fetch(TAVILY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: config.tavilyApiKey,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(`[SearchService] Tavily returned ${response.status} for: ${query}`);
      return [];
    }

    const data = await response.json();
    return (data.results ?? []).map((r) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: (r.content ?? "").slice(0, 500), // cap content length
      score: r.score ?? 0,
      query,
    }));
  } catch (err) {
    console.warn(`[SearchService] Search failed for "${query}": ${err.message}`);
    return [];
  }
}

/**
 * Run multiple queries concurrently, collecting all results.
 * Deduplicated by URL.
 */
async function batchSearch(queries) {
  if (!queries || queries.length === 0) return [];

  const settled = await Promise.allSettled(queries.map((q) => search(q)));
  const all = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

  // Deduplicate by URL
  const seen = new Set();
  return all.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}

export const searchService = { search, batchSearch };
