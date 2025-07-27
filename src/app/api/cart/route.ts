import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for cart operations
const addToCartSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  size: z.string().min(1, "Size is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// In-memory cart storage (in production, this would be in database)
const cartItems: Array<{
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  added_at: string;
  price?: number;
}> = [];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      items: cartItems,
      total: cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
      ),
      count: cartItems.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cart retrieval error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = addToCartSchema.parse(body);

    // In a real app, you would:
    // 1. Get product details from database
    // 2. Check if user is authenticated
    // 3. Add to user's cart in database

    // For now, we'll simulate adding to cart
    const newItem = {
      id: Date.now().toString(),
      product_id: validatedData.product_id,
      size: validatedData.size,
      quantity: validatedData.quantity,
      added_at: new Date().toISOString(),
    };

    cartItems.push(newItem);

    return NextResponse.json(
      {
        message: "Product added to cart successfully",
        item: newItem,
        cart_count: cartItems.length,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Add to cart error" }, { status: 500 });
  }
}
