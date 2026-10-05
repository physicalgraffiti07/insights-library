# Bibliothèque de pépites

Collection privée d’extraits YouTube (embeds officiels uniquement — aucun téléchargement ni re-upload).

## Ouvrir en local

```bash
cd /workspace/pepites-library
python3 -m http.server 8765
```

Puis ouvrir [http://127.0.0.1:8765](http://127.0.0.1:8765) (ou le port indiqué).

> Les iframes YouTube et le chargement de `pepites.json` nécessitent un serveur HTTP (pas d’ouverture directe du fichier `file://`).

## Structure

| Fichier         | Rôle                                      |
|-----------------|-------------------------------------------|
| `index.html`    | Page unique                               |
| `styles.css`    | Thème sombre élégant                      |
| `app.js`        | Filtres, cartes, embeds                   |
| `pepites.json`  | Données — ajoutez vos pépites ici         |

## Ajouter une pépite

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

L’embed utilise :
`https://www.youtube-nocookie.com/embed/VIDEO_ID?start=X&end=Y&rel=0`

Le bouton « Voir sur YouTube » pointe vers :
`https://www.youtube.com/watch?v=VIDEO_ID&t=STARTs`

## Filtres & liens

- Filtres par thème en haut de page
- `?theme=Fiscalité` pour pré-filtrer
- `#mon-slug-unique` pour scroller jusqu’à une carte

## Hébergement (lien partageable)

GitHub n’est pas encore connecté sur ce compte. Pour publier :

1. Connecter GitHub (`gh auth login` ou connecteur GitHub Cursor)
2. Créer un dépôt `pepites-library` (public pour Pages simple, ou private + Pages selon le plan)
3. Pousser ce dossier et activer **GitHub Pages** (branche `main`, racine `/`)

Sans GitHub : servir ce dossier via n’importe quel hébergeur statique (Netlify Drop, Cloudflare Pages, etc.).

## Règle copyright

**Uniquement** des embeds YouTube originaux avec `start` / `end`. Ne jamais télécharger ni re-uploader la vidéo.
