import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;

  try {
    // Check if webhook secret is configured properly
    if (
      !process.env.STRIPE_WEBHOOK_SECRET ||
      process.env.STRIPE_WEBHOOK_SECRET === "whsec_your_webhook_secret"
    ) {
      console.log(
        "⚠️ Webhook secret not configured - skipping signature verification (development only)"
      );
      // For development, we'll skip webhook processing and return success
      return NextResponse.json({
        received: true,
        message: "Webhook secret not configured",
      });
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(`💰 Payment succeeded: ${paymentIntent.id}`);

        // Confirm order and update inventory using our database function
        if (paymentIntent.id) {
          try {
            const { data, error } = await supabase.rpc(
              "confirm_order_with_inventory_update",
              { p_payment_intent_id: paymentIntent.id }
            );

            if (error) {
              console.error(
                "Error confirming order and updating inventory:",
                error
              );

              // If inventory update fails, mark order as needs review
              await supabase
                .from("orders")
                .update({ status: "needs_review" })
                .eq("payment_intent_id", paymentIntent.id);
            } else {
              console.log(
                `✅ Order confirmed and inventory updated for payment: ${paymentIntent.id}`
              );

              // Send notifications
              if (paymentIntent.metadata.order_id) {
                await sendOrderNotifications(
                  paymentIntent.metadata.order_id,
                  paymentIntent
                );
              }
            }
          } catch (error) {
            console.error("Critical error in order confirmation:", error);
          }
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log(`❌ Payment failed: ${failedPayment.id}`);

        // Handle payment failure properly
        if (failedPayment.id) {
          try {
            const { error } = await supabase.rpc("handle_payment_failure", {
              p_payment_intent_id: failedPayment.id,
            });

            if (error) {
              console.error("Error handling payment failure:", error);
            } else {
              console.log(`Payment failure handled for: ${failedPayment.id}`);
            }
          } catch (error) {
            console.error("Error in payment failure handler:", error);
          }
        }
        break;

      case "payment_intent.canceled":
        const canceledPayment = event.data.object;
        console.log(`🚫 Payment canceled: ${canceledPayment.id}`);

        // Update order status to canceled
        if (canceledPayment.metadata.order_id) {
          await supabase
            .from("orders")
            .update({
              status: "canceled",
            })
            .eq("id", canceledPayment.metadata.order_id);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Function to send notifications when payment succeeds
async function sendOrderNotifications(orderId: string, paymentIntent: any) {
  try {
    // Get order details
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          product_id,
          product_name,
          quantity,
          unit_price
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (error || !order) {
      console.error("Error fetching order for notifications:", error);
      return;
    }

    // Log payment confirmation (you can replace this with actual email/SMS notifications)
    console.log("🔔 PAYMENT NOTIFICATION:");
    console.log("📧 Customer:", order.customer_email, order.customer_name);
    console.log("📦 Order ID:", order.id);
    console.log(
      "💰 Amount:",
      paymentIntent.amount / 100,
      paymentIntent.currency.toUpperCase()
    );
    console.log("📱 Phone:", order.customer_phone);
    console.log("📍 Address:", order.customer_address);
    console.log("🛍️ Items:", order.order_items?.length || 0);

    // Here you would integrate with your notification system:
    // - Send email to customer with order confirmation
    // - Send SMS notification
    // - Send notification to admin/warehouse
    // - Add to your dashboard/CRM system

    // Example console notification for now:
    console.log(
      "✉️ ORDER CONFIRMATION EMAIL WOULD BE SENT TO:",
      order.customer_email
    );
    console.log("📱 SMS NOTIFICATION WOULD BE SENT TO:", order.customer_phone);
    console.log("🚨 ADMIN NOTIFICATION: New order #" + order.id + " received!");
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
}
