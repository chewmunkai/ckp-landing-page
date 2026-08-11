# CKP Design System — Chia, Ka & Partners PLT

Brand and UI system for **CKP (Chia, Ka & Partners PLT)**, a chartered-accounting firm in Kuala Lumpur serving Malaysian SMEs with cloud and AI-assisted accounting.

## The firm, in short

Founded in 2015 by Jeremy Chia and Edward Ka, CKP runs bookkeeping, tax, audit, payroll and corporate-secretarial work for 300+ SME clients across Malaysia, with cross-border work into Singapore. The differentiator is delivery, not services: books run on Xero in the cloud, automation removes the data entry, and clients read their numbers in real time instead of waiting for a year-end file. Public positioning line: **"Help businesses build bold by understanding the numbers."** Registered as LLP0005573-LCA; office at Level 16, Menara MBMR, Kuala Lumpur.

Primary audiences for the current work:
1. Owners **opening a new company** (not yet incorporated, or a first-year Sdn Bhd).
2. Established businesses **expanding to new branches or entities**.

## Sources this system was built from

| Source | What it gave us |
| --- | --- |
| `uploads/ckp LOGO.png` (user upload) | The only supplied brand asset. Colours were sampled pixel-exact from it: crimson `#F4064F`, navy `#1B2687`, white `#FFFFFF`. Copied to `assets/ckp-logo.png`. |
| ckpartners.com.my (public site) | Services, vision/mission wording, "accounting firm in KL Sentral" positioning, cross-border MY/SG claim. |
| Public social profiles (Instagram `@ckp.buildbold`, Facebook, LinkedIn) | The "build bold" line, "Chartered Accountants who truly believe in you and your business", contact details. |
| The Star, 26 Sep 2022 — profile of the founders | Founding story, 300+ clients from Kedah to Sabah, Xero adoption, growth ambitions. |
| `uploads/CKP_Claude_Design_Prompt.md` (client brief, Edge Point Solutions) | The webinar landing page: audience, emotional job, hard content rules, and all section copy verbatim. Built as `ui_kits/webinar/`. |
| User direction (design brief, this project) | Direction A "Build Bold" chosen from three presented options; Archivo Black headline type; bold-and-friendly tone; landing page as the first surface; six services to feature. |

**No codebase, Figma file, brand guide, font binaries or photography were supplied.** Everything visual here was authored from the logo plus the chosen direction. See "Open questions & substitutions" at the end.

---

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | The single entry point consumers link. `@import` lines only. |
| `tokens/fonts.css` | Archivo + Archivo Black, loaded from Google Fonts. |
| `tokens/colors.css` | Brand values, crimson/navy/neutral ramps, status colours, semantic aliases. |
| `tokens/typography.css` | Families, weights, display + body scales, line heights, tracking. |
| `tokens/spacing.css` | 4px scale, page max width, gutters, section rhythm. |
| `tokens/borders.css` | Border weights, radius (zero), hard offset shadows, focus ring. |
| `tokens/motion.css` | Durations, easing, the press-shift transform. |
| `tokens/base.css` | Element resets, heading defaults, link colours, selection colour. |
| `guidelines/brand/` | Logo, name lockup and headline-voice specimen cards. |
| `guidelines/colors/` | Brand core, crimson ramp, navy ramp, neutrals, status, approved pairings. |
| `guidelines/type/` | Display scale, body scale, eyebrows/labels, figures. |
| `guidelines/spacing/` | Spacing scale and section rhythm in use. |
| `guidelines/structure/` | Borders + block shadows, interaction states, motion tokens. |
| `components/` | The React primitives (see below). |
| `ui_kits/website/` | The CKP landing page, built from those primitives. `README.md` in that folder documents each file. |
| `ui_kits/webinar/` | The 8 September 2026 webinar registration page (12 sections + thank-you screen), mobile-first, copy verbatim from the client brief. `README.md` in that folder documents the direction. |
| `templates/landing-page/` | The same landing page packaged as a template consuming projects can start from (`LandingPage.dc.html` + `ds-base.js`). |
| `assets/ckp-logo.png` | The supplied badge logo. The only real brand asset. |
| `explore/` | The three identity directions presented for selection (A chosen). Kept for reference. |
| `SKILL.md` | Agent-skill entry point for using this system outside this project. |

## Components

Grouped by concern. Each directory has one `@dsCard` HTML showing its variants.

- **`components/core/`** — `Button`, `IconButton`, `Badge`, `Card`, `Stat`, `SectionHeading`
- **`components/forms/`** — `Input`, `Select`, `Checkbox`, `Switch`
- **`components/content/`** — `ServiceCard`, `Accordion`, `Testimonial`
- **`components/navigation/`** — `Tabs`
- **`components/feedback/`** — `Dialog`

Every component reads its styling from the CSS custom properties in `tokens/` — no CSS-in-JS, no npm dependencies beyond React. Each has a sibling `.d.ts` (props contract) and `.prompt.md` (what it is, when to use it, a usage example).

