# App Configuration Reference

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/build-apps/app-configuration

## `app-hsmeta.json` Full Schema

```json
{
  "uid": "my_app_uid",
  "type": "app",
  "config": {
    "name": "My App",
    "description": "Description for installing users. Up to 8192 chars.",
    "logo": "/app/app-logo.png",
    "distribution": "marketplace",
    "auth": {
      "type": "oauth",
      "redirectUrls": ["http://localhost:3000/oauth-callback"],
      "requiredScopes": ["crm.objects.contacts.read", "crm.objects.contacts.write"],
      "optionalScopes": [],
      "conditionallyRequiredScopes": []
    },
    "permittedUrls": {
      "fetch": ["https://api.example.com"],
      "iframe": ["https://app.example.com"],
      "img": ["https://images.example.com"]
    },
    "support": {
      "supportEmail": "support@example.com",
      "documentationUrl": "https://example.com/docs",
      "supportUrl": "https://example.com/support",
      "supportPhone": "+18005555555"
    }
  }
}
```

## Field Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `uid` | String | ✅ | Unique ID; up to 64 chars; alphanumeric + `_`, `-`, `.`. **Cannot be changed after first upload.** |
| `type` | String | ✅ | Must be `"app"` (matches parent folder) |
| `name` | String | ✅ | Display name in HubSpot; up to 200 chars; no leading/trailing spaces |
| `description` | String | ✅ | App purpose for installing users; up to 8192 chars |
| `logo` | String | ❌ | Relative path to logo (png, jpeg, gif, bmp) |
| `distribution` | String | ✅ | `"marketplace"` or `"private"` |
| `auth` | Object | ✅ | Authentication configuration |
| `permittedUrls` | Object | ❌ | URLs allowed for fetch, iframe, and image requests |
| `support.supportEmail` | String | ❌ | Support email |
| `support.documentationUrl` | String | ❌ | Docs URL (HTTPS required) |
| `support.supportUrl` | String | ❌ | Support page URL (HTTPS required) |
| `support.supportPhone` | String | ❌ | Phone starting with `+` |

## Distribution Options

### `marketplace` (public)
- App can be listed on the [HubSpot App Marketplace](https://ecosystem.hubspot.com/marketplace/apps)
- **Must** use `oauth` auth type
- Limited to 25 installs before listing; unlimited after review

### `private`
- Restricted to specific accounts; use an allowlist
- Can use either `oauth` (up to 10 accounts) or `static` (1 standard account)

## Authentication (`auth`)

### OAuth (`type: "oauth"`)

```json
"auth": {
  "type": "oauth",
  "redirectUrls": ["http://localhost:3000/oauth-callback"],
  "requiredScopes": ["crm.objects.contacts.read"],
  "optionalScopes": ["crm.objects.deals.read"],
  "conditionallyRequiredScopes": []
}
```

- At least one `requiredScopes` is mandatory
- `redirectUrls` must use HTTPS except `http://localhost` for testing
- For marketplace apps: use the [sample OAuth Node.js server](https://github.com/hubspot/oauth-quickstart-nodejs)

### Static Token (`type: "static"`)

```json
"auth": {
  "type": "static",
  "requiredScopes": ["crm.objects.contacts.read"],
  "optionalScopes": [],
  "conditionallyRequiredScopes": []
}
```

- Remove `redirectUrls` entirely
- Single-account installation only
- Access token available in HubSpot Distribution tab after install
- Rotate token every 6 months for security

## Scopes Reference

For the full list of available scopes organized by category, see [`scopes.md`](scopes.md).

Common scopes to get started:

| Scope | Description |
|---|---|
| `crm.objects.contacts.read` | Read contacts |
| `crm.objects.contacts.write` | Create, delete, update contacts |
| `crm.objects.companies.read` | Read companies |
| `crm.objects.deals.read` | Read deals |
| `crm.objects.deals.write` | Create, delete, update deals |
| `tickets` | Access tickets (required for `helpdesk.sidebar` cards) |
| `crm.objects.custom.read` | Read custom objects (Enterprise) |
| `crm.objects.orders.read` | Read orders |

## `permittedUrls`

- `fetch`: URLs your extension can call via `hubspot.fetch()`. Must be HTTPS.
- `iframe`: URLs loadable inside iframe modals
- `img`: URLs for image sources

Path prefixes supported: `"https://api.example.com/v1/"` restricts to that path.

## Adding Features to an Existing Project

Run `hs project add` from the project root directory and select the feature(s) to add. This generates the corresponding `*-hsmeta.json` and React files.

## UID Rules (Critical)

- UIDs uniquely identify components across builds
- **Changing a UID after first upload creates a new component** — old data/positions are lost
- Each feature has its own UID distinct from the app-level UID
- UIDs must be unique within the project (no two features share the same UID)
