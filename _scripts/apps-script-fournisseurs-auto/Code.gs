/**
 * MDS - Factures fournisseurs : pipeline end-to-end automatique
 *
 * Trigger horaire :
 *   Gmail label "Factures-a-traiter" -> PDF dans Drive/inbox
 *   -> extraction Gemini -> creation onglet si besoin
 *   -> ajout ligne dans Sheet FournisseursMds
 *   -> deplacement PDF vers archive/<fournisseur>/
 *   -> bascule label "Factures-archivees" + email recap quotidien
 *
 * A COLLER dans le projet Apps Script du Sheet FournisseursMds :
 *   https://docs.google.com/spreadsheets/d/1IqigGsUzyg_MgmVq6X_I_ejG_poH35hZ6Qez6V4F_xE/edit
 *   Extensions > Apps Script > nouveau fichier "FournisseursAuto.gs"
 *
 * Installation :
 *   1. Coller ce code
 *   2. Executer une fois la fonction `setGeminiKey` apres avoir mis ta cle dans le code
 *      (ou via Apps Script UI : Project Settings > Script Properties > ajouter GEMINI_API_KEY)
 *   3. Executer une fois `setupTriggers` (supprime les anciens triggers + installe le nouveau horaire)
 *   4. Verifier dans Triggers que `processInvoicesEnd2End` est planifie toutes les heures
 *   5. Optionnel : executer `processInvoicesEnd2End` une fois a la main pour test
 */

// === CONFIG ====================================================
var LABEL_TODO       = "Factures-a-traiter";
var LABEL_DONE       = "Factures-archivees";
var LABEL_ERROR      = "Factures-a-verifier";
var DRIVE_FOLDER     = "Factures-fournisseurs";
var INBOX_SUBDIR     = "inbox";
var ARCHIVE_SUBDIR   = "archive";
var TEMPLATE_TAB     = "Gifemetal";          // onglet vide servant de template
var MAX_THREADS      = 30;
var GEMINI_MODEL     = "gemini-2.5-flash";  // stable, moins de 503 que gemini-flash-latest
var NOTIFY_EMAIL     = "yannisfleury42@gmail.com";  // recap quotidien
var MIN_CONFIDENCE   = 0.7;                  // en dessous = ligne marquee "A verifier"
var INVOICE_START_ROW = 4;                   // ligne 4 = premiere facture dans un onglet
// ===============================================================


/**
 * Fonction principale : a brancher sur un trigger horaire.
 * Scanne directement Drive/Factures-fournisseurs/inbox/ et traite tous les PDFs.
 * L'add-on Gmail V2 ("Analyser cette facture") depose les PDFs dans ce dossier,
 * donc on n'a pas besoin de gerer les labels Gmail ici.
 */
function processInvoicesEnd2End() {
  var apiKey = getGeminiApiKey_();
  if (!apiKey) {
    Logger.log("Pas de cle Gemini configuree. Voir setGeminiKey.");
    return;
  }

  var inbox   = getOrCreateChildFolder_(getOrCreateChildFolder_(DriveApp.getRootFolder(), DRIVE_FOLDER), INBOX_SUBDIR);
  var archive = getOrCreateChildFolder_(getOrCreateChildFolder_(DriveApp.getRootFolder(), DRIVE_FOLDER), ARCHIVE_SUBDIR);
  var ss      = SpreadsheetApp.openById("1IqigGsUzyg_MgmVq6X_I_ejG_poH35hZ6Qez6V4F_xE");

  var results = [];
  var files = inbox.getFilesByType(MimeType.PDF);
  while (files.hasNext()) {
    var file = files.next();
    try {
      var result = processOnePdfFromDrive_(file, archive, ss, apiKey);
      results.push(result);
    } catch (err) {
      Logger.log("ERREUR sur " + file.getName() + " : " + err);
      results.push({ status: "ERROR", file: file.getName(), error: String(err) });
    }
  }

  if (results.length > 0) {
    sendDigestEmail_(results);
  }
  Logger.log("Termine. " + results.length + " PDF(s) traite(s).");
}


/**
 * Traite un PDF deja present dans Drive/inbox/ : extraction + ajout Sheet + deplacement archive.
 * Retourne un objet recap.
 */
