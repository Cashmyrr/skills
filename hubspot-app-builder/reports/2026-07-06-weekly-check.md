# HubSpot Developer Platform Watch — Rapport hebdomadaire

**Date d'exécution :** 2026-07-06
**Exécuté par :** tâche planifiée `hubspot-dev-platform-watch`
**Source de vérité :** https://developers.hubspot.com/docs/developer-tooling/platform/versioning (page consultée directement ce jour)

---

## Version Current / Latest actuelle

| Version | Date de sortie | Statut | Notes |
|---------|----------------|--------|-------|
| **2026.03** | 30 mars 2026 | **Current** (tag `success`) — « the latest version of the developer platform » | Section « Changes in 2026.03 » présente. Réintroduit le support complet des serverless functions pour les apps de projet. |
| 2025.2 | 2 septembre 2025 | Supported | Min. Node.js relevé à v22 ; framework build-and-deploy file-based. |
| 2025.1 | 1er avril 2025 | Upcoming deprecation | Fin de support : **1er août 2026** (les builds échoueront après cette date). |
| 2023.2 | — | Sunset | Sunset le 1er octobre 2025. |
| 2023.1 | — | Sunset | Indisponible depuis le 31 mars 2024. |

> La page officielle utilise la taxonomie **Current → Supported → Unsupported** (cycle de 18 mois, GA tous les 6 mois en mars et septembre). « Current » = la version GA la plus récente, équivalent de « Latest ». La ligne `2026.03` figure bien dans le tableau « Platform version history », taguée **Current** et qualifiée de « the latest version of the developer platform ». Elle est **GA (live)**, ni beta ni simplement annoncée.

## Résultat de la vérification

**Pas de changement.**

La version Current/Latest officielle reste **2026.03** (GA depuis le 30 mars 2026), identique au baseline établi lors de la dernière exécution du 2026-06-29. Le skill `hubspot-app-builder` cible déjà `2026.03` (mise à niveau effectuée le 6 avril 2026, corrections factuelles appliquées le 29 juin 2026).

## Détails confirmés ce jour pour 2026.03 (déjà couverts par le skill)

- **Serverless functions** : support complet réintroduit pour les apps de projet (y compris static-auth), non supporté sous 2025.2. Config par fonction via `-hsmeta.json` dans `src/app/functions/`.
- **Versioning des API REST** : depuis le 30 mars 2026, versions basées sur les dates (`/YYYY-MM/`, ex. `/2026-03/`) ; les API sémantiques legacy (v1–v4) restent supportées à leurs URLs. Betas suffixées `-beta` (ex. `/2026-09-beta/`).
- **Node.js 22+** minimum (relevé en 2025.2, hérité par 2026.03).
- **Migration vers 2026.03 irréversible** pour les apps privées/publiques legacy.

## Fichiers du skill modifiés

**Aucun.** Le skill est déjà entièrement aligné sur la version Current 2026.03 :

- `SKILL.md` — cible `2026.03`, version 1.2.1, Node.js 22+, sections serverless / agent tools / App Pages / npm workspaces présentes.
- `examples/app-hsmeta-example.json` — plateforme 2026.03, JSON revalidé (OK).
- `examples/complete-card-example.jsx` — en-tête 2026.03.
- Fichiers de référence (`scopes.md`, `ui-components.md`, `ui-extensions-sdk.md`, `features.md`, `app-configuration.md`, `marketplace-listing.md`, `signature-validation.md`, `fetching-data.md`) — vérifiés, toujours alignés sur 2026.03. Aucune nouvelle release depuis le 30 mars 2026.

Conformément à la règle du watch (agir uniquement sur un changement de la version Current/Latest de la page officielle), aucune modification n'a été apportée.

## Notes de méthode

- **Chrome n'était pas connecté** lors de cette exécution planifiée (extension injoignable). La vérification a été faite en récupérant directement le contenu de la page officielle de versioning, dont la ligne `2026.03 (Current)` et la section « Changes in 2026.03 » ont été lues intégralement.
- Le rapport isolé à la racine `skills/hubspot-dev-platform-watch-report-2026-03-27.md` est **périmé** (baseline 2025.2 datant d'avant le passage à 2026.03). Le baseline courant fait foi via `reports/2026-06-29-weekly-check.md` = 2026.03.

## Échéances à surveiller

- **1er août 2026** : fin de support de 2025.1 (les builds échoueront ; migrer vers 2025.2 ou 2026.03).
- **Septembre 2026** : prochaine fenêtre GA semestrielle — surveiller l'apparition d'une nouvelle version Current sur la page de versioning.

## Prochaine exécution

Semaine du 2026-07-13.
