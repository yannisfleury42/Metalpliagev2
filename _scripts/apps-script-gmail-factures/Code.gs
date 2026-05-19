/**
 * MDS - Factures fournisseurs : Gmail vers Google Drive
 *
 * Recupere les PJ PDF des mails portant le label "Factures-a-traiter",
 * les depose dans le dossier Drive "Factures-fournisseurs/inbox",
 * puis bascule le label sur "Factures-archivees" pour ne pas retraiter.
 *
 * Installation : voir README.md a cote.
 */

// === CONFIG ====================================================
var LABEL_TODO   = "Factures-a-traiter";
var LABEL_DONE   = "Factures-archivees";
var DRIVE_FOLDER = "Factures-fournisseurs";
var INBOX_SUBDIR = "inbox";
var MAX_THREADS  = 50;
// ===============================================================


function processInvoices() {
  var labelTodo = getOrCreateLabel_(LABEL_TODO);
  var labelDone = getOrCreateLabel_(LABEL_DONE);
  var inbox     = getOrCreateInboxFolder_();

  var threads = labelTodo.getThreads(0, MAX_THREADS);
  if (threads.length === 0) {
    Logger.log("Rien a traiter.");
    return;
  }

  var savedCount = 0;
  threads.forEach(function (thread) {
    var messages = thread.getMessages();
    var threadHasPdf = false;

    messages.forEach(function (msg) {
      var attachments = msg.getAttachments({ includeInlineImages: false });
      attachments.forEach(function (att) {
        if (!isPdf_(att)) return;

        var filename  = buildFilename_(msg, att);
        var finalName = uniqueFilename_(inbox, filename);
        inbox.createFile(att.copyBlob().setName(finalName));
        savedCount++;
        threadHasPdf = true;
        Logger.log("Saved: " + finalName);
      });
    });

    if (threadHasPdf) {
      thread.removeLabel(labelTodo);
      thread.addLabel(labelDone);
    } else {
      Logger.log("Thread sans PDF : " + thread.getFirstMessageSubject());
    }
  });

  Logger.log("Total PDFs sauvegardes : " + savedCount);
}


function setup() {
  getOrCreateLabel_(LABEL_TODO);
  getOrCreateLabel_(LABEL_DONE);
  getOrCreateInboxFolder_();
  Logger.log("OK - Labels Gmail crees : " + LABEL_TODO + " / " + LABEL_DONE);
  Logger.log("OK - Dossier Drive pret : " + DRIVE_FOLDER + "/" + INBOX_SUBDIR);
}


function installHourlyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "processInvoices") {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger("processInvoices")
    .timeBased()
    .everyHours(1)
    .create();
  Logger.log("OK - Trigger horaire installe.");
}


// --- Helpers --------------------------------------------------

function getOrCreateLabel_(name) {
  var l = GmailApp.getUserLabelByName(name);
  if (!l) l = GmailApp.createLabel(name);
  return l;
}

function getOrCreateInboxFolder_() {
  var root = getOrCreateChildFolder_(DriveApp.getRootFolder(), DRIVE_FOLDER);
  return getOrCreateChildFolder_(root, INBOX_SUBDIR);
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
    var dot  = name.lastIndexOf(".");
    var base = dot > 0 ? name.slice(0, dot) : name;
    var ext  = dot > 0 ? name.slice(dot)    : "";
    candidate = base + "_" + i + ext;
    i++;
  }
  return candidate;
}
