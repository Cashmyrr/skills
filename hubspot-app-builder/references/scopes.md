# HubSpot Scopes Reference

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/scopes

Only request scopes your app actually uses. All requested scopes must appear in the *Shared data* table of your Marketplace listing. Prefer granular scopes (e.g. `crm.objects.contacts.read`, `files.read`) over legacy broad ones.

At minimum an app must include the **read** scope for each CRM object or asset type it touches (e.g. `crm.objects.contacts.read`). To find the scopes an endpoint needs, check the *Required Scopes* section of its API reference article.

## Scope Types

| Type | Behavior |
|---|---|
| `requiredScopes` | Must be authorized and must appear in the install URL's `scope` query param, or install fails. The **only** type available to `static` auth apps. |
| `conditionallyRequiredScopes` | Required **only if** present in the install URL's `scope` param. Lets you ship tiered install URLs. Install fails if the scope is in the URL but the user lacks access to the feature. |
| `optionalScopes` | Not required to install. Passed via the `optional_scope` query param; the user chooses which to grant. Requires OAuth. Use for tier-gated data such as `crm.objects.custom.read` (Enterprise). |

## Granular Scopes Migration (since 2026-09-08)

> Docs: https://developers.hubspot.com/docs/apps/developer-platform/build-apps/migrate-an-app/update-your-app-to-granular-scopes

HubSpot introduced granular replacements for several legacy scopes on September 8, 2026. Each affected app gets an *Auto rollout* date under **Development > Migrations**; if you don't apply the migration by then, HubSpot applies it. Legacy scopes keep working meanwhile. *Backward compatibility* (on by default) expands legacy scopes to granular ones on install URLs and returns legacy names in token responses — don't turn it off until your install URLs and scope checks use granular names. The in-app migration tool is in public beta.

| Legacy scope | Granular replacements |
|---|---|
| `tickets` | `crm.objects.tickets.read`, `crm.objects.tickets.write`, `crm.schemas.tickets.read`, `crm.schemas.tickets.write` |
| `tickets.sensitive` | `crm.objects.tickets.sensitive.read`, `crm.objects.tickets.sensitive.write` (mapping per scopes table; unverified on the migration page) |
| `tickets.highly_sensitive` | `crm.objects.tickets.highly_sensitive.read`, `crm.objects.tickets.highly_sensitive.write` (same note) |
| `timeline` | `timeline.read`, `timeline.write` |
| `files` | `files.read`, `files.write`, `files.delete` |
| `hubdb` | `hubdb.tables.read`, `hubdb.tables.write`, `hubdb.tables.publish`, `hubdb.rows.read`, `hubdb.rows.write` |

**New apps:** request the granular scopes. Exception: app events docs still say to add `"timeline"` to `requiredScopes`.

## Deprecated Scopes — do not use

These map to deprecated APIs and **should not be used for new apps**: `accounting`, `actions`, `e-commerce`, `integration-sync`, `social`.

## Scopes Without a Current API — do not request

These may still appear on app configuration pages but have **no corresponding API** today: `cms.knowledge_base.articles.write`, `cms.knowledge_base.articles.publish`, `cms.knowledge_base.settings.read`, `cms.knowledge_base.settings.write`, `ctas.read`.

## Scopes Unsupported Under User-Level Access (2026.09)

User-level apps support the scopes tied to the supported Automation (Sequences), CRM, and Sales endpoints, **except**: `cpq.quote_templates.read`, `cpq.quotes.read`, `cpq.quotes.write`, `marketing.lead_scoring.read`, `marketing.lead_scoring.write`, `crm.schemas.custom.write`.

---

## CRM Objects

