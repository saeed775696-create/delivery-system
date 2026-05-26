import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "secret"
);

/* =========================
   CREATE TOKEN
========================= */
export async function createToken(payload: {
  userId: string;
  phone: string;
  role: string;
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/* =========================
   VERIFY PASSWORD
========================= */
export async function verifyPassword(
  password: string,
  hashedPassword: string
) {
  return bcrypt.compare(password, hashedPassword);
}
/* =========================
   HASH PASSWORD
========================= */
export async function hashPassword(password: string) {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 10);
}
/* =========================
   SET AUTH COOKIE
========================= */
export function setAuthCookie(token: string) {
  return {
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  };
}

/* =========================
   GET SESSION
========================= */
export async function getSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      phone: payload.phone as string,
      role: payload.role as string,
    };
  } catch (error) {
    return null;
  }
}