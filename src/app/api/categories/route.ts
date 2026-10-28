import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDb();

  const categories = await db
    .collection("categories")
    .aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $addFields: {
          totalProducts: { $size: "$products" },
          _id: { $toString: "$_id" },
        },
      },
      { $project: { products: 0 } },
      { $sort: { createdAt: -1 } },
    ])
    .toArray();

  return NextResponse.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name) {
    return NextResponse.json(
      { success: false, message: "Name is required" },
      { status: 400 },
    );
  }

  const { name, description = "", image = null, isActive = true } = body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const now = new Date();

  const db = await getDb();
  const { insertedId } = await db.collection("categories").insertOne({
    name,
    slug,
    description,
    image,
    isActive,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(
    { success: true, data: { _id: insertedId.toString(), name, slug, description, image, isActive } },
    { status: 201 },
  );
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json().catch(() => ({}));
  if (!id) {
    return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
  }

  const db = await getDb();
  const { deletedCount } = await db.collection("categories").deleteOne({ _id: new ObjectId(id) });
  if (!deletedCount) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
