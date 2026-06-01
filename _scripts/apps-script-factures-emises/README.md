# MDS — Apps Script Factures emises (auto-integration)

Integre automatiquement les factures emises (.xls/.xlsx du dossier `Factures MDS\`) dans le Google Sheet de suivi `Suivi_Factures_Visuel_Pro`.

## Setup pas a pas (30 min)

### 1. Ouvrir l'editeur Apps Script

- Ouvre ton Sheet : https://docs.google.com/spreadsheets/d/1xCYqIvlNARN3gkHgm6gTS2SIoq4gzQpDLwxu9QfMaJI/edit
- Menu **Extensions** → **Apps Script**
- Un nouvel onglet s'ouvre avec un editeur de code (fichier `Code.gs` vide par defaut)
- Renomme le projet en haut a gauche : **"MDS Auto Factures Emises"**

### 2. Coller le code

- Supprime tout le contenu de `Code.gs` (le `function myFunction()` par defaut)
- Copie tout le contenu du fichier `Code.gs` de ce dossier et colle-le dans l'editeur
- Sauvegarde : icone disquette en haut ou **Ctrl+S**

### 3. Activer le service Drive avance (CRITIQUE — sans ca le script plante)

- Dans la barre laterale gauche de l'editeur Apps Script, clique sur **Services** (icone `+` a cote)
- Cherche **Drive API** dans la liste
- Selectionne-le, garde la version **v3** par defaut (ou v2 si c'est ce qui est propose), identifier **Drive**
- Clique **Ajouter**

### 4. Premier test manuel

- En haut de l'editeur, dans le menu deroulant des fonctions, selectionne `integrateFacturesEmises`
- Clique **Executer**
- Google va demander des permissions :
  - "Cette application n'est pas verifiee" → clique **Parametres avances** → **Acceder a (non securise)**
  - Coche les permissions demandees (acces Drive + Sheets) → **Autoriser**
- Verifie les logs : menu **Affichage** → **Journaux d'execution** (ou Ctrl+Entree)
- Tu devrais voir : `XX nouvelle(s) facture(s) a integrer.` puis la liste

### 5. Verifier dans le Sheet

- Va sur ton Sheet `Suivi_Factures_Visuel_Pro`
- Tu dois voir les nouvelles lignes ajoutees en bas (avec les bons N°, clients, montants)

### 6. Creer le trigger horaire

- Dans le menu deroulant des fonctions, selectionne `createTrigger`
- Clique **Executer**
- Verifie dans la barre laterale gauche → **Declencheurs** (icone horloge) qu'un trigger toutes les heures est bien cree

C'est tout. Desormais, des qu'une nouvelle facture est ajoutee dans `Factures MDS\`, elle apparaitra dans le Sheet dans l'heure qui suit.

## Comment ca marche

- Toutes les heures, `integrateFacturesEmises()` se lance sur les serveurs Google
- Liste les fichiers `F-{annee}-*` du dossier `Factures MDS\`
- Pour chaque fichier dont le N° n'est pas deja dans la colonne B du Sheet :
  - Copie temporaire en Sheet via Drive API (pour pouvoir lire les cellules d'un .xls/.xlsx)
  - Lit D23 (N°), H22 (client), D25 (date), cherche `TOTAL HT` / `TOTAL TTC` dans colonne H
  - Ajoute une ligne au bas du Sheet
  - Supprime la copie temporaire
- Logs visibles dans **Executions** (barre laterale)

## Si ca ne marche pas

| Symptome | Cause probable | Solution |
|---|---|---|
| `Drive is not defined` | Service Drive API non active | Etape 3 du setup |
| `Cannot read property 'getName' of null` | Dossier `Factures MDS` introuvable | Verifier le nom exact du dossier dans `FOLDER_NAME` |
| `Cannot find sheet "SuiviFactures"` | Onglet renomme | Verifier le nom de l'onglet dans `SHEET_TAB` |
| Quota depassement (apres 100+ factures d'un coup) | Limite Apps Script 6 min | Relancer manuellement, la prochaine fois ca tourne |
| Les .xls anciens ratent | Format different | Les ignorer (les .xls 2026 marchent, les anciens non) |

## Limites assumees

- Annee courante uniquement (filtre `F-{annee}-*`). Change automatiquement le 1er janvier.
- Le trigger horaire est **propre au compte Google qui a cree le script**. Si tu cree le script sous metallier.mds, c'est ce compte qui execute (et qui voit les fichiers).
- Apps Script free : 90 min/jour total de runtime. Largement suffisant pour quelques factures/jour.