function processOnePdfFromDrive_(file, archive, ss, apiKey) {
  var pdfBlob = file.getBlob();

  // 1. Extraction Gemini
  var existingTabs = ss.getSheets().map(function (s) { return s.getName(); });
  var extraction = extractWithGemini_(pdfBlob, apiKey, existingTabs);

  if (!extraction || !extraction.fournisseur) {
    return { status: "ERROR", file: file.getName(), error: "Extraction Gemini echouee" };
  }

  // 1bis. Si ce n'est pas une facture (CGV, devis, accuse, relance...) -> deplace vers _non-factures/ et stop
  var notInvoice = (extraction.is_facture === false) ||
                   (!extraction.n_facture && (!extraction.montant_ttc || extraction.montant_ttc === 0));
  if (notInvoice) {
    var nonFacturesFolder = getOrCreateChildFolder_(archive, "_non-factures");
    file.moveTo(nonFacturesFolder);
    return {
      status: "NOT_INVOICE",
      file: file.getName(),
      type: extraction.document_type || "non-facture",
      supplier: extraction.fournisseur,
      notes: extraction.notes || ""
    };
  }

  // 2. Trouve ou cree l'onglet fournisseur
  var supplierName = extraction.fournisseur.trim();
  var sheet = ss.getSheetByName(supplierName);
  var created = false;
  if (!sheet) {
    var template = ss.getSheetByName(TEMPLATE_TAB);
    if (!template) {
      return { status: "ERROR", file: file.getName(), error: "Template '" + TEMPLATE_TAB + "' introuvable" };
    }
    sheet = template.copyTo(ss);
    sheet.setName(supplierName);
    sheet.getRange("A1").setValue(supplierName);
    created = true;
  }

  // 3. Ajoute la ligne facture en fin de tableau
  var nextRow = findNextEmptyRow_(sheet);
  var row = [
    extraction.n_facture || "",
    parseDate_(extraction.date_reception) || new Date(),
    parseDate_(extraction.date_echeance) || "",
    extraction.chantier || "",
    extraction.montant_ttc || 0,
    "à payer",
    (extraction.moyen_paiement || "virement").toLowerCase()
  ];
  sheet.getRange(nextRow, 1, 1, 7).setValues([row]);

  // Si confiance basse, marque la ligne d'une couleur d'alerte
  var lowConfidence = (extraction.confidence || 0) < MIN_CONFIDENCE;
  if (lowConfidence) {
    sheet.getRange(nextRow, 1, 1, 7).setBackground("#fff3cd"); // jaune
    sheet.getRange(nextRow, 6).setValue("À VÉRIFIER"); // overwrite statut
  }

  // 4. Deplace le PDF vers archive/<fournisseur>/
  var supplierFolder = getOrCreateChildFolder_(archive, supplierName);
  file.moveTo(supplierFolder);

  return {
    status: lowConfidence ? "LOW_CONFIDENCE" : "OK",
    file: file.getName(),
    supplier: supplierName,
    created_tab: created,
    invoice_no: extraction.n_facture,
    amount: extraction.montant_ttc,
    chantier: extraction.chantier,
    confidence: extraction.confidence,
    row: nextRow
  };
}


/**
 * Appel Gemini API pour extraire les donnees structurees du PDF.
 * Strategie de resilience :
 *  - Retry avec backoff exponentiel sur 503 (UNAVAILABLE) et 429 (rate limit)
 *  - Fallback automatique vers d'autres modeles si le premier reste indisponible
 */
