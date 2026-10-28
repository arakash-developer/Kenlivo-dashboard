import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

const ALLOWED: Record<string, string> = {
  tags: "tags",
  collections: "collections",
  vendors: "vendors",
  brands: "brands",
  "product-types": "product_types",
};

function collectionFor(entity: string): string | null {
  return ALLOWED[entity] ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { entity: string } },
) {
  const col = collectionFor(params.entity);
  if (!col) return NextResponse.json({ success: false, message: "Unknown entity" }, { status: 404 });

  const db = await getDb();
  const data = await db.collection(col).find({}).sort({ createdAt: -1 }).toArray();
  const serialized = data.map((d) => ({ ...d, _id: d._id.toString() }));
  return NextResponse.json({ success: true, data: serialized });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { entity: string } },
) {
  const col = collectionFor(params.entity);
  if (!col) return NextResponse.json({ success: false, message: "Unknown entity" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body?.name?.trim()) {
    return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
  }

  const { name, description = "", isActive = true } = body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const now = new Date();

  const db = await getDb();
  const { insertedId } = await db.collection(col).insertOne({
    name: name.trim(),
    slug,
    description: description.trim(),
    isActive,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(
    { success: true, data: { _id: insertedId.toString(), name: name.trim(), slug, description, isActive } },
    { status: 201 },
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { entity: string } },
) {
  const col = collectionFor(params.entity);
  if (!col) return NextResponse.json({ success: false, message: "Unknown entity" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.name?.trim()) {
    return NextResponse.json({ success: false, message: "ID and name are required" }, { status: 400 });
  }

  const { id, name, description = "", isActive = true } = body;
  const oid = (() => { try { return new ObjectId(id); } catch { return null; } })();
  if (!oid) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const db = await getDb();
  const { matchedCount } = await db.collection(col).updateOne(
    { _id: oid },
    { $set: { name: name.trim(), slug, description: description.trim(), isActive, updatedAt: new Date() } },
  );
  if (!matchedCount) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { entity: string } },
) {
  const col = collectionFor(params.entity);
  if (!col) return NextResponse.json({ success: false, message: "Unknown entity" }, { status: 404 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

  const db = await getDb();
  const { deletedCount } = await db.collection(col).deleteOne({ _id: new ObjectId(id) });
  if (!deletedCount) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
