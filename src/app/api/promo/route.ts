import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

// Validation schema for promo code request
const promoRequestSchema = z.object({
  code: z
    .string()
    .min(1, "Кодът е задължителен")
    .max(50, "Кодът е твърде дълъг"),
  orderAmount: z.number().min(0, "Сумата трябва да бъде положителна"),
});

// POST /api/promo - Validate promo code
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Невалидни данни в заявката" },
        { status: 400 }
      );
    }

    // Validate request data
    const validationResult = promoRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Невалидни данни",
          details: validationResult.error.issues.map((issue) => issue.message),
        },
        { status: 400 }
      );
    }

    const { code, orderAmount } = validationResult.data;

    // Call database function to validate promo code
    const { data, error } = await supabase.rpc("validate_promo_code", {
      p_code: code.toUpperCase().trim(),
      p_order_amount: orderAmount,
    });

    if (error) {
      console.error("Database error validating promo code:", error);
      return NextResponse.json(
        { error: "Грешка при проверка на кода" },
        { status: 500 }
      );
    }

    // Return the validation result
    const result = data[0];
    if (!result) {
      return NextResponse.json(
        { error: "Грешка при обработка на кода" },
        { status: 500 }
      );
    }

    if (result.is_valid) {
      return NextResponse.json({
        success: true,
        valid: true,
        promoId: result.promo_id,
        discountType: result.discount_type,
        discountValue: result.discount_value,
        discountAmount: parseFloat(result.discount_amount),
        message: result.message,
      });
    } else {
      return NextResponse.json({
        success: true,
        valid: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Promo code validation error:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}

// GET /api/promo - Get all active promo codes (for admin)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching promo codes:", error);
      return NextResponse.json(
        { error: "Грешка при зареждане на промо кодовете" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      promoCodes: data,
    });
  } catch (error) {
    console.error("Error in GET /api/promo:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}
