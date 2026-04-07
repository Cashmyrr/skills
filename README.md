# Cashmyrr Skills

Open source AI agent skills by [Cashmyrr](https://cashmyrr.com) — modular, self-contained packages that extend agent capabilities with specialized knowledge and workflows.

Skills are loaded automatically based on context. Each skill lives in its own directory and can be used independently.

## What are Skills?

Skills are "onboarding guides" for AI agents — they provide procedural knowledge, domain expertise, and reusable assets for specific tasks. When a relevant task is detected, the skill loads automatically and equips the agent with the right context to handle it.

## Skills

### [`hubspot-app-builder`](./hubspot-app-builder/SKILL.md)

Build full HubSpot apps on the latest developer platform (2026.03).

Covers the entire development lifecycle: project creation via CLI, file structure, app configuration, UI extension cards, SDK hooks, external data fetching, serverless functions, UI components, webhooks, settings pages, app home pages, app events, app objects, and distribution.

**Triggers on:** "build a HubSpot app", "create an app card", "set up HubSpot webhooks", "build a UI extension", "configure HubSpot app", "add serverless functions to HubSpot app", and more.

**Includes:**
- `references/app-configuration.md` — full `app-hsmeta.json` schema, auth types, distribution options
- `references/ui-extensions-sdk.md` — SDK hooks, context, actions, overlays, logger
- `references/ui-components.md` — all UI components with examples (40+ standard, 9 CRM data, 3 CRM action)
- `references/features.md` — home page, settings, app events, app objects, webhooks, serverless functions
- `references/scopes.md` — complete OAuth scopes reference by category
- `references/fetching-data.md` — `hubspot.fetch()` guide, limits, proxy setup, signature validation
- `references/signature-validation.md` — X-HubSpot-Signature-v3 validation for webhooks and fetch endpoints
- `references/marketplace-listing.md` — App Marketplace listing requirements, brand rules, review process
- `examples/` — working card component, card config, and app config templates

---

## Contributing

Skills follow a standard format. Each skill requires a `SKILL.md` with YAML frontmatter (`name`, `description`) and a markdown body. Reference files, examples, and scripts are optional but encouraged for complex domains.

## License

MIT
