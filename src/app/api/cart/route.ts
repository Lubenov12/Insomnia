import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { addToCartSchema } from '@/lib/validations';
import { getAuthUser } from '@/lib/auth';

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = addToCartSchema.parse({
      ...body,
      user_id: user.id,
    });

    // Check if product exists and has sufficient stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', validatedData.product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock_quantity < validatedData.quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', validatedData.user_id)
      .eq('product_id', validatedData.product_id)
      .single();

    let cartItem;
    if (existingItem) {
      // Update existing cart item
      const newQuantity = existingItem.quantity + validatedData.quantity;
      
      if (newQuantity > product.stock_quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock for requested quantity' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to update cart item' },
          { status: 500 }
        );
      }
      cartItem = data;
    } else {
      // Create new cart item
      const { data, error } = await supabase
        .from('cart_items')
        .insert([validatedData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to add item to cart' },
          { status: 500 }
        );
      }
      cartItem = data;
    }

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}