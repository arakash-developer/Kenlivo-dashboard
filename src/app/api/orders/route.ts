import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? verifySession(token) : null;
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Admin sign-in is required." },
      { status: 401 },
    );
  }
  if (user.role !== "admin" && user.role !== "super_admin") {
    return NextResponse.json(
      { success: false, message: "Admin access is required." },
      { status: 403 },
    );
  }
  return null;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const params = req.nextUrl.searchParams;
  const requestedPage = Number(params.get("page") ?? 1);
  const requestedLimit = Number(params.get("limit") ?? 10);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(100, Math.max(1, requestedLimit))
    : 10;
  const status = params.get("status");
  if (status && !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return NextResponse.json(
      { success: false, message: "Invalid order status filter." },
      { status: 400 },
    );
  }

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const search = params.get("search")?.trim();
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    const searchConditions: Record<string, unknown>[] = [
      { "shippingAddress.fullName": pattern },
      { "shippingAddress.phone": pattern },
      { user: pattern },
    ];
    if (ObjectId.isValid(search)) searchConditions.push({ _id: new ObjectId(search) });
    filter.$or = searchConditions;
  }

  const db = await getDb();
  const collection = db.collection("orders");
  const offset = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    collection.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
    collection.countDocuments(filter),
  ]);
  const data = orders.map((order) => ({
    ...order,
    _id: order._id.toString(),
    user: order.user instanceof ObjectId ? order.user.toString() : order.user,
  }));

  return NextResponse.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function PATCH(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const body = (await req.json().catch(() => null)) as
    | { id?: string; status?: string }
    | null;
  if (!body?.id || !body.status) {
    return NextResponse.json(
      { success: false, message: "Order ID and status are required." },
      { status: 400 },
    );
  }
  if (!ORDER_STATUSES.includes(body.status as (typeof ORDER_STATUSES)[number])) {
    return NextResponse.json(
      { success: false, message: "Invalid order status." },
      { status: 400 },
    );
  }
  if (!ObjectId.isValid(body.id)) {
    return NextResponse.json(
      { success: false, message: "Invalid order ID." },
      { status: 400 },
    );
  }

  const now = new Date();
  const update: Record<string, unknown> = {
    status: body.status,
    updatedAt: now,
  };
  if (body.status === "paid") {
    update.isPaid = true;
    update.paidAt = now;
  }

  const db = await getDb();
  const result = await db
    .collection("orders")
    .updateOne({ _id: new ObjectId(body.id) }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json(
      { success: false, message: "Order not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, message: "Order status updated." });
}
