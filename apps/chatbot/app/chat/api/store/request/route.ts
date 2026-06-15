import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ hasStore: false, role: null });

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { stores: { select: { status: true } } },
  });

  const hasStore = !!dbUser && dbUser.stores.length > 0;
  return NextResponse.json({
    hasStore,
    role: dbUser?.role ?? null,
    status: dbUser?.stores[0]?.status ?? null,
  });
}

const REGISTER_REGEX = /^[А-ЯЁӨҮ]{2}\d{8}$/u;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  const body = await req.json();
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const phone = String(body.phone || "").trim();
  const registerNumber = String(body.registerNumber || "")
    .trim()
    .toUpperCase();
  const idCardImage = String(body.idCardImage || "").trim();
  const bankName = String(body.bankName || "").trim();
  const bankAccountNumber = String(body.bankAccountNumber || "").trim();
  const bankAccountHolder = String(body.bankAccountHolder || "").trim();

  if (!name)
    return NextResponse.json(
      { error: "Дэлгүүрийн нэр шаардлагатай" },
      { status: 400 },
    );
  if (!/^\d{8}$/.test(phone))
    return NextResponse.json(
      { error: "Утасны дугаараа 8 оронтой зөв оруулна уу" },
      { status: 400 },
    );
  if (!REGISTER_REGEX.test(registerNumber))
    return NextResponse.json(
      {
        error:
          "Регистрийн дугаарыг 2 үсэг + 8 тоогоор оруулна уу (ж: УБ12345678)",
      },
      { status: 400 },
    );
  if (!idCardImage)
    return NextResponse.json(
      { error: "Иргэний үнэмлэхний зураг заавал оруулна уу" },
      { status: 400 },
    );

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { stores: true },
  });
  if (!dbUser)
    return NextResponse.json({ error: "Бүртгэл олдсонгүй" }, { status: 404 });

  const activeStore = dbUser.stores.find(
    (s) => s.status === "PENDING" || s.status === "APPROVED",
  );
  if (activeStore)
    return NextResponse.json(
      { error: "Та аль хэдийн хүсэлт илгээсэн байна" },
      { status: 409 },
    );

  await prisma.store.deleteMany({
    where: { ownerId: dbUser.id, status: "REJECTED" },
  });

  const duplicate = await prisma.store.findFirst({
    where: {
      OR: [{ registerNumber }, { phone }],
      ownerId: { not: dbUser.id },
    },
    select: { registerNumber: true, phone: true },
  });
  if (duplicate) {
    const sameReg = duplicate.registerNumber === registerNumber;
    return NextResponse.json(
      {
        error: sameReg
          ? "Энэ регистрийн дугаараар хүсэлт аль хэдийн бүртгэгдсэн байна"
          : "Энэ утасны дугаараар хүсэлт аль хэдийн бүртгэгдсэн байна",
      },
      { status: 409 },
    );
  }

  const store = await prisma.store.create({
    data: {
      name,
      description: description || null,
      ownerId: dbUser.id,
      phone,
      registerNumber,
      idCardImage,
      bankName: bankName || null,
      bankAccountNumber: bankAccountNumber || null,
      bankAccountHolder: bankAccountHolder || null,
    },
  });
  return NextResponse.json({ success: true, store });
}
