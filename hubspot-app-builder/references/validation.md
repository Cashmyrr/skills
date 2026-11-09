# Validating a HubSpot Project (Definition of Done)

Run this procedure **before every upload to a shared account and before declaring any task done**. Run the commands one by one from the project root and read their output; do not skip a step because the previous one passed.

This file deliberately contains no executable script: every check is a plain command you can read before running.

---

## Step 1 — HubSpot CLI checks (blocking)

```shell
hs --version                 # CLI must be 8.x or later
hs project validate          # app-hsmeta.json and project structure are valid and uploadable
hs project lint              # ESLint v9 static analysis of cards and settings pages
```

- `hs project validate` must exit cleanly. Add `--json` to get machine-readable output.
- `hs project lint` adds the required devDependencies and a flat ESLint config to each UI component the first time it runs (it doesn't overwrite an existing v9 config). Commit those files. Fix every error; justify any remaining warning in the PR.
- For TypeScript components, also run `npx tsc --noEmit` in each component folder that has a `tsconfig.json`.

## Step 2 — Static checks (read the matches, judge each one)

Each command should return **nothing**, or only matches you can justify.

```shell
# Platform version is the Current one
grep -n '"platformVersion"' hsproject.json

# No unpinned dependencies
grep -rn --include=package.json '"latest"' src/ packages/ 2>/dev/null

# No secrets or tokens committed
grep -rniE 'pat-(na|eu)[0-9]|Bearer [A-Za-z0-9_-]{20,}|client_secret|api[_-]?key["'"'"']?\s*[:=]\s*["'"'"'][A-Za-z0-9]' src/ packages/ 2>/dev/null

# No browser fetch() in UI extensions (must be hubspot.fetch)
grep -rnE '(^|[^.a-zA-Z])fetch\(' --include=*.jsx --include=*.tsx --include=*.js --include=*.ts src/app/cards src/app/pages src/app/settings 2>/dev/null

# No JSON.stringify of a hubspot.fetch body (body must be a plain object)
grep -rn -A6 'hubspot.fetch' --include=*.jsx --include=*.tsx src/app 2>/dev/null | grep 'JSON.stringify'

# No leftover console.log in UI extensions (use logger)
grep -rn 'console.log' --include=*.jsx --include=*.tsx src/app 2>/dev/null

# No raw error returned from serverless functions
grep -rnE 'return (err|error|e);' src/app/functions 2>/dev/null

# Hardcoded HubSpot IDs worth a second look (portal, owner, pipeline, stage)
grep -rnE '(portalId|ownerId|pipeline|dealstage|hs_pipeline_stage)["'"'"']?\s*[:=]\s*["'"'"']?[0-9]{4,}' src/ 2>/dev/null
```

## Step 3 — Scope review

1. List the scopes in `src/app/app-hsmeta.json` (`requiredScopes`, `optionalScopes`, `conditionallyRequiredScopes`).
2. For each **required** scope, find the code that uses it (API path, hook, webhook subscription). No usage → move it to `optionalScopes` or remove it.
3. For each API call in the code, check its scope is declared — a missing scope only shows up at runtime as a `403`.
4. Check every external domain called by `hubspot.fetch()` is listed in `permittedUrls.fetch`, and nothing else is.

## Step 4 — Functional test in a test account

```shell
hs project upload -p qa          # or -p dev; never prod at this stage
hs project dev -p dev            # for interactive testing with hot reload
```

Install the app in the test account, then for **each** card / page / settings view / function:

- [ ] Loading state shows, then content.
- [ ] Error state shows when the backend is down or returns 500 (stop your backend or point a profile variable to a bad URL).
- [ ] Empty state shows on a record with no data.
- [ ] Works with a user who has **restricted** permissions, not only a super admin (mandatory for user-level apps).
- [ ] Works on the account tier the client really has (configure the test account hub levels accordingly).
- [ ] Webhooks: the handler rejects an invalid signature, accepts a valid one, and handles the same event twice without side effects.
- [ ] Logs in **Development > Monitoring > Logs** show no unexpected errors.

## Step 5 — Definition of Done checklist

Do not report the work as done until every box is checked (or the exception is written in the PR).

**Project**
- [ ] `platformVersion` is the Current version (2026.09)
- [ ] All dependencies pinned, lockfiles committed
- [ ] Build profiles exist for each environment; no account-specific value hardcoded
- [ ] `hs project validate` and `hs project lint` pass

**Security**
- [ ] No secret in the repo, in front-end code or in profile variables
- [ ] Every backend endpoint validates `X-HubSpot-Signature-v3`
- [ ] Required scopes are the minimum actually used
- [ ] `permittedUrls` lists only the domains actually called

**Code quality**
- [ ] Every data view handles loading / error / empty
- [ ] Serverless functions return a sanitized shape on error
- [ ] HubSpot API calls use batch endpoints, pagination and backoff on 429
- [ ] No `console.log`, no unresolved TODO in error paths

**Delivery**
- [ ] Tested in a test account with a restricted user
- [ ] Previous good build ID noted for rollback (`hs project list-builds`)
- [ ] Production deploy goes through CI with the `prod` profile

---

## CI/CD with GitHub Actions

Production deploys should come from CI, not from a laptop. HubSpot publishes official actions. Minimal multi-environment setup: one workflow per branch, each with its profile.

`.github/workflows/deploy-qa.yml` (in the **client project repo**, not in this skill):

```yaml
name: Deploy to QA
on:
  push:
    branches: [develop]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: HubSpot/hubspot-project-actions/project-upload@v1.1.0
        with:
          profile: qa
          account_id: ${{ secrets.HUBSPOT_QA_ACCOUNT_ID }}
          personal_access_key: ${{ secrets.HUBSPOT_QA_PERSONAL_ACCESS_KEY }}
```

Duplicate it for `main` → `prod` with `HUBSPOT_PROD_*` secrets. Rules from the docs:
- The `account_id` secret must match the `accountId` in the profile file.
- `env` values don't propagate when using profiles — put configuration in profile variables.
- Builds triggered from GitHub show the commit message and SHA in **Builds & Deploys**.

Recommended *(Cashmyrr convention)*: add a job that runs `hs project validate` and `hs project lint` on every pull request, and protect `main` so it can only be merged when that job passes.

## Rollback

```shell
hs project list-builds --project <project-name> --limit 10
hs project deploy --build <previous-good-build-id> -p prod
```

---

## Sources

- [CLI project commands](https://developers.hubspot.com/docs/developer-tooling/local-development/hubspot-cli/project-commands)
- [Build with config profiles](https://developers.hubspot.com/docs/developer-tooling/local-development/build-with-config-profiles)
- [Set up GitHub Actions](https://developers.hubspot.com/docs/developer-tooling/third-party-tools/set-up-github-actions)
- [Configurable test accounts](https://developers.hubspot.com/docs/developer-tooling/local-development/configurable-test-accounts)
