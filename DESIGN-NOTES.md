# CEFORED — design notes and follow-ups

Working document for the Astro rewrite (`astro-rewrite` branch). Records what
changed and why, and what is still open. Delete a section once it is done and
no longer useful as background.

---

## Where things stand

| | |
|---|---|
| Pages | 19 built |
| Page-scoped CSS | 856 lines across 12 pages (was 1,009) |
| Component CSS | 284 lines |
| `!important` in built output | 0 |
| Components | `PageHead`, `Card`, `Button`, `Accordion`, `AccordionItem`, `Badge`, `RealmIndex`, `Seo` |

---

## Done

### Focus ring — two-tone

Near-black outline at 2px offset, white halo filling the gap.

No single colour clears the 3:1 required by WCAG 2.2 §1.4.11 against white
cards, the teal header **and** hero photography at once. The pair guarantees one
of the two rings contrasts with whatever is behind it. The old orange ring sat
at 2.6:1 on the page background and 2.4:1 on the header — a real failure, not a
preference.

Measured: 16.6:1 on the page background, 18.1:1 on white, 18.1:1 on dark. On the
teal bar the dark ring alone is 2.85:1 and the halo carries it at 6.33:1. That
row looks like a failure in isolation and is not — the indicator is the pair.

### Palette

Replaced the CSS keyword colours. `--brand` was `#008080` (`teal`), `--accent`
was `#ffa500` (`orange`), `--bg` was `#f5f5dc` (`beige`) — all three exact
keyword matches, never chosen, just typed. Keyword primaries have no tonal
range, which is why every brand-coloured thing on the site was the same value.

Now a teal ramp (`--teal-900` … `--teal-300`), burnt amber, warm paper.

**`--brand-fg` is the load-bearing idea.** Brand-as-foreground flips per theme;
`--brand` stays for brand *surfaces* (header, bands). That distinction let 34
`html.dark-mode … { color: var(--accent) }` overrides be deleted. Dark mode had
been dropping teal entirely and rendering as a monochrome amber site.

| | ratio | was |
|---|---|---|
| brand text on paper | 5.81 | 4.28 (failing) |
| brand text on white card | 6.33 | 4.77 |
| brand-fg on dark surface | 7.38 | — |
| accent icon on white | 3.78 | 1.96 |
| black label on accent button | 4.60 | — |

### One opening treatment — `Hero.astro` deleted

The photo hero was consolidated into a component, then removed entirely. A
stock photograph behind a 62% black scrim said nothing about the page it opened
and gave all nine pages the same face; once the homepage went type-led it also
contradicted the homepage.

Every page now opens through `PageHead`: left-aligned, eyebrow, display h1,
lede, and — where there is a photograph worth showing — a full-bleed strip
below the type rather than a scrim behind it. Realm pages use their own realm
photo there. `programs` and `corporate-training` open with no image at all;
both have strong content immediately below and the stock strip was filler.

The h1 animates with **transform only, under a mask**, never opacity, so the
largest contentful paint is not gated on the animation. No page preloads a hero
image any more — LCP is text everywhere.

### Decoration removed

- **Side-tab accent borders** (5): `border-left: 4px solid var(--accent)` on
  `.mv-card`, `.overview`, `.intro`, `.perks`, `.contact-aside`. Pure decoration
  encoding nothing.
- **Section title underline**: the 90px amber bar under every `h2` on every
  page. Bottom margin went `--space-m` → `--space-l` because the bar was
  carrying ~16px of real vertical space.
- **Card lift**: `translateY(-4px)` on hover, 6 instances. The five *link* cards
  now mark hover with `border-color: var(--brand-fg)`, echoing the button logic.

The homepage `.card` lost its hover **entirely** — those three are plain
`<div>`s, not links, and a card that reacts to the pointer but does nothing when
clicked is a false affordance.

- **Form status borders**: `[data-form-status="ok"|"error"]` kept theirs for
  three passes on the grounds that the colour carried state, then went too. The
  tint went 12% → 18% to compensate, and the message text states the outcome, so
  colour was never the only cue.

### `Button.astro` + inversion sweep

Renders `<a>` when given `href`, `<button>` otherwise. 30 usages converted.

**Why the old hover was replaced.** It transitioned `border-*-color` around the
perimeter. A border side fades in *as a whole* — `border-color` has no
directional component — so it showed four edges blinking in clockwise sequence
over 520ms, and the corner arcs, each shared by two sides, popped as the
sequence handed over. It could not read as a travelling stroke.

Now: a fill rises from the bottom edge and the label inverts. Bottom-up covers a
centred label evenly, so the label colour can flip mid-sweep without ever
sitting on a half-covered background.

| state | background | label | contrast |
|---|---|---|---|
| solid rest | amber | `#1a1a1a` | 4.60 |
| solid hover | `--brand-dark` | white | 9.40 |
| ghost rest | transparent | white | 15.51 |
| ghost hover | white | `#14161c` | 18.08 |

