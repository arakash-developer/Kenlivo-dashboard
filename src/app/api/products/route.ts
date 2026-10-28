import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDb();
  const products = await db
    .collection("products")
    .aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDoc",
        },
      },
      {
        $addFields: {
          _id: { $toString: "$_id" },
          categoryName: { $ifNull: [{ $arrayElemAt: ["$categoryDoc.name", 0] }, ""] },
        },
      },
      { $project: { categoryDoc: 0 } },
      { $sort: { createdAt: -1 } },
    ])
    .toArray();

  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.name || !body?.description || body?.price == null || !body?.category) {
    return NextResponse.json(
      { success: false, message: "Name, description, price and category are required" },
      { status: 400 },
    );
  }

  const {
    name,
    description,
    tagline = "",
    price,
    discountPercentage = 0,
    category,
    images = [],
    stock = 0,
    isActive = true,
  } = body;

  const categoryOid = (() => { try { return new ObjectId(category); } catch { return null; } })();
  if (!categoryOid) {
    return NextResponse.json({ success: false, message: "Invalid category id" }, { status: 400 });
  }

  const db = await getDb();
  const catExists = await db.collection("categories").findOne({ _id: categoryOid });
  if (!catExists) {
    return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
  }

  const finalPrice = Number((price * (1 - discountPercentage / 100)).toFixed(2));
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const now = new Date();

  const { insertedId } = await db.collection("products").insertOne({
    name,
    slug,
    description,
    tagline,
    price: Number(price),
    discountPercentage: Number(discountPercentage),
    finalPrice,
    category: categoryOid,
    images,
    stock: Number(stock),
    rating: 0,
    numReviews: 0,
    isActive,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json(
    { success: true, data: { _id: insertedId.toString() } },
    { status: 201 },
  );
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.name?.trim()) {
    return NextResponse.json({ success: false, message: "ID and name are required" }, { status: 400 });
  }

  const {
    id, name, description = "", tagline = "", price, discountPercentage = 0,
    category, images = [], stock = 0, isActive = true,
  } = body;

  const oid = (() => { try { return new ObjectId(id); } catch { return null; } })();
  if (!oid) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });

  const categoryOid = (() => { try { return new ObjectId(category); } catch { return null; } })();
  if (!categoryOid) return NextResponse.json({ success: false, message: "Invalid category id" }, { status: 400 });

  const finalPrice = Number((Number(price) * (1 - Number(discountPercentage) / 100)).toFixed(2));
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const db = await getDb();
  const { matchedCount } = await db.collection("products").updateOne(
    { _id: oid },
    {
      $set: {
        name: name.trim(), slug, description, tagline, price: Number(price),
        discountPercentage: Number(discountPercentage), finalPrice,
        category: categoryOid, images, stock: Number(stock), isActive,
        updatedAt: new Date(),
      },
    },
  );

  if (!matchedCount) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

  const db = await getDb();
  const { deletedCount } = await db.collection("products").deleteOne({ _id: new ObjectId(id) });
  if (!deletedCount) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
