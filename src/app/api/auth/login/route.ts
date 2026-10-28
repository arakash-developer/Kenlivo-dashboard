import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { SESSION_COOKIE, signSession, sessionCookieOptions } from "@/lib/session";

export const runtime = "nodejs";

interface UserDoc {
  _id: { toString(): string };
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin" | "super_admin";
  isActive?: boolean;
}

export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password are required" },
      { status: 400 },
    );
  }

  const db = await getDb();
  const user = await db
    .collection<UserDoc>("users")
    .findOne({ email: email.toLowerCase().trim() });

  if (!user || user.isActive === false) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return NextResponse.json(
      { success: false, message: "This dashboard is for administrators only" },
      { status: 403 },
    );
  }

  const sessionUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const res = NextResponse.json({
    success: true,
    message: "Login successful",
    data: sessionUser,
  });
  res.cookies.set(SESSION_COOKIE, signSession(sessionUser), sessionCookieOptions);
  return res;
}
