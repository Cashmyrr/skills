# Validating a HubSpot Project (Definition of Done)

Run this procedure **before every upload to a shared account and before declaring any task done**. Run the commands one at a time from the project root and read their output. Don't skip a step because the previous one passed.

This file deliberately contains no executable script: every check is a plain command you can read before running.

---

## Step 1 — HubSpot CLI checks (blocking)

```shell
hs --version                 # 8.16.0 or later recommended
hs project validate          # app-hsmeta.json and project structure are valid and uploadable
hs project lint              # ESLint v9 static analysis of UI extension components
```

- `hs project validate` must exit cleanly. Add `--json` for machine-readable output.
- The first time `hs project lint` runs, it adds a flat ESLint config and the required devDependencies to each project component. It doesn't overwrite an existing v9 config, and it warns about deprecated non-flat config files.
  - Commit the generated files.
  - Fix every error, and justify any remaining warning in the PR.
- For TypeScript components, also run `npx tsc --noEmit` in each component folder that has a `tsconfig.json`.

## Step 2 — Static checks (read the matches, judge each one)

Each command should return **nothing**, or only matches you can justify. The first one is the exception: it should print the platform version, which must be `2026.09`.

```shell
# Platform version is the Current one (expect "2026.09")
grep -n '"platformVersion"' hsproject.json

# No unpinned dependencies ("*" is fine only for local npm-workspace packages)
grep -rn --include=package.json -E '"(latest|next)"' src/ 2>/dev/null

# React pinned to the SDK's exact peer version (expect "react": "18.3.1" in each UI extension package.json)
grep -rn --include=package.json '"react"' src/ 2>/dev/null

# No secrets or tokens committed
grep -rniE 'pat-(na|eu)[0-9]|Bearer [A-Za-z0-9_-]{20,}|client_secret|api[_-]?key["'"'"']?\s*[:=]\s*["'"'"'][A-Za-z0-9]' src/ 2>/dev/null

# No browser fetch() in UI extensions (must be hubspot.fetch)
grep -rnE '(^|[^.a-zA-Z])fetch\(' --include=*.jsx --include=*.tsx --include=*.js --include=*.ts src/app/cards src/app/pages src/app/settings 2>/dev/null

# No JSON.stringify of a hubspot.fetch body (body must be a plain object)
grep -rn -A6 'hubspot.fetch' --include=*.jsx --include=*.tsx src/app 2>/dev/null | grep 'JSON.stringify'

# No deprecated v0 hooks or the legacy properties action (use useRecordPropertiesCurrent / useRecordAssociationsCurrent / useRecordSearch)
grep -rnE '\b(useCrmProperties|useAssociations|useCrmSearch|fetchCrmObjectProperties)\b' --include=*.jsx --include=*.tsx --include=*.js --include=*.ts src/app 2>/dev/null

# No leftover console.log in UI extensions (use logger)
grep -rn 'console.log' --include=*.jsx --include=*.tsx src/app 2>/dev/null

# No raw error returned from serverless functions
grep -rnE 'return (err|error|e);' src/app/functions 2>/dev/null

# Hardcoded HubSpot IDs worth a second look (portal, owner, pipeline, stage)
grep -rnE '(portalId|ownerId|pipeline|dealstage|hs_pipeline_stage)["'"'"']?\s*[:=]\s*["'"'"']?[0-9]{4,}' src/ 2>/dev/null
```

If `src/app/functions` exists, also check that the app is `distribution: "private"` with `auth.type: "static"`. Serverless functions aren't supported for OAuth or marketplace apps.

## Step 3 — Scope review

1. List the scopes in `src/app/app-hsmeta.json`: `requiredScopes`, `optionalScopes`, `conditionallyRequiredScopes`.
2. For each **required** scope, find the code that uses it (API path, hook, webhook subscription, agent tool input). If nothing uses it, move it to `optionalScopes` or remove it.
3. For each API call in the code, check that its scope is declared. A missing scope only shows up at runtime, as a `403`.
4. Check that every external domain called by `hubspot.fetch()` is listed in `permittedUrls.fetch`, and that nothing else is.
5. If the app uses Sensitive Data scopes, it must not use `hubspot.fetch()` or serverless functions.

## Step 4 — Functional test in a test account

```shell
hs project upload -p qa                 # or -p dev; never prod at this stage
hs project dev -p dev                   # interactive testing with hot reload
hs app logs --errors-only --since 1h    # recent errors for the app (add --tail to stream)
```

`hs app logs` also accepts `--type` to filter, e.g. `webhooks`, `api-call`, `serverless-execution`, `crm-extensibility-card`, `extension-log`.

Install the app in the test account, then check **each** card, page, settings view and function:

