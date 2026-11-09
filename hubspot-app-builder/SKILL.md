---
name: hubspot-app-builder
description: This skill should be used when the user asks to "build a HubSpot app", "create a HubSpot app", "add a card to HubSpot", "create an app card", "build a UI extension", "set up HubSpot webhooks", "configure HubSpot app", "add a settings page to HubSpot app", "build a HubSpot home page", "fetch data in HubSpot extension", "configure user-level access", "build a user-level HubSpot app", "list an app on the HubSpot marketplace", "submit a HubSpot app listing", "marketplace listing requirements", "add serverless functions to HubSpot app", "validate a HubSpot project", "deploy a HubSpot app to production", "HubSpot app best practices", "review my HubSpot app code", or mentions building on the HubSpot developer platform 2026.09. Provides comprehensive guidance for building full HubSpot apps with best practices, CLI commands, file structure, serverless functions, user-level access, and App Marketplace listing requirements.
version: 1.4.0
---

# HubSpot App Builder (Platform 2026.09)

This skill guides the development of full HubSpot apps on the latest developer platform (version `2026.09`), covering project creation, configuration, UI extensions, serverless functions, user-level access, agent tools, webhooks, and distribution.

> **Platform version 2026.09** became available on September 8, 2026 and is the **Current** version. It adds support for **user-level access** in apps — apps that act on behalf of a specific user and enforce that user's in-app HubSpot permissions instead of broad account-wide access. It carries forward all functionality from 2025.2 and 2026.03.
>
> **Version status today:** `2026.09` Current · `2026.03` Supported · `2025.2` Supported · `2025.1`, `2023.2`, `2023.1` Sunset. HubSpot ships a GA version every 6 months (March and September); a version is Current for 6 months, Supported until 18 months after GA, then Unsupported (uploads fail).

## Non-Negotiable Rules (read before writing any code)

These apply to every HubSpot project. Details, rationale and examples: [`references/best-practices.md`](references/best-practices.md).

1. **Current platform version** (`2026.09`) and **pinned dependencies** — never `"latest"`.
2. **Build profiles per environment** (`hs project profile add dev|qa|prod`); develop in **developer test accounts**, never in a client's production portal.
3. **No secret in front-end code or in the repo.** Secrets go in serverless function secrets or your backend.
4. **Least-privilege scopes**: only what the code calls; extras go in `optionalScopes`.
5. **Validate `X-HubSpot-Signature-v3`** on every backend endpoint (webhooks and `hubspot.fetch()` targets).
6. **Every data view handles loading, error and empty states.**
7. **Respect API limits**: batch endpoints, pagination, caching, webhooks over polling, backoff on `429`.
8. **Serverless functions never return raw errors**; webhook handlers are idempotent.
9. **Production deploys go through CI** with the `prod` profile, and you know the build ID to roll back to.
10. **Nothing is "done" before [`references/validation.md`](references/validation.md) passes**: `hs project validate`, `hs project lint`, static checks, scope review, test-account run, Definition of Done checklist.

## Development Workflow (always follow this order)

```
1. hs project create / hs project add          → scaffold
2. hs project profile add dev|qa|prod           → environments
3. hs test-account create --config-path …       → reproducible test account
4. hs project dev -p dev                        → build with hot reload
5. hs project validate && hs project lint       → blocking checks
6. Static checks + scope review                 → references/validation.md
7. hs project upload -p qa  → test with a restricted user
8. Merge → CI deploys with -p prod              → note previous build ID for rollback
```

When reviewing existing code, apply the same rules and report each violation with its fix.

## Prerequisites

- HubSpot CLI v8.4.0+: `npm install -g @hubspot/cli@latest`
- Authenticate: `hs account auth`
- Node.js 22+ (minimum raised to v22 in 2025.2 and carried into 2026.03 and 2026.09; was v20 in 2025.1)
- A HubSpot developer account
- Enterprise subscription required for production serverless functions (developer test accounts work without)

## Project Setup Workflow

### 1. Create the Project

```shell
hs project create
```

