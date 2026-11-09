# HubSpot Signature Validation Reference

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/request-validation

Every backend endpoint that HubSpot calls must verify the request signature. Without it, anyone can send arbitrary payloads to your URL.

## Which Requests Use Which Version

| Request | Version | Headers |
|---|---|---|
| Webhook deliveries (`webhooks` component) | **v3** | `X-HubSpot-Signature-v3`, `X-HubSpot-Request-Timestamp` |
| `hubspot.fetch()` from app cards, settings, app pages | **v3** | `X-HubSpot-Signature-v3`, `X-HubSpot-Request-Timestamp` |
| Custom workflow action execution (`actionUrl`) | **v2** | `X-HubSpot-Signature`, `X-HubSpot-Signature-Version: v2` |
| Agent tool execution (BETA) | **v2** per the agent tools reference (its verification section links v3 — confirm) | `X-HubSpot-Signature` |
| Legacy CRM card data requests, workflow "Send webhook" action | **v2** | `X-HubSpot-Signature`, `X-HubSpot-Signature-Version: v2` |
| Some legacy APIs / older webhook formats | v1 | `X-HubSpot-Signature`, `X-HubSpot-Signature-Version: v1` |

`hubspot.fetch()` notes (from [Fetching data](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/fetching-data)):
- HubSpot appends `userId`, `portalId`, `userEmail`, and `appId` as query parameters — they are part of the signed URL.
- During `hs project dev` with a `local.json` proxy, requests are **not signed** unless you inject the `CLIENT_SECRET` environment variable into the local dev process.

## How Each Version Is Computed

| Version | Source string | Algorithm |
|---|---|---|
| v3 | `method + uri + body + timestamp` | HMAC-SHA256 keyed with the app **client secret**, **base64** |
| v2 | `clientSecret + method + uri + body` | SHA-256, **hex** |
| v1 | `clientSecret + body` | SHA-256, **hex** |

v3 rules:
- `uri` is the full URL HubSpot called (protocol, host, path, query). In the **query string only** (not the path, not the leading `?`), decode these sequences: `%3A` `%2F` `%3F` `%40` `%21` `%24` `%27` `%28` `%29` `%2A` `%2C` `%3B`. This matters for `hubspot.fetch()` because `userEmail` contains `@`.
- `body` is the request body string; use `""` when there is no body (GET).
- `X-HubSpot-Request-Timestamp` is Unix time in **milliseconds**. Reject requests older than **5 minutes**.
- Compare in constant time.

The docs' Node example rebuilds the body with `JSON.stringify(req.body)`. Using the **raw body** is safer: it is exactly what HubSpot signed, and it is `""` for GET.

---

## Express Setup: Capture the Raw Body

```js
const express = require("express");

const app = express();
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
```

Build the URL from the public host HubSpot called. If you are behind a proxy/load balancer, set `app.set("trust proxy", true)` or use a fixed `PUBLIC_BASE_URL` instead of the request host.

---

## v3 Validation with Node's `crypto` (recommended)

```js
const crypto = require("crypto");

const MAX_AGE_MS = 5 * 60 * 1000;
const DECODE = {
  "%3A": ":", "%2F": "/", "%3F": "?", "%40": "@", "%21": "!", "%24": "$",
  "%27": "'", "%28": "(", "%29": ")", "%2A": "*", "%2C": ",", "%3B": ";",
};

function hubspotUri(req) {
  const base = process.env.PUBLIC_BASE_URL || `https://${req.get("host")}`;
  const full = `${base}${req.originalUrl}`.split("#")[0];
  const q = full.indexOf("?");
  if (q === -1) return full;
  const query = full
    .slice(q + 1)
    .replace(/%3A|%2F|%3F|%40|%21|%24|%27|%28|%29|%2A|%2C|%3B/gi, (m) => DECODE[m.toUpperCase()]);
  return full.slice(0, q + 1) + query;
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a), "utf8");
  const bufB = Buffer.from(String(b), "utf8");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

