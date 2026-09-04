/**
 * Seeds the Dentivital catalogue, content, discounts, shipping rates and an
 * admin account.
 *
 *   npm run seed
 *
 * Safe to re-run: it clears the collections it owns before inserting.
 */
import { config } from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

config({ path: ".env.local" });
config({ path: ".env" });

import Product from "../models/Product";
import Blog from "../models/Blog";
import Testimonial from "../models/Testimonial";
import Faq from "../models/Faq";
import User from "../models/User";
import Coupon from "../models/Coupon";
import ShippingRate from "../models/ShippingRate";

const MONGODB_URI = process.env.MONGODB_URI as string;

// All prices are in the store currency (see lib/currency.ts — USD by default).
// Local files in public/images — names must match the files on disk exactly.
const IMG = {
  strips60: "/images/60-Pcs-600x600.jpeg",
  strips42: "/images/42-PCs-1-600x600.jpeg",
  strips28: "/images/WhatsApp-Image-2024-09-04-at-9.02.50-PM-600x600.jpeg",
  brush: "/images/Tooth-brush-600x600.jpg",
  lineup: "/images/Image.jpg",
  lifestyle: "/images/image-1.jpg",
  smile: "/images/Girl-min.png",
  beforeAfter: "/images/01.png",
};

// Customer avatars for the seeded testimonials.
const AVATAR = {
  jessica: "/images/image-1-02.png",
  olivia: "/images/image-2-01.png",
  samantha: "/images/image-3-01-300x300.png",
  james: "/images/image-4-01-300x300.png",
  emily: "/images/image-5-01-300x300.png",
  christopher: "/images/image-6-01-300x300.png",
};

const ADMIN_EMAIL = (process.env.ADMIN_EMAILS ?? "admin@dentivital.com").split(",")[0].trim();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

