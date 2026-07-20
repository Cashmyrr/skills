# HubSpot Developer Platform Watch — Rapport hebdomadaire

**Date d'exécution :** 2026-07-13
**Exécuté par :** tâche planifiée `hubspot-dev-platform-watch`
**Source de vérité :** https://developers.hubspot.com/docs/developer-tooling/platform/versioning (page consultée directement ce jour via Chrome)
**Exécution précédente :** 2026-07-06

---

## Version Current / Latest actuelle

| Version | Date de sortie | Statut sur la page | Notes |
|---------|----------------|--------------------|-------|
| **2026.03** | 30 mars 2026 | **Current** — « the latest version of the developer platform » | Réintroduit le support complet des serverless functions pour les apps de projet (non supporté en 2025.2). Section « Changes in 2026.03 » présente. |
| 2025.2 | 2 septembre 2025 | Supported | Min. Node.js relevé à v22 ; framework build-and-deploy file-based. |
| 2025.1 | 1er avril 2025 | Upcoming Deprecation | Fin de support : **1er août 2026** (les builds échoueront après cette date). |
| 2023.2 | — | Sunset | Sunset le 1er octobre 2025. |
| 2023.1 | — | Sunset | Indisponible depuis le 31 mars 2024. |

> Taxonomie officielle **Current → Supported → Unsupported** (cycle 18 mois, GA semestrielle en mars/septembre). « Current » = la version GA la plus récente, équivalent de « Latest ». La ligne `2026.03` figure dans le tableau « Platform version history », taguée **Current**, et le texte la qualifie de « the latest version of the developer platform ». Elle est **GA (live)**, ni beta ni simplement annoncée.

## Résultat de la vérification

**Pas de changement.**

La version Current/Latest officielle reste **2026.03** (GA depuis le 30 mars 2026), identique au baseline de l'exécution du 2026-07-06. Aucune nouvelle version n'a été publiée. Le skill `hubspot-app-builder` cible déjà `2026.03` (v1.2.1) — aucune action requise.

Page « Last modified on June 4, 2026 » — inchangée depuis la dernière passe.

## Fichiers du skill modifiés

**Aucun.** Le skill reste entièrement aligné sur la version Current 2026.03. Conformément à la règle du watch (n'agir que si la version Current/Latest de la page officielle change), aucune modification n'a été apportée.

## Notes de méthode

- **Chrome connecté** cette fois : la page canonique `/docs/developer-tooling/platform/versioning` a été chargée et lue intégralement.
- ⚠️ Rappel : l'ancienne URL `/docs/platform/platform-versioning` sert un instantané périmé — toujours utiliser `/docs/developer-tooling/platform/versioning` comme source de vérité.
- Le rapport isolé à la racine `skills/hubspot-dev-platform-watch-report-2026-03-27.md` est **périmé** (baseline 2025.2). Le baseline courant fait foi via les rapports du dossier `reports/` = 2026.03.

## Échéances à surveiller

- **1er août 2026** : fin de support de 2025.1 (builds en échec après cette date ; migrer vers 2025.2 ou 2026.03).
- **31 octobre 2026** : sunset des classic CRM cards — migrer vers les App Cards.
- **Septembre 2026** : prochaine fenêtre GA semestrielle — surveiller l'apparition d'une éventuelle nouvelle version Current.

## Prochaine exécution

Semaine du 2026-07-20.
