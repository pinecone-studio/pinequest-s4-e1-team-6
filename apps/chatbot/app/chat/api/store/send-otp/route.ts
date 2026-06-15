import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  const { email } = await req.json();
  if (!email)
    return NextResponse.json({ error: "Имэйл хэрэгтэй" }, { status: 400 });

  const code = String(Math.floor(100000 + Math.random() * 900000));

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Дэлгүүр нээх хүсэлт — баталгаажуулах код",
      html: `
        <div style="font-family:sans-serif;padding:24px">
          <h2>Баталгаажуулах код</h2>
          <p>Таны код:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:4px">${code}</p>
          <p style="color:#888">Энэ кодыг хэнтэй ч бүү хуваалцаарай.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, code });
  } catch (e) {
    console.error("RESEND_ERROR:", e);
    return NextResponse.json(
      { error: "Код илгээхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}
