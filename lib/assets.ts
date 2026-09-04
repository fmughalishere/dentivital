/**
 * Every image the site uses lives in `public/images/`. Filenames here must
 * match the files on disk exactly — including capitalisation, since Linux
 * hosting (Vercel, most VPS) is case-sensitive even though Windows isn't.
 *
 * Swapping an image is a one-line change here; nothing else imports a raw path.
 */

export const LOGO = "/images/DentiVital_Logo1.png";

export const HERO_IMAGES = {
  /** Collage of customers applying the strips. */
  easySafe: "/images/Girl-min.png",
  /** Man with the coffee / tea / wine / soda stain icons. */
  busyLives: "/images/Man-with-texture-and-icons-min.png",
  /** Before-and-after teeth circle with the three benefit badges. */
  tripleAction: "/images/01.png",
} as const;

export const TRUST_BADGES = [
  { src: "/images/ClinicallyProven.jpg", label: "Clinically Proven" },
  { src: "/images/SensitivitySafe.jpg", label: "Sensitivity Safe" },
  { src: "/images/EnamelRepair.jpg", label: "Enamel Repair" },
  { src: "/images/GumHealthBooster.jpg", label: "Gum Health Booster" },
  { src: "/images/Ratingbyclients.jpg", label: "Rating by clients in the USA" },
] as const;

export const INGREDIENT_IMAGES = {
  echinacea: "/images/Echinacea-qtkmcp1mvxouevsu5bpiuv1nyferiif2d2pcgolzpc.png",
  myrrh: "/images/Myrrh-qtkmd357qg85918cuzsxe9hkv7h9pyz1f0hmnu1340.png",
  coconutOil: "/images/Coconut-oil-300x300.jpg",
  hydroxyapatite: "/images/Hydroxyapatite.jpg",
} as const;

export const FOUNDER = {
  portrait: "/images/Doc.png",
  /** Hand-drawn arrow pointing at the Shop Now button. */
  arrow: "/images/Arrow.png",
} as const;

/** The six benefit icons under the founder quote, in site order. */
export const BENEFIT_ICONS = [
  { src: "/images/Icon-1.png", label: "Enamel Repair" },
  { src: "/images/Icon-2.png", label: "Fresh Breath" },
  { src: "/images/Icon-3.png", label: "Gum Health" },
  { src: "/images/Icon-4.png", label: "Safer Treatment" },
  { src: "/images/Icon-5.png", label: "Decay Prevention" },
  { src: "/images/Icon-6.png", label: "Whitening" },
] as const;

export const SOCIAL_PROOF = {
  /** Grid of real customers holding the product. */
  collage: "/images/Collage-images.jpg",
  /** Packshot with the coconut. */
  packshot: "/images/Strips-mockup-qtlen48hotv8lomxteo3o01v72bt5ktzrgqkqyy0ao.jpg",
  stars: "/images/Stars-01.png",
} as const;

export const LEAD_MAGNET = {
  /** Tablet showing the Complete Oral Healthcare Guide. */
  tablet: "/images/image-5-1.png",
} as const;

export const TEXTURES = {
  /** White marble — behind the founder section. */
  marble: "/images/Background.jpg",
  /** Soft teal gradient. */
  teal: "/images/background-1.jpg",
  /** Pale clinical backdrop. */
  clinic: "/images/01.jpg",
} as const;

export const SUPPORT_IMAGE = "/images/rugjv-1336x1536.png";

export const PRODUCT_IMAGES = {
  strips60: "/images/60-Pcs-600x600.jpeg",
  strips42: "/images/42-PCs-1-600x600.jpeg",
  strips28: "/images/WhatsApp-Image-2024-09-04-at-9.02.50-PM-600x600.jpeg",
  brush: "/images/Tooth-brush-600x600.jpg",
  lineup: "/images/Image.jpg",
  lifestyle: "/images/image-1.jpg",
  packshot: "/images/Strips-mockup-qtlen48hotv8lomxteo3o01v72bt5ktzrgqkqyy0ao.jpg",
} as const;

/** Customer avatars, in the same order as the seeded testimonials. */
export const AVATARS = {
  jessica: "/images/image-1-02.png",
  olivia: "/images/image-2-01.png",
  samantha: "/images/image-3-01-300x300.png",
  james: "/images/image-4-01-300x300.png",
  emily: "/images/image-5-01-300x300.png",
  christopher: "/images/image-6-01-300x300.png",
} as const;
