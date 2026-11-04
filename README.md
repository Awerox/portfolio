# Portfolio — Alex XU

Portfolio BTS SIO option SLAM (ENC Bessières). Site **statique**, bilingue (français à la racine, anglais dans `en/`), écrit à la main en HTML, CSS et JavaScript. Aucun framework, aucune dépendance à installer, aucune ressource externe : les polices (Bricolage Grotesque et Instrument Sans, licence OFL) sont hébergées dans `assets/fonts/`.

Design « éditorial noir et ambre » : lignes de séparation plutôt que cartes, aucun flou ni animation permanente, pour un défilement fluide.

## Voir le site en local

Double-cliquer sur `index.html`, ou lancer un petit serveur :

```bash
python3 -m http.server 8000   # puis ouvrir http://localhost:8000
```

## Publier sur GitHub Pages

1. Créer un dépôt GitHub (public), par exemple `portfolio`.
2. Envoyer **tout le contenu de ce dossier** à la racine du dépôt (les fichiers, pas le dossier parent).
3. Dans le dépôt : **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`** → Save.
4. Après une à deux minutes, le site est en ligne sur `https://<ton-pseudo>.github.io/<nom-du-dépôt>/`.

Le fichier `.nojekyll` (vide) est volontaire : il évite que GitHub Pages retraite le site. Le formulaire de contact fonctionne dès la mise en ligne (Formspree). Pour tester l'envoi, depuis le site publié, envoie-toi un message ; à la première réception, Formspree demande de confirmer l'adresse e-mail.

## Structure

```
index.html … veille.html    pages en français (Accueil, Profil, Compétences, Stage, Projets, Veille, Certifications, Contact, Mentions légales)
en/                          les mêmes pages en anglais
assets/css/style.css         toute la mise en forme (couleurs : variables de la section 1)
assets/js/main.js            thème, menu, animations, compteurs, formulaire
assets/js/config.js          réglage du logo
assets/docs/                 CV et rapport de stage (PDF)
_outils/                     scripts de maintenance (non utiles aux visiteurs)
```

## Modifier le site

- **Logo** : déposer l'image dans `assets/img/` puis renseigner `logoImage` dans `assets/js/config.js` (ex. `"assets/img/logo.png"`). Toutes les pages, en français et en anglais, changent en une fois. Vide = initiales « AX ».
- **CV** : volontairement absent pour l'instant (il contenait adresse et téléphone). Quand une version à jour existe, la déposer dans `assets/docs/cv-alex-xu.pdf` et ajouter un lien « CV (PDF) » sur la page voulue.
- **Textes** : chaque contenu existe en deux versions, `page.html` et `en/page.html`. Modifier les deux.
- **Couleurs** : variables au début de `assets/css/style.css` (section 1, thème sombre puis thème clair).
- **Menu ou pied de page** : modifier `index.html` (et `en/index.html`) entre les marqueurs `<!-- #header -->` et `<!-- #footer -->`, puis lancer :

```bash
python3 _outils/propager.py    # recopie le menu et le pied de page dans toutes les pages
python3 _outils/verifier.py    # liens cassés, images sans alt, doublons, champs à compléter
```

Ne pas modifier le menu à la main dans une page interne : la prochaine propagation l'écraserait.

- **Cache du navigateur** : après une modification de `style.css` ou `main.js`, changer le numéro `?v=…` dans les pages (rechercher-remplacer `?v=20261104e` par une nouvelle valeur), sinon les visiteurs peuvent garder l'ancienne version.

## À garder à jour

- Le CV et la période de stage de 2ᵉ année dès qu'un stage est trouvé (pages Stage et Accueil, en français et en anglais).
- La page Veille : les chiffres et les sources sont datés ; ajouter les nouvelles publications au fil de l'année.
