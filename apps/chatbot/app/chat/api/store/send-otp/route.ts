import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  const { email } = await req.json();
  if (!email)
    return NextResponse.json({ error: "Имэйл хэрэгтэй" }, { status: 400 });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY тохируулагдаагүй байна" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RESEND_API_ERROR:", errorText);
      return NextResponse.json(
        { error: "Код илгээхэд алдаа гарлаа" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, code });
  } catch (e) {
    console.error("RESEND_ERROR:", e);
    return NextResponse.json(
      { error: "Код илгээхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}