function extractWithGemini_(pdfBlob, apiKey, existingTabs) {
  var prompt = buildPrompt_(existingTabs);
  var pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());

  var payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "application/pdf", data: pdfBase64 } }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  // Modeles essayes dans l'ordre. Si l'un retourne 503/429 apres 3 tentatives, on passe au suivant.
  var modelsCascade = [GEMINI_MODEL, "gemini-2.0-flash-001", "gemini-flash-latest"];
  var alreadyTried = {};

  for (var m = 0; m < modelsCascade.length; m++) {
    var model = modelsCascade[m];
    if (alreadyTried[model]) continue;
    alreadyTried[model] = true;

    for (var attempt = 1; attempt <= 3; attempt++) {
      var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
      var response = UrlFetchApp.fetch(url, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      var code = response.getResponseCode();

      if (code === 200) {
        var json = JSON.parse(response.getContentText());
        if (!json.candidates || !json.candidates[0]) {
          Logger.log("Gemini 200 mais reponse vide sur " + model);
          return null;
        }
        var text = json.candidates[0].content.parts[0].text;
        try {
          Logger.log("Gemini OK [" + model + "] tentative " + attempt);
          return JSON.parse(text);
        } catch (e) {
          Logger.log("Reponse Gemini non-JSON [" + model + "] : " + text.substring(0, 300));
          return null;
        }
      }

      // 503 (saturation) ou 429 (quota court terme) : retry avec backoff
      if (code === 503 || code === 429) {
        var wait = attempt * 5; // 5s, 10s, 15s
        Logger.log("Gemini " + code + " sur " + model + " (tentative " + attempt + "/3). Backoff " + wait + "s.");
        if (attempt < 3) Utilities.sleep(wait * 1000);
        continue;
      }

      // Autre erreur (400, 403, 500...) : pas de retry, passe au modele suivant
      Logger.log("Gemini erreur " + code + " sur " + model + " : " + response.getContentText().substring(0, 300));
      break;
    }
  }

  Logger.log("ECHEC Gemini : tous les modeles ont echoue (503/429 ou autre).");
  return null;
}


function buildPrompt_(existingTabs) {
  var tabs = existingTabs.filter(function (t) {
    // Exclure les onglets tableau-de-bord
    return ["Tableau de bord", "Fournisseurs", "README", "Gifemetal"].indexOf(t) === -1;
  });
  return "Tu es un assistant comptable francais. Analyse ce PDF et retourne UNIQUEMENT un JSON valide avec les champs suivants :\n" +
         "{\n" +
         "  \"is_facture\": booleen (true UNIQUEMENT si c'est une vraie facture avec un numero de facture ET un montant TTC. false si c'est : devis, conditions generales de vente (CGV), bon de commande, accuse de reception, relance, courrier, ou tout autre document non-facture),\n" +
         "  \"document_type\": \"facture|devis|cgv|bon_commande|accuse_reception|relance|avoir|autre\",\n" +
         "  \"fournisseur\": \"nom court canonique (3-25 caracteres) reutilisable comme nom d'onglet, ex: 'VJB', 'Gantois', 'Charvins'. Si le fournisseur est dans cette liste existante, reutilise EXACTEMENT le nom : " + JSON.stringify(tabs) + ". Sinon choisis un nom court representatif\",\n" +
         "  \"fournisseur_raison_sociale\": \"raison sociale complete telle qu'imprimee\",\n" +
         "  \"n_facture\": \"numero de facture (vide si pas une facture)\",\n" +
         "  \"date_reception\": \"date d'emission/reception au format YYYY-MM-DD\",\n" +
         "  \"date_echeance\": \"date d'echeance au format YYYY-MM-DD, vide si non specifiee\",\n" +
         "  \"chantier\": \"nom du chantier ou objet de la facture (ex: 'BOURGIN Pare Vue (CH260050)'). Cherche les mentions chantier/affaire/reference\",\n" +
         "  \"montant_ttc\": nombre decimal en euros (point comme separateur, ex: 1920.00, 0 si pas une facture),\n" +
         "  \"montant_ht\": nombre decimal en euros,\n" +
         "  \"taux_tva\": nombre (ex: 20),\n" +
         "  \"moyen_paiement\": \"virement|cheque|traite|prelevement|carte|espece selon le mode indique\",\n" +
         "  \"confidence\": nombre entre 0 et 1 (ta confiance dans l'extraction globale; 0.9+ si facture claire, 0.5- si scan illisible),\n" +
         "  \"notes\": \"alerte ou remarque libre, vide si rien a signaler. Si is_facture=false, indique brievement le type de document\"\n" +
         "}\n" +
         "Aucun autre texte hors du JSON. Pas de markdown, pas de backticks.";
}


/**
 * Trouve la prochaine ligne vide dans un onglet fournisseur.
 */
