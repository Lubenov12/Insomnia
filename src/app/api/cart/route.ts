import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

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

    // Check if product variant exists and has sufficient stock
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("stock_quantity")
      .eq("product_id", validatedData.product_id)
      .eq("size", validatedData.size)
      .single();

    if (variantError || !variant) {
      return NextResponse.json(
        { error: "Product variant not found" },
        { status: 404 }
      );
    }

    if (variant.stock_quantity < validatedData.quantity) {
      return NextResponse.json(
        { error: "Insufficient stock for selected size" },
        { status: 400 }
      );
    }

    // In a real app, you would:
    // 1. Get user from authentication
    // 2. Add to user's cart in database
    // 3. Optionally decrement stock

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
