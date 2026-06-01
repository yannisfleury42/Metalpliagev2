/**
 * MDS — Ajout en masse de fournisseurs au Sheet FournisseursMds
 * A coller dans l'editeur Apps Script du Sheet :
 * https://docs.google.com/spreadsheets/d/1IqigGsUzyg_MgmVq6X_I_ejG_poH35hZ6Qez6V4F_xE/edit
 *
 * Procedure :
 * 1. Ouvre le Sheet > Extensions > Apps Script
 * 2. Cree un nouveau fichier (icone "+" a cote de "Fichiers") nomme "AjouterFournisseurs.gs"
 * 3. Colle ce code
 * 4. Sauvegarde (Ctrl+S)
 * 5. Selectionne la fonction `ajouterNouveauxFournisseurs` dans le menu deroulant
 * 6. Clique Executer (autoriser les permissions si demande)
 * 7. Une popup recapitule ce qui a ete cree
 *
 * Le script :
 * - Cree 6 onglets en dupliquant le modele "Gifemetal" (preserve formats/dropdowns)
 * - Renomme chaque onglet et son titre A1
 * - Insere la ligne facture en A4
 * - Saute les onglets qui existeraient deja (idempotent)
 */

function ajouterNouveauxFournisseurs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const template = ss.getSheetByName('Gifemetal');
  if (!template) {
    SpreadsheetApp.getUi().alert('Onglet "Gifemetal" introuvable. Abandon.');
    return;
  }

  // Donnees des 6 factures
  // Format : [N° fac, Date reception, Date echeance, Chantier, Montant TTC, Statut, Moyen paiement]
  const fournisseurs = [
    {
      nom: 'CHRONOMENUISERIES',
      facture: ['F-CM26-000180', new Date('2026-05-19'), null,
                'VERCORS-ALU-183', 8833.32, 'à payer', 'virement'],
      note: 'Acompte 3963.67 EUR deja verse. Solde TTC = 8833.32 EUR.'
    },
    {
      nom: 'GARAGE BEA 2020',
      facture: ['2534', new Date('2026-05-04'), new Date('2026-05-04'),
                'Vehicules MDS (BMW X3 / Mercedes / Ford Transit)', 408.00, 'à payer', 'virement'],
      note: '6 prestations montage+equilibrage cumulees. Echeance immediate.'
    },
    {
      nom: 'RIZZO MACONNERIE',
      facture: ['5-26-3', new Date('2026-05-22'), new Date('2026-05-22'),
                'Argaut - Le Mazet-Saint-Voy', 450.00, 'à payer', 'virement'],
      note: 'Renovation gite. TVA non applicable art.293B (auto-entrepreneur).'
    },
    {
      nom: 'SOFRADEF',
      facture: ['418733', new Date('2026-05-07'), new Date('2026-06-07'),
                'C0022404 - DEP071132 (barreau ouvert H1000)', 172.80, 'à payer', 'virement'],
      note: 'Virement 30J net. Commercial: Steven Tournemaine.'
    },
    {
      nom: 'CPA AUTOMATISME',
      facture: ['FA26000054', new Date('2026-05-11'), new Date('2026-05-11'),
                'Sorbiers - Portail autoportant 22 rue Mollanche', 240.00, 'à payer', 'virement'],
      note: 'Contrat maintenance 2 visites annuelles. Echeance immediate.'
    },
    {
      nom: 'SERMACO',
      facture: ['41-26040503', new Date('2026-04-30'), new Date('2026-05-31'),
                'Vidage site Sermaco - Impasse Varennes', 67.90, 'à payer', 'virement'],
      note: 'Prelevement automatique au 31/05/2026.'
    }
  ];

  const created = [];
  const skipped = [];

  fournisseurs.forEach(f => {
    if (ss.getSheetByName(f.nom)) {
      skipped.push(f.nom);
      return;
    }
    // Duplique le template Gifemetal (preserve formats + dropdowns + couleurs)
    const newSheet = template.copyTo(ss);
    newSheet.setName(f.nom);
    // Change le titre en A1 (qui contenait "Gifemetal")
    newSheet.getRange('A1').setValue(f.nom);
    // Insere la ligne facture en A4 (colonnes A a G)
    newSheet.getRange('A4:G4').setValues([f.facture]);
    created.push(f.nom);
  });

  let msg = '';
  if (created.length > 0) msg += 'Crees (' + created.length + ') :\n- ' + created.join('\n- ') + '\n\n';
  if (skipped.length > 0) msg += 'Deja presents (sautes) (' + skipped.length + ') :\n- ' + skipped.join('\n- ');
  if (!msg) msg = 'Rien a faire.';

  SpreadsheetApp.getUi().alert('Ajout fournisseurs', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