| Scope | Description | Required tier |
|---|---|---|
| `crm.objects.contacts.read` | View contacts | Any |
| `crm.objects.contacts.write` | Create, delete, modify contacts | Any |
| `crm.objects.contacts.sensitive.read` | View Sensitive contact properties | Enterprise |
| `crm.objects.contacts.sensitive.write` | Edit Sensitive contact properties | Enterprise |
| `crm.objects.contacts.highly_sensitive.read` | View Highly Sensitive contact properties | Enterprise |
| `crm.objects.contacts.highly_sensitive.write` | Edit Highly Sensitive contact properties | Enterprise |
| `crm.objects.companies.read` | View companies | Any |
| `crm.objects.companies.write` | View and modify companies | Any |
| `crm.objects.companies.sensitive.read` | View Sensitive company properties | Enterprise |
| `crm.objects.companies.sensitive.write` | Edit Sensitive company properties | Enterprise |
| `crm.objects.companies.highly_sensitive.read` | View Highly Sensitive company properties | Enterprise |
| `crm.objects.companies.highly_sensitive.write` | Edit Highly Sensitive company properties | Enterprise |
| `crm.objects.deals.read` | View deals | Any |
| `crm.objects.deals.write` | Create, delete, modify deals | Any |
| `crm.objects.deals.sensitive.read` | View Sensitive deal properties | Enterprise |
| `crm.objects.deals.sensitive.write` | Edit Sensitive deal properties | Enterprise |
| `crm.objects.deals.highly_sensitive.read` | View Highly Sensitive deal properties | Enterprise |
| `crm.objects.deals.highly_sensitive.write` | Edit Highly Sensitive deal properties | Enterprise |
| `crm.objects.tickets.read` | View tickets | Any |
| `crm.objects.tickets.write` | Create, delete, modify tickets | Any |
| `crm.objects.tickets.sensitive.read` | View Sensitive ticket properties | Any* |
| `crm.objects.tickets.sensitive.write` | Edit Sensitive ticket properties | Any* |
| `crm.objects.tickets.highly_sensitive.read` | View Highly Sensitive ticket properties | Any* |
| `crm.objects.tickets.highly_sensitive.write` | Edit Highly Sensitive ticket properties | Any* |
| `crm.objects.quotes.read` | View quotes and quote templates | Any |
| `crm.objects.quotes.write` | Create, delete, modify quotes, including legacy quotes | Any |
| `crm.objects.line_items.read` | View line items | Any |
| `crm.objects.line_items.write` | Create, delete, modify line items | Any |
| `crm.objects.invoices.read` | View invoices | Any |
| `crm.objects.orders.read` | View orders | Any |
| `crm.objects.orders.write` | Create, delete, modify orders | Any |
| `crm.objects.carts.read` | View carts | Any |
| `crm.objects.carts.write` | Create, delete, modify carts | Any |
| `crm.objects.subscriptions.read` | View commerce subscriptions | Any |
| `crm.objects.commercepayments.read` | View commerce payments | Starter+ |
| `crm.objects.custom.read` | View custom object records | Enterprise |
| `crm.objects.custom.write` | Create, delete, modify custom object records | Enterprise |
| `crm.objects.custom.sensitive.read` | View Sensitive custom object properties | Enterprise |
| `crm.objects.custom.sensitive.write` | Edit Sensitive custom object properties | Enterprise |
| `crm.objects.custom.highly_sensitive.read` | View Highly Sensitive custom object properties | Enterprise |
| `crm.objects.custom.highly_sensitive.write` | Edit Highly Sensitive custom object properties | Enterprise |
| `crm.objects.owners.read` | View owners assigned to CRM records | Any |
| `crm.objects.leads.read` | View leads | Sales Hub Professional+ |
| `crm.objects.leads.write` | Create, delete, modify leads | Sales Hub Professional+ |
| `crm.objects.goals.read` | View goals | Sales Hub Starter+ |
| `crm.objects.feedback_submission.read` | View feedback survey submissions | Service Hub Professional+ |
| `crm.objects.marketing_events.read` | View marketing event details | Any |
| `crm.objects.marketing_events.write` | Create, delete, modify marketing events | Any |
| `crm.objects.appointments.read` | View appointments | Any |
| `crm.objects.appointments.write` | Create, delete, modify appointments | Any |
| `crm.objects.appointments.sensitive.read` | View Sensitive appointment properties | Enterprise |
| `crm.objects.appointments.sensitive.write` | Edit Sensitive appointment properties | Enterprise |
| `crm.objects.courses.read` | View courses | Any |
| `crm.objects.courses.write` | Create, delete, modify courses | Any |
| `crm.objects.listings.read` | View listings | Any |
| `crm.objects.listings.write` | Create, delete, modify listings | Any |
| `crm.objects.services.read` | View services | Any |
| `crm.objects.services.write` | Create, delete, modify services | Any |
| `crm.objects.users.read` | View users | Any |
| `crm.objects.users.write` | Create, delete, modify users | Any |
| `crm.objects.partner-clients.read` | View partner client objects | Any |
| `crm.objects.partner-clients.write` | Create, delete, modify partner client objects | Any |
| `crm.objects.partner-services.read` | View partner service objects | Any |
| `crm.objects.partner-services.write` | Create, delete, modify partner service objects | Any |
| `crm.objects.projects.read` | View projects (required scope of the Projects API; not in the scopes table) | Any (API reference lists Free) |
| `crm.dealsplits.read_write` | Create and retrieve deal splits | Sales Hub Enterprise |

