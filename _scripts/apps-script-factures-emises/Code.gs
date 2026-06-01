/**
 * MDS — Integration automatique des factures emises
 *
 * Scanne le dossier Drive `Factures MDS\` toutes les heures et integre
 * dans le Google Sheet de suivi les factures F-{annee}-* qui n'y sont
 * pas encore. Supporte .xls et .xlsx (convertis temporairement en Sheet
 * via Drive API pour pouvoir lire les cellules).
 *
 * Setup : voir README.md
 */

// ====== CONFIGURATION ======
const FOLDER_NAME = 'Factures MDS';
const SHEET_ID = '1xCYqIvlNARN3gkHgm6gTS2SIoq4gzQpDLwxu9QfMaJI';
const SHEET_TAB = 'SuiviFactures';
const YEAR_FILTER = new Date().getFullYear();  // 2026 actuellement, change auto chaque annee
// ===========================


/**
 * Fonction principale — declenchee par le trigger horaire.
 * Detecte et integre les nouvelles factures de l'annee courante.
 */
function integrateFacturesEmises() {
  const pattern = new RegExp('F-' + YEAR_FILTER + '-\\d{3,4}');

  // 1) Ouvre le dossier source
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (!folders.hasNext()) {
    Logger.log('ERREUR : dossier "%s" introuvable', FOLDER_NAME);
    return;
  }
  const folder = folders.next();

  // 2) Ouvre le Sheet et liste les N° deja presents (col B)
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_TAB);
  if (!sheet) {
    Logger.log('ERREUR : onglet "%s" introuvable dans le Sheet', SHEET_TAB);
    return;
  }
  const existing = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow >= 3) {
    const vals = sheet.getRange(3, 2, lastRow - 2, 1).getValues();
    vals.forEach(r => { const v = String(r[0] || '').trim(); if (v) existing.add(v); });
  }

  // 3) Liste les fichiers candidats du dossier
  const candidates = [];
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    const name = f.getName();
    const m = name.match(pattern);
    if (!m) continue;
    if (existing.has(m[0])) continue;
    const ext = name.toLowerCase().split('.').pop();
    if (ext !== 'xls' && ext !== 'xlsx') continue;
    candidates.push({ num: m[0], file: f, ext: ext });
  }

  if (candidates.length === 0) {
    Logger.log('OK — rien a faire (%s factures deja a jour dans le tableau).', existing.size);
    return;
  }

  candidates.sort((a, b) => a.num.localeCompare(b.num));
  Logger.log('%s nouvelle(s) facture(s) a integrer.', candidates.length);

  // 4) Extraction des donnees AVANT insertion (pour savoir combien de lignes inserer)
  const rows = [];
  const inserted = [];
  const errors = [];
  candidates.forEach(c => {
    try {
      const d = extractFromFile(c.file);
      if (!d.num || d.ht == null || d.ttc == null) {
        throw new Error('donnees incompletes (HT=' + d.ht + ', TTC=' + d.ttc + ')');
      }
      rows.push([
        d.client,                       // A : Client
        d.num,                          // B : N° Facture
        d.date,                         // C : Date emission
        '',                             // D : Date echeance
        d.ht,                           // E : Montant HT
        d.ttc,                          // F : Montant TTC
        'En attente',                   // G : Statut
        '',                             // H : Relance
        'Source: ' + c.file.getName()   // I : Commentaire
      ]);
      inserted.push(d.num + ' (' + d.client + ')');
    } catch (e) {
      errors.push(c.num + ' : ' + e.message);
    }
  });

  // 5) Insertion INTELLIGENTE : apres la derniere ligne avec col A ET col B remplies
  //    (= apres la derniere vraie facture, avant les eventuels templates vides pre-saisis)
  if (rows.length > 0) {
    const lastValidRow = findLastValidRow(sheet);
    sheet.insertRowsAfter(lastValidRow, rows.length);
    sheet.getRange(lastValidRow + 1, 1, rows.length, 9).setValues(rows);
    Logger.log('Insere %s ligne(s) apres la ligne %s', rows.length, lastValidRow);
  }

  // 6) Log final
  if (inserted.length > 0) Logger.log('INTEGREES (%s) : %s', inserted.length, inserted.join(' | '));
  if (errors.length > 0) Logger.log('ERREURS (%s) : %s', errors.length, errors.join(' | '));
}


/**
 * Trouve la derniere ligne avec col A ET col B non vides (= vraie facture complete).
 * Permet d'inserer apres, sans tomber dans la zone de templates pre-saisis vides.
 */
function findLastValidRow(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return 2;  // juste apres les en-tetes
  const vals = sheet.getRange(3, 1, lastRow - 2, 2).getValues();
  for (let i = vals.length - 1; i >= 0; i--) {
    const a = String(vals[i][0] || '').trim();
    const b = String(vals[i][1] || '').trim();
    if (a && b) return i + 3;  // 1-indexed
  }
  return 2;
}


/**
 * Convertit temporairement un .xls/.xlsx en Sheet pour lire les cellules,
 * extrait les donnees du template MDS, puis supprime la copie.
 */
