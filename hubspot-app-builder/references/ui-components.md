# UI Components Reference

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/ui-components/overview
>
> Reference version: `@hubspot/ui-extensions` **1.0.1**. Prop names below come from the package's `.d.ts` files. If a prop isn't listed here, check the component's docs page before using it.

## Import Sources

```js
// Standard components (all extension points)
import { Text, Button, Flex, Stack } from "@hubspot/ui-extensions";

// CRM data + CRM action components (app cards only, see location rules below)
import { CrmPropertyList, CrmAssociationTable, CrmActionButton } from "@hubspot/ui-extensions/crm";

// App pages (type "page"): router + page components
import { createPageRouter, PageRoutes, PageLink, PageHeader, PageTitle, PageBreadcrumbs, usePageRoute } from "@hubspot/ui-extensions/pages";

// Legacy app home (type "page" + location "home") header actions
import { HeaderActions, PrimaryHeaderActionButton, SecondaryHeaderActionButton } from "@hubspot/ui-extensions/pages/home";

// Experimental components: NOT for production
import { Grid, GridItem } from "@hubspot/ui-extensions/experimental";
```

**These names do not exist and must not be used:** `Badge`, `IconButton`, `FormField`, `AddNoteAction`, `SendEmailAction`. `Grid` exists only in `/experimental`. `Textarea` (lowercase a) is a deprecated alias; use `TextArea`.

Shared value types:
- Sizes: `'xs' | 'sm' | 'md' | 'lg' | 'xl'` (or the long forms `'extra-small'`, `'small'`, `'medium'`, `'large'`, `'extra-large'`)
- Distances (`gap`, Divider `size`): any size or `'flush'`
- `justify`: `'start' | 'center' | 'end' | 'around' | 'between'`
- `align`: `'start' | 'center' | 'baseline' | 'end' | 'stretch'`
- Click handlers receive an `ExtensionEvent`.

## Standard Components

### Layout

| Component | Key Props | Notes |
|---|---|---|
| `Flex` | `direction` (`row`/`column`), `gap`, `justify`, `align`, `alignSelf`, `wrap` | Flexbox container |
| `Stack` | `gap`, `align`, `justify` | Vertical stack (new in 1.x); use `Flex` for horizontal layouts |
| `Inline` | `gap`, `justify`, `align` | Horizontal row of inline items |
| `Box` | `alignSelf`, `flex` | Flex child wrapper. **No `padding`/`margin`** in the stable API |
| `AutoGrid` | `columnWidth` (required), `gap`, `flexible` | Responsive grid |
| `Divider` | `size` | Horizontal rule |
| `Spacer` | `size` | Empty space |
| `Tile` | `compact`, `flush` | Bordered container (no `onClick`) |

```jsx
<Stack gap="medium">
  <Flex direction="row" gap="small" justify="between" align="center">
    <Text>Left</Text>
    <Text>Right</Text>
  </Flex>
  <Divider />
  <AutoGrid columnWidth={200} gap="small">
    <Tile>One</Tile>
    <Tile>Two</Tile>
  </AutoGrid>
</Stack>
```

### Text & Display

| Component | Key Props | Notes |
|---|---|---|
| `Text` | `variant` (`bodytext`/`microcopy`), `format` (`fontWeight`: `regular`/`demibold`/`bold`, `italic`, `lineDecoration`, `textTransform`), `inline`, `truncate` | Body text |
| `Heading` | `inline` | Heading text. **No `level` prop** |
| `Link` | `href` (required; string or `{ url, external }`), `variant` (`primary`/`destructive`/`light`/`dark`), `onClick`, `preventDefault`, `overlay` | Hyperlink |
| `Image` | `src` (required), `alt`, `width`, `height`, `href`, `onClick`, `overlay` | Image URLs must be allowed in `permittedUrls.img` |
| `Icon` | `name` (required), `size` (`sm`/`md`/`lg`), `color` (`alert`/`warning`/`success`/`inherit`), `screenReaderText` | Built-in icon |
| `Illustration` | `name` (required), `alt` (required), `width`, `height` | Decorative illustration |
| `Tag` | `variant` (`default`/`warning`/`success`/`error`/`info`), `onClick`, `overlay`, `inline` | Chip/label |
| `StatusTag` | `variant` (`default`/`info`/`success`/`warning`/`danger`), `hollow`, `onClick`, `showRemoveIcon`, `onRemoveClick` | Label is `children` (no `label` prop) |
| `List` | `variant` (`unordered`, `unordered-styled`, `ordered`, `ordered-styled`, `inline`, `inline-divided`) | Each child is a list item (no `items` prop) |