\* The scopes table lists the ticket Sensitive/Highly Sensitive scopes as "All accounts", unlike the other objects' (Enterprise).

Other `crm.objects.projects.*` scopes (write, sensitive, highly sensitive) appear in the Projects API spec but are not documented in the scopes table — confirm in the endpoint's *Required Scopes* before requesting (unverified).

## App Object Scopes

`<FQN>` is the app object's fully qualified name, `a<appId>_<NAME>` (see [`features.md`](features.md#app-objects)). Recommended in `conditionallyRequiredScopes` during rollout.

| Scope pattern | Description |
|---|---|
| `crm.app.schemas.<FQN>.read` | Minimum required for customers to access the app object |
| `crm.app.objects.<FQN>.view` / `.create` / `.edit` / `.merge` / `.delete` | Record-level access |
| `crm.app.schemas.<FQN>.properties.write` | Manage the object's schema properties |

## CRM Schemas (Property Settings)

| Scope | Description | Required tier |
|---|---|---|
| `crm.schemas.contacts.read` | View contact property settings | Any |
| `crm.schemas.contacts.write` | Modify contact property settings | Any |
| `crm.schemas.companies.read` | View company property settings | Any |
| `crm.schemas.companies.write` | Modify company property settings | Any |
| `crm.schemas.deals.read` | View deal property settings | Any |
| `crm.schemas.deals.write` | Modify deal property settings | Any |
| `crm.schemas.tickets.read` | View ticket property settings (from the migration guide) | Any (unverified) |
| `crm.schemas.tickets.write` | Modify ticket property settings (from the migration guide) | Any (unverified) |
| `crm.schemas.quotes.read` | View quote and quote template settings | Any |
| `crm.schemas.quotes.write` | Modify quote property settings | Any |
| `crm.schemas.line_items.read` | View line item properties | Any |
| `crm.schemas.invoices.read` | View invoice property settings | Any |
| `crm.schemas.invoices.write` | Modify invoice property settings | Any |
| `crm.schemas.orders.read` | View order property settings | Any |
| `crm.schemas.orders.write` | Modify order property settings | Any |
| `crm.schemas.carts.read` | View cart property settings | Any |
| `crm.schemas.carts.write` | Modify cart property settings | Any |
| `crm.schemas.subscriptions.read` | View commerce subscription property settings | Any |
| `crm.schemas.subscriptions.write` | Modify commerce subscription property settings | Any |
| `crm.schemas.commercepayments.read` | View commerce payment property settings | Starter+ |
| `crm.schemas.custom.read` | View custom object definitions | Enterprise |
| `crm.schemas.appointments.read` | View appointment property settings | Any |
| `crm.schemas.appointments.write` | Modify appointment property settings | Any |
| `crm.schemas.courses.read` | View course property settings | Any |
| `crm.schemas.courses.write` | Modify course property settings | Any |
| `crm.schemas.listings.read` | View listing property settings | Any |
| `crm.schemas.listings.write` | Modify listing property settings | Any |
| `crm.schemas.services.read` | View service property settings | Any |
| `crm.schemas.services.write` | Modify service property settings | Any |

