# Fetching Data in UI Extensions

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/fetching-data

UI extensions call your backend with `hubspot.fetch()`, not the browser's native `fetch`. Requests go through HubSpot's data fetch service, which signs them and appends metadata.

For data from the current CRM record, you don't need a backend. Use the SDK hooks (`useRecordPropertiesCurrent`, `useRecordAssociationsCurrent`, `useRecordSearch`; see [`ui-extensions-sdk.md`](ui-extensions-sdk.md#hooks)) or CRM data components.

> Apps that request **Sensitive Data scopes** cannot use `hubspot.fetch()` (or serverless functions). They can still include app cards.

---

## Differences from native `fetch`

| Feature | Native `fetch()` | `hubspot.fetch()` |
|---|---|---|
| Request headers | Any | Only `Authorization`; other headers are stripped |
| Response headers | Readable | Not returned |
| Credentials mode / cache control | Supported | Not supported |
| Timeout | Browser default | 15 s default, configurable up to 120 s |
| Payload size | Large | 1 MB request, 1 MB response |
| Body | `JSON.stringify(obj)` + `Content-Type` header | Plain object, no stringify, no `Content-Type` |
| URL requirements | Any URL | Must match an entry in `permittedUrls.fetch` |

---

## Method signature

From `@hubspot/ui-extensions` 1.0.1 types:

```ts
interface HubSpotFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  timeout?: number;                              // ms; default 15000, max 120000
  body?: { [key: string]: unknown };             // plain object
  headers?: Headers | Record<string, string>;    // only Authorization is forwarded
}

// hubspot.fetch(url, options?)
declare function fetch(url: string | URL, options?: HubSpotFetchOptions): Promise<Response>;
```

```tsx
import { hubspot } from "@hubspot/ui-extensions";

// GET
const getRes = await hubspot.fetch("https://api.example.com/data", { method: "GET", timeout: 5000 });
if (!getRes.ok) throw new Error(`HTTP ${getRes.status}`);
const data = await getRes.json();

// POST: body is a plain object, not JSON.stringify()
const postRes = await hubspot.fetch("https://api.example.com/data", {
  method: "POST",
  body: { key: "value" },
});
```

---

## Limits

- **20 concurrent requests per app per account.** Extra requests get `429` and can be retried after a delay.
- **Timeout:** 15 seconds by default. Set a different value with `timeout`, up to 120 seconds.
- **Payload:** 1 MB each for the request and the response.
- **Retries:** HubSpot retries once automatically if the connection fails or your backend returns `5XX` within the timeout window. Make write endpoints idempotent.

---

## Configuration: `permittedUrls`

Add backend URLs to `permittedUrls.fetch` in `src/app/app-hsmeta.json`:

```json
"permittedUrls": {
  "fetch": ["https://api.example.com/"],
  "img": [],
  "iframe": []
}
```

- URLs must be valid HTTPS. `localhost` is not allowed (use the local proxy below).
- Entries are **prefixes**: `"https://api.example.com/v1/"` allows every path under `/v1/`.
- **No wildcards** (e.g. `https://*.example.com` is not supported).
- Calls to unlisted URLs fail with `403 Forbidden`.
- Changes to `permittedUrls` need `hs project upload` to take effect, even while `hs project dev` is running.

---

## Request metadata and signing

HubSpot appends these query parameters to every `hubspot.fetch()` request:

| Parameter | Description |
|---|---|
| `userId` | ID of the HubSpot user making the request |
| `portalId` | HubSpot account ID |
| `userEmail` | Email of the user making the request |
| `appId` | App ID |

Requests carry `X-HubSpot-Signature-v3` and `X-HubSpot-Request-Timestamp` headers. The full URL, including these parameters, is part of the signature, so after validating it your backend can trust the caller's identity without any secret in React code.

**Validate `X-HubSpot-Signature-v3` on every endpoint**, the same way as webhooks. See [`signature-validation.md`](signature-validation.md).

---

## Authorization header

`Authorization` is the only custom header that is forwarded. Recommended pattern: exchange the HubSpot signature for a short-lived token from your backend, then send that token to third-party APIs:

```tsx
// Step 1: get a short-lived token from your backend (signature-validated)
const tokenRes = await hubspot.fetch("https://api.example.com/get-access-token", {
  method: "GET",
  timeout: 3000,
});
const { accessToken } = await tokenRes.json();

// Step 2: use the token for other requests (the URL must also be in permittedUrls.fetch)
const res = await hubspot.fetch("https://www.oauth-enabled-api.com/data", {
  method: "GET",
  timeout: 3000,
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

Your backend issues the token only after validating the HubSpot signature:

```js
app.get("/get-access-token", (req, res) => {
  if (!isValidHubSpotSignature(req)) return res.status(401).end(); // see signature-validation.md
  res.json({ accessToken: generateShortLivedToken(req.query.userEmail) });
});
```

Never store third-party secrets in React code. Use your backend as the proxy.

---

## Local development proxy

`hubspot.fetch()` cannot call `localhost` directly. Use a `local.json` proxy to reroute requests during `hs project dev`:

```json
{
  "proxy": {
    "https://api.example.com": "http://localhost:8080"
  }
}
```

- Location: the docs say to put `local.json` "in the same directory as `public-app.json`" (legacy wording). The equivalent location for 2026.09 projects is unverified.
- Only origin-level mappings work. Path-based routing (e.g. `"https://example.com/a"`) is not supported.
- Run `hs project upload`, then `hs project dev`. The CLI confirms when it detects the proxy.
- If request metadata is missing, rename `local.json` to `local.json.bak` and restart the dev server.

### Signing in local development

Proxied requests are **unsigned and carry no metadata query parameters** by default. To sign them, start the dev server with a `CLIENT_SECRET` and use the same value in your local backend:

```bash
CLIENT_SECRET="your-secret" hs project dev
CLIENT_SECRET="your-secret" node server.js
```

The value doesn't need to be your real app secret; it only has to match on both sides.

---

## Monitoring

View `hubspot.fetch()` request logs in HubSpot: **Development > Monitoring > Logs**, then the **UI Extensions** tab, then the **hs.fetch** tab.
