# Registrations -> Google Sheet + confirmation email

The landing page is static, so the form POSTs to a Google Apps Script Web App
bound to a spreadsheet. v3 of the script also sends each registrant a
confirmation email with the Zoom link and a calendar invite, and can send a
day-before reminder. No server, no monthly fee, no third party touching the
leads.

**v3 must be deployed under `chiakapartners@gmail.com`** — the email sends
from whichever Google account owns the script, and that is the address the
firm wants on it. This replaces the deployment that lived under the personal
account; the swap is a fresh 10-minute setup, then one URL change in
`config.jsx`.

## Set up (log in as chiakapartners@gmail.com)

1. Go to **sheets.new** — name the spreadsheet `CKP Webinar Registrations`.
2. **Extensions → Apps Script**, delete the stub, paste the whole of
   [`Code.gs`](Code.gs), **Save**.
3. In the code, find `ZOOM_JOIN_URL` and paste the real Zoom **join** link
   (`https://us02web.zoom.us/j/...`). NOT the `/meeting/register/` link — that
   forces a second registration on Zoom's own form. Turn OFF "Require
   registration" on the Zoom meeting to get the plain join link.
   Until a real link is pasted, registrations are still saved but no email is
   sent — nothing is ever lost to a mail problem.
4. **Deploy → New deployment** → gear icon → **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**  (NOT "Anyone with a Google account")
5. Authorise (Advanced → Go to project → Allow). The scary screen is because
   the script sends email as you — that is exactly what we want it to do.
6. Copy the **Web app URL** (`…/exec`) and send it over; it goes into
   `sheetEndpoint` in [`config.jsx`](../config.jsx).
7. **Share stays Restricted.** The sheet now holds names, phones AND emails.

## After any code edit

Editing does nothing until: **Deploy → Manage deployments → pencil →
Version: New version → Deploy.** The URL never changes.

## The day-before reminder

Run manually on 7 September: open the script editor, pick `sendReminders`
in the toolbar dropdown, press **Run**. Or automate it: clock icon →
Add Trigger → `sendReminders` → time-driven → specific date/time.
One email per unique address; safe to run once.

## Quotas and honest limits

- Free Gmail sends 100 emails/day via this API — fine for 40 seats, but do
  not point extra tools at the same account's quota.
- Mail failures never block a registration: the row is written first and the
  email is best-effort on top. If someone reports no email, their address is
  in the sheet — send it by hand.
- The endpoint URL and token are public by design (they ship in the page
  source). A honeypot plus required-field checks filter casual bots; junk
  rows are a delete, not a breach.
- A confirmation from a `@gmail.com` address can land under Promotions in
  Gmail. The page's thank-you screen tells people to check spam.