**Intentional additions.** CKP supplied no component inventory, so this is an authored set sized to the first surface (a landing page) rather than a generic library. Three entries exist because the landing page needs them and no source defined them: `Stat` (the hero proof strip), `SectionHeading` (the eyebrow + display-title pattern that opens every section), and `ServiceCard` (the six-up services grid). `Testimonial` ships with placeholder copy — CKP has not supplied an approved client quote.

---

## Content fundamentals

**The voice is a confident partner, not a compliance vendor.** CKP's own public language pairs plainness with ambition — "simple, cool, approachable real-time accounting", "build bold", "champion business success". The system's copy keeps that but strips the exclamation marks and the all-caps sentences found on the legacy site.

- **Person.** Second person for the reader ("your books", "you will hear back"), first-person plural for the firm ("we set up the books"). Never "the client".
- **Sentence length.** Headlines are two to six words, in the imperative or a flat declarative: *Build bold. Know your numbers.* / *Six services, one team.* / *Straight answers.* Body sentences run 12–25 words and stop.
- **Casing.** Display type is always uppercase; that is a typographic rule, not a shouting rule. Body copy, buttons excepted, is sentence case. Buttons are uppercase because the type is set in Archivo Black.
- **Plain English before jargon.** Say "your books closed monthly, not scrambled together at year end", then name CP204 or SST inside the detail bullets where it earns its place. Never open a section with an acronym.
- **Specifics over adjectives.** "Monthly accounts by day 10" beats "timely reporting". "You will hear back from a partner, not a call centre" beats "excellent client service".
- **No exclamation marks. No emoji.** CKP's social accounts use emoji; the website and any document built from this system do not.
- **Numbers are proof, not decoration.** Only figures the firm can stand behind: 300+ SMEs, founded 2015, MY/SG offices, Xero. No invented percentages, no "10x".
- **Malaysian context is explicit.** Sdn Bhd, SSM, LHDN, EPF, SOCSO, SST, ringgit as `RM 428,910`. Spelling follows Malaysian/British convention (*organisation*, *centre*, *modernising*).
- **Pricing language.** The firm has not published prices, so the system never invents them: the promise is "a fixed monthly scope and price in writing after review".

Two examples of the register, written for this system:

> Cloud accounting for Malaysian SMEs — whether you are opening your first Sdn Bhd or your third branch. We set up the books, file on time, and give you numbers you can act on this month, not next year.

> A partner will review your case and come back within one working day with a fixed monthly scope and price.

---

## Visual foundations

The chosen direction is **"Build Bold"**: flat brand colour, heavy display type, hard ink structure. It borrows the logo's own logic — a solid crimson field, chunky geometric letterforms, navy as the counter-colour — and refuses gloss.

**Colour.** Three brand values, sampled from the logo: crimson `#F4064F`, navy `#1B2687`, white. Crimson is used at full strength across whole sections (hero, CTA band) — it is a background colour, not an accent. Navy is the counter: second-line headline colour, secondary buttons, links, footer detail. Ink `#0E1233` draws every structural line and carries the dark sections. Maximum two background colours per page beyond white: crimson and one of ink or the crimson-50 wash. **No gradients anywhere** — crimson and navy sit next to each other as hard-edged fields, never blended.

**Type.** Archivo Black for all display type, Archivo 400/500/600 for everything else — one superfamily, no third font. Display is uppercase, tracked at −3.5%, line height 0.9, and set large: the hero runs at 104px, section headings 40–56px. Body sits at 15–21px with 1.55 line height. Eyebrows are 12–13px Archivo Black, uppercase, +0.16em tracking, always inside a solid or outlined block rather than floating as bare text. Numerals in figures use tabular spacing.

**Backgrounds.** Flat colour only. No photography has been supplied, so the system does not depend on any: sections are built from colour fields and ink rules. No patterns, no textures, no grain, no illustration. If photography arrives, treat it as documentary — real offices, real people, cool daylight, minimal retouching — and never place display type over a busy frame without a solid block behind it.

**Structure and borders.** Everything is drawn with `3px solid var(--ink)`: page sections separate with a 3px rule, grids share 3px rules between cells with no gap, and cards carry the same 3px frame. Fields use 2px. Hairline `1px` gray only inside a card, for list separators. **Corner radius is zero, everywhere.** The single round shape in the system is the logo badge.

**Shadows.** Hard offset blocks only: `5px 5px 0` in ink, or in crimson when the card sits on a dark field. Never a blurred shadow, never `rgba` softness, never elevation layers. The shadow is a graphic device, not a depth cue.

**Hover and press.** Hover swaps colour rather than dimming: crimson buttons go navy, navy goes crimson, white goes to the crimson-50 wash with crimson text. Press moves the element 2px right and down and shrinks its shadow to `3px 3px 0`, so it visibly sinks into its own shadow. Links go navy → crimson. Cards marked `interactive` do the same 2px shift on hover. No opacity fades on hover, no scale-up, no lift.

