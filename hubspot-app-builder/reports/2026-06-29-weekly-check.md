# HubSpot Developer Platform — Weekly Version Check

**Date:** 2026-06-29
**Source de vérité:** https://developers.hubspot.com/docs/developer-tooling/platform/versioning
**Previous check:** 2026-06-01

---

## Version Status (selon la page de versioning officielle)

| Version | Released | Statut sur la page | Note |
|---|---|---|---|
| **2026.03** | March 30, 2026 | **Current** — « the latest version of the developer platform » | Tag `success`. Section « Changes in 2026.03 » présente. |
| 2025.2 | September 2, 2025 | Supported | Min. Node.js relevé à v22 ; framework build-and-deploy file-based |
| 2025.1 | April 1, 2025 | Upcoming deprecation | Fin de support : 1er août 2026 |
| 2023.2 | November 21, 2023 | Sunset | Sunset depuis le 1er octobre 2025 |
| 2023.1 | August 2023 | Sunset | Indisponible depuis le 31 mars 2024 |

> La page officielle utilise désormais la taxonomie **Current → Supported → Unsupported** (cycle de support de 18 mois). « Current » désigne la version GA la plus récente, c.-à-d. l'équivalent de « Latest ». La ligne `2026.03` est bien présente dans le tableau « Platform version history », taguée **Current**, et le texte de la page la qualifie explicitement de « the latest version of the developer platform ». `2026.03` est **GA (live)**, pas beta ni simplement annoncée — la règle critique « ignorer les versions non-Latest » ne s'applique donc pas à elle.

## Change Detected

**OUI — correction de référence.** La version Current/Latest officielle est **2026.03** (GA depuis le 30 mars 2026), et **2025.2 est passée en « Supported »**.

Ceci diffère de l'état enregistré lors de la dernière exécution (2026-06-01), qui indiquait « Latest = 2025.2 ». Après vérification directe de la page de versioning officielle aujourd'hui, ce baseline était **erroné**.

### Pourquoi cette divergence avec les rapports récents

- Les rapports du **30 mars** et du **6 avril** avaient correctement détecté le passage à **2026.03 (Current)** ; le skill a été mis à niveau vers 2026.03 le 6 avril (serverless functions, agent tools, App Pages, npm workspaces).
- À partir du **11 mai**, les rapports hebdomadaires sont repassés à tort à « Latest = 2025.2 », en affirmant que « aucune ligne 2026.03 n'apparaît dans le tableau ». La page officielle consultée aujourd'hui **contredit** cette affirmation : la ligne `2026.03` y figure, taguée **Current**, avec une section « Changes in 2026.03 ». Ces rapports semblent avoir été établis sur une version périmée/mal lue de la page.
- Source corroborante : le **Spring 2026 Spotlight** (annoncé le 14 avril 2026) annonce la disponibilité générale de « HubSpot Developer Platform version 2026.03 for Projects » au 30 mars 2026.

**Le baseline du watch est donc corrigé à 2026.03.**

### Détails confirmés pour 2026.03 (déjà couverts par le skill)

- Réintroduction des **serverless functions** (app functions) au format `*-hsmeta.json` (un fichier de config par fonction) dans `src/app/functions/`.
- **Agent tools** pour les Breeze Agents (custom workflow actions soumis à revue).
- **App Homes → App Pages** (expérience multi-pages).
- **Code sharing** via npm workspaces.
- **HubSpot CLI v8.3.0+** requis (v8.2.0+ pour le Developer MCP server).
- Migration depuis 2025.2 = simple bump de `platformVersion` + `hs project upload` ; depuis 2025.1/2023.x = `hs project migrate`.

## Skill Files Modified

Le skill ciblait déjà `2026.03` — aucune régression de version nécessaire. Corrections factuelles et de cohérence appliquées cette passe :

| Fichier | Modification |
|---|---|
| `SKILL.md` | **Node.js minimum corrigé 20 → 22** (la page de versioning indique que 2025.2 a relevé le minimum à v22, hérité par 2026.03). Bump de version : `1.2.0 → 1.2.1`. |
| `examples/app-hsmeta-example.json` | Description « built on platform 2025.2 » → « 2026.03 » (cohérence). JSON revalidé. |
| `examples/complete-card-example.jsx` | Commentaire d'en-tête « HubSpot Platform 2025.2 » → « 2026.03 » (cohérence). |

Fichiers de référence (`scopes.md`, `ui-components.md`, `ui-extensions-sdk.md`, `features.md`, `app-configuration.md`, `marketplace-listing.md`, `signature-validation.md`, `fetching-data.md`) : **vérifiés, toujours alignés sur 2026.03**. Aucune nouvelle release depuis le 30 mars 2026 (2026.03 est Current depuis ~3 mois) et le framework de scopes (required / conditionally required / optional) est confirmé inchangé. Aucune modification appliquée pour éviter toute dérive non justifiée.

## Méthodologie de cette exécution

- L'extension **Claude in Chrome n'était pas connectée** lors de cette exécution automatisée (aucun utilisateur présent pour la lancer). Plusieurs tentatives ont échoué.
- Repli sur **WebFetch** de l'URL canonique `https://developers.hubspot.com/docs/developer-tooling/platform/versioning` (servie en markdown — version LLM des docs, contenu frais et fiable), corroboré par le changelog **Spring 2026 Spotlight**.
- ⚠️ À noter pour les prochaines passes : l'URL `https://developers.hubspot.com/docs/platform/platform-versioning` a renvoyé un **instantané périmé** (affichant « Latest: 2023.2 »). Utiliser l'URL `.../developer-tooling/platform/versioning` comme source fiable. Une lecture sur une page périmée est l'explication la plus probable des rapports erronés de mai–juin.

## Rappel des deadlines à surveiller

- **1er août 2026** : fin de support de 2025.1 (les builds échoueront après cette date ; migrer vers 2025.2 ou 2026.03).
- **31 octobre 2026** : sunset des classic CRM cards — les apps doivent utiliser les App Cards (sur 2025.2 ou 2026.03).
- Cadence semestrielle (mars/septembre) : prochaine fenêtre de release attendue à l'automne 2026.

## Prochaine exécution

Semaine du 2026-07-06.
