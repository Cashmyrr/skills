# HubSpot App Features Reference

## App Home Page

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/create-an-app-home-page

A full-screen extension accessible from the app navigation. Ideal for dashboards, analytics, and multi-step workflows.

### Configuration (`settings/home-hsmeta.json` or similar)

```json
{
  "uid": "my-home-page",
  "type": "home",
  "config": {
    "name": "My App Home",
    "entrypoint": "/app/home/HomePage.jsx"
  }
}
```

Or can be configured as a card with `"location": "home"`:

```json
{
  "uid": "my-home-card",
  "type": "card",
  "config": {
    "name": "Dashboard",
    "location": "home",
    "entrypoint": "/app/cards/HomePage.jsx"
  }
}
```

### Home Page React Component

```jsx
import React from "react";
import { hubspot, Heading, Text, Flex } from "@hubspot/ui-extensions";

hubspot.extend<'home'>(() => <HomePage />);

const HomePage = () => {
  return (
    <Flex direction="column" gap="large">
      <Heading level={1}>My App Dashboard</Heading>
      <Text>Welcome to your app home page.</Text>
    </Flex>
  );
};
```

---

## App Settings Page

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/create-a-settings-component

A settings UI that appears in HubSpot's settings area. Ideal for configuration, API key management, and feature toggles.

### File Structure

```
src/app/settings/
├── Settings.tsx
├── settings-hsmeta.json
└── package.json
```

### Configuration (`settings-hsmeta.json`)

```json
{
  "uid": "my-settings",
  "type": "settings",
  "config": {
    "name": "My App Settings",
    "entrypoint": "/app/settings/Settings.tsx"
  }
}
```

Or as a card with `"location": "settings"`:

```json
{
  "uid": "my-settings-card",
  "type": "card",
  "config": {
    "name": "Settings",
    "location": "settings",
    "entrypoint": "/app/settings/Settings.tsx"
  }
}
```

### Settings Component

```tsx
import React, { useState } from "react";
import { hubspot, Flex, Input, Button, Text, Alert } from "@hubspot/ui-extensions";

hubspot.extend<'settings'>(() => <Settings />);

const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // Save to your backend via hubspot.fetch()
    await hubspot.fetch("https://api.example.com/settings", {
      method: "POST",
      body: { apiKey }
    });
    setSaved(true);
  };

  return (
    <Flex direction="column" gap="medium">
      <Input
        label="API Key"
        value={apiKey}
        onChange={setApiKey}
        placeholder="Enter your API key"
      />
      {saved && <Alert type="success" title="Saved">Settings saved successfully.</Alert>}
      <Button variant="primary" onClick={handleSave}>Save Settings</Button>
    </Flex>
  );
};
```

---

## App Events (Open Beta)

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/app-events/overview

App events let you emit and respond to custom events within the HubSpot platform.

### File Structure

```
src/app/app-events/
└── my-event-hsmeta.json
```

### Configuration (`my-event-hsmeta.json`)

```json
{
  "uid": "my-event-type",
  "type": "appEvent",
  "config": {
    "name": "My Custom Event",
    "description": "Fired when a specific action occurs"
  }
}
```

> Note: App events are in open beta. Enable beta access before use.

---

## App Objects (Open Beta)

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/app-objects/overview

App objects allow you to define custom data models (objects) that live within your app, similar to HubSpot custom objects but scoped to your app.

### File Structure

```
src/app/app-objects/
└── my-app-object-hsmeta.json
```

### Configuration (`my-app-object-hsmeta.json`)

```json
{
  "uid": "my_app_object",
  "type": "appObject",
  "config": {
    "name": "My Object",
    "description": "A custom object for my app",
    "primaryDisplayProperty": "name_property",
    "properties": [
      {
        "name": "name_property",
        "label": "Name",
        "type": "string",
        "fieldType": "text"
      },
      {
        "name": "status_property",
        "label": "Status",
        "type": "enumeration",
        "fieldType": "select",
        "options": [
          { "label": "Active", "value": "active" },
          { "label": "Inactive", "value": "inactive" }
        ]
      }
    ]
  }
}
```

