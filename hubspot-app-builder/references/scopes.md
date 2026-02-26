# HubSpot Scopes Reference

> Official docs: https://developers.hubspot.com/docs/apps/legacy-apps/authentication/scopes

Only request scopes your app actually uses. All requested scopes must appear in the *Shared data* table of your Marketplace listing. Use granular scopes (e.g. `crm.objects.contacts.read`) over broad ones when both are available.

---

## CRM Objects

| Scope | Description | Required tier |
|---|---|---|
| `crm.objects.contacts.read` | View contacts | Any |
| `crm.objects.contacts.write` | Create, delete, update contacts | Any |
| `crm.objects.contacts.sensitive.read` | View sensitive properties for contacts | Enterprise |
| `crm.objects.contacts.sensitive.write` | Edit sensitive properties for contacts | Enterprise |
| `crm.objects.contacts.highly_sensitive.read` | View highly sensitive properties for contacts | Enterprise |
| `crm.objects.contacts.highly_sensitive.write` | Edit highly sensitive properties for contacts | Enterprise |
| `crm.objects.companies.read` | View companies | Any |
| `crm.objects.companies.write` | Create, delete, update companies | Any |
| `crm.objects.companies.sensitive.read` | View sensitive properties for companies | Enterprise |
| `crm.objects.companies.sensitive.write` | Edit sensitive properties for companies | Enterprise |
| `crm.objects.companies.highly_sensitive.read` | View highly sensitive properties for companies | Enterprise |
| `crm.objects.companies.highly_sensitive.write` | Edit highly sensitive properties for companies | Enterprise |
| `crm.objects.deals.read` | View deals | Any |
| `crm.objects.deals.write` | Create, delete, update deals | Any |
| `crm.objects.deals.sensitive.read` | View sensitive properties for deals | Enterprise |
| `crm.objects.deals.sensitive.write` | Edit sensitive properties for deals | Enterprise |
| `crm.objects.deals.highly_sensitive.read` | View highly sensitive properties for deals | Enterprise |
| `crm.objects.deals.highly_sensitive.write` | Edit highly sensitive properties for deals | Enterprise |
| `crm.objects.quotes.read` | View quotes and quote templates | Any |
| `crm.objects.quotes.write` | Create, delete, update quotes | Any |
| `crm.objects.line_items.read` | View line items | Any |
| `crm.objects.line_items.write` | Create, delete, update line items | Any |
| `crm.objects.invoices.read` | View invoices | Any |
| `crm.objects.orders.read` | View orders | Any |
| `crm.objects.orders.write` | Create, delete, update orders | Any |
| `crm.objects.carts.read` | View carts | Any |
| `crm.objects.carts.write` | Create, delete, update carts | Any |
| `crm.objects.subscriptions.read` | View commerce subscriptions | Any |
| `crm.objects.commercepayments.read` | View commerce payments | Starter+ |
| `crm.objects.custom.read` | View custom objects | Enterprise |
| `crm.objects.custom.write` | Create, delete, update custom objects | Enterprise |
| `crm.objects.custom.sensitive.read` | View sensitive properties for custom objects | Enterprise |
| `crm.objects.custom.sensitive.write` | Edit sensitive properties for custom objects | Enterprise |
| `crm.objects.custom.highly_sensitive.read` | View highly sensitive properties for custom objects | Enterprise |
| `crm.objects.custom.highly_sensitive.write` | Edit highly sensitive properties for custom objects | Enterprise |
| `crm.objects.owners.read` | View users assigned to a CRM record | Any |
| `crm.objects.leads.read` | View leads | Sales Hub Professional+ |
| `crm.objects.leads.write` | Create, delete, update leads | Sales Hub Professional+ |
| `crm.objects.goals.read` | View all goal types | Sales Hub Starter+ |
| `crm.objects.feedback_submission.read` | View feedback survey submissions | Service Hub Professional+ |
| `crm.objects.marketing_events.read` | View marketing events | Any |
| `crm.objects.marketing_events.write` | Create, delete, update marketing events | Any |
| `crm.objects.appointments.read` | View appointments | Any |
| `crm.objects.appointments.write` | Create, delete, update appointments | Any |
| `crm.objects.appointments.sensitive.read` | View sensitive properties for appointments | Enterprise |
| `crm.objects.appointments.sensitive.write` | Edit sensitive properties for appointments | Enterprise |
| `crm.objects.courses.read` | View courses | Any |
| `crm.objects.courses.write` | Create, delete, update courses | Any |
| `crm.objects.listings.read` | View listings | Any |
| `crm.objects.listings.write` | Create, delete, update listings | Any |
| `crm.objects.services.read` | View services | Any |
| `crm.objects.services.write` | Create, delete, update services | Any |
| `crm.objects.projects.read` | View projects | Professional+ |
| `crm.objects.projects.write` | Create, delete, update projects | Professional+ |
| `crm.objects.projects.sensitive.read` | View sensitive properties for projects | Enterprise |
| `crm.objects.projects.sensitive.write` | Edit sensitive properties for projects | Enterprise |
| `crm.objects.projects.highly_sensitive.read` | View highly sensitive properties for projects | Enterprise |
| `crm.objects.projects.highly_sensitive.write` | Edit highly sensitive properties for projects | Enterprise |
| `crm.objects.users.read` | View users | Any |
| `crm.objects.users.write` | Create, delete, update users | Any |
| `crm.objects.partner-clients.read` | View partner client objects | Any |
| `crm.objects.partner-clients.write` | Create, delete, update partner client objects | Any |
| `crm.objects.partner-services.read` | View partner service objects | Any |
| `crm.objects.partner-services.write` | Create, delete, update partner service objects | Any |
| `crm.dealsplits.read_write` | Create or retrieve deal splits | Sales Hub Enterprise |

