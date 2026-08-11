# Import notes

Imported from Claude Design project `SME Ads Landing Page Design`
(`67578b01-e571-4eca-af96-f556836646e9`) into this folder.

Run it with:

```bash
node "C:/Users/A/AppData/Local/Temp/claude/C--Users-A-Downloads-CKP-Landing-Page/74cab603-911b-4654-873d-79669026f012/scratchpad/serve.js"
```

then open http://localhost:4173. It must be served over HTTP — opening the HTML
via `file://` fails, because Babel Standalone fetches the `.jsx` files over XHR.

## Everything imported cleanly

The design API (`DesignSync.get_file`) caps a single read at 256 KiB, which
truncated the design-system bundle and two of the three images. Those were all
re-fetched in full from the project's own serve endpoint, which has no such cap:

```bash
BASE="https://67578b01-e571-4eca-af96-f556836646e9.claudeusercontent.com/v1/design/projects/67578b01-e571-4eca-af96-f556836646e9/serve"
TOK="<the ?t= token from any asset request on claude.ai/design>"
curl -o assets/ckp-logo.png "$BASE/assets/ckp-logo.png?t=$TOK"
```

The token is visible in DevTools → Network on the design project page, on any
`…/serve/…` request. It works without cookies but does expire — grab a fresh one.

Verified complete: `ckp-logo.png` 411×411, `jeremy-chia.png` 719×1080,
`xero-platinum-partner.jpg` 1024×591, `_ds_bundle.js` 397 KB with all 15
components and its real export tail.

Three entries appear in `window.CKPDesignSystem_23ab2d.__errors`
(`ui_kits/webinar-notice`, `webinar-v2`, `webinar-v3`). Those are the design
system's own demo scripts looking for DOM nodes that only exist on their demo
pages. They are caught by the bundle's try/catch and are harmless here.

## Changes made on top of the imported design

**Section labels removed.** The `Section 01`–`Section 05` badges were scaffolding
from the copy document. Descriptive halves were kept (`What you leave with`,
`Who is teaching`, `Before you register`).

**Sections 01 and 02 rewritten.** They previously argued the same point twice —
Section 01 in four paragraphs, Section 02 again via three "handover" cards. That
is now one `.blind` grid (three advisers × what each sees / cannot see) in
Section 01, and Section 02 is down to a headline, one line, and the ledger table
it always had. Page height dropped from 14,562px to 9,628px.

**Client videos wired up.** Five Drive files, portrait 9:16, all five shown at
once rather than three behind a "See two more" button — an ad landing page should
not hide its proof behind a click. Tiles are `<button>`s with `aria-label`s.

Stills live in `assets/video-stills/` because Drive refuses to hotlink thumbnails
cross-origin (they 200 in curl and fail in the browser). Refresh them with:

```bash
curl -sSL -o assets/video-stills/story-1.jpg "https://drive.google.com/thumbnail?id=<FILE_ID>&sz=w500"
```

The Drive files must stay on "Anyone with the link can view" or the embed shows a
sign-in wall.

**`image-slot.js` removed** from the HTML. Nothing referenced it once the video
tiles used real stills, and it was 64 KB of dead JavaScript. The file is still on
disk if you want image-drop slots back — re-add the `<script>` tag.

**One CSS fix.** Sections 01/02/03 set `grid-template-columns` inline from JSX,
and `.s1-grid`/`.s2-grid`/`.s3-grid` existed as collapse hooks with no rules. On a
phone those grids stayed two-column with the second column squashed to 88–131px:

```css
.s1-grid,.s2-grid,.s3-grid{grid-template-columns:1fr!important;gap:32px!important}
```

`!important` is required — a plain class rule loses to the inline style.

## Design round — conversion pass

**Hero.** Two paragraphs (62 words) became one lede plus one line (37 words), same
meaning. The subhead was competing with the headline at 22px, so it now runs on
its own `.hero-lede` / `.hero-sub` scale (19.5px / 16.5px) and the H1 dominates.

**Section 01 is now a diagram, not prose.** Three covered zones with two hatched,
dashed `GAP` columns between them, over a crimson `Nobody is looking here` band
listing what falls through. The gap is drawn rather than described. On mobile the
vertical gaps become horizontal hatched bands, which reads even better.

**Section 02 sells urgency.** Added the deck's compliance clock — 30 days / 90 days
/ 18 months / every month — under a "The clock is already running" badge, plus a
`.payoff` block stating what the reader personally gets out of the hour. Headline
sharpened to "Miss one and it gets expensive quietly."