Follow CLI prompts to configure:
- **Distribution**: `marketplace` (for App Marketplace listing) or `private` (for specific accounts)
- **Auth**: `oauth` (multiple accounts) or `static` (single account)
- **Features**: Select from `card`, `settings`, `pages`, `app-function`, `serverless-function`, `webhooks`, `workflow-action`

To add a feature later:
```shell
hs project add
```

### 2. Project File Structure

```
my-project-folder/
├── hsproject.json                    # Must include "platformVersion": "2026.09"
├── packages/                         # Shared code (npm workspaces, optional)
│   └── shared-utils/
│       ├── index.ts
│       └── package.json
└── src/
    └── app/
        ├── app-hsmeta.json          # Top-level app config (required)
        ├── cards/                    # UI extension cards
        │   ├── MyCard.jsx
        │   ├── my-card-hsmeta.json
        │   └── package.json
        ├── pages/                    # App Pages (multi-page, formerly App Homes)
        │   ├── HomePage.jsx
        │   ├── home-page-hsmeta.json
        │   ├── DetailPage.jsx
        │   ├── detail-page-hsmeta.json
        │   └── package.json
        ├── settings/                 # App settings page
        │   ├── Settings.tsx
        │   ├── settings-hsmeta.json
        │   └── package.json
        ├── functions/                # Serverless functions (2026.03+ format)
        │   ├── myFunction.js
        │   ├── myFunction-hsmeta.json   # Individual config per function
        │   └── package.json
        ├── app-events/               # App events (open beta)
        │   └── my-event-hsmeta.json
        ├── app-objects/              # App objects (open beta)
        │   └── my-object-hsmeta.json
        ├── webhooks/                 # Webhook subscriptions
        │   └── webhooks-hsmeta.json
        └── workflow-actions/         # Custom workflow actions / Agent tools
            └── custom-action-hsmeta.json
```

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
- `uid` must be globally unique within the project (up to 64 chars, alphanumeric + `_`, `-`, `.`)
- `type` must match the parent folder name (`app`)
- Use `static` auth + remove `redirectUrls` for single-account private apps
- At minimum, include one `read` scope (e.g., `crm.objects.contacts.read`)

### 4. Upload and Deploy

```shell
hs project upload          # Upload and trigger a build
hs project open            # Open project in HubSpot browser
hs project dev             # Start local dev server with hot reload
hs project install-deps    # Install package.json dependencies
```

### 5. Install the App

After uploading, install via HubSpot UI:
- Navigate to **Development > Projects > [Project Name] > [App UID]**
- Click the **Distribution** tab
- For test accounts: click **Add test install(s)**
- For standard accounts: click **Install now**

## UI Extensions

All UI extensions share the same structure: a `*-hsmeta.json` config + a React component file (`.jsx` or `.tsx`).

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

**Supported locations:**
| Location | Value | Notes |
|---|---|---|
| CRM middle column | `crm.record.tab` | Most common; supports custom tabs |
| CRM right sidebar | `crm.record.sidebar` | No CRM data components here |
| CRM preview panel | `crm.preview` | Record previews across CRM |
| Help desk sidebar | `helpdesk.sidebar` | Requires `tickets` scope |
| App Pages (formerly App Home) | `home` | Multi-page full-screen experience; use `PageRoutes` and `PageLink` for navigation |
| App settings page | `settings` | Config UI in HubSpot settings |

**Supported objectTypes:** `contacts`, `companies`, `deals`, `tickets`, `orders`, `carts`, `p_customObjectName`, `app_object_uid`

### React Component Pattern

```jsx
import React from "react";
import { hubspot, Text, Button, Flex } from "@hubspot/ui-extensions";

// Required: register extension with HubSpot
hubspot.extend(({ context, actions }) => (
  <MyCard context={context} addAlert={actions.addAlert} />
));

const MyCard = ({ context, addAlert }) => {
  return (
    <Flex direction="column" gap="medium">
      <Text>Hello, {context.user.firstName}!</Text>
      <Button onClick={() => addAlert({ type: "success", title: "Done", message: "Action completed" })}>
        Click me
      </Button>
    </Flex>
  );
};
```

### SDK Hooks (Preferred Approach)

