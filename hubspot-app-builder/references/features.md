# HubSpot App Features Reference

> **User-level access (2026.09):** if your app sets `isUserLevel: true`, most features below are unavailable. Only app pages (partial), app settings (partial), `hubspot.fetch()`, UIE hooks, MCP, and a subset of the CRM/Sales/Sequences APIs are supported. App cards, serverless functions, webhooks, custom workflow actions, agent tools, app events, app objects, CMS, and SCIM are **account-level only**. See the feature matrix in `SKILL.md`.

Every component lives in its own folder under `src/app/` with a `*-hsmeta.json` file whose `type` matches the feature:

| Feature | Folder | `type` |
|---|---|---|
| App pages (and legacy app home) | `pages/` | `page` |
| Settings page | `settings/` | `settings` |
| Serverless function | `functions/` | `app-function` |
| Webhooks | `webhooks/` | `webhooks` |
| Custom workflow action / agent tool | `workflow-actions/` | `workflow-action` |
| App event type | `app-events/` | `app-event` |
| App object | `app-objects/` | `app-object` |
| App object association | `app-object-associations/` | `app-object-association` |
| Telemetry | `telemetry/` | `telemetry` |

---

## App Pages

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/app-pages/overview

App pages are full-page React experiences inside HubSpot with built-in routing. An app has **one** `page` component; the individual pages are routes declared in code with `createPageRouter` and `PageRoutes`, not separate `-hsmeta.json` files.

Create it with `hs project add` → **Pages**. Users open it from the Marketplace icon → *Your recently visited apps*, or directly at `https://app.hubspot.com/app/{HubID}/{appId}`.

### File Structure

```
src/app/pages/
├── pages-hsmeta.json
├── Pages.tsx
└── package.json
```

### Configuration (`pages-hsmeta.json`)

```json
{
  "uid": "my-app-pages",
  "type": "page",
  "config": {
    "entrypoint": "/app/pages/Pages.tsx"
  }
}
```

### Routing and Navigation (`Pages.tsx`)

Routing APIs come from `@hubspot/ui-extensions/pages`:

- `createPageRouter(<PageRoutes>…</PageRoutes>)` — call at module level; returns the router component to render.
- `PageRoutes` (optional `path`, `layoutComponent`), `PageRoutes.IndexRoute` (root page), `PageRoutes.Route` (`path`, e.g. `"/docs"` or `"/customers/:customerId"`), `PageRoutes.AnyRoute` (catch-all / 404). All take `component` and an optional `id`.
- `PageLink` — `to` is a **path**; `params` fills `:tokens` and the rest become query parameters.
- `usePageRoute()` — returns `{ path, routeId, params }`.
- `useExtensionActions<'pages'>().navigateToPage({ to, params })` — programmatic navigation.
- `PageTitle` (string child), `PageBreadcrumbs`, `PageHeader` (children: `PageHeader.PrimaryAction` / `PageHeader.SecondaryActions` only).

```tsx
import React from "react";
import { hubspot, Flex, Text, Button, useExtensionActions } from "@hubspot/ui-extensions";
import {
  createPageRouter,
  PageRoutes,
  PageLink,
  PageTitle,
  usePageRoute,
} from "@hubspot/ui-extensions/pages";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <Flex direction="column" gap="medium">
    <Flex direction="row" gap="small">
      <PageLink to="/">Home</PageLink>
      <PageLink to="/customers/:customerId" params={{ customerId: "42" }}>
        Customer 42
      </PageLink>
    </Flex>
    {children}
  </Flex>
);

const HomePage = () => {
  const { navigateToPage } = useExtensionActions<"pages">();
  return (
    <>
      <PageTitle>Dashboard</PageTitle>
      <Button onClick={() => navigateToPage({ to: "/customers/:customerId", params: { customerId: "7" } })}>
        Open customer 7
      </Button>
    </>
  );
};

const CustomerPage = () => {
  const { params } = usePageRoute();
  return <Text>Customer {params.customerId}</Text>;
};

const NotFoundPage = () => <Text>Page not found.</Text>;

const PageRouter = createPageRouter(
  <PageRoutes layoutComponent={Layout}>
    <PageRoutes.IndexRoute component={HomePage} id="home" />
    <PageRoutes.Route path="/customers/:customerId" component={CustomerPage} />
    <PageRoutes.AnyRoute component={NotFoundPage} />
  </PageRoutes>
);

hubspot.extend<"pages">(() => <PageRouter />);
```

