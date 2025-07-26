import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { productSchema, searchSchema, paginationSchema } from '@/lib/validations';
import { getAuthUser } from '@/lib/auth';
import { handleApiError, validatePagination, sanitizeInput, DatabaseError, NotFoundError } from '@/lib/error-handler';

// GET /api/products - Get all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate and sanitize search parameters
    const { page, limit } = validatePagination(
      searchParams.get('page') || undefined,
      searchParams.get('limit') || undefined
    );
    
    const searchData = searchSchema.parse({
      query: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
    });
    
    const offset = (page - 1) * limit;

    // Sanitize inputs
    const category = searchData.category ? sanitizeInput(searchData.category) : null;
    const search = searchData.query ? sanitizeInput(searchData.query) : null;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .gte('stock_quantity', 1) // Only show products in stock
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: products, error, count } = await query;

    if (error) {
      throw new DatabaseError('Failed to fetch products', error.code, error);
    }

    // Validate that we have valid data
    if (!Array.isArray(products)) {
      throw new DatabaseError('Invalid response from database');
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      filters: {
        category: category || null,
        search: search || null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      throw new AuthenticationError();
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON in request body');
    }

    // Validate required fields exist
    if (!body || typeof body !== 'object') {
      throw new ValidationError('Request body must be a valid object');
    }

    const validatedData = productSchema.parse(body);

    // Additional business logic validation
    if (validatedData.price <= 0) {
      throw new ValidationError('Product price must be greater than 0', { price: validatedData.price }, 'price');
    }

    // Check if product with same name already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .ilike('name', validatedData.name)
      .single();

    if (existingProduct) {
      throw new ConflictError('A product with this name already exists');
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new DatabaseError('Failed to create product', error.code, error);
    }

    if (!product) {
      throw new DatabaseError('Product was not created successfully');
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}