`prefers-reduced-motion` collapses the durations in `tokens.css`, so it degrades
to an instant, still-legible state change.

`.btn` styles stay global in `base.css` — scoping them into the component would
break any markup still written as `<a class="btn">`, and the fill needs no
per-instance markup.

**`.btn-ghost` has two contexts and the selector specificity is load-bearing.**
It defaults to the page background (brand outline and label); anything on an
always-dark backdrop inverts it via `:where(.band, .on-dark) .btn-ghost`.

The `:where()` is not cosmetic. The resting colour rule must stay at **0,1,0**,
below `.btn:hover` at 0,2,0. Written plainly as `.band .btn-ghost` it scores
0,2,0, ties the hover rule, and — being later in the file — wins: the fill swept
to white while the label stayed white, so the button went blank on hover. Both
regressions in this variant came from the same place, once from a resting colour
that assumed a dark backdrop and once from raising specificity above the hover.

Verified by parsing the built CSS and comparing specificity, not by reading the
source. Note that `:where(...)` contains commas that are **not** selector-list
separators — split on them and the count comes out wrong.

---

### Typography — weight axis and real italics

`--fw-*` and `--ls-*` tokens added. `h1`–`h4` had never set `font-weight` at
all, so every heading ran on the browser's default bold — one value out of an
800-step axis. Now `h1` at 850 with `-0.02em`, `h2`–`h4` at 700, fine print and
muted metadata at 500. All 33 numeric weights in the codebase are tokenised;
none remain outside `tokens.css`.

**Italics were faux.** Only the roman was loaded, so the four `font-style:
italic` rules rendered as a browser-synthesised oblique — the upright sheared
over, not the drawn italic. Fixed by importing
`@fontsource-variable/nunito-sans/wght-italic.css`.

**Axis decision: staying on `wght` + `wght-italic`, not `full`.** Measured
against what each axis would actually buy:

| axis | latin cost | verdict |
|---|---|---|
| `wght` 200–1000 | 31 KB | in use |
| `ital` | +33 KB | added — fixes a real defect |
| `opsz` | +19 KB | **cannot help.** Range is 6–12pt, a text optical range. `h1` renders at 35–58px, far outside it |
| `YTLC` | +6 KB | lowercase-height micro-tuning, no use here |
| `wdth` 75–125 | +26 KB per style | the only one worth revisiting — see below |

`full` normal + italic would be 169 KB against today's 62 KB. For an East
Africa audience largely on mobile, +107 KB of blocking webfont is a real cost
for two axes that cannot help and one that is speculative.

**`wdth` is the open question.** A condensed heavy display treatment would be
genuinely distinctive and is the one axis that would change how the site looks.
It costs +26 KB (normal) and only pays off if a display treatment is actually
designed around it. Swap the import to `wdth.css` and add a
`font-stretch` to `h1` if that direction is wanted.

Unused subsets (cyrillic, cyrillic-ext, vietnamese) ship in `dist/` but
`unicode-range` means no browser downloads them. Not worth removing.

### `Accordion.astro` / `AccordionItem.astro`

Replaced five hand-rolled `<details>` implementations: `index .realm`,
`realms .course`, `faqs .faq`, `corporate .package`, `admission .fee-realm`.

They had drifted. **Admission's had lost both the chevron and the open-state
shadow** — consolidating fixed a real inconsistency, not just duplication.

Page-scoped CSS 1,009 → 788 lines; the shared structure is 111 lines of
component CSS. Each page now emits one chevron rule instead of its own copy.

Body content is authored in the *parent's* style scope. A bare element selector
in the page cannot reach it, so slotted elements that need styling get a class
(`.realm-heading`, `.faq-answer-text`, `.package-cta`, `.fee-cta`).

### `Badge.astro`

Consolidated chips, tags, price pills, and numeric counters across the site
(`corporate-training`, `admission`, `blog`, `blog/[slug]`).

**Why chips were distorting into circles.** In CSS grid layouts with `display:
grid; grid-template-columns: 1fr auto;` (such as the corporate training package
price list), sibling items defaulted to `align-items: stretch`. When a course
title wrapped onto multiple lines, the price tag was stretched along the Y-axis
to match the full row height. With `border-radius: 999px` and a short label like
`$6,500`, a ~48px height against a ~50px width distorted the pill into an
egg/circle.

`Badge.astro` guarantees `align-self: start`, `flex-shrink: 0`, inline-flex
centering, and consistent proportional padding across `sm` and `md` sizes with
tokenised colour variants (`accent`, `brand`, `neutral`, `outline`).

---

### About page

Was the last fully-centred page and seven bordered cards deep: mission, vision,
six realm cards, four value cards, team. Now zero card chrome.

