// Translate provider diagnostics into fixed messages. Never retain raw Google
// messages/metadata: those can contain credentials, project IDs or source text.
const messages = {
  API_KEY_INVALID: "Gemini rejected the API key. Replace the Gemini key in Admin > AI Config with a valid key from Google AI Studio.",
  API_KEY_RESTRICTED: "The Gemini key restrictions do not allow this request. Check the key's API and application restrictions in Google Cloud.",
  API_KEY_LEAKED: "Google blocked the Gemini key because it was reported as leaked. Replace it in Google AI Studio and Admin > AI Config.",
  SERVICE_DISABLED: "The Gemini API is disabled for the key's Google Cloud project. Enable the Generative Language API for that project.",
  BILLING_REQUIRED: "Gemini requires billing or available credit for this project. Check the project's billing status in Google AI Studio.",
  LOCATION_UNSUPPORTED: "Gemini rejected the server's location. Check Gemini's supported regions and your hosting region.",
  MODEL_NOT_FOUND: "The selected Gemini model is unavailable or does not support this API method. Check Gemini Model in Admin > AI Config and access for this Google project.",
  JSON_UNSUPPORTED: "The selected Gemini model does not support the requested JSON output mode. Choose a Gemini model that supports structured text output.",
  OUTPUT_LIMIT: "Gemini rejected the output-token setting. Check the selected model's output-token limit.",
  INVALID_ARGUMENT: "Gemini rejected the request format or settings. Check the selected model's supported input, JSON output and token limits.",
  FAILED_PRECONDITION: "Gemini's project requirements were not met. Check project verification, billing and region eligibility in Google AI Studio.",
  PERMISSION_DENIED: "Gemini denied access to this project or model. Check the key's permissions and Generative Language API access in Google Cloud.",
  RATE_LIMIT: "Gemini's request or token quota was reached. Wait for its quota reset or check limits in Google AI Studio.",
  UNAVAILABLE: "Gemini is temporarily unavailable. Please retry shortly.",
  REQUEST_FAILED: "Gemini rejected the request. Check the configured Google AI Studio key, model and request settings.",
};

const reasonCodes = new Map([
  ["API_KEY_INVALID", "API_KEY_INVALID"],
  ["API_KEY_EXPIRED", "API_KEY_INVALID"],
  ["API_KEY_SERVICE_BLOCKED", "API_KEY_RESTRICTED"],
  ["API_KEY_HTTP_REFERRER_BLOCKED", "API_KEY_RESTRICTED"],
  ["API_KEY_IP_ADDRESS_BLOCKED", "API_KEY_RESTRICTED"],
  ["API_KEY_ANDROID_APP_BLOCKED", "API_KEY_RESTRICTED"],
  ["API_KEY_IOS_APP_BLOCKED", "API_KEY_RESTRICTED"],
  ["API_KEY_LEAKED", "API_KEY_LEAKED"],
  ["SERVICE_DISABLED", "SERVICE_DISABLED"],
  ["BILLING_DISABLED", "BILLING_REQUIRED"],
]);
const statusCodes = new Map([
  ["INVALID_ARGUMENT", "INVALID_ARGUMENT"],
  ["FAILED_PRECONDITION", "FAILED_PRECONDITION"],
  ["PERMISSION_DENIED", "PERMISSION_DENIED"],
  ["UNAUTHENTICATED", "API_KEY_INVALID"],
  ["NOT_FOUND", "MODEL_NOT_FOUND"],
  ["RESOURCE_EXHAUSTED", "RATE_LIMIT"],
  ["UNAVAILABLE", "UNAVAILABLE"],
]);

function classify(status, error, details) {
  for (const detail of details) {
    if (detail?.["@type"] !== "type.googleapis.com/google.rpc.ErrorInfo") continue;
    const code = reasonCodes.get(detail.reason);
    if (code) return code;
  }
  // Some GenerateContent errors provide only a prose reason. Inspect known
  // phrases for classification, but never include that prose in our error.
  const message = typeof error?.message === "string" ? error.message.slice(0, 16000) : "";
  if ([400, 401, 403].includes(status)) {
    if (/api key.*(?:reported as leaked|has been leaked)/i.test(message)) return "API_KEY_LEAKED";
    if (/api key (?:not valid|is invalid|has expired)|invalid api key/i.test(message)) return "API_KEY_INVALID";
    if (/(?:enable|set up|setup) billing|billing (?:is )?(?:disabled|required)|insufficient (?:prepaid )?credit/i.test(message)) return "BILLING_REQUIRED";
    if (/(?:location|country|region).*(?:not supported|unsupported|not available)/i.test(message)) return "LOCATION_UNSUPPORTED";
    if (/(?:json mode|response_mime_type|responseMimeType).*(?:not enabled|not supported|unsupported)/i.test(message)) return "JSON_UNSUPPORTED";
    if (/(?:max_output_tokens|maxOutputTokens|max output tokens).*(?:must|exceed|limit|range|maximum|greater)/i.test(message)) return "OUTPUT_LIMIT";
    if (/model.*(?:not found|does not exist|not supported|not available)/i.test(message)) return "MODEL_NOT_FOUND";
  }
  return statusCodes.get(error?.status) || ({
    401: "API_KEY_INVALID", 403: "PERMISSION_DENIED", 404: "MODEL_NOT_FOUND",
    429: "RATE_LIMIT", 503: "UNAVAILABLE",
  })[status] || "REQUEST_FAILED";
}

function retryDelay(headers, details) {
  const header = headers?.get?.("retry-after")?.trim();
  if (header && /^\d+(?:\.\d+)?$/.test(header) && Number.isFinite(Number(header))) {
    return String(Math.max(1, Math.ceil(Number(header))));
  }
  // Preserve a valid HTTP-date header; shared retry handling interprets it.
  if (header && /^[A-Za-z]{3}, /.test(header) && Number.isFinite(Date.parse(header))) return header;
  for (const detail of details) {
    if (detail?.["@type"] !== "type.googleapis.com/google.rpc.RetryInfo" || typeof detail.retryDelay !== "string") continue;
    const match = /^(\d+(?:\.\d{1,9})?)s$/.exec(detail.retryDelay);
    if (match && Number.isFinite(Number(match[1]))) return String(Math.max(1, Math.ceil(Number(match[1]))));
  }
  return "30";
}

export class GeminiProviderError extends Error {
  constructor(status, reason = "REQUEST_FAILED", retryAfter = "30") {
    const safeReason = Object.hasOwn(messages, reason) ? reason : "REQUEST_FAILED";
    const safeStatus = Number.isInteger(status) && status >= 400 && status <= 599 ? status : 502;
    super(`${messages[safeReason]} (HTTP ${safeStatus})`);
    this.name = "GeminiProviderError";
    this.status = safeStatus;
    this.code = `GEMINI_${safeReason}`;
    this.headers = new Headers({ "retry-after": retryAfter });
  }
}

export async function geminiResponseError(response) {
  let body;
  try { body = await response.json(); } catch { /* Non-JSON errors still retain the HTTP status. */ }
  const error = body?.error;
  const details = Array.isArray(error?.details) ? error.details : [];
  return new GeminiProviderError(response.status, classify(response.status, error, details), retryDelay(response.headers, details));
}