**Motion.** Short and mechanical: 80ms for the press, 120ms for colour swaps, 180ms for a dialog or accordion, 320ms for a scroll reveal (fade plus a 12px rise). Easing is `cubic-bezier(0.22,0.9,0.28,1)`. No bounce, no spring, no parallax, no auto-playing carousels. All transforms drop under `prefers-reduced-motion`.

**Transparency and blur.** Almost never. The one sanctioned use is the dialog scrim: ink at 72% opacity, with no backdrop blur. Text on crimson or ink sections uses `rgba(255,255,255,.72–.88)` for secondary lines; that is the only other place transparency appears.

**Layout.** 1280px max content width, 56px gutters, 80px section padding (112px for hero-scale sections). The header is sticky with a 3px bottom rule; nothing else is fixed. Grids collapse 4 → 2 → 1 and keep their ink rules. Copy measures cap at ~52 characters for body, ~15–24 characters for display headings.

**Cards.** White (or crimson/navy/ink when emphasised), 3px ink border, square corners, 24px padding, hard offset shadow when standing alone, no shadow when sharing rules inside a grid. One emphasis cell per grid maximum — in the services grid, cell 05.

**Forms.** 2px ink borders, no radius. Focus turns the border crimson and adds a `3px 3px 0` offset shadow. Labels are uppercase Archivo Black at 12px above the field. Errors replace the hint line in crimson-dark `#D50444`; the border matches. Checkboxes are 24px squares that fill crimson with a white tick; switches use a square track and a square knob.

---

## Iconography

CKP supplied **no icon set** — no icon font, no SVG sprite, no PNG icons.

- **Substitution (flagged):** the system uses **[Lucide](https://lucide.dev)** from CDN (`cdn.jsdelivr.net/npm/lucide`), chosen because its 2px-stroke geometric outlines match Archivo Black's construction better than a filled or rounded set. Stroke width is bumped to **2.25** so icons hold their weight next to the heavy type.
- **Sizes:** 20px inline with body text, 24px in service cards and step blocks, 18px inside buttons. Icons take `currentColor` — crimson on white, white on crimson or ink. Never two icon colours in one block.
- **Usage rule:** icons label a service or a step. They are never decorative filler, never placed in coloured circles or squares, and never used at display sizes as illustration.
- **Icons in use on the landing page:** `book-open` (bookkeeping), `receipt-text` (tax), `shield-check` (audit), `users` (payroll), `cloud` (cloud/AI setup), `stamp` (corporate secretarial), `arrow-right` (CTAs).
- **Emoji:** not used in product or web surfaces, despite appearing on CKP's social posts.
- **Unicode as UI glyphs:** limited to the few places a stroke icon would be heavier than the mark it replaces — `+`/`–` in the accordion, `✓` in the checkbox, `▼` on the select, `×` to dismiss a dialog. Everything else is Lucide.
- **Wrapper:** `ui_kits/website/Icon.jsx` is a thin Lucide wrapper (`<Icon name="cloud" size={24} />`). It is a kit helper, not a design-system component, because the icon set is a substitution rather than a CKP asset.

---

## Open questions & substitutions

Flagged for the user, in priority order:

1. **Fonts are a substitution.** No font files were supplied. Archivo Black + Archivo (Google Fonts) were chosen to echo the heavy geometric letterforms of the logo wordmark. If CKP owns or licenses a typeface, send the files and `tokens/fonts.css` can be swapped to local `@font-face` rules with no other change. Because the fonts load from Google's CDN via `@import`, the compiler reports **0 fonts** for this project — that is expected, not a break.
2. **One logo asset only.** There is no horizontal lockup, no white/mono version, and no vector (SVG/EPS). The name lockup in `guidelines/brand/lockup.card.html` is the badge plus type, which is a workaround, not a real lockup. A vector logo and a reversed version are the highest-value assets to add.
3. **No photography.** The landing page is deliberately built without images. Real office/team photography would change the hero and "who we help" sections meaningfully.
4. **Testimonial copy is a placeholder** and is labelled as such in the UI. Nothing should be published from it.
5. **Firm facts** (300+ clients, 2015, MY/SG, Xero, address, LLP number, phone) come from CKP's own public site and press coverage — worth a check against current figures before publishing.
6. **No pricing** appears anywhere, by design.
7. **Two reds are in play in the source material.** The logo samples `#F4064F`; the webinar brief specifies `#F4334E`. Everything in this system uses the logo value. Confirm which is canonical.
8. **The webinar page is built in the Build Bold direction**, same as the website kit — crimson floods, ink rules, uppercase display, hard offset shadows — composed from `Button`, `Badge`, `Input`, `Select` and `Accordion`. It uses the logo crimson `#F4064F`, not the brief's `#F4334E`.
9. **Webinar assets outstanding:** session time, Xero Platinum Partner badge (used twice), Jeremy Chia's photo, video still frames, firm address/phone/email, privacy-policy URL. All are marked placeholders in the page. The five Drive videos need "Anyone with the link can view" or the embeds will show a sign-in wall.
