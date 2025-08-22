import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { userRegistrationSchema } from "@/lib/validations";
import { ZodError } from "zod";

// POST /api/auth/register - User registration
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("JSON parse error:", error);
      throw new ValidationError("Invalid JSON in request body");
    }

    // Validate required fields exist
    if (!body || typeof body !== "object") {
      throw new ValidationError("Request body must be a valid object");
    }

    const validatedData = userRegistrationSchema.parse(body);

    // Additional business logic validation
    if (validatedData.password !== validatedData.confirmPassword) {
      throw new ValidationError(
        "Passwords do not match",
        { password: validatedData.password },
        "password"
      );
    }

    // Check if user with same email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", validatedData.email)
      .single();

    if (existingUser) {
      throw new ConflictError("A user with this email already exists");
    }

    // Check if user with same phone number already exists
    if (validatedData.phone_number) {
      const { data: existingPhoneUser } = await supabase
        .from("users")
        .select("id")
        .eq("phone_number", validatedData.phone_number)
        .single();

      if (existingPhoneUser) {
        throw new ConflictError("A user with this phone number already exists");
      }
    }

    // Create Supabase Auth user
    const authEmail =
      validatedData.email || `${validatedData.phone_number}@insomnia.local`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
          phone_number: validatedData.phone_number,
        },
      },
    });

    if (authError) {
      console.error("Supabase Auth error:", authError);
      throw new AuthenticationError(
        authError.message || "Failed to create user account"
      );
    }

    if (!authData.user) {
      throw new AuthenticationError("Failed to create user account");
    }

    // Create user profile in database
    const userProfileData = {
      id: authData.user.id,
      name: validatedData.name,
      email: validatedData.email,
      phone_number: validatedData.phone_number,
      marketing_emails: validatedData.marketing_emails,
    };

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .insert([userProfileData])
      .select()
      .single();

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      throw new DatabaseError(
        "Failed to create user profile",
        profileError.code,
        profileError
      );
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userProfile,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
