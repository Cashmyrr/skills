# UI Extensions SDK Reference

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-extensions-sdk

## Registering the Extension

Every UI extension file must call `hubspot.extend()` — this replaces the typical React component export:

```jsx
import { hubspot } from "@hubspot/ui-extensions";

hubspot.extend(({ context, actions }) => <MyExtension context={context} actions={actions} />);
```

Without context/actions:
```jsx
hubspot.extend(() => <MyExtension />);
```

TypeScript with location type (recommended):
```tsx
hubspot.extend<'crm.record.tab'>(() => <MyExtension />);
```

## Context Object

Available via `hubspot.extend(({ context }) => ...)` or `useExtensionContext()`.

### Universal Context Fields (all locations)

| Field | Type | Description |
|---|---|---|
| `location` | String | Extension location: `crm.record.tab`, `crm.record.sidebar`, `crm.preview`, `helpdesk.sidebar`, `settings`, `home` |
| `portal.id` | Number | HubSpot account ID |
| `portal.timezone` | String | Account timezone |
| `portal.dataHostingLocation` | String | `na1`, `na2`, `na3`, `ap1`, or `eu1` |
| `user.id` | Number | User ID |
| `user.email` | String | Primary email |
| `user.emails` | Array | All user emails |
| `user.firstName` | String | First name |
| `user.lastName` | String | Last name |
| `user.locale` | String | Locale string |
| `user.teams` | Array | Teams (`{id, name, teammates[]}`) |
| `user.permissions` | Array | Permission strings |
| `variables` | Object | Config profile variables |

### CRM-Only Context Fields

Only in `crm.record.tab`, `crm.record.sidebar`, `crm.preview`, `helpdesk.sidebar`:

| Field | Type | Description |
|---|---|---|
| `crm.objectId` | Number | Current record ID |
| `crm.objectTypeId` | String | Object type ID (e.g., `0-1` for contacts) |
| `extension.appId` | Number | App ID |
| `extension.appName` | String | App name |
| `extension.cardTitle` | String | Card title |

## Actions

### Universal Actions (all locations)

| Action | Signature | Description |
|---|---|---|
| `addAlert` | `({ title, message, type })` | Show alert banner |
| `reloadPage` | `()` | Reload the current page |
| `copyTextToClipboard` | `(text: string): Promise` | Copy text to clipboard |
| `closeOverlay` | `(id: string)` | Close a Modal or Panel by ID |
| `openIframeModal` | `({ uri, height, width, title?, flush?, onClose? })` | Open URL in an iframe modal |

### CRM-Only Actions

Only in `crm.record.tab`, `crm.record.sidebar`, `crm.preview`, `helpdesk.sidebar`:

| Action | Signature | Description |
|---|---|---|
| `fetchCrmObjectProperties` | `(props: string[] \| "*"): Promise` | Fetch property values from current record |
| `refreshObjectProperties` | `()` | Refresh properties on the CRM record page |
| `onCrmPropertiesUpdate` | `(props, callback)` | Subscribe to property changes in HubSpot UI |

### Alert Types
`'info'` (default, blue) | `'tip'` (white) | `'success'` (green) | `'warning'` (yellow) | `'danger'` (red)

## Hooks (Recommended Approach)

### Universal Hooks

```jsx
import { useExtensionApi, useExtensionContext, useExtensionActions } from "@hubspot/ui-extensions";
```

#### `useExtensionApi<location>()`
Access both context and actions together:
```tsx
const { context, actions } = useExtensionApi<'crm.record.tab'>();
```

#### `useExtensionContext<location>()`
Access context only:
```tsx
const context = useExtensionContext<'crm.record.tab'>();
const { user, portal, location } = context;
```

#### `useExtensionActions<location>()`
Access actions only:
```tsx
const { addAlert, reloadPage, copyTextToClipboard } = useExtensionActions<'crm.record.tab'>();
```

### CRM-Specific Hooks

```jsx
import { useCrmProperties, useAssociations } from "@hubspot/ui-extensions/crm";
```

#### `useCrmProperties(properties, formattingOptions?)`

