/**
 * CKP webinar registrations -> Google Sheet + confirmation email.
 *
 * v3. Container-bound Apps Script: it lives inside the spreadsheet it writes
 * to. Deployed as a Web App it gives the static landing page somewhere to
 * POST, and — because it runs as the account that owns it — it can also send
 * the confirmation email from that account's address. Deploy this under
 * chiakapartners@gmail.com so the mail comes from the firm's address.
 *
 * Setup and redeploy steps are in README.md next to this file. The one that
 * catches everybody: editing this code does nothing until you deploy a NEW
 * VERSION. The old version keeps serving until you do.
 */

/* ---------------- everything you might need to edit ---------------- */

/** Tab the rows land on. Created automatically if it does not exist. */
var SHEET_NAME = 'Registrations';

/** Must match CFG.sheetToken in config.jsx. Not a secret — it ships in the
 *  page source; it only filters drive-by bots. */
var SHARED_TOKEN = '01eb65b7e88f248c1c24de0b793e101d';

/** The plain Zoom JOIN link — https://us02web.zoom.us/j/...
 *  NOT the /meeting/register/ link: that one forces people to register a
 *  second time on Zoom's own form. Turn OFF "Require registration" on the
 *  meeting and paste the join link Zoom shows instead.
 *  Until this holds a real link, rows are still written but no email goes
 *  out — a registration must never be lost to a mail problem. */
var ZOOM_JOIN_URL = 'PASTE_ZOOM_JOIN_LINK_HERE';
var ZOOM_PASSCODE = '964407';

/** How the email presents itself. The From address is the Google account
 *  this script runs under; this is the display name shown next to it. */
var SENDER_NAME = 'Chia, Ka & Partners';
var REPLY_TO = 'enquiry@ckpartners.com.my';

/** Event facts, used in the email and the calendar invite. Times are the
 *  UTC instants of 3:00–4:00 PM Kuala Lumpur (UTC+8) on 8 Sep 2026. */
var EVENT_TITLE = 'CKP Webinar — If LHDN asked you today, could you prove your company is compliant?';
var EVENT_DATE_HUMAN = 'Monday 8 September 2026, 3:00 PM \u2013 4:00 PM (Malaysia time)';
var EVENT_START_UTC = '20260908T070000Z';
var EVENT_END_UTC = '20260908T080000Z';

/* ------------------------------------------------------------------- */

/**
 * Column order. First element is the key sent by the page, second is the
 * header written into row 1. The header row is only written once, on a
 * fresh sheet — deploy v3 with a fresh Registrations tab.
 */
