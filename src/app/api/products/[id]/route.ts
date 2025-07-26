import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { uuidSchema, productSchema } from '@/lib/validations';
import { getAuthUser } from '@/lib/auth';
import { handleApiError, validateUUID, DatabaseError, NotFoundError, AuthenticationError, ValidationError, ConflictError } from '@/lib/error-handler';

interface RouteParams {
  params: { id: string };
}

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const validatedId = validateUUID(id, 'Product ID');

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', validatedId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Product not found');
      }
      throw new DatabaseError('Failed to fetch product', error.code, error);
    }

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/products/[id] - Update a product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      throw new AuthenticationError();
    }

    const { id } = await params;
    const validatedId = validateUUID(id, 'Product ID');
    
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON in request body');
    }

    if (!body || typeof body !== 'object') {
      throw new ValidationError('Request body must be a valid object');
    }

    const validatedData = productSchema.partial().parse(body);

    // Check if product exists first
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', validatedId)
      .single();

    if (fetchError || !existingProduct) {
      throw new NotFoundError('Product not found');
    }

    // If updating name, check for duplicates
    if (validatedData.name && validatedData.name !== existingProduct.name) {
      const { data: duplicateProduct } = await supabase
        .from('products')
        .select('id')
        .ilike('name', validatedData.name)
        .neq('id', validatedId)
        .single();

      if (duplicateProduct) {
        throw new ConflictError('A product with this name already exists');
      }
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(validatedData)
      .eq('id', validatedId)
      .select()
      .single();

    if (error) {
      throw new DatabaseError('Failed to update product', error.code, error);
    }

    if (!product) {
      throw new DatabaseError('Product update failed');
    }

    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/products/[id] - Delete a product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      throw new AuthenticationError();
    }

    const { id } = await params;
    const validatedId = validateUUID(id, 'Product ID');

    // Check if product exists first
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', validatedId)
      .single();

    if (fetchError || !existingProduct) {
      throw new NotFoundError('Product not found');
    }

    // Check if product is referenced in any orders
    const { data: orderItems, error: orderCheckError } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', validatedId)
      .limit(1);

    if (orderCheckError) {
      throw new DatabaseError('Failed to check product references', orderCheckError.code, orderCheckError);
    }

    if (orderItems && orderItems.length > 0) {
      throw new ConflictError('Cannot delete product that has been ordered');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', validatedId);

    if (error) {
      throw new DatabaseError('Failed to delete product', error.code, error);
    }

    return NextResponse.json({ 
      message: 'Product deleted successfully',
      deletedId: validatedId 
    });
  } catch (error) {
    return handleApiError(error);
  }
}