function findNextEmptyRow_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < INVOICE_START_ROW) return INVOICE_START_ROW;
  // Cherche apres la derniere ligne avec un N° facture en col A
  for (var r = INVOICE_START_ROW; r <= lastRow + 1; r++) {
    var v = sheet.getRange(r, 1).getValue();
    if (v === "" || v === null) return r;
  }
  return lastRow + 1;
}


function parseDate_(s) {
  if (!s) return null;
  if (s instanceof Date) return s;
  var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  var d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}


/**
 * Envoie un email recap a Yannis avec les factures traitees.
 */
function sendDigestEmail_(results) {
  var ok = results.filter(function (r) { return r.status === "OK"; });
  var low = results.filter(function (r) { return r.status === "LOW_CONFIDENCE"; });
  var err = results.filter(function (r) { return r.status === "ERROR"; });
  var notInvoice = results.filter(function (r) { return r.status === "NOT_INVOICE"; });

  var subject = "[MDS Factures] " + results.length + " PDF(s) — " +
                ok.length + " OK / " + low.length + " a verifier / " + notInvoice.length + " non-factures / " + err.length + " erreurs";

  var html = "<h3>Recap traitement automatique</h3>";
  if (ok.length) {
    html += "<h4 style='color:#1a7f37'>✅ " + ok.length + " ajoute(s) automatiquement</h4><ul>";
    ok.forEach(function (r) {
      html += "<li><b>" + r.supplier + "</b> — " + r.invoice_no + " — " +
              (r.amount ? r.amount.toFixed(2) + " € TTC" : "?") +
              (r.chantier ? " — " + r.chantier : "") +
              (r.created_tab ? " <span style='background:#dafbe1;padding:2px 6px'>NOUVEL ONGLET</span>" : "") +
              " (confidence " + (r.confidence || "?") + ")</li>";
    });
    html += "</ul>";
  }
  if (low.length) {
    html += "<h4 style='color:#bf8700'>⚠ " + low.length + " a verifier (confiance basse)</h4><ul>";
    low.forEach(function (r) {
      html += "<li><b>" + r.supplier + "</b> — " + r.invoice_no + " — " +
              (r.amount ? r.amount.toFixed(2) + " € TTC" : "?") +
              " (confidence " + (r.confidence || "?") + ") — ligne " + r.row + " du Sheet marquee jaune</li>";
    });
    html += "</ul>";
  }
  if (notInvoice.length) {
    html += "<h4 style='color:#0969da'>📁 " + notInvoice.length + " non-facture(s) deplacee(s) vers archive/_non-factures/</h4><ul>";
    notInvoice.forEach(function (r) {
      html += "<li>" + r.file + " — type : <b>" + (r.type || "non-facture") + "</b>" +
              (r.supplier ? " (" + r.supplier + ")" : "") +
              (r.notes ? " — " + r.notes : "") + "</li>";
    });
    html += "</ul>";
  }
  if (err.length) {
    html += "<h4 style='color:#cf222e'>❌ " + err.length + " erreur(s)</h4><ul>";
    err.forEach(function (r) {
      html += "<li>" + r.file + " — " + (r.error || "?") + "</li>";
    });
    html += "</ul>";
  }
  html += "<p style='color:#888;font-size:11px'>Sheet : <a href='https://docs.google.com/spreadsheets/d/1IqigGsUzyg_MgmVq6X_I_ejG_poH35hZ6Qez6V4F_xE/edit'>FournisseursMds</a></p>";

  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, htmlBody: html });
}


// --- Helpers Drive / Gmail --------------------------------------------------

function getOrCreateLabel_(name) {
  var l = GmailApp.getUserLabelByName(name);
  if (!l) l = GmailApp.createLabel(name);
  return l;
}

function getOrCreateChildFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function isPdf_(attachment) {
  var ct = (attachment.getContentType() || "").toLowerCase();
  var nm = (attachment.getName() || "").toLowerCase();
  return ct === "application/pdf" || nm.indexOf(".pdf") === nm.length - 4;
}