function extractFromFile(file) {
  // Conversion via Drive API v3 (Advanced Service a activer)
  const tempCopy = Drive.Files.copy(
    { name: '__TEMP_FACTURE_' + new Date().getTime(), mimeType: MimeType.GOOGLE_SHEETS },
    file.getId()
  );

  try {
    const ss = SpreadsheetApp.openById(tempCopy.id);
    const ws = ss.getSheets()[0];

    const num = String(ws.getRange('D23').getValue() || '').trim();
    const client = String(ws.getRange('H22').getValue() || '').trim();
    const date = ws.getRange('D25').getValue();

    // Recherche dynamique des labels TOTAL HT / TOTAL TTC dans la colonne H
    const colH = ws.getRange(30, 8, Math.min(80, ws.getLastRow() - 29), 1).getValues();
    let ht = null, ttc = null;
    for (let i = 0; i < colH.length; i++) {
      const v = String(colH[i][0] || '').trim().toUpperCase().replace(/\s|\./g, '');
      const row = 30 + i;
      if (v === 'TOTALHT')       ht = ws.getRange(row, 10).getValue();
      else if (v === 'TOTALTTC') ttc = ws.getRange(row, 10).getValue();
    }

    return { num: num, client: client, date: date, ht: ht, ttc: ttc };
  } finally {
    // Toujours supprimer la copie temporaire, meme en cas d'erreur
    try { Drive.Files.remove(tempCopy.id); } catch (e) {}
  }
}


/**
 * A executer UNE SEULE FOIS pour creer le trigger horaire.
 * Apres ca, integrateFacturesEmises() tournera toutes les heures.
 */
function createTrigger() {
  // Supprime les triggers existants pour cette fonction
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'integrateFacturesEmises') {
      ScriptApp.deleteTrigger(t);
    }
  });
  // Cree le nouveau trigger
  ScriptApp.newTrigger('integrateFacturesEmises')
    .timeBased()
    .everyHours(1)
    .create();
  Logger.log('Trigger cree : execution toutes les heures.');
}


/**
 * Helper de debug — supprime tous les triggers (au cas ou).
 */
function deleteAllTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  Logger.log('Tous les triggers supprimes.');
}


/**
 * A EXECUTER UNE SEULE FOIS pour compacter le tableau :
 * lit toutes les lignes a partir de la ligne 3, garde uniquement celles
 * qui ont col A ET col B remplies (= vraies factures), supprime les
 * templates vides et lignes orphelines, puis reecrit le tout compact.
 *
 * Approche radicale : pas de delete/insertRow (qui casse les Tables Google
 * Sheets), juste un clearContent + setValues. Preserve l'ordre original.
 */
function cleanupAndReinsert() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_TAB);
  const lastRow = sheet.getLastRow();
  const lastCol = 9;  // colonnes A a I

  if (lastRow < 3) {
    Logger.log('Tableau vide, rien a faire.');
    return;
  }

  // 1) Lire toutes les donnees a partir de la ligne 3 (apres en-tetes + ligne totaux)
  const data = sheet.getRange(3, 1, lastRow - 2, lastCol).getValues();

  // 2) Filtrer : garder uniquement les vraies factures (col A ET col B remplies)
  //    En conservant l'ordre original (pas de tri)
  const kept = data.filter(row => {
    const a = String(row[0] || '').trim();
    const b = String(row[1] || '').trim();
    return a && b;
  });

  const removed = data.length - kept.length;
  Logger.log('=== ANALYSE ===');
  Logger.log('Lignes lues (lignes 3 a %s) : %s', lastRow, data.length);
  Logger.log('Lignes valides conservees   : %s', kept.length);
  Logger.log('Lignes vides supprimees     : %s', removed);

  if (removed === 0) {
    Logger.log('Rien a nettoyer, tableau deja compact.');
    return;
  }

  // 3) Effacer entierement la zone de donnees (sans toucher aux lignes elles-memes)
  sheet.getRange(3, 1, data.length, lastCol).clearContent();

  // 4) Reecrire les donnees compactees a partir de la ligne 3
  if (kept.length > 0) {
    sheet.getRange(3, 1, kept.length, lastCol).setValues(kept);
  }

  Logger.log('=== CLEANUP TERMINE : tableau compact a %s lignes ===', kept.length);
}


/**
 * Helper de debug — liste tous les onglets du Sheet et cherche ou se trouvent
 * les factures F-2026-* (pour verifier ou le script a vraiment ecrit).
 */
function debugWhereAreFactures() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Logger.log('=== Sheet : %s ===', ss.getName());
  Logger.log('URL : %s', ss.getUrl());
  Logger.log('Onglets disponibles :');
  ss.getSheets().forEach(sh => {
    Logger.log('  - "%s" (lignes=%s, gid=%s)', sh.getName(), sh.getLastRow(), sh.getSheetId());
  });

  // Cherche les F-2026-* dans tous les onglets
  Logger.log('\n=== Recherche des F-2026-* ===');
  ss.getSheets().forEach(sh => {
    const lastRow = sh.getLastRow();
    if (lastRow < 1) return;
    const vals = sh.getRange(1, 2, lastRow, 1).getValues();  // colonne B
    const found = [];
    vals.forEach((r, i) => {
      const v = String(r[0] || '').trim();
      if (v.match(/^F-2026-/)) found.push('L' + (i + 1) + ': ' + v);
    });
    if (found.length > 0) {
      Logger.log('Onglet "%s" : %s factures 2026', sh.getName(), found.length);
      Logger.log('  Premiere : %s', found[0]);
      Logger.log('  Derniere : %s', found[found.length - 1]);
    } else {
      Logger.log('Onglet "%s" : aucune F-2026-*', sh.getName());
    }
  });
}
