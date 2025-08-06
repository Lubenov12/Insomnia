import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiError,
  NotFoundError,
  DatabaseError,
} from "@/lib/error-handler";

// Product details API endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      throw new NotFoundError("Product ID is required");
    }

    // Fetch product details from database
    const { data: product, error } = await supabase
      .from("products")
      .select(
        "id, name, description, price, image_url, stock_quantity, category, created_at"
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("Product not found");
      }
      throw new DatabaseError("Failed to fetch product", error.code, error);
    }

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Fetch product variants
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, size, stock_quantity, created_at, updated_at")
      .eq("product_id", id)
      .order("size");

    if (variantsError) {
      throw new DatabaseError(
        "Failed to fetch product variants",
        variantsError.code,
        variantsError
      );
    }

    // Create size availability object from variants
    const sizeAvailability: { [key: string]: number } = {};
    variants?.forEach((variant) => {
      sizeAvailability[variant.size] = variant.stock_quantity;
    });

    // Add variants and size availability to product
    const productWithVariants = {
      ...product,
      variants: variants || [],
      size_availability: sizeAvailability,
    };

    return NextResponse.json(productWithVariants);
  } catch (error) {
    return handleApiError(error);
  }
}
