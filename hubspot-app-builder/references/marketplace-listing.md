# HubSpot Marketplace Listing & Certification

> Official docs:
> - Listing requirements: https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/app-marketplace-listing-requirements
> - Certification requirements: https://developers.hubspot.com/docs/apps/developer-platform/list-apps/apply-for-certification/certification-requirements
> - Agent tool listing requirements: https://developers.hubspot.com/docs/apps/developer-platform/list-apps/agent-tool-listing-requirements

The HubSpot Ecosystem Quality team reviews listings manually. If a listing field is incomplete or inaccurate, the listing can be set back to **Draft** mode. HubSpot can refuse or unpublish a listing at any time under the Marketplace terms.

---

## Minimum Requirements

| Requirement | Details |
|---|---|
| **OAuth only** | OAuth must be the app's only authorization method (`distribution: "marketplace"`, `auth.type: "oauth"`). |
| **Access** | The listing can't redirect to another app, or depend on another public or private app to work. |
| **Unique app** | Each listed app must be unique. To replace a listed app, update its existing listing instead of creating a new one. |
| **Single use case** | Apps with similar functionality that use the same APIs must be combined into one. |
| **Single App ID** | API requests must authorize with the public app ID and OAuth client ID linked to the listing. |
| **Active installs** | At least **3** active, unique installs in production accounts **unaffiliated** with your organization. Each must show successful app activity in the **past 30 days**. Activity counts OAuth-authenticated API requests and **signed requests** from webhook subscriptions and extensions (e.g. app card data fetches). |
| **Scopes** | Request only the scopes the app uses. Remove unused scopes before install. |
| **Platform version** | Apps on a developer platform version that has been **announced as unsupported** can't be listed. Build new apps on the Current version, `2026.09`. |
| **No classic CRM cards** | Classic (legacy) CRM cards are not allowed. They have been unsupported since **June 16, 2025**, and were sunset and removed from customer views on **November 2, 2026**. The migration UI and migrate API remain available until **December 1, 2026**. See [`migrations.md`](migrations.md). |
| **AI connectors** | An app that mainly connects HubSpot to external generative AI tools must **either** use user-level permissions (`isUserLevel: true`) **or** be built with HubSpot's MCP Server. |
| **Tech Partner Agreement** | You must agree to [HubSpot's Technology Partner Program Agreement](https://legal.hubspot.com/technology-program-agreement). |
| **Restricted industries** | The app can't serve [restricted industries](https://legal.hubspot.com/acceptable-use#Restricted-Industries) exclusively. |

Pre-listing install cap: an unlisted `marketplace` OAuth app can be installed in up to **25** accounts, not counting developer test accounts. There is no cap once the app is listed ([Manage apps in HubSpot](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/manage-apps-in-hubspot)).

---

## App Card Review

> Source: [Create an app card](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/app-cards/create-an-app-card) ("Submitting app cards to the HubSpot Marketplace")

- On Marketplace apps, app cards go through a technical review by the Ecosystem Quality team.
- To request it, submit the [app card review form](https://96it.share.hsforms.com/2a_JwN0iMSDuqoDikVh255Q). It asks for:
  - the **production app ID** (the app to be listed);
  - the **build ID** of the app installed in the test account.
- Initial feedback arrives within **10 business days**.
- Apps that use Sensitive Data scopes can't use `hubspot.fetch()` or serverless functions. If an app needs both, split it into separate apps ([App cards overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/app-cards/overview)).

---

## Brand Requirements

- Always capitalize the "S" in "HubSpot".
- Do **not** combine "HubSpot" or "Hub" with your app name or logo.
- Follow the [HubSpot Branding Guidelines](https://www.hubspot.com/partners/technology/branding-guidelines) across all assets (docs, landing pages, etc.).
- Do **not** infringe the [HubSpot Trademark Usage Guidelines](https://legal.hubspot.com/tm-usage-guidelines).

---

## Listing Content Requirements

### General content
- Content must describe **this integration**, not your product in general.

### URLs
- Every URL must lead to a live, public, working page. HubSpot checks them with its SEO crawler, so have your site allow-list the **HubSpot Crawler** user agent before you submit.
- Every URL field is limited to **250 characters**.
- Required URLs:
  - setup documentation;
  - Install button URL;
  - support resources: support site, community forum, case studies (each must be live, current and public);
  - Terms of Service;
  - Privacy Policy.

### Setup documentation
- Must be public and specific to the HubSpot integration. See the [setup guide requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/create-an-app-listing-setup-guide).

### Shared data table
- Must match the requested scopes. Every object in the OAuth scopes must appear in the table.
- If the app requests both read and write scopes for an object, list that sync as **bi-directional**.

### Pricing
- Must match the pricing published on your website.
- Include only plans that support the integration.
- List a free plan only for **Free forever** or **Freemium** models.

### Support
- At least one support contact method.

---

## Creating and Submitting the Listing

> Source: [Listing your app](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/listing-your-app)

- Only a **Super Admin** can update and submit an app listing.
- Steps:
  1. Go to **Development > App Listings > Create listing**.
  2. Select the app and the primary language.
  3. Complete the seven tabs: *Listing info*, *App details*, *Pricing*, *App features*, *Support info*, *Testing info*, *Review info*.
  4. Run validation, then **Submit for review**.
- Asset limits:
  - icon: **800 × 800 px** (JPG, JPEG or PNG);
  - up to **2** categories;
  - up to **8** screenshots, each with alt text;
  - up to **10** HubSpot features;
  - up to **6** other integrated tools;
  - up to **5** pricing plans.
- For the *Testing info* tab, follow the [testing credentials guidelines](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/testing-credentials).

### Review process
1. Only **one app** can be under review at a time. Any other app submitted during that review is rejected automatically.
2. Initial review: within **10 business days**.
3. The full review and feedback cycle should take no more than **60 days** from when feedback is shared.

---

## App Card Requirements (UI extensions)

### Naming
- Don't modify, imitate or abbreviate HubSpot brand names in the card name.
- Don't pair a generic product name with a HubSpot name.
- Don't use "inbound" in a way that ties the card to HubSpot's INBOUND event.

### Logos & icons
- Don't use the HubSpot logo or sprocket without permission.
- Don't use other companies' logos as icons.

### Sensitive data
- Must not access or request [sensitive data scopes](https://developers.hubspot.com/docs/reference/api/crm/sensitive-data).
- Must not display sensitive information as defined in [HubSpot's ToS](https://legal.hubspot.com/terms-of-service).

### Security & privacy
- Use every requested scope. When only some users need a scope, put it in `conditionallyRequiredScopes` or `optionalScopes`.
- A required browser extension must be listed and approved in the browser's official extension marketplace.

### Reliability
- Use relative links for images and JavaScript, and bundle those assets. Absolute links are allowed only through a reputable CDN.

### Usability & accessibility
- Forms must include a submit button.
- Use the destructive button style only for destructive actions.
- Use only one primary button per surface (card, modal or panel).
- Don't use Tags in place of Buttons or Links.
- Avoid underlined text next to a hyperlink.

---

## Agent Tool Listing Requirements (BETA feature)

Agent tools are **BETA** ([Agents and tools overview](https://developers.hubspot.com/docs/apps/developer-platform/add-features/agent-tools/overview)). These requirements apply on top of the general listing requirements. Certified apps must also meet the certification requirements.

- **Security & privacy**
  - If a tool takes HubSpot property values or metadata as input, the matching `.read` scope must be in `requiredScopes` (e.g. `crm.objects.deals.read`).
  - Collect only the inputs and context the tool needs.
  - No sensitive data scopes.
  - Reviews check LLM-specific risks such as indirect prompt injection and jailbreaks.
- **Compliance:** no "Unacceptable risk" or "High risk" systems or use cases under the EU AI Act.
- **Reliability**
  - `toolType` must be `GET_DATA`, `GENERATE` or `TAKE_ACTION`.
  - `llmConfig.actionDescription` must follow the description best practices.
  - The tool must return its configured outputs on every run and pass the Ecosystem Quality team's acceptance tests.
- **Usability**
  - All names, labels, descriptions, inputs and outputs use natural language.
  - **Name:** starts with a verb and a capital letter, **3–7 words**. No camelCase, no underscores, no mid-name capitals (except proper nouns and acronyms), no agent or use-case names, and no mention of your organization.
  - **Description:** **50–150 characters**, more detailed than the name, present tense.
  - Every input has a label and a description.
- **Value:** front-office use cases (marketing, sales, service). Internal-only tools (e.g. new-hire setup) don't qualify.
- **Submission:** use the [agent tool review form](https://96it.share.hsforms.com/2tUHLydhdTM-mIskDvqP1eg). It asks for:
  - the production app ID;
  - the app ID and build: recommended is the production app with its latest successful build that includes the agent tools; the alternative is the staging app with its latest deployed build;
  - the `uid` of every tool;
  - a testing video of at least **3 minutes**, with audio or text descriptions.
- **Timeline:** initial feedback within **10 business days**. Expect several rounds.
- **Deploys:** on an already-listed app, a build with unapproved agent tools fails to deploy. Agent tools reach the production app only after approval.

Apps with an **MCP server component** have their own [MCP server listing requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/mcp-server-listing-requirements). That component must be submitted as a new standalone app.

---

## Certification

> Sources: [Certification requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/apply-for-certification/certification-requirements) · [Applying for certification](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/apply-for-certification/applying-for-app-certification)

| Requirement | Details |
|---|---|
| **Installs** | At least **60** active, unique installs, unaffiliated with your organization. Test accounts don't count. "Active" means successful activity in the past 30 days. Fall below 60 and you are asked to cancel the request. Fall below 3 and the app may be removed from the Marketplace. |
| **Time listed** | Listed for at least **6 months**. |
| **Versions** | Use a supported version of the developer platform and of every endpoint. Use stable public APIs; latest versions are recommended. Undocumented APIs are not allowed in production. Beta APIs are allowed with caution. |
| **UI** | No classic CRM cards. Supported UI extensions (app cards, custom workflow actions) are preferred over browser extensions. Browser extensions trigger an extra security assessment. |
| **Reliability** | The certification page states a rate limit of **100** requests per 10 s per connected account and an average success rate **above 95%**. The [usage guidelines](https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines) instead give **110**/10 s per installing account and an error-rate cap of **5%**. Stay within the stricter figures. |
| **Security** | OAuth authorization-code flow: users only grant access and never copy codes or tokens. Tokens are requested, stored and refreshed without user involvement. Use all requested scopes. The app must be associated with a **verified domain**. Pass a security best-practices assessment and a **security questionnaire** (encryption, access controls, token lifecycle). |
| **Recertification** | Certification lasts **2 years** on a rolling basis and must then be renewed. You are notified about 90 days before expiry. The page also says "three months" in another place. HubSpot can start recertification earlier if the app falls out of compliance. |
| **Review** | Response within **10 business days**. The full cycle takes no more than **60 days** from when feedback is shared. After a failed review, you can reapply after **6 months**. |

To apply:
1. Go to **Development > App Listings**.
2. On the app, click **More > Certify app**.
3. Enter a YouTube demo URL (video of at least **3 minutes**) and submit.

Only one certification application can be submitted at a time.

---

## Listed Partner Benefits

- Dedicated HubSpot Marketplace listing
- Priority developer support through a dedicated alias
- Developer community resources (webinars, forums)
- Marketing resources (PR templates, launch guides)
- Discounted INBOUND sponsorships, booths and tickets
- Discounted software through the HubSpot for Startups seed-stage program
- Monthly newsletter

---

## Related Resources

- [How to list your app](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/listing-your-app)
- [Create a setup guide](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/create-an-app-listing-setup-guide)
- [Install flow with partner sign-in](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/understand-app-install-flow)
- [Review app performance and feedback](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/measure-app-performance)
- [Testing credentials guide](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/testing-credentials)
- [OAuth for marketplace apps](oauth.md)
