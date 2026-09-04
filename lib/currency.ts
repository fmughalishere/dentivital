/**
 * Single source of truth for the store's currency.
 *
 * Everything — product prices in Mongo, the numbers shown on the site, and the
 * amounts sent to Stripe — is expressed in THIS currency. Change it in one
 * place (or via NEXT_PUBLIC_CURRENCY in .env) and the whole store follows.
 *
 * Important: changing the code does NOT convert your existing prices. A
 * product stored as 6900 is Rs 6,900 under PKR and $6,900.00 under USD, so if
 * you switch currencies you must also re-price the catalogue (Admin →
 * Products / Shipping / Discounts, or re-run `npm run seed`).
 */

export const CURRENCY_CODE = (process.env.NEXT_PUBLIC_CURRENCY ?? "USD").toUpperCase();

/** Locale used only for number grouping and the currency symbol. */
export const CURRENCY_LOCALE =
  process.env.NEXT_PUBLIC_CURRENCY_LOCALE ?? (CURRENCY_CODE === "PKR" ? "en-PK" : "en-US");

/** Stripe expects a lowercase ISO code. */
export const STRIPE_CURRENCY = CURRENCY_CODE.toLowerCase();

/**
 * Currencies Stripe handles without a minor unit — for these, `unit_amount` is
 * the whole number, not the number × 100.
 */
const ZERO_DECIMAL = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA",
  "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

export const IS_ZERO_DECIMAL = ZERO_DECIMAL.has(CURRENCY_CODE);

/** 6900 → 690000 (PKR/USD) or 6900 (JPY). Use for every Stripe amount. */
export function toStripeAmount(amount: number): number {
  const safe = Number.isFinite(amount) ? amount : 0;
  return IS_ZERO_DECIMAL ? Math.round(safe) : Math.round(safe * 100);
}

/** The inverse — for reading amounts back off a Stripe object. */
export function fromStripeAmount(minor: number): number {
  const safe = Number.isFinite(minor) ? minor : 0;
  return IS_ZERO_DECIMAL ? safe : Math.round(safe) / 100;
}