async function seed() {
  if (!MONGODB_URI) {
    console.error("✖ Set MONGODB_URI in .env.local before seeding.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("→ Connected. Seeding…");

  /* ------------------------------------------------------------ products */
  await Product.deleteMany({});
  await Product.insertMany([
    {
      slug: "60-pcs-teeth-whitening-strips",
      name: "60 PCs Teeth Whitening Strips",
      shortDescription: "Our best-selling triple-action, zero-sensitivity whitening course.",
      description:
        "Our best-selling whitening strips deliver dramatically whiter teeth, repaired enamel and healthier gums in one easy application.\nFormulated with PAP, Myrrh, Echinacea and Coconut Oil, the 60-piece course is a full treatment for stubborn coffee, tea and tobacco staining.",
      price: 23.9,
      images: [IMG.strips60, IMG.lineup],
      category: "whitening",
      ingredients: ["PAP", "Myrrh Extract", "Echinacea Extract", "Coconut Oil"],
      benefits: ["Zero sensitivity", "Enamel restoration", "Gum health", "30-minute wear"],
      rating: 5,
      reviewCount: 128,
      stock: 200,
      featured: true,
      active: true,
    },
    {
      slug: "42-pcs-teeth-whitening-strips",
      name: "42 PCs Teeth Whitening Strips",
      shortDescription: "The everyday whitening essential.",
      description:
        "A gentler, everyday whitening routine with the same natural, sensitivity-safe formula.\nIdeal if you want steady results over three weeks rather than a fast, intensive course.",
      price: 19.9,
      images: [IMG.strips42, IMG.lifestyle],
      category: "whitening",
      ingredients: ["PAP", "Myrrh Extract", "Echinacea Extract", "Coconut Oil"],
      benefits: ["Zero sensitivity", "Enamel restoration", "Fresh breath"],
      rating: 4.5,
      reviewCount: 64,
      stock: 150,
      featured: true,
      active: true,
    },
    {
      slug: "dentivital-brush",
      name: "Dentivital Brush",
      shortDescription: "Sonic electric toothbrush for daily gum care.",
      description:
        "A sonic electric toothbrush designed to complement your whitening routine and support gum health between treatments.",
      price: 20,
      images: [IMG.brush],
      category: "tools",
      ingredients: [],
      benefits: ["Gum-safe bristles", "Two-minute timer", "Rechargeable"],
      rating: 4.8,
      reviewCount: 41,
      stock: 80,
      featured: true,
      active: true,
    },
    {
      slug: "28-pcs-teeth-whitening-strips",
      name: "28 PCs Teeth Whitening Strips",
      shortDescription: "A 2-week starter treatment, now on sale.",
      description:
        "The perfect way to try Dentivital's zero-sensitivity whitening formula — a two-week course that shows visible results without the sting.",
      price: 15.9,
      compareAtPrice: 17.9,
      images: [IMG.strips28],
      category: "whitening",
      ingredients: ["PAP", "Myrrh Extract", "Echinacea Extract", "Coconut Oil"],
      benefits: ["Zero sensitivity", "Great first course", "Travel friendly"],
      rating: 5,
      reviewCount: 97,
      stock: 120,
      featured: true,
      active: true,
    },
    {
      slug: "dentivital-tooth-paste",
      name: "Dentivital Tooth Paste",
      shortDescription: "Enamel-safe daily whitening toothpaste.",
      description:
        "A gentle, natural daily toothpaste that supports the whitening routine while remineralising enamel and keeping gums healthy.",
      price: 12.9,
      images: [IMG.lineup],
      category: "care",
      ingredients: ["Hydroxyapatite", "Coconut Oil"],
      benefits: ["Remineralises enamel", "Low abrasion", "Fluoride-free"],
      rating: 4.7,
      reviewCount: 33,
      stock: 100,
      featured: false,
      active: true,
    },
    {
      slug: "dentivital-mouth-wash",
      name: "Dentivital Mouth Wash",
      shortDescription: "Alcohol-free rinse for fresh breath and gum health.",
      description:
        "An alcohol-free mouthwash formulated with Echinacea and Myrrh to soothe gums and keep breath fresh between whitening treatments.",
      price: 10.9,
      images: [IMG.lifestyle],
      category: "care",
      ingredients: ["Echinacea Extract", "Myrrh Extract"],
      benefits: ["Alcohol free", "Soothes gums", "All-day freshness"],
      rating: 4.6,
      reviewCount: 21,
      stock: 90,
      featured: false,
      active: true,
    },
  ]);
  console.log("  ✓ products");

  /* -------------------------------------------------------- testimonials */
  await Testimonial.deleteMany({});
  await Testimonial.insertMany([
    {
      name: "Jessica W",
      rating: 5,
      location: "Verified customer",
      avatar: AVATAR.jessica,
      quote:
        "I never thought over-the-counter whitening strips could get rid of years of tobacco stains, but these strips have my teeth looking better than ever!",
    },
    {
      name: "James A",
      rating: 5,
      location: "Verified customer",
      avatar: AVATAR.james,
      quote:
        "Bad breath was a constant worry of mine but since using these natural teeth whitening strips, my breath stays fresh all day!",
    },
    {
      name: "Olivia H",
      rating: 5,
      location: "Verified customer",
      avatar: AVATAR.olivia,
      quote:
        "My sensitive teeth made me scared to try whitening strips, but I had no sensitivity at all with this natural formula. I'm amazed.",
    },
    {
      name: "Emily R",
      rating: 5,
      location: "Verified customer",
      avatar: AVATAR.emily,
      quote:
        "My dentist recommended these whitening strips to help prevent oral infections and so far they're working great!",
    },
    {
      name: "Samantha G",
      rating: 5,
      location: "Verified customer",
      avatar: AVATAR.samantha,
      quote:
        "I used to be embarrassed to smile in photos, but thanks to these natural whitening strips I'm always photo ready with a bright, white smile!",
    },
    {
      name: "Christopher W",
      rating: 5,
      location: "Verified customer",
      avatar: AVATAR.christopher,
      quote:
        "These strips go on so easily and make my teeth several shades whiter. I get compliments on my smile all the time now!",
    },
  ]);
  console.log("  ✓ testimonials");

  /* ----------------------------------------------------------------- faqs */
  await Faq.deleteMany({});
  await Faq.insertMany([
    {
      order: 1,
      question: "Are these teeth whitening strips safe for sensitive teeth?",
      answer:
        "Yes, our teeth whitening strips are specially formulated for people with sensitive teeth. They contain natural ingredients like coconut oil and echinacea extract that help reduce sensitivity.",
    },
    {
      order: 2,
      question: "How do the teeth whitening strips work?",
      answer:
        "Our strips work by applying a thin coat of whitening gel to your teeth. The gel contains natural brightening ingredients like PAP (Phthalimido-Peroxy-Caproic acid) that help lift stains and whiten your teeth.\n\n1. Apply the strip to your teeth.\n2. Leave it on for the recommended time.\n3. Remove the strip and enjoy your whiter smile.",
    },
    {
      order: 3,
      question: "What ingredients are in the teeth whitening strips?",
      answer:
        "PAP (Phthalimido-Peroxy-Caproic acid) – helps lift stains and whiten teeth\nMyrrh Extract – helps reduce inflammation and sensitivity\nEchinacea Extract – helps boost immunity and gum health\nCoconut Oil – helps moisturise teeth and gums, reduces sensitivity",
    },
    {
      order: 4,
      question: "What is the difference between the Express and Standard Treatment?",
      answer:
        "Express Treatment – Gives you noticeably whiter teeth in 60 minutes. Safe for sensitive teeth but may cause slight tingling for a few minutes.\n\nStandard Treatment – Gives you natural whitening results in 3 weeks. The gentlest option, ideal for most people.",
    },
    {
      order: 5,
      question: "How old do you need to be to use the strips?",
      answer:
        "Our strips are recommended for adults 18 and over. Teens under 18 should consult a dentist before using any teeth whitening products.",
    },
    {
      order: 6,
      question: "How do I store the strips?",
      answer:
        "Store the strips in a cool, dry place away from direct sunlight and heat to preserve potency. Do not freeze them. Keep strips away from children.",
    },
  ]);
  console.log("  ✓ faqs");

  /* ---------------------------------------------------------------- blogs */
  await Blog.deleteMany({});
  await Blog.insertMany([
    {
      slug: "why-enamel-health-matters",
      title: "Why Enamel Health Matters More Than Whitening Alone",
      excerpt:
        "Whitening is only half the story — here's why enamel and gum health matter just as much.",
      content:
        "Traditional whitening products focus purely on removing surface stains, but your enamel and gum health determine how your smile holds up long-term. Weak enamel leads to sensitivity, while poor gum health can lead to broader health issues, since your mouth is the entry point to your body.\n\nThat's why Dentivital's triple-action formula was built around enamel restoration and gum health, not just whitening. Hydroxyapatite remineralises the enamel surface while the strip is in contact with your teeth, and Myrrh and Echinacea work on the gum line at the same time.\n\nThe result is a routine that leaves your mouth healthier after each treatment, not more fragile.",
      coverImage: IMG.smile,
      author: "Dentivital Team",
      tags: ["oral-health", "enamel"],
      readMinutes: 4,
      published: true,
    },
    {
      slug: "natural-ingredients-glossary",
      title: "Your Guide to Dentivital's Natural Ingredients",
      excerpt:
        "A closer look at Echinacea, Myrrh, Coconut Oil and Hydroxyapatite — and what each one does.",
      content:
        "Echinacea reduces gum inflammation and boosts your immune system. Myrrh relieves gum pain and helps prevent periodontitis. Coconut oil whitens teeth while fighting harmful bacteria. Hydroxyapatite remineralises enamel and helps reverse early tooth decay.\n\nTogether, these four ingredients form the foundation of every Dentivital formula. None of them were chosen for marketing appeal — each earned its place in clinical testing, for something it does beyond shade change.",
      coverImage: IMG.lifestyle,
      author: "Dentivital Team",
      tags: ["ingredients"],
      readMinutes: 5,
      published: true,
    },
    {
      slug: "how-to-get-the-best-whitening-results",
      title: "How to Get the Best Results From Your Whitening Course",
      excerpt: "Five small habits that make a visible difference to your whitening results.",
      content:
        "Brush before, not after. Applying strips to a clean, dry tooth surface helps the gel make even contact.\n\nDry your teeth first. A quick pat with a tissue stops saliva from diluting the gel in the first few minutes.\n\nStay consistent. A daily 30-minute application for the full course beats occasional long sessions.\n\nGo easy on staining drinks for an hour afterwards — coffee, red wine and dark sodas re-stain freshly opened enamel most easily.\n\nFinish the course. Most people see a visible change in the first week, but enamel remineralisation continues throughout the treatment.",
      coverImage: IMG.beforeAfter,
      author: "Dentivital Team",
      tags: ["how-to", "whitening"],
      readMinutes: 3,
      published: true,
    },
  ]);
  console.log("  ✓ blogs");

  /* ------------------------------------------------------- shipping rates */
  await ShippingRate.deleteMany({});
  await ShippingRate.insertMany([
    {
      label: "Standard Shipping",
      description: "Tracked delivery, arrives in 4–7 business days.",
      price: 4.95,
      minDays: 4,
      maxDays: 7,
      freeOver: 50,
      active: true,
      sortOrder: 1,
    },
    {
      label: "Express Shipping",
      description: "Priority handling, arrives in 2–3 business days.",
      price: 12.95,
      minDays: 2,
      maxDays: 3,
      freeOver: null,
      active: true,
      sortOrder: 2,
    },
    {
      label: "Next Day Delivery",
      description: "Order before 2pm for delivery tomorrow.",
      price: 24.95,
      minDays: 1,
      maxDays: 1,
      freeOver: null,
      active: true,
      sortOrder: 3,
    },
  ]);
  console.log("  ✓ shipping rates");

  /* -------------------------------------------------------------- coupons */
  await Coupon.deleteMany({});
  await Coupon.insertMany([
    {
      code: "WELCOME10",
      type: "percent",
      value: 10,
      minSubtotal: 0,
      maxRedemptions: null,
      timesRedeemed: 0,
      expiresAt: null,
      active: true,
    },
    {
      code: "BRIGHT5",
      type: "fixed",
      value: 5,
      minSubtotal: 30,
      maxRedemptions: 200,
      timesRedeemed: 0,
      expiresAt: null,
      active: true,
    },
  ]);
  console.log("  ✓ discount codes");

  /* ---------------------------------------------------------------- admin */
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    {
      name: "Dentivital Admin",
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: "admin",
      provider: "password",
      disabled: false,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("  ✓ admin account");

  console.log("\n✔ Seed complete.");
  console.log(`  Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log("  Change this password after your first sign-in.\n");

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
