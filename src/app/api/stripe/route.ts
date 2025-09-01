import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  stripe,
  formatAmountForStripe,
  validateStripeConfig,
} from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

const paymentRequestSchema = z.object({
  amount: z.number().min(1),
  currency: z.string().default("bgn"),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(5),
    address: z.string().min(5),
    region: z.string().optional().default(""),
    city: z.string().optional().default(""),
  }),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        name: z.string(),
        quantity: z.number().min(1),
        price: z.number().min(0),
        size: z.string().optional().default("M"),
      })
    )
    .min(1),
  shipping: z.object({
    method: z.string(),
    cost: z.number().min(0),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    validateStripeConfig();

    const body = await request.json();
    const data = paymentRequestSchema.parse(body);

    // Validate stock availability before creating order
    for (const item of data.items) {
      const { data: variant, error: variantError } = await supabaseAdmin
        .from("product_variants")
        .select("stock_quantity")
        .eq("product_id", item.product_id)
        .eq("size", item.size || "M") // Default to M if no size specified
        .single();

      if (variantError || !variant) {
        return NextResponse.json(
          { error: `Product variant not found for ${item.name}` },
          { status: 400 }
        );
      }

      if (variant.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${item.name}. Available: ${variant.stock_quantity}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate total amount including shipping
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const total = subtotal + data.shipping.cost;

    // Create order in database first
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          guest: true,
          customer_name: data.customer.name,
          customer_address: data.customer.address,
          customer_phone: data.customer.phone,
          customer_email: data.customer.email,
          customer_region: data.customer.region || "",
          customer_city: data.customer.city || "",
          total_amount: total,
          status: "pending_payment",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (orderError || !order) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
      product_name: item.name,
      size: item.size,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Clean up order if items failed
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(total, data.currency),
      currency: data.currency,
      metadata: {
        order_id: order.id,
        customer_name: data.customer.name,
        customer_email: data.customer.email,
        customer_phone: data.customer.phone,
      },
      description: `Insomnia Order #${order.id} - ${data.items.length} items`,
      receipt_email: data.customer.email,
      shipping: {
        name: data.customer.name,
        phone: data.customer.phone,
        address: {
          line1: data.customer.address,
          country: "BG", // Bulgaria
        },
      },
    });

    // Update order with Stripe payment intent ID
    await supabaseAdmin
      .from("orders")
      .update({ payment_intent_id: paymentIntent.id })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      order: {
        id: order.id,
        total: total,
        subtotal: subtotal,
        shipping: data.shipping.cost,
        status: order.status,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error("Payment processing error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    validateStripeConfig();

    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("payment_intent_id");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // Fetch actual payment status from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Update order status and inventory if payment succeeded
    if (paymentIntent.status === "succeeded") {
      try {
        const { data, error } = await supabaseAdmin.rpc(
          "confirm_order_with_inventory_update",
          { p_payment_intent_id: paymentIntent.id }
        );

        if (error) {
          console.error(
            "Error confirming order and updating inventory:",
            error
          );
        } else {
          console.log(
            `✅ Order confirmed and inventory updated for payment: ${paymentIntent.id}`
          );
        }
      } catch (error) {
        console.error("Error in inventory update:", error);
      }
    }

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata,
      },
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
