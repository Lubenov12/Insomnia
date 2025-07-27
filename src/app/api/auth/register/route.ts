import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { userRegistrationSchema } from "@/lib/validations";
import {
  handleApiError,
  ValidationError,
  ConflictError,
  DatabaseError,
} from "@/lib/error-handler";

// POST /api/auth/register - User registration
export async function POST(request: NextRequest) {
  try {
    console.log("Registration request received");

    let body;
    try {
      body = await request.json();
      console.log("Request body:", JSON.stringify(body, null, 2));
    } catch (error) {
      console.error("JSON parse error:", error);
      throw new ValidationError("Invalid JSON in request body");
    }

    if (!body || typeof body !== "object") {
      throw new ValidationError("Request body must be a valid object");
    }

    console.log("Validating data...");
    let validatedData;
    try {
      validatedData = userRegistrationSchema.parse(body);
      console.log(
        "Validation successful:",
        JSON.stringify(validatedData, null, 2)
      );
    } catch (validationError) {
      console.error("Validation error:", validationError);
      throw validationError;
    }

    // Check if user already exists (by email or phone)
    let existingUser = null;

    if (validatedData.email) {
      const { data: emailUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", validatedData.email)
        .single();
      existingUser = emailUser;
    }

    if (!existingUser && validatedData.phone_number) {
      const { data: phoneUser } = await supabase
        .from("users")
        .select("id")
        .eq("phone_number", validatedData.phone_number)
        .single();
      existingUser = phoneUser;
    }

    if (existingUser) {
      throw new ConflictError(
        "User with this email or phone number already exists"
      );
    }

    // Register user with Supabase Auth (use email if available, otherwise use phone)
    const authEmail =
      validatedData.email || `${validatedData.phone_number}@insomnia.local`;

    console.log("Creating Supabase Auth user with email:", authEmail);

    // Create regular user account (NOT admin)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
          role: "user", // Explicitly set as regular user
        },
      },
    });

    if (authError) {
      console.error("Supabase Auth error:", authError);

      if (authError.message.includes("already registered")) {
        throw new ConflictError(
          "User with this email or phone number already exists"
        );
      }

      if (authError.message.includes("Password")) {
        throw new ValidationError("Password does not meet requirements", {
          password: authError.message,
        });
      }

      if (authError.message.includes("Email")) {
        throw new ValidationError("Invalid email format", {
          email: authError.message,
        });
      }

      throw new ValidationError("Registration failed: " + authError.message);
    }

    if (!authData.user) {
      throw new ValidationError("Registration failed - no user data returned");
    }

    // Create user profile in our users table with current schema using admin client
    console.log("Creating user profile in database...");
    const { error: profileError } = await supabaseAdmin.from("users").insert([
      {
        id: authData.user.id,
        name: validatedData.name,
        email: validatedData.email || null,
        phone_number: validatedData.phone_number || null,
      },
    ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new DatabaseError(
        "Failed to create user profile",
        profileError.code,
        profileError
      );
    }

    // Fetch the created user profile to return complete data
    console.log("Fetching created user profile...");
    const { data: userProfile, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (fetchError || !userProfile) {
      console.error("Fetch error:", fetchError);
      throw new DatabaseError("Failed to fetch created user profile");
    }

    console.log("Registration successful, returning response...");
    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          phone_number: userProfile.phone_number,
          created_at: userProfile.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error caught:", error);
    return handleApiError(error);
  }
}
