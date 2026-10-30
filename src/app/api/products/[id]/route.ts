import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const oid = (() => { try { return new ObjectId(id); } catch { return null; } })();
  if (!oid) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });

  const db = await getDb();
  const [product] = await db
    .collection("products")
    .aggregate([
      { $match: { _id: oid } },
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
          category: { $toString: "$category" },
          collection: { $toString: "$collection" },
          categoryName: { $ifNull: [{ $arrayElemAt: ["$categoryDoc.name", 0] }, ""] },
        },
      },
      { $project: { categoryDoc: 0 } },
    ])
    .toArray();

  if (!product) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: product });
}