## CRM Lists, Pipelines, Import/Export

| Scope | Description | Required tier |
|---|---|---|
| `crm.lists.read` | View contact lists | Any |
| `crm.lists.write` | Create and modify contact lists | Any |
| `crm.pipelines.orders.read` | View order pipelines | Any |
| `crm.pipelines.orders.write` | Create, delete, modify order pipelines | Any |
| `crm.export` | Export CRM records for all data types | Any |
| `crm.import` | Import (create or modify) CRM records | Any |

## Files and HubDB

| Scope | Description | Required tier |
|---|---|---|
| `files.read` | View files in the file manager | Any |
| `files.write` | Upload and manage files | Any |
| `files.delete` | Delete files | Any |
| `files.ui_hidden.read` | Access hidden or deleted files | Any |
| `files.ui_hidden.write` | Manage hidden or deleted files | Any |
| `files` | **Legacy** — migrate to `files.read` / `files.write` / `files.delete` | Any |
| `hubdb.tables.read` | Retrieve HubDB tables | CMS Hub or Marketing Hub Professional+ |
| `hubdb.tables.write` | Update, clone, delete HubDB tables | CMS Hub or Marketing Hub Professional+ |
| `hubdb.tables.publish` | Publish or unpublish HubDB tables | CMS Hub or Marketing Hub Professional+ |
| `hubdb.rows.read` | Retrieve HubDB row data | CMS Hub or Marketing Hub Professional+ |
| `hubdb.rows.write` | Add or modify HubDB rows | CMS Hub or Marketing Hub Professional+ |
| `hubdb` | **Legacy** — migrate to the `hubdb.tables.*` / `hubdb.rows.*` scopes | CMS Hub or Marketing Hub Professional+ |

## CMS

| Scope | Description | Required tier |
|---|---|---|
| `cms.domains.read` | List connected domains | Any |
| `cms.domains.write` | Create, update, delete connected domains | Any |
| `cms.functions.read` | View Content Hub serverless functions, secrets, execution results | Content Hub Enterprise |
| `cms.functions.write` | Write serverless functions and secrets | Content Hub Enterprise |
| `cms.knowledge_base.articles.read` | View knowledge articles via GraphQL | Service Hub Professional+ |
| `cms.membership.access_groups.read` | View membership access groups | Service Hub or Content Hub Professional+ |
| `cms.membership.access_groups.write` | Create, edit, delete membership access groups | Service Hub or Content Hub Professional+ |
| `content` | Website pages, landing pages, marketing emails, blog APIs | CMS Hub or Marketing Hub Professional+ |
| `collector.graphql_schema.read` | Run GraphQL introspection queries | CMS Hub Professional+ |
| `collector.graphql_query.execute` | Query HubSpot data via the GraphQL endpoint | CMS Hub Professional+ |

Per their descriptions, the `cms.functions.*` scopes cover Content Hub (CMS) serverless functions; the app `app-function` docs do not mention them.

## Settings & Users

| Scope | Description | Required tier |
|---|---|---|
| `settings.users.read` | View account users and permissions | Any |
| `settings.users.write` | Manage users, roles, permissions | Any |
| `settings.users.teams.read` | View account teams | Any |
| `settings.users.teams.write` | Assign users to teams | Any |
| `settings.billing.write` | Change billing settings and manage paid seats | Any |
| `settings.currencies.read` | Read exchange rates and company currency | Any |
| `settings.currencies.write` | Manage exchange rates and company currency | Any |
| `account-info.security.read` | Read audit logs and security info | Any |
| `business_units_view.read` | View brand (business unit) data, including logos | Brands add-on |

## Marketing & Automation