**The connect band was rebuilt.** It was three labels and a dash, which did not
communicate merging. It is now three bordered sources, arrows flowing down, and one
crimson `One connected view` bar — three-into-one is visible at a glance.

**"What you leave with"** retitled to "One hour. Six answers you can act on the
same week", with all six cards rewritten benefit-first ("The cheapest legal way to
pay yourself" rather than "How to pay yourself properly").

**Videos play inline.** The lightbox is gone. A 9:16 stage plays the selected story
in place, with a five-thumbnail strip to switch and the active one flagged in
crimson. The right column carries a 300+ clients line and a CTA next to the proof.

**Mobile header fixed.** Below 860px the date and firm subtitle are hidden; below
560px the firm name goes too, leaving mark + CTA, and gutters drop 32px → 20px.
Previously the name collided with the date and the CTA ran off-screen.

## Copy and design round two

**The three questions** were consultant questions ("Are we okay?"). They are now the
ones owners actually ask themselves — "What have I already missed?", "Is anyone
actually watching this?", "If it is wrong, does it land on me?" — under a line that
shows we know they think them: *"Most owners never say these out loud. They think
them anyway."* The third deliberately lands on director liability, which is the real
fear and picks up the SSM-register line directly above it.

**Section 02 leads with consequence, not mechanism.** The urgency is not the
deadline, it is *when you find out*: "you will not find out on the day it happens.
You find out at the audit, or when the letter arrives, by which time it has been
growing quietly for months." Headline is now "By the time you notice, it has already
cost you." The ledger columns became "Miss this" / "Here is what happens to you",
the consequences are written in the second person ("The loan is declined. The tender
closes without you."), and that column now sits on a crimson wash in bold ink so it
carries the weight rather than reading as a flat table cell.

**The merge band** is a real convergence diagram: three numbered source cards with
what each one holds, an SVG that actually converges three lines into one, and a
centred crimson panel with a white border and offset shadow. On mobile the three-way
converge would be meaningless with stacked cards, so it drops to one clean line.

**The form** had its title repeating the button text and notes floating loose. It now
has a solid ink header ("Your free seat" + the date line in crimson), a bordered
footer block holding the button and the reassurance line, and no duplicated wording.

## Proofread fixes

- Hero said the work was split across **four** people; the coverage grid and the
  merge band both show **three**. Now consistently three, and "who never compare
  notes" carries the insight.
- "Leave the hour" appeared twice within two screens. Second one is now "In sixty
  minutes".
- "Twenty slots" → "20 slots", matching "20 review slots" elsewhere.
- "real Malaysian SMEs" set in uppercase display type rendered as "SMES". Changed to
  "real Malaysian businesses".
- "Business we've helped" → "Businesses we've helped" (plural). Flagging this since
  the singular was your wording — easy to revert in `parts-2.jsx`.
- FAQ said "Before you register" in the badge and "before registering" in the
  heading. Heading is now "The questions owners usually ask us first."
- **Duplicate form field IDs fixed.** The form renders twice and the design system
  derives ids from label text, so six ids collided and every `<label for>` in the
  bottom form focused the *hero* form. Ids are now namespaced per form instance.
  Verified: 0 duplicates, all 12 labels resolve inside their own form.
- **Sticky bar had no horizontal padding at any viewport ≤1280.** `.sticky-in` set
  the `padding` shorthand, which reset the `.wrap` gutters it shares the element
  with. Changed to `padding-block`. It now sits on the 56px desktop / 20px mobile
  gutter like everything else.
- **Sticky bar wrapped to five lines on a phone.** The date line is hidden below
  560px and the countdown sheds minutes and the "of 40", leaving
  "27d 22h to go · 23 seats left". 74px tall instead of ~200px.
- The question band's 88px number gutter is desktop rhythm; on a phone it stole a
  quarter of the width. Now 34px there.

## Still outstanding in `config.jsx`

- `privacyUrl` is `'{{PRIVACY_URL}}'` and renders literally in the footer, as both
  the link text and the href.
- `time` was set to `'8:00 PM (GMT+8)'`, derived from `eventStart`. If the real
  start time differs, change **both**.
- `language` is `'{{LANGUAGE}}'` and is never rendered. The source copy document
  has it in the hero eyebrow (`… · {{TIME}} · {{LANGUAGE}}`) — it was dropped
  during the build. Worth restoring for a Malaysian audience.
- `seatsTaken: 17` is a placeholder and drives "23 of 40 seats left" everywhere.

See `NEXT-STEPS.md` for the prioritised list of what would move conversion.
