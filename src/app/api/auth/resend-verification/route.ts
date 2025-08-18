import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// POST /api/auth/resend-verification - Resend verification email
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    const validatedData = resendVerificationSchema.parse(body);

    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: validatedData.email,
    });

    if (error) {
      console.error("Resend verification error:", error);

      if (error.message.includes("already confirmed")) {
        return NextResponse.json(
          {
            error: "Email is already confirmed",
          },
          { status: 400 }
        );
      }

      if (error.message.includes("not found")) {
        return NextResponse.json(
          {
            error: "User not found with this email",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to resend verification email",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
