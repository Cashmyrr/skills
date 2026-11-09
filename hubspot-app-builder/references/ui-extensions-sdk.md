# UI Extensions SDK Reference

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/ui-extensions-sdk/overview
> (context, actions, hooks, utilities, logging, versioning pages under the same path)
>
> Reference version: `@hubspot/ui-extensions` **1.0.1**, which requires `react` **18.3.1** exactly as a peer dependency.

## Registering the Extension

Every UI extension entrypoint must call `hubspot.extend()`. Do this instead of exporting a component:

```tsx
import { hubspot } from "@hubspot/ui-extensions";

// Preferred: register with the location type, then read context/actions through hooks
hubspot.extend<"crm.record.tab">(() => <MyExtension />);

// Also valid: receive the API in the callback
hubspot.extend<"crm.record.tab">(({ context, actions }) => (
  <MyExtension context={context} actions={actions} />
));
```

In `.jsx` files, drop the `<"…">` generic.

Location type parameters:

| Generic | Extension point |
|---|---|
| `crm.record.tab`, `crm.record.sidebar`, `crm.preview`, `helpdesk.sidebar` | App cards |
| `settings` | Settings page |
| `pages` | App pages |
| `home` | Legacy app home |
| `crm.bulkActions` | Bulk action **(BETA)** |

## Context Object

Read it with `useExtensionContext<location>()`, `useExtensionApi<location>().context`, or `hubspot.extend(({ context }) => …)`.

### Fields available in all locations

| Field | Type | Description |
|---|---|---|
| `location` | String | `crm.record.tab`, `crm.record.sidebar`, `crm.preview`, `helpdesk.sidebar`, `settings`, `home`, `pages` or `crm.bulkActions` (BETA) |
| `portal.id` | Number | HubSpot account ID |
| `portal.timezone` | String | Account timezone |
| `portal.dataHostingLocation` | String | `na1`, `na2`, `na3`, `ap1` or `eu1`. Documented, but not in the 1.0.1 type definitions |
| `user.id` | Number | User ID |
| `user.email` | String | Primary email |
| `user.emails` | Array | All of the user's emails |
| `user.firstName` / `user.lastName` | String | Name |
| `user.locale` | String | Locale (date/number formatting) |
| `user.language` | String | UI display language, as a BCP 47 code (e.g. `"en"`); defaults to `"en"` |
| `user.teams` | Array | `{ id, name, teammates: number[] }` |
| `user.permissions` | Array | Permission strings, e.g. `'integrations-management-write'` |
| `variables` | Object | Config profile variables |

`user.roles` is deprecated and always empty. Use `teams` instead.

### CRM fields (`crm.record.tab`, `crm.record.sidebar`, `crm.preview`, `helpdesk.sidebar`)

| Field | Type | Description |
|---|---|---|
| `crm.objectId` | Number | Current record ID |
| `crm.objectTypeId` | String | Object type ID (e.g. `0-1` for contacts) |
| `extension.appId` | Number | App ID |
| `extension.appName` | String | App name |
| `extension.cardTitle` | String | Card title |

The 1.0.1 types also declare an optional `extension` field for `settings`, `home`, `pages` and `crm.bulkActions`. The docs list it for CRM locations only.

### Bulk action context (BETA)

`context.crm` holds `objectTypeId` and `objectIds`, plus `selection`: `{ method: 'BY_IDS', objectTypeId, objectIds }`. A `BY_QUERY` variant also exists in the types. The docs list `["BY_IDS"]` as the only supported selection mode.

## Actions

Read them with `useExtensionActions<location>()`, `useExtensionApi<location>().actions`, or `hubspot.extend(({ actions }) => …)`.

### Universal actions

| Action | Signature | Notes |
|---|---|---|
| `addAlert` | `({ message, title?, type? })` | `type`: `'info'` (default), `'tip'`, `'success'`, `'warning'`, `'danger'` |
| `reloadPage` | `()` | Reloads the current page |
| `copyTextToClipboard` | `(text: string) => Promise<void>` | Only works after user interaction. Call it from a click handler, never from `useEffect` |
| `closeOverlay` | `(id: string)` | Closes the `Modal` or `Panel` with that `id` |
| `openIframeModal` | `(payload: { uri, height, width, title?, flush? }, onClose?: () => void)` | `onClose` is the **second argument**, not a payload field |
| `navigateToPage` | `({ to: string, params?: Record<string, string> })` | App pages navigation. `to` is normalised (`"docs"` → `"/docs"`). `params` keys that match `:placeholders` fill the path; the rest become query parameters |

### CRM-only actions (`crm.record.tab`, `crm.record.sidebar`, `crm.preview`, `helpdesk.sidebar`)

