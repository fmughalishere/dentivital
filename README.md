# Dentivital — e-commerce store

A full storefront and admin panel for Dentivital, built with **Next.js 16 (App
Router)**, **TypeScript**, **Tailwind CSS v4**, **MongoDB/Mongoose** and
**Stripe Checkout**.

---

## What's inside

**Storefront**

- Auto-advancing hero slider (3 slides, pause on hover, dots, arrows, swipe, keyboard, reduced-motion aware)
- Product listing with search, category filter and sorting
- Product detail pages with gallery, related products, benefits and ingredients
- Cart page **and** a slide-over cart drawer, both with live totals
- Discount codes, shipping methods with free-shipping thresholds
- Stripe Checkout, order confirmation page and webhook-driven order updates
- About, Journal (blog index + article), Contact, newsletter capture
- Toast notifications and confirmation dialogs on every destructive action

**Accounts**

- Register / sign in with email + password, or Google Sign-In
- Show/hide password toggle and a live password-strength meter
- Customer dashboard: overview, orders, order tracking timeline, profile, address book, settings
- Change or set a password, manage email preferences, sign out

**Admin** (`/admin`, role-gated)

- Dashboard: revenue chart, paid revenue, order counts, top products, low-stock alerts
- Orders: search, filter by status, order detail, status updates, tracking numbers, timeline notes
- Products: full CRUD with Cloudinary image upload or image URLs
- Discounts: percentage / fixed codes with minimums, redemption limits and expiry
- Shipping: rates, delivery windows, free-over thresholds
- Customers: grant or revoke admin, disable accounts
- Inbox: contact-form messages and newsletter subscribers

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Then fill in `.env.local`:

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB Atlas or local connection string |
| `JWT_SECRET` | yes | Any long random string (`openssl rand -base64 48`) |
| `ADMIN_EMAILS` | yes | Comma-separated; these emails become admins automatically |
| `NEXT_PUBLIC_SITE_URL` | yes | `http://localhost:3000` in development |
| `STRIPE_SECRET_KEY` | yes | From the Stripe dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | yes | From the Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | yes | From `stripe listen` (see below) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_ID` | optional | Enables the Google sign-in button |
| `CLOUDINARY_*` | optional | Enables image upload in the admin product form |

Anything optional that's missing degrades gracefully — the Google button
explains it isn't configured, and product images fall back to pasted URLs.

### 3. Seed the database

```bash
npm run seed
```

This loads the six products, testimonials, FAQs, three articles, two discount
codes (`WELCOME10`, `BRIGHT5`), three shipping methods, and creates an admin
account:

```
admin@dentivital.com / ChangeMe123!
```

Change that password after your first sign-in (Account → Settings), or set
`SEED_ADMIN_PASSWORD` before running the seed.

### 4. Add the hero images

Drop `hero-1.jpg`, `hero-2.jpg` and `hero-3.jpg` into `public/images/`.
See `public/images/README.md` for sizes and which image goes where.

### 5. Run it

```bash
npm run dev
```

Open http://localhost:3000 — and http://localhost:3000/admin once signed in as
an admin.

---

## Stripe webhooks (required for orders to complete)

An order is created as `pending` before the customer is sent to Stripe, and the
webhook is what marks it **paid**, decrements stock and counts the discount
redemption. Without it, orders stay pending.

Locally:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`.

In production, add an endpoint in the Stripe dashboard pointing at
`https://yourdomain.com/api/webhooks/stripe` and subscribe to:

- `checkout.session.completed`
- `checkout.session.expired`
- `charge.refunded`

**Test card:** `4242 4242 4242 4242`, any future expiry, any CVC.

---

## Project structure

```
app/
  page.tsx, products/, blogs/, about/, contact/, cart/, checkout/   storefront
  account/          customer dashboard (layout guards the session)
  admin/            admin dashboard (layout guards the admin role)
  api/              auth, products, orders, coupons, shipping, checkout, webhooks
components/
  ui/               Button, Field, Modal, Badge, Spinner, EmptyState, Skeleton
  layout/           Navbar, Footer, CartDrawer, Providers, SiteChrome
  home/             HeroSlider, TrustMarquee, TestimonialsGrid, FaqAccordion
  shop/             ProductCard, ProductBrowser, ProductGallery, CouponBox, ShippingSelector
  account/          ProfileForm, AddressForm, SettingsPanel
  admin/            ProductsManager, OrdersTable, CouponsManager, ShippingManager, ...
context/            AuthContext, CartContext, UIContext (toasts + confirm dialogs)
lib/                auth (JWT), db, data (server reads), pricing, format, stripe, cloudinary
models/             Product, Order, User, Coupon, ShippingRate, Blog, Faq, Testimonial, ...
proxy.ts            route protection (Next 16's replacement for middleware.ts)
scripts/seed.mts    database seeder
```

## How auth works

Sign-in issues a signed JWT stored in an httpOnly `dv_token` cookie. `proxy.ts`
redirects signed-out visitors away from `/account` and `/admin`; the layouts then
re-check the session server-side and the admin layout also checks the role, so
protection doesn't depend on the proxy alone. API routes verify the same cookie.

Any email listed in `ADMIN_EMAILS` is promoted to admin on sign-up or sign-in.
You can also grant admin to an existing account from Admin → Customers.

## Notes

- Prices are stored in dollars and converted to cents only when talking to Stripe.
- The cart re-prices itself server-side at checkout, so tampering with client
  prices, stock or discount codes has no effect.
- Password reset currently routes the request to your support inbox
  (Admin → Inbox) rather than emailing a reset link — wire up an email provider
  when you're ready to automate it.