var COLUMNS = [
  ['timestamp',    'Timestamp'],
  ['name',         'Name'],
  ['company',      'Company'],
  ['email',        'Email'],
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
var REQUIRED = ['name', 'company', 'email', 'whatsapp', 'role'];

function doPost(e) {
  // Concurrent submissions would otherwise race on appendRow. Serialise them;
  // 40 seats will never queue long enough to matter.
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

    // Honeypot: a hidden field no human can see or fill. Report success so
    // the bot has no signal to adapt to, but write nothing and send nothing.
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
    // one, so a retry after a timeout updates nothing — and sends no second
    // email — instead of double-booking the same person.
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

    // The row is safe; the email is best-effort on top of it. A mail failure
    // (quota, bad address, Zoom link not configured yet) must never turn a
    // saved registration into an error for the visitor.
    try {
      sendConfirmation(body);
    } catch (mailErr) {
      // registration stands; the sheet has the address for a manual send
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Opening the /exec URL in a browser hits this. Confirms the deployment is
 * live without writing a row. Deliberately does not report the row count —
 * the URL is public, and the count is campaign performance.
 */
function doGet() {
  return json({ ok: true, service: 'ckp-webinar-registrations' });
}

/** Thank-you email with the Zoom link and a calendar invite attached. */
function sendConfirmation(body) {
  if (!/^https?:\/\//.test(ZOOM_JOIN_URL)) return; // Zoom link not pasted yet
  var to = String(body.email || '').trim();
  if (!to) return;

  var firstName = String(body.name || '').trim().split(/\s+/)[0] || 'there';
  var subject = 'Your seat is confirmed \u2014 CKP webinar, 8 September, 3:00 PM';

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a2e;max-width:560px">' +
    '<p>Hi ' + escapeHtml(firstName) + ',</p>' +
    '<p>You\u2019re registered. Here is everything you need:</p>' +
    '<p style="margin:20px 0;padding:16px 20px;border-left:4px solid #F4064F;background:#faf7f5">' +
    '<b>' + escapeHtml(EVENT_TITLE) + '</b><br>' +
    escapeHtml(EVENT_DATE_HUMAN) + '<br>Online \u00b7 cameras off \u00b7 nothing to prepare</p>' +
    '<p style="margin:24px 0"><a href="' + ZOOM_JOIN_URL + '" ' +
    'style="background:#F4064F;color:#ffffff;padding:13px 26px;text-decoration:none;font-weight:bold;display:inline-block">Join the webinar</a></p>' +
    '<p>Zoom link: <a href="' + ZOOM_JOIN_URL + '">' + ZOOM_JOIN_URL + '</a><br>' +
    'Passcode: <b>' + escapeHtml(ZOOM_PASSCODE) + '</b></p>' +
    '<p>The calendar invite is attached \u2014 open it and the session blocks itself into your calendar.</p>' +
    '<p><b>One thing worth doing now:</b> reply to this email with the one thing about your company you feel least certain about. ' +
    'One sentence is enough. Jeremy reads every reply and builds the most common ones into the session, so you get your answer without asking in front of anyone.</p>' +
    '<p>See you on the 8th,<br>Chia, Ka &amp; Partners<br>' +
    '<span style="color:#777;font-size:13px">Level 16-03A, Menara MBMR, 1 Jalan Syed Putra, 58000 Kuala Lumpur \u00b7 +603-9212 7856</span></p>' +
    '</div>';

  var plain =
    'Hi ' + firstName + ',\n\nYou\u2019re registered.\n\n' +
    EVENT_TITLE + '\n' + EVENT_DATE_HUMAN + '\nOnline, cameras off, nothing to prepare.\n\n' +
    'Join: ' + ZOOM_JOIN_URL + '\nPasscode: ' + ZOOM_PASSCODE + '\n\n' +
    'Reply to this email with the one thing about your company you feel least certain about \u2014 ' +
    'Jeremy reads every reply and builds the most common ones into the session.\n\n' +
    'See you on the 8th,\nChia, Ka & Partners';

  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: plain,
    htmlBody: html,
    name: SENDER_NAME,
    replyTo: REPLY_TO,
    attachments: [icsInvite(body)]
  });
}

/** The .ics calendar invite. METHOD:REQUEST is what makes mail clients offer
 *  an Add-to-calendar action rather than treating it as a dead attachment. */
function icsInvite(body) {
  var uid = (String(body.submissionId || '').trim() || Utilities.getUuid()) + '@ckp-webinar';
  var ics = [
    'BEGIN:VCALENDAR',
    'PRODID:-//CKP//Webinar//EN',
    'VERSION:2.0',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + Utilities.formatDate(new Date(), 'UTC', "yyyyMMdd'T'HHmmss'Z'"),
    'DTSTART:' + EVENT_START_UTC,
    'DTEND:' + EVENT_END_UTC,
    'SUMMARY:' + icsEscape(EVENT_TITLE),
    'DESCRIPTION:' + icsEscape('Join: ' + ZOOM_JOIN_URL + '\nPasscode: ' + ZOOM_PASSCODE),
    'LOCATION:Zoom',
    'URL:' + ZOOM_JOIN_URL,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:CKP webinar starts in 30 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  return Utilities.newBlob(ics, 'text/calendar; method=REQUEST', 'ckp-webinar.ics');
}

/**
 * Day-before reminder. Not on a timer by default — run it manually from the
 * editor on 7 September (select sendReminders, press Run), or add a trigger:
 * clock icon in the left bar > Add Trigger > sendReminders > time-driven >
 * specific date. Sends one mail per unique address in the sheet.
 */
function sendReminders() {
  if (!/^https?:\/\//.test(ZOOM_JOIN_URL)) return;
  var sheet = getSheet();
  var last = sheet.getLastRow();
  if (last < 2) return;

  var emailCol = colIndex('email'), nameCol = colIndex('name');
  var rows = sheet.getRange(2, 1, last - 1, COLUMNS.length).getValues();
  var seen = {};

  rows.forEach(function (r) {
    var to = String(r[emailCol - 1] || '').trim().toLowerCase();
    if (!to || seen[to]) return;
    seen[to] = true;
    var firstName = String(r[nameCol - 1] || '').trim().split(/\s+/)[0] || 'there';
    MailApp.sendEmail({
      to: to,
      subject: 'Tomorrow 3:00 PM \u2014 your CKP webinar seat',
      body:
        'Hi ' + firstName + ',\n\nQuick reminder: the webinar is tomorrow.\n\n' +
        EVENT_TITLE + '\n' + EVENT_DATE_HUMAN + '\n\n' +
        'Join: ' + ZOOM_JOIN_URL + '\nPasscode: ' + ZOOM_PASSCODE + '\n\n' +
        'Cameras stay off and there is nothing to prepare. If you have not yet, ' +
        'reply with the one question you want answered \u2014 there is still time for it to make the session.\n\n' +
        'See you tomorrow,\nChia, Ka & Partners',
      name: SENDER_NAME,
      replyTo: REPLY_TO
    });
  });
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

function colIndex(key) {
  for (var i = 0; i < COLUMNS.length; i++) {
    if (COLUMNS[i][0] === key) return i + 1;
  }
  return 0;
}

function alreadyRecorded(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  var c = colIndex('submissionId');
  if (!c) return false;
  var values = sheet.getRange(2, c, lastRow - 1, 1).getValues();
  for (var r = 0; r < values.length; r++) {
    if (String(values[r][0]) === id) return true;
  }
  return false;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function icsEscape(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