```jsx
<Heading>Section Title</Heading>
<Text format={{ fontWeight: "demibold" }}>Bold text</Text>
<Text variant="microcopy">Small helper text</Text>
<Link href={{ url: "https://example.com", external: true }}>External link</Link>
<StatusTag variant="success">Active</StatusTag>
<List variant="unordered-styled">
  <Text>First</Text>
  <Text>Second</Text>
</List>
```

### Inputs

All text-like inputs (`Input`, `TextArea`, `SearchInput`, `DateInput`, `TimeInput`, `NumberInput`, `CurrencyInput`, `StepperInput`) require **`label` and `name`**. They share these props: `value`, `defaultValue`, `onChange(value)`, `onBlur`, `onFocus`, `required`, `readOnly`, `description`, `tooltip`, `placeholder`, `error` (boolean), and `validationMessage`.

| Component | Extra Props | Notes |
|---|---|---|
| `Input` | `type` (`text`/`password` only), `onInput` | Single-line text |
| `TextArea` | `rows`, `cols`, `maxLength`, `resize` | Multi-line text |
| `SearchInput` | `clearable` | Search field |
| `NumberInput` | `min`, `max`, `precision`, `formatStyle` (`decimal`/`percentage`), `textAlign` | `onChange(number)`. `onInput` was removed in 1.x |
| `CurrencyInput` | `currency`, `precision`, `min`, `max` | Currency number |
| `StepperInput` | `stepSize`, `min`, `max`, `precision`, `minValueReachedTooltip`, `maxValueReachedTooltip` | Use `stepSize`, not `step` |
| `DateInput` | `format`, `min`, `max`, `timezone` (`userTz`/`portalTz`), `clearButtonLabel`, `todayButtonLabel` | Value is `{ year, month, date }` |
| `TimeInput` | `min`, `max`, `interval`, `timezone` | Value is `{ hours, minutes }` |
| `Select` | `options` (`{ label, value }[]`, required), `value`, `onChange`, `label`, `name`, `variant` (`input`/`transparent`), `error`, `validationMessage` | Single select |
| `MultiSelect` | same as `Select`, but `value` is an array | Multi-select |
| `Checkbox` | `checked`, `initialIsChecked`, `onChange(checked, value)`, `name`, `value`, `readOnly`, `description`, `size` (`sm`/`md`), `inline` | Label is `children` |
| `RadioButton` | same as `Checkbox` | Label is `children` |
| `Toggle` | `label` (required), `checked`, `initialIsChecked`, `onChange(checked)`, `labelDisplay` (`inline`/`top`/`hidden`), `textChecked`, `textUnchecked`, `readOnly`, `size` | On/off switch |
| `ToggleGroup` | `name`, `label`, `options` (`{ label, value, initialIsChecked?, readOnly?, description? }[]`), `toggleType` (`checkboxList`/`radioButtonList`), `value`, `onChange`, `inline`, `size` | `onChange` receives `string[]` for checkboxList and `string` for radioButtonList |

```jsx
<Select
  label="Status"
  name="status"
  value={status}
  onChange={(value) => setStatus(value)}
  options={[
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]}
/>
<Checkbox name="agree" checked={agreed} onChange={(checked) => setAgreed(checked)}>
  I agree
</Checkbox>
<ToggleGroup
  name="channels"
  label="Channels"
  toggleType="checkboxList"
  value={channels}
  onChange={(values) => setChannels(values)}
  options={[
    { label: "Email", value: "email" },
    { label: "SMS", value: "sms" },
  ]}
/>
```

### Form

`Form` takes `onSubmit(event)`, where `event.targetValue` holds the values keyed by input `name`, and `autoComplete` (`on`/`off`). Submission is already prevented by default (the `preventDefault` prop was removed in 1.x). There is no `FormField` component: put `label` and `name` on each input.