### Legacy App Home Page

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/app-home-page

Still supported, but HubSpot recommends app pages. It is a `page` component with `"location": "home"`, registered with `hubspot.extend<"home">`. Header action components (`HeaderActions`, `PrimaryHeaderActionButton`, `SecondaryHeaderActionButton`) come from `@hubspot/ui-extensions/pages/home`.

```json
{
  "uid": "app-home",
  "type": "page",
  "config": {
    "entrypoint": "/app/pages/Home.tsx",
    "location": "home"
  }
}
```

---

## App Settings Page

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/create-a-settings-page

A React settings UI that users who installed the app open from HubSpot settings. Create it with `hs project add` → **Settings**. Deploying the settings component replaces the previous (legacy) settings experience for new installs.

### File Structure

```
src/app/settings/
├── settings-hsmeta.json
├── Settings.tsx
└── package.json
```

### Configuration (`settings-hsmeta.json`)

```json
{
  "uid": "settings_extension",
  "type": "settings",
  "config": {
    "entrypoint": "/app/settings/Settings.tsx"
  }
}
```

### Settings Component

Settings are usually persisted in your own backend via `hubspot.fetch()` (the URL must be listed in `permittedUrls.fetch` in `app-hsmeta.json`; validate the request signature on your server, see [`signature-validation.md`](signature-validation.md)).

```tsx
import React, { useState } from "react";
import { hubspot, Flex, Input, Button, Alert } from "@hubspot/ui-extensions";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await hubspot.fetch("https://api.example.com/settings", {
      method: "POST",
      body: { apiKey },
    });
    setSaved(true);
  };

  return (
    <Flex direction="column" gap="medium">
      <Input
        name="apiKey"
        label="API Key"
        type="password"
        value={apiKey}
        onChange={setApiKey}
        placeholder="Enter your API key"
      />
      {saved && (
        <Alert variant="success" title="Saved">
          Settings saved successfully.
        </Alert>
      )}
      <Button variant="primary" onClick={handleSave}>
        Save Settings
      </Button>
    </Flex>
  );
};

hubspot.extend<"settings">(() => <Settings />);
```

---

