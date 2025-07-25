import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/test-db - Test database connection and table existence
export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error('Connection error:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError.message,
        code: connectionError.code,
      });
    }

    // Test 2: Check if tables exist
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['products', 'users', 'orders', 'order_items', 'favorites', 'cart_items']);

    if (tablesError) {
      console.error('Tables check error:', tablesError);
    }

    // Test 3: Try to fetch products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (productsError) {
      console.error('Products fetch error:', productsError);
    }

    // Test 4: Check RLS policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'products');

    if (policiesError) {
      console.error('Policies check error:', policiesError);
    }

    return NextResponse.json({
      success: true,
      tests: {
        connection: {
          success: !connectionError,
          error: connectionError?.message,
          productCount: connectionTest,
        },
        tables: {
          success: !tablesError,
          error: tablesError?.message,
          foundTables: tablesData?.map(t => t.table_name) || [],
        },
        products: {
          success: !productsError,
          error: productsError?.message,
          count: products?.length || 0,
          sampleProducts: products?.slice(0, 2) || [],
        },
        policies: {
          success: !policiesError,
          error: policiesError?.message,
          count: policies?.length || 0,
        },
      },
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      },
    });
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message,
    });
  }
}