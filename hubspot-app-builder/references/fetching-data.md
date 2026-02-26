# Fetching Data in UI Extensions

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/fetching-data

UI extensions fetch external data using `hubspot.fetch()` — not the browser's native `fetch`. The API routes requests through HubSpot's data fetch service, which signs them and appends metadata.

---

## Differences from native `fetch`

| Feature | Native `fetch()` | `hubspot.fetch()` |
|---|---|---|
| Custom headers | Supported | Not supported (only `Authorization`) |
| Credentials mode | Supported | Not supported |
| Cache control | Supported | Not supported |
| Timeout | Browser default | 15 seconds max |
| Payload size | Large | 1MB max |
| Body | `JSON.stringify(obj)` + `Content-Type` header | Plain object — no stringify, no headers |
| URL requirements | Any URL | Must be listed in `permittedUrls.fetch` |

---

## Method signature

```ts
interface Options {
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH';
  timeout?: number;
  body?: { [key: string | number]: unknown };
}

hubspot.fetch(resource: string | URL): Promise<Response>
hubspot.fetch(resource: string, options?: Options): Promise<Response>
```

`body` is a plain object. Do not `JSON.stringify()` it or set `Content-Type` manually — HubSpot serializes and signs the request automatically.

---

## Limits

- Max **20 concurrent requests** per account — excess requests return `429` and can be retried after a delay
- Max **15 second timeout** per request (specify lower via `timeout` option)
- Max **1MB** for both request and response payloads
- HubSpot retries a request once on connection errors or `5XX` responses within the 15-second window

---

## Configuration

Add target URLs to `permittedUrls.fetch` in `app-hsmeta.json`:

```json
"permittedUrls": {
  "fetch": ["https://api.example.com/"],
  "img": [],
  "iframe": []
}
```

- URLs must be valid HTTPS — `localhost` is not allowed
- Path prefixes are supported: `"https://api.example.com/v1/"` restricts calls to that path
- Changes to `permittedUrls` require `hs project upload` to take effect, even during `hs project dev`

---

## Automatic query parameters

HubSpot appends the following query parameters to every `hubspot.fetch()` request, available on your backend:

| Parameter | Description |
|---|---|
| `userId` | HubSpot user ID making the request |
| `portalId` | HubSpot account (portal) ID |
| `userEmail` | Email of the user making the request |
| `appId` | App ID |

Because the full URL (including these parameters) is part of the signature, they can be used to securely identify the caller without storing secrets in your React code.

---

## Authorization header

`hubspot.fetch()` supports passing an `Authorization` header. The recommended pattern is to first exchange the HubSpot signature for a short-lived access token, then use that token for subsequent requests to third-party APIs:

```js
// Step 1 — get a short-lived token from your backend
const tokenRes = await hubspot.fetch("https://api.example.com/get-access-token", {
  method: "GET",
  timeout: 3000,
});
const { accessToken } = await tokenRes.json();

// Step 2 — use the token for other requests
const res = await hubspot.fetch("https://www.oauth-enabled-api.com/data", {
  method: "GET",
  timeout: 3000,
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

Your backend issues the token only after validating the HubSpot signature:

```js
app.get("/get-access-token", (req, res) => {
  validateHubSpotSignature(req, res);
  res.json({
    accessToken: generateShortLivedToken(req.query.userEmail),
  });
});
```

Do not store third-party secrets in React code. Use your backend as the proxy.

---

## Local development proxy

`hubspot.fetch()` cannot call `localhost` directly. Use a `local.json` proxy to reroute requests during development:

```json
{
  "proxy": {
    "https://api.example.com": "http://localhost:8080"
  }
}
```

- Place `local.json` in the same directory as `hsproject.json`
- Path-based routing is not supported — only origin-level mappings work (e.g. `"https://example.com/a"` → does not work)
- Run `hs project upload` then `hs project dev` — the CLI confirms detected proxies
- Proxied requests are **not signed** by default and do not include metadata query parameters

### Enabling signature validation during local development

To sign proxied requests locally, inject `CLIENT_SECRET` when starting the dev server:

```bash
CLIENT_SECRET="your-secret" hs project dev
```

Use the same value in your local backend:

```bash
CLIENT_SECRET="your-secret" node server.js
```

The value does not need to match your real app secret — it just needs to match on both sides during local development.

---

## Signature validation

Every `hubspot.fetch()` call reaches your backend as a signed request. Validate `X-HubSpot-Signature-v3` on every endpoint — the same way as webhooks. See [`signature-validation.md`](signature-validation.md) for the full implementation.

---

## Monitoring

View `hubspot.fetch()` request logs in HubSpot:

**Development > Monitoring > Logs > UI Extensions > hs.fetch tab**
