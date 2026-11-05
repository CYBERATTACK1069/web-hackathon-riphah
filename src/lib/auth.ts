import crypto from "crypto";
import { UserAccount, UserRole } from "@/types/platform";
import { getUserById, getUserByEmail, saveUser } from "./store";

const SESSION_COOKIE_NAME = "talentswiss_session";
const SESSION_SECRET = process.env.AUTH_SECRET || "talentswiss-enterprise-jwt-hmac-secret-v3.8";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  role: UserRole;
  email: string;
  fullName: string;
  organization?: string;
  title?: string;
  exp: number; // UNIX timestamp in seconds
}

// Pre-seeded demo account identifiers
export const DEMO_RECRUITER_ID = "usr-recruiter-01";
export const DEMO_CANDIDATE_ID = "usr-candidate-01";

/**
 * Cryptographic Password Hashing using PBKDF2 (10,000 iterations, SHA-512)
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"));
}

/**
 * Sign session payload with HMAC-SHA256
 */
export function signSessionToken(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [body, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as SessionPayload;
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Create a session payload for a given UserAccount
 */
export function createSessionPayload(user: UserAccount): SessionPayload {
  return {
    userId: user.id,
    role: user.role,
    email: user.email,
    fullName: user.fullName,
    organization: user.organization,
    title: user.title,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Get cookie string header for Set-Cookie
 */
export function serializeSessionCookie(token: string, maxAge = SESSION_MAX_AGE_SECONDS): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function serializeLogoutCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Extract session token from cookie header
 */
export function extractSessionTokenFromCookieHeader(cookieHeader?: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * Fast lookup for demo user account
 */
export async function getDemoUser(role: UserRole): Promise<UserAccount | null> {
  const userId = role === "recruiter" ? DEMO_RECRUITER_ID : DEMO_CANDIDATE_ID;
  return await getUserById(userId);
}

export { SESSION_COOKIE_NAME };
