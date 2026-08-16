/**
 * CKP webinar registrations -> Google Sheet.
 *
 * This is a container-bound Apps Script: it lives inside the spreadsheet it
 * writes to, so there is no spreadsheet ID to configure. Deployed as a Web App
 * it gives the static landing page somewhere to POST, with no server to run.
 *
 * Setup and redeploy steps are in README.md next to this file. The one that
 * catches everybody: editing this code does nothing until you deploy a NEW
 * VERSION. The old version keeps serving until you do.
 */

/** Tab the rows land on. Created automatically if it does not exist. */
var SHEET_NAME = 'Registrations';

/**
 * Must match CFG.sheetToken in config.jsx.
 *
 * This is NOT security. The token ships inside the page's JavaScript, so anyone
 * who views source can read it. All it does is stop drive-by bots that scrape
 * script.google.com/macros/.../exec URLs from filling the sheet with noise. The
 * real protections are the honeypot and the required-field check below.
 */
var SHARED_TOKEN = '01eb65b7e88f248c1c24de0b793e101d';

/**
 * Column order. First element is the key sent by the page, second is the header
 * written into row 1. Add a field here and in form.jsx and it flows through —
 * existing rows keep their shape because the header row is only written once.
 */
var COLUMNS = [
  ['timestamp',    'Timestamp'],
  ['name',         'Name'],
  ['company',      'Company'],
  ['whatsapp',     'WhatsApp'],
  ['role',         'Role'],
  ['stage',        'Business stage'],
  ['worry',        'Biggest worry'],
  ['worryOther',   'Worry (other)'],
  ['firm',         'Existing firm'],
  ['confidence',   'Confidence today'],
  ['areas',        'Areas of interest'],
  ['source',       'Ad source'],
  ['referrer',     'Referrer'],
  ['submissionId', 'Submission ID']
];

/** Fields a real registration cannot be missing. */
var REQUIRED = ['name', 'company', 'whatsapp', 'role'];

function doPost(e) {
  // Concurrent submissions would otherwise race on appendRow and can interleave
  // or overwrite. Serialise them; 40 seats will never queue long enough to matter.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json({ ok: false, error: 'busy' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: 'empty body' });
    }

    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      return json({ ok: false, error: 'bad json' });
    }

    if (body.token !== SHARED_TOKEN) {
      return json({ ok: false, error: 'bad token' });
    }

    // Honeypot: a hidden field no human can see or fill. Report success so the
    // bot has no signal to adapt to, but write nothing.
    if (body.website) {
      return json({ ok: true, skipped: 'honeypot' });
    }

    for (var i = 0; i < REQUIRED.length; i++) {
      if (!String(body[REQUIRED[i]] || '').trim()) {
        return json({ ok: false, error: 'missing ' + REQUIRED[i] });
      }
    }

    var sheet = getSheet();

    // The page retries on the same submissionId rather than generating a new
    // one, so a retry after a timeout updates nothing instead of adding a
    // second row for the same person.
    var id = String(body.submissionId || '').trim();
    if (id && alreadyRecorded(sheet, id)) {
      return json({ ok: true, duplicate: true });
    }

    var row = COLUMNS.map(function (col) {
      var key = col[0];
      if (key === 'timestamp') {
        return Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyyy-MM-dd HH:mm:ss');
      }
      return String(body[key] || '');
    });

    sheet.appendRow(row);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Opening the /exec URL in a browser hits this. It confirms the deployment is
 * live and reachable without writing a row.
 */
function doGet() {
  return json({ ok: true, service: 'ckp-webinar-registrations', rows: getSheet().getLastRow() - 1 });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    var headers = COLUMNS.map(function (col) { return col[1]; });
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function alreadyRecorded(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  var colIndex = 0;
  for (var i = 0; i < COLUMNS.length; i++) {
    if (COLUMNS[i][0] === 'submissionId') { colIndex = i + 1; break; }
  }
  if (!colIndex) return false;

  var values = sheet.getRange(2, colIndex, lastRow - 1, 1).getValues();
  for (var r = 0; r < values.length; r++) {
    if (String(values[r][0]) === id) return true;
  }
  return false;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
