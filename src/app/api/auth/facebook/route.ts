import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Exchange code for session using Supabase
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Facebook OAuth error:", error);
      return NextResponse.json(
        { error: "Failed to authenticate with Facebook" },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "No user data received from Facebook" },
        { status: 400 }
      );
    }

    // Check if user profile exists, create if not
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!existingUser) {
      // Create user profile
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          name:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "User",
          email: data.user.email,
          created_at: new Date().toISOString(),
        },
      ]);

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        name:
          data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] ||
          "User",
        email: data.user.email,
      },
      session: data.session,
    });
  } catch (error) {
    console.error("Facebook OAuth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
