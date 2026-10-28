import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export const runtime = "nodejs";

interface UserDoc {
  _id: ObjectId;
  name: string;
  email: string;
  role: "customer" | "admin" | "super_admin";
  phone?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: Date;
}

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  // The session cookie only carries id/name/email/role; load the full record
  // for profile details (phone, join date).
  const db = await getDb();
  let user: UserDoc | null = null;
  try {
    user = await db
      .collection<UserDoc>("users")
      .findOne({ _id: new ObjectId(session.id) });
  } catch {
    user = null;
  }

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone ?? null,
      image: user.image ?? null,
      createdAt: user.createdAt ?? null,
    },
  });
}
