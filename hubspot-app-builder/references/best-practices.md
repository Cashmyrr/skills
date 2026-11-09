# HubSpot App Best Practices

Apply these rules on **every** HubSpot developer-platform project (2026.09). Each rule says what to do, why, and what the mistake looks like. When a rule conflicts with a quick fix, the rule wins.

Sources are the official HubSpot docs linked at the bottom. Items marked *(Cashmyrr convention)* are team conventions, not HubSpot requirements.

---

## 1. Project & versioning

- **Keep the CLI current**: `npm install -g @hubspot/cli@latest` before each session.
  - The docs recommend CLI **8.16.0+**.
  - User-level access needs 8.15.0, and configurable test accounts need 8.3.0+.
  - Check your version with `hs --version`.
- **Create projects on the Current version.** `hs project create` still defaults `--platform-version` to `2026.03`, so pass the version explicitly:

  ```shell
  hs project create --platform-version 2026.09
  ```

  Then check that `hsproject.json` contains `"platformVersion": "2026.09"`. Never start a new project on a Supported or Sunset version.
- **Pin dependency versions** in every `package.json` (cards, pages, settings, functions). With `"latest"`, two builds of the same commit can behave differently.

  ```json
  {
    "dependencies": {
      "@hubspot/ui-extensions": "1.0.1",
      "react": "18.3.1"
    }
  }
  ```

  - ❌ Avoid `"@hubspot/ui-extensions": "latest"`.
  - `@hubspot/ui-extensions` 1.x declares `react` **18.3.1** as an exact peer dependency, so pin exactly that.
  - SDK v1 was released in November 2026 and renamed the CRM hooks (see §5 and [`migrations.md`](migrations.md)). Read the [SDK versioning notes](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/ui-extensions-sdk/versioning) before bumping a major.
- **Commit `package-lock.json`**, plus the files that `hs project lint` generates (ESLint config and devDependencies).
- **One project = one Git repository**, deployed from CI (see [`validation.md`](validation.md)). Never deploy to production from a developer laptop.

## 2. Environments (dev / QA / prod)

- **Use build profiles** instead of hardcoding account-specific values. Profiles need platform version 2025.2+. Create one profile per environment, each pointing to a **different account**:

  ```shell
  hs project profile add dev  --target-account <dev-test-account-id>
  hs project profile add qa   --target-account <qa-test-account-id>
  hs project profile add prod --target-account <prod-account-id>
  ```

  Each command creates `src/hsprofile.<name>.json`:

  ```json
  { "accountId": 1234567, "variables": { "API_BASE_URL": "https://api-qa.example.com" } }
  ```

  - In `*-hsmeta.json` files, reference a variable as `${API_BASE_URL}`. The docs show this in `config.name` and `config.auth.redirectUrls`; other fields are unverified.
  - In UI extensions, read it from `context.variables.API_BASE_URL`.
  - Remove a profile with `hs project profile delete <name>`.
- **Every profile must define every variable** used in the project. Otherwise the CLI returns an error on upload.
- Once a project has profiles, `hs project upload` and `hs project dev` need `-p <profile>` (or `--profile`), and `hs project deploy` needs `--profile <profile>`. The `-p` shorthand isn't documented for `deploy`. Requiring a profile is useful: it makes the target account explicit.
- **Develop and test in developer test accounts**, never in the client's production portal. Create them reproducibly from a config file committed to the repo:

  ```shell
  hs test-account create-config                                  # generates a config file (prompts)
  hs test-account create --config-path ./test-accounts/qa.json
  ```

  Config file (one tier per hub):

  ```json
  {
    "accountName": "ClientMirrorQA",
    "description": "QA account matching the client's tiers",
    "marketingLevel": "PROFESSIONAL",
    "opsLevel": "PROFESSIONAL",
    "serviceLevel": "PROFESSIONAL",
    "salesLevel": "PROFESSIONAL",
    "contentLevel": "PROFESSIONAL"
  }
  ```

  - Set each hub tier to what the client actually has. Testing on an Enterprise trial when the client is on Professional hides missing-feature bugs.
  - The docs show only `PROFESSIONAL` as a value; other tier strings are unverified.
  - Accounts created in the UI default to Enterprise trials unless you choose **Customize my test account**.
