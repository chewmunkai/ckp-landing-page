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

## Meta Conversions API (server-side conversions)

The page already reports `Lead` and `CompleteRegistration` from the browser.
The script sends the same two events again from Google's servers, where ad
blockers, iOS and a closed tab cannot stop them, and Meta collapses each pair
back into one using the shared submission ID. Expect the gap it recovers to be
the conversions the browser was losing, not extra ones.

**Nothing happens until you add a token**, so this section is safe to skip
until you want it. Without `META_CAPI_TOKEN` the code is a no-op.

1. Events Manager → the pixel `342096625454617` → **Settings** → scroll to
   **Conversions API** → **Generate access token**. Copy it.
2. Apps Script editor → **Project Settings** (gear, left rail) → **Script
   Properties** → **Add script property**:
   - `META_CAPI_TOKEN` = the token you just copied
3. *(Recommended for the first run)* add a second property so events land in
   Test Events instead of counting for real:
   - `META_TEST_EVENT_CODE` = the code from Events Manager → **Test Events**
4. Pick `testMetaConversions` in the editor's function dropdown and press
   **Run**. It sends one throwaway registration. Watch it appear under Test
   Events; if nothing shows, **Executions** in the left rail has the error.
5. **Delete `META_TEST_EVENT_CODE` when you are done.** While it is set, these
   events never count as real conversions and the campaign cannot optimise
   towards them.
6. Redeploy (see *After any code edit*) so live registrations use the new code.

Notes worth knowing:

- The token is a real secret. It lives in Script Properties and never in
  `Code.gs`, because that file is public in the landing page repository. If it
  ever leaks, revoke it on the same Events Manager screen.
- Email, phone and name are **SHA-256 hashed** before they leave Google —
  Meta receives no readable personal data. The `_fbp` / `_fbc` cookies are
  sent raw because Meta issued them itself and hashing would break the match.
- The visitor's IP is not sent. A Web App cannot see it, and sending Google's
  own address would match the wrong person.
- A Meta outage cannot cost a registration: the row is written first and this
  is best-effort on top, exactly like the confirmation email.

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
