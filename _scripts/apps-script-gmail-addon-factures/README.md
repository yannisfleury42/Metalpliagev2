# MDS Factures - Gmail Add-on

## Ce que ça fait

Ajoute dans Gmail une barre latérale avec un bouton **"Analyser cette facture"** :
- S'affiche automatiquement quand tu ouvres un mail
- Liste les PDF détectés en pièces jointes
- En 1 clic : copie les PDF dans `Drive/Factures-fournisseurs/inbox/` et labellise le mail comme archivé

Plus besoin de label manuel, plus de trigger horaire, plus de filtre par fournisseur. **1 clic depuis le mail ouvert.**

---

## Installation (15 min, une fois)

### Étape 1 — Crée un nouveau projet Apps Script
1. Va sur **[script.google.com](https://script.google.com)** (compte `metallier.mds@gmail.com`)
2. **Nouveau projet**
3. Renomme-le : `MDS Factures Add-on` (icône crayon en haut)

### Étape 2 — Affiche le fichier manifest (appsscript.json)
1. ⚙ **Paramètres du projet** (icône engrenage à gauche)
2. Coche **"Afficher le fichier manifeste 'appsscript.json' dans l'éditeur"**
3. Retour à l'éditeur (`<>` à gauche) → tu vois maintenant `appsscript.json` dans la liste des fichiers

### Étape 3 — Colle le manifest
1. Ouvre `appsscript.json` dans l'éditeur Apps Script
2. **Sélectionne tout** (Ctrl+A) → **Supprime**
3. Copie tout le contenu de [`appsscript.json`](appsscript.json) (le fichier dans ce dossier) → **Colle**
4. **Ctrl+S** pour enregistrer

### Étape 4 — Colle le code
1. Ouvre `Code.gs` dans l'éditeur Apps Script (renomme-le si besoin — ce doit être le seul `.gs`)
2. **Sélectionne tout** (Ctrl+A) → **Supprime**
3. Copie tout le contenu de [`Code.gs`](Code.gs) → **Colle**
4. **Ctrl+S**

### Étape 5 — Déploie en mode test
1. En haut à droite : **Déployer** → **Tester les déploiements**
2. Une fenêtre s'ouvre. Clique **Installer**
3. Confirme avec **Terminé**

> ⚠️ Si Google demande des autorisations : suis le même chemin que pour `setup` précédemment (Paramètres avancés → Accéder à... → Autoriser Gmail + Drive).

### Étape 6 — Active le module dans Gmail
1. Ouvre **[Gmail](https://mail.google.com)** dans un nouvel onglet (ou rafraîchis si déjà ouvert)
2. Regarde la **barre latérale droite** : tu vois une icône 🧾 (reçu) — c'est ton add-on **MDS Factures**
3. Si tu ne la vois pas : clique la flèche **<** en bas à droite pour déplier la barre latérale, puis cherche "MDS Factures"

---

## Usage quotidien

1. Tu ouvres un mail contenant une facture PDF
2. Dans la barre latérale droite, clique l'icône **🧾 MDS Factures**
3. Une carte s'affiche avec : sujet, expéditeur, liste des PDF détectés
4. Clique **"Analyser cette facture"**
5. Confirmation : `X PDF(s) sauvegardé(s) dans Drive/Factures-fournisseurs/inbox`
6. Le mail prend automatiquement le label `Factures-archivees`
7. Dans VS Code, dis à Claude : **« traite l'inbox »** → il met à jour le tableau

---

## Test rapide après installation

1. Va dans Gmail, ouvre **n'importe quel mail avec un PDF en PJ** (par exemple ré-envoie-toi le mail Gantois)
2. Clique l'icône 🧾 dans la barre latérale droite
3. Tu dois voir une carte avec :
   - Sujet du mail
   - Nombre de PDF détectés
   - Bouton bleu **"Analyser cette facture"**
4. Clique → confirmation
5. Vérifie côté Windows : le PDF est dans `G:\Mon Drive\Factures-fournisseurs\inbox\`

---

## Si quelque chose cloche

| Symptôme | Solution |
|---|---|
| L'icône n'apparaît pas dans Gmail | Rafraîchis Gmail (F5). Vérifie que tu es sur le même compte que celui qui a créé l'add-on |
| "Action non autorisée" en cliquant le bouton | Réinstalle le déploiement (Déployer → Tester → Désinstaller puis Installer) |
| Bouton bouge pas / fenêtre Apps Script bloque | Régénère le token : Éditeur Apps Script → ⚙ → Réinitialiser autorisations |
| Carte vide / pas de PDF détecté | Le mail n'a pas de PJ `.pdf` (peut-être un Drive link, ou une image). Renomme le fichier en `.pdf` si possible |
| Doublons dans Drive | Le script suffixe automatiquement `_2`, `_3`... pas de souci |

---

## Maintenance / modifications

- **Changer le label cible** : modifie `LABEL_DONE` en haut de `Code.gs` puis sauvegarde
- **Voir les logs d'erreurs** : Apps Script → menu gauche → **Exécutions**
- **Désinstaller** : Apps Script → Déployer → Tester → Désinstaller
- **Reconstruire** : si tu modifies `appsscript.json`, **désinstalle puis réinstalle** le déploiement test pour appliquer les nouvelles autorisations

---

## Relation avec l'ancien système (label + trigger horaire)

L'ancien projet Apps Script (`MDS Factures Gmail → Drive` avec `processInvoices` + trigger horaire) **n'est plus nécessaire** avec ce nouveau add-on.

Tu peux :
- **Garder l'ancien** comme filet de sécurité (rétro-traitement par label)
- **Ou supprimer le trigger horaire** : Apps Script ancien projet → ⏰ Déclencheurs → corbeille
- **Ou supprimer complètement l'ancien projet** : ⚙ Paramètres → Mettre le projet à la corbeille

Recommandé : **garde l'ancien pendant 1 semaine en test, puis désactive le trigger horaire** une fois confiant.
