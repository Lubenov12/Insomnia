import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // Validate session using database function
    const { data: sessionData, error: validateError } = await supabase.rpc(
      "validate_admin_session",
      {
        p_session_token: sessionToken,
      }
    );

    if (validateError || !sessionData || sessionData.length === 0) {
      // Clear invalid session cookie
      cookieStore.delete("admin_session");

      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const admin = sessionData[0];

    return NextResponse.json({
      valid: true,
      admin: {
        id: admin.admin_user_id,
        username: admin.username,
        email: admin.email,
        is_active: admin.is_active,
      },
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
