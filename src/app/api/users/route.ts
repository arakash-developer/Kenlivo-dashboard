import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireSuperAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session || session.role !== "super_admin") return null;
  return session;
}

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

  const db = await getDb();
  const users = await db
    .collection("users")
    .find({}, { projection: { password: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  const data = users.map((u) => ({ ...u, _id: u._id.toString() }));
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { name, email, password, role = "admin", phone = "", image = "", isActive = true } = body ?? {};

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ success: false, message: "Name, email and password are required" }, { status: 400 });
  }

  const validRoles = ["admin", "super_admin", "customer"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return NextResponse.json({ success: false, message: "Email already exists" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const now = new Date();
  const { insertedId } = await db.collection("users").insertOne({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashed,
    role,
    phone: phone.trim(),
    image: image.trim(),
    isActive,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(
    { success: true, data: { _id: insertedId.toString(), name: name.trim(), email: email.toLowerCase().trim(), role, phone, image, isActive } },
    { status: 201 },
  );
}

export async function PUT(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { id, name, email, role, phone, image, isActive } = body ?? {};

  if (!id || !name?.trim() || !email?.trim()) {
    return NextResponse.json({ success: false, message: "ID, name and email are required" }, { status: 400 });
  }

  const oid = (() => { try { return new ObjectId(id); } catch { return null; } })();
  if (!oid) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });

  const db = await getDb();
  const updates: Record<string, unknown> = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    updatedAt: new Date(),
  };
  if (role) updates.role = role;
  if (phone !== undefined) updates.phone = phone.trim();
  if (image !== undefined) updates.image = image.trim();
  if (isActive !== undefined) updates.isActive = isActive;

  const { matchedCount } = await db.collection("users").updateOne({ _id: oid }, { $set: updates });
  if (!matchedCount) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

  const db = await getDb();
  const { deletedCount } = await db.collection("users").deleteOne({ _id: new ObjectId(id) });
  if (!deletedCount) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
