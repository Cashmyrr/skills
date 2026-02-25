# HubSpot App Marketplace Listing Requirements

> Official docs: https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/app-marketplace-listing-requirements

Listings are manually reviewed by the HubSpot Ecosystem Quality team and rejected if these criteria are not met.

---

## Minimum Requirements

| Requirement | Details |
|---|---|
| **OAuth only** | App must use OAuth as its sole authorization method — no API keys or private app tokens |
| **Unique app** | Each listed app must be unique; update an existing listing rather than creating a new one |
| **Single use case** | Apps sharing functionality and APIs must be consolidated into one |
| **Single App ID** | All API requests must use the public app ID + OAuth client ID associated with the listing |
| **Active installs** | At least **3 active, unique installs** from accounts unaffiliated with your organization, showing OAuth-authenticated API activity in the past 30 days |
| **Scopes** | Only request scopes your app actually uses |
| **No classic CRM cards** | Classic CRM cards (deprecated June 16, 2025) are not allowed |
| **AI connectors** | Apps primarily connecting HubSpot to external AI tools must use user-level permissions and HubSpot's MCP Server |
| **Tech Partner Agreement** | Must review and agree to [HubSpot's Technology Partner Program Agreement](https://legal.hubspot.com/technology-program-agreement) |
| **Restricted industries** | App must not exclusively serve [restricted industries](https://legal.hubspot.com/acceptable-use#Restricted-Industries) |

---

## Brand Requirements

- Always capitalize the "S" in "HubSpot"
- Do **not** combine "HubSpot" (or "Hub") with your app name or logo
- Follow [HubSpot Branding Guidelines](https://www.hubspot.com/partners/technology/branding-guidelines) across all assets (docs, landing pages, etc.)
- Do **not** infringe on [HubSpot Trademark Usage Guidelines](https://legal.hubspot.com/tm-usage-guidelines)

---

## Listing Content Requirements

### General Content
- Content must be **specific to the integration**, not general product marketing
- Good examples: [Aircall](https://ecosystem.hubspot.com/marketplace/apps/aircall), [CloudFiles](https://ecosystem.hubspot.com/marketplace/apps/cloudfiles), [Reveal](https://ecosystem.hubspot.com/marketplace/apps/reveal-191193)

### URLs
- All URLs must lead to live, publicly available, functional pages
- Add HubSpot's crawler user agent (*HubSpot Crawler*) to your site's allow list before submitting
- All URL fields have a **250-character limit**
- Required URLs: setup documentation, Install button, support resources, Terms of Service, Privacy Policy

### Setup Documentation
- Must be publicly available and specific to the HubSpot integration
- See [full requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/create-an-app-listing-setup-guide)
- Live example: [OrgChartHub setup guide](https://orgcharthub.com/guides/setup)

### Shared Data Table
- Must accurately reflect the scopes your app requests
- All objects in OAuth scopes must appear in the *Shared data* table
- If requesting both read and write scopes for an object → mark as **bi-directional**

### Pricing
- Must match pricing published on your website exactly
- Only include plans that support the HubSpot integration
- Free plans only for **Free forever** or **Freemium** models

### Support
- At least one support contact method required

---

## App Card Requirements (if using UI Extensions)

### Naming
- Do not use or abbreviate HubSpot brand names in the card name
- Do not use generic names like "App card for HubSpot"
- Do not use "inbound" in ways that tie to HubSpot's INBOUND event

### Logos & Icons
- Do not use the HubSpot logo or sprocket without permission
- Use only your own company/brand logos

### Sensitive Data
- Must not access [sensitive data scopes](https://developers.hubspot.com/docs/reference/api/crm/sensitive-data)
- Must not display sensitive information as defined in [HubSpot's ToS](https://legal.hubspot.com/terms-of-service)

### Security & Privacy
- All requested scopes must be used; remove unused scopes
- Required browser extensions must be listed in the browser's official extension marketplace

### Reliability
- Avoid absolute links for images and JavaScript assets; use relative links or a reputable CDN

### Usability
- Forms must include a submit Button
- Destructive buttons must use destructive styling
- Only one primary button per surface (card, modal, or panel)
- Do not use Tags in place of Buttons or Links
- Avoid underline formatting next to hyperlinks

---

## Submission & Review Process

1. **Only one app** can be under review at a time — additional submissions are auto-rejected
2. Initial review: **10 business days**
3. Full review + feedback cycle: **up to 60 days** from when feedback is shared
4. HubSpot reserves the right to unpublish or refuse publication at any time

### Testing Credentials
Follow [these guidelines](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/testing-credentials) when providing test credentials for your listing review.

---

## Listed Partner Benefits

- Dedicated HubSpot Marketplace listing
- Priority developer support
- Marketing resources (PR templates, launch guides)
- Discounted INBOUND event sponsorship
- Discounted HubSpot for Startups seed-stage program
- Monthly newsletter

---

## Related Resources

- [How to list your app](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/listing-your-app)
- [App certification requirements](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/apply-for-certification/certification-requirements)
- [Create a setup guide](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/listing-your-app/create-an-app-listing-setup-guide)
- [Testing credentials guide](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/testing-credentials)
