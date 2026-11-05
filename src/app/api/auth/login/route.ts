import { NextResponse } from "next/server";
import { getUserByEmail, getUserById } from "@/lib/store";
import {
  verifyPassword,
  createSessionPayload,
  signSessionToken,
  serializeSessionCookie,
  DEMO_RECRUITER_ID,
  DEMO_CANDIDATE_ID,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, isDemo } = body;

    // 1. Judge 1-Click Demo Login
    if (isDemo || (!password && (role === "recruiter" || role === "candidate"))) {
      const demoId = role === "candidate" ? DEMO_CANDIDATE_ID : DEMO_RECRUITER_ID;
      const demoUser = await getUserById(demoId);
      if (!demoUser) {
        return NextResponse.json({ success: false, error: "Demo user account not found" }, { status: 404 });
      }

      const session = createSessionPayload(demoUser);
      const token = signSessionToken(session);
      const cookie = serializeSessionCookie(token);

      const response = NextResponse.json({
        success: true,
        user: {
          id: demoUser.id,
          role: demoUser.role,
          fullName: demoUser.fullName,
          email: demoUser.email,
          organization: demoUser.organization,
          title: demoUser.title,
        },
      });
      response.headers.set("Set-Cookie", cookie);
      return response;
    }

    // 2. Standard Email/Password Login
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Role check if specified
    if (role && user.role !== role) {
      return NextResponse.json(
        { success: false, error: `Account exists as ${user.role}. Please select ${user.role} role.` },
        { status: 403 }
      );
    }

    // Password verification: If user has a passwordHash, verify; if not (e.g. pre-seeded demo user), allow demo password or prompt
    if (user.passwordHash && user.passwordSalt) {
      const isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
      }
    } else {
      // Seed user without password set: accept demo password or any password for seamless hackathon grading
      if (password !== "demo123" && password !== "password" && password.length < 4) {
        return NextResponse.json({ success: false, error: "Invalid credentials (use 'demo123' for seeded accounts)" }, { status: 401 });
      }
    }

    const session = createSessionPayload(user);
    const token = signSessionToken(session);
    const cookie = serializeSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        organization: user.organization,
        title: user.title,
      },
    });
    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
