# HubSpot Developer Platform — Weekly Version Check

**Date:** 2026-04-15
**Source:** https://developers.hubspot.com/docs/developer-tooling/platform/versioning
**Previous check:** 2026-04-06

---

## Version Status

| Version | Status | Notes |
|---|---|---|
| **2026.03** | **Current (Latest)** | GA since March 30, 2026 — no change since last check |
| 2025.2 | Supported | Released Sept 2, 2025 |
| 2025.1 | Upcoming deprecation | End of support: August 1, 2026 |
| 2023.2 | Sunset | Sunset October 1, 2025 |
| 2023.1 | Sunset | Sunset March 31, 2025 |

## Change Detected

**No change.**

The "Latest"/"Current" platform version is still **2026.03**, matching the version already referenced in the `hubspot-app-builder` skill. No new Latest version has been released since the 2026-04-06 check.

## Changelog entries since last check (2026-04-06 → 2026-04-15)

Scanned the HubSpot developer changelog via web search for the past week. Key items noted:

- **Spring 2026 Spotlight (special edition changelog)** — confirms GA of Developer Platform 2026.03 and date-based versioned APIs. Already reflected in the skill.
- **Expanded UI Extensions support** across App Settings and App Pages (formerly App Homes) — allows testing functions in developer test accounts and sharing code between UI extensions. This is part of the 2026.03 platform release and is already covered in the skill's SKILL.md. No file changes needed.
- **Legacy CRM cards deprecation reminder** — effective immediately, legacy CRM cards are no longer permitted for new app listings, certifications, or recertifications. Must migrate to App Cards by **October 31, 2026**. Skill already references App Cards as the canonical approach.
- **2025.1 deprecation date** — confirmed as August 1, 2026 (previously referenced as June 1, 2026 in the 2026-04-06 report; the current enforced date is August 1, 2026).

No new UI components, scopes, SDK surfaces, or serverless-function APIs introduced this week beyond what the 2026.03 GA already shipped.

## Skill Files Modified

**None.** The skill `hubspot-app-builder` is already aligned with the current Latest version (2026.03). Reference files (`ui-components.md`, `scopes.md`, `ui-extensions-sdk.md`) were refreshed during the 2026-04-06 pass.

One minor inconsistency worth noting for the next pass: the 2026-04-06 report lists 2025.1 deprecation as "June 1, 2026". Current HubSpot communication is **August 1, 2026**. This is a reporting detail, not a skill content issue — the skill itself does not hardcode the 2025.1 deprecation date.

## Verification Notes

- Direct fetching of `developers.hubspot.com` is blocked by the network egress proxy in this session. Verification was done via web search results summarizing the versioning page and recent changelog entries. The signal is consistent across multiple sources that 2026.03 remains the Current/Latest version and that no newer version has been released.
- No beta or announced-but-not-live versions were included in this report, per the task's strict "Latest only" rule.

## Next Execution

Week of 2026-04-22.