```jsx
<Form onSubmit={(event) => handleSubmit(event.targetValue)}>
  <Input label="Name" name="name" required value={name} onChange={setName} />
  <Input
    label="Email"
    name="email"
    value={email}
    onChange={setEmail}
    error={!!emailError}
    validationMessage={emailError}
  />
  <Button type="submit" variant="primary">Submit</Button>
</Form>
```

### Buttons & Actions

| Component | Key Props | Notes |
|---|---|---|
| `Button` | `onClick`, `href`, `variant` (`primary`/`secondary`/`destructive`/`transparent`), `type` (`button`/`reset`/`submit`), `size` (`xs`/`sm`/`md`), `disabled`, `truncate`, `overlay` | Standard button |
| `LoadingButton` | Button props plus **`loading`**, `overlayOptions` (`{ openBehavior: 'onClick' \| 'onLoadingFinish' }`), `resultIconName` | Variants: `primary`/`secondary`/`destructive`. Use `loading`, not `isLoading` |
| `ButtonRow` | `children` | Row of buttons that collapses into an overflow menu |
| `Dropdown` | `buttonText`, `variant` (`primary`/`secondary`/`transparent`), `buttonSize`, `disabled` | Items are `<Dropdown.ButtonItem onClick overlay>` children. The `options` prop was removed in 1.x |

```jsx
<LoadingButton variant="primary" loading={isSaving} onClick={handleSave}>
  Save
</LoadingButton>

<Dropdown buttonText="More actions" variant="secondary">
  <Dropdown.ButtonItem onClick={handleEdit}>Edit</Dropdown.ButtonItem>
  <Dropdown.ButtonItem onClick={handleArchive}>Archive</Dropdown.ButtonItem>
</Dropdown>
```

### Feedback & Status

| Component | Key Props | Notes |
|---|---|---|
| `Alert` | `title` (required), **`variant`** (`info`/`tip`/`success`/`warning`/`error`/`danger`), `children` | Inline alert. Use `variant`, not `type` |
| `LoadingSpinner` | `label` (required), `showLabel`, `size` (`xs`/`sm`/`md`), `layout` (`inline`/`centered`) | Loader |
| `ProgressBar` | `value`, `maxValue`, `title`, `showPercentage`, `valueDescription`, `variant` (`success`/`danger`/`warning`), `aria-label` | Use `maxValue` (not `max` or `valueMax`) |
| `EmptyState` | `children` (required), `title`, `imageName`, `layout` (`horizontal`/`vertical`), `reverseOrder`, `imageWidth`, `flush` | Empty placeholder |
| `ErrorState` | `children` (required), `title`, `type` (`error`/`support`/`lock`) | Error placeholder |
| `Tooltip` | `placement` (`top`/`bottom`/`left`/`right`) | **Not a wrapper.** Pass it through the `overlay` prop of `Button`, `LoadingButton`, `Link`, `Tag` or `Image` |

```jsx
<Alert variant="warning" title="Warning">
  Check your configuration.
</Alert>

<EmptyState title="Nothing here yet" layout="vertical">
  <Text>Create your first item to get started.</Text>
</EmptyState>

<ErrorState title="Couldn't load data">
  <Button onClick={refetch}>Retry</Button>
</ErrorState>

<Button overlay={<Tooltip placement="top">Copies the record ID</Tooltip>}>
  Hover me
</Button>
```

### Data Display

| Component | Key Props | Notes |
|---|---|---|
| `Table` | `bordered`, `flush`, `density` (`default`/`condensed`/`compact`), `paginated`, `pageCount`, `page`, `onPageChange`, `showButtonLabels`, `showFirstLastButtons`, `maxVisiblePageButtons` | `pageCount` and `onPageChange` are required when `paginated` |
| `TableHead` / `TableBody` / `TableFooter` / `TableRow` | `children` | Sections and rows |
| `TableHeader` | `align`, `width`, `sortDirection` (`ascending`/`descending`/`none`/`never`), `onSortChange` | Header cell; use it inside `TableHead` |
| `TableCell` | `align` (`left`/`center`/`right`), `width` (`min`/`max`/`auto`/number), `colSpan` | Body cell |
| `DescriptionList` | `direction` (`row`/`column`) | Children are `<DescriptionListItem label="…">` (no `items` prop) |
| `Statistics` | `children` | Children are `<StatisticsItem label number>`, optionally containing `<StatisticsTrend value direction="increase"/"decrease" color>` |
| `ScoreCircle` | `score` (required) | Only prop |
| `BarChart` / `LineChart` | `data` (rows), `axes` (`{ x: { field, fieldType, label? }, y: { … }, options? }`), `options` (`title`, `showLegend`, `showTooltips`, `showDataLabels`, `colorList`) | `fieldType`: `category`/`linear`/`datetime`. `options.colors` was removed in 1.x; use `colorList` |

