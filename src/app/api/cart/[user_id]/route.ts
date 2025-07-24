import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { uuidSchema } from '@/lib/validations';
import { getAuthUser } from '@/lib/auth';

interface RouteParams {
  params: { user_id: string };
}

// GET /api/cart/[user_id] - Get cart items for a user
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

    // Ensure user can only access their own cart
    if (user.id !== validatedUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { data: cartItems, error } = await supabase
      .from('cart_items')
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
      `)
      .eq('user_id', validatedUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cart items' },
        { status: 500 }
      );
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);

    return NextResponse.json({
      items: cartItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      itemCount: cartItems.length,
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

// DELETE /api/cart/[user_id] - Clear user's cart
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

    // Ensure user can only clear their own cart
    if (user.id !== validatedUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', validatedUserId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to clear cart' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Cart cleared successfully' });
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