Mission, vision and team are `.statement` blocks — a labelled left column
against prose, so the page reads as a document. The six realms use the same
numbered-row treatment as the homepage index, minus the preview panel, since
this page is prose about the institute rather than somewhere to browse from.
Values are a numbered list matching the homepage.

All original copy is preserved verbatim, including the realm blurbs, which
differ from the taglines used elsewhere.

### `data-draw` — connector that advances with scroll

New declarative motion attribute alongside `data-reveal` / `data-reveal-group`.
Used once, on the four `/admission` "How to apply" steps.

**It is on that section and not on "Why CEFORED" deliberately.** Admission's
steps are a genuine sequence — you cannot enrol before you apply — so a line
advancing with the scroll reports the order. The six "Why CEFORED" reasons are
parallel points; their `01`–`06` is enumeration, not order, and a connector
there would assert a progression that does not exist. That is the same category
as the side-tabs and the section underline this project spent three passes
removing.

The steps lost their card chrome for it: a connector has to pass between the
markers, and the card backgrounds were what it would have had to hide behind.
Markers carry a page-coloured ring so the line appears to join them.

**Implemented as `scaleY`, not `stroke-dashoffset`.** Identical result for a
straight connector, but it animates on the compositor rather than repainting a
stroke every frame, and it sidesteps SVG length units — the minifier rewrote
`stroke-dashoffset: 1` to `1px`, which is ambiguous inside a viewBox stretched
with `preserveAspectRatio="none"` because the x and y scales differ. A genuine
curved path would still need the SVG route.

Fully drawn by default; only `html.js-motion` starts it undrawn, so no-JS and
reduced-motion users get the finished line rather than an empty gutter.

### Centring — finished

`.section-title` is now used **only inside `.band`**. A short call to action in
a coloured block is centred deliberately; everywhere else uses `.section-head`,
because a centred heading over left-aligned content gives the eye no edge to
return to. Six headings moved: three on `admission`, two on
`corporate-training`, one on `blog/[slug]`.

`.lede` now sets **no `text-align` and no inline margin**, so it inherits from
whatever contains it — left on an ordinary page, centred inside a band.
Forcing `center` on the class was what left ledes centred over left-aligned
content. `.band .lede` re-centres explicitly, and `404` does the same in its own
scoped style, since that page centres its whole container.

Verified against the built output: no `.section-title` survives outside a
`.band`, and exactly two rules mention `.lede` — the bare one with no alignment
and the band override.

### `Card.astro` / `PageHead.astro`

`Card` owns **chrome only** — border, radius, surface, shadow, padding, and the
link hover. Layout stays in the page, because layout is what actually differs
between a testimonial and a course card. 18 rules across 11 pages collapsed into
one; the recipe now appears **zero** times in page CSS.

`as` keeps the element honest: `<form>` on the two forms, `<aside>` on the
contact panel, `<figure>` on testimonials, `<li>` inside the steps list. A card
is a surface, not a `<div>`.

`PageHead` replaced five copies. Bottom padding collapses when its slot is
empty, so pages with a button row underneath keep full section padding.

**404 deliberately left alone.** It leads with a large `404` above the `h1`;
PageHead puts the `h1` first. Adding an eyebrow slot for one page would be
ceremony.

**Not worth componentising:** `Section` — `<section class="section">` is already
fine. Same for a grid; `repeat(auto-fit, …)` is three lines and reads better
inline.

**Keep Astro scoped styles** rather than a shared `components.css`. Scoping is
what guarantees zero collisions and zero `!important`; worth more than the dedup
a global sheet would buy.

### Realm photography — one pipeline

`image-sources/realms/<slug>.{webp,jpg}` holds the full-resolution originals.
`node .build-realm-images.mjs` derives everything shipped:

| output | size | used by |
|---|---|---|
| `<slug>-hero.webp` | 1920×1080 | realm page hero background, OG image |
| `<slug>.webp` | 1200×800 | landing-page index preview panel |
| `<slug>-sm.webp` | 600×400 | index row thumbnail on mobile |

**Originals must stay out of `public/`.** Everything under `public/` is copied
verbatim into `dist/`, so the 9.7 MB of originals would have been served to
users — one of them a 3.6 MB JPEG. `image-sources/` is outside `public/`, so it
is version-controlled but never deployed.

The script **never upscales**: a small original yields a smaller output than the
target. It therefore writes `src/data/realm-images.json` with the real emitted
dimensions, and `RealmIndex.astro` builds its `srcset` from that rather than
assuming 1200w. A descriptor claiming a width the file does not have makes the
browser pick the wrong candidate. `project-management` is currently 840px wide
for this reason.

Crop strategy branches on aspect: a portrait source cropped to landscape uses
sharp's `attention` strategy so it does not centre-crop through a face; a
landscape source is already near the target ratio and uses `centre`.

