# HubSpot Developer Platform Watch — Rapport hebdomadaire

**Date d'exécution :** 2026-07-20
**Exécuté par :** tâche planifiée `hubspot-dev-platform-watch`
**Source de vérité :** https://developers.hubspot.com/docs/developer-tooling/platform/versioning (page chargée et lue intégralement ce jour via Chrome)
**Exécution précédente :** 2026-07-13

---

## Version Current / Latest actuelle

| Version | Date de sortie | Statut sur la page | Notes |
|---------|----------------|--------------------|-------|
| **2026.03** | 30 mars 2026 | **Current** — « the latest version of the developer platform » | Support complet des serverless functions réintroduit pour les apps de projet. |
| 2025.2 | 2 septembre 2025 | Supported | Min. Node.js relevé à v22 ; framework build-and-deploy file-based. |
| 2025.1 | 1er avril 2025 | Upcoming Deprecation | Fin de support : **1er août 2026** (les builds échoueront après cette date). |
| 2023.2 | — | Sunset | Sunset le 1er octobre 2025 ; uploads en échec. |
| 2023.1 | — | Sunset | Indisponible depuis le 31 mars 2024. |

> Taxonomie officielle **Current → Supported → Unsupported** (cycle 18 mois, GA semestrielle en mars/septembre). « Current » = la version GA la plus récente, équivalent de « Latest ». La ligne `2026.03` figure dans « Platform version history », taguée **Current**, et le texte la qualifie de « the latest version of the developer platform ». Elle est **GA (live)**, ni beta ni simplement annoncée.

## Résultat de la vérification

**Pas de changement.**

La version Current/Latest officielle reste **2026.03** (GA depuis le 30 mars 2026), identique au baseline de l'exécution du 2026-07-13. Aucune nouvelle version n'a été publiée. Le skill `hubspot-app-builder` cible déjà `2026.03` (v1.2.1) — aucune action requise.

Page « Last modified on June 4, 2026 » — inchangée depuis la dernière passe.

## Fichiers du skill modifiés

**Aucun.** Le skill reste entièrement aligné sur la version Current 2026.03. Conformément à la règle du watch (n'agir que si la version Current/Latest de la page officielle change), aucune modification n'a été apportée.

## Notes de méthode

- **Chrome connecté :** la page canonique `/docs/developer-tooling/platform/versioning` a été chargée et lue intégralement.
- ⚠️ Rappel : l'ancienne URL `/docs/platform/platform-versioning` (celle du fichier de tâche) sert un instantané périmé — toujours utiliser `/docs/developer-tooling/platform/versioning` comme source de vérité.
- Le rapport isolé à la racine `skills/hubspot-dev-platform-watch-report-2026-03-27.md` est **périmé** (baseline 2025.2). Le baseline courant fait foi via le dossier `reports/` = 2026.03.

## Échéances à surveiller

- **1er août 2026** : fin de support de 2025.1 (builds en échec après cette date ; migrer vers 2025.2 ou 2026.03).
- **Septembre 2026** : prochaine fenêtre GA semestrielle — surveiller l'apparition d'une éventuelle nouvelle version Current sur la page de versioning.

## Prochaine exécution

Semaine du 2026-07-27.
