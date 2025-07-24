import { NextRequest, NextResponse } from "next/server";

// Example: GET /api/bolt/products
export async function GET(req: NextRequest) {
  // Placeholder: return mock products
  return NextResponse.json([{ id: 1, name: "Примерен продукт", price: 25.0 }]);
}

// Example: POST /api/bolt/orders
export async function POST(req: NextRequest) {
  const data = await req.json();
  // Placeholder: return mock order confirmation
  return NextResponse.json({
    orderId: "ORDER123",
    status: "created",
    ...data,
  });
}
