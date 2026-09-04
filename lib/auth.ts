/**
 * Sessions: signing them, reading them, and attaching them to responses.
 *
 * The import block below was missing entirely — the file began on the line
 * after this comment with `const SESSION_COOKIE`. Every symbol it uses came
 * from somewhere else, so the module was referencing four things that did not
 * exist: `cookies`, `jwt`, `NextRequest`/`NextResponse`, and the `Role` and
 * `SessionUser` types.
 *
 * TypeScript could not warn about it in the editor the way you would expect,
 * because a missing import is a type error and `next dev` does not fail on
 * type errors — it compiles and runs. So the first sign of it was at runtime,
 * as `ReferenceError: cookies is not defined`, thrown from getSession() while
 * the ROOT LAYOUT was rendering. A layout that throws takes every page with
 * it, which is why the whole site answered 500 rather than one route.
 *
 * `cookies` was simply the first of the four to be reached. `jwt.sign` and
 * `NextResponse.json` would have thrown next.
 *
 * ── Which imports, and why these ──
 *
 * `cookies` comes from next/headers and only works in a server component, a
 * layout or a route handler — it reads the request Next is currently handling.
 * That is why this file has two ways to find a session: getSession() for
 * layouts and server components, and getSessionFromRequest(req) for route
 * handlers, which are handed the request directly.
 *
 * `jwt` is the default export of jsonwebtoken (a CommonJS package), so it is a
 * default import, not `import * as jwt` and not a named one.
 *
 * `NextRequest` and `NextResponse` are types and values from next/server;
 * NextResponse is used as a value in attachSession/clearSession, so it cannot
 * be a type-only import.
 */

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import type { Role, SessionUser } from "@/types";

const SESSION_COOKIE = "dv_token";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

function secret(): string {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is missing or too short. Set it in your environment.");
    }
    return "dev-only-insecure-secret-change-me";
  }
  return value;
}

export function isAdminEmail(email: string): boolean {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export function roleFor(email: string, current: Role = "user"): Role {
  return current === "admin" || isAdminEmail(email) ? "admin" : "user";
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, secret(), { expiresIn: SESSION_MAX_AGE });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, secret());
    if (typeof decoded === "string") return null;
    const { id, name, email, role, avatar } = decoded as Record<string, unknown>;
    if (typeof id !== "string" || typeof email !== "string") return null;
    return {
      id,
      email,
      name: typeof name === "string" ? name : email,
      role: role === "admin" ? "admin" : "user",
      avatar: typeof avatar === "string" ? avatar : null,
    };
  } catch {
    return null;
  }
}

/** For route handlers that receive a NextRequest. */
export function getSessionFromRequest(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export function getAdminFromRequest(req: NextRequest): SessionUser | null {
  const session = getSessionFromRequest(req);
  return session?.role === "admin" ? session : null;
}

/** For server components and layouts. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function getAdminSession(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.role === "admin" ? session : null;
}

export function attachSession(res: NextResponse, user: SessionUser): NextResponse {
  res.cookies.set(SESSION_COOKIE, signToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}

export function clearSession(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}

export function unauthorized(message = "You need to be signed in to do that.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "You don't have permission to do that.") {
  return NextResponse.json({ error: message }, { status: 403 });
}
