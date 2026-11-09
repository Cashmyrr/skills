---
name: hubspot-app-builder
description: This skill should be used when the user asks to "build a HubSpot app", "create a HubSpot app", "add a card to HubSpot", "create an app card", "build a UI extension", "build HubSpot app pages", "add a settings page to HubSpot app", "add a bulk action", "create a custom workflow action", "build an agent tool", "set up HubSpot webhooks", "set up OAuth for a HubSpot app", "configure user-level access", "add serverless functions to HubSpot app", "migrate legacy CRM cards", "migrate a HubSpot app to 2026.09", "validate a HubSpot project", "deploy a HubSpot app to production", "list an app on the HubSpot marketplace", "HubSpot app best practices", "review my HubSpot app code", or mentions the HubSpot developer platform 2026.09. Covers CLI commands, project structure, config files, UI extensions SDK 1.x, OAuth, user-level access, webhooks, workflow actions, migrations and Marketplace listing requirements.
version: 2.0.0
---

# HubSpot App Builder (Platform 2026.09)

This skill guides the development of full HubSpot apps on the developer platform version `2026.09`: project creation, configuration, UI extensions, serverless functions, user-level access, workflow actions and agent tools, webhooks, migrations and distribution.

> **Platform version 2026.09** became available on September 8, 2026 and is the **Current** version. It adds **user-level access**: apps that act on behalf of a specific user and enforce that user's HubSpot permissions instead of account-wide access. It carries forward all functionality from 2025.2 and 2026.03.
>
> **Version status today:** `2026.09` Current · `2026.03` Supported · `2025.2` Supported · `2025.1`, `2023.2`, `2023.1` Sunset. HubSpot ships a version every 6 months (March and September). A version is Current for 6 months, Supported until 18 months after GA, then Unsupported (uploads fail).

## Non-Negotiable Rules (read before writing any code)

These apply to every HubSpot project. Details, rationale and examples: [`references/best-practices.md`](references/best-practices.md).

1. **Current platform version** (`"platformVersion": "2026.09"`; `hs project create` still defaults to `2026.03`), **CLI 8.16.0+**, and **pinned dependencies**, never `"latest"`.
2. **UI extensions use `@hubspot/ui-extensions` 1.x** (`1.0.1` with `react` `18.3.1`) and the v1 hooks (`useRecordPropertiesCurrent`, `useRecordAssociationsCurrent`, `useRecordSearch`, `useExtensionApi`).
3. **Build profiles per environment** (`hs project profile add dev|qa|prod`); develop in **developer test accounts**, never in a client's production portal.
4. **No secret in front-end code or in the repo.** Secrets go in serverless function secrets or your backend.
5. **Least-privilege scopes**: only what the code calls; extras go in `optionalScopes` (OAuth only).
6. **Validate HubSpot signatures** on every backend endpoint: `X-HubSpot-Signature-v3` for webhooks and `hubspot.fetch()` targets, `X-HubSpot-Signature` (v2) for workflow actions and agent tools.
7. **Every data view handles loading, error and empty states.**
8. **Respect API limits**: batch endpoints, pagination, caching, webhooks over polling, backoff on `429`.
9. **Serverless functions are for private static-auth apps only** and never return raw errors; webhook handlers are idempotent.
10. **Production deploys go through CI** with the `prod` profile, and you know the build ID to roll back to (`hs project deploy --profile prod`).
11. **Nothing is "done" before [`references/validation.md`](references/validation.md) passes**: `hs project validate`, `hs project lint`, static checks, scope review, test-account run, Definition of Done checklist.

## Development Workflow (always follow this order)

```
1. hs project create --platform-version 2026.09 / hs project add  → scaffold
2. hs project profile add <dev|qa|prod> --target-account <id>      → environments
3. hs test-account create --config-path …                         → reproducible test account
4. hs project dev -p dev                                          → build with hot reload
5. hs project validate && hs project lint                         → blocking checks
6. Static checks + scope review                                   → references/validation.md
7. hs project upload -p qa                                        → test with a restricted user
8. Merge → CI uploads with the prod profile                       → note previous build ID for rollback
```

When reviewing existing code, apply the same rules and report each violation with its fix.

## Prerequisites

- HubSpot CLI **8.16.0+** (the version the docs recommend; 8.15.0 is the minimum for user-level access): `npm install -g @hubspot/cli@latest`, then check `hs --version`
- Authenticate: `hs account auth`
- Node.js: the CLI and `@hubspot/ui-extensions` 1.x require Node 20+. Platform 2025.2 raised the minimum Node version to 22, so use Node 22.
- A HubSpot developer account. Configurable test accounts need CLI 8.3.0+.
- Serverless functions: private static-auth apps only. Installing such an app needs an Enterprise subscription; developer test accounts work without one.

## Project Setup Workflow

### 1. Create the Project

```shell
hs project create --platform-version 2026.09
```

Without flags the CLI prompts for each choice. Flags (all optional):
- `--project-base`: `app` or `empty`
- `--distribution`: `marketplace` (HubSpot Marketplace) or `private` (specific accounts)
- `--auth`: `oauth` (multiple accounts) or `static` (one account)
- `--features` (space-separated, `app` base only): `app-function`, `app-function-endpoint`, `card`, `settings`, `page`, `webhooks`, `workflow`, `scim`, plus `app-event`, `app-object` and `app-object-association`, which **require HubSpot approval**
- `--name`, `--dest`

To add a feature later (interactive picker, or the same `--features` values):
```shell
hs project add
```

### 2. Project File Structure

