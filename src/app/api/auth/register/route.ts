import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { userRegistrationSchema } from "@/lib/validations";
import { ZodError } from "zod";

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
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a valid object" },
        { status: 400 }
      );
    }

    console.log("Validating data...");
    let validatedData;
    try {
      validatedData = userRegistrationSchema.parse(body);
      console.log(
        "Validation successful:",
        JSON.stringify(validatedData, null, 2)
      );
    } catch (validationError: unknown) {
      console.error("Validation error:", validationError);

      // Format validation errors for better user experience
      if (validationError instanceof ZodError) {
        const fieldErrors = (validationError as ZodError).errors.map(
          (err: { path: (string | number)[]; message: string }) => ({
            field: err.path.join("."),
            message: err.message,
          })
        );

        return NextResponse.json(
          {
            error: "Validation failed",
            details: fieldErrors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    // Check if user already exists (by email or phone)
    let existingUser = null;

    if (validatedData.email) {
      const { data: emailUser, error: emailError } = await supabase
        .from("users")
        .select("id")
        .eq("email", validatedData.email)
        .single();

      if (emailError && emailError.code !== "PGRST116") {
        console.error("Error checking email:", emailError);
        return NextResponse.json(
          { error: "Database error while checking email" },
          { status: 500 }
        );
      }
      existingUser = emailUser;
    }

    if (!existingUser && validatedData.phone_number) {
      const { data: phoneUser, error: phoneError } = await supabase
        .from("users")
        .select("id")
        .eq("phone_number", validatedData.phone_number)
        .single();

      if (phoneError && phoneError.code !== "PGRST116") {
        console.error("Error checking phone:", phoneError);
        return NextResponse.json(
          { error: "Database error while checking phone number" },
          { status: 500 }
        );
      }
      existingUser = phoneUser;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone number already exists" },
        { status: 409 }
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
        return NextResponse.json(
          { error: "User with this email or phone number already exists" },
          { status: 409 }
        );
      }

      if (authError.message.includes("Password")) {
        return NextResponse.json(
          { error: "Password does not meet requirements" },
          { status: 400 }
        );
      }

      if (authError.message.includes("Email")) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Registration failed: " + authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Registration failed - no user data returned" },
        { status: 500 }
      );
    }

    // For now, we'll create the user profile using a database trigger or function
    // This is a simpler approach that works with RLS
    console.log("User created successfully:", authData.user.id);

    // Return success response
    console.log("Registration successful, returning response...");
    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: authData.user.id,
          name: validatedData.name,
          email: validatedData.email,
          phone_number: validatedData.phone_number,
          created_at: new Date().toISOString(),
        },
        session: authData.session,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error caught:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
