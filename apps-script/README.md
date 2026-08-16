# Connecting the form to a Google Sheet

The landing page is static — GitHub Pages serves files and runs nothing. So the
form needs somewhere to POST. This uses a Google Apps Script Web App bound to
your own spreadsheet: no server, no monthly fee, and the registrations never
touch a third party.

Roughly ten minutes, and only you can do it — it needs your Google account.

## 1. Open the script

Open the Google Sheet you want the registrations in, then **Extensions → Apps
Script**. Delete the `function myFunction() {}` stub that is already there.

## 2. Paste the code

Copy the whole of [`Code.gs`](Code.gs) into the editor, replacing everything that
was there. Nothing in it needs editing — the shared token is already filled in
and matches `CFG.sheetToken` in `config.jsx`.

Press **Save** (the disk icon, or Ctrl/Cmd+S).

## 3. Deploy it

**Deploy → New deployment**, then set the type to **Web app** using the gear icon
next to "Select type".

| Field | Value |
| --- | --- |
| Description | `CKP webinar form` |
| Execute as | **Me** |
| Who has access | **Anyone** |

**"Anyone" is not the same as "Anyone with a Google account".** Pick the first
one. The second forces your visitors to sign in to Google before they can
register, which will cost you nearly every registration.

Google will ask you to authorise the script. It warns that the app is unverified
because you wrote it yourself — go through **Advanced → Go to (project name)** and
allow it.

## 4. Copy the URL into the page

Copy the **Web app URL**. It ends in `/exec`.

Paste it into `sheetEndpoint` in [`config.jsx`](../config.jsx):

```js
sheetEndpoint: 'https://script.google.com/macros/s/AKfy…/exec',
```

Commit and push, and it is live.

## 5. Check it works

Open the `/exec` URL directly in a browser. A healthy deployment answers:

```json
{"ok":true,"service":"ckp-webinar-registrations","rows":0}
```

Then submit the real form once and confirm the row appears. The `Registrations`
tab and its header row are created automatically on the first submission.

## The one that catches everybody

**Editing the code does nothing until you deploy a new version.** The old
version keeps serving. After any change to `Code.gs`:

**Deploy → Manage deployments →** pencil icon **→ Version: New version → Deploy**

The URL stays the same, so you never need to touch `config.jsx` again.

## What is stored

One row per registration: timestamp (Kuala Lumpur), name, company, WhatsApp,
role, the five qualifying answers, the areas picked, the ad source, the
referrer, and a submission id.

The WhatsApp number is normalised to `+60…` before it is sent, so the column is
consistently dialable no matter how the person typed it.

## Honest limits

- **The endpoint URL is public.** It ships inside the page's JavaScript, as it
  must for the browser to call it. The token is not security either — anyone who
  views source can read both. A honeypot field and a required-field check stop
  casual bots; a determined person could still post junk rows. At 40 seats that
  is a nuisance you would notice and delete, not a breach.
- **Apps Script is not instant.** A cold start can take a few seconds. The form
  disables its button and shows "Saving your seat…" so nobody double-submits,
  and gives up after 20 seconds with a retry.
- **A retry is safe.** The page keeps the same submission id, and the script
  ignores an id it has already written, so pressing the button twice cannot
  create two rows for one person.
- **This stores personal data.** Name, company, phone and role are collected and
  retained in your Google account. `CFG.privacyUrl` is still an unresolved
  placeholder, and a form collecting this should carry a privacy notice under
  the PDPA. That is now a live obligation, not a to-do.
