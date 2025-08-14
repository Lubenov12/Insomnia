import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

// Orders API endpoint - placeholder for future implementation
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement orders retrieval
    return NextResponse.json({
      message: "Orders endpoint - coming soon",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Orders retrieval error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const schema = z.object({
      guest: z.boolean().optional().default(true),
      customer: z.object({
        name: z.string().min(2),
        address: z.string().min(5),
        phone: z.string().min(5),
        email: z.string().email(),
      }),
      cart: z
        .array(
          z.object({
            product_id: z.string().min(1),
            size: z.string().min(1),
            quantity: z.number().min(1),
            added_at: z.string().optional(),
          })
        )
        .min(1),
    });
    const data = schema.parse(body);

    // Basic price enrichment to store snapshot
    const productIds = Array.from(new Set(data.cart.map((i) => i.product_id)));
    const { data: products } = await supabase
      .from("products")
      .select("id, name, price")
      .in("id", productIds);
    const priceMap = new Map((products || []).map((p) => [p.id, p]));

    const orderItems = data.cart.map((i) => ({
      product_id: i.product_id,
      size: i.size,
      quantity: i.quantity,
      unit_price: priceMap.get(i.product_id)?.price ?? 0,
      product_name: priceMap.get(i.product_id)?.name ?? "",
    }));

    const total = orderItems.reduce(
      (s, it) => s + it.unit_price * it.quantity,
      0
    );

    // Insert order (assuming orders and order_items tables exist)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          guest: data.guest === true,
          customer_name: data.customer.name,
          customer_address: data.customer.address,
          customer_phone: data.customer.phone,
          customer_email: data.customer.email,
          total_amount: total,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order create failed" },
        { status: 500 }
      );
    }

    const itemsWithOrder = orderItems.map((it) => ({
      order_id: order.id,
      ...it,
    }));
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrder);
    if (itemsError) {
      return NextResponse.json(
        { error: "Order items create failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { id: order.id, total, message: "Order created" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Create order error" }, { status: 500 });
  }
}