function buildFilename_(msg, att) {
  var d = msg.getDate();
  var iso = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
  var from = (msg.getFrom() || "")
    .replace(/<[^>]+>/g, "")
    .replace(/["']/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_\-]/g, "")
    .slice(0, 30) || "inconnu";
  var original = (att.getName() || "facture.pdf").replace(/[\\\/:*?"<>|]/g, "_");
  return iso + "__" + from + "__" + original;
}

function uniqueFilename_(folder, name) {
  var candidate = name;
  var i = 2;
  while (folder.getFilesByName(candidate).hasNext()) {
    var dot = name.lastIndexOf(".");
    var base = dot > 0 ? name.slice(0, dot) : name;
    var ext = dot > 0 ? name.slice(dot) : "";
    candidate = base + "_" + i + ext;
    i++;
  }
  return candidate;
}


// --- Setup --------------------------------------------------

/**
 * A executer 1 fois apres collage du script.
 * Configure la cle Gemini dans les Script Properties (plus secure que en dur dans le code).
 * Remplace 'COLLE_TA_CLE_ICI' par ta cle reelle, execute, puis VIDE le parametre.
 */
function setGeminiKey() {
  var KEY = "COLLE_TA_CLE_ICI"; // <-- remplace puis execute
  if (KEY === "COLLE_TA_CLE_ICI") {
    SpreadsheetApp.getUi().alert("Edite la fonction setGeminiKey et remplace COLLE_TA_CLE_ICI par ta vraie cle Gemini.");
    return;
  }
  PropertiesService.getScriptProperties().setProperty("GEMINI_API_KEY", KEY);
  SpreadsheetApp.getUi().alert("Cle Gemini sauvegardee.");
}

function getGeminiApiKey_() {
  return PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
}

/**
 * A executer 1 fois pour installer le trigger horaire.
 * Supprime les anciens triggers `processInvoices` (V1) et `processInvoicesEnd2End` existants.
 */
function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    var fn = t.getHandlerFunction();
    if (fn === "processInvoices" || fn === "processInvoicesEnd2End") {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger("processInvoicesEnd2End")
    .timeBased()
    .everyHours(1)
    .create();
  Logger.log("OK - Trigger horaire installe sur processInvoicesEnd2End.");
}

/**
 * Test rapide : execute processInvoicesEnd2End immediatement (sans attendre le trigger).
 */
function runOnce() {
  processInvoicesEnd2End();
}


/**
 * Range les onglets fournisseurs par ordre alphabetique (insensible a la casse, locale FR).
 * Les onglets systeme ("Tableau de bord", "Fournisseurs") restent en debut.
 * Utilise Sheets API batchUpdate pour repositionner en 1 seul appel (evite le timeout).
 *
 * PREREQUIS : activer le service avance "Google Sheets API" dans Apps Script
 *   Editeur Apps Script > "Services" (+ dans la barre gauche) > Google Sheets API > Ajouter
 *
 * A executer manuellement quand tu veux remettre de l'ordre.
 */
function trierOngletsFournisseurs() {
  var ss = SpreadsheetApp.openById("1IqigGsUzyg_MgmVq6X_I_ejG_poH35hZ6Qez6V4F_xE");
  var systemTabs = ["Tableau de bord", "Fournisseurs"];
  var sheets = ss.getSheets();

  var supplierSheets = sheets.filter(function (s) {
    return systemTabs.indexOf(s.getName()) === -1;
  });

  supplierSheets.sort(function (a, b) {
    return a.getName().localeCompare(b.getName(), "fr", { sensitivity: "base" });
  });

  // Compte les onglets systeme presents pour positionner correctement
  var startIndex = 0;
  systemTabs.forEach(function (name) {
    if (ss.getSheetByName(name)) startIndex++;
  });

  // Construire un seul batchUpdate avec toutes les nouvelles positions
  var requests = supplierSheets.map(function (s, idx) {
    return {
      updateSheetProperties: {
        properties: { sheetId: s.getSheetId(), index: startIndex + idx },
        fields: "index"
      }
    };
  });

  // Appel REST direct via UrlFetch (pas besoin d'activer le service avance Sheets API)
  var token = ScriptApp.getOAuthToken();
  var url = "https://sheets.googleapis.com/v4/spreadsheets/" + ss.getId() + ":batchUpdate";
  var response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify({ requests: requests }),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error("Sheets API erreur " + response.getResponseCode() + " : " + response.getContentText());
  }

  SpreadsheetApp.getUi().alert(
    "Tri termine : " + supplierSheets.length + " onglets fournisseurs ranges par ordre alphabetique."
  );
}
