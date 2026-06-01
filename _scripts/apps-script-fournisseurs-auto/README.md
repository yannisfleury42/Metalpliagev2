# Pipeline factures fournisseurs — automatisation complète

## Ce que ça fait

Toutes les heures, le script :

1. Scanne Gmail (label `Factures-a-traiter`)
2. Copie les PDFs joints dans `Drive/Factures-fournisseurs/inbox/`
3. Extrait les données de chaque PDF via **Gemini 2.0 Flash** (gratuit jusqu'à 1500 req/jour)
4. Crée l'onglet fournisseur dans `FournisseursMds` si nouveau (duplique le template Gifemetal)
5. Ajoute la ligne facture en bas du tableau de l'onglet
6. Déplace le PDF de `inbox/` vers `archive/<fournisseur>/`
7. Bascule le label Gmail sur `Factures-archivees` (ou `Factures-a-verifier` si problème)
8. Envoie un email récap à yannisfleury42@gmail.com avec les ajouts

## Installation (à faire 1 fois)

### Étape 1 — Créer la clé Gemini (2 min, gratuit)

1. Va sur https://aistudio.google.com/apikey
2. Connecte-toi avec metallier.mds@gmail.com (ou ton compte perso)
3. Clique **"Create API key"** → **"Create API key in new project"** (ou choisis ton projet existant)
4. Copie la clé qui s'affiche (commence par `AIza...`)

> Pas de CB demandée. Quota gratuit largement suffisant (1500 req/jour vs ~10 factures/jour max chez toi).

### Étape 2 — Coller le script dans le Sheet

1. Ouvre le Sheet [FournisseursMds](https://docs.google.com/spreadsheets/d/1IqigGsUzyg_MgmVq6X_I_ejG_poH35hZ6Qez6V4F_xE/edit)
2. **Extensions → Apps Script**
3. Crée un nouveau fichier `.gs` nommé `FournisseursAuto.gs` (icône `+` à côté de "Fichiers")
4. Colle le contenu de `Code.gs`
5. **Sauvegarde** (Ctrl+S)

### Étape 3 — Renseigner la clé Gemini

**Méthode A — Via l'UI Apps Script (recommandé, plus sûr) :**

1. Dans l'éditeur Apps Script, en haut à gauche, clique **⚙ Paramètres du projet** (icône engrenage)
2. Descends jusqu'à **"Propriétés du script"**
3. Clique **"Ajouter une propriété de script"**
4. Nom : `GEMINI_API_KEY` — Valeur : ta clé `AIza...`
5. **Enregistrer les propriétés du script**

**Méthode B — Via la fonction setGeminiKey (plus rapide mais clé en clair) :**

1. Dans le code, remplace `COLLE_TA_CLE_ICI` par ta vraie clé
2. Sélectionne la fonction `setGeminiKey` dans le menu déroulant haut → **Exécuter**
3. Une popup confirme que la clé est sauvegardée
4. **IMPORTANT** : retire la clé du code et remets `COLLE_TA_CLE_ICI`, puis sauvegarde

### Étape 4 — Installer le trigger horaire

1. Dans le menu déroulant des fonctions, choisis `setupTriggers` → **Exécuter**
2. Autorise les permissions (Gmail, Drive, Sheets, UrlFetch) à la première exécution
3. Vérifie dans l'onglet **Déclencheurs** (icône horloge à gauche) que `processInvoicesEnd2End` est planifié toutes les heures

### Étape 5 — Tester immédiatement

1. Envoie-toi un mail avec une facture PDF en pièce jointe
2. Mets le label `Factures-a-traiter` sur ce mail (créer ce label dans Gmail si besoin)
3. Dans Apps Script, exécute la fonction `runOnce` (au lieu d'attendre 1h)
4. Vérifie :
   - Le PDF a bougé de `inbox/` vers `archive/<fournisseur>/`
   - Une nouvelle ligne existe dans l'onglet fournisseur du Sheet
   - Un email récap est arrivé dans ta boîte
   - Le mail Gmail a basculé sur `Factures-archivees`

## Fonctionnement quotidien

À partir de l'installation, tu n'as plus rien à faire :

- **Côté MDS** : tu appliques le label `Factures-a-traiter` sur les mails de factures (ou ton add-on Gmail V2 le fait pour toi)
- **Côté script** : toutes les heures, le pipeline se déclenche
- **Côté toi** : tu reçois un email récap quand des factures ont été traitées

## Cas problématiques

| Cas | Comportement |
|---|---|
| Gemini extrait avec confiance < 0.7 | Ligne ajoutée mais surlignée jaune dans le Sheet + statut "À VÉRIFIER" + le mail garde le label `Factures-a-verifier` |
| Gemini plante ou réponse invalide | PDF reste dans `inbox/`, email d'alerte, mail labellisé `Factures-a-verifier` |
| Quota Gemini dépassé (improbable) | Idem ci-dessus, retry naturel à l'heure suivante |
| Mail sans PDF avec label `Factures-a-traiter` | Mail ignoré, garde le label (à corriger côté toi) |

## Coexistence avec l'existant

- **Gmail Add-on V2** (`apps-script-gmail-addon-factures`) : continue à fonctionner. Tu peux toujours cliquer "Analyser cette facture" pour copier un PDF dans inbox sans attendre le trigger. Le PDF sera traité au prochain run.
- **Script V1** (`apps-script-gmail-factures` avec `processInvoices`) : **désactivé automatiquement** par `setupTriggers()` qui supprime ses anciens triggers. Tu peux supprimer ce projet Apps Script si tu veux faire propre.

## Architecture

```
Gmail (label Factures-a-traiter)
    │
    ▼
[trigger horaire] processInvoicesEnd2End()
    │
    ├─► Drive/Factures-fournisseurs/inbox/   (copie temporaire)
    │
    ├─► Gemini API (extraction JSON structuré)
    │
    ├─► Sheet FournisseursMds
    │     ├─ onglet existe ? oui → ajoute ligne
    │     └─ non → duplique Gifemetal + renomme + ligne
    │
    ├─► Drive/Factures-fournisseurs/archive/<fournisseur>/
    │
    └─► email récap → yannisfleury42@gmail.com
```
