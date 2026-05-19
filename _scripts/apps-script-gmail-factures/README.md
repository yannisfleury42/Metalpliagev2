# Apps Script — Gmail → Drive pour factures fournisseurs MDS

## Ce que fait ce script

Toutes les heures (ou à la demande), il :
1. Cherche dans Gmail tous les mails portant le label `Factures-a-traiter`
2. Récupère les pièces jointes **PDF** de chaque mail
3. Les dépose dans `Mon Drive/Factures-fournisseurs/inbox/`, nommées : `2026-05-19__GANTOIS_INDUSTRIES__CCF_000062.pdf`
4. Bascule le label du thread sur `Factures-archivees` (pour ne pas le retraiter)

Les PDFs apparaissent alors dans `G:\Mon Drive\Factures-fournisseurs\inbox\` côté Windows → Claude les voit et peut les traiter.

---

## Installation (10 minutes, une seule fois)

### Étape 1 — Ouvre Google Apps Script
1. Va sur **[script.google.com](https://script.google.com)** (connecté avec `metallier.mds@gmail.com`)
2. Clique sur **"Nouveau projet"** en haut à gauche
3. Renomme le projet (icône crayon en haut) → `MDS Factures Gmail → Drive`

### Étape 2 — Colle le code
1. Supprime le code par défaut (`function myFunction() { ... }`)
2. Copie tout le contenu de [`Code.gs`](Code.gs) et colle-le
3. Clique sur **💾 Enregistrer** (Ctrl+S)

### Étape 3 — Première exécution (autorisations)
1. En haut, dans le menu déroulant des fonctions, choisis **`setup`**
2. Clique sur **▶ Exécuter**
3. Google va demander des autorisations :
   - "Autoriser l'accès" → choisis ton compte `metallier.mds@gmail.com`
   - "Google n'a pas validé l'application" → clique **Paramètres avancés** → **Accéder à MDS Factures Gmail → Drive (non sécurisé)**
   - Coche les autorisations demandées (Gmail + Drive) → **Autoriser**
4. Tu devrais voir dans le journal d'exécution :
   ```
   ✓ Labels Gmail créés : Factures-a-traiter / Factures-archivees
   ✓ Dossier Drive prêt : Factures-fournisseurs/inbox
   ```

### Étape 4 — Crée les règles Gmail automatiques (par fournisseur)
Pour ne plus jamais avoir à labelliser à la main :

1. Dans Gmail, clique sur la **⚙ roue dentée** → **Voir tous les paramètres** → onglet **Filtres et adresses bloquées**
2. **Créer un filtre**
3. Champ **De :** → mets `jean-pierre.depreaux@gantois.com` (et plus tard d'autres fournisseurs séparés par `OR`)
4. **Créer le filtre**
5. Coche **Appliquer le libellé** → `Factures-a-traiter`
6. **Créer le filtre** ✓

Répète pour chaque nouveau fournisseur (ou édite le filtre existant pour ajouter `OR autre@fournisseur.fr`).

### Étape 5 — Installe le trigger horaire
1. Retour dans l'éditeur Apps Script
2. Dans le menu déroulant des fonctions, choisis **`installHourlyTrigger`**
3. Clique sur **▶ Exécuter**
4. Vérifie dans **Déclencheurs** (icône horloge à gauche) qu'il y a bien 1 trigger horaire sur `processInvoices`

---

## Test rapide

1. Envoie-toi un mail à `metallier.mds@gmail.com` avec un PDF en PJ
2. Mets-lui à la main le label `Factures-a-traiter`
3. Dans l'éditeur Apps Script : choisis `processInvoices` → **▶ Exécuter**
4. Vérifie :
   - Le PDF est apparu dans `G:\Mon Drive\Factures-fournisseurs\inbox\`
   - Le label du mail est devenu `Factures-archivees`

---

## Usage quotidien

- **Tu ne fais rien.** Quand une facture arrive (d'un fournisseur reconnu par filtre), elle est labellisée automatiquement, puis le PDF descend sur ton Drive dans l'heure.
- **Pour les expéditeurs inconnus** : tu mets le label à la main une fois → le script fait le reste. Tu peux aussi créer un nouveau filtre pour ce fournisseur.
- **Pour faire traiter par Claude** : dis-moi simplement *« Claude, traite l'inbox »*. Je lis tous les PDFs dans `inbox/`, j'ajoute les lignes au tableau, et je déplace chaque PDF dans `archive/<fournisseur>/`.

---

## Si quelque chose cloche

| Symptôme | Solution |
|---|---|
| Le script tourne mais aucun PDF arrive | Vérifie que le mail a bien le label `Factures-a-traiter` (pas une variante) |
| Pas vu de PDF mais juste un image/doc | Le script ignore tout sauf les PDFs. Renomme la PJ en `.pdf` si elle est dans un autre format. |
| Le mail garde le label `Factures-a-traiter` | C'est qu'il n'y avait pas de PDF dans la PJ. Vérifie dans le journal Apps Script. |
| Le PDF arrive 2 fois | Désinstalle puis réinstalle le trigger horaire (cf. étape 5) — il y en a 2 doublés. |
| Trop de mails traités d'un coup | Augmente/réduis `MAX_THREADS` dans `Code.gs` |

---

## Maintenance

- **Voir les logs** : éditeur Apps Script → menu de gauche → **Exécutions**
- **Désactiver temporairement** : **Déclencheurs** → supprime le trigger horaire (relance avec `installHourlyTrigger`)
- **Changer le label** : modifie `LABEL_TODO` / `LABEL_DONE` en tête de `Code.gs`, puis re-exécute `setup`
