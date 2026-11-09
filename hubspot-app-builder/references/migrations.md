# Migrations

How to migrate legacy CRM cards, older apps, legacy scopes and v0 UI extension code to the 2026.09 developer platform.

---

## 1. Legacy (classic) CRM cards → app cards

> Docs: [Migrate a legacy CRM card to an app card](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/migrate-an-app/migrate-legacy-crm-cards-to-app-cards)

**Dates**

| Date | What happens |
|---|---|
| June 16, 2025 | Classic CRM cards stop being supported. They are not allowed in new listings, certifications or recertifications. |
| **November 2, 2026** | Legacy CRM cards are sunset and **removed from customer views**. |
| **December 1, 2026** | The migration UI and migrate API are discontinued. Views can no longer be moved to the new card after this date. |

**Steps**
1. **Prerequisites**:
   - latest HubSpot CLI;
   - the app on the projects framework (the docs require 2025.2+; use `2026.09`, see §2);
   - ideally a [configurable test account](https://developers.hubspot.com/docs/developer-tooling/local-development/configurable-test-accounts) for isolated testing.
2. **Build the replacement app card**, from scratch or from HubSpot's *Legacy CRM Card Converter* sample, to match the legacy card closely.
   - If the legacy card supports **tickets**, also build a **second app card** for `helpdesk.sidebar` with a **different title**. Migration needs both app card IDs.
3. **Add the card to the same app.** Copy it into the `src/app/cards/` folder of the app that owns the legacy card, then run `hs project upload`.
4. **Verify**: add the app card to views in installs that have the required scopes.
5. **Feature flags**:
   - If the app is listed on the Marketplace, delete the `hs-release-app-cards` flag **before** migrating.
   - If you used `hs-hide-crm-cards`, delete it too.
6. **Migrate the views**, either with the **Review & migrate** banner in the projects UI or with the migrate views API.
   - To merge several legacy cards into one app card, tick the confirmation checkbox in the UI, or set `allowDuplicateAppCardIds: true` in the API.
   - ⚠️ **Migration can't be stopped or reversed once started.** Test first.
7. **Delete the legacy card** (UI or API) when migration completes. Otherwise it is removed at deprecation.

---

## 2. Migrating an app to platform 2026.09

> Docs: [Migrate an existing app to 2026.09](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/migrate-an-app/migrate-to-the-latest-platform-version)

The migration page recommends CLI **8.4.0+**. This skill recommends **8.16.0+** (8.15.0 is the minimum for user-level access).

| Current state | Path |
|---|---|
| Project on **2025.2** (or 2026.03) | Set `"platformVersion": "2026.09"` in `hsproject.json`, then `hs project upload`. The page lists 2025.2; 2026.03 isn't listed separately, but 2026.09 includes all 2026.03 functionality. |
| Project on **2025.1, 2023.2, 2023.1**, or project-based apps that predate versioning | Run `hs project migrate` in the project directory and follow the prompts. |
| **Legacy public app** (not project-based) | Run `hs app migrate` from the directory where you keep projects. Choose the app, confirm its components, then give a project name, local path and UIDs. Auth credentials, features and installs are preserved. |
| **Legacy private app** (not project-based) | **Not supported** for 2026.09. |

After migrating:
- **Build #1** of a migrated public app is a baseline of its pre-migration config. Redeploy it to revert later changes. The page doesn't say whether the migration itself can be undone; treat it as one-way.
- Features that live in project source files must be **managed locally through the project**. They can no longer be edited in the app management UI or through the previous developer APIs. Features not in source files keep their existing APIs.
- `environment` values from an old `serverless.json` are **not** migrated. Re-add them with `hs secret add <NAME>` and declare them in the function's `secretKeys`.
  - Serverless functions on 2026.09 work only in private static-auth apps.
- An account-level app **can't be converted** to user-level access. Create a new app with `isUserLevel: true`.
- Unsupported versions (18 months after GA) fail on upload. Check the [versioning page](https://developers.hubspot.com/docs/developer-tooling/platform/versioning) for current statuses.

---

## 3. Granular scopes

> Docs: [Update your app to use granular scopes](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/migrate-an-app/update-your-app-to-granular-scopes) · scope list: [`scopes.md`](scopes.md)

- Introduced on September 8, 2026. Broad legacy scopes are replaced by narrower ones: separate read and write scopes, and per-object access, which is **BETA**.
- Affected legacy scopes: **`hubdb`, `tickets`, `timeline`, `files`**.
- Each app shows an **Auto rollout** date. After that date, HubSpot applies the update itself if you haven't.
- Steps:
  1. Go to **Development > Migrations**, review the affected apps and click **Start**.
  2. Pick **Use recommended** or a custom scope set, then apply.
  3. For project apps, copy the new `app-hsmeta.json` into the project and deploy (`hs project upload`, or `hs project deploy --profile <name>` when using profiles), then click **Finish**.
  4. Keep backward compatibility on until your code uses the granular scope names.

---

## 4. UI extensions SDK 0.x → 1.x

> Docs: [UI extensions SDK versioning](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/ui-extensions-sdk/versioning) · details: [`ui-extensions-sdk.md`](ui-extensions-sdk.md)

v1 was released in November 2026. Support windows: v0 until March 2028, v1 until April 2028. Pin `"@hubspot/ui-extensions": "1.0.1"` and `"react": "18.3.1"` (the exact peer version).

| v0 | v1 |
|---|---|
| `useCrmProperties([...], options)` | `useRecordPropertiesCurrent({ properties: [...], format })` |
| `useAssociations({ ..., pageLength }, options)` | `useRecordAssociationsCurrent({ toObjectType, properties, pageSize, format })` |
| `useCrmSearch` | `useRecordSearch` |
| formatting options as a second argument | `format` key in the config object |
| `reactions` argument to open panels/modals | `overlay` prop (`Reactions`, `PanelAction`, `ModalAction`, `ReactionsHandler` types removed) |
| `Dropdown` `options` prop | `Dropdown.ButtonItem` children |
| `Flex direction="column"` for vertical layout | `Stack` (keep `Flex` for horizontal) |
| `readonly`, `size="default"`, `valueMax` | `readOnly`, `size="medium"`, `maxValue` (full table in the docs) |

- In 1.0.1 the v0 hook names are still exported but marked `@deprecated`.
- Find them with: `grep -rnE '\b(useCrmProperties|useAssociations|useCrmSearch)\b' src/`.