```
my-project-folder/
├── hsproject.json                    # "srcDir": "src", "platformVersion": "2026.09"
└── src/
    ├── hsprofile.dev.json            # Build profiles (optional): accountId + variables
    └── app/
        ├── app-hsmeta.json           # Top-level app config (required)
        ├── package.json              # npm workspaces root (optional)
        ├── packages/types/           # Shared code (optional): index.ts, package.json
        ├── cards/                    # MyCard.jsx, my-card-hsmeta.json, package.json
        ├── pages/                    # Pages.tsx, pages-hsmeta.json, package.json (ONE component; routes in code)
        ├── settings/                 # Settings.tsx, settings-hsmeta.json, package.json
        ├── actions/                  # BulkAction.tsx, bulk-action-hsmeta.json, package.json (BETA)
        ├── functions/                # NewFunction.js, private-function-hsmeta.json, package.json
        ├── webhooks/                 # webhook-hsmeta.json
        ├── workflow-actions/         # my-action-hsmeta.json (workflow actions and agent tools)
        ├── app-events/               # my-event-hsmeta.json (requires HubSpot approval)
        ├── app-objects/              # my-object-hsmeta.json (requires HubSpot approval)
        ├── app-object-associations/  # my-association-hsmeta.json (requires HubSpot approval)
        ├── scim/                     # scim-hsmeta.json (private + static auth, SSO account)
        └── telemetry/                # telemetry-hsmeta.json (forward logs to an observability tool)
```

Each config file ends in `-hsmeta.json` and its `type` matches the feature:

| Folder | `type` | Folder | `type` |
|---|---|---|---|
| `cards/` | `card` | `webhooks/` | `webhooks` |
| `pages/` | `page` | `workflow-actions/` | `workflow-action` |
| `settings/` | `settings` | `app-events/` | `app-event` |
| `actions/` | `crm-bulk-action` (BETA) | `app-objects/` | `app-object` |
| `functions/` | `app-function` (private + static only) | `app-object-associations/` | `app-object-association` |
| `scim/` | `scim` | `telemetry/` | `telemetry` |

Details per feature: [`references/features.md`](references/features.md).

### 3. Configure `app-hsmeta.json`

```json
{
  "uid": "my_app_uid",
  "type": "app",
  "config": {
    "name": "My App",
    "description": "App description for installing users.",
    "distribution": "marketplace",
    "auth": {
      "type": "oauth",
      "redirectUrls": ["http://localhost:3000/oauth-callback"],
      "requiredScopes": ["crm.objects.contacts.read"],
      "optionalScopes": [],
      "conditionallyRequiredScopes": []
    },
    "permittedUrls": {
      "fetch": ["https://api.example.com"],
      "iframe": [],
      "img": []
    },
    "support": {
      "supportEmail": "support@example.com",
      "documentationUrl": "https://example.com/docs"
    }
  }
}
```

Key rules:
- `uid` must be unique within the project (up to 64 chars, letters, numbers, `_`, `-`, `.`). Don't change it after the first upload.
- `type` must match the parent folder name (`app`)
- **Static auth** (`private`, one account): remove `redirectUrls` and keep only `requiredScopes`. Static apps can't define optional or conditionally required scopes.
- `redirectUrls` must use HTTPS, except `http://localhost` for testing
- Include at least the `read` scope for each CRM object the app accesses (e.g. `crm.objects.contacts.read`)

Full schema, install limits and static-token handling: [`references/app-configuration.md`](references/app-configuration.md). OAuth flow (install URL, token exchange, refresh): [`references/oauth.md`](references/oauth.md).

### 4. Upload and Deploy

```shell
hs project upload            # Upload and trigger a build (auto-deploys by default)
hs project open              # Open the project in HubSpot
hs project dev               # Local dev server with hot reload
hs project install-deps      # Install package.json dependencies
hs project install-app       # Install a static-auth app from the CLI
```

### 5. Install the App

After uploading, install via HubSpot UI:
- Navigate to **Development > Projects > [Project Name] > [App UID]**
- Click the **Distribution** tab
- For test accounts: click **Add test install(s)**
- For standard accounts: click **Install now** (requires the right user permissions)
- OAuth apps: the client ID and secret are on the **Auth** tab

## UI Extensions

All UI extensions have the same structure: a `*-hsmeta.json` config plus a React entrypoint (`.jsx` or `.tsx`) that calls `hubspot.extend()`. They use `@hubspot/ui-extensions` **1.x** (see [`references/ui-extensions-sdk.md`](references/ui-extensions-sdk.md)).

### App Card Configuration (`cards/*-hsmeta.json`)

```json
{
  "uid": "my-card",
  "type": "card",
  "config": {
    "name": "My Card",
    "description": "Card description.",
    "location": "crm.record.tab",
    "entrypoint": "/app/cards/MyCard.jsx",
    "objectTypes": ["contacts"]
  }
}
```

| Field | Required | Notes |
|---|---|---|
| `uid` | yes | Stable identifier; renaming the card's title keeps its data |
| `config.name` | yes | Card title shown in HubSpot |
| `config.entrypoint` | yes | Path to the React file, e.g. `/app/cards/MyCard.jsx` |
| `config.objectTypes` | yes | CRM record types the card appears on |
| `config.location` | no | If omitted, the card can appear on every compatible surface; admins place it with the page editor |
| `config.description` | no | |
| `config.previewImage` | no | `{ "file": "<relative path>", "altText": "…" }`; png, jpeg, jpg or gif; 5 MB max |

**Card locations** (`config.location`):

| Location | Value | Notes |
|---|---|---|
| CRM middle column | `crm.record.tab` | Default or custom tabs. CRM data components allowed |
| CRM right sidebar | `crm.record.sidebar` | **No CRM data components**. Of the CRM action components, only `CrmActionButton` and `CrmActionLink` are allowed |
| CRM preview panel | `crm.preview` | |
| Help desk sidebar | `helpdesk.sidebar` | App needs the `tickets` scope and `objectTypes` must include `tickets`; an admin adds the card in help desk settings |

**`objectTypes`:**
- Standard objects are case-insensitive, singular or plural (`CONTACT` or `contacts`): `CONTACT`, `COMPANY`, `DEALS`, `TICKETS`, `ORDERS`, `CARTS`, `INVOICES`, `LEADS`, `MARKETING_EVENTS`, `PARTNER_ACCOUNTS`, `PARTNER_CLIENTS`, `PARTNER_SERVICES`, `COMMERCE_PAYMENTS`, `PRODUCTS`, `QUOTES`, `SUBSCRIPTIONS`.
- `APPOINTMENTS`, `COURSES`, `LISTINGS`, `SERVICES` and `PROJECTS` only work when activated in the data model.
- Custom objects use `p_objectName` (case-sensitive), or `p_*` for all custom objects.
- App objects use the app object's uid.
- Each object type needs its read scope, e.g. `crm.objects.contacts.read`.