### Required Scopes for App Objects

Add to `app-hsmeta.json` auth scopes:
```json
"requiredScopes": ["crm.objects.custom.read", "crm.objects.custom.write"]
```

### Using App Objects in Cards

In your card's `objectTypes`, reference app objects by their uid:
```json
"objectTypes": ["app_my_app_object"]
```

> Note: App objects are in open beta. Enable beta access in your developer account before use.

---

## Custom Workflow Actions

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/custom-workflow-actions

### File Structure

```
src/app/workflow-actions/
└── custom-action-hsmeta.json
```

### Configuration

```json
{
  "uid": "my-workflow-action",
  "type": "workflowAction",
  "config": {
    "name": "My Custom Action",
    "description": "Performs a custom action in workflows",
    "executionUrl": "https://api.example.com/workflow-action",
    "objectTypes": ["contacts"],
    "inputFields": [
      {
        "typeDefinition": {
          "name": "message",
          "label": "Message",
          "type": "string",
          "fieldType": "text",
          "isRequired": true,
          "isHidden": false
        },
        "supportedValueTypes": ["STATIC_VALUE"]
      }
    ]
  }
}
```

---

## Webhooks

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/configure-webhooks

### Complete Webhook Configuration

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
        { "subscriptionType": "object.creation", "objectType": "contact", "active": true },
        { "subscriptionType": "object.deletion", "objectType": "contact", "active": true },
        { "subscriptionType": "object.propertyChange", "objectType": "deal", "active": true },
        { "subscriptionType": "object.restore", "objectType": "company", "active": true },
        { "subscriptionType": "object.merge", "objectType": "contact", "active": true }
      ],
      "legacyCrmObjects": [
        { "subscriptionType": "contact.creation", "active": true },
        { "subscriptionType": "contact.deletion", "active": true },
        { "subscriptionType": "contact.propertyChange", "propertyName": "email", "active": true },
        { "subscriptionType": "deal.creation", "active": true },
        { "subscriptionType": "deal.propertyChange", "propertyName": "dealstage", "active": true }
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

### Handling Webhook Payloads (Node.js Example)

```js
const express = require("express");
const { Signature } = require("@hubspot/api-client");

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  // Validate HubSpot signature
  const signatureV3 = req.header("X-HubSpot-Signature-v3");
  const timestamp = req.header("X-HubSpot-Request-Timestamp");
  const url = `${req.protocol}://${req.header("host")}${req.url}`;

  // Reject if timestamp older than 5 minutes
  if (parseInt(timestamp) < Date.now() - 5 * 60 * 1000) {
    return res.status(400).json({ error: "Timestamp too old" });
  }

  const isValid = Signature.isValid({
    signatureVersion: "v3",
    signature: signatureV3,
    method: req.method,
    clientSecret: process.env.CLIENT_SECRET,
    requestBody: req.body,
    url,
    timestamp,
  });

  if (!isValid) return res.status(401).json({ error: "Invalid signature" });

  // Process the webhook events
  const events = req.body;
  for (const event of events) {
    console.log(`Event: ${event.subscriptionType}`, event);
  }

  res.status(200).json({ received: true });
});
```

### `maxConcurrentRequests` Guide

| Traffic Level | Recommended Value |
|---|---|
| Low | 3-5 |
| Medium | 10 (default) |
| High | 25+ |

---

## App Telemetry

Track app performance metrics in HubSpot:

```
src/app/telemetry/
└── telemetry-hsmeta.json
```

```json
{
  "uid": "my-telemetry",
  "type": "telemetry",
  "config": {
    "enabled": true
  }
}
```

View telemetry data in: **Development > Monitoring** in HubSpot.
