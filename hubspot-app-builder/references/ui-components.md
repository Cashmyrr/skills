# UI Components Reference

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/overview

## Import Sources

```js
// Standard components
import { Text, Button, Flex, ... } from "@hubspot/ui-extensions";

// CRM data components (CRM cards only, NOT in crm.record.sidebar)
import { CrmPropertyList, CrmAssociationTable } from "@hubspot/ui-extensions/crm";

// CRM action components (CRM cards only)
import { AddNoteAction, SendEmailAction } from "@hubspot/ui-extensions/crm";
```

## Standard Components

### Layout

| Component | Key Props | Description |
|---|---|---|
| `Flex` | `direction`, `gap`, `align`, `justify`, `wrap` | Flexbox container |
| `Box` | `padding`, `margin` | Generic container with spacing |
| `Divider` | — | Horizontal rule separator |
| `Grid` | `columns`, `gap` | CSS Grid container |

```jsx
<Flex direction="column" gap="medium" align="start">
  <Box padding="medium">Content</Box>
  <Divider />
</Flex>
```

### Text & Display

| Component | Key Props | Description |
|---|---|---|
| `Text` | `format`, `variant` | Body text; `format={{ fontWeight: "demibold" }}` |
| `Heading` | `level` | H1-H6 headings |
| `Image` | `src`, `alt`, `width`, `height` | Image with optional overlay |
| `Link` | `href`, `onClick` | Hyperlink |
| `Tag` | `variant`, `onClick`, `overlay` | Chip/badge with optional overlay trigger |
| `Badge` | `variant` | Status badge |

```jsx
<Heading level={2}>Section Title</Heading>
<Text format={{ fontWeight: "demibold" }}>Bold Text</Text>
<Link href="https://example.com">External link</Link>
```

### Input Components

| Component | Key Props | Description |
|---|---|---|
| `Input` | `value`, `onChange`, `label`, `error`, `readOnly`, `placeholder` | Text input |
| `TextArea` | `value`, `onChange`, `label`, `rows` | Multi-line text |
| `Select` | `value`, `onChange`, `label`, `options` | Dropdown single select |
| `MultiSelect` | `value`, `onChange`, `label`, `options` | Multi-select |
| `Checkbox` | `checked`, `onChange`, `label` | Checkbox |
| `RadioButton` | `checked`, `onChange`, `label` | Radio button |
| `DateInput` | `value`, `onChange`, `label`, `format` | Date picker |
| `NumberInput` | `value`, `onChange`, `label`, `min`, `max` | Number input |

```jsx
<Select
  label="Status"
  value={status}
  onChange={(value) => setStatus(value)}
  options={[
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" }
  ]}
/>
```

### Action Components

| Component | Key Props | Description |
|---|---|---|
| `Button` | `onClick`, `variant`, `disabled`, `overlay`, `type` | Primary action button |
| `LoadingButton` | `onClick`, `isLoading`, `variant` | Button with loading state |
| `IconButton` | `onClick`, `icon`, `tooltip` | Icon-only button |

**Button variants:** `primary`, `secondary`, `destructive`, `transparent`

```jsx
<Button variant="primary" onClick={handleSave} disabled={isLoading}>
  Save Changes
</Button>
<LoadingButton isLoading={isSaving} onClick={handleSave}>
  Save
</LoadingButton>
```

### Feedback Components

| Component | Key Props | Description |
|---|---|---|
| `Alert` | `type`, `title`, `children` | Inline alert within card |
| `LoadingSpinner` | `label` | Spinning loader |
| `Tag` | `variant` | Colored label tag |
| `Badge` | `variant`, `text` | Status badge |
| `Tooltip` | `text` | Hover tooltip wrapper |

```jsx
<Alert type="warning" title="Warning">
  Check your configuration.
</Alert>

{isLoading && <LoadingSpinner label="Loading data..." />}
```

### Data Display

| Component | Key Props | Description |
|---|---|---|
| `Table` | — | Table container |
| `TableHead` | — | Header section |
| `TableBody` | — | Body section |
| `TableRow` | — | Table row |
| `TableCell` | `width`, `align` | Table cell |

```jsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Name</TableCell>
      <TableCell>Email</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {contacts.map(c => (
      <TableRow key={c.id}>
        <TableCell>{c.name}</TableCell>
        <TableCell>{c.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Form Components

```jsx
<Form onSubmit={handleSubmit}>
  <FormField label="Name" required>
    <Input value={name} onChange={setName} />
  </FormField>
  <FormField label="Email">
    <Input type="email" value={email} onChange={setEmail} />
  </FormField>
  <Button type="submit">Submit</Button>
</Form>
```

## CRM Data Components

> Only available in `crm.record.tab`, `crm.record.sidebar`, `crm.preview`, `helpdesk.sidebar`.
> **Not available in `crm.record.sidebar`** — use `useCrmProperties` hook instead.

```js
import { CrmPropertyList, CrmAssociationTable } from "@hubspot/ui-extensions/crm";
```

### `CrmPropertyList`

Displays and optionally edits CRM properties from the current record:
```jsx
<CrmPropertyList
  properties={["firstname", "lastname", "email", "phone"]}
  direction="column"
/>
```

### `CrmAssociationTable`

Shows associated records in a paginated table:
```jsx
<CrmAssociationTable
  objectTypeId="0-1"
  associations={["contacts"]}
  properties={["firstname", "email"]}
  pageSize={5}
/>
```

### `ReportChart`

Renders a CRM report as a chart within the extension.

## CRM Action Components

Trigger built-in CRM actions from within the extension:

```js
import {
  AddNoteAction,
  SendEmailAction,
  ScheduleMeetingAction,
  CreateTaskAction,
  LogCallAction
} from "@hubspot/ui-extensions/crm";
```

```jsx
<AddNoteAction objectTypeId="0-1" objectId={crm.objectId}>
  <Button>Add Note</Button>
</AddNoteAction>
```

## Figma Design Kit

For UI prototyping: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/figma-design-kit

## Common Patterns

### Full Card with Loading State

```jsx
import React, { useState } from "react";
import { hubspot, Flex, Text, Button, LoadingSpinner, Alert } from "@hubspot/ui-extensions";

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
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading..." />;
  if (error) return <Alert type="danger" title="Error">{error}</Alert>;

  return (
    <Flex direction="column" gap="medium">
      {data ? <Text>{JSON.stringify(data)}</Text> : <Text>No data loaded.</Text>}
      <Button onClick={loadData}>Load Data</Button>
    </Flex>
  );
};
```