```tsx
import { hubspot, Button, LoadingSpinner, ErrorState, EmptyState, useExtensionApi } from "@hubspot/ui-extensions";
import { useCrmProperties } from "@hubspot/ui-extensions/crm";

hubspot.extend<'crm.record.tab'>(() => <MyCard />);

const MyCard = () => {
  // Access both context and actions
  const { context, actions } = useExtensionApi<'crm.record.tab'>();

  // Fetch CRM properties from the current record
  const { properties, isLoading, error, refetch } = useCrmProperties(["firstname", "lastname", "email"]);

  // Always handle loading, error and empty states
  if (isLoading) return <LoadingSpinner label="Loading..." />;
  if (error) return <ErrorState title="Couldn't load this record"><Button onClick={refetch}>Retry</Button></ErrorState>;
  if (!properties.firstname) return <EmptyState title="No first name on this record" />;

  return (
    <Button onClick={() => actions.addAlert({ message: `Hello ${properties.firstname}!` })}>
      Say Hello
    </Button>
  );
};
```

**Available hooks:**
- `useExtensionApi<location>()` — access both context + actions
- `useExtensionContext<location>()` — access context only
- `useExtensionActions<location>()` — access actions only
- `useCrmProperties(["prop1", "prop2"])` — from `@hubspot/ui-extensions/crm`
- `useAssociations({ toObjectType, properties, pageLength })` — from `@hubspot/ui-extensions/crm`

### Fetching External Data

```jsx
import { hubspot } from "@hubspot/ui-extensions";

// GET
const response = await hubspot.fetch("https://api.example.com/data", {
  method: "GET",
  timeout: 5000,
});
const data = await response.json();

// POST — body is a plain object, not JSON.stringify()
const response = await hubspot.fetch("https://api.example.com/data", {
  method: "POST",
  body: { key: "value" },
});
```

Key differences from native `fetch`:
- `body` is a plain object — do not `JSON.stringify()` or set `Content-Type` manually
- Only `Authorization` is supported as a custom header
- URLs must be listed in `permittedUrls.fetch`; `localhost` is not allowed (use a proxy)
- HubSpot appends `userId`, `portalId`, `userEmail`, `appId` as query params on every request
- Max 20 concurrent requests; 15s timeout; 1MB payload limit

Your backend must validate `X-HubSpot-Signature-v3` on every incoming request — see [`references/signature-validation.md`](references/signature-validation.md).

For the full guide (proxy setup, Authorization header pattern, local dev signing, monitoring), see [`references/fetching-data.md`](references/fetching-data.md).

## Serverless Functions (2026.03+ Format)

