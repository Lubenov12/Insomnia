import { NextRequest, NextResponse } from "next/server";

// Example: POST /api/shipping/quote
export async function POST(req: NextRequest) {
  const { courier, address } = await req.json();
  // Placeholder: return mock shipping quote and tracking link
  let price = 6.99;
  const tracking = "https://track.mock/" + courier + "/123456";
  if (courier === "speedy") price = 5.99;
  return NextResponse.json({
    courier,
    price,
    tracking,
  });
}
