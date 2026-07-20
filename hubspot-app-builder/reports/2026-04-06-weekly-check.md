# HubSpot Developer Platform — Weekly Version Check

**Date:** 2026-04-06
**Source:** https://developers.hubspot.com/docs/developer-tooling/platform/versioning
**Previous check:** 2026-03-30

---

## Version Status

| Version | Status | Notes |
|---|---|---|
| **2026.03** | **Current** | Available as of March 30, 2026 |
| 2025.2 | Supported | Released Sept 2, 2025 |
| 2025.1 | Upcoming deprecation | Deprecation announced via changelog (June 1, 2026) |
| 2023.2 | Sunset | Sunset October 1, 2025 |
| 2023.1 | Sunset | Sunset March 31, 2025 |

## Change Detected

**YES — Version change from 2025.2 (Current) → 2026.03 (Current)**

The latest platform version is now **2026.03**, released on March 30, 2026. Previous version 2025.2 has moved to "Supported" status.

## Key Changes in 2026.03

1. **Serverless function support re-introduced** — Full serverless function support for apps built on the developer platform, including apps using static auth. This eliminates the need for external servers.
2. **Serverless function types**: Private functions (internal to app) and public endpoints (Content Hub Enterprise only).
3. **NPM packages supported** in serverless functions.
4. **Enterprise subscription required** for production serverless functions (developer test accounts work without).
5. **HubSpot CLI v8.3.0+** now required (up from v7.6.0+).
6. **Node.js 20+** minimum (carried forward from 2025.1).
7. **Migration is irreversible** — migrating legacy private or public apps to 2026.03 cannot be downgraded.
8. **Environment variables** from old serverless.json files must be re-added as secrets via `hs secret add`.

## URL Changes Detected

Several documentation pages have moved from `/platform/` to new paths:

| Old URL | New URL |
|---|---|
| `/docs/platform/ui-components-overview` | `/docs/apps/developer-platform/add-features/ui-extensions/ui-components/overview` |
| `/docs/platform/ui-extensions-sdk` | `/docs/apps/developer-platform/add-features/ui-extensions/overview` |
| `/docs/platform/scopes` | `/docs/apps/developer-platform/build-apps/authentication/scopes` |
| `/docs/platform/platform-versioning` | `/docs/developer-tooling/platform/versioning` |

## New UI Components Detected

The following components are now listed in the UI components documentation but were not in the skill's reference files:

**Standard components:** `Accordion`, `AutoGrid`, `BarChart`, `ButtonRow`, `CurrencyInput`, `Dropdown`, `EmptyState`, `ErrorState`, `Icon`, `Illustration`, `Inline`, `LineChart`, `List`, `ProgressBar`, `ScoreCircle`, `SearchInput`, `Spacer`, `Statistics`, `StatusTag`, `StepIndicator`, `StepperInput`, `Tabs`, `Tile`, `Toggle`, `ToggleGroup`

**CRM data components:** `CrmAssociationPivot`, `CrmAssociationPropertyList`, `CrmAssociationStageTracker`, `CrmDataHighlight`, `CrmStageTracker`, `CrmStatistics`

**CRM action components:** `CrmActionButton`, `CrmActionLink`, `CrmCardActions` (replacing older `AddNoteAction`, `SendEmailAction`, etc.)

## Skill Files Modified

| File | Change |
|---|---|
| `SKILL.md` | Updated to platform 2026.03: version bump to 1.1.0, updated prerequisites (CLI v8.3.0+, Node.js 20+, Enterprise requirement), added serverless functions section with configuration/patterns/migration guide, updated UI components list with all new components, updated CRM components, added new documentation links |
| `references/ui-components.md` | Added 25+ new standard components (layout, input, feedback, navigation, charts), updated CRM data components (7 new), updated CRM action components to new API (`CrmActionButton`/`CrmActionLink`/`CrmCardActions`), fixed documentation URLs |
| `references/scopes.md` | Updated official docs URL to new path |
| `references/ui-extensions-sdk.md` | Updated official docs URL to new path |

## Next Steps (Manual)

- Consider adding a dedicated `references/serverless-functions.md` with deeper documentation if more details emerge
- Monitor for additional 2026.03-specific component documentation (BarChart, LineChart props, etc.)
- Watch for 2025.1 deprecation enforcement (announced for June 1, 2026)
