import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const shippingRequestSchema = z.object({
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().min(3),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        quantity: z.number().min(1),
        weight: z.number().optional(),
      })
    )
    .min(1),
  total: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = shippingRequestSchema.parse(body);

    // Calculate shipping options based on total and location
    const shippingOptions = [
      {
        id: "standard",
        name: "Стандартна доставка",
        price: data.total >= 150 ? 0 : 8.99,
        estimatedDays: "3-5 работни дни",
        description: "Доставка чрез Еконт или Спиди",
      },
      {
        id: "express",
        name: "Експресна доставка",
        price: data.total >= 150 ? 4.99 : 13.99,
        estimatedDays: "1-2 работни дни",
        description: "Приоритетна доставка",
      },
      {
        id: "pickup",
        name: "Лично получаване",
        price: 0,
        estimatedDays: "Следващия работен ден",
        description: "От наш офис в София",
      },
    ];

    return NextResponse.json({
      success: true,
      options: shippingOptions,
      freeShippingThreshold: 150,
    });
  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate shipping" },
      { status: 400 }
    );
  }
}
