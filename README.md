# JS Pacman

Bienvenue dans ce projet de Pacman en Javascript Vanilla ! Ce projet a pour but de recréer l'expérience classique du jeu d'arcade avec des fonctionnalités modernes comme un éditeur de niveau et des scores persistants.

## Fonctionnalités

- **Jeu Classique** : Déplacez Pacman pour manger toutes les pac-gommes en évitant les fantômes.
- **Éditeur de Niveau** : Créez vos propres niveaux via un fichier JSON ou l'interface d'édition.
- **Difficulté Progressive** : Choisissez votre difficulté et voyez les fantômes devenir plus rapides et agressifs.
- **High Scores** : Vos 10 meilleurs scores sont sauvegardés localement, ainsi qu'un classement global simulé.

## Configuration et Installation

Aucune installation complexe n'est requise car le projet utilise uniquement HTML, CSS et Javascript natif.

1.  Clonez ou téléchargez ce dossier.
2.  Ouvrez le fichier `index.html` dans votre navigateur web préféré.
3.  Pour utiliser l'éditeur, ouvrez `editor.html`.

### Structure du Projet

- `index.html` : L'entrée principale du jeu.
- `editor.html` : L'outil pour créer des niveaux.
- `css/style.css` : La feuille de style.
- `js/` : Contient tout le code source du jeu.
  - `game.js` : Moteur principal.
  - `pacman.js` & `ghost.js` : Logique des personnages.
  - `board.js` : Gestion du plateau.
- `levels/` : Dossier pour stocker les fichiers de niveaux JSON.

## Règles du Jeu

1.  **But** : Manger toutes les petites pac-gommes blanches sur le plateau.
2.  **Contrôles** : Utilisez les **Flèches Directionnelles** du clavier pour déplacer Pacman.
3.  **Fantômes** :
    - Évitez-les ! S'ils vous touchent, vous perdez une vie.
    - Mangez une **Super Pac-gomme** (les grosses boules) pour rendre les fantômes vulnérables (bleus) pendant un court instant. Vous pouvez alors les manger pour des points bonus.
4.  **Score** :
    - Pac-gomme : 10 points.
    - Super Pac-gomme : 50 points.
    - Fantôme : 200, 400, 800, 1600 points (doublé à chaque fantôme mangé en série).
5.  **Fin de partie** : Le jeu se termine quand vous n'avez plus de vies.

## Éditeur de Niveau

Le jeu accepte des niveaux au format JSON.
Format attendu :

```json
{
  "width": 28,
  "height": 31,
  "layout": [
    [1, 1, 1, ...],
    [1, 0, 2, ...]
  ]
}
```

Légende : `1` = Mur, `0` = Vide/Gomme, `2` = Super Gomme, `3` = Vide (sans gomme), `4` = Spawn Fantôme, `5` = Spawn Pacman.
