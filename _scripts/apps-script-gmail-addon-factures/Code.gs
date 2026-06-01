/**
 * MDS Factures - Gmail Add-on
 * Bouton "Analyser cette facture" dans la barre laterale Gmail.
 * Copie les PJ PDF du mail dans Drive/Factures-fournisseurs/inbox/
 * et labellise le thread comme archive.
 */

// === CONFIG ====================================================
var LABEL_DONE   = "Factures-archivees";
var DRIVE_FOLDER = "Factures-fournisseurs";
var INBOX_SUBDIR = "inbox";
// ===============================================================


/**
 * Carte affichee quand on clique sur l'icone sans mail ouvert.
 */
function onHomepage(e) {
  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle("MDS Factures")
      .setSubtitle("Ouvre une facture pour la traiter"));

  var section = CardService.newCardSection();
  section.addWidget(CardService.newTextParagraph()
    .setText("Ouvre un mail contenant une facture PDF, puis clique sur le bouton 'Analyser cette facture'."));
  section.addWidget(CardService.newTextParagraph()
    .setText("Les PDF sont copies dans Drive : <b>" + DRIVE_FOLDER + "/" + INBOX_SUBDIR + "</b>"));
  card.addSection(section);

  return card.build();
}


/**
 * Carte contextuelle affichee quand un mail est ouvert dans Gmail.
 */
function onGmailMessage(e) {
  GmailApp.setCurrentMessageAccessToken(e.gmail.accessToken);
  var msg = GmailApp.getMessageById(e.gmail.messageId);
  var thread = msg.getThread();
  // Scanne TOUS les messages du thread (pas juste le message actif),
  // car la facture peut etre en PJ d'un message precedent.
  var pdfs = collectThreadPdfs_(thread);

  var alreadyDone = hasLabel_(thread, LABEL_DONE);

  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle("MDS Factures")
      .setSubtitle(alreadyDone ? "Deja archive" : "Analyser cette facture"));

  // --- Infos mail ---
  var infoSection = CardService.newCardSection();
  infoSection.addWidget(CardService.newKeyValue()
    .setTopLabel("Sujet")
    .setContent(escapeHtml_(msg.getSubject() || "(sans sujet)"))
    .setMultiline(true));
  infoSection.addWidget(CardService.newKeyValue()
    .setTopLabel("De")
    .setContent(escapeHtml_(msg.getFrom() || "")));
  infoSection.addWidget(CardService.newKeyValue()
    .setTopLabel("PDFs detectes")
    .setContent(String(pdfs.length)));
  card.addSection(infoSection);

  // --- Liste des PDFs ---
  if (pdfs.length > 0) {
    var pdfSection = CardService.newCardSection().setHeader("Pieces jointes PDF");
    pdfs.forEach(function (item) {
      var att = item.att;
      var sizeKB = Math.round(att.getSize() / 1024);
      pdfSection.addWidget(CardService.newKeyValue()
        .setIcon(CardService.Icon.DESCRIPTION)
        .setTopLabel(sizeKB + " Ko")
        .setContent(escapeHtml_(att.getName())));
    });
    card.addSection(pdfSection);
  }

  // --- Bouton action ---
  var actionSection = CardService.newCardSection();
  if (pdfs.length === 0) {
    actionSection.addWidget(CardService.newTextParagraph()
      .setText("<i>Aucun PDF dans ce mail.</i>"));
  } else if (alreadyDone) {
    actionSection.addWidget(CardService.newTextParagraph()
      .setText("Ce mail porte deja le label <b>" + LABEL_DONE + "</b>."));
    actionSection.addWidget(CardService.newTextButton()
      .setText("Re-traiter quand meme")
      .setOnClickAction(CardService.newAction()
        .setFunctionName("analyzeInvoiceAction")
        .setParameters({ messageId: e.gmail.messageId })));
  } else {
    actionSection.addWidget(CardService.newTextButton()
      .setText("Analyser cette facture")
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setOnClickAction(CardService.newAction()
        .setFunctionName("analyzeInvoiceAction")
        .setParameters({ messageId: e.gmail.messageId })));
  }
  card.addSection(actionSection);

  return [card.build()];
}


