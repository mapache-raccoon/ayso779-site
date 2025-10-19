# Program page template — usage guide

This document explains how to use the program page template located at `pages/programTemplate.html`.
Copy the template to create a new program page (for example `pages/core.html`) and replace the placeholder comments with real content.

## Quick steps

1. Copy `pages/programTemplate.html` to a new file in `pages/`, for example `pages/core.html`.
2. Open the new file and replace the HTML comment placeholders (they look like `<!-- PLACEHOLDER_NAME -->`) with real text, links, and image paths.
3. Save and preview the page in a browser. The navigation is injected automatically by `assets/scripts/main.js`.

## Placeholder reference

Top-level placeholders (in `<head>`)

- `<!-- PAGE_TITLE -->` — page title (displayed in browser tab and hero H1)
- `<!-- PAGE_DESCRIPTION -->` — meta description (SEO)
- `<!-- OG_IMAGE -->` — open graph / share image (relative path from the page)

Hero and overview placeholders

- `<!-- HERO_LEAD -->` — short one-line lead text under the H1
- `<!-- IMAGE_ALT -->` — alt text for the hero image
- `<!-- OVERVIEW_PARAGRAPH -->` — short overview paragraph used in the Overview section
- `<!-- WHO_FOR -->`, `<!-- WHEN -->`, `<!-- WHERE -->` — three small cards in the Overview section

Program details & sidebar placeholders

- `<!-- DETAILS -->` — detailed program description
- `<!-- FORMAT -->` — weekly structure / format description
- `<!-- AGE_GROUP_1 -->`, `<!-- AGE_GROUP_2 -->`, `<!-- AGE_GROUP_3 -->` — list items for divisions
- `<!-- REG_LINK -->` — registration URL (used by Register CTAs)
- `<!-- CONTACT_LINK -->` — internal/external contact page URL
- `<!-- CONTACT_EMAIL -->` — contact email (used by mailto links)
- `<!-- CONTACT_NAME -->` — coordinator/point-of-contact name
- `<!-- CONTACT_PHONE -->` — phone number (optional)
- `<!-- NEXT_START -->` / `<!-- REG_DEADLINE -->` — next season dates for the sidebar card

Six generic cards

- Each card uses three placeholders:
  - `<!-- CARD_N_LINK -->` — link / href for card N (N = 1..6)
  - `<!-- CARD_N_TITLE -->` — card title
  - `<!-- CARD_N_DESC -->` — short description text

Example (Card 1)

Replace:

```html
<a class="card" href="<!-- CARD_1_LINK -->" title="<!-- CARD_1_TITLE -->">
  <h3><!-- CARD_1_TITLE -->Card 1 Title</h3>
  <p><!-- CARD_1_DESC -->Short description for card 1.</p>
</a>
```

With:

```html
<a class="card" href="divisions.html" title="Division Guidelines">
  <h3>Division Guidelines</h3>
  <p>Rules, team sizes, and format for each age division.</p>
</a>
```

## Pathing guidance

- The page is stored under `pages/` so asset paths in the template use `../assets/...` (page-relative). When you copy to `pages/`, keep those relative paths intact.
- If you prefer root-relative paths (for example `/assets/...`), update the template accordingly. Root-relative paths are safer when the site is deployed at the repository root, but page-relative paths are simpler for local previews.

## Images: sizes & alt text

- Hero background/share image: recommended at least 1200 × 630px (16:9) for social previews. Use high-quality JPEG or WebP.
- Hero logo (if used as a smaller image): 400 × 400 px max. Use `alt` text that describes the image (e.g., "AYSO Region 779 crest") — do not leave `alt` empty unless the image is purely decorative.

## Accessibility & SEO notes

- Ensure every page has a single `<h1>` (the template uses `<!-- PAGE_TITLE -->`).
- Provide meaningful `alt` text for images (`<!-- IMAGE_ALT -->`).
- Use clear link text — avoid "click here". The card titles are links so they should be descriptive.
- Add a meta description (`<!-- PAGE_DESCRIPTION -->`) of about 50–155 characters.

## Authoring checklist

- [ ] Set `<!-- PAGE_TITLE -->` and `<!-- PAGE_DESCRIPTION -->`
- [ ] Set `<!-- OG_IMAGE -->` if you want a custom social share image
- [ ] Replace hero placeholders: `<!-- HERO_LEAD -->`, `<!-- IMAGE_ALT -->`
- [ ] Fill Overview placeholders (`WHO_FOR`, `WHEN`, `WHERE`)
- [ ] Replace the six card placeholders (`CARD_1_*` through `CARD_6_*`)
- [ ] Set `<!-- REG_LINK -->`, `<!-- CONTACT_EMAIL -->`, and contact info
- [ ] Preview the page and test navigation, links, and mobile responsiveness

## Optional: create stubs for the 6 linked pages

If you want ready-to-edit starter pages for the six cards (fields, schedule, divisions, standings, referees, volunteers) I can create stubs under `pages/` with the same header/footer and a short starting paragraph.

---

If you want me to convert one of your existing program pages into the new template (and populate the placeholders), tell me which page and I will do it.
