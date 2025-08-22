import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

// Validation schema for updating stock
const updateStockSchema = z.object({
  product_id: z.string().uuid("Valid product ID is required"),
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "3XL"]),
  stock_quantity: z.number().int().min(0, "Stock quantity must be 0 or positive")
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateStockSchema.parse(body);

    // Use the database function to update stock
    const { data, error } = await supabase.rpc('update_variant_stock', {
      p_product_id: validatedData.product_id,
      p_size: validatedData.size,
      p_quantity: validatedData.stock_quantity
    });

    if (error) {
      console.error("Error updating stock:", error);
      return NextResponse.json(
        { error: "Failed to update stock" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Product variant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Stock updated successfully"
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Stock update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get stock information for all products
export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        category,
        product_variants (
          size,
          stock_quantity,
          updated_at
        )
      `)
      .order("name");

    if (error) {
      console.error("Error fetching stock info:", error);
      return NextResponse.json(
        { error: "Failed to fetch stock information" },
        { status: 500 }
      );
    }

    // Format the response for easier consumption
    const formattedProducts = products?.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      variants: product.product_variants?.map((variant: any) => ({
        size: variant.size,
        stock_quantity: variant.stock_quantity,
        updated_at: variant.updated_at
      })) || [],
      total_stock: product.product_variants?.reduce((sum: number, variant: any) => sum + variant.stock_quantity, 0) || 0
    }));

    return NextResponse.json({ products: formattedProducts });

  } catch (error) {
    console.error("Stock info fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
