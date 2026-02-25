# HubSpot Signature Validation Reference

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/request-validation

## Why Validation Is Required

HubSpot sends outbound HTTP requests to your backend in two scenarios:

| Scenario | When it happens |
|---|---|
| **Webhook deliveries** | HubSpot POSTs event payloads to your `targetUrl` |
| **Card / settings page fetch** | A UI extension (CRM card, settings page, home page) calls `hubspot.fetch()` — HubSpot proxies the request to your server |

Both are signed with `X-HubSpot-Signature-v3`. Every backend endpoint receiving either type of request must validate the signature. Without validation, anyone can send arbitrary payloads to your URL.

---

## How Signing Works

HubSpot includes three headers on every outbound request:

| Header | Description |
|---|---|
| `X-HubSpot-Signature-v3` | HMAC-SHA256 signature |
| `X-HubSpot-Request-Timestamp` | Unix timestamp (ms) of when the request was sent |

The signature is an HMAC-SHA256 hash of `method + url + body + timestamp`, keyed with the app's client secret, then base64-encoded.

---

## Validation (Node.js)

Install the client:

```bash
npm install @hubspot/api-client
```

Reusable validation helper — use this for **both** webhook endpoints and card/settings fetch endpoints:

```js
const { Signature } = require("@hubspot/api-client");

/**
 * Returns true if the HubSpot request signature is valid.
 * Call this at the top of any endpoint that receives requests from HubSpot
 * (webhooks AND card/settings fetch endpoints).
 */
function validateHubSpotSignature(req, res) {
  const signatureV3 = req.header("X-HubSpot-Signature-v3");
  const timestamp = req.header("X-HubSpot-Request-Timestamp");
  const url = `${req.protocol}://${req.header("host")}${req.url}`;

  // Reject replayed requests older than 5 minutes
  if (parseInt(timestamp) < Date.now() - 5 * 60 * 1000) {
    res.status(400).json({ error: "Timestamp too old" });
    return false;
  }

  const isValid = Signature.isValid({
    signatureVersion: "v3",
    signature: signatureV3,
    method: req.method,
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
    requestBody: req.body,
    url,
    timestamp,
  });

  if (!isValid) {
    res.status(401).json({ error: "Invalid signature" });
    return false;
  }

  return true;
}
```

---

## Usage Examples

### Webhook endpoint

```js
app.post("/webhook", async (req, res) => {
  if (!validateHubSpotSignature(req, res)) return;

  for (const event of req.body) {
    console.log(`Event: ${event.subscriptionType}`, event);
  }

  res.status(200).json({ received: true });
});
```

### Card / settings page fetch endpoint

```js
// Called via hubspot.fetch("https://api.example.com/card-data") from a UI extension
app.get("/card-data", async (req, res) => {
  if (!validateHubSpotSignature(req, res)) return;

  res.status(200).json({ results: [] });
});
```

The validation code is **identical** for both — only the business logic differs.

---

## Manual Validation (without `@hubspot/api-client`)

If `@hubspot/api-client` is not available, reproduce the same logic using Node's built-in `crypto` module:

```js
const crypto = require("crypto");

function validateHubSpotSignatureManual(req, res) {
  const signature = req.headers["x-hubspot-signature-v3"];
  const timestamp = req.headers["x-hubspot-request-timestamp"];

  // Reject requests older than 5 minutes
  if (Date.now() - parseInt(timestamp) > 300000) {
    res.status(400).json({ error: "Timestamp too old" });
    return false;
  }

  // Reconstruct the signed string: method + full URI + JSON body + timestamp
  const uri = `${req.protocol}://${req.hostname}${req.url}`;
  const rawString = `${req.method}${uri}${JSON.stringify(req.body)}${timestamp}`;

  // Compute HMAC-SHA256 keyed with the client secret, base64-encoded
  const expected = crypto
    .createHmac("sha256", process.env.HUBSPOT_CLIENT_SECRET)
    .update(rawString)
    .digest("base64");

  // Use timing-safe comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    res.status(401).json({ error: "Invalid signature" });
    return false;
  }

  return true;
}
```

Key points:
- The signed string is `method + uri + JSON.stringify(body) + timestamp` — order and encoding matter
- Use `crypto.timingSafeEqual()` instead of `===` to prevent timing-based signature extraction attacks
- `req.hostname` does not include the port; if your server runs on a non-standard port, build the URI manually

---

## Key Rules

- Store `HUBSPOT_CLIENT_SECRET` in environment variables — never hardcode it
- Reject requests with timestamps older than 5 minutes (replay attack prevention)
- Return `200` quickly from webhooks; process heavy logic asynchronously
- Applies to all UI extension locations that use `hubspot.fetch()`: CRM cards, settings pages, home pages