One photo per realm, shared between the realm page hero and the landing-page
index, so the two agree.

**Still placeholders** pending the client's own photography.
`project-management` has no supplied source and is a recrop of
`businessmeeting.webp` (840px) — the weakest of the six.

Superseded and now unreferenced, verified against the built output:
`realm1bg`, `realm2bg`, `realm4bg`, `realm5bg`, `realm6bg`, `bestbghealth`, plus
`worldvisionlogo.png` which was already dead. 400 KB total, not deleted.

---

## Open — ranked

### 1. Sticky hero + sheet reveal — built, then parked

Built on 2026-07-30 and reverted the same day: Leo wants to think the animation
through before committing to it. Nothing of it remains in the tree.

What it was: homepage hero `position: sticky`, everything after it wrapped in a
`.sheet` panel with an opaque background, `z-index: 1` and a rounded top edge,
riding up over the hero. No JS — layout and paint order only.

Two things any future attempt has to deal with, both learned the hard way:

- **`body { overflow-x: hidden }` in `base.css` kills it silently.** A scroll
  container anywhere up the ancestor chain disables `position: sticky` on every
  descendant, with no error. It needs `overflow-x: clip`, which stops
  horizontal scroll without creating a scroll container.
- **The hero has to stop being paper-coloured.** The panel sliding over it is
  `--bg`, so paper-over-paper shows no boundary and the effect is invisible. A
  brand-coloured field works, but then amber is unusable on it — `--accent-ink`
  and `--accent-on-dark` are both 2.61:1 on teal, so the eyebrow has to become
  a white tint (0.8 → 4.68:1).

### 2. Button label swap (optional upgrade)

The current fill crossfades the label colour with a 0.1s delay. During roughly
150ms of the transition the label sits over a partially-filled background at
reduced contrast. This is not a WCAG failure — contrast requirements apply to
resting states — but the crisp version stacks two label copies, one per colour,
and clips the top one with the same sweep. Perfect per-pixel flip, no dip.
Needs the label as a prop rather than a slot.

---

## Content decisions — need a human

These are not code problems and should not be guessed at.

- **"Partners & Accreditation"** marquees UN, UNICEF, UNDP, MSF, OXFAM, Save the
  Children and FAO under a heading containing *Accreditation*. If those are
  organisations alumni work at rather than bodies that accredit CEFORED, the
  heading is a claim that cannot be supported, and several of those bodies
  enforce their marks. **Highest-priority item in this file.**
- **Testimonials** are unattributed initials with superlatives — "John K.",
  "Incredible impact.", "Worth every dollar." Reads as placeholder. Three real
  named quotes with organisations would outperform ten of these; zero would
  outperform three of these.
- **Homepage "Our Motto / Programs / Join Us"** says nothing the rest of the
  page does not. Removing the fake hover was honest; deleting the section would
  be better.
- **Realm 2** contains two healthcare courses (AI in Healthcare Data Analytics,
  AI in Healthcare Operations & Management). Legacy copy-paste error, ported
  faithfully rather than silently fixed.
- **`/admission`** was never written in legacy — its `h1` said "Corporate
  Training". Built from real data only; no intake dates, deadlines, entry
  requirements or payment terms were invented.
- **Blog index** advertised a fourth post, "Real Stories from Cefored Alumni",
  with no file behind it. Omitted.
- **About** had two conflicting "Our Vision" statements. The first was used.
- **Navigation** omits `/admission` and `/blog` — footer only. Admission is the
  target of the hero's "Apply Now" and has no persistent path to it.

---

## Before launch

- **Confirm the production domain.** `https://www.ceforedconsultancy.com` is
  baked into every canonical, the sitemap and robots.txt. Wrong canonicals are
  worse than none. One line in `astro.config.mjs` plus `public/robots.txt`.
- **Enable Firebase App Check.** The contact and newsletter forms are
  unauthenticated public writes. The honeypot is not real protection.
- **Delete `legacy/`.** 23 dead pages that would otherwise be indexed as
  duplicates of the live ones.

---

## Conventions worth keeping

- `tokens.css` is the only place light/dark values, type sizes and spacing are
  defined. Dark mode is a variable flip, never a per-component override — the 34
  deleted overrides are what happens when that slips.
- Nothing outside `tokens.css` invents a font-size. Pick the nearest step.
- `--brand` for brand surfaces, `--brand-fg` for brand foregrounds.
- Page-specific rules live in the page's scoped `<style>`, so they cannot
  collide with the shell.
- **Verify against `dist/`, not `src/` or `dist/_astro/`.** Astro inlines small
  page stylesheets into the HTML and rewrites scoped selectors with
  `[data-astro-cid-…]`, so grepping the asset directory or assuming attribute
  order silently under-reports. This has produced false "0 results" more than
  once during this work.
