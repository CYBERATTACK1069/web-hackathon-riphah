import { NextResponse } from "next/server";
import { getUserByEmail, saveUser } from "@/lib/store";
import {
  hashPassword,
  createSessionPayload,
  signSessionToken,
  serializeSessionCookie,
} from "@/lib/auth";
import { UserAccount, UserRole } from "@/types/platform";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, role, organization, title } = body;

    // Strict input validation
    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "A valid email address is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json({ success: false, error: "Full name is required" }, { status: 400 });
    }
    const cleanRole: UserRole = role === "candidate" ? "candidate" : "recruiter";

    // Check duplicate
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 409 });
    }

    // Hash password with PBKDF2
    const { hash, salt } = hashPassword(password);

    const newUser: UserAccount = {
      id: `usr-${cleanRole}-${Date.now().toString(36)}`,
      role: cleanRole,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      organization: cleanRole === "recruiter" ? (organization || "Independent Recruiter") : undefined,
      title: title?.trim() || (cleanRole === "recruiter" ? "Hiring Lead" : "Software Engineer"),
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
    };

    await saveUser(newUser);

    const session = createSessionPayload(newUser);
    const token = signSessionToken(session);
    const cookie = serializeSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        role: newUser.role,
        fullName: newUser.fullName,
        email: newUser.email,
        organization: newUser.organization,
        title: newUser.title,
      },
    });
    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
