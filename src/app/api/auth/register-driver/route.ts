import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "https://emergency-ambulance-backend-sovv.onrender.com/api/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = req.cookies.get("access_token")?.value;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BACKEND_URL}/auth/register-driver`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Driver registration failed" },
      { status: 500 }
    );
  }
}
