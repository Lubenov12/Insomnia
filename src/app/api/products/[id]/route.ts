import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Product details API endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get all products to find the one that matches the short ID
    const { data: allProducts, error: allError } = await supabase
      .from("products")
      .select("id, name")
      .limit(50); // Increased limit to ensure we find the product

    if (allError) {
      console.error("Error fetching all products:", allError);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Find the product that starts with the given short ID
    const matchingProduct = allProducts?.find((product) =>
      product.id.toLowerCase().startsWith(id.toLowerCase())
    );

    if (!matchingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Now fetch the full product with variants
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (
          id,
          product_id,
          size,
          stock_quantity,
          created_at,
          updated_at
        )
      `
      )
      .eq("id", matchingProduct.id)
      .limit(1);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = products[0];

    // Calculate size availability
    const sizeAvailability: { [key: string]: number } = {};
    if (product.product_variants) {
      product.product_variants.forEach(
        (variant: { size: string; stock_quantity: number }) => {
          sizeAvailability[variant.size] = variant.stock_quantity;
        }
      );
    }

    const productWithVariants = {
      ...product,
      size_availability: sizeAvailability,
    };

    return NextResponse.json(productWithVariants);
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
