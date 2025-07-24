import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { uuidSchema } from '@/lib/validations';
import { getAuthUser } from '@/lib/auth';

interface RouteParams {
  params: { user_id: string };
}

// GET /api/favorites/[user_id] - Get user's favorite products
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { user_id } = await params;
    const validatedUserId = uuidSchema.parse(user_id);

    // Ensure user can only access their own favorites
    if (user.id !== validatedUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const { data: favorites, error, count } = await supabase
      .from('favorites')
      .select(`
        *,
        products (
          id,
          name,
          description,
          price,
          image_url,
          category,
          stock_quantity
        )
      `, { count: 'exact' })
      .eq('user_id', validatedUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch favorites' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      favorites,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
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

// DELETE /api/favorites/[user_id] - Remove all favorites for user
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { user_id } = await params;
    const validatedUserId = uuidSchema.parse(user_id);

    // Ensure user can only clear their own favorites
    if (user.id !== validatedUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (productId) {
      // Remove specific product from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', validatedUserId)
        .eq('product_id', productId);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to remove from favorites' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Product removed from favorites' });
    } else {
      // Clear all favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', validatedUserId);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to clear favorites' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'All favorites cleared' });
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
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