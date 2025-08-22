import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Verify credentials using database function
    const { data: adminData, error: verifyError } = await supabase.rpc(
      "verify_admin_credentials",
      {
        p_username: username,
        p_password: password,
      }
    );

    if (verifyError || !adminData || adminData.length === 0) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const admin = adminData[0];

    // Check if admin is active
    if (!admin.is_active) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 401 }
      );
    }

    // Generate secure session token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create session in database
    const { data: sessionData, error: sessionError } = await supabase.rpc(
      "create_admin_session",
      {
        p_admin_user_id: admin.id,
        p_session_token: sessionToken,
        p_expires_at: expiresAt.toISOString(),
      }
    );

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: expiresAt,
      path: "/",
    });

    // Return admin info (without sensitive data)
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