/**
 * Action declenchee par le bouton "Analyser cette facture".
 */
function analyzeInvoiceAction(e) {
  GmailApp.setCurrentMessageAccessToken(e.gmail.accessToken);
  var msg = GmailApp.getMessageById(e.parameters.messageId);
  var thread = msg.getThread();
  var pdfs = collectThreadPdfs_(thread);

  if (pdfs.length === 0) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText("Aucun PDF a traiter dans ce thread."))
      .build();
  }

  var inbox = getOrCreateInboxFolder_();
  var savedNames = [];
  pdfs.forEach(function (item) {
    var filename  = buildFilename_(item.msg, item.att);
    var finalName = uniqueFilename_(inbox, filename);
    inbox.createFile(item.att.copyBlob().setName(finalName));
    savedNames.push(finalName);
  });

  // Labellise le thread comme archive
  var labelDone = getOrCreateLabel_(LABEL_DONE);
  thread.addLabel(labelDone);

  // Carte de confirmation
  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle("Facture analysee")
      .setSubtitle(savedNames.length + " PDF(s) sauvegarde(s)"));

  var section = CardService.newCardSection().setHeader("Sauvegarde dans Drive");
  section.addWidget(CardService.newTextParagraph()
    .setText("Chemin : <b>" + DRIVE_FOLDER + "/" + INBOX_SUBDIR + "</b>"));
  savedNames.forEach(function (n) {
    section.addWidget(CardService.newKeyValue()
      .setIcon(CardService.Icon.DESCRIPTION)
      .setContent(escapeHtml_(n)));
  });
  card.addSection(section);

  var nextSection = CardService.newCardSection().setHeader("Etape suivante");
  nextSection.addWidget(CardService.newTextParagraph()
    .setText("Dans VS Code, demande a Claude :<br><b>\"traite l'inbox\"</b><br>pour mettre a jour le tableau Factures-fournisseurs.xlsx."));
  card.addSection(nextSection);

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card.build()))
    .setNotification(CardService.newNotification()
      .setText(savedNames.length + " PDF(s) sauvegarde(s) dans Drive"))
    .build();
}


// --- Helpers --------------------------------------------------

/**
 * Parcourt tous les messages d'un thread et renvoie la liste
 * des PJ PDF sous forme {msg, att}.
 */
function collectThreadPdfs_(thread) {
  var result = [];
  var messages = thread.getMessages();
  for (var i = 0; i < messages.length; i++) {
    var atts = messages[i].getAttachments({ includeInlineImages: false });
    for (var j = 0; j < atts.length; j++) {
      if (isPdf_(atts[j])) {
        result.push({ msg: messages[i], att: atts[j] });
      }
    }
  }
  return result;
}

function isPdf_(attachment) {
  var ct = (attachment.getContentType() || "").toLowerCase();
  var nm = (attachment.getName() || "").toLowerCase();
  return ct === "application/pdf" || nm.indexOf(".pdf") === nm.length - 4;
}

function getOrCreateLabel_(name) {
  var l = GmailApp.getUserLabelByName(name);
  if (!l) l = GmailApp.createLabel(name);
  return l;
}

function hasLabel_(thread, labelName) {
  var labels = thread.getLabels();
  for (var i = 0; i < labels.length; i++) {
    if (labels[i].getName() === labelName) return true;
  }
  return false;
}

function getOrCreateInboxFolder_() {
  var root = getOrCreateChildFolder_(DriveApp.getRootFolder(), DRIVE_FOLDER);
  return getOrCreateChildFolder_(root, INBOX_SUBDIR);
}

function getOrCreateChildFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
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
    var dot  = name.lastIndexOf(".");
    var base = dot > 0 ? name.slice(0, dot) : name;
    var ext  = dot > 0 ? name.slice(dot)    : "";
    candidate = base + "_" + i + ext;
    i++;
  }
  return candidate;
}

function escapeHtml_(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