Platform version 2026.03 re-introduced full serverless function support for apps, including apps using static auth, and 2026.09 carries it forward. **Serverless functions are not supported in user-level apps** — see [User-Level Access](#user-level-access-new-in-202609). Serverless functions execute server-side JavaScript within HubSpot's infrastructure, eliminating the need for external servers.

> **Important:** 2026.03 and 2026.09 use a **per-function `-hsmeta.json` config** instead of the single `serverless.json` used in 2025.1. Each function has its own config file in `src/app/functions/`.

### Types of Serverless Functions

- **Private (App) functions** — internal functions called by UI extensions from App Cards, App Pages, and App Settings. Requires Enterprise subscription or a free developer test account.
- **Public endpoint functions** — HTTP-accessible endpoints. Requires Content Hub Enterprise. **Not available in developer test accounts.**

### Directory Structure (2026.03+)

```
src/app/functions/
├── myFunction.js
├── myFunction-hsmeta.json    # Individual config per function
└── package.json
```

This replaces the 2025.1 structure that used nested `.functions` folders with a single `serverless.json`.

### Configuration (`myFunction-hsmeta.json`)

**Private app function (no public endpoint):**

```json
{
  "uid": "myFunction",
  "type": "app-function",
  "config": {
    "entrypoint": "/app/functions/myFunction.js",
    "secretKeys": ["my_api_key"]
  }
}
```

**App function with public endpoint:**

```json
{
  "uid": "myPublicFunction",
  "type": "app-function",
  "config": {
    "entrypoint": "/app/functions/myPublicFunction.js",
    "secretKeys": ["my_api_key"],
    "endpoint": {
      "path": "my-endpoint",
      "method": ["GET", "POST"]
    }
  }
}
```

### Serverless Function Pattern

```js
// myFunction.js
const hubspot = require("@hubspot/api-client");

exports.main = async (context = {}) => {
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN,
  });

  try {
    const res = await hubspotClient.crm.contacts.basicApi.getPage();
    return { ok: true, data: res.results };
  } catch (err) {
    // Never return the raw error: it can leak headers or tokens to the front end
    console.error("getContacts failed", err.code || err.message);
    return { ok: false, error: { message: "Could not load contacts", status: err.code || 500 } };
  }
};
```

### Key Notes
- Uses `process.env` for access tokens (not `context.secrets`)
- Async/await required (callbacks no longer supported)
- Log size up to 256KB, guaranteed execution order
- Secrets managed via `hs secret add` CLI command
- NPM packages supported
- Enterprise subscription required for production (test accounts work without)
- Functions can now run in **Developer Test Accounts** for safer iteration before production

## Migrating to 2026.09

Requires HubSpot CLI **v8.4.0+**. Migration path depends on your current version:

**From 2026.03 or 2025.2:**
1. Update `platformVersion` to `"2026.09"` in `hsproject.json`
2. Run `hs project upload`

**From 2025.1, 2023.2, or 2023.1:**
1. Run `hs project migrate` in your project directory and follow the prompts — all components migrate automatically to 2026.09

**From legacy public apps (non-project-based):**
1. Run `hs app migrate` and follow the prompts (choose app → confirm components → project name, local path, UIDs)
2. This preserves the original auth credentials, app features, and installs; no backend changes required
3. Build #1 captures the app's pre-migration configuration as a baseline you can safely redeploy to revert later changes

**Key migration notes:**
- Environment variables from old `serverless.json` must be re-added as secrets using `hs secret add`
- The old `serverless.json` single-config is replaced by individual `-hsmeta.json` files per function in `src/app/functions/`
- After migration, features represented in project source files must be managed **locally through the project** — they are no longer editable in the app management UI or via the previous developer APIs
- Migrating a legacy **non-project-based private app** to 2026.09 is **not currently supported**
- Existing account-level apps **cannot be converted to user-level access** — create a new app instead

> **Warning:** Migrating legacy private or public apps is irreversible — you cannot downgrade back.

## User-Level Access (New in 2026.09)

By default apps use **account-level access**: a single uniform level of access for every user in the account. Version 2026.09 adds **user-level access**, where the app's features and API access are bound to the installing user's own HubSpot permissions, and each user installs the app for themselves.

**Choose user-level** when the app should behave differently depending on who is using it. **Keep account-level** for account-wide automation or syncing data across tools.

### Enabling It

Add `isUserLevel: true` to the `config` object of `src/app/app-hsmeta.json`:

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

- **OAuth only** — apps with `static` auth cannot use user-level access
- Both `marketplace` and `private` distribution are supported
- **No migration path** — an existing account-level app cannot be switched to user-level; build a new app
- For app pages and app settings you must run **your own backend service** to provide per-user functionality and to avoid leaking data between individual user installs

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

Supported REST API areas: **Automation** (Sequences — create enrollments and manage sequence definitions only; read, unenroll, and pause do **not** yet support user-level), **CRM**, and **Sales**.

All scopes tied to those supported endpoints work with user-level apps **except**:

- `cpq.quote_templates.read`
- `cpq.quotes.read`
- `cpq.quotes.write`
- `marketing.lead_scoring.read`
- `marketing.lead_scoring.write`
- `crm.schemas.custom.write`

> Full reference: [Configure user-level access for an app](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/user-level-apps)

## Agent Tools (New in 2026.03)

Agent tools are enhanced custom workflow actions that HubSpot AI agents (Breeze Agents) can call to perform tasks on behalf of users. They are built using the Developer Projects framework.

### How Agent Tools Work

- Built as enhanced `workflowAction` type in your project
- Submitted for review before distribution
- Once approved, made available to customers via your app listing and Breeze Agents
- Marketplace-listed apps cannot deploy unapproved agent tools — deploys will fail until the tool passes review

### Listing Requirements

Apps that ship agent tools must comply with [agent tool listing requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/agent-tool-listing-requirements).

> For more details, see the [Agent Tools overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/agent-tools/overview).

## Code Sharing with npm Workspaces (New in 2026.03)

You can now share code across multiple UI extensions (app cards, settings pages, app pages) within a single project using npm workspaces.

### Setup

Create shared packages alongside your extensions:

```
my-project-folder/
├── packages/
│   └── shared-utils/
│       ├── index.ts
│       └── package.json
└── src/
    └── app/
        ├── cards/
        │   └── package.json     # declares shared-utils as dependency
        └── pages/
            └── package.json     # declares shared-utils as dependency
```

Each extension's `package.json` references the shared package:
```json
{
  "dependencies": {
    "shared-utils": "*"
  }
}
```

### Installation

Shared packages are installed automatically when you run `hs project dev` or `hs project upload`, or manually with:
```shell
hs project install-deps
```

> For details, see [Code sharing with npm workspaces](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/tools/code-sharing-with-npm-workspaces).

## Developer MCP Server (GA)

The local HubSpot Developer MCP server is now generally available, enabling app and CMS development through AI-powered code editors (Claude Code, Cursor, VS Code, etc.).

### Setup

```shell
hs mcp setup
```

Requires HubSpot CLI v8.2.0+. Available tools include: `create-project`, `add-feature-to-project`, `upload-project`, `deploy-project`, `validate-project`, `search-docs`, `fetch-doc`, `get-build-status`, `get-build-logs`, and more.

> For the full tool list and setup, see [Developer MCP Server docs](https://developers.hubspot.com/docs/developer-tooling/local-development/mcp-server).

## Available UI Components

Import from `@hubspot/ui-extensions`:
- **Layout**: `Flex`, `Box`, `Divider`, `Grid`, `AutoGrid`, `Spacer`, `Inline`
- **Text/Display**: `Text`, `Heading`, `Image`, `Link`, `Icon`, `Illustration`
- **Input**: `Input`, `TextArea`, `Select`, `MultiSelect`, `Checkbox`, `RadioButton`, `DateInput`, `NumberInput`, `CurrencyInput`, `SearchInput`, `StepperInput`, `Toggle`, `ToggleGroup`
- **Actions**: `Button`, `LoadingButton`, `IconButton`, `ButtonRow`
- **Feedback**: `Alert`, `LoadingSpinner`, `Tag`, `StatusTag`, `Badge`, `Tooltip`, `ProgressBar`, `EmptyState`, `ErrorState`
- **Overlay**: `Modal`, `ModalBody`, `ModalFooter`, `Panel`, `PanelBody`, `PanelFooter`, `Dropdown`
- **Data**: `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`, `DescriptionList`, `Statistics`, `ScoreCircle`
- **Navigation**: `Tabs`, `StepIndicator`, `Accordion`
- **Charts**: `BarChart`, `LineChart`
- **Container**: `Tile`
- **Form**: `Form`, `FormField`
- **List**: `List`

Import from `@hubspot/ui-extensions/crm`:
- **CRM Data**: `CrmPropertyList`, `CrmAssociationTable`, `CrmAssociationPivot`, `CrmAssociationPropertyList`, `CrmAssociationStageTracker`, `CrmDataHighlight`, `CrmReport`, `CrmStageTracker`, `CrmStatistics`
- **CRM Actions**: `CrmActionButton`, `CrmActionLink`, `CrmCardActions`

## Webhooks Configuration

Create `src/app/webhooks/webhooks-hsmeta.json`:

```json
{
  "uid": "my-webhooks",
  "type": "webhooks",
  "config": {
    "settings": {
      "targetUrl": "https://api.example.com/webhook",
      "maxConcurrentRequests": 10
    },
    "subscriptions": {
      "crmObjects": [
        {
          "subscriptionType": "object.creation",
          "objectType": "contact",
          "active": true
        },
        {
          "subscriptionType": "object.propertyChange",
          "objectType": "contact",
          "active": true
        }
      ],
      "legacyCrmObjects": [
        {
          "subscriptionType": "contact.propertyChange",
          "propertyName": "email",
          "active": true
        }
      ],
      "hubEvents": [
        {
          "subscriptionType": "contact.privacyDeletion",
          "active": true
        }
      ]
    }
  }
}
```

Use `crmObjects` for new-format events (`object.*`). Use `legacyCrmObjects` for classic types like `contact.creation`. Use `hubEvents` for `contact.privacyDeletion` and `conversation.*`.

### Signature Validation (Required)

HubSpot signs all outbound requests with `X-HubSpot-Signature-v3`:
- **Webhook deliveries** — HubSpot POSTs event payloads to your `targetUrl`
- **Card / settings page fetch** — any `hubspot.fetch()` call from a UI extension is proxied and signed by HubSpot

Both must be validated the same way using `Signature.isValid()` from `@hubspot/api-client`. For the complete implementation, see [`references/signature-validation.md`](references/signature-validation.md).

## `package.json` for UI Extensions

```json
{
  "name": "my-card",
  "version": "0.1.0",
  "dependencies": {
    "@hubspot/ui-extensions": "1.0.1",
    "react": "18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

Install: `hs project install-deps`

Pin versions you have tested (check with `npm view @hubspot/ui-extensions version`) and commit the lockfile — `"latest"` makes builds non-reproducible.

## Distribution & Auth Summary

| Distribution | Auth Type | Install Limit |
|---|---|---|
| `private` | `static` | 1 standard account + 10 test accounts |
| `private` | `oauth` | Up to 10 allowlisted accounts |
| `marketplace` | `oauth` | 25 before listing; unlimited after |

## App Marketplace Listing

Before submitting to the HubSpot App Marketplace, the app must meet these key requirements:

**Technical minimums:**
- OAuth is the **sole** authorization method — no API keys or private app tokens
- At least **3 active installs** from unaffiliated accounts with OAuth-authenticated API activity in the past 30 days
- Only request scopes the app actually uses; all requested scopes must appear in the *Shared data* table
- Must run on a **supported platform version** (2025.2+ today, 2026.09 recommended)
- Must use a **supported date-based API version** for certified apps
- Classic CRM cards are **not allowed** for new listings/certifications (must migrate to App Cards by **October 31, 2026**)
- Agent tools are a **reviewable surface** — deploys fail until tools pass review for compliance with [agent tool listing requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/agent-tool-listing-requirements)

**Listing content:**
- Content must be integration-specific (not general product marketing)
- All URLs must be live, publicly accessible, and under 250 characters — add *HubSpot Crawler* to your site allow list before submitting
- Include: setup documentation, Install button URL, support resources, Terms of Service, Privacy Policy, and pricing (matching your website exactly)
- Bi-directional sync must be declared in *Shared data* when both read and write scopes are requested for the same object

**App cards (if using UI extensions):**
- Do not use HubSpot brand names in card names or icons
- One primary button per surface; destructive buttons must use destructive styling
- Must not access or display sensitive data

**Review process:** Initial review within 10 business days; full cycle up to 60 days. Only one app can be under review at a time.

For the complete requirements checklist, see [`references/marketplace-listing.md`](references/marketplace-listing.md).

## Local Development

```shell
hs project dev            # Starts dev server with hot reload
```

After starting, a local development homepage appears in the test account showing active dev sessions. Changes to `.jsx`/`.tsx` files reload automatically.

Note (Chrome 142+): Accept the local network access popup from `app.hubspot.com` on first launch.

## Environments, Validation and Deploy

- **Build profiles**: `hs project profile add <name> --target-account <id>` creates `src/hsprofile.<name>.json` (`accountId` + `variables`). Use `${VAR}` in `*-hsmeta.json` and `context.variables.VAR` in UI extensions. Once profiles exist, pass `-p <profile>` to `upload`, `dev` and `deploy`.
- **Test accounts**: `hs test-account create --config-path ./test-accounts/qa.json`, seed with `hs test-account import-data`.
- **Validation**: `hs project validate` (config and structure) and `hs project lint` (ESLint v9 on UI components) before every upload — full procedure in [`references/validation.md`](references/validation.md).
- **Deploy and rollback**: `hs project list-builds --project <name>`, `hs project deploy --build <id> -p prod`. New projects auto-deploy after a successful build; use `hs project upload --skip-auto-deploy` to build only.
- **CI/CD**: official GitHub Actions `HubSpot/hubspot-project-actions/project-upload@v1.1.0` with one workflow per branch/profile — template in [`references/validation.md`](references/validation.md).

## Debugging

View logs: **Development > Monitoring > Logs > UI Extensions** in HubSpot.

In code, use the logger:
```js
import { logger } from "@hubspot/ui-extensions";
logger.info("Info message");
logger.debug("Debug message");
logger.warn("Warning message");
logger.error("Error message");
```

## Additional Resources

### Reference Files

For detailed configuration and patterns, consult:
- **`references/app-configuration.md`** — Complete `app-hsmeta.json` schema, auth types
- **`references/scopes.md`** — Full list of available OAuth scopes grouped by category (CRM, CMS, settings, marketing, etc.)
- **`references/ui-extensions-sdk.md`** — SDK hooks, context fields, actions API
- **`references/fetching-data.md`** — `hubspot.fetch()` full guide: differences from native fetch, limits, auto query params, Authorization header pattern, local dev proxy, signature validation
- **`references/ui-components.md`** — All UI components with examples
- **`references/features.md`** — App events, app objects (open beta), settings page, home page
- **`references/signature-validation.md`** — Full signature validation implementation for webhooks and card/settings page fetch endpoints
- **`references/marketplace-listing.md`** — Full App Marketplace listing requirements, brand rules, app card criteria, and review process
- **`references/best-practices.md`** — Rules with rationale and wrong/right examples: versioning, environments, auth and secrets, API rate limits, UI states, serverless functions, webhooks, deploy and rollback, things to never do
- **`references/validation.md`** — Validation procedure and Definition of Done: CLI checks, static checks, scope review, test-account checklist, GitHub Actions template, rollback

### Official Documentation

- [Create an app](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app)
- [App configuration reference](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/app-configuration)
- [Manage apps in HubSpot](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/manage-apps-in-hubspot)
- [UI extensions overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/overview)
- [App cards reference](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/app-cards/reference)
- [UI extensions SDK](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-extensions-sdk)
- [Fetching data](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/fetching-data)
- [UI components overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/overview)
- [App Pages (formerly App Homes)](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/overview#app-home-pages)
- [Settings page](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/create-a-settings-component)
- [App events (beta)](https://developers.hubspot.com/docs/apps/developer-platform/add-features/app-events/overview)
- [App objects (beta)](https://developers.hubspot.com/docs/apps/developer-platform/add-features/app-objects/overview)
- [Configure webhooks](https://developers.hubspot.com/docs/apps/developer-platform/add-features/configure-webhooks)
- [App Marketplace listing requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/app-marketplace-listing-requirements)
- [How to list your app](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/listing-your-app)
- [App certification requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/apply-for-certification/certification-requirements)
- [Serverless functions overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/serverless-functions/overview)
- [Agent tools overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/agent-tools/overview)
- [Agent tool listing requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/agent-tool-listing-requirements)
- [Code sharing with npm workspaces](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/tools/code-sharing-with-npm-workspaces)
- [Developer MCP Server setup](https://developers.hubspot.com/docs/developer-tooling/local-development/mcp-server)
- [MCP Auth Apps (integrate with remote MCP Server)](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server)
- [Migrate to 2026.09](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/migrate-an-app/migrate-to-the-latest-platform-version)
- [Configure user-level access](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/user-level-apps)
- [Platform versioning](https://developers.hubspot.com/docs/developer-tooling/platform/versioning)
- [CLI project commands](https://developers.hubspot.com/docs/developer-tooling/local-development/hubspot-cli/project-commands)
- [Build with config profiles](https://developers.hubspot.com/docs/developer-tooling/local-development/build-with-config-profiles)
- [Configurable test accounts](https://developers.hubspot.com/docs/developer-tooling/local-development/configurable-test-accounts)
- [Set up GitHub Actions](https://developers.hubspot.com/docs/developer-tooling/third-party-tools/set-up-github-actions)
- [API usage guidelines and limits](https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines)