| Action | Signature | Notes |
|---|---|---|
| `fetchCrmObjectProperties` | `(props: string[] \| "*") => Promise<Record<string, string>>` | Raw values of the current record. Prefer `useRecordPropertiesCurrent` |
| `refreshObjectProperties` | `()` | Refreshes the record's properties and CRM data components without reloading. It does not refresh values your card fetched itself |
| `onCrmPropertiesUpdate` | `(props: string[] \| "*", callback: (properties, error?) => void)` | Use it like a hook. Only fires for changes made in the HubSpot UI |

`fetchCrmObjectProperties` and `refreshObjectProperties` only work for object types listed in the card's `objectTypes` in `*-hsmeta.json`.

### Built-in CRM actions (CrmActionButton / CrmActionLink / CrmCardActions)

These run HubSpot's own UI actions through `actionType` + `actionContext`. The action types are `PREVIEW_OBJECT`, `ADD_NOTE`, `ADD_TASK`, `SEND_EMAIL`, `SCHEDULE_MEETING`, `OPEN_RECORD_ASSOCIATION_FORM`, `ENGAGEMENT_APP_LINK`, `RECORD_APP_LINK`, `PAGE_APP_LINK` and `EXTERNAL_URL`. See [`ui-components.md`](ui-components.md#crm-action-components) for the `actionContext` each one needs.

## Hooks

### Universal hooks (`@hubspot/ui-extensions`)

| Hook | Returns |
|---|---|
| `useExtensionApi<location>()` | `{ context, actions }` |
| `useExtensionContext<location>()` | context |
| `useExtensionActions<location>()` | actions |
| `useRecordProperties({ objectType, recordId, properties, format? })` | `{ properties, isLoading, isRefetching, error, refetch }` for **any** record |
| `useRecordAssociations({ fromObjectType, fromRecordId, toObjectType, properties?, pageSize?, format? })` | paginated result (see below) for any record |
| `useRecordSearch({ objectType, properties?, query?, filterGroups?, sorts?, pageSize?, format? })` | paginated result plus `total`; each result is `{ objectId, properties }` |
| `useDebounce(value, delayMs = 300)` | debounced value (JSON-serialisable values only) |

### CRM hooks (`@hubspot/ui-extensions/crm`, CRM locations only)

| Hook | Returns |
|---|---|
| `useRecordPropertiesCurrent({ properties, format? })` | `{ properties, isLoading, isRefetching, error, refetch }` for the record being viewed |
| `useRecordAssociationsCurrent({ toObjectType, properties?, pageSize?, format? })` | paginated associations of the record being viewed |

### App pages hook (`@hubspot/ui-extensions/pages`)

`usePageRoute()` returns `{ path, routeId, params }`. `params` combines path and query parameters.

### Formatting (`format`)

`format` is a flat object: `{ propertiesToFormat: 'all' | string[], date?: { format?, relative? }, dateTime?: { format?, relative? }, currency?: { addSymbol? } }`.

```tsx
import { useExtensionApi } from "@hubspot/ui-extensions";
import { useRecordPropertiesCurrent, useRecordAssociationsCurrent } from "@hubspot/ui-extensions/crm";

// Inside a component body:
const { context, actions } = useExtensionApi<"crm.record.tab">();

const { properties, isLoading, error, refetch } = useRecordPropertiesCurrent({
  properties: ["firstname", "lastname", "email", "createdate"],
  format: {
    propertiesToFormat: "all",
    date: { format: "MM-DD-YYYY", relative: false },
    currency: { addSymbol: true },
  },
});

const { results, pagination, isLoading: assocLoading } = useRecordAssociationsCurrent({
  toObjectType: "0-2",
  properties: ["name", "domain"],
  pageSize: 10,
});
```

### Paginated result shape

Used by `useRecordAssociationsCurrent`, `useRecordAssociations` and `useRecordSearch`:

```ts
interface PaginatedHookResult<TResult> {
  // associations: { toObjectId, associationTypes: { category, typeId, label }[], properties }
  // search: { objectId, properties }
  results: TResult[];
  total?: number; // useRecordSearch only
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    pageSize: number;
    nextPage: () => void;
    previousPage: () => void;
    reset: () => void;
  };
}
```

### Utilities

- `formatCrmProperties({ properties, objectType, formattingOptions? })` from `@hubspot/ui-extensions` formats raw property maps, for example ones from `fetchCrmObjectProperties` or your backend. It returns a Promise.
- `hubspot.fetch(url, options?)` calls your backend. See [`fetching-data.md`](fetching-data.md).
- `hubspot.serverless(name, { parameters?, propertiesToSend? })` calls an app function. Serverless functions are only available to private-distribution apps with static auth.

**Experimental only (not for production):** the `@hubspot/ui-extensions/experimental` entry point also exports `useBulkSelectionRecords`, `useBulkSelectionAction` and `useRecordAggregation`. `fetchHubSpotApi` comes from `@hubspot/ui-extensions/experimental/api-client`.

