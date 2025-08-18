import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const paymentRequestSchema = z.object({
  amount: z.number().min(1),
  currency: z.string().default("bgn"),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(5),
    address: z.string().min(5),
  }),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        name: z.string(),
        quantity: z.number().min(1),
        price: z.number().min(0),
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
    const body = await request.json();
    const data = paymentRequestSchema.parse(body);

    // Calculate total amount including shipping
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const total = subtotal + data.shipping.cost;

    // TODO: Integrate with actual Stripe API
    // For now, return a mock payment intent
    const mockPaymentIntent = {
      id: `pi_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(total * 100), // Convert to cents
      currency: data.currency,
      status: "requires_payment_method",
      client_secret: `pi_${Math.random()
        .toString(36)
        .substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
      created: Math.floor(Date.now() / 1000),
    };

    return NextResponse.json({
      success: true,
      paymentIntent: mockPaymentIntent,
      order: {
        id: `order_${Math.random().toString(36).substr(2, 9)}`,
        total: total,
        subtotal: subtotal,
        shipping: data.shipping.cost,
        status: "pending",
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("payment_intent_id");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // TODO: Fetch actual payment status from Stripe
    // For now, return mock status
    const mockStatus = {
      id: paymentIntentId,
      status: "succeeded",
      amount: 15000, // 150.00 BGN in cents
      currency: "bgn",
      created: Math.floor(Date.now() / 1000),
    };

    return NextResponse.json({
      success: true,
      paymentIntent: mockStatus,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