/** Returns true if the request carries a valid, fresh v3 signature. */
function isValidHubSpotRequest(req) {
  const signature = req.get("X-HubSpot-Signature-v3");
  const timestamp = Number(req.get("X-HubSpot-Request-Timestamp"));
  if (!signature || !Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() - timestamp) > MAX_AGE_MS) return false;

  const source = `${req.method}${hubspotUri(req)}${req.rawBody || ""}${timestamp}`;
  const expected = crypto
    .createHmac("sha256", process.env.HUBSPOT_CLIENT_SECRET)
    .update(source, "utf8")
    .digest("base64");
  return safeEqual(expected, signature);
}
```

---

## v3 Validation with `@hubspot/api-client`

`Signature.isValid()` (checked in `@hubspot/api-client` 14.1.3) takes `{ signature, clientSecret, requestBody, signatureVersion, url, method, timestamp }` where **`requestBody` is a string** and **`timestamp` is a number**. Behaviour to know:

- It does **not** URL-decode — pass the decoded URI from `hubspotUri()` above.
- For v3 it **throws** `Error("Timestamp is invalid, reject request")` when `timestamp` is missing or older than 300,000 ms — wrap it in `try/catch`.
- It compares with `===` (not constant time). Prefer the `crypto` version above if that matters to you.
- Defaults: `signatureVersion = "v1"`, `method = "POST"` — always pass both.

```js
const { Signature } = require("@hubspot/api-client");

function isValidHubSpotRequestV3(req) {
  try {
    return Signature.isValid({
      signatureVersion: "v3",
      signature: req.get("X-HubSpot-Signature-v3") || "",
      method: req.method,
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
      requestBody: req.rawBody || "",
      url: hubspotUri(req),
      timestamp: Number(req.get("X-HubSpot-Request-Timestamp")),
    });
  } catch (err) {
    return false; // stale or missing timestamp
  }
}
```

---

## v2 (workflow actions, agent tools, legacy card data)

v2 has no timestamp, so there is no replay window to check. The URI must match the URL HubSpot called exactly, including query parameter order.

```js
const crypto = require("crypto");

function isValidHubSpotRequestV2(req) {
  const signature = req.get("X-HubSpot-Signature");
  if (!signature) return false;
  const base = process.env.PUBLIC_BASE_URL || `https://${req.get("host")}`;
  const uri = `${base}${req.originalUrl}`;
  const source = `${process.env.HUBSPOT_CLIENT_SECRET}${req.method}${uri}${req.rawBody || ""}`;
  const expected = crypto.createHash("sha256").update(source, "utf8").digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
```

With the client library: `Signature.isValid({ signatureVersion: "v2", signature, method: req.method, clientSecret, requestBody: req.rawBody || "", url: uri })` (no timestamp, does not throw).

---

## Usage Examples

### Webhook endpoint (v3)

```js
app.post("/webhook", (req, res) => {
  if (!isValidHubSpotRequest(req)) return res.status(401).json({ error: "Invalid signature" });
  res.sendStatus(200); // respond within 5 s, process asynchronously
  for (const event of req.body) {
    console.log(`Event: ${event.subscriptionType}`, event.eventId);
  }
});
```

### `hubspot.fetch()` endpoint (v3)

```js
// Called via hubspot.fetch("https://api.example.com/card-data") from a UI extension
app.get("/card-data", (req, res) => {
  if (!isValidHubSpotRequest(req)) return res.status(401).json({ error: "Invalid signature" });
  const { portalId, userId } = req.query; // appended by HubSpot
  res.status(200).json({ portalId, userId, results: [] });
});
```

### Workflow action / agent tool endpoint (v2)

```js
app.post("/hubspot/workflow-action", (req, res) => {
  if (!isValidHubSpotRequestV2(req)) return res.status(401).json({ error: "Invalid signature" });
  const { callbackId, inputFields } = req.body;
  console.log("execution", callbackId);
  res.status(200).json({
    outputFields: { deliveryId: "abc-123", hs_execution_state: "SUCCESS" },
  });
});
```

---

## Key Rules

- Store `HUBSPOT_CLIENT_SECRET` in environment variables — never hardcode it.
- Sign over the raw body string, `""` for GET.
- Reject v3 requests with a missing, non-numeric, or older-than-5-minutes timestamp.
- Use constant-time comparison and check buffer lengths first (`timingSafeEqual` throws on unequal lengths).
- Return `2xx` quickly from webhooks (5-second limit) and process heavy logic asynchronously.