## CRM Schemas (Property Settings)

| Scope | Description | Required tier |
|---|---|---|
| `crm.schemas.contacts.read` | View property settings for contacts | Any |
| `crm.schemas.contacts.write` | Manage property settings for contacts | Any |
| `crm.schemas.companies.read` | View property settings for companies | Any |
| `crm.schemas.companies.write` | Manage property settings for companies | Any |
| `crm.schemas.deals.read` | View property settings for deals | Any |
| `crm.schemas.deals.write` | Manage property settings for deals | Any |
| `crm.schemas.quotes.read` | View property settings for quotes | Any |
| `crm.schemas.line_items.read` | View property settings for line items | Any |
| `crm.schemas.invoices.read` | View property settings for invoices | Any |
| `crm.schemas.invoices.write` | Manage property settings for invoices | Any |
| `crm.schemas.orders.read` | View property settings for orders | Any |
| `crm.schemas.orders.write` | Manage property settings for orders | Any |
| `crm.schemas.carts.read` | View property settings for carts | Any |
| `crm.schemas.carts.write` | Manage property settings for carts | Any |
| `crm.schemas.subscriptions.read` | View property settings for commerce subscriptions | Any |
| `crm.schemas.subscriptions.write` | Manage property settings for commerce subscriptions | Any |
| `crm.schemas.commercepayments.read` | View property settings for commerce payments | Starter+ |
| `crm.schemas.custom.read` | View custom object definitions | Enterprise |
| `crm.schemas.appointments.read` | View property settings for appointments | Any |
| `crm.schemas.appointments.write` | Manage property settings for appointments | Any |
| `crm.schemas.courses.read` | View property settings for courses | Any |
| `crm.schemas.courses.write` | Manage property settings for courses | Any |
| `crm.schemas.listings.read` | View property settings for listings | Any |
| `crm.schemas.listings.write` | Manage property settings for listings | Any |
| `crm.schemas.services.read` | View property settings for services | Any |
| `crm.schemas.services.write` | Manage property settings for services | Any |
| `crm.schemas.projects.read` | View property settings for projects | Professional+ |
| `crm.schemas.projects.write` | Manage property settings for projects | Professional+ |

## CRM Lists & Pipelines

| Scope | Description | Required tier |
|---|---|---|
| `crm.lists.read` | View contact lists | Any |
| `crm.lists.write` | Create, delete, update contact lists | Any |
| `crm.pipelines.orders.read` | View order pipelines | Any |
| `crm.pipelines.orders.write` | Create, delete, update order pipelines | Any |
| `crm.export` | Export records from CRM | Any |
| `crm.import` | Import records into CRM | Any |

## CMS

| Scope | Description | Required tier |
|---|---|---|
| `cms.domains.read` | List connected domains | Any |
| `cms.domains.write` | Create, update, delete connected domains | Any |
| `cms.functions.read` | View serverless functions and secrets | Content Hub Enterprise |
| `cms.functions.write` | Write serverless functions and secrets | Content Hub Enterprise |
| `cms.knowledge_base.articles.read` | View knowledge base articles | Service Hub Professional+ |
| `cms.knowledge_base.articles.write` | Update knowledge base articles | Service Hub Professional+ |
| `cms.knowledge_base.articles.publish` | Update and publish knowledge base articles | Service Hub Professional+ |
| `cms.knowledge_base.settings.read` | View knowledge base settings | Service Hub Professional+ |
| `cms.knowledge_base.settings.write` | Update knowledge base settings | Service Hub Professional+ |
| `cms.membership.access_groups.read` | View membership access groups | Service Hub or Content Hub Professional+ |
| `cms.membership.access_groups.write` | Create, edit, delete membership access groups | Service Hub or Content Hub Professional+ |
| `content` | Access sites, landing pages, email, blog, and campaigns | CMS Hub or Marketing Hub Professional+ |
| `hubdb` | Access HubDB | CMS Hub or Marketing Hub Professional+ |
| `collector.graphql_schema.read` | GraphQL schema introspection | CMS Hub Professional+ |
| `collector.graphql_query.execute` | Execute GraphQL queries | CMS Hub Professional+ |
| `ctas.read` | Read CTAs | Marketing Hub or CMS Hub Starter+ |

