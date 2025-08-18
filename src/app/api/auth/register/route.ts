import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
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
        {
          error:
            "Възникна грешка при обработка на данните. Моля опитайте отново.",
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          error:
            "Възникна грешка при обработка на данните. Моля опитайте отново.",
        },
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
        const fieldErrors = validationError.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return NextResponse.json(
          {
            error: "Моля проверете въведените данни",
            details: fieldErrors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Моля проверете въведените данни и опитайте отново" },
        { status: 400 }
      );
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
          {
            error:
              "Възникна грешка при проверка на email адреса. Моля опитайте отново.",
          },
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
          {
            error:
              "Възникна грешка при проверка на телефонния номер. Моля опитайте отново.",
          },
          { status: 500 }
        );
      }
      existingUser = phoneUser;
    }

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Потребител с този email адрес или телефонен номер вече съществува",
        },
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
          {
            error:
              "Потребител с този email адрес или телефонен номер вече съществува",
          },
          { status: 409 }
        );
      }

      if (authError.message.includes("Password")) {
        return NextResponse.json(
          { error: "Паролата не отговаря на изискванията за сигурност" },
          { status: 400 }
        );
      }

      if (authError.message.includes("Email")) {
        return NextResponse.json(
          { error: "Невалиден email формат" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Регистрацията неуспешна. Моля опитайте отново." },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          error:
            "Възникна техническа грешка при регистрацията. Моля опитайте отново.",
        },
        { status: 500 }
      );
    }

    // Create user profile in database using admin client (bypasses RLS)
    console.log("Creating user profile in database...");
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          id: authData.user.id,
          name: validatedData.name,
          email: authEmail, // Use the email used for auth (either real email or generated one)
          phone_number: validatedData.phone_number || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error("Error creating user profile:", profileError);

      // If profile creation fails, we should clean up the auth user
      // But for now, let's return an error and the user can try again
      return NextResponse.json(
        {
          error:
            "Акаунтът е създаден, но възникна грешка при създаването на профила. Моля опитайте да влезете в акаунта си.",
        },
        { status: 500 }
      );
    }

    console.log("User profile created successfully:", userProfile);

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
      { error: "Възникна техническа грешка. Моля опитайте отново след малко." },
      { status: 500 }
    );
  }
}