| Scope | Description | Required tier |
|---|---|---|
| `automation` | Create/retrieve custom workflow actions and use the v4 workflow APIs | Professional+ |
| `automation.sequences.read` | View sequences | Sales Hub or Service Hub Professional+ |
| `automation.sequences.enrollments.write` | Enroll contacts in sequences | Sales Hub or Service Hub Professional+ |
| `marketing.campaigns.read` | View marketing campaigns and assets | Marketing Hub Professional+ |
| `marketing.campaigns.write` | Create, update, delete marketing campaigns | Marketing Hub Professional+ |
| `marketing.campaigns.revenue.read` | View revenue and deal amounts attributed to campaigns | Marketing Hub Professional+ |
| `marketing-email` | Retrieve and send marketing emails (publishing requires Marketing Hub Enterprise) | Any |
| `transactional-email` | Access and manage transactional emails | Marketing Hub Professional+ with Transactional Email add-on |
| `analytics.behavioral_events.send` | Send custom event occurrences | Professional+ |
| `behavioral_events.event_definitions.read_write` | Create, read, update, delete custom events and their properties | Marketing Hub Enterprise |
| `communication_preferences.read` | View contacts' subscription preferences | Any |
| `communication_preferences.write` | Subscribe/unsubscribe contacts from subscription types | Any |
| `communication_preferences.read_write` | Subscribe/unsubscribe contacts and retrieve preferences | Any |
| `communication_preferences.statuses.batch.read` | Batch retrieve contacts by subscription status | Marketing Hub Enterprise |
| `communication_preferences.statuses.batch.write` | Batch update subscription status | Marketing Hub Enterprise |
| `business-intelligence` | Legacy v2 reporting endpoints | Any |

## Conversations

| Scope | Description | Required tier |
|---|---|---|
| `conversations.read` | View actors, messages, threads in the inbox and help desk | Any |
| `conversations.write` | Create and manage threads and messages | Any |
| `conversations.visitor_identification.tokens.create` | Fetch identification tokens for chat widget visitors | Professional+ |
| `conversations.custom_channels.read` | View custom channels for connected inboxes | Sales Hub or Service Hub Enterprise |
| `conversations.custom_channels.write` | Manage custom channels for connected inboxes | Sales Hub or Service Hub Enterprise |

## Webhooks Journal

Used with a client credentials token (see [`features.md`](features.md#webhooks-journal-pull-model)), plus the object scopes for subscribed types.

| Scope | Description |
|---|---|
| `developer.webhooks_journal.read` | Read journal entries |
| `developer.webhooks_journal.subscriptions.read` | List journal subscriptions and filters |
| `developer.webhooks_journal.subscriptions.write` | Create/delete journal subscriptions and filters |
| `developer.webhooks_journal.snapshots.read` | Read CRM snapshots |
| `developer.webhooks_journal.snapshots.write` | Create CRM snapshots |

## Other

| Scope | Description | Required tier |
|---|---|---|
| `oauth` | Basic OAuth scope, added to all apps by default | Any |
| `timeline.read` / `timeline.write` | Granular replacements for `timeline` | Any (unverified) |
| `timeline` | **Legacy** — legacy timeline events; still required by app events docs | Any |
| `tickets` | **Legacy** — migrate to `crm.objects.tickets.*` / `crm.schemas.tickets.*` | Any |
| `tickets.sensitive` | **Legacy** — migrate to `crm.objects.tickets.sensitive.*` | Any* |
| `tickets.highly_sensitive` | **Legacy** — migrate to `crm.objects.tickets.highly_sensitive.*` | Any* |
| `forms` | Legacy and v3 forms APIs | Any |
| `forms-uploaded-files` | Legacy v1 uploaded form files API | Any |
| `external_integrations.forms.access` | Rename, delete, clone forms via the WordPress plugin | Any |
| `sales-email-read` | Read and manage one-to-one email engagements | Any |
| `media_bridge.read` | Read media bridge events and objects | Any |
| `media_bridge.write` | Create and update media bridge events and objects | Any |
| `scheduler.meetings.meeting-link.read` | Read meeting link metadata and availability | Professional+ |
| `tax_rates.read` | View configured tax rates | Any |
