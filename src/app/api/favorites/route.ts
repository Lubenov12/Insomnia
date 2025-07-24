import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { addToFavoritesSchema } from '@/lib/validations';
import { getAuthUser } from '@/lib/auth';

// POST /api/favorites - Add product to favorites
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
    const validatedData = addToFavoritesSchema.parse({
      ...body,
      user_id: user.id,
    });

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', validatedData.product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if already in favorites
    const { data: existingFavorite } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', validatedData.user_id)
      .eq('product_id', validatedData.product_id)
      .single();

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Product already in favorites' },
        { status: 409 }
      );
    }

    // Add to favorites
    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to add to favorites' },
        { status: 500 }
      );
    }

    return NextResponse.json(favorite, { status: 201 });
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