- **Seed data** with `hs test-account import-data --account <test-account> --file-path <config>.json`. Run it **from the directory** that holds both the CSV files and the JSON file.
  - The JSON follows the body of the CRM imports API `POST`: `name`, `importOperations` (e.g. `"0-1": "CREATE"`), and `files[]` with `fileName`, `fileFormat` and `fileImportPage.columnMappings`.
  - Custom properties must already exist in the test account.
- **Clean up in the UI.** No CLI delete command is documented: use **Actions > Delete** on the test account. Renew trials with **Actions > Renew trials**.

## 3. Auth, scopes & secrets

- **Least privilege**: request only the scopes the code actually calls. Put "nice to have" scopes in `optionalScopes`, never in `requiredScopes`. Each extra required scope gives an admin a reason to refuse the install and gives Marketplace review a reason to reject.
- **Never put a secret in front-end code** (cards, pages, settings): React code ships to the browser. Secrets live in:
  - serverless function secrets: `hs secret add <NAME>`, declared in `secretKeys`, read with `process.env.NAME`. Only for private, static-auth apps (see §6).
  - your own backend, called through `hubspot.fetch()`.
- **Never commit a token**: no `pat-…`, private-app token, client secret or API key in the repo, in `hsprofile.*.json` variables, or in examples. Profile variables are committed, so they are not secrets.
- **Validate `X-HubSpot-Signature-v3`** on every backend endpoint that receives webhooks or `hubspot.fetch()` calls. See [`signature-validation.md`](signature-validation.md).
- **Use user-level access (2026.09)** when the app acts on behalf of a user and must respect that user's HubSpot permissions.
  - OAuth only.
  - No app cards, serverless functions, webhooks, workflow actions, agent tools, app events or app objects.
  - See the User-Level Access section of `SKILL.md`.
- **OAuth tokens**: access tokens currently expire after **1800 s** (`expires_in`).
  - Refresh **before** expiry based on `expires_in`, instead of waiting for a `401` *(Cashmyrr convention)*.
  - Store tokens per portal, keyed by `hub_id`.
  - See [`oauth.md`](oauth.md).

## 4. Calling HubSpot APIs (rate limits)

Current limits (usage guidelines page):

| App type | Burst limit | Daily limit |
|---|---|---|
| Marketplace (`marketplace`, OAuth) app | 110 requests / 10 s **per installing account** (CRM Search excluded) | — |
| Private app, Free/Starter | 100 / 10 s per app | 250,000 / day per account, shared by all its apps |
| Private app, Professional | 190 / 10 s per app | 625,000 / day per account |
| Private app, Enterprise | 190 / 10 s per app | 1,000,000 / day per account |
| Private app, any tier with **API limit increase** | 250 / 10 s per app | +1,000,000 / day per increase (max two increases) |

Notes on the limits:
- The API limit increase does **not** raise the limits of marketplace OAuth apps.
- Service keys share the limits of privately distributed apps.
- CRM Search, Associations and GraphQL have their **own** limits; see each API's guide.
- Keep error responses **under 5%** of daily requests; Marketplace apps must do so to be certified.
- The certification page also cites 100 requests / 10 s and a success rate above 95%. See [`marketplace-listing.md`](marketplace-listing.md).

Rules:
- **Use batch endpoints** (`/batch/read`, `/batch/create`, `/batch/update`, `/batch/upsert`) instead of loops of single calls.
- **Use webhooks instead of polling** for change detection.
- **Cache** data that doesn't change per request (owners, pipelines, property definitions).
- **Paginate** with the `after` cursor. Never assume one page contains everything.
- **Throttle client-side** to stay under the 10-second burst limit. Read these headers:
  - `X-HubSpot-RateLimit-Max`, `X-HubSpot-RateLimit-Remaining`, `X-HubSpot-RateLimit-Interval-Milliseconds`.
  - The `X-HubSpot-RateLimit-Daily*` headers are **not returned for OAuth requests**.
  - CRM Search responses carry **no** rate-limit headers.
- **On `429`**:
  - The error body names the policy (e.g. `DAILY`). The daily limit resets at midnight in the account's time zone.
  - Treat high-volume `5xx` the same way as `429`.
  - Retry with exponential backoff, jitter and a maximum number of attempts *(Cashmyrr convention — HubSpot does not prescribe an algorithm)*. Never retry immediately in a tight loop.
- **Prefer date-based API versions** (`/YYYY-MM/` paths, introduced March 30, 2026) for new code. Legacy `v1`–`v4` paths remain supported. Certification requires supported versions of the platform and of every endpoint.

## 5. UI extensions (cards, pages, settings)

- **Every data-driven view handles four states**: loading, error, empty, success.
  - `LoadingSpinner` requires `label`.
  - `ErrorState` and `EmptyState` require `children`.
  - Use `Alert` (`title` + `variant`) for non-blocking messages.

  ```tsx
  import { Button, EmptyState, ErrorState, LoadingSpinner, Text } from "@hubspot/ui-extensions";
  import { useRecordPropertiesCurrent } from "@hubspot/ui-extensions/crm";

  // ❌ Avoid — error is ignored, card renders "null"
  const Bad = () => {
    const { properties, isLoading } = useRecordPropertiesCurrent({ properties: ["email"] });
    if (isLoading) return <LoadingSpinner label="Loading" />;
    return <Text>{properties.email}</Text>;
  };

  // ✅ Do
  const Good = () => {
    const { properties, isLoading, error, refetch } = useRecordPropertiesCurrent({ properties: ["email"] });
    if (isLoading) return <LoadingSpinner label="Loading contact…" />;
    if (error) {
      return (
        <ErrorState title="Couldn't load the contact">
          <Text>Try again in a moment.</Text>
          <Button onClick={() => refetch()}>Retry</Button>
        </ErrorState>
      );
    }
    if (!properties.email) {
      return (
        <EmptyState title="No email on this contact">
          <Text>Add an email address to see details here.</Text>
        </EmptyState>
      );
    }
    return <Text>{properties.email}</Text>;
  };
  ```

  `useRecordPropertiesCurrent` returns `{ properties, error, isLoading, isRefetching, refetch }`. Property values are `string | null`.
- **Use the v1 SDK hooks**: `useExtensionApi<'crm.record.tab'>()`, `useRecordPropertiesCurrent`, `useRecordAssociationsCurrent` (`pageSize`) and `useRecordSearch`.
  - Prefer them to the `fetchCrmObjectProperties` action.
  - The v0 names `useCrmProperties` and `useAssociations` are still exported in 1.0.1 but marked deprecated. Migrate them (see [`migrations.md`](migrations.md)).
- **Call hooks at component level**, never inside handlers, loops or conditions.
- **Use `hubspot.fetch()`**, never browser `fetch()`.
  - `body` is a plain object: no `JSON.stringify()`, no manual `Content-Type`.
  - Only the `Authorization` header can be customized. HubSpot strips other headers and doesn't return backend response headers.
  - URLs must be in `permittedUrls.fetch`. Entries match as prefixes and wildcards aren't supported; an unlisted URL fails with `403`.
- **Encode user/CRM data in URLs**: `encodeURIComponent(properties.email)`. Better: send it in the POST body.
- **Respect `hubspot.fetch()` limits**:
  - 20 concurrent requests per app per account; above that you get `429`.
  - Timeout is 15 s by default and can be set up to 120,000 ms.
  - Request and response payloads are each capped at 1 MB.
  - HubSpot retries once on a connection failure or a `5xx` within the timeout.
  - Set an explicit `timeout`. Don't fire one request per row; aggregate on your backend.
  - **Apps that use Sensitive Data scopes can't use `hubspot.fetch()`.**
- **One primary button per surface.**
  - Destructive actions use destructive styling and a confirmation (modal).
  - Use `LoadingButton` (`loading` prop) for async actions to prevent double submission.
- **Use HubSpot components only.** No custom HTML/CSS injection. Keep text short; use `Text variant="microcopy"` for secondary info.
- **Use `logger`** (`logger.info|debug|warn|error`, one string argument) for anything you need to see in production logs. Remove `console.log` debugging before merge.
  - Logs are rate-limited to **1,000 per minute per account**. Past that, logging stops until the page reloads, so don't log in render loops.
  - In local dev, logger output goes only to the browser console.
- **Never display sensitive data** (sensitive-data scopes, payment data, health data) in cards.

## 6. Serverless functions

- **Only privately distributed apps with static auth** (`distribution: "private"`, `auth.type: "static"`) can use serverless functions. OAuth and marketplace apps can't, so use your own backend through `hubspot.fetch()`. They are also unavailable in user-level apps and in apps with Sensitive Data scopes.
- **Plan requirements**:
  - Installing an app with functions needs an Enterprise subscription; developer test accounts work during development.
  - Public endpoint functions (`endpoint` in the config) need **Content Hub Enterprise** and are reachable without authentication. Add your own auth inside them.
