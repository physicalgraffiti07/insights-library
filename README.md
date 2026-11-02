# Insights — Éducation

Collection privée d’extraits YouTube (liens horodatés) et de reels Instagram consacrée à l’**éducation** — aucun téléchargement ni re-upload. Une seule page annexe, **Fiscalité**, regroupe les extraits fiscaux.

## Sections (règle)

Chaque fiche de `pepites.json` porte un champ **`section`** :

- `"education"` — affichée sur l’accueil `index.html` (**valeur par défaut** : une fiche sans champ `section`, ou avec une valeur inconnue, va en éducation) ;
- `"fiscalite"` — affichée uniquement sur `fiscalite.html` (liste simple, sans filtres).

Il n’y a que ces deux pages. Toute nouvelle fiche va en éducation sauf mention explicite `"section": "fiscalite"`.

Redirections : un ancien lien `index.html#<id-fiscal>` est redirigé vers `fiscalite.html#<id>` (et inversement) ; `?theme=Fiscalité` (ou un autre thème présent seulement côté fiscalité) sur l’accueil redirige vers `fiscalite.html`.

## Ouvrir en local

```bash
cd /workspace/insights-library
python3 -m http.server 8765
```

Puis ouvrir [http://127.0.0.1:8765](http://127.0.0.1:8765) (ou le port indiqué).

> Le chargement de `pepites.json` nécessite un serveur HTTP (pas d’ouverture directe du fichier `file://`).

## Structure

| Fichier         | Rôle                                      |
|-----------------|-------------------------------------------|
| `index.html`    | Accueil — section Éducation (`data-section="education"`) |
| `fiscalite.html` | Page unique Fiscalité (`data-section="fiscalite"`, filtres désactivés) |
| `styles.css`    | Cartes horizontales + couvertures typographiques CNRS |
| `app.js`        | Filtres, cartes, click-to-play, actions   |
| `pepites.json`  | Données — ajoutez vos insights ici        |

Les assets déployés portent un suffixe horodaté (`styles.YYYYMMDDHHMMSS.css`, `app.…js`) pour le cache-busting ; `index.html` pointe vers ces fichiers.

## Ajouter un insight

Éditez `pepites.json` et ajoutez un objet dans le tableau `pepites` :

```json
{
  "id": "mon-slug-unique",
  "section": "education",
  "theme": "Éducation",
  "themes": ["Éducation"],
  "title": "Titre de l’extrait",
  "videoId": "K9ioanmVmGw",
  "start": 4417,
  "end": 4483,
  "source": "Nom de la vidéo / chaîne",
  "summary": "Résumé court en français."
}
```

### Champs

- **id** — identifiant unique (ancre `#id` dans l’URL)
- **section** — `education` (défaut) ou `fiscalite`
- **theme** — libellé affiché sur la carte
- **themes** — tags pour les filtres (recommandé)
- **videoId** — ID YouTube (après `v=`)
- **start** / **end** — secondes (début et fin de l’extrait)
- **title**, **source**, **summary** — textes affichés

### Cartes

Mise en page **horizontale** (desktop) :

- **Gauche** — couverture typographique style CNRS / De Vive Voix (fond crème, bordure bleu sombre, trois bandes : thème · titre en capitales · plage horaire). **Texte uniquement** jusqu’au clic — aucune photo, aucune vignette YouTube (`ytimg`), aucun visage. Un clic sur la couverture remplace le panneau gauche par un iframe YouTube (horodatage `start`/`end`, autoplay).
- **Droite** — pastille thème, horaires, titre, source, résumé, boutons **Lire le passage** / **Copier le lien** / **Voir sur YouTube** (inchangés).

Les liens externes pointent vers :
`https://www.youtube.com/watch?v=VIDEO_ID&t=STARTs`


### Insight Instagram

```json
{
  "id": "mon-slug-unique",
  "section": "education",
  "platform": "instagram",
  "theme": "Éducation",
  "themes": ["Éducation"],
  "title": "Titre du reel",
  "instagramUrl": "https://www.instagram.com/reel/SHORTCODE/",
  "instagramShortcode": "SHORTCODE",
  "source": "Compte / contexte",
  "summary": "Résumé court en français."
}
```

Champs Instagram : **platform**, **instagramUrl**, **instagramShortcode** (pas de `start`/`end`). Couverture typographique avec meta « Reel » ; clic → embed Instagram ; boutons « Voir sur Instagram ».

## Filtres & liens

- Filtres par thème sur l’accueil, affichés seulement s’il y a au moins deux thèmes éducation
- `?theme=<thème>` pour pré-filtrer l’accueil ; un thème uniquement fiscal redirige vers `fiscalite.html`
- `#mon-slug-unique` pour scroller jusqu’à une carte

## Hébergement

Publié sur GitHub Pages :
[https://physicalgraffiti07.github.io/insights-library/](https://physicalgraffiti07.github.io/insights-library/) · [fiscalite.html](https://physicalgraffiti07.github.io/insights-library/fiscalite.html)

Branche `main`, racine `/`.

## Règle copyright

**Uniquement** des liens / embeds YouTube (horodatés) ou Instagram originaux. Ne jamais télécharger ni re-uploader le contenu.
