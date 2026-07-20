# HubSpot Developer Platform — Weekly Version Check

**Date:** 2026-04-24
**Source:** https://developers.hubspot.com/docs/developer-tooling/platform/versioning
**Previous check:** 2026-04-15

---

## Version Status

| Version | Status | Notes |
|---|---|---|
| **2026.03** | **Current (Latest)** | GA since March 30, 2026 — confirmed in Spring 2026 Spotlight (April 14) |
| 2025.2 | Supported | Released Sept 2, 2025. Unsupported March 30, 2027 |
| 2025.1 | Upcoming deprecation | End of support: **August 1, 2026** — builds will fail after this date |
| 2023.2 | Sunset | Sunset October 1, 2025 |
| 2023.1 | Sunset | Sunset March 31, 2024 |

## Change Detected

**No new Latest version.** 2026.03 remains Current.

However, the **Spring 2026 Spotlight** (published April 14, 2026) — which was not fully captured in the April 15 report — contained significant new details that required skill updates. Additionally, the versioning page itself still only lists up to 2025.2 in its version history table (the page has not yet been updated to include the 2026.03 row), but the Spotlight changelog confirms 2026.03 is GA.

## Skill Updates Applied This Week

### 1. **CRITICAL FIX: Serverless functions config format** (SKILL.md)

The skill previously showed the **2025.1-era `serverless.json`** format for serverless functions. The 2026.03 format uses **individual `-hsmeta.json` files per function** in a `src/app/functions/` directory (not `serverless-functions/`). Fixed:
- Directory: `src/app/functions/` (was `serverless-functions/`)
- Config: `myFunction-hsmeta.json` per function (was single `serverless.json`)
- Schema: `{ "uid", "type": "app-function", "config": { "entrypoint", "secretKeys", "endpoint" } }`

### 2. **App Pages (formerly App Homes)** (SKILL.md + features.md)

The Spring 2026 Spotlight introduced **multi-page App Pages** replacing single App Homes:
- New `PageRoutes` and `PageLink` components for navigation
- `PageHeader` component for dedicated header actions
- Added to feature selection: `hs project add` → "Pages"
- Updated file structure, config examples, and React patterns

### 3. **Agent Tools** (SKILL.md + features.md)

New section added for Agent Tools — enhanced custom workflow actions that Breeze Agents can call:
- Built as `workflowAction` type in projects
- Require review before deployment (Marketplace apps)
- Deploys fail if tools haven't passed review

### 4. **Code Sharing with npm Workspaces** (SKILL.md)

New section covering shared code packages across UI extensions:
- `packages/` directory structure
- `hs project install-deps` for shared deps
- Auto-installed on `hs project dev` and `hs project upload`

### 5. **Developer MCP Server GA** (SKILL.md)

Added section for the local Developer MCP Server:
- `hs mcp setup` command
- Requires CLI v8.2.0+
- Tool list and link to documentation

### 6. **Marketplace Listing Requirements Update** (SKILL.md + marketplace-listing.md)

Updated to reflect Spring 2026 Spotlight requirements:
- Must run on supported platform version (2025.2+, 2026.03 recommended)
- Certified apps must use supported date-based API version
- Legacy CRM cards deadline extended to **October 31, 2026**
- Agent tool listing requirements added
- App Card Review Program added (intake form, video walkthrough, 4 quality categories)
- MCP Auth Apps for secure AI connector management

### 7. **Project file structure updated** (SKILL.md)

Updated the canonical project tree to include:
- `packages/` for shared npm workspace packages
- `pages/` instead of relying solely on `home` location
- `functions/` with `-hsmeta.json` per function (replacing old `serverless-functions/`)
- Note on `workflow-actions/` also covering agent tools

## Skill Files Modified

- **`SKILL.md`** — Version bumped to 1.2.0. Fixed serverless config format, added Agent Tools section, Code Sharing section, Developer MCP Server section, updated file structure, updated marketplace requirements, updated App Pages references and doc links.
- **`references/features.md`** — Rewrote App Home Page → App Pages with multi-page navigation. Added Agent Tools subsection under Custom Workflow Actions.
- **`references/marketplace-listing.md`** — Added: supported platform version requirement, App Card Review Program, agent tools review, CRM cards Oct 31 2026 deadline, MCP Auth Apps.

## Other Changelog Items Noted (Not Requiring Skill Changes)

- **Contact Lists API v1 sunset** — April 30, 2026 (must migrate to Lists v3 API). Not directly relevant to app builder skill.
- **Legacy Standard Sandboxes sunset** — April 30, 2026. Not directly relevant.
- **Marketing Event property updates** — Breaking change July 6, 2026 (11 properties become read-only). Not directly relevant.
- **Webhooks Journal API v4 updates** — Batched reads, CRM object filtering, LIST_MEMBERSHIP subscriptionType, snapshot status polling. These are API-level features, not project/app-builder specific. Could be added to a future webhooks reference if needed.
- **Remote HubSpot MCP Server GA** — April 13, 2026. Write access to CRM, read-only access to campaigns/pages/posts. Relevant for MCP Auth Apps (already referenced in skill).
- **Technology Partner Program dashboard** — New in-product tier visibility. Not relevant to app builder skill.
- **App Install Governance Tool** — Super Admin controls for app installs (public beta). Not relevant to app builder skill.

## Next Execution

Week of 2026-05-01.
