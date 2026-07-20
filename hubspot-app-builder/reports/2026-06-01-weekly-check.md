# HubSpot Developer Platform — Weekly Version Check

**Date:** 2026-06-01
**Source de vérité:** https://developers.hubspot.com/docs/developer-tooling/platform/versioning
**Previous check:** 2026-05-25

---

## Version Status (selon la page de versioning uniquement)

| Version | Released | Unsupported | Status |
|---|---|---|---|
| **2025.2** | September 2, 2025 | March 30, 2027 | **Latest** (« The latest version of the platform » sur la page de versioning) |
| 2025.1 | April 1, 2025 | August 1, 2026 | Supported — déprécation imminente |
| 2023.2 | November 21, 2023 | October 1, 2025 | Sunset |
| 2023.1 | August 2023 | March 31, 2024 | Sunset |

> Page de versioning : dernière modification le **10 mars 2026** (inchangée depuis la semaine dernière). Aucune ligne `2026.03` n'apparaît dans le tableau « Version history ». La section « Changes » la plus récente reste « Changes in 2025.2 ». Conformément à la règle critique du skill, toute version non marquée « Latest » sur la page de versioning officielle est ignorée.

## Change Detected

**Pas de changement.** La version « Latest » sur la page de versioning officielle reste **2025.2** (inchangée depuis sa GA le 2 septembre 2025).

### Observations

- La page de versioning n'a pas été modifiée depuis le 10 mars 2026 — toujours aucune entrée `2026.03` dans la table « Version history ».
- Le texte de la page continue de désigner 2025.2 comme « The latest version of the platform ».
- Des mentions de `2026.03` continuent d'apparaître dans des résultats de recherche externes (Spring 2026 Spotlight, billets de blog, articles tiers) mais cette version **n'est pas listée comme Latest** sur la page officielle de versioning — elle est donc ignorée conformément à la règle critique du skill.
- Aucun nouvel élément majeur n'a été ajouté à la page entre la dernière exécution (25 mai 2026) et aujourd'hui.

## Skill Files Modified

Aucun. Conformément à la règle stricte du skill, aucune modification n'a été apportée puisque la version Latest officielle (2025.2) n'a pas changé.

> Note de cohérence : le fichier `SKILL.md` actuel cible la plateforme `2026.03` (mise à jour effectuée en dehors du processus de ce scheduled task). Selon la règle critique du watch — seule la version marquée « Latest » sur la page de versioning officielle compte — la version Latest reste 2025.2. Cette divergence est signalée sans action corrective : le scheduled task n'agit que sur des changements détectés sur la page de versioning officielle.

## Rappel des deadlines à surveiller

- **1er août 2026** : fin de support de 2025.1 (les builds échoueront après cette date).
- **Septembre 2026** : prochaine fenêtre de release attendue (cadence semestrielle mars/septembre).

## Prochaine exécution

Semaine du 2026-06-08.
