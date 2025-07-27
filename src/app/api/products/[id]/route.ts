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
        "id, name, description, price, image_url, stock_quantity, category, created_at, size_s_quantity, size_m_quantity, size_l_quantity, size_xl_quantity"
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

    // Create size availability object from product columns
    const sizeAvailability = {
      S: product.size_s_quantity || 0,
      M: product.size_m_quantity || 0,
      L: product.size_l_quantity || 0,
      XL: product.size_xl_quantity || 0,
    };

    // Add size availability to product
    const productWithSizes = {
      ...product,
      size_availability: sizeAvailability,
    };

    return NextResponse.json(productWithSizes);
  } catch (error) {
    return handleApiError(error);
  }
}
