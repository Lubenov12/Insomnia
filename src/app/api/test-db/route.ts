import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/test-db - Test database connection and table existence
export async function GET(request: NextRequest) {
  try {
    console.log("Testing Supabase connection...");

    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("products")
      .select("count", { count: "exact", head: true });

    let connectionErrorMsg: string | undefined = undefined;
    let connectionErrorCode: string | undefined = undefined;
    if (connectionError) {
      if (typeof connectionError === "object" && connectionError !== null) {
        if ("message" in connectionError) {
          connectionErrorMsg = (connectionError as { message: string }).message;
        }
        if ("code" in connectionError) {
          connectionErrorCode = (connectionError as { code: string }).code;
        }
      } else {
        connectionErrorMsg = String(connectionError);
      }
    }

    if (connectionError) {
      console.error("Connection error:", connectionError);
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connectionErrorMsg,
        code: connectionErrorCode,
      });
    }

    // Test 2: Check if main tables are accessible
    const tablesToCheck = [
      "products",
      "users",
      "orders",
      "order_items",
      "favorites",
      "cart_items",
    ];
    const tableResults: Record<string, { success: boolean; error?: string }> =
      {};
    for (const table of tablesToCheck) {
      try {
        // Try to select 1 row from each table
        const { error } = await supabase.from(table).select("*").limit(1);
        let errorMsg: string | undefined = undefined;
        if (error) {
          if (
            typeof error === "object" &&
            error !== null &&
            "message" in error
          ) {
            errorMsg = (error as { message: string }).message;
          } else {
            errorMsg = String(error);
          }
        }
        tableResults[table] = { success: !error, error: errorMsg };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        tableResults[table] = { success: false, error: errorMsg };
      }
    }

    // Test 3: Try to fetch products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .limit(5);
    let productsErrorMsg: string | undefined = undefined;
    if (productsError) {
      if (
        typeof productsError === "object" &&
        productsError !== null &&
        "message" in productsError
      ) {
        productsErrorMsg = (productsError as { message: string }).message;
      } else {
        productsErrorMsg = String(productsError);
      }
    }

    // Test 4: RLS check (try to fetch from users table, which should be protected)
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(1);
    let usersErrorMsg: string | undefined = undefined;
    if (usersError) {
      if (
        typeof usersError === "object" &&
        usersError !== null &&
        "message" in usersError
      ) {
        usersErrorMsg = (usersError as { message: string }).message;
      } else {
        usersErrorMsg = String(usersError);
      }
    }

    return NextResponse.json({
      success: true,
      tests: {
        connection: {
          success: !connectionError,
          error: connectionErrorMsg,
          productCount: connectionTest,
        },
        tables: tableResults,
        products: {
          success: !productsError,
          error: productsErrorMsg,
          count: products?.length || 0,
          sampleProducts: products?.slice(0, 2) || [],
        },
        rls: {
          usersTableAccessible: !usersError,
          error: usersErrorMsg,
        },
      },
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlPreview:
          process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Test error:", errorMsg);
    return NextResponse.json({
      success: false,
      error: "Test failed",
      details: errorMsg,
    });
  }
}
