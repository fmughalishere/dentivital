# Upgrade notes — read this first

This package replaces most of the old Dentivital source with the new
storefront + accounts + admin build. Your database, `.env`, `public/` assets and
`node_modules` are untouched.

## 1. Extract

Extract the zip **into `D:\dentivital-project`**, overwriting when asked.

## 2. Remove the files this build replaces

The old PayPal checkout, the separate admin/user login systems and the old
components are gone. They still reference deleted modules, so `next build` will
fail until they're removed.

From PowerShell, in `D:\dentivital-project`:

```powershell
.\cleanup-old-files.ps1
```

(Or delete the paths listed in that script by hand — it only removes files this
build replaced.)

## 3. Update your environment

New variables were added. Compare your `.env` with `.env.example`:

```
JWT_SECRET=...            # required — any long random string
ADMIN_EMAILS=...          # required — these emails become admins
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=   # optional, for Google sign-in
GOOGLE_CLIENT_ID=               # optional, same value
```

`MONGODB_URI`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and the
`CLOUDINARY_*` keys you already have stay as they are.

Note: the Stripe webhook path **moved** from `/api/webhook` to
`/api/webhooks/stripe`. Update your `stripe listen` command and your Stripe
dashboard endpoint.

## 4. Install, seed, run

```powershell
npm install          # adds google-auth-library and dotenv, removes nothing you need
npm run seed         # products, blogs, FAQs, testimonials, discounts, shipping, admin user
npm run dev
```

Admin sign-in after seeding: `admin@dentivital.com` / `ChangeMe123!`
(or whichever email you put first in `ADMIN_EMAILS`).

## 5. Add the hero images

Save `hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg` into `public/images/`.
`public/images/README.md` says which screenshot goes where. Missing files don't
break anything — the slide shows a labelled placeholder until you add them.

---

## What changed, in short

| Area | Before | Now |
| --- | --- | --- |
| Auth | Separate `Admin` + `User` models, two cookies, two login pages | One `User` model with a `role`, one `dv_token` cookie, one `/login` + `/register`, Google sign-in |
| Payments | Stripe + PayPal | Stripe Checkout only, with server-side re-pricing and a proper webhook |
| Cart | Items only | Items + discount codes + shipping methods + cart drawer |
| Orders | `pending / paid / shipped / completed / cancelled` | Seven statuses, timeline, tracking numbers, order-status page for customers |
| Admin | Dashboard, products, orders | Dashboard with charts, orders, products, discounts, shipping, customers, inbox |
| Feedback | Inline text | Toast notifications and confirm dialogs everywhere |
| Route protection | Client-side checks | `proxy.ts` + server-side layout guards + API role checks |

New routes worth knowing:

- `/login`, `/register`, `/forgot-password`
- `/account`, `/account/orders`, `/account/orders/[id]`, `/account/profile`, `/account/addresses`, `/account/settings`
- `/admin`, `/admin/orders`, `/admin/products`, `/admin/coupons`, `/admin/shipping`, `/admin/customers`, `/admin/messages`
- `/api/webhooks/stripe` (was `/api/webhook`)
