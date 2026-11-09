# OAuth for Developer-Platform Apps (2026.09)

This page applies to apps with `auth.type: "oauth"`, distributed as `marketplace`, or `private` with an allowlist of up to 10 accounts. Static-auth apps get their token from the app's **Distribution** tab and need none of this.

> Official docs:
> - [Authentication overview](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/overview)
> - [Working with OAuth](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/oauth/working-with-oauth)
> - [OAuth quickstart](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/oauth/oauth-quickstart-guide)
> - [Manage OAuth tokens (2026-09 API)](https://developers.hubspot.com/docs/api-reference/latest/authentication/manage-oauth-tokens)

You host the OAuth backend. It starts the flow, exchanges codes, and stores and refreshes tokens for each installing account. HubSpot's Node.js sample is [oauth-quickstart-nodejs](https://github.com/hubspot/oauth-quickstart-nodejs).

---

## 1. App config

```json
{
  "uid": "my_app",
  "type": "app",
  "config": {
    "name": "My App",
    "description": "What the app does for the installing account.",
    "distribution": "marketplace",
    "auth": {
      "type": "oauth",
      "redirectUrls": ["https://app.example.com/oauth/hubspot/callback"],
      "requiredScopes": ["crm.objects.contacts.read"],
      "optionalScopes": ["crm.objects.deals.read"],
      "conditionallyRequiredScopes": []
    }
  }
}
```

- `redirectUrls`:
  - must use HTTPS and a domain (not an IP address); `http://localhost` is allowed for testing only;
  - to change them, edit this file and run `hs project upload`;
  - use profile variables (`${REDIRECT_URL}`) to vary them per environment.
- The **client ID** and **client secret** are on the app's **Auth** tab, where you can also **Rotate** the secret. Rotation invalidates the old secret.
- Add `isUserLevel: true` for user-level apps (OAuth only). See the User-Level Access section of `SKILL.md`.

## 2. Authorize (install) URL

Send the installing user to:

```
https://app.hubspot.com/oauth/authorize?client_id=<CLIENT_ID>&redirect_uri=<REDIRECT_URI>&scope=<SCOPES>&optional_scope=<OPTIONAL_SCOPES>&state=<STATE>
```

| Parameter | Required | Notes |
|---|---|---|
| `client_id` | ✅ | From the Auth tab |
| `redirect_uri` | ✅ | Must match one of `redirectUrls` |
| `scope` | ✅ | Space-separated (URL-encoded `%20`), e.g. `oauth%20crm.objects.contacts.read`. Include the app's required scopes; if one is missing, the authorization page shows an error |
| `optional_scope` | ❌ | Space-separated. Dropped automatically if the account lacks access, so check which scopes were granted |
| `state` | ❌ | Returned unchanged on redirect. Use a nonce bound to the user's session and check it on callback (the docs suggest storing per-user state keyed by the nonce) |

- To target one account, use `https://app.hubspot.com/oauth/{accountId}/authorize`.
- On success, the redirect carries `code`. On failure, it carries `error` and `error_description`.

**Install entry points**:
- the listing's Install button URL;
- the **Distribution** tab (allowlisted accounts for private OAuth apps, **Add test install(s)** for test accounts);
- for Marketplace listings, the *Seamless install* option with partner sign-in. Your endpoint then handles an `authorize` step (your login page, a short-lived state token, redirect to `returnUrl`) and a `finalize` step (validate the state, exchange the code, redirect back). It must be frameable by HubSpot. See [Install flow with partner sign-in](https://developers.hubspot.com/docs/apps/developer-platform/list-apps/understand-app-install-flow).

## 3. Exchange the code

The 2026-09 token API takes **form-urlencoded** parameters in the body, so the secret never appears in a URL:

```
POST https://api.hubapi.com/oauth/2026-09/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=<CODE>&redirect_uri=<REDIRECT_URI>&client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>
```

- The response contains `token_type`, `access_token`, `refresh_token`, `hub_id`, `scopes` and `expires_in`.
- The code is single-use and must be exchanged quickly.
- The OAuth guides still show `POST https://api.hubapi.com/oauth/v3/token` with the same body fields. Use the date-based path for new code.

## 4. Store and refresh tokens

- **Store tokens per portal**, keyed by `hub_id`. Keep them server-side and encrypted *(Cashmyrr convention)*.
- Access tokens currently last **30 minutes** (`expires_in: 1800`).
- Refresh with:

  ```
  POST https://api.hubapi.com/oauth/2026-09/token
  Content-Type: application/x-www-form-urlencoded

  grant_type=refresh_token&refresh_token=<REFRESH_TOKEN>&client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>
  ```

  The v3 quickstart also sends `redirect_uri` on refresh.
- Refresh **before** `expires_in` elapses, with a margin, instead of waiting for a `401` *(Cashmyrr convention)*. Certification requires refresh to happen without user involvement.
- The refresh-token lifetime is not stated in the docs.
- Access tokens carry the app's granted scopes, not the authorizing user's permissions. The exception is user-level apps, which are bound to the installing user's permissions.
- **Token metadata**: `POST /oauth/2026-09/token/introspect` with `client_id`, `client_secret`, `token`, and `token_type_hint` (`access_token` or `refresh_token`). It returns `active`, `hub_id`, `user_id`, `app_id`, `scopes`, `expires_in` and more.
- **Revoke**: `POST /oauth/2026-09/token/revoke` with `client_id`, `client_secret`, `token`, `token_type_hint`.
- **Client credentials** (`grant_type=client_credentials`, with `scope`) issue an app-level token with no refresh token. Currently the only use is the webhooks journal API.

## 5. Uninstall

- **Your app removes itself** from an account:

  ```
  DELETE https://api.hubapi.com/appinstalls/2026-09/external-install
  Authorization: Bearer <access token of that account, with the oauth scope>
  ```

  It returns `204`, and the account's admins get an email ([App uninstalls API](https://developers.hubspot.com/docs/api-reference/latest/app-management/app-uninstalls/guide)).
- **When a customer uninstalls**: no uninstall webhook is documented on the pages checked (unverified). Treat a failed refresh, or an introspection result of `active: false`, as "uninstalled": delete that portal's tokens and stop its jobs *(Cashmyrr convention)*.

## 6. Other credentials (when OAuth is not the right tool)

| Credential | Use | Notes |
|---|---|---|
| **Static token** | Private app for one account (`auth.type: "static"`) | Found in the Distribution tab after install. HubSpot recommends rotating it every 6 months. |
| **Service key** | Simple REST-only integrations or quick API tests, created under **Development > Keys > Service keys** | Bearer token with object-specific scopes. Can't authenticate webhooks or UI extensions. Shares the limits of privately distributed apps. An account holds at most **100** project-based apps, service keys and MCP connectors combined. See [Service keys](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/account-service-keys). |
| **Personal access key** | HubSpot CLI and CI (`hs account auth`; GitHub Actions secret) | Never in app code. |
| **Developer API key** | Some app features and settings endpoints (`hapikey` query parameter) | Only one per developer account at a time. |

## 7. MCP connectors (remote HubSpot MCP server)

> Docs: [Integrate AI tools with the HubSpot MCP server](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server)

- **Create**: go to **Development > MCP Connectors** and enter a name, redirect URL(s) and an optional description and icon. The first redirect URL is the default.
- HubSpot generates an OAuth client ID and secret.
- **Scopes**: you don't define them. They follow the tools available at install and the permissions the user grants. If scopes change, users must reinstall.
- **Client requirements**: OAuth **2.1 with PKCE**, a redirect URL matching the connector, and the server URL `https://mcp.hubspot.com`.
- **Tokens**: they expire. Use the refresh token, and rerun authorization if refresh fails.
- **Listing**: an app that mainly connects HubSpot to external generative AI tools must use user-level permissions **or** HubSpot's MCP Server. See [`marketplace-listing.md`](marketplace-listing.md).
