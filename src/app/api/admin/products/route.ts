import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

// Validation schema for creating products with variants
const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional().default(""),
  price: z.number().positive("Price must be positive"),
  image_url: z.string().url("Valid image URL is required"),
  category: z.string().min(1, "Category is required"),
  variants: z
    .array(
      z.object({
        size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "3XL"]),
        stock_quantity: z
          .number()
          .int()
          .min(0, "Stock quantity must be 0 or positive"),
      })
    )
    .min(1, "At least one variant is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Use the database function to create product with variants
    const { data, error } = await supabase.rpc("create_product_with_variants", {
      p_name: validatedData.name,
      p_price: validatedData.price,
      p_description: validatedData.description,
      p_image_url: validatedData.image_url,
      p_category: validatedData.category,
      p_variants: validatedData.variants,
    });

    if (error) {
      console.error("Error creating product:", error);
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Product created successfully",
      product_id: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all products with their variants for admin view
export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (
          id,
          size,
          stock_quantity,
          created_at,
          updated_at
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
