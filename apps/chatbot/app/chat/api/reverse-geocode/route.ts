import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "lat болон lng шаардлагатай" },
        { status: 400 },
      );
    }

    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=mn&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ShopAI/1.0 (development contact: dev@local.test)",
        Referer: "http://localhost:3000",
      },
      cache: "no-store",
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("Nominatim status:", response.status);
      console.error("Nominatim body:", text);

      return NextResponse.json(
        {
          error: "Reverse geocode request failed",
          status: response.status,
          details: text,
        },
        { status: response.status },
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    console.error("reverse-geocode api error:", error);

    return NextResponse.json(
      {
        error: "Сервер дээр reverse geocode алдаа гарлаа",
      },
      { status: 500 },
    );
  }
}