**Other UI extension points** (separate `type` values, not card locations):

| Extension point | `type` | Config | Register with |
|---|---|---|---|
| App settings page | `settings` | `{ "entrypoint": "/app/settings/Settings.tsx" }` | `hubspot.extend<"settings">` |
| App pages (multi-page, routing) | `page` | `{ "entrypoint": "/app/pages/Pages.tsx" }` | `hubspot.extend<"pages">`; use `createPageRouter`, `PageRoutes`, `PageLink` from `@hubspot/ui-extensions/pages` |
| Legacy app home (still supported; prefer app pages) | `page` | `{ "entrypoint": "/app/pages/Home.tsx", "location": "home" }` | `hubspot.extend<"home">`; header buttons from `@hubspot/ui-extensions/pages/home` |
| CRM bulk action **(BETA)** | `crm-bulk-action` | `{ "label": "…", "entrypoint": "/app/actions/Action.tsx", "objectTypes": ["contacts"], "displayMode": "PANEL", "icon": "forward" }` | `hubspot.extend`; selected IDs are in `context.crm` |

### React Component Pattern

Every entrypoint registers itself with `hubspot.extend()`. The callback receives `{ context, actions }`, e.g. `hubspot.extend(({ context, actions }) => <MyCard context={context} addAlert={actions.addAlert} />)`, but the hooks below are preferred. A complete card (record properties, `hubspot.fetch()`, alerts, modal, loading/error/empty states) is in [`examples/complete-card-example.jsx`](examples/complete-card-example.jsx).

### SDK Hooks (Preferred Approach)

```tsx
import { hubspot, Button, LoadingSpinner, ErrorState, EmptyState, Text, useExtensionApi } from "@hubspot/ui-extensions";
import { useRecordPropertiesCurrent } from "@hubspot/ui-extensions/crm";

hubspot.extend<"crm.record.tab">(() => <MyCard />);

const MyCard = () => {
  // Access both context and actions
  const { context, actions } = useExtensionApi<"crm.record.tab">();

  // Read properties of the record being viewed
  const { properties, isLoading, error, refetch } = useRecordPropertiesCurrent({
    properties: ["firstname", "lastname", "email"],
  });

  // Always handle loading, error and empty states
  if (isLoading) return <LoadingSpinner label="Loading..." />;
  if (error) {
    return (
      <ErrorState title="Couldn't load this record">
        <Button onClick={refetch}>Retry</Button>
      </ErrorState>
    );
  }
  if (!properties.firstname) {
    return (
      <EmptyState title="No first name on this record">
        <Text>Add a first name to continue.</Text>
      </EmptyState>
    );
  }

  return (
    <Button onClick={() => actions.addAlert({ message: `Hello ${properties.firstname}!` })}>
      Say Hello
    </Button>
  );
};
```

**Available hooks (1.x):**
- `useExtensionApi<location>()`, `useExtensionContext<location>()`, `useExtensionActions<location>()`: context and actions.
- `useRecordPropertiesCurrent({ properties, format? })` and `useRecordAssociationsCurrent({ toObjectType, properties?, pageSize?, format? })` (from `@hubspot/ui-extensions/crm`, CRM locations only): read the record being viewed.
- `useRecordProperties({ objectType, recordId, properties })`, `useRecordAssociations({ fromObjectType, fromRecordId, toObjectType, … })`, `useRecordSearch({ objectType, filterGroups?, query?, pageSize? })`: work on any record, from `@hubspot/ui-extensions`.
- `useDebounce(value, delayMs?)`: debounce a value, e.g. search text.
- `usePageRoute()` (from `@hubspot/ui-extensions/pages`): current route in app pages.

Upgrading 0.x code? The renamed hooks and removed props are listed under "Migrating from 0.x to 1.x" in [`references/ui-extensions-sdk.md`](references/ui-extensions-sdk.md).

### Fetching External Data

```jsx
import { hubspot } from "@hubspot/ui-extensions";

// GET
const getRes = await hubspot.fetch("https://api.example.com/data", {
  method: "GET",
  timeout: 5000,
});
const data = await getRes.json();

// POST: body is a plain object, not JSON.stringify()
const postRes = await hubspot.fetch("https://api.example.com/data", {
  method: "POST",
  body: { key: "value" },
});
```

Key differences from native `fetch`:
- `body` is a plain object. Don't `JSON.stringify()` it or set `Content-Type` manually.
- `Authorization` is the only custom request header forwarded (`headers` option). Response headers are not returned.
- URLs must match a prefix in `permittedUrls.fetch` (no wildcards, no `localhost`; use the `local.json` proxy instead). Unlisted URLs return 403.
- HubSpot appends `userId`, `portalId`, `userEmail` and `appId` as query parameters on every request.
- Limits: 20 concurrent requests per app per account; 15 s default timeout, configurable up to 120 s; 1 MB request and response; one automatic retry on connection errors or `5XX`.
- Apps with Sensitive Data scopes cannot use `hubspot.fetch()`.

Your backend must validate `X-HubSpot-Signature-v3` on every incoming request. See [`references/signature-validation.md`](references/signature-validation.md).

For the full guide (proxy setup, Authorization header pattern, local dev signing, monitoring), see [`references/fetching-data.md`](references/fetching-data.md).

## Serverless Functions (2026.03+ Format)

Apps on platform 2026.03 and later (including 2026.09) can deploy serverless functions: server-side JavaScript that runs on HubSpot's infrastructure.