## Overlays

Attach `Modal` or `Panel` with the `overlay` prop of `Button`, `LoadingButton`, `Link`, `Tag`, `Image` or `Dropdown.ButtonItem`.

```tsx
import { Button, Modal, ModalBody, ModalFooter, Panel, PanelBody, PanelSection, PanelFooter, Text } from "@hubspot/ui-extensions";

<Button overlay={
  <Modal id="my-modal" title="Modal Title" width="md">
    <ModalBody><Text>Content here</Text></ModalBody>
    <ModalFooter>
      <Button onClick={() => actions.closeOverlay("my-modal")}>Close</Button>
    </ModalFooter>
  </Modal>
}>
  Open Modal
</Button>

<Button overlay={
  <Panel id="my-panel" title="Panel Title">
    <PanelBody>
      <PanelSection><Text>Content here</Text></PanelSection>
    </PanelBody>
    <PanelFooter>
      <Button onClick={() => actions.closeOverlay("my-panel")}>Close</Button>
    </PanelFooter>
  </Panel>
}>
  Open Panel
</Button>
```

- Only one `Modal` can be open per extension at a time.
- A `Modal` can be opened from a `Panel`, but a `Panel` can't be opened from a `Modal`.
- The `reactions` argument was removed in 1.x. Use `overlay`.

### iframe Modal

```tsx
actions.openIframeModal(
  { uri: "https://example.com", height: 600, width: 800, title: "Title", flush: false },
  () => console.log("Closed")
);

// To close from inside the iframe (the message must come from the uri's domain):
window.top.postMessage(JSON.stringify({ action: "DONE" }), "*");
// or: { action: "CANCEL" }
```

## Logger (Debugging)

```tsx
import { logger } from "@hubspot/ui-extensions";

logger.info("Info");
logger.debug("Debug");
logger.warn("Warning");
logger.error("Error");
```

- Each method takes a single string.
- In local development (`hs project dev`), messages are **not sent to HubSpot**; they go to the browser console.
- In deployed extensions, a card that fails to load shows an error with a **trace ID**. Use it to find your log messages in the **Log Traces** tab of the app's dashboard.
- Limits: 1,000 logs per minute per account (logging then stops until the page reloads). The queue holds at most 10,000 pending messages and is processed in batches of 100 every five seconds.

## Migrating from 0.x to 1.x

Upgrade with `npm install @hubspot/ui-extensions@^1`. Pin `1.0.1` in `package.json` together with `react` `18.3.1`. Support: v0 through March 2028; v1 (released November 2026) through April 2028.

| 0.x | 1.x |
|---|---|
| `useCrmProperties(props, options)` (`/crm`) | `useRecordPropertiesCurrent({ properties, format })` |
| `useAssociations({ toObjectType, pageLength }, options)` (`/crm`) | `useRecordAssociationsCurrent({ toObjectType, pageSize, format })` |
| `useCrmSearch(config, options)` | `useRecordSearch({ objectType, …, pageSize, format })` |
| Second "formatting options" argument | `format` key in the config |
| `pageLength` | `pageSize` |
| `reactions` argument | `overlay` prop |
| `Dropdown` `options` | `<Dropdown.ButtonItem>` children |
| `NumberInput` `onInput` | `onChange` |
| `ProgressBar` `valueMax` | `maxValue` |
| `Divider` `distance` | `size` |
| `readonly`, `size="default"` (Toggle, Checkbox, RadioButton, ToggleGroup options) | `readOnly`, `size="medium"` |
| `variant` on Checkbox / RadioButton / ToggleGroup | `size` |
| `Form` `preventDefault` | removed (always prevented) |
| Chart `options.colors` | `options.colorList` |

The old hook names are still exported (deprecated) in 1.0.1. Don't use them in new code. To find them in an existing project, run `grep -r "useCrmProperties\|useAssociations\|useCrmSearch" src/`.

## Best Practices

- Always pass the location generic in TypeScript: `useExtensionApi<'crm.record.tab'>()`.
- Call hooks at the top level of a component, never inside event handlers.
- Use `hubspot.fetch()` instead of browser `fetch()`. `body` is a plain object: don't `JSON.stringify()` it or add `Content-Type`.
- Validate `X-HubSpot-Signature-v3` on every backend endpoint called by `hubspot.fetch()` from any UI extension (card, settings page, app page). See [`signature-validation.md`](signature-validation.md).
- Never store secrets in React code. Proxy them through your backend.
- Use `logger` for debugging deployed extensions, not `console.log`.
- Handle loading, error and empty states for every hook result (`isLoading`, `error`, empty data).

Full rules and the validation procedure: [`best-practices.md`](best-practices.md), [`validation.md`](validation.md).