```jsx
<Table bordered paginated pageCount={totalPages} page={page} onPageChange={setPage}>
  <TableHead>
    <TableRow>
      <TableHeader>Name</TableHeader>
      <TableHeader>Email</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    {contacts.map((c) => (
      <TableRow key={c.id}>
        <TableCell>{c.name}</TableCell>
        <TableCell>{c.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

<DescriptionList direction="row">
  <DescriptionListItem label="Owner">
    <Text>Jane Doe</Text>
  </DescriptionListItem>
</DescriptionList>

<Statistics>
  <StatisticsItem label="Open deals" number={12}>
    <StatisticsTrend value="10%" direction="increase" />
  </StatisticsItem>
</Statistics>

<BarChart
  data={[
    { stage: "New", count: 4 },
    { stage: "Won", count: 2 },
  ]}
  axes={{
    x: { field: "stage", fieldType: "category", label: "Stage" },
    y: { field: "count", fieldType: "linear", label: "Deals" },
  }}
  options={{ showLegend: false }}
/>
```

### Navigation & Containers

| Component | Key Props | Notes |
|---|---|---|
| `Tabs` | `selected`, `defaultSelected`, `onSelectedChange(id)`, `variant` (`default`/`enclosed`), `fill` | Children are `<Tab tabId title tooltip disabled>`. Use `variant="default"` on settings pages |
| `Accordion` | `title` (required), `defaultOpen`, `open`, `onClick`, `disabled`, `size` | Collapsible section |
| `StepIndicator` | `stepNames` (required), `currentStep`, `direction`, `variant` (`default`/`compact`/`flush`), `circleSize`, `onClick(stepIndex)` | Use `stepNames`, not `steps` |

```jsx
<Tabs defaultSelected="overview" onSelectedChange={(id) => setTab(id)}>
  <Tab tabId="overview" title="Overview">
    <Text>Overview content</Text>
  </Tab>
  <Tab tabId="history" title="History">
    <Text>History content</Text>
  </Tab>
</Tabs>

<StepIndicator stepNames={["Connect", "Configure", "Done"]} currentStep={1} />
```

### Overlays (Modal, Panel)