- [ ] Loading state shows, then content.
- [ ] Error state shows when the backend is down or returns 500. Stop your backend, or point a profile variable at a bad URL.
- [ ] Empty state shows on a record with no data.
- [ ] Works for a user with **restricted** permissions, not only a super admin (mandatory for user-level apps).
- [ ] Works on the account tier the client really has. Set the test account's hub levels to match.
- [ ] Webhooks:
  - the handler rejects an invalid signature and accepts a valid one;
  - it answers `2xx` in under 5 s;
  - it handles the same event twice without side effects.
- [ ] `hs app logs --errors-only` and **Development > Monitoring > Logs** show no unexpected errors.

## Step 5 — Definition of Done checklist

Don't report the work as done until every box is checked, or the exception is written in the PR.

**Project**
- [ ] `platformVersion` is the Current version (2026.09)
- [ ] All dependencies pinned (`@hubspot/ui-extensions` 1.x, `react` 18.3.1), lockfiles committed
- [ ] Build profiles exist for each environment; no account-specific value hardcoded
- [ ] `hs project validate` and `hs project lint` pass

**Security**
- [ ] No secret in the repo, in front-end code or in profile variables
- [ ] Every backend endpoint validates `X-HubSpot-Signature-v3`
- [ ] Required scopes are the minimum actually used
- [ ] `permittedUrls` lists only the domains actually called

**Code quality**
- [ ] Every data view handles loading / error / empty
- [ ] No deprecated v0 hooks
- [ ] Serverless functions (private static-auth apps only) return a sanitized shape on error
- [ ] HubSpot API calls use batch endpoints, pagination and backoff on 429
- [ ] No `console.log`, no unresolved TODO in error paths

**Delivery**
- [ ] Tested in a test account with a restricted user
- [ ] Previous good build ID noted for rollback (`hs project list-builds`)
- [ ] Production deploy goes through CI with the `prod` profile

---

## CI/CD with GitHub Actions

Production deploys should come from CI, not from a laptop. HubSpot publishes official actions; profile support needs **v1.1.0+**. A minimal multi-environment setup uses one workflow per branch, each with its own profile.

`.github/workflows/deploy-qa.yml` (in the **client project repo**, not in this skill):

```yaml
name: Deploy to QA
on:
  push:
    branches: ["develop"]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: HubSpot/hubspot-project-actions/project-upload@v1.1.0
        with:
          profile: "qa"
          account_id: ${{ secrets.HUBSPOT_QA_ACCOUNT_ID }}
          personal_access_key: ${{ secrets.HUBSPOT_QA_PERSONAL_ACCESS_KEY }}
```

Duplicate it for `"main"` → `prod`, with the `HUBSPOT_PROD_ACCOUNT_ID` and `HUBSPOT_PROD_PERSONAL_ACCESS_KEY` secrets.

Rules from the docs:
- **With profiles, pass credentials as `with` inputs** (`account_id`, `personal_access_key`). The `env` approach of the basic setup (`DEFAULT_ACCOUNT_ID`, `DEFAULT_PERSONAL_ACCESS_KEY`) doesn't propagate correctly when profiles are used.
- Each environment's `account_id` secret must match the `accountId` in that profile's `hsprofile.*.json`.
- **Commit the `hsprofile.*.json` files.** The workflow resolves the profile from them at upload time.
- **Quote branch names** (`"main"`). Unquoted values can cause a "no event trigger is defined" error.
- **Pin the CLI version.** The basic setup's `DEFAULT_CLI_VERSION` env takes an exact version (e.g. `"8.16.0"`) instead of `latest` or `next`. Whether `project-upload` with profiles honours it is unverified; check the [hubspot-project-actions repo](https://github.com/HubSpot/hubspot-project-actions).
- Builds triggered from GitHub show the commit message and SHA in **Builds & Deploys**.
- Projects older than 2025.2 that use the built-in GitHub integration must unlink it and migrate first.

Recommended *(Cashmyrr convention)*: add a pull-request job that runs `hs project validate` and `hs project lint`, and protect `main` so it can only be merged when that job passes. Check the repo for a dedicated validate action (unverified).

## Rollback

```shell
hs project list-builds --project <project-name> --limit 10
hs project deploy --project <project-name> --build <previous-good-build-id> --profile prod
```

---

## Sources

- [CLI project commands](https://developers.hubspot.com/docs/developer-tooling/local-development/hubspot-cli/project-commands)
- [Build with config profiles](https://developers.hubspot.com/docs/developer-tooling/local-development/build-with-config-profiles)
- [Set up GitHub Actions](https://developers.hubspot.com/docs/developer-tooling/third-party-tools/set-up-github-actions)
- [Configurable test accounts](https://developers.hubspot.com/docs/developer-tooling/local-development/configurable-test-accounts)
- [Serverless functions reference](https://developers.hubspot.com/docs/apps/developer-platform/add-features/serverless-functions/reference)
- [Webhooks API guide](https://developers.hubspot.com/docs/api-reference/latest/webhooks/guide)