> **Only privately distributed apps with static auth** (`distribution: "private"`, `auth.type: "static"`) can use them. OAuth / Marketplace apps must call their own backend with `hubspot.fetch()`. They are also **not supported in user-level apps** — see [User-Level Access](#user-level-access-new-in-202609) — and cannot back an agent tool `actionUrl`.

- **Private functions** — called from UI extensions (app cards, app pages, settings) with `hubspot.serverless()`. Installing the app requires an **Enterprise** subscription; developer test accounts work without one.
- **Public endpoint functions** — add `"endpoint": { "path": "…", "method": "POST" }` (`method` is a single string). Require **Content Hub Enterprise** and are reachable **without authentication**.

Each function has its own `*-hsmeta.json` in `src/app/functions/` (with a `package.json` for its npm packages), replacing the 2025.1 `serverless.json`.

### Configuration (`*-hsmeta.json`)

```json
{
  "uid": "app_function_private",
  "type": "app-function",
  "config": {
    "entrypoint": "/app/functions/NewFunction.js",
    "secretKeys": ["THIRD_PARTY_ACCESS_TOKEN"]
  }
}
```

### Serverless Function Pattern

```js
// NewFunction.js
const hubspot = require("@hubspot/api-client");

exports.main = async (context) => {
  const { email } = context.parameters || {};
  if (!email) {
    return { statusCode: 400, body: { success: false, error: "email is required" } };
  }
  const client = new hubspot.Client({ accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN });
  try {
    const contact = await client.crm.contacts.basicApi.create({ properties: { email } });
    return { statusCode: 200, body: { success: true, contactId: contact.id } };
  } catch (err) {
    // Never return the raw error: it can leak headers or tokens to the front end
    console.error("create contact failed", err.code || err.message);
    return { statusCode: err.code || 500, body: { success: false, error: "Could not create contact" } };
  }
};
```

Call it from a UI extension:

```tsx
const createContact = async (email: string) => {
  const result = await hubspot.serverless("app_function_private", {
    parameters: { email },
    propertiesToSend: ["firstname"], // CRM record context only
  });
  return result.body.success;
};
```

### Key Notes

- **15-second execution timeout**; expect cold starts after inactivity.
- `PRIVATE_APP_ACCESS_TOKEN` is a reserved secret available in every private function.
- Custom secrets: `hs secret add NAME` → list it in `secretKeys` → read `process.env.NAME` → `hs project upload`.
- `hs project dev` reloads front-end code, but **function changes require `hs project upload`**.
- Context fields, endpoint URLs and common errors: [`references/features.md`](references/features.md#serverless-functions).

## Migrating to 2026.09

Use CLI 8.16.0+ (8.15.0 minimum for user-level access).

| Current state | Path |
|---|---|
| Project on 2026.03 or 2025.2 | Set `"platformVersion": "2026.09"` in `hsproject.json`, then `hs project upload` |
| Project on 2025.1, 2023.2 or 2023.1 | `hs project migrate` in the project directory; follow the prompts |
| Legacy public app (not project-based) | `hs app migrate`; choose the app, confirm components, give a project name, local path and UIDs. Auth credentials, features and installs are preserved. |
| Legacy private app (not project-based) | **Not supported** for 2026.09 |

Before and after migrating:
- **Convert legacy CRM cards to app cards first.** Legacy cards were removed from customer views on November 2, 2026; the migration UI and API end on December 1, 2026.
- The migration overview (written for 2026.03) asks you to **list** an unlisted legacy public app installed in 10 or more accounts before migrating it.
- `hs app migrate` builds and deploys **Build #1** as a baseline of the pre-migration config; redeploy it to revert later changes. If an existing project is migrated, its original `src/` moves to `archive/`.
- Features in project source files must then be **managed locally through the project**, not in the app management UI or the previous developer APIs.
- `environment` values from an old `serverless.json` are not migrated: re-add them with `hs secret add` and list them in `secretKeys`.
- An account-level app **can't be converted** to user-level access; create a new app.

Step-by-step guides (legacy CRM cards, app migration, granular scopes, UI extensions SDK 0.x → 1.x): [`references/migrations.md`](references/migrations.md).

## User-Level Access (New in 2026.09)

By default apps use **account-level access**: a single uniform level of access for every user in the account. Version 2026.09 adds **user-level access**, where the app's features and API access are bound to the installing user's own HubSpot permissions. Any user whose permissions match the app's scopes can install it for themselves.

**Choose user-level** when the app should behave differently depending on who is using it. **Keep account-level** for account-wide automation or syncing data across tools.

### Enabling It

Requires CLI **8.15.0+** and `"platformVersion": "2026.09"`. Add `isUserLevel: true` to the `config` object of `src/app/app-hsmeta.json`:

```json
{
  "uid": "your-app-uid",
  "type": "app",
  "config": {
    "name": "Your App Name",
    "distribution": "marketplace",
    "isUserLevel": true,
    "auth": {
      "type": "oauth",
      "redirectUrls": ["http://localhost:4000/oauth2/hubspot-callback"]
    }
  }
}
```

Omitting the field (or setting it to `false`) keeps account-level access. Once uploaded, actions by installing users are annotated `[User] via [app name]` in HubSpot's app audit logs.

### Constraints

- **OAuth only**: apps with `static` auth can't use user-level access
- Both `marketplace` and `private` distribution are supported
- **No migration path**: an existing account-level app can't be switched to user-level; build a new app
- App pages and app settings need **your own backend service** to provide per-user functionality and avoid leaking data between individual user installs
- Marketplace: apps that mainly connect HubSpot to external generative AI tools ("AI connectors") **must** use user-level access or HubSpot's MCP Server

### Feature Support Matrix

| Feature | Account-level | User-level |
|---|---|---|
| APIs | ✅ | ⚠️ Partial |
| MCP | ❌ | ✅ |
| App pages | ✅ | ⚠️ Partial |
| App settings | ✅ | ⚠️ Partial |
| `hubspot.fetch()` | ✅ | ✅ |
| UIE hooks | ✅ | ✅ |
| App cards | ✅ | ❌ |
| Serverless functions | ✅ | ❌ |
| Webhooks (v3, v4) | ✅ | ❌ |
| Custom workflow actions | ✅ | ❌ |
| Agent tools | ✅ | ❌ |
| App events | ✅ | ❌ |
| App objects | ✅ | ❌ |
| CMS | ✅ | ❌ |
| SCIM | ✅ | ❌ |

### API and Scope Support

Supported REST API areas (2026-09 APIs):
- **Automation**: Sequences. Create enrollments and manage sequence definitions only; read, unenroll and pause are not supported.
- **CRM**: object APIs including contacts, companies, deals, tickets, leads, custom objects, line items, products, quotes, orders, invoices, carts and engagements (calls, emails, meetings, notes, tasks), plus:
  - Associations: create a single labeled or unlabeled association and read a record's associations only (no bulk, label or limits management)
  - Pipelines and stages: read only
  - Forecasts **(BETA)**: list, get and search only
  - Price Books and Price Book items **(BETA)**: list, get and batch read only
- **Sales**: email templates

All scopes tied to those endpoints work with user-level apps **except**:

- `cpq.quote_templates.read`
- `cpq.quotes.read`
- `cpq.quotes.write`
- `marketing.lead_scoring.read`
- `marketing.lead_scoring.write`
- `crm.schemas.custom.write`

> Full reference: [Configure user-level access for an app](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/user-level-apps)

## Agent Tools (BETA)

Agent tools are custom workflow actions that HubSpot AI agents can call. They are **in beta**: build them in a developer test account created from a developer account opted in to the beta. The docs list platform versions 2025.2 and 2026.03 for them; 2026.09 support is not stated (unverified).

### How Agent Tools Work

- Same component as a workflow action: `src/app/workflow-actions/*-hsmeta.json` with `"type": "workflow-action"`, plus a client entry in `supportedClients`:

```json
{
  "client": "AGENTS",
  "toolType": "GET_DATA",
  "llmConfig": { "actionDescription": "Looks up the current order status for a customer email." }
}
```

- `toolType`: `GET_DATA`, `GENERATE`, or `TAKE_ACTION` (`TAKE_ACTION` needs user review by default).
- `actionUrl` must be an external public POST endpoint — **serverless functions are not supported**. Requests carry `X-HubSpot-Signature` (v2 per the reference).
- Respond with `outputFields` whose keys **and values are all strings**; `hs_execution_state` can be `SUCCESS`, `FAIL_CONTINUE`, or `BLOCK`.
- Don't mark inputs `isRequired` during development: required fields can't be changed or removed after upload.
- Test as a workflow action first, then with the **Developer Tool Testing Agent** from the Marketplace.

### Listing Requirements

For Marketplace-listed apps, agent tools can be deployed to the production app **only after HubSpot approval** (approval form with tool `uid`s and a test video of at least 3 minutes; first feedback within 10 business days). Tools must follow the [agent tool listing requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/agent-tool-listing-requirements): accurate `toolType`, verb-first names of 3–7 words, 50–150 character descriptions, labelled and described inputs, matching `.read` scopes, and no sensitive-data scopes.

> Full config and execution format: [`references/features.md`](references/features.md#agent-tools-beta) · [Agent tools overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/agent-tools/overview).

## Code Sharing with npm Workspaces

Share code between app cards, settings pages, app pages and serverless functions in one project. Requires CLI **8.0.0+**.

Shared packages live in `src/app/packages/<name>/` (each with `index.ts` and `package.json`), next to the extension folders.

Root `src/app/package.json` (list every extension folder that uses shared code, plus `packages/*`):
```json
{
  "name": "my-hubspot-project",
  "workspaces": ["cards", "settings", "pages", "packages/*"]
}
```

Shared package `src/app/packages/types/package.json`:
```json
{
  "name": "@my-hubspot-project/types",
  "private": true,
  "version": "1.0.0",
  "main": "index.ts"
}
```

Each extension's `package.json` depends on it by name and version:
```json
{
  "dependencies": {
    "@my-hubspot-project/types": "1.0.0"
  }
}
```

Shared packages install automatically with `hs project dev` or `hs project upload`, or manually with `hs project install-deps` (from anywhere in the project).

> Details: [Share code with npm workspaces](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/tools/code-sharing-with-npm-workspaces).

## Developer MCP Server (GA)

The local HubSpot Developer MCP server is generally available. It lets AI coding tools (Claude Code, Codex CLI, Cursor, Gemini CLI, VS Code, Windsurf) create and manage projects and CMS assets.

```shell
hs mcp setup
```

Requires HubSpot CLI **8.2.0+**. Setup is interactive; the standalone mode runs `npx @hubspot/cli` instead of a global `hs`. Tools include `create-project`, `add-feature-to-project`, `get-feature-config-schema`, `validate-project`, `upload-project`, `deploy-project`, `get-build-status`, `get-build-logs`, `find-projects`, `create-test-account`, `get-apps-info`, `search-docs` and `fetch-doc` (`add-feature-to-project` and `get-feature-config-schema` need platform 2025.2+).

> Setup: [Set up the developer MCP server](https://developers.hubspot.com/docs/developer-tooling/local-development/developer-mcp/setup) · [Tool list](https://developers.hubspot.com/docs/developer-tooling/local-development/developer-mcp/tools). For the **remote** HubSpot MCP server (MCP connectors), see [`references/oauth.md`](references/oauth.md#7-mcp-connectors-remote-hubspot-mcp-server).

## Available UI Components

Import from `@hubspot/ui-extensions` (stable in 1.0.1):
- **Layout**: `Flex`, `Stack`, `Inline`, `Box`, `AutoGrid`, `Divider`, `Spacer`, `Tile`
- **Text/Display**: `Text`, `Heading`, `Link`, `Image`, `Icon`, `Illustration`, `Tag`, `StatusTag`, `List`
- **Input**: `Input`, `TextArea`, `SearchInput`, `NumberInput`, `CurrencyInput`, `StepperInput`, `DateInput`, `TimeInput`, `Select`, `MultiSelect`, `Checkbox`, `RadioButton`, `Toggle`, `ToggleGroup`
- **Form**: `Form` (no `FormField`; put `label` + `name` on each input)
- **Actions**: `Button`, `LoadingButton` (`loading` prop), `ButtonRow`, `Dropdown` (with `Dropdown.ButtonItem`)
- **Feedback**: `Alert` (`variant` + `title`), `LoadingSpinner`, `ProgressBar`, `EmptyState`, `ErrorState`, `Tooltip` (via the `overlay` prop)
- **Overlay**: `Modal`, `ModalBody`, `ModalFooter`, `Panel`, `PanelBody`, `PanelSection`, `PanelFooter`
- **Data**: `Table`, `TableHead`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableCell`, `DescriptionList`, `DescriptionListItem`, `Statistics`, `StatisticsItem`, `StatisticsTrend`, `ScoreCircle`
- **Charts**: `BarChart`, `LineChart`
- **Navigation**: `Tabs`, `Tab`, `Accordion`, `StepIndicator`

Import from `@hubspot/ui-extensions/crm` (app cards only; none of the data components in `crm.record.sidebar`):
- **CRM Data**: `CrmPropertyList`, `CrmAssociationTable`, `CrmAssociationPivot`, `CrmAssociationPropertyList`, `CrmAssociationStageTracker`, `CrmDataHighlight`, `CrmReport`, `CrmStageTracker`, `CrmStatistics`
- **CRM Actions**: `CrmActionButton`, `CrmActionLink`, `CrmCardActions` (each takes `actionType` + `actionContext`)

Import from `@hubspot/ui-extensions/pages` (app pages): `createPageRouter`, `PageRoutes`, `PageLink`, `PageHeader`, `PageTitle`, `PageBreadcrumbs`, `usePageRoute`.

**Do not use:**
- These names don't exist: `Badge`, `IconButton`, `FormField`.
- `Grid` and other `@hubspot/ui-extensions/experimental` components are not for production.

Props and examples: [`references/ui-components.md`](references/ui-components.md).

## Webhooks Configuration

Create `src/app/webhooks/webhook-hsmeta.json`:

```json
{
  "uid": "webhooks",
  "type": "webhooks",
  "config": {
    "settings": {
      "targetUrl": "https://api.example.com/webhook",
      "maxConcurrentRequests": 10
    },
    "subscriptions": {
      "crmObjects": [
        { "subscriptionType": "object.creation", "objectType": "contact", "active": true },
        { "subscriptionType": "object.propertyChange", "objectType": "contact", "propertyName": "lifecyclestage", "active": true }
      ],
      "legacyCrmObjects": [
        { "subscriptionType": "contact.propertyChange", "propertyName": "lastname", "active": true }
      ],
      "hubEvents": [
        { "subscriptionType": "contact.privacyDeletion", "active": true }
      ]
    }
  }
}
```

- `crmObjects`: new `object.*` events — `object.creation`, `object.deletion`, `object.merge`, `object.restore`, `object.propertyChange`, `object.associationChange` — with an `objectType` (app objects too, except `associationChange`).
- `legacyCrmObjects`: classic types such as `contact.creation`, `deal.deletion`.
- `hubEvents`: `contact.privacyDeletion` and `conversation.*`.
- `propertyName`: the property that triggers a property-change event (always set it for `object.propertyChange`; whether it is mandatory there is unverified).
- `maxConcurrentRequests`: upper threshold of concurrent requests HubSpot sends. The project docs give no limits; the webhooks API guide requires a value greater than 5.

Delivery (webhooks API guide): max **1,000 subscriptions** per app; events arrive as an **array of up to 100**; respond **2xx within 5 seconds**; failures (connection error, timeout, any 4xx/5xx) are retried **up to 10 times over 24 hours** — deduplicate on `eventId` and process asynchronously.

For a pull-based alternative (per-account subscriptions via API, ~3 days of history, list-membership and app install/uninstall events) see the **Webhooks Journal** in [`references/features.md`](references/features.md#webhooks-journal-pull-model).

### Signature Validation (Required)

| Request | Signature |
|---|---|
| Webhook deliveries | **v3** — `X-HubSpot-Signature-v3` + `X-HubSpot-Request-Timestamp` |
| `hubspot.fetch()` from UI extensions | **v3** (unsigned in local dev unless `CLIENT_SECRET` is injected) |
| Custom workflow action / agent tool execution, legacy card data | **v2** — `X-HubSpot-Signature` |

v3 = base64 HMAC-SHA256 (client secret) of `method + uri + rawBody + timestamp`, with the query string's `%3A %2F %3F %40 %21 %24 %27 %28 %29 %2A %2C %3B` decoded and requests older than 5 minutes rejected. Sign over the **raw body** (`""` for GET), not a re-serialized object. `Signature.isValid()` from `@hubspot/api-client` needs `requestBody` as a string and `timestamp` as a number, and **throws** on a stale/missing v3 timestamp — wrap it in `try/catch`. Full implementation (v3 and v2): [`references/signature-validation.md`](references/signature-validation.md).

## Custom Workflow Actions

Define actions for HubSpot workflows in `src/app/workflow-actions/*-hsmeta.json` with `"type": "workflow-action"`:

- Required: `actionUrl` (receives POST execution requests), `supportedClients: [{ "client": "WORKFLOWS" }]`, `inputFields` (`typeDefinition` + `supportedValueTypes` + `isRequired` as a sibling of `typeDefinition`), and `labels.en.actionName`.
- Optional: `inputFieldDependencies`, `outputFields`, `objectTypes` (e.g. `["CONTACT"]`; empty = all), `isPublished` (default `false`), `labels.<locale>.executionRules` messages.
- Execution requests are signed with **v2** `X-HubSpot-Signature`. Return `outputFields` (optionally with `hs_execution_state`: `SUCCESS`, `FAIL_CONTINUE`, `BLOCK`, `ASYNC`); 429 and 5xx are retried (5xx for up to 3 days).

Full example and execution details: [`references/features.md`](references/features.md#custom-workflow-actions) · [docs](https://developers.hubspot.com/docs/apps/developer-platform/add-features/custom-workflow-actions).

## `package.json` for UI Extensions

```json
{
  "name": "my-card",
  "version": "0.1.0",
  "dependencies": {
    "@hubspot/ui-extensions": "1.0.1",
    "react": "18.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

Install: `hs project install-deps`

- `@hubspot/ui-extensions` 1.x declares `react` **18.3.1** as an exact peer dependency, so any other React version fails with a peer conflict.
- It requires Node.js 20 or later.
- Pin versions you have tested (check with `npm view @hubspot/ui-extensions version`) and commit the lockfile. `"latest"` makes builds non-reproducible.

## Distribution & Auth Summary

| Distribution | Auth Type | Install Limit |
|---|---|---|
| `private` | `static` | 1 standard account at a time + up to 10 developer test accounts |
| `private` | `oauth` | Up to 10 allowlisted accounts (test accounts not counted) |
| `marketplace` | `oauth` | Up to 25 accounts before listing (test accounts not counted); unlimited once listed |

Until the Acceptable Use Policy is signed, a `marketplace` app installs only in developer test accounts. User-level access (`isUserLevel`) needs `oauth`; serverless functions need `private` + `static`.

## App Marketplace Listing

Requirements for listing on the HubSpot Marketplace. Full details: [`references/marketplace-listing.md`](references/marketplace-listing.md).

**Technical minimums**
- **OAuth only**: `distribution: "marketplace"` with `auth.type: "oauth"`. See [`references/oauth.md`](references/oauth.md).
- **Active installs**: at least **3** active, unique installs in accounts unaffiliated with you, with successful activity in the **past 30 days**. Activity counts OAuth API calls and signed webhook or extension requests. Before listing, the app can be installed in at most 25 accounts.
- **Scopes**: request only scopes the app uses. Every scope's object must appear in the *Shared data* table; read + write on the same object means **bi-directional**.
- **Platform version**: apps on a version announced as unsupported can't be listed. Build on `2026.09`.
- **No classic CRM cards**: unsupported since June 16, 2025, and removed from customer views on **November 2, 2026**. The migration UI and API remain available until **December 1, 2026**. See [`references/migrations.md`](references/migrations.md).
- **AI connectors**: an app that mainly connects HubSpot to external generative AI tools must use user-level permissions **or** HubSpot's MCP Server.
- **App cards** get a technical review. Use the review form, with the production app ID and the build ID installed in the test account.
- **Agent tools (BETA)** need their own review. On a listed app, builds with unapproved tools fail to deploy.

**Listing content**
- Specific to the integration, not general product marketing.
- All URLs must be live, public and at most 250 characters. Allow-list the *HubSpot Crawler* user agent first.
- Provide setup documentation, an Install button URL, support resources and at least one support contact, Terms of Service, Privacy Policy, and pricing that matches your website.
- Only a **Super Admin** can submit, from **Development > App Listings**. Incomplete or inaccurate fields put the listing back in **Draft**.

**App cards**: no HubSpot brand names or logos in card names or icons; one primary button per surface; destructive styling only for destructive actions; no sensitive data scopes and no sensitive data on display.

**Review**: initial review within **10 business days**; the full cycle takes no more than 60 days from when feedback is shared; only **one app** can be under review at a time (other submissions are rejected automatically).

**Certification** (later): 60+ active installs, listed for at least 6 months, a security questionnaire, a verified domain, and renewal every 2 years. See the reference file.

## Local Development

```shell
hs project dev                                            # prompts for the account
hs project dev -p dev                                     # use a build profile
hs project dev --testing-account <id> --project-account <id>   # set both accounts (use together)
```

- Install the app in a developer test account first. The output links to the project and to a local development homepage in the test account.
- `.jsx`/`.tsx` changes reload automatically; serverless function changes need `hs project upload`.
- The local server listens on port `4828` by default (`--port` to change).
- `logger` output stays in the browser console during local dev (see [Debugging](#debugging)).
- Chrome 142+: accept the one-time local network access prompt from `app.hubspot.com`.

## Environments, Validation and Deploy

- **Build profiles**: `hs project profile add <name> --target-account <id>` creates `src/hsprofile.<name>.json` (`accountId` + `variables`); `hs project profile delete <name>` removes one. Use `${VAR}` in `*-hsmeta.json` and `context.variables.VAR` in UI extensions. Pass `-p <profile>` (or `--profile`) to `upload` and `dev`, and `--profile <profile>` to `deploy` and `install-app`. Profiles need platform 2025.2+.
- **Test accounts** (CLI 8.3.0+): `hs test-account create-config` writes a config file; `hs test-account create --config-path ./test-accounts/qa.json` creates the account; `hs test-account import-data --account <id> --file-path <file>` seeds it with CRM data.
- **Validation**: `hs project validate` (config and structure) and `hs project lint` (ESLint v9 on UI components) before every upload. Full procedure: [`references/validation.md`](references/validation.md).
- **Deploy and rollback**:
  ```shell
  hs project list-builds --project <name> --limit 10
  hs project deploy --project <name> --build <id> --profile prod
  ```
  New projects auto-deploy after a successful build (toggle on the **Project Settings** tab); `hs project upload --skip-auto-deploy` builds without deploying.
- **Static-auth installs from the CLI**: `hs project install-app --profile <name>`; check with `hs project app-install-status <accountId>`.
- **CI/CD**: official GitHub Action `HubSpot/hubspot-project-actions/project-upload@v1.1.0` (v1.1.0+ for profiles), one workflow per branch/profile. With profiles, pass `profile`, `account_id` and `personal_access_key` as `with` inputs. Template in [`references/validation.md`](references/validation.md#cicd-with-github-actions).

## Debugging

**CLI logs** (any app feature):

```shell
hs app logs --errors-only --since 1h                  # recent errors for the app
hs app logs --type serverless-execution --tail        # stream one log type
hs app logs <log-id>                                  # full details of one entry
```

`--type` values include `webhooks`, `api-call`, `serverless-execution`, `crm-extensibility-card`, `extension-log`, `extension-render` and `oauth-authorization`.

**In HubSpot**:
- Go to **Development > Monitoring > Logs > UI Extensions**. The tabs are *Extension Render*, *hubspot.fetch()* and *Extension Log*.
- Each row's actions menu has **Open details** and **Open tracing**.
- When a card fails to load, the error shows a **trace ID**. Look it up in the **Log Traces** tab to see that request's logs.

**In code**, use `logger`. Each method takes one string:

```js
import { logger } from "@hubspot/ui-extensions";

logger.info("Info message");
logger.debug("Debug message");
logger.warn("Warning message");
logger.error("Error message");
```

- During `hs project dev`, logger output is **not sent to HubSpot**. It appears in the browser console, and a local logs panel (last 50 logs) opens from the button at the bottom right of the extension.
- Deployed: each account is limited to **1,000 logs per minute**. Past that, logging stops until the page reloads, so never log inside render loops.
- To ship logs to Sentry, Honeycomb or your own backend, add app **telemetry** (`src/app/telemetry/telemetry-hsmeta.json`). See the [telemetry docs](https://developers.hubspot.com/docs/apps/developer-platform/add-features/add-telemetry).

## Additional Resources

### Reference Files

- **`references/app-configuration.md`**: `hsproject.json` and the full `app-hsmeta.json` schema, distribution and install limits, OAuth vs static auth, `isUserLevel`, `permittedUrls`, `hs project add` feature values, UID rules
- **`references/oauth.md`**: OAuth for `oauth` apps: config, install URL, code exchange, token storage and refresh, uninstall, other credentials (static token, service keys, personal access keys), MCP connectors for the remote HubSpot MCP server
- **`references/scopes.md`**: OAuth scopes by category, granular-scope migration, deprecated scopes, scopes unsupported under user-level access
- **`references/ui-extensions-sdk.md`**: `hubspot.extend`, context, actions, v1 hooks, formatting and pagination, overlays, logger, 0.x → 1.x migration
- **`references/ui-components.md`**: props and examples for standard, CRM data, CRM action and app pages components (`@hubspot/ui-extensions` 1.0.1); loading/error/empty pattern
- **`references/fetching-data.md`**: `hubspot.fetch()`: differences from native fetch, signature, limits, `permittedUrls`, request metadata and signing, Authorization header, local dev proxy, monitoring
- **`references/features.md`**: app pages and legacy app home, settings page, serverless functions, app events, app objects and associations, custom workflow actions, agent tools (BETA), webhooks, Webhooks Journal, telemetry
- **`references/signature-validation.md`**: which requests use v3 or v2, how each is computed, raw-body capture, validation code with Node `crypto` and `@hubspot/api-client`
- **`references/marketplace-listing.md`**: Marketplace listing requirements, app card review, brand rules, listing content, submission and review, agent tool listing requirements, certification
- **`references/migrations.md`**: legacy CRM cards → app cards (dates and steps), app migration to 2026.09, granular scopes, UI extensions SDK 0.x → 1.x
- **`references/best-practices.md`**: rules with rationale and wrong/right examples: versioning, environments, auth and secrets, API rate limits, UI states, serverless functions, webhooks, deploy and rollback, things to never do
- **`references/validation.md`**: validation procedure and Definition of Done: CLI checks, static checks, scope review, test-account checklist, GitHub Actions template, rollback

### Official Documentation

- **Build and configure**: [Create an app](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app) · [App configuration reference](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/app-configuration) · [Manage apps in HubSpot](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/manage-apps-in-hubspot) · [Authentication overview](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/overview) · [Configure user-level access](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/user-level-apps) · [MCP connectors (remote HubSpot MCP server)](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server)
- **Migrate**: [Migrate to 2026.09](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/migrate-an-app/migrate-to-the-latest-platform-version) · [Migrate a legacy CRM card to an app card](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/migrate-an-app/migrate-legacy-crm-cards-to-app-cards)
- **UI extensions**: [UI extensions overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/overview) · [App cards reference](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/app-cards/reference) · [App pages overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/app-pages/overview) · [App home page (legacy)](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/app-home-page) · [Settings page](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/create-a-settings-page) · [Bulk action (BETA)](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/create-a-bulk-action) · [UI extensions SDK](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/ui-extensions-sdk/overview) · [Fetching data](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/fetching-data) · [UI components overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/ui-components/overview) · [Logging and monitoring](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/logging-and-monitoring) · [Code sharing with npm workspaces](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/tools/code-sharing-with-npm-workspaces)
- **Other features**: [Serverless functions overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/serverless-functions/overview) · [Configure webhooks](https://developers.hubspot.com/docs/apps/developer-platform/add-features/configure-webhooks) · [Custom workflow actions](https://developers.hubspot.com/docs/apps/developer-platform/add-features/custom-workflow-actions) · [Agent tools overview (BETA)](https://developers.hubspot.com/docs/apps/developer-platform/add-features/agent-tools/overview) · [App events (requires approval)](https://developers.hubspot.com/docs/apps/developer-platform/add-features/app-events/overview) · [App objects (requires approval)](https://developers.hubspot.com/docs/apps/developer-platform/add-features/app-objects/overview) · [SCIM](https://developers.hubspot.com/docs/apps/developer-platform/add-features/scim) · [Telemetry](https://developers.hubspot.com/docs/apps/developer-platform/add-features/add-telemetry)
- **Marketplace**: [App Marketplace listing requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/app-marketplace-listing-requirements) · [How to list your app](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/listing-your-app) · [App certification requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/apply-for-certification/certification-requirements) · [Agent tool listing requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/agent-tool-listing-requirements)
- **Tooling and platform**: [Install the HubSpot CLI](https://developers.hubspot.com/docs/developer-tooling/local-development/hubspot-cli/install-the-cli) · [CLI project commands](https://developers.hubspot.com/docs/developer-tooling/local-development/hubspot-cli/project-commands) · [Developer MCP server setup](https://developers.hubspot.com/docs/developer-tooling/local-development/developer-mcp/setup) · [Build with config profiles](https://developers.hubspot.com/docs/developer-tooling/local-development/build-with-config-profiles) · [Configurable test accounts](https://developers.hubspot.com/docs/developer-tooling/local-development/configurable-test-accounts) · [Set up GitHub Actions](https://developers.hubspot.com/docs/developer-tooling/third-party-tools/set-up-github-actions) · [Platform versioning](https://developers.hubspot.com/docs/developer-tooling/platform/versioning) · [API usage guidelines and limits](https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines)
