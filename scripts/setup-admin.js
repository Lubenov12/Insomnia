const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple password hashing function (replace with bcrypt in production)
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function setupAdmin() {
  try {
    console.log("Setting up admin user...");

    const adminUsername = "admin";
    const adminEmail = "admin@insomnia.com";
    const adminPassword = "insomnia2024!"; // Change this!
    const hashedPassword = hashPassword(adminPassword);

    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from("admin_users")
      .select("id, username")
      .eq("username", adminUsername)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing admin:", checkError);
      return;
    }

    if (existingAdmin) {
      console.log("Admin user already exists. Updating password...");

      // Update password
      const { error: updateError } = await supabase
        .from("admin_users")
        .update({
          password_hash: hashedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("username", adminUsername);

      if (updateError) {
        console.error("Error updating admin password:", updateError);
        return;
      }

      console.log("✅ Admin password updated successfully!");
    } else {
      console.log("Creating new admin user...");

      // Create new admin user
      const { error: insertError } = await supabase.from("admin_users").insert({
        username: adminUsername,
        email: adminEmail,
        password_hash: hashedPassword,
        is_active: true,
      });

      if (insertError) {
        console.error("Error creating admin user:", insertError);
        return;
      }

      console.log("✅ Admin user created successfully!");
    }

    console.log("\n📋 Admin Credentials:");
    console.log("Username:", adminUsername);
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("\n⚠️  IMPORTANT: Change these credentials in production!");
  } catch (error) {
    console.error("Setup failed:", error);
  }
}

// Run the setup
setupAdmin();
