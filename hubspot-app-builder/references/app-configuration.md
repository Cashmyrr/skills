# App Configuration Reference

> Official docs:
> - [App configuration](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/app-configuration)
> - [Create an app](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app)
> - [Manage apps in HubSpot](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/manage-apps-in-hubspot)

Use HubSpot CLI **8.16.0+** (8.15.0 is the minimum for `isUserLevel`).

## `hsproject.json`

The top-level `hsproject.json` sets the platform version and the `src` directory. Every component lives under `src/`; app features go in `src/app/<feature-folder>/`, each with a config file ending in `-hsmeta.json`.

```json
{
  "name": "my-project",
  "srcDir": "src",
  "platformVersion": "2026.09"
}
```

`hs project create` still defaults `--platform-version` to `2026.03`: pass `--platform-version 2026.09`, or edit the file before the first upload.

## `app-hsmeta.json` Full Schema (OAuth)

```json
{
  "uid": "my_app_uid",
  "type": "app",
  "config": {
    "name": "My App",
    "description": "Description for installing users. Up to 8192 chars.",
    "logo": "/app/app-logo.png",
    "distribution": "marketplace",
    "isUserLevel": false,
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
| `uid` | String | ✅ | Unique within the project; up to 64 chars; letters, numbers, `_`, `-`, `.`. Must differ from every feature `uid`. **Don't change it after the first upload.** |
| `type` | String | ✅ | Must be `"app"` (matches the parent folder) |
| `name` | String | ✅ | Display name in HubSpot; up to 200 chars; no leading/trailing whitespace |
| `description` | String | ✅ | App purpose for installing users; up to 8192 chars |
| `logo` | String | ❌ | Path to a png, jpeg/jpg, gif or bmp file; should be recognizable at thumbnail size |
| `distribution` | String | ✅ | `"marketplace"` or `"private"` |
| `isUserLevel` | Boolean | ❌ | `true` turns on user-level access (2026.09). Defaults to `false` (account-level). OAuth only. See [User-Level Access](#user-level-access-isuserlevel-202609). |
| `auth` | Object | ✅ | See [Authentication](#authentication-auth) |
| `permittedUrls` | Object | ❌ | `fetch`, `iframe` and `img` arrays. URLs must use HTTPS and include an authority; an optional path prefix restricts them further. |
| `support.supportEmail` | String | ❌ | Support email |
| `support.documentationUrl` | String | ❌ | Docs URL (HTTPS) |
| `support.supportUrl` | String | ❌ | Support page URL (HTTPS) |
| `support.supportPhone` | String | ❌ | Phone number starting with `+` |

## Distribution and Install Limits

| `distribution` | `auth.type` | Where it can be installed |
|---|---|---|
| `private` | `static` | **1** standard account at a time, plus up to 10 developer test accounts |
| `private` | `oauth` | Up to **10** allowlisted accounts (developer test accounts not counted) |
| `marketplace` | `oauth` | Up to **25** accounts before listing (test accounts not counted); unlimited once listed |

- `marketplace` apps **must** use `oauth`.
- Until you sign the Acceptable Use Policy, a `marketplace` app can only be installed in developer test accounts.
- Serverless functions only work in `private` + `static` apps.

## Authentication (`auth`)

| Field | Required | Notes |
|---|---|---|
| `type` | ✅ | `"oauth"` or `"static"` |
| `redirectUrls` | OAuth only | At least one; HTTPS, except `http://localhost` for testing. Remove it for static auth. |
| `requiredScopes` | ✅ | At least one. The installing user must grant all of them. |
| `optionalScopes` | ❌ (OAuth only) | Dropped at install if the installer lacks permission; dropped scopes are absent from the token |
| `conditionallyRequiredScopes` | ❌ (OAuth only) | Required only when they appear in the `scope` parameter of the install URL |

At a minimum, include the `read` scope for each CRM object or asset type the app accesses.

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

- Client ID and secret: **Development > Projects > [project] > [app] > Auth** tab (also where you **Rotate** the secret).
- Install URL, token exchange and refresh: [`oauth.md`](oauth.md). HubSpot's Node.js sample: [oauth-quickstart-nodejs](https://github.com/hubspot/oauth-quickstart-nodejs).

### Static Token (`type: "static"`)

```json
"auth": {
  "type": "static",
  "requiredScopes": ["crm.objects.contacts.read"]
}
```

- **Only `requiredScopes`**: static apps can't define optional or conditionally required scopes.
- Remove `redirectUrls`.
- Single standard account. Install it from the app's **Distribution** tab, or with `hs project install-app`.
- The access token is on the **Distribution** tab. Only super admins and users with a developer seat can view or rotate it. HubSpot recommends rotating it about every 6 months.
- After changing scopes, reinstall with the **Reinstall URL** on the Distribution tab.

## User-Level Access (`isUserLevel`, 2026.09)

Requires CLI 8.15.0+ and `"platformVersion": "2026.09"`.

```json
"config": {
  "name": "My App",
  "distribution": "marketplace",
  "isUserLevel": true,
  "auth": { "type": "oauth", "redirectUrls": ["http://localhost:4000/oauth2/hubspot-callback"] }
}
```

| Rule | Detail |
|---|---|
| Auth type | **OAuth only**; `static` auth doesn't support user-level access |
| Distribution | Both `marketplace` and `private` |
| Default | Omitted or `false` → account-level access |
| Migration | Existing account-level apps **can't** be converted; create a new app |
| Install | Any user whose permissions match the app's scopes can install it for themselves |
| Audit logs | User actions are annotated `[User] via [app name]` |
| Backend | App pages and app settings need **your own backend service** for per-user data isolation |
| Marketplace | Apps that mainly connect HubSpot to external generative AI tools must use user-level access **or** HubSpot's MCP Server |

**Not supported in user-level apps:** app cards, serverless functions, webhooks (v3/v4), custom workflow actions, agent tools, app events, app objects, CMS, SCIM.
**Partial:** APIs, app pages, app settings. **Full:** `hubspot.fetch()`, UIE hooks, MCP (MCP is user-level *only*).

See the feature matrix and API/scope support in `SKILL.md`, and [`scopes.md`](scopes.md#scopes-unsupported-under-user-level-access-202609).

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

- `fetch`: URLs your extension can call via `hubspot.fetch()`
- `iframe`: URLs loadable inside iframe modals
- `img`: URLs for image sources

All entries must use HTTPS and include an authority. A path prefix (`"https://api.example.com/v1/"`) restricts access to that path.

## Adding Features to an Existing Project

Run `hs project add` from the project root and pick features interactively, or pass `--features` with any of: `app-function-endpoint`, `app-function`, `app-event`*, `app-object`*, `app-object-association`*, `card`, `settings`, `page`, `webhooks`, `workflow`, `scim` (*requires HubSpot approval). It generates the matching `*-hsmeta.json` and source files.

## UID Rules (Critical)

- UIDs uniquely identify components across builds
- **Changing a UID after the first upload creates a new component**; old data and card positions are lost
- Each feature has its own UID, distinct from the app-level UID
- UIDs must be unique within the project (no two features share the same UID)
