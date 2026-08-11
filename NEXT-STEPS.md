# What would move conversion on this page

Scanned against the source material: the client brief, the empathetic-rewrite copy
document, the CKP design system readme, the v4 webinar deck, and the built page
measured in a browser.

The page is well built and on-brand. Everything below is about converting ad
traffic, in the order I'd do it.

---

## Blocker — the form does not submit anywhere

`CFG.formEmbedUrl` is empty, so the styled fallback form runs. That form calls
`onDone()` and shows the thank-you screen **without sending the data anywhere**.
Every registration from a paid click is currently lost.

Nothing else on this list matters until this is fixed. Either:

- paste the Zoho/HubSpot/Google Form embed URL into `CFG.formEmbedUrl`, or
- keep the styled form (it converts better than an iframe) and POST it to a real
  endpoint before calling `onDone()`.

The second is worth the extra work: the custom form matches the brand, has the
conditional director field, and avoids an iframe that can't be tracked.

## Blocker — nothing is tracked

There is no Meta Pixel, no GA4, no conversion event. For an ad landing page that
means you cannot see cost per registration, cannot optimise the campaign, and
cannot build a retargeting audience of people who visited and didn't register.

Minimum: pixel on page load, plus a `CompleteRegistration` / `generate_lead`
event fired in the same place `onDone()` runs.

## High — no validation on any field

Only the conditional director field is validated. `name`, `email`, `whatsapp`,
`company`, `role` and `clarity` have no `required` attribute and no check, so a
visitor can submit a completely empty form and be told "You're registered."

Add `required`, a real email pattern, and a Malaysian mobile pattern on the
WhatsApp field.

## High — duplicate element IDs break the second form

The design system's `Input`/`Select` derive their `id` from the label text, and
the form renders twice (hero + final CTA). Six IDs are duplicated: `f-name`,
`f-business-email`, `f-whatsapp-number`, `f-company-name`, `s-your-role`,
`s-what-would-you-most-like-clarity-on-`.

Every `<label for=…>` therefore points at the **hero** form's field. Clicking a
label in the bottom form jumps focus to the top of the page. Pass an id prefix
per form instance.

## High — the page ships ~1.7 MB and compiles itself in the browser

Measured on load:

| Resource | Size |
| --- | --- |
| `xero-platinum-partner.jpg` | 646 KB, displayed at 124px and 162px wide |
| `jeremy-chia.png` | 502 KB |
| `_ds_bundle.js` | 388 KB (the whole design system, incl. unused demo kits) |
| React + ReactDOM + Babel Standalone | ~3 MB uncompressed, dev builds |

Three separate problems:

1. **The Xero badge is a 646 KB, 1024×591 JPEG rendered at 124px.** Resize it and
   it becomes ~10 KB. It loads twice (trust strip + footer).
2. **Babel Standalone compiles five `.jsx` files in the visitor's browser on every
   load.** Precompile at build time and ship plain JS.
3. **React is the `development` build.** Swap to `production.min` — it is both
   smaller and faster.

On Malaysian mobile this is the difference between a page that appears instantly
and one that costs you clicks you already paid for.

Also: no `width`/`height` on any image, so the layout shifts as they load.

## High — no social preview

No `<meta name="description">`, no Open Graph tags, no favicon, no canonical.
When this link is shared on WhatsApp — the main way this audience forwards
things — it renders as a bare URL with no title, image or description.

For a page whose whole job is to be shared and clicked, this is cheap and high
value. The hero photo of Jeremy or the Xero badge makes a good OG image.

## Medium — the scarcity counters are static

`seatsTaken: 17` is hardcoded, so "23 of 40 seats left" is identical for every
visitor forever, and identical if they come back tomorrow. Anyone who notices
stops trusting the rest of the page.

Either wire it to the real registration count or drop the seat meter and keep the
countdown, which is genuinely true.

## Medium — anchor links land under the sticky header

The header is sticky and 81px tall; `#register` has `scroll-margin-top: 0`. Every
"Save My Free Seat" button scrolls the top of the form under the header. One line:

```css
#register,#register-2{scroll-margin-top:96px}
```

## Medium — the deck has far better proof than the page uses

The v4 deck is much more concrete than the landing page. Three things in it would
raise conviction without adding word count:

1. **The compliance clock** (deck slide 9) — 30 days / 90 days / 18 months /
   yearly, as a scannable timeline. The page currently compresses this to a single
   clause: "the important 30-day, 90-day and 18-month deadlines". Showing the
   actual timeline is more persuasive than describing it, and it is pure structure,
   not prose.
2. **The agenda with timings** (deck slide 2) — 0–5, 5–15, 15–30, 30–42, 42–52,
   52–58, 58–60. A timed agenda proves the hour is planned. It would strengthen
   "What you leave with".
3. **Xin Lei and Carissa** are named three times on the page but never shown.
   The deck has their direct WhatsApp numbers. Showing the two people who
   actually take the 20 review slots makes that offer concrete.

(You chose to keep the penalty figures — RM50,000 / 45% / RM1,000 per day — out
of the page. Noted and left out.)

## Medium — restore the language line

The source copy's hero eyebrow reads `… · {{TIME}} · {{LANGUAGE}}`. The build
dropped `{{LANGUAGE}}`, which is why `CFG.language` exists but renders nowhere.
For a Malaysian SME audience, knowing whether the session is in English or
Mandarin is a real objection to remove before registering.

## Low — accessibility passes worth making

- Tap targets: the header CTA is 38px tall on mobile, footer links 17–18px.
  44px is the accepted minimum.
- Secondary text on crimson (`rgba(255,255,255,.88)`) measures **4.21:1**. That
  passes AA for large text but fails the 4.5:1 threshold for the 14px hero facts
  strip. Nudging to `.95` opacity fixes it.
- The video lightbox has no focus trap and does not return focus to the tile that
  opened it. Escape-to-close already works.
- The countdown updates every second inside a live region-less block; screen
  readers may or may not announce it. Marking it `aria-hidden` and providing a
  static text alternative is the usual fix.

## Low — the FAQ styles are dead code

`page.css` carries `.faq`, `.faq-item`, `.faq-q`, `.faq-a` rules, but the design
system's `Accordion` renders its own markup with inline styles and no such
classes. Roughly 15 lines that style nothing.
