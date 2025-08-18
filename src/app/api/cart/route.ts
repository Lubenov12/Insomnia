import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

// Validation schema for cart operations
const addToCartSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  size: z.string().min(1, "Size is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null; // No user authenticated
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.warn("Error getting user from request:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (user) {
      // Authenticated user - get cart from database
      const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select(
          `
          id,
          product_id,
          quantity,
          created_at,
          products (
            id,
            name,
            price,
            image_url
          )
        `
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching cart from database:", error);
        return NextResponse.json(
          { error: "Failed to fetch cart from database" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        items: cartItems || [],
        total:
          cartItems?.reduce((sum, item) => {
            const product = Array.isArray(item.products)
              ? item.products[0]
              : item.products;
            return (
              sum + ((product as { price: number })?.price || 0) * item.quantity
            );
          }, 0) || 0,
        count: cartItems?.length || 0,
      });
    } else {
      // Guest user - return empty cart (handled by localStorage on client)
      return NextResponse.json({
        items: [],
        total: 0,
        count: 0,
        message: "Guest user - cart managed by localStorage",
      });
    }
  } catch (error) {
    console.error("Cart retrieval error:", error);
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

    const user = await getUserFromRequest(request);

    if (user) {
      // Authenticated user - save to database
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", validatedData.product_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error checking existing cart item:", checkError);
        return NextResponse.json(
          { error: "Failed to check existing cart item" },
          { status: 500 }
        );
      }

      let result;
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + validatedData.quantity;
        const { data, error } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingItem.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating cart item:", error);
          return NextResponse.json(
            { error: "Failed to update cart item" },
            { status: 500 }
          );
        }
        result = data;
      } else {
        // Create new cart item
        const { data, error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: validatedData.product_id,
            quantity: validatedData.quantity,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating cart item:", error);
          return NextResponse.json(
            { error: "Failed to create cart item" },
            { status: 500 }
          );
        }
        result = data;
      }

      return NextResponse.json(
        {
          message: "Product added to cart successfully",
          item: result,
          cart_count: 1, // Will be updated by client
        },
        { status: 201 }
      );
    } else {
      // Guest user - return success (handled by localStorage on client)
      const newItem = {
        id: Date.now().toString(),
        product_id: validatedData.product_id,
        size: validatedData.size,
        quantity: validatedData.quantity,
        added_at: new Date().toISOString(),
      };

      return NextResponse.json(
        {
          message: "Product added to cart successfully (guest user)",
          item: newItem,
          cart_count: 1, // Will be updated by client
        },
        { status: 201 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Add to cart error:", error);
    return NextResponse.json({ error: "Add to cart error" }, { status: 500 });
  }
}

// Update quantity of an item in cart (by product_id and size)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const schema = z.object({
      product_id: z.string().min(1),
      size: z.string().min(1),
      quantity: z.number().min(0),
    });
    const data = schema.parse(body);

    const user = await getUserFromRequest(request);

    if (user) {
      // Authenticated user - update in database
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", data.product_id)
        .single();

      if (checkError) {
        return NextResponse.json(
          { error: "Item not found in cart" },
          { status: 404 }
        );
      }

      if (data.quantity === 0) {
        // Remove item
        const { error: deleteError } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", existingItem.id);

        if (deleteError) {
          return NextResponse.json(
            { error: "Failed to remove item from cart" },
            { status: 500 }
          );
        }
      } else {
        // Update quantity
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: data.quantity })
          .eq("id", existingItem.id);

        if (updateError) {
          return NextResponse.json(
            { error: "Failed to update cart item" },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        message: "Cart updated successfully",
      });
    } else {
      // Guest user - return success (handled by localStorage on client)
      return NextResponse.json({
        message: "Cart updated successfully (guest user)",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update cart error:", error);
    return NextResponse.json({ error: "Update cart error" }, { status: 500 });
  }
}

// Remove an item from the cart (by product_id and size)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get("product_id");
    const size = searchParams.get("size");

    if (!product_id || !size) {
      return NextResponse.json(
        { error: "product_id and size are required" },
        { status: 400 }
      );
    }

    const user = await getUserFromRequest(request);

    if (user) {
      // Authenticated user - remove from database
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product_id)
        .single();

      if (checkError) {
        return NextResponse.json(
          { error: "Item not found in cart" },
          { status: 404 }
        );
      }

      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", existingItem.id);

      if (deleteError) {
        return NextResponse.json(
          { error: "Failed to remove item from cart" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Item removed from cart successfully",
      });
    } else {
      // Guest user - return success (handled by localStorage on client)
      return NextResponse.json({
        message: "Item removed from cart successfully (guest user)",
      });
    }
  } catch (error) {
    console.error("Delete cart item error:", error);
    return NextResponse.json(
      { error: "Delete cart item error" },
      { status: 500 }
    );
  }
}