## Settings & Users

| Scope | Description | Required tier |
|---|---|---|
| `settings.users.read` | View account users and permissions | Any |
| `settings.users.write` | Manage users and permissions | Any |
| `settings.users.teams.read` | View account teams | Any |
| `settings.users.team.write` | Assign users to teams | Any |
| `settings.billing.write` | Manage billing and paid seats | Any |
| `settings.currencies.read` | Read exchange rates and company currency | Any |
| `settings.currencies.write` | Create, update, delete exchange rates | Any |
| `account-info.security.read` | Access account activity logs and security info | Any |

## Marketing & Automation

| Scope | Description | Required tier |
|---|---|---|
| `automation` | Access workflows | Marketing Hub Professional+ |
| `automation.sequences.read` | View sequences | Sales Hub or Service Hub Professional+ |
| `automation.sequences.enrollments.write` | Enroll contacts in sequences | Sales Hub or Service Hub Professional+ |
| `marketing.campaigns.read` | View marketing campaigns | Marketing Hub Professional+ |
| `marketing.campaigns.write` | Create, update, delete marketing campaigns | Marketing Hub Professional+ |
| `marketing.campaigns.revenue.read` | View revenue attributed to campaigns | Marketing Hub Professional+ |
| `marketing-email` | Send marketing emails via single-send API | Marketing Hub Enterprise or transactional add-on |
| `transactional-email` | Access transactional email endpoints | Marketing Hub Professional+ with add-on |
| `analytics.behavioral_events.send` | Send custom behavioral events | Marketing Hub Enterprise |
| `behavioral_events.event_definitions.read_write` | Create, read, update, delete behavioral events | Marketing Hub Enterprise |
| `communication_preferences.read` | View contact subscription preferences | Any |
| `communication_preferences.write` | Subscribe/unsubscribe contacts | Any |
| `communication_preferences.read_write` | Subscribe/unsubscribe contacts | Any |
| `communication_preferences.statuses.batch.read` | Batch retrieve contacts by subscription status | Marketing Hub Enterprise |
| `communication_preferences.statuses.batch.write` | Batch update subscription status | Marketing Hub Enterprise |
| `social` | Access Social Inbox | Marketing Hub Professional+ |
| `business-intelligence` | Access analytics sources and email analytics | Any |
| `business_units.view.read` | View brand data and logo info | Brands Add-on |

## Conversations & Tickets

| Scope | Description | Required tier |
|---|---|---|
| `conversations.read` | View conversation inbox threads | Any |
| `conversations.write` | Send messages, create and update threads | Any |
| `conversations.visitor_identification.tokens.create` | Fetch identification tokens for chat visitors | Professional+ |
| `conversations.custom_channels.read` | View custom channels for inboxes | Sales Hub or Service Hub Enterprise |
| `conversations.custom_channels.write` | Manage custom channels for inboxes | Sales Hub or Service Hub Enterprise |
| `tickets` | Access tickets (required for `helpdesk.sidebar` cards) | Any |
| `tickets.sensitive` | View and edit sensitive ticket properties | Enterprise |
| `tickets.highly_sensitive` | View and edit highly sensitive ticket properties | Enterprise |

## Other

| Scope | Description | Required tier |
|---|---|---|
| `oauth` | Basic OAuth scope, added by default to all public apps | Any |
| `timeline` | Manage custom timeline events on CRM records | Any |
| `actions` | Add custom forms to contact pages | Any |
| `accounting` | Share invoice, product, and contact data with accounting integrations | Any |
| `files` | Access File Manager | Any |
| `files.ui_hidden.read` | View or download user files, attachments, and system files | Any |
| `forms` | Access Forms endpoints | Any |
| `forms-uploaded-files` | Download files submitted through forms | Any |
| `external_integrations.forms.access` | Rename, delete, clone existing forms | Any |
| `e-commerce` | Access e-commerce features, products, and line items | Any (Products API: Professional+) |
| `integration-sync` | Sync CRM objects via Ecommerce Bridge API | Any |
| `sales-email-read` | Read one-to-one emails sent to contacts | Any |
| `media_bridge.read` | View events and objects from media bridge | Any |
| `media_bridge.write` | Create and update media bridge events and objects | Any |
| `scheduler.meetings.meeting-link.read` | Read meeting link metadata and availability | Professional+ |
| `tax_rates.read` | View tax rates configured in account | Any |
