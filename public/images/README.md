# Site images

Every path is wired up in **`lib/assets.ts`** — change an image there once and
it updates everywhere it's used. Nothing else in the codebase hard-codes a path.

## Where each file appears

**Brand**

| File | Used for |
| --- | --- |
| `DentiVital_Logo1.png` | Header, footer, sign-in page, both dashboards |

**Hero slider** (`components/home/HeroSlider.tsx`)

| File | Slide |
| --- | --- |
| `Girl-min.png` | 1 — "Teeth Whitening Made Easy and Safe" |
| `Man-with-texture-and-icons-min.png` | 2 — "Multi-Benefit … Busy Lives" |
| `01.png` | 3 — "Triple Action" |

**Trust badge strip** — `ClinicallyProven.jpg`, `SensitivitySafe.jpg`,
`EnamelRepair.jpg`, `GumHealthBooster.jpg`, `Ratingbyclients.jpg`

**Ingredients section** — `Echinacea-…png`, `Myrrh-…png`,
`Coconut-oil-300x300.jpg`, `Hydroxyapatite.jpg`

**Founder section** — `Doc.png` (portrait), `Background.jpg` (marble backdrop),
`Arrow.png` (points at Shop Now), `Icon-1.png` … `Icon-6.png` (the six benefit
icons, in order: Enamel Repair, Fresh Breath, Gum Health, Safer Treatment,
Decay Prevention, Whitening)

**Social proof** — `Collage-images.jpg` (customer grid),
`Strips-mockup-….jpg` (packshot), `Stars-01.png`

**Testimonial avatars** — `image-1-02.png` (Jessica), `image-2-01.png` (Olivia),
`image-3-01-300x300.png` (Samantha), `image-4-01-300x300.png` (James),
`image-5-01-300x300.png` (Emily), `image-6-01-300x300.png` (Christopher)

**Lead magnet** — `image-5-1.jpg` (the guide on a tablet)

**Contact page** — `rugjv-1336x1536.png`

**Products** (written into the database by `npm run seed`)

| File | Product |
| --- | --- |
| `60-Pcs-600x600.jpeg` | 60 PCs strips |
| `42-PCs-1-600x600.jpeg` | 42 PCs strips |
| `WhatsApp-Image-2024-09-04-at-9.02.50-PM-600x600.jpeg` | 28 PCs strips |
| `Tooth-brush-600x600.jpg` | Dentivital Brush |
| `Image.jpg` | Toothpaste (+ second image on 60 PCs) |
| `image-1.jpg` | Mouthwash |

**Textures / spare** — `background-1.jpg` (teal, behind the problem/solution
band), `01.jpg` (pale clinic backdrop, products page header), `Button.png`
(unused — the Shop Now button is real HTML so it stays crisp and clickable)

## Notes

- Filenames are **case-sensitive** once deployed (Vercel and most Linux hosts),
  even though Windows doesn't care. Keep the capitalisation exactly as-is.
- Hero and founder images use `object-contain`, so nothing is ever cropped.
- Product images live in the **database**, not the code. To change one, use
  **Admin → Products**, or re-run `npm run seed` (which resets the catalogue).
