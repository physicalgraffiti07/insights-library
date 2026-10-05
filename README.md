# Bibliothèque d'insights

Collection privée d’extraits YouTube (embeds officiels uniquement — aucun téléchargement ni re-upload).

## Ouvrir en local

```bash
cd /workspace/insights-library
python3 -m http.server 8765
```

Puis ouvrir [http://127.0.0.1:8765](http://127.0.0.1:8765) (ou le port indiqué).

> Les iframes YouTube et le chargement de `pepites.json` nécessitent un serveur HTTP (pas d’ouverture directe du fichier `file://`).

## Structure

| Fichier         | Rôle                                      |
|-----------------|-------------------------------------------|
| `index.html`    | Page unique                               |
| `styles.css`    | Thème clair élégant (blanc / champagne)                      |
| `app.js`        | Filtres, cartes, embeds                   |
| `pepites.json`  | Données — ajoutez vos insights ici        |

## Ajouter un insight

Éditez `pepites.json` et ajoutez un objet dans le tableau `pepites` :

```json
{
  "id": "mon-slug-unique",
  "theme": "Fiscalité / Holding France",
  "themes": ["Fiscalité", "Holding France"],
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
- **theme** — libellé affiché sur la carte
- **themes** — tags pour les filtres (recommandé)
- **videoId** — ID YouTube (après `v=`)
- **start** / **end** — secondes (début et fin de l’extrait)
- **title**, **source**, **summary** — textes affichés

Lecture en **click-to-play** : vignette YouTube + bouton play ; l’iframe
`https://www.youtube.com/embed/VIDEO_ID?start=&end=&rel=0&playsinline=1&autoplay=1`
n’est chargée qu’au clic (geste utilisateur).

Le bouton « Voir sur YouTube » pointe vers :
`https://www.youtube.com/watch?v=VIDEO_ID&t=STARTs`

## Filtres & liens

- Filtres par thème en haut de page
- `?theme=Fiscalité` pour pré-filtrer
- `#mon-slug-unique` pour scroller jusqu’à une carte

## Hébergement

Publié sur GitHub Pages :
[https://physicalgraffiti07.github.io/insights-library/](https://physicalgraffiti07.github.io/insights-library/)

Branche `main`, racine `/`.

## Règle copyright

**Uniquement** des embeds YouTube originaux avec `start` / `end`. Ne jamais télécharger ni re-uploader la vidéo.