Attach them with the `overlay` prop of `Button`, `LoadingButton`, `Link`, `Tag`, `Image` or `Dropdown.ButtonItem`. Close them with `actions.closeOverlay(id)`. See [`ui-extensions-sdk.md`](ui-extensions-sdk.md#overlays).

| Component | Key Props |
|---|---|
| `Modal` | `id` (required), `title`, `width` (`sm`/`md`/`lg`), `variant` (`default`/`danger`), `onOpen`, `onClose`, `aria-label`. Children: `ModalBody`, `ModalFooter` |
| `Panel` | `id` (required), `title`, `width` (`sm`/`md`/`lg`), `variant` (`default`/`modal`), `onOpen`, `onClose`. Children: `PanelBody` → `PanelSection` (`flush`), `PanelFooter` |

### Exported but undocumented

`Card`, `FileUpload` and `FileViewer` are exported by 1.0.1 but have no docs page (unverified). Don't use them in production until HubSpot documents them.

## CRM Data Components

Import from `@hubspot/ui-extensions/crm`. They are only for **app cards**. Docs: "These components can only be placed in the middle column of CRM records" (`crm.record.tab`). The 1.0.1 types also allow them in `crm.preview` and `helpdesk.sidebar`. They are **never** allowed in `crm.record.sidebar`; in the sidebar, use the record hooks plus standard components.

| Component | Key Props |
|---|---|
| `CrmPropertyList` | `properties` (required), `direction`, `objectTypeId`, `objectId` |
| `CrmAssociationTable` | `objectTypeId` (required), `propertyColumns` (required), `quickFilterProperties`, `searchable`, `pagination`, `pageSize`, `associationLabelFilter`, `preFilters`, `sort` |
| `CrmAssociationPivot` | `objectTypeId` (required), `associationLabels`, `maxAssociations`, `preFilters`, `sort` |
| `CrmAssociationPropertyList` | `objectTypeId` (required), `properties` (required), `associationLabels`, `filters`, `sort` |
| `CrmAssociationStageTracker` | `objectTypeId` (required), `properties` (required), `associationLabels`, `filters`, `showProperties`, `sort` |
| `CrmDataHighlight` | `properties` (required), `objectTypeId`, `objectId` |
| `CrmReport` | `reportId` (required), `use` (`associations`/`subject`/`unfiltered`) |
| `CrmStageTracker` | `properties` (required), `objectTypeId`, `objectId`, `showProperties` |
| `CrmStatistics` | `objectTypeId` (required), `statistics` (`{ label, statisticType: 'SUM'\|'AVG'\|'MIN'\|'MAX'\|'COUNT'\|'DISTINCT_APPROX'\|'PERCENTILES', propertyName, percentile?, filterGroups? }[]`) |

- Filters (`preFilters` / `filters`) look like `{ property, operator, value? | values? | highValue? }`. Operators: `EQ`, `NEQ`, `LT`, `LTE`, `GT`, `GTE`, `BETWEEN`, `IN`, `NOT_IN`, `HAS_PROPERTY`, `NOT_HAS_PROPERTY`.
- `sort` looks like `{ columnName, direction: 1 | -1 }`.
- `CrmSimpleDeadline` is also exported but undocumented (unverified).

```jsx
<CrmPropertyList properties={["firstname", "lastname", "email", "phone"]} direction="row" />

<CrmAssociationTable
  objectTypeId="0-3"
  propertyColumns={["dealname", "amount", "dealstage"]}
  quickFilterProperties={["createdate"]}
  pageSize={10}
  preFilters={[{ operator: "EQ", property: "dealstage", value: "contractsent" }]}
  sort={[{ columnName: "amount", direction: -1 }]}
  searchable={true}
  pagination={true}
/>
```

## CRM Action Components

Import from `@hubspot/ui-extensions/crm`. They are allowed in app cards. In `crm.record.sidebar`, only `CrmActionButton` and `CrmActionLink` are allowed; `CrmCardActions` is not. Users can only run actions they have permission for.

| Component | Key Props |
|---|---|
| `CrmActionButton` | `actionType`, `actionContext`, `variant` (`primary`/`secondary`/`destructive`), `size`, `type`, `disabled`, `onClick`, `onError(errors)` |
| `CrmActionLink` | `actionType`, `actionContext`, `variant` (`primary`/`light`/`dark`/`destructive`), `onClick`, `onError` |
| `CrmCardActions` | `actionConfigs` (`{ type: 'action-library-button', actionType, actionContext, label?, disabled?, tooltipText? }` or `{ type: 'dropdown', options: [...], label? }`), `onError`. Renders in the card's top-right corner |

**Action types and the `actionContext` each needs:**

| `actionType` | `actionContext` |
|---|---|
| `PREVIEW_OBJECT` | `objectTypeId`, `objectId` |
| `ADD_NOTE`, `ADD_TASK`, `SCHEDULE_MEETING` | `objectTypeId`, `objectId` |
| `SEND_EMAIL` | `objectTypeId`, `objectId`, optional `initialEmailSubject`, `initialEmailBody` |
| `OPEN_RECORD_ASSOCIATION_FORM` | `objectTypeId`, `association: { objectTypeId, objectId }` |
| `ENGAGEMENT_APP_LINK` | `objectTypeId`, `objectId`, `engagementId`, optional `external` |
| `RECORD_APP_LINK` | `objectTypeId`, `objectId`, optional `external`, `includeEschref` |
| `PAGE_APP_LINK` | `path` (starts with `/`), optional `external` |
| `EXTERNAL_URL` | `href` (http/https) |

`OPEN_RECORD_CREATOR_FORM` and `OPEN_WORKFLOW_ENROLLMENT_MODAL` exist in the 1.0.1 types but are not in the docs (unverified).

```jsx
<CrmActionButton
  actionType="ADD_NOTE"
  actionContext={{ objectTypeId: context.crm.objectTypeId, objectId: context.crm.objectId }}
  variant="secondary"
>
  Add note
</CrmActionButton>

<CrmCardActions
  actionConfigs={[
    {
      type: "action-library-button",
      actionType: "SEND_EMAIL",
      actionContext: { objectTypeId: "0-1", objectId: context.crm.objectId },
      label: "Send email",
    },
  ]}
/>
```

## App Pages Components (`@hubspot/ui-extensions/pages`)

Used in app pages (`"type": "page"`, registered with `hubspot.extend<'pages'>`).

| Export | Purpose |
|---|---|
| `createPageRouter(<PageRoutes>…</PageRoutes>)` | Returns a `PageRouter` component |
| `PageRoutes` | Route container: `path?`, `layoutComponent?`. Children: `PageRoutes.IndexRoute`, `PageRoutes.Route` (`path`), `PageRoutes.AnyRoute` (catch-all). Each takes `component` and an optional `id` |
| `PageLink` | `to`, `params?`: in-app link. `params` keys that match `:placeholders` fill the path; other keys become query parameters |
| `PageHeader` | Header actions: `PageHeader.PrimaryAction`, `PageHeader.SecondaryActions`, `PageHeader.Link` (`href`/`onClick`), `PageHeader.PageLink` (`to`, `params`) |
| `PageTitle` | Page title (string child) |
| `PageBreadcrumbs` | `PageBreadcrumbs.PageLink` (`to`, `params`), `PageBreadcrumbs.Current` |
| `usePageRoute()` | Returns `{ path, routeId, params }` |

```tsx
import { hubspot, Text } from "@hubspot/ui-extensions";
import { createPageRouter, PageRoutes, PageLink, PageTitle, usePageRoute } from "@hubspot/ui-extensions/pages";

const HomePage = () => (
  <>
    <PageTitle>Home</PageTitle>
    {/* customerId fills the :customerId placeholder; tab becomes ?tab=activity */}
    <PageLink to="/customers/:customerId" params={{ customerId: "42", tab: "activity" }}>
      Customer 42
    </PageLink>
  </>
);
const CustomerPage = () => {
  const { params } = usePageRoute();
  return <Text>Customer {params.customerId}</Text>;
};
const NotFound = () => <Text>Page not found</Text>;

const PageRouter = createPageRouter(
  <PageRoutes>
    <PageRoutes.IndexRoute component={HomePage} id="home" />
    <PageRoutes.Route path="/customers/:customerId" component={CustomerPage} />
    <PageRoutes.AnyRoute component={NotFound} />
  </PageRoutes>
);

hubspot.extend<"pages">(() => <PageRouter />);
```

**Legacy app home** (`"type": "page"` + `"location": "home"`) uses `HeaderActions`, which wraps one `PrimaryHeaderActionButton` and any number of `SecondaryHeaderActionButton`s. Import them from `@hubspot/ui-extensions/pages/home`. Each button takes `onClick`, `href`, `disabled` and `overlay`. Prefer app pages for new work.

## Experimental Components (not for production)

`@hubspot/ui-extensions/experimental` exports `Grid`, `GridItem`, `Center`, `ExpandableText`, `FileInput`, `Iframe`, `MediaObject`, `SettingsView`, `SideNav`, `SideNavItem` and `Stack2`. It also exports experimental variants of stable components (for example, a `Box`/`Flex` that accept padding props). The package README says experimental components "aren't in a stable API state and aren't yet ready for production use".

## Figma Design Kit

For UI prototyping: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/ui-components/figma-design-kit

## Common Pattern: Loading, Error, Empty

```jsx
import React, { useState } from "react";
import { hubspot, Stack, Text, Button, LoadingSpinner, Alert, EmptyState } from "@hubspot/ui-extensions";

hubspot.extend(() => <MyCard />);

const MyCard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await hubspot.fetch("https://api.example.com/data");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading..." />;
  if (error) return <Alert variant="danger" title="Error">{error}</Alert>;

  return (
    <Stack gap="medium">
      {data ? (
        <Text>{JSON.stringify(data)}</Text>
      ) : (
        <EmptyState title="No data loaded">
          <Text>Click the button to load data.</Text>
        </EmptyState>
      )}
      <Button onClick={loadData}>Load Data</Button>
    </Stack>
  );
};
```
