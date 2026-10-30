import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const DEFAULT_FEES = {
  insideKurigram: 60,
  outsideKurigram: 100,
};

type ShippingSettings = {
  _id: string;
  insideKurigram?: number;
  outsideKurigram?: number;
  updatedAt?: Date;
};

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

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const db = await getDb();
  const settings = await db
    .collection<ShippingSettings>("settings")
    .findOne({ _id: "shipping" });

  return NextResponse.json({
    success: true,
    data: {
      insideKurigram:
        typeof settings?.insideKurigram === "number"
          ? settings.insideKurigram
          : DEFAULT_FEES.insideKurigram,
      outsideKurigram:
        typeof settings?.outsideKurigram === "number"
          ? settings.outsideKurigram
          : DEFAULT_FEES.outsideKurigram,
    },
  });
}

export async function PUT(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  const body = (await req.json().catch(() => null)) as
    | { insideKurigram?: unknown; outsideKurigram?: unknown }
    | null;
  const insideKurigram = Number(body?.insideKurigram);
  const outsideKurigram = Number(body?.outsideKurigram);
  if (
    !body ||
    !Number.isSafeInteger(insideKurigram) ||
    !Number.isSafeInteger(outsideKurigram) ||
    insideKurigram < 0 ||
    outsideKurigram < 0
  ) {
    return NextResponse.json(
      { success: false, message: "Enter valid non-negative delivery charges." },
      { status: 400 },
    );
  }

  const db = await getDb();
  const fees = { insideKurigram, outsideKurigram, updatedAt: new Date() };
  await db.collection<ShippingSettings>("settings").updateOne(
    { _id: "shipping" },
    { $set: fees },
    { upsert: true },
  );

  return NextResponse.json({ success: true, data: { insideKurigram, outsideKurigram } });
}
