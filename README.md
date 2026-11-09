# Cashmyrr Skills

Open source AI agent skills by [Cashmyrr](https://cashmyrr.com) — modular, self-contained packages that extend agent capabilities with specialized knowledge and workflows.

Skills are loaded automatically based on context. Each skill lives in its own directory and can be used independently.

## What are Skills?

Skills are "onboarding guides" for AI agents — they provide procedural knowledge, domain expertise, and reusable assets for specific tasks. When a relevant task is detected, the skill loads automatically and equips the agent with the right context to handle it.

## Skills

### [`hubspot-app-builder`](./hubspot-app-builder/SKILL.md)

Build full HubSpot apps on the current developer platform (2026.09), with enforced best practices and a validation procedure.

Covers the full lifecycle: project creation via CLI, build profiles and test accounts, app configuration, UI extensions (app cards, app pages, settings, bulk actions) on SDK 1.x, serverless functions, webhooks and the Webhooks Journal, custom workflow actions and agent tools, app events and app objects, OAuth and user-level access, migrations, validation, CI/CD and Marketplace listing.

**Triggers on:** "build a HubSpot app", "create an app card", "build HubSpot app pages", "create a custom workflow action", "set up HubSpot webhooks", "set up OAuth for a HubSpot app", "migrate legacy CRM cards", "validate a HubSpot project", and more.

**Includes:**
- `references/best-practices.md` — rules with wrong/right examples: environments, secrets, scopes, API limits, UI states, functions, webhooks, deploy
- `references/validation.md` — validation procedure and Definition of Done (CLI checks, static checks, scope review, CI template, rollback)
- `references/app-configuration.md` — `hsproject.json` and `app-hsmeta.json` schema, auth types, distribution and install limits
- `references/ui-extensions-sdk.md` — SDK 1.x: hooks, context, actions, logger, 0.x → 1.x migration
- `references/ui-components.md` — every component with props matching the published types
- `references/fetching-data.md` — `hubspot.fetch()` guide, limits, proxy setup
- `references/features.md` — app pages, settings, serverless functions, webhooks, Webhooks Journal, workflow actions, agent tools, app events, app objects, telemetry
- `references/signature-validation.md` — v3 and v2 request signature validation
- `references/scopes.md` — OAuth scopes by category, granular scopes migration
- `references/oauth.md` — OAuth install and token flow, service keys, MCP connectors
- `references/migrations.md` — legacy CRM cards, platform 2026.09, granular scopes, SDK 1.x
- `references/marketplace-listing.md` — listing, agent tool and certification requirements
- `examples/` — working card component, card config and app config templates

---

## Contributing

Skills follow a standard format. Each skill requires a `SKILL.md` with YAML frontmatter (`name`, `description`) and a markdown body. Reference files, examples, and scripts are optional but encouraged for complex domains.

## License

MIT