```tsx
const { properties, isLoading, error, refetch, isRefetching } = useCrmProperties(
  ["firstname", "lastname", "email"],
  {
    propertiesToFormat: "all",
    formattingOptions: {
      date: { format: "MM-DD-YYYY", relative: false },
      dateTime: { format: "MM-DD-YYYY hh:mm", relative: false },
      currency: { addSymbol: true }
    }
  }
);
```

Response: `{ properties: { key: value }, isLoading, isRefetching, error, refetch }`

#### `useAssociations(config, formattingOptions?)`

```tsx
const { results, pagination, isLoading, error, refetch } = useAssociations(
  { toObjectType: "0-1", properties: ["firstname", "email"], pageLength: 25 },
  { propertiesToFormat: "all" }
);

// Pagination
pagination.nextPage();
pagination.previousPage();
pagination.reset();
```

Response: `{ results: [{ toObjectId, associationTypes, properties }], pagination, isLoading, isRefetching, error, refetch }`

## Overlay Components

### Modal

```jsx
import { Button, Modal, ModalBody, ModalFooter } from "@hubspot/ui-extensions";

<Button overlay={
  <Modal id="my-modal" title="Modal Title" width="md">
    <ModalBody>Content here</ModalBody>
    <ModalFooter>
      <Button onClick={() => actions.closeOverlay("my-modal")}>Close</Button>
    </ModalFooter>
  </Modal>
}>
  Open Modal
</Button>
```

- Only one Modal open per extension at a time
- A Modal can be opened from a Panel, but not the reverse

### Panel

```jsx
import { Button, Panel, PanelBody, PanelSection, PanelFooter } from "@hubspot/ui-extensions";

<Button overlay={
  <Panel id="my-panel" title="Panel Title">
    <PanelBody>
      <PanelSection>Content here</PanelSection>
    </PanelBody>
    <PanelFooter>
      <Button onClick={() => actions.closeOverlay("my-panel")}>Close</Button>
    </PanelFooter>
  </Panel>
}>
  Open Panel
</Button>
```

### iframe Modal

```jsx
actions.openIframeModal(
  { uri: "https://example.com", height: 600, width: 800, title: "Title", flush: false },
  () => console.log("Closed")
);

// To close from inside the iframe:
window.top.postMessage(JSON.stringify({ action: "DONE" }), "*");
// or: { action: "CANCEL" }
```

## Logger (Debugging)

```jsx
import { logger } from "@hubspot/ui-extensions";

logger.info("Info");
logger.debug("Debug");
logger.warn("Warning");
logger.error("Error");
```

- Local dev: logs go to browser console
- Deployed: logs appear in **Development > Monitoring > Logs > UI Extensions**
- Rate limit: 1,000 logs/minute per account
- Queue max: 10,000 pending messages

## fetchCrmObjectProperties (Legacy but supported)

```jsx
hubspot.extend(({ actions }) => <Extension fetchProperties={actions.fetchCrmObjectProperties} />);

const Extension = ({ fetchProperties }) => {
  useEffect(() => {
    fetchProperties(["firstname", "lastname"]).then(props => {
      console.log(props.firstname, props.lastname);
    });
  }, []);
  // ...
};
```

Prefer `useCrmProperties` hook instead — it has automatic state management and auto-updates.

## Best Practices

- Always use TypeScript generics: `useExtensionApi<'crm.record.tab'>()`
- Call hooks at component level, never inside event handlers
- Use `hubspot.fetch()` instead of browser `fetch()` for external data
- Validate `X-HubSpot-Signature-v3` on every backend endpoint called from a CRM card or settings page. When any UI extension (card, settings page, home page) calls `hubspot.fetch()`, HubSpot proxies the request to your server and signs it with `X-HubSpot-Signature-v3`. Validate using `Signature.isValid()` from `@hubspot/api-client` — the same as webhook validation. See [`signature-validation.md`](signature-validation.md) for the full implementation.
- Never store secrets in React code — proxy secrets through your backend
- Use `logger` for debugging deployed extensions, not `console.log`
