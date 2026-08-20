# Production readiness

Audited as a visitor on the live GitHub Pages build, at 375px and 1280px.

## Blocks launch

### 1. The form does not submit anywhere

`CFG.formEmbedUrl` is empty, so the styled fallback runs. It validates, then calls
`onDone()` and shows the thank-you screen **without sending the data anywhere**.
Every registration from a paid click is lost, and the visitor is told they are
registered when they are not.

Either paste the Zoho/HubSpot/Google Form embed URL into `CFG.formEmbedUrl`, or POST
the styled form to a real endpoint before `onDone()`. The second is worth the work:
the custom form is on-brand, has the conditional logic, and can be tracked.

### 2. Tracking is browser-only

**Done:** Meta Pixel `342096625454617` fires on load, `RegistrationStep2` on reaching
step 2, and then both `Lead` and `CompleteRegistration` once the sheet write is
confirmed. Both conversions carry the same `eventID` so a server-side feed can
deduplicate against them.

Still open, in the order that matters:

- **Point the campaign at one conversion event, not both.** `Lead` and
  `CompleteRegistration` describe the same registration under two names, so the ad
  set must optimise for exactly one. Splitting the objective across both halves the
  signal each receives. Do not sum them in reports either — one registration
  produces one of each.
- **Conversions API.** The pixel is browser-only, so ad blockers, iOS and ITP eat a
  meaningful share of conversions. The Apps Script that writes the row is the natural
  place to POST the same two events server-side, reusing `submissionId` as
  `event_id`. Deduplication keys on event name *and* id, so the one id covers both.
- **GA4**, for the traffic picture the pixel does not give.

### 3. No privacy policy link

`CFG.privacyUrl` is still `{{PRIVACY_URL}}`. The footer link is now **suppressed**
rather than rendering a dead `{{PRIVACY_URL}}` href — but a form collecting name,
phone, company and role should carry a privacy notice under the PDPA. Set the real
URL in `config.jsx`.

### 4. The session language is never stated

The source copy had `{{LANGUAGE}}` in the hero eyebrow and the build dropped it,
which is why `CFG.language` exists but renders nowhere. The client videos carry
Chinese subtitles, so people will reasonably wonder whether the session is in English
or Mandarin. That is an unanswered objection sitting between them and the form.

### 5. Scarcity counters are static

`seatsTaken: 17` is hardcoded, so "23 of 40 seats left" is identical for every
visitor, forever, and identical if they return tomorrow. Wire it to the real count or
drop the seat meter and keep the countdown, which is genuinely true.

## Fixed in the audit pass

- **Social preview.** Added description, canonical, favicon, and full Open Graph and
  Twitter tags with a generated 1200×630 share card (`assets/og-card.png`). This
  audience forwards links on WhatsApp, which reads those tags — the link previously
  rendered as a bare URL with no title or image.
- **Dead privacy link** no longer renders while the placeholder is unresolved.
- **Tap targets.** Chips and the header CTA were 37–38px, now 44px. Footer inline
  links went from 17px to 36px (inline links inside sentences are exempt from the
  44px rule, but they were needlessly small).
- **Layout shift.** Every image now carries `width`/`height`, so nothing reflows as
  the page loads.
- **Duplicate form field ids** across the two form instances — fixed earlier, still
  verified clean (0 duplicates, all 12 labels resolve inside their own form).

## Worth doing before spending real budget

**Page weight and in-browser compilation.** The page ships React + ReactDOM
*development* builds plus Babel Standalone (~3 MB) and compiles 5 `.jsx` files in the
visitor's browser on every load. Precompile the JSX and switch to `production.min`.
On Malaysian mobile this is the difference between appearing instantly and losing
clicks you already paid for. (`jeremy-chia.png` is also still a 502 KB PNG; the Xero
badge is now 32 KB, down from 646 KB.)

**No form validation on format.** Fields are required, but there is no email pattern
(email is gone now) and no Malaysian mobile pattern on the WhatsApp number — which is
the only way you can reach a registrant.

**Accessibility odds and ends.** The countdown updates every second inside a region
with no live-region handling; marking it `aria-hidden` with a static text alternative
is the usual fix. The video stage does not move focus when a story is selected.

**Dead CSS.** `page.css` still carries `.faq`, `.faq-item`, `.faq-q`, `.faq-a` rules;
the design system's `Accordion` renders its own markup and none of those classes are
used. Also `.hand`, left over from the Section 02 rewrite.

## Still unbuilt from the brief

- Iconography to break up the text-heavy sections.
- The "Last step" section redesign (headline size and left-column layout).
- From the deck: the timed agenda, and Xin Lei and Carissa — named 3 times on the
  page but never shown, despite the deck carrying their photos and direct numbers.