## Serverless Functions

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/serverless-functions/overview · [reference](https://developers.hubspot.com/docs/apps/developer-platform/add-features/serverless-functions/reference)

- **Only privately distributed apps with static auth** (`distribution: "private"`, `auth.type: "static"`). Apps using OAuth cannot use them; OAuth/Marketplace apps call their own backend with `hubspot.fetch()`.
- Installing an app with serverless functions requires an **Enterprise** subscription; developer test accounts work without one.
- **Private functions** are called from UI extensions. **Public endpoints** (`config.endpoint`) require **Content Hub Enterprise** and are reachable **without authentication**.
- **15-second execution timeout**; functions may have cold starts after inactivity.
- Not supported in user-level apps, and not usable as an agent tool `actionUrl`.

### File Structure

```
src/app/functions/
├── private-function-hsmeta.json
├── NewFunction.js
└── package.json        # npm install <pkg> here
```

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

Public endpoint (Content Hub Enterprise only) — `method` is a single string:

```json
{
  "uid": "app_function_endpoint",
  "type": "app-function",
  "config": {
    "entrypoint": "/app/functions/EndpointFunction.js",
    "secretKeys": [],
    "endpoint": {
      "path": "app_function_endpoint",
      "method": "POST"
    }
  }
}
```

Docs example endpoint URL: `https://your-domain.com/hs/serverless/api/app_function_endpoint`.

### Function Code

```js
// NewFunction.js
const hubspot = require("@hubspot/api-client");

exports.main = async (context) => {
  // context.portalId, context.user.{userId,email,locale},
  // context.parameters, context.propertiesToSend (CRM record context only)
  const { email } = context.parameters || {};
  if (!email) {
    return { statusCode: 400, body: { success: false, error: "email is required" } };
  }

  const client = new hubspot.Client({ accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN });
  try {
    const contact = await client.crm.contacts.basicApi.create({ properties: { email } });
    return { statusCode: 200, body: { success: true, contactId: contact.id } };
  } catch (err) {
    console.error("create contact failed", err.code || err.message);
    return { statusCode: err.code || 500, body: { success: false, error: "Could not create contact" } };
  }
};
```

Endpoint functions receive `context.accountId`, `method`, `body`, `query`, `headers`. The response shape for endpoint functions is not documented (unverified).

### Calling from a UI Extension

```tsx
const createContact = async (email: string) => {
  const result = await hubspot.serverless("app_function_private", {
    parameters: { email },
    propertiesToSend: ["firstname"], // CRM record context only
  });
  return result.body.success;
};
```

### Secrets and Tokens

- `PRIVATE_APP_ACCESS_TOKEN` is a reserved secret available by default in private functions.
- Custom secrets: `hs secret add THIRD_PARTY_ACCESS_TOKEN` (value prompted, hidden), add the name to `secretKeys`, read it as `process.env.THIRD_PARTY_ACCESS_TOKEN`, then `hs project upload`.

### Local Dev and Troubleshooting

- `hs project dev` picks up front-end changes automatically, but **function changes need `hs project upload`**. `console.log`/`console.error` output appears in the terminal.
- `Function "[name]" not found` → the `uid` doesn't match. `Function execution timed out` → over 15 s. `Build failed: invalid configuration` → run `hs project validate`.

---

## App Events

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/app-events/overview · [create event types](https://developers.hubspot.com/docs/apps/developer-platform/add-features/app-events/create-and-manage-event-types) · [send occurrences](https://developers.hubspot.com/docs/apps/developer-platform/add-features/app-events/send-event-occurrences)

App events send activity from your system into HubSpot, associated with CRM records and usable on timelines, in reports, lists, and workflows. They replace creating new legacy timeline event types (v1/v3 timeline APIs can no longer create types; existing ones keep working).

- **Requires HubSpot approval**; intended for **technology partners** (Marketplace apps, OAuth only). Internal systems should use custom events instead.
- Event types are reviewed before activation. The project must be deployed before you add the component.
- Required scope: add `"timeline"` to `requiredScopes`.
- Docs list platform versions 2025.2 and 2026.03 for creating event types; 2026.09 is not stated (unverified).

### Configuration (`src/app/app-events/customer-login-hsmeta.json`)

```json
{
  "uid": "customer_login_event",
  "type": "app-event",
  "config": {
    "name": "Customer login",
    "description": "Tracks customer logins and the login method.",
    "headerTemplate": "{{customerName}} logged in",
    "detailTemplate": "The customer logged in via {{loginLocation}}.",
    "objectType": "CONTACT",
    "properties": [
      {
        "name": "customerName",
        "label": "Customer name",
        "type": "string",
        "description": "Name of the customer"
      },
      {
        "name": "loginLocation",
        "label": "Login location",
        "type": "enumeration",
        "options": [
          { "value": "mobile_app", "label": "Mobile app" },
          { "value": "website", "label": "Website" }
        ]
      }
    ]
  }
}
```

The exact template placeholder syntax shown above is unverified; check the reference before use.

| Key | Notes |
|---|---|
| `name` | Max 50 chars. **Cannot be changed** after creation. |
| `description` | Max 1,000 chars. |
| `headerTemplate` / `detailTemplate` | Timeline card header (max 1,000) / body (max 10,000). |
| `objectType` | CRM object occurrences associate with (e.g. `CONTACT`). **Cannot be changed.** Omit for a workflow-only event (occurrences are not stored). |
| `supportsCustomObject` | `true` enables the type for all custom objects; cannot be combined with another `objectType`. |
| `properties` | Occurrence data schema (`name`, `label`, `type`, `options` for enumerations). |

**Limits:** 750 event types per app · 500 properties per type · 510 KB per property · 1 MB per event · 500 occurrences per batch.

### Sending Occurrences

- `POST /integrators/timeline/2026-09/events` (single) · `POST /integrators/timeline/2026-09/events/batch` (`inputs`, max 500).
- Body: `eventTypeName` (the `uid` or the `fullyQualifiedName`), `objectId` (required when the type has an `objectType`) and/or `email`, `properties`, optional `timestamp` (ISO 8601) and `id` (unique per event type).

---

## App Objects

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/app-objects/overview · [reference](https://developers.hubspot.com/docs/apps/developer-platform/add-features/app-objects/reference)

App objects are custom-object-like schemas defined by your app and managed consistently across every installing account.

- **Requires HubSpot approval** (request via the in-app form). Use the object `name` from your approval confirmation.
- The reference shows them on `distribution: "marketplace"` apps with `auth.type: "oauth"`.

### Definition (`src/app/app-objects/car-hsmeta.json`)

```json
{
  "uid": "car-app-object",
  "type": "app-object",
  "config": {
    "name": "CAR",
    "appPrefix": "Vroom",
    "description": "An automobile in our warehouse.",
    "singularForm": "Car",
    "pluralForm": "Cars",
    "primaryDisplayLabelPropertyName": "model",
    "secondaryDisplayLabelPropertyNames": ["make"],
    "settings": {
      "hasRecordPage": true,
      "allowsUserCreatedRecords": true,
      "hasEngagements": true
    },
    "properties": [
      { "type": "string", "fieldType": "text", "name": "model", "label": "Model", "description": "The model of the car" },
      {
        "type": "enumeration",
        "fieldType": "select",
        "name": "make",
        "label": "Make",
        "description": "The manufacturer of the car.",
        "options": [
          { "label": "Ford", "value": "ford", "displayOrder": 0 },
          { "label": "Toyota", "value": "toyota", "displayOrder": 1 }
        ]
      }
    ]
  }
}
```

- `name`: approved name in UPPER_SNAKE_CASE. `appPrefix` is optional (shown before the object name in the UI).
- `properties` use the properties-API fields. HubSpot prefixes them with `a<appId>_` on creation — **omit the prefix** in config and in the display-label keys.
- `settings.hasRecordPage` / `allowsUserCreatedRecords` / `hasEngagements` are all required.
- **Fully qualified name (FQN):** `a<appId>_<NAME>` (e.g. `a16858319_CARS`), used in scopes.

### Scopes

Put these in `conditionallyRequiredScopes` for a staged rollout (via install URL):

- `crm.app.schemas.<FQN>.read` — minimum for customers to access the object
- `crm.app.objects.<FQN>.view`, `.create`, `.edit`, `.merge`, `.delete` — record-level
- `crm.app.schemas.<FQN>.properties.write` — schema properties

### Associations (`src/app/app-object-associations/car-to-contact-hsmeta.json`)

```json
{
  "uid": "car_to_contact_association",
  "type": "app-object-association",
  "config": {
    "firstObjectType": "car-app-object",
    "secondObjectType": "CONTACT",
    "firstToSecondBaseLimit": 5000,
    "secondToFirstBaseLimit": 100,
    "labels": [
      {
        "name": "product_manager",
        "firstObjectTypeLabel": "Managed Widget",
        "secondObjectTypeLabel": "Product Manager",
        "firstToSecondLabelLimit": 1,
        "secondToFirstLabelLimit": 50
      }
    ]
  }
}
```

Object types are an app object `uid` or a HubSpot FQN such as `CONTACT`. Base limits max 10,000 (default: many); label limits are optional and cannot exceed the base limits.

### Using App Objects Elsewhere

- **App cards:** add the app object **`uid`** to `objectTypes`, e.g. `["contacts", "car-app-object"]`. Run `hs project upload` after creating the object, before adding the card.
- **Webhooks:** use the app object as `objectType` in `crmObjects` subscriptions; `associationChange` is not supported for app objects.

---

## Custom Workflow Actions

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/custom-workflow-actions · [reference](https://developers.hubspot.com/docs/api-reference/latest/automation/workflow-actions/custom-action-reference)

### Configuration (`src/app/workflow-actions/my-action-hsmeta.json`)

```json
{
  "uid": "send_message_action",
  "type": "workflow-action",
  "config": {
    "actionUrl": "https://api.example.com/hubspot/workflow-action",
    "isPublished": false,
    "supportedClients": [{ "client": "WORKFLOWS" }],
    "inputFields": [
      {
        "typeDefinition": { "name": "message", "type": "string", "fieldType": "text" },
        "supportedValueTypes": ["STATIC_VALUE", "OBJECT_PROPERTY"],
        "isRequired": true
      },
      {
        "typeDefinition": {
          "name": "channel",
          "type": "enumeration",
          "fieldType": "select",
          "options": [
            { "value": "email", "label": "Email" },
            { "value": "sms", "label": "SMS" }
          ]
        },
        "supportedValueTypes": ["STATIC_VALUE"],
        "isRequired": false
      }
    ],
    "outputFields": [
      { "typeDefinition": { "name": "deliveryId", "type": "string", "fieldType": "text" } }
    ],
    "labels": {
      "en": {
        "actionName": "Send message",
        "appDisplayName": "My App",
        "actionDescription": "Sends a message to the enrolled record.",
        "actionCardContent": "Send {{message}} via {{channel}}",
        "inputFieldLabels": { "message": "Message", "channel": "Channel" },
        "inputFieldDescriptions": { "message": "Text to send" },
        "inputFieldOptionLabels": { "channel": { "email": "Email", "sms": "SMS" } },
        "outputFieldLabels": { "deliveryId": "Delivery ID" }
      }
    },
    "objectTypes": ["CONTACT"]
  }
}
```

| Key | Notes |
|---|---|
| `actionUrl` | **Required.** URL that receives execution requests (POST). |
| `supportedClients` | **Required.** `[{ "client": "WORKFLOWS" }]`; add `AGENTS` for agent tools (BETA). |
| `inputFields` | **Required.** Each item: `typeDefinition` (`name`, `type`, `fieldType`, `options` for enumerations), `supportedValueTypes` (`STATIC_VALUE`, `OBJECT_PROPERTY`), and `isRequired` as a **sibling** of `typeDefinition`. |
| `inputFieldDependencies` | Rules relating inputs (`dependencyType`); schema not documented on the page (see linked example). |
| `outputFields` | Values later workflow actions can use. |
| `labels.<locale>` | `en` required. `actionName` required; `inputFieldOptionLabels` required when inputs have options; `outputFieldLabels` required per output; `appDisplayName` defaults to the app name; `executionRules` holds error messages. |
| `objectTypes` | e.g. `["CONTACT"]`. Empty = all object types. |
| `isPublished` | Default `false`; controls visibility in installing accounts. |

The docs show the label maps (`inputFieldLabels`, `inputFieldOptionLabels`, …) only as `{}`; the keyed-by-field-name shapes above and the `{{ }}` placeholder syntax in `actionCardContent` are unverified; `executionRules` messages are documented with `{{ }}` placeholders. Execution rules themselves are an array of `{ labelName, conditions }`, tested in order (first match wins).

### Execution

- Request body: `callbackId`, `origin` (`portalId`, `actionDefinitionId`, `actionDefinitionVersion`), `context` (`source`, `workflowId`), `object` (`objectId`, `objectType`, `properties`), `inputFields`.
- **Signed with `X-HubSpot-Signature` v2**, not v3 — see [`signature-validation.md`](signature-validation.md#v2-workflow-actions-agent-tools-legacy-card-data).
- Respond with `{ "outputFields": { … } }`, optionally including `hs_execution_state`: `SUCCESS`, `FAIL_CONTINUE`, `BLOCK`, or `ASYNC`.
- `BLOCK` + optional `hs_expiration_duration` (ISO 8601, default 1 week); complete later with `POST /automation/actions/callbacks/2026-09/{callbackId}/complete` and `{"outputFields": {"hs_execution_state": "SUCCESS"}}` (or `FAIL_CONTINUE`).
- 2xx = done. 4xx = failed (except **429**, retried respecting `Retry-After`). 5xx = retried with exponential backoff for up to **3 days**. Response timeout: not documented.

---

## Agent Tools (BETA)

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/agent-tools/overview · [create](https://developers.hubspot.com/docs/apps/developer-platform/add-features/agent-tools/create-an-agent-tool) · [reference](https://developers.hubspot.com/docs/apps/developer-platform/add-features/agent-tools/reference) · [listing requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/agent-tool-listing-requirements)

An agent tool is a custom workflow action extended for HubSpot AI agents: same `workflow-action` type and folder, plus an `AGENTS` client.

- Beta: build in a developer test account created from a developer account opted in to the beta. Docs list platform versions 2025.2 and 2026.03; 2026.09 is not stated (unverified).
- `actionUrl` must be a public external endpoint (POST). **Serverless functions are not supported.**
- Beta limits: the agent has no CRM data access unless given tools to fetch it, and cannot ask the user for missing input after invocation.
- Don't make inputs required during development — required fields can't be changed or removed after upload. Don't pass secrets as input fields.

```json
{
  "uid": "agent_tool_action",
  "type": "workflow-action",
  "config": {
    "actionUrl": "https://api.example.com/hubspot/agent-tool",
    "supportedClients": [
      {
        "client": "AGENTS",
        "toolType": "GET_DATA",
        "llmConfig": {
          "actionDescription": "Looks up the current order status for a customer email in the order system."
        }
      },
      { "client": "WORKFLOWS" }
    ],
    "inputFields": [
      {
        "typeDefinition": { "name": "email", "type": "string", "fieldType": "text" },
        "supportedValueTypes": ["STATIC_VALUE"],
        "isRequired": false
      }
    ],
    "outputFields": [
      { "typeDefinition": { "name": "orderStatus", "type": "string", "externalOptions": false } }
    ],
    "labels": {
      "en": {
        "actionName": "Get order status",
        "appDisplayName": "My App",
        "actionDescription": "Returns the latest order status for a customer.",
        "inputFieldLabels": { "email": "Customer email" },
        "inputFieldDescriptions": { "email": "Email address of the customer" },
        "outputFieldLabels": { "orderStatus": "Order status" }
      }
    },
    "objectTypes": ["CONTACT"],
    "isPublished": false
  }
}
```

- `toolType` (required): `GET_DATA`, `GENERATE`, or `TAKE_ACTION` (`TAKE_ACTION` requires user review by default; changeable in the agent editor).
- `llmConfig.actionDescription` (required): the description the agent reads.
- `labels.en.actionName` and `appDisplayName` are required.
- Execution request: `callbackId`, `origin` (`portalId`, `userId`, `userEmail`, …), `context` (`agentId`, `source: "AGENTS"`), `fields`, `inputFields`. Signed with `X-HubSpot-Signature` (v2 per reference; the page also links v3 docs — confirm).
- Response: `outputFields` object whose keys and values are **all strings** (otherwise all outputs are ignored). `TAKE_ACTION` tools may add `ctaCrmObjectType`, `ctaCrmObjectId`, `ctaLabel`. `hs_execution_state`: `SUCCESS`, `FAIL_CONTINUE`, `BLOCK` (+ `hs_expiration_duration`, default 1 week); the agent tools reference documents completion via `POST https://api.hubspot.com/callbacks/{callbackId}/complete`.
- Test with workflows first, then with the **Developer Tool Testing Agent** (Marketplace).

**Review (Marketplace-listed apps):** you can deploy agent tools to the production app only after approval. Submit the approval form (production app ID, app/build under review, tool `uid`s, a test video of at least 3 minutes); first feedback within 10 business days. Listing rules include: names start with a capital verb, 3–7 words, no underscores/camelCase; descriptions 50–150 chars, present tense; every input has a label and description; accurate `toolType`; matching `.read` scopes; no sensitive-data scopes.

---

## Webhooks

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/configure-webhooks

### Configuration (`src/app/webhooks/webhook-hsmeta.json`)

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
        { "subscriptionType": "object.deletion", "objectType": "contact", "active": true },
        { "subscriptionType": "object.merge", "objectType": "contact", "active": true },
        { "subscriptionType": "object.restore", "objectType": "company", "active": true },
        { "subscriptionType": "object.associationChange", "objectType": "deal", "active": true },
        { "subscriptionType": "object.propertyChange", "objectType": "deal", "propertyName": "dealstage", "active": true }
      ],
      "legacyCrmObjects": [
        { "subscriptionType": "contact.propertyChange", "propertyName": "lastname", "active": true },
        { "subscriptionType": "contact.deletion", "active": true }
      ],
      "hubEvents": [
        { "subscriptionType": "contact.privacyDeletion", "active": true },
        { "subscriptionType": "conversation.creation", "active": true },
        { "subscriptionType": "conversation.newMessage", "active": true }
      ]
    }
  }
}
```

| Key | Notes |
|---|---|
| `settings.targetUrl` | Public URL that receives POSTs. Return a 2xx to acknowledge. |
| `settings.maxConcurrentRequests` | Upper threshold of concurrent requests HubSpot makes. The project docs give no min/max/default; the webhooks API guide requires a value **greater than 5**. |
| `subscriptions.crmObjects` | New `object.*` format: `object.creation`, `object.deletion`, `object.merge`, `object.restore`, `object.propertyChange`, `object.associationChange`. Set `objectType` (also app objects). |
| `subscriptions.legacyCrmObjects` | Classic per-object types, e.g. `contact.creation`, `deal.deletion`, `contact.propertyChange`. |
| `subscriptions.hubEvents` | `contact.privacyDeletion` and `conversation.*` (not available in the `object.*` format). |
| `propertyName` | For property-change subscriptions: the property that triggers the event. Not available for `num_unique_conversion_events` or `hs_lastmodifieddate`. Whether it is mandatory for `object.propertyChange` is unverified — set it. |
| `active` | Turns the subscription on/off. |

### Delivery Behaviour (webhooks API guide)

- Max **1,000 subscriptions** per app.
- Events arrive in **batches of up to 100** — `req.body` is an array.
- Respond within **5 seconds**. Failures (connection error, timeout, any 4xx/5xx) are retried **up to 10 times over 24 hours**. Deduplicate on `eventId`.
- Webhook POSTs don't count against API rate limits.
- Association changes fire one event per side. A contact `privacyDeletion` also fires a contact deletion.
- Validate `X-HubSpot-Signature-v3` on every delivery — see [`signature-validation.md`](signature-validation.md).

```js
app.post("/webhook", (req, res) => {
  if (!isValidHubSpotRequest(req)) return res.status(401).end();
  res.sendStatus(200); // acknowledge fast, then process asynchronously
  for (const event of req.body) {
    enqueue(event); // your queue; dedupe on event.eventId
  }
});
```

---

## Webhooks Journal (pull model)

> Official docs: https://developers.hubspot.com/docs/api-reference/latest/webhooks-journal/guide

An API-only alternative to push webhooks: subscriptions are created per installed account by API, and you **pull** events from a journal in order. It does not work with the `webhooks` component above.

- Auth: OAuth **client credentials token** from `https://api.hubapi.com/oauth/2026-09/token`.
- Scopes: `developer.webhooks_journal.read`, `developer.webhooks_journal.subscriptions.read` / `.write`, `developer.webhooks_journal.snapshots.read` / `.write`, plus the object scopes for subscribed types (e.g. `crm.objects.contacts.read`).
- Retention: changes from the **past 3 days**.
- Subscriptions: `POST|GET /webhooks-journal/subscriptions/2026-09`, `DELETE …/{subscriptionId}`, `DELETE …/portals/{portalId}`. `subscriptionType`: `OBJECT` (actions `CREATE`, `UPDATE`, `DELETE`, `MERGE`, `RESTORE`, `ASSOCIATION_ADDED`, `ASSOCIATION_REMOVED`, `SNAPSHOT`; `objectTypeId`, optional `properties`/`objectIds`), `ASSOCIATION`, `LIST_MEMBERSHIP` (`ADDED_TO_LIST`, `REMOVED_FROM_LIST`), `APP_LIFECYCLE_EVENT` (install/uninstall via `eventTypeId`). Property filters (`…/filters`) apply to CREATE/UPDATE only.
- Reading: `GET /webhooks-journal/journal/2026-09/earliest`, `/latest`, `/offset/{offset}/next` return `{ url, expiresAt, currentOffset }` (download the file at `url`). Batch: `POST …/batch/read`, `GET …/batch/{offset}/next/{count}`, `…/batch/earliest/{count}`, `…/batch/latest/{count}` (max 100 entries). Per-account variants under `/webhooks-journal/journal-local/2026-09` with `installPortalId`.
- Snapshots API: point-in-time CRM object snapshots.
- Rate limits: journal 100 req/s per app; subscription management 50 req/s; snapshots 10 req/s.

---

## App Telemetry

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/add-telemetry

Telemetry is a log sink that forwards your app's log data to an external observability provider.

```
src/app/telemetry/
└── telemetry-hsmeta.json
```

```json
{
  "uid": "my-telemetry",
  "type": "telemetry",
  "config": {
    "providerType": "SENTRY",
    "datasetName": "my-app-logs",
    "logTypes": ["API_CALL", "WEBHOOKS", "APP_FUNCTION"],
    "logLevels": ["ERROR", "WARN"]
  }
}
```

- `providerType`: `SENTRY`, `HONEYCOMB`, or `CUSTOM_BACKEND` **(BETA)**.
- `logTypes` / `logLevels`: by default everything is sent — start narrow (e.g. errors only).
- Custom backend only: `endpointUrl`, `bearerAuthEnabled` (sends the secret as a Bearer header), `exportFormat` (`DEFAULT` or `OTLP`).
- Store the Sentry DSN / Honeycomb API key / bearer token as a secret named exactly **`TELEMETRY_SECRET`** with `hs app secrets add`.
