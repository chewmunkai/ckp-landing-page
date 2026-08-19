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

/** The Zoom link sent to registrants. Currently the meeting's REGISTRATION
 *  link, by the client's choice — each person completes Zoom's short form and
 *  Zoom emails them a personal join link. If registration is ever switched
 *  off, paste the plain join link (https://us02web.zoom.us/j/...) here
 *  instead: the email wording below detects which kind it is and adjusts. */
var ZOOM_JOIN_URL = 'https://us02web.zoom.us/meeting/register/sHwbLw4vQouX39CGMWa5fA';
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

/** True when ZOOM_JOIN_URL is a registration link rather than a join link.
 *  Registration links hand out personal join links via Zoom's own email, so
 *  our wording must promise that, not an instant join. */
function isRegLink() {
  return ZOOM_JOIN_URL.indexOf('/meeting/register') !== -1;
}

/** Thank-you email with the Zoom link and a calendar invite attached.
 *  Layout is nested tables with inline styles only — the one dialect every
 *  mail client renders. Square corners and the ink/crimson palette follow the
 *  landing page, so the email reads as the same brand. */
function sendConfirmation(body) {
  if (!/^https?:\/\//.test(ZOOM_JOIN_URL)) return; // Zoom link not pasted yet
  var to = String(body.email || '').trim();
  if (!to) return;

  var firstName = String(body.name || '').trim().split(/\s+/)[0] || 'there';
  var reg = isRegLink();
  var subject = 'You’re in — CKP webinar, 8 September 3:00 PM · your Zoom access inside';
  var F = "'Poppins',Arial,Helvetica,sans-serif";
  var INK = '#0E1233', CRIMSON = '#F4064F', PAPER = '#FBFAF8', GRAY = '#6b7280';

  var factRow = function (label, value) {
    return '<tr>' +
      '<td style="padding:11px 18px;border-bottom:1px solid #e8e6e1;font-family:' + F + ';font-size:10px;letter-spacing:2px;color:' + GRAY + ';text-transform:uppercase;white-space:nowrap">' + label + '</td>' +
      '<td style="padding:11px 18px;border-bottom:1px solid #e8e6e1;font-family:' + F + ';font-size:14px;font-weight:bold;color:' + INK + '">' + value + '</td></tr>';
  };
  var bullet = function (text) {
    return '<tr><td valign="top" style="padding:5px 10px 5px 0;font-family:' + F + ';font-size:14px;color:' + CRIMSON + ';font-weight:bold">▪</td>' +
      '<td style="padding:5px 0;font-family:' + F + ';font-size:14px;line-height:1.55;color:#33344a">' + text + '</td></tr>';
  };

  var html =
    '<span style="display:none;max-height:0;overflow:hidden;mso-hide:all">Seat confirmed. Your Zoom access and calendar invite are inside.</span>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f0ec;padding:26px 10px"><tr><td align="center">' +

    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:3px solid ' + INK + '">' +

    // header band
    '<tr><td style="background:' + INK + ';border-bottom:4px solid ' + CRIMSON + ';padding:18px 32px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td style="font-family:' + F + ';font-size:15px;font-weight:bold;letter-spacing:1px;color:#ffffff">CHIA, KA &amp; PARTNERS</td>' +
    '<td align="right" style="font-family:' + F + ';font-size:10px;font-weight:bold;letter-spacing:2px;color:' + CRIMSON + '">FREE WEBINAR</td>' +
    '</tr></table></td></tr>' +

    // body
    '<tr><td style="padding:36px 32px 30px">' +
    '<p style="margin:0 0 8px;font-family:' + F + ';font-size:11px;font-weight:bold;letter-spacing:2.5px;color:' + CRIMSON + ';text-transform:uppercase">Seat confirmed</p>' +
    '<p style="margin:0 0 14px;font-family:' + F + ';font-size:29px;line-height:1.15;font-weight:bold;color:' + INK + '">You’re in, ' + escapeHtml(firstName) + '.</p>' +
    '<p style="margin:0 0 24px;font-family:' + F + ';font-size:15px;line-height:1.6;color:#33344a">One of 40 seats is now yours. Everything you need is below — and the calendar invite is attached, so the hour can block itself into your diary before it fills with something else.</p>' +

    // event facts card
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ' + INK + ';border-left:5px solid ' + CRIMSON + ';margin:0 0 26px">' +
    factRow('Topic', escapeHtml('If LHDN asked you today, could you prove your company is compliant?')) +
    factRow('Date', 'Monday, 8 September 2026') +
    factRow('Time', '3:00 – 4:00 PM (Malaysia)') +
    factRow('Where', 'Online · Zoom · cameras off') +
    '<tr><td style="padding:11px 18px;font-family:' + F + ';font-size:10px;letter-spacing:2px;color:' + GRAY + ';text-transform:uppercase">Cost</td>' +
    '<td style="padding:11px 18px;font-family:' + F + ';font-size:14px;font-weight:bold;color:' + CRIMSON + '">Free · 40 seats only</td></tr>' +
    '</table>' +

    // CTA
    '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 10px"><tr>' +
    '<td bgcolor="' + CRIMSON + '" style="border:2px solid ' + INK + '">' +
    '<a href="' + ZOOM_JOIN_URL + '" style="display:block;padding:15px 34px;font-family:' + F + ';font-size:15px;font-weight:bold;letter-spacing:1.5px;color:#ffffff;text-decoration:none;text-transform:uppercase">' +
    (reg ? 'Get your Zoom link' : 'Your Zoom join link') + '</a></td></tr></table>' +
    (reg
      ? '<p style="margin:0 0 26px;font-family:' + F + ';font-size:13px;line-height:1.5;color:' + GRAY + '">One click: Zoom confirms your seat and emails your personal join link. Button not working? ' +
        '<a href="' + ZOOM_JOIN_URL + '" style="color:' + CRIMSON + '">Use this link.</a></p>'
      : '<p style="margin:0 0 26px;font-family:' + F + ';font-size:13px;line-height:1.5;color:' + GRAY + '">Passcode: <b style="color:' + INK + '">' + escapeHtml(ZOOM_PASSCODE) + '</b> · Button not working? ' +
        '<a href="' + ZOOM_JOIN_URL + '" style="color:' + CRIMSON + '">Use this link.</a></p>') +

    // value bullets
    '<p style="margin:0 0 10px;font-family:' + F + ';font-size:16px;font-weight:bold;color:' + INK + '">By 4:01 PM on 8 September, you\u2019ll know:</p>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px">' +
    bullet('Whether your structure — Sdn Bhd, Enterprise or LLP — still fits the business you actually run') +
    bullet('Every LHDN and SSM deadline laid out, so nothing rests on anyone’s memory') +
    bullet('Whether your books would survive a loan application, a tax estimate or an audit') +
    '</table>' +

    // VIP ask
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + PAPER + ';border-left:4px solid ' + CRIMSON + ';margin:0 0 28px"><tr><td style="padding:18px 20px">' +
    '<p style="margin:0 0 6px;font-family:' + F + ';font-size:14px;font-weight:bold;color:' + INK + '">Make the hour about <span style="color:' + CRIMSON + '">your</span> company.</p>' +
    '<p style="margin:0;font-family:' + F + ';font-size:14px;line-height:1.6;color:#33344a">Reply to this email with the one thing you feel least certain about — one sentence is enough. Jeremy reads every reply and builds the most common ones into the session, so you get your answer without asking in front of anyone.</p>' +
    '</td></tr></table>' +

    '<p style="margin:0;font-family:' + F + ';font-size:15px;line-height:1.6;color:#33344a">See you on the 8th,<br><b style="color:' + INK + '">Chia, Ka &amp; Partners</b></p>' +
    '</td></tr>' +

    // footer
    '<tr><td style="background:' + INK + ';padding:16px 32px">' +
    '<p style="margin:0;font-family:' + F + ';font-size:11px;line-height:1.7;color:#9a9db8">Chia, Ka &amp; Partners PLT (LLP0005573-LCA)<br>' +
    'Level 16-03A, Menara MBMR, 1 Jalan Syed Putra, 58000 Kuala Lumpur · +603-9212 7856<br>' +
    'You are receiving this because you registered at webinar.ckpartners.com.my</p>' +
    '</td></tr></table>' +
    '</td></tr></table>';

  var plain =
    'Hi ' + firstName + ',\n\nYou’re in — one of 40 seats is yours.\n\n' +
    EVENT_TITLE + '\nMonday, 8 September 2026, 3:00–4:00 PM (Malaysia)\nOnline, cameras off, nothing to prepare. Free.\n\n' +
    (reg
      ? 'One click left — open this Zoom page and it will email you your personal join link:\n' + ZOOM_JOIN_URL + '\n\n'
      : 'Join: ' + ZOOM_JOIN_URL + '\nPasscode: ' + ZOOM_PASSCODE + '\n\n') +
    'You leave knowing:\n' +
    '- whether your structure (Sdn Bhd, Enterprise, LLP) still fits your business\n' +
    '- every LHDN and SSM deadline, off anyone’s memory\n' +
    '- whether your books would survive a loan application, tax estimate or audit\n\n' +
    'Make the hour about YOUR company: reply with the one thing you feel least certain about — ' +
    'Jeremy reads every reply and builds the most common ones into the session.\n\n' +
    'The calendar invite is attached.\n\nSee you on the 8th,\nChia, Ka & Partners';

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
    'DESCRIPTION:' + icsEscape(isRegLink()
      ? 'Zoom (get your personal join link here): ' + ZOOM_JOIN_URL
      : 'Join: ' + ZOOM_JOIN_URL + '\nPasscode: ' + ZOOM_PASSCODE),
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
        (isRegLink()
          ? 'Zoom (your personal join link is in Zoom\u2019s confirmation email; lost it? this page resends it):\n' + ZOOM_JOIN_URL + '\n\n'
          : 'Join: ' + ZOOM_JOIN_URL + '\nPasscode: ' + ZOOM_PASSCODE + '\n\n') +
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
