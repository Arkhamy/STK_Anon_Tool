# STK Anon Tool - Outil d'Anonymisation de Documents

![Logo STK Anon](public/logo.png)

**STK Anon Tool** est une application de bureau open-source conçue pour vous aider à protéger votre vie privée en nettoyant, filigranant et anonymisant vos documents (images et PDF) avant de les partager.

[![Version](https://img.shields.io/badge/version-1.8.0-blue.svg)](https://semver.org)
[![Licence](https://img.shields.io/badge/licence-MIT-green.svg)](LICENSE)

---

## Table des matières

- [À propos du projet](#à-propos-du-projet)
- [Fonctionnalités clés](#fonctionnalités-clés)
- [Technologies utilisées](#technologies-utilisées)
- [Démarrage rapide](#démarrage-rapide)
- [Utilisation](#utilisation)
- [Comment contribuer](#comment-contribuer)
- [Licence](#licence)

---

## À propos du projet

Dans un monde où le partage d'informations est constant, il est crucial de maîtriser les données que l'on expose. STK Anon Tool a été créé pour offrir une solution simple, rapide et locale (rien n'est envoyé sur des serveurs externes) pour "nettoyer" des documents. Que vous soyez un journaliste souhaitant protéger ses sources, un avocat partageant des pièces sensibles, ou simplement un citoyen soucieux de sa vie privée, cet outil est fait pour vous.

![Aperçu de l'application](https://i.imgur.com/your-screenshot-placeholder.png)
*(Remplacez cette image par une capture d'écran de l'application)*

---

## Fonctionnalités clés

-   🧹 **Nettoyage des Métadonnées**: Supprimez les données EXIF et autres informations cachées de vos fichiers (coordonnées GPS, type d'appareil, date de création, etc.).
-   💧 **Ajout de Filigrane (Watermarking)**: Apposez un texte personnalisé sur vos documents pour marquer la confidentialité, la provenance ou le statut d'un document. Le filigrane est entièrement configurable (taille, opacité, couleur, rotation, densité).
-   ✒️ **Anonymisation (Caviardage)**: Masquez de manière permanente des zones spécifiques de vos documents (noms, adresses, visages, etc.) en dessinant des rectangles noirs.
-   📄 **Support Multi-format**: Traite aussi bien les images (JPG, PNG) que les documents PDF, y compris les PDF de plusieurs pages.
-   🔒 **100% Local**: Toutes les opérations sont effectuées sur votre machine. Vos fichiers ne la quittent jamais.

---

## Technologies utilisées

Ce projet est construit avec des technologies modernes et robustes :

-   [Electron](https://www.electronjs.org/) - Pour la création de l'application de bureau multiplateforme.
-   [React](https://reactjs.org/) - Pour la construction de l'interface utilisateur.
-   [Vite](https://vitejs.dev/) - Pour un environnement de développement rapide et un build optimisé.
-   [Tailwind CSS](https://tailwindcss.com/) - Pour le design de l'interface.

---

## Démarrage rapide

Pour faire fonctionner ce projet en local, suivez ces étapes.

### Prérequis

Assurez-vous d'avoir [Node.js](https://nodejs.org/) (version 18 ou supérieure) et npm installés sur votre système.

### Installation

1.  Clonez ce dépôt (ou téléchargez les fichiers) sur votre machine.
2.  Ouvrez un terminal à la racine du projet.
3.  Installez les dépendances nécessaires avec la commande :
    ```sh
    npm install
    ```

### Lancement

Vous pouvez lancer l'application de deux manières :

1.  **En mode développement web (interface uniquement) :**
    ```sh
    npm run dev
    ```
    Cela ouvrira l'interface dans votre navigateur à l'adresse `http://localhost:5173`.

2.  **En mode application de bureau (Electron) :**
    ```sh
    npm run electron:dev
    ```
    Cela lancera l'application de bureau complète avec toutes ses fonctionnalités.

---

## Utilisation

1.  Lancez l'application.
2.  Depuis l'écran d'accueil (Tutoriel), cliquez sur le bouton **Téléverser**.
3.  Choisissez un fichier image (JPG, PNG) ou un PDF sur votre ordinateur.
4.  Utilisez la **Tool Box** sur la gauche pour naviguer entre les différents outils :
    -   **Métadonnées** : Inspectez les informations du fichier.
    -   **Filigrane** : Configurez et prévisualisez un filigrane.
    -   **Anonymisation** : Dessinez des zones à masquer.
5.  Une fois vos modifications terminées, cliquez sur le bouton **ENREGISTRER** pour sauvegarder une copie sécurisée de votre document.

---

## Comment contribuer

Les contributions sont ce qui fait de la communauté open source un endroit extraordinaire pour apprendre, inspirer et créer. Toute contribution que vous faites est **grandement appréciée**.

Si vous avez une suggestion pour améliorer ce projet, veuillez forker le dépôt et créer une pull request. Vous pouvez aussi simplement ouvrir une "issue" avec le tag "enhancement".
N'oubliez pas de donner une étoile au projet ! Merci encore !

1.  Forkez le Projet
2.  Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3.  Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4.  Poussez vers la branche (`git push origin feature/AmazingFeature`)
5.  Ouvrez une Pull Request

---

## Licence

Distribué sous la licence MIT. Voir `LICENSE.txt` pour plus d'informations.
*(Vous devrez ajouter un fichier LICENSE.txt avec le contenu de la licence MIT)*
