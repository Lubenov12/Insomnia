import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Check environment variables
    const envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...',
    };

    // Test 2: Basic connection test
    const { data: healthCheck, error: healthError } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    // Test 3: Try to fetch sample products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3);

    // Test 4: Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');

    return NextResponse.json({
      success: !healthError && !productsError,
      timestamp: new Date().toISOString(),
      tests: {
        environment: envCheck,
        connection: {
          success: !healthError,
          error: healthError?.message,
          productCount: healthCheck,
        },
        products: {
          success: !productsError,
          error: productsError?.message,
          count: products?.length || 0,
          sample: products?.slice(0, 2) || [],
        },
        tables: {
          success: !tablesError,
          error: tablesError?.message,
          available: tables || [],
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}