- **Execution timeout is 15 s**, and cold starts happen after inactivity. Keep functions small and fast, one responsibility each. Long-running jobs go to your own backend or queue.
- **Async/await only**; no callbacks.
- **Authorize with `context.portalId` and `context.user.userId`**, not the email: email can be absent, and `user` is missing under `hs project dev`.
- **Return a predictable shape** and **never return the raw error object**, which can leak request headers or tokens to the front end *(Cashmyrr convention for the shape)*:

  ```js
  // ❌ Avoid
  // } catch (err) { console.error(err); return err; }

  // ✅ Do
  exports.main = async (context = {}) => {
    try {
      // ... call HubSpot or a third-party API
      return { ok: true, data: [] };
    } catch (err) {
      console.error("getContacts failed", err.code || err.message);
      return { ok: false, error: { message: "Could not load contacts", status: err.code || 500 } };
    }
  };
  ```

## 7. Webhooks

Delivery behaviour, per the [Webhooks API guide](https://developers.hubspot.com/docs/api-reference/latest/webhooks/guide):
- **Retries**: HubSpot retries a notification up to **10 times over 24 hours** when it can't connect, when you take more than **5 s** to respond, or when you return any `4xx`/`5xx`.
- **Batches** hold up to 100 events.
- **Order isn't guaranteed**: use `occurredAt`.
- **Duplicates are possible.**

Rules:
- **Validate the signature first, then respond `2xx` within 5 s** and process asynchronously (queue). A slow handler causes retries, and retries cause duplicates.
- **Make handlers idempotent.** Deduplicate on `eventId` + `subscriptionId` *(Cashmyrr convention — HubSpot says duplicates happen but doesn't prescribe a key)*.
- **Subscribe only to the events you handle**, and only to the properties you need (`propertyChange` on specific properties, not everything).
- `maxConcurrentRequests` must be greater than 5; the default is 10.

## 8. Deploy & rollback

- **Upload to a test/QA profile first**, install there and test, then deploy to prod.
- **Know your rollback before you deploy**:

  ```shell
  hs project list-builds --project <name> --limit 10
  hs project deploy --project <name> --build <id> --profile prod
  ```

  This redeploys a previous good build.
- New projects **auto-deploy** after a successful build.
  - Use `hs project upload --skip-auto-deploy` to build without deploying.
  - Or turn auto-deploy off for prod in the project's **Settings** tab.

## 9. Things to never do

- Hardcode a portal ID, account ID, owner ID, pipeline ID or stage ID. Read them from context, settings or profile variables.
- Develop directly against a client's production portal.
- Request `requiredScopes` "just in case".
- Store or log secrets, tokens, or full CRM payloads containing personal data.
- Ship with `"latest"` dependencies, `console.log` debugging, or TODOs in error paths.
- Declare a task done without going through [`validation.md`](validation.md).

---

## Sources

- [CLI project commands (create, validate, lint, deploy, list-builds)](https://developers.hubspot.com/docs/developer-tooling/local-development/hubspot-cli/project-commands)
- [Build with config profiles](https://developers.hubspot.com/docs/developer-tooling/local-development/build-with-config-profiles)
- [Configurable test accounts](https://developers.hubspot.com/docs/developer-tooling/local-development/configurable-test-accounts)
- [Set up GitHub Actions](https://developers.hubspot.com/docs/developer-tooling/third-party-tools/set-up-github-actions)
- [API usage guidelines and limits](https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines)
- [Developer platform and API versioning](https://developers.hubspot.com/docs/developer-tooling/platform/versioning)
- [Fetching data for UI extensions](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/fetching-data)
- [UI extensions logging](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/ui-extensions-sdk/logging)
- [UI extensions SDK versioning](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/ui-extensions-sdk/versioning)
- [Serverless functions reference](https://developers.hubspot.com/docs/apps/developer-platform/add-features/serverless-functions/reference)
- [Webhooks API guide](https://developers.hubspot.com/docs/api-reference/latest/webhooks/guide)
- [Manage apps in HubSpot (auto-deploy, installs)](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/manage-apps-in-hubspot)
- `@hubspot/ui-extensions@1.0.1` package types (hook return shapes, component props)
