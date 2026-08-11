# CKP Webinar Landing Page

**Live: <https://chewmunkai.github.io/ckp-landing-page/>**

Registration page for the free Chia, Ka & Partners webinar on 8 September 2026 —
*"If LHDN asked you today, could you prove your company is compliant?"*

It is the destination for a paid ad campaign, so the whole page is built around one
action: register for the seat.

> **This is a preview, not a live campaign target.** The form does not submit
> anywhere yet and there is no conversion tracking — see *Before this goes live*.

## Run it

```bash
node serve.js
```

Then open <http://localhost:4173>.

It has to be served over HTTP. Opening the HTML from the filesystem fails, because
Babel Standalone fetches the `.jsx` files over XHR and `file://` blocks that. No
install step and no dependencies — `serve.js` uses only the Node standard library.

## Deployment

GitHub Pages, from `main` at the repo root. Pushing to `main` redeploys.

Two files exist only to make Pages work, and both must stay:

- **`.nojekyll`** — Pages runs Jekyll by default, and Jekyll silently drops any path
  starting with an underscore. Without this, the whole `_ds/` design system 404s and
  the page renders blank.
- **`index.html`** — a redirect to `CKP Webinar Landing.html`, whose name contains a
  space and would otherwise only resolve as `CKP%20Webinar%20Landing.html`. The
  filename is kept as-is because it is what the Claude Design project uses.

## How it is put together

React 18 and Babel Standalone from CDN, compiled in the browser. No build step, no
bundler. Scripts load in order and each one hangs its components off `window`.

| Path | What it is |
| --- | --- |
| `CKP Webinar Landing.html` | The shell. Loads tokens, styles, then the scripts in order. |
| `config.jsx` | **Edit this first.** Date, time, seat counts, form embed, video links. Also `Countdown`, `SeatMeter` and `Reveal`. |
| `form.jsx` | Registration form and the thank-you screen. |
| `parts-1.jsx` | Header, hero, trust strip, sections 1–2. |
| `parts-2.jsx` | Sections 3–5, final CTA, footer. |
| `app.jsx` | Sticky CTA bar, page composition, mount. |
| `page.css` | All page-level styling. |
| `_ds/ckp-design-system-…/` | The CKP design system — tokens and 15 React components. Treat as vendored; do not hand-edit. |
| `assets/` | Logo, Jeremy's photo, Xero badge, and the five client-video stills. |
| `uploads/` | Source copy document the page was written from. |

The design system is the source of truth for colour, type, spacing and the square,
ink-ruled, hard-shadow look. Crimson `#F4064F` and navy `#1B2687` are sampled from
the logo. Corner radius is zero everywhere except the logo badge.

## Before this goes live

Tracked in `NEXT-STEPS.md`, but the three that block the campaign:

1. **The form does not submit anywhere.** It shows the thank-you screen without
   sending the data. Every registration from a paid click is currently lost. Set
   `CFG.formEmbedUrl`, or POST the styled form to a real endpoint.
2. **Nothing is tracked.** No Meta Pixel, no GA4, no conversion event — so cost per
   registration is unmeasurable and there is no retargeting audience.
3. **`CFG.privacyUrl` is still `{{PRIVACY_URL}}`** and renders literally in the footer.

`NEXT-STEPS.md` also covers page weight, social preview tags, form validation and
the accessibility pass. `IMPORT-NOTES.md` records where the page came from and every
change made on top of the imported design.
