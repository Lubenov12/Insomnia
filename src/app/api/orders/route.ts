import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createOrderSchema } from '@/lib/validations';
import { getAuthUser } from '@/lib/auth';

// POST /api/orders - Create a new order
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
    const validatedData = createOrderSchema.parse({
      ...body,
      user_id: user.id,
    });

    // Start a transaction-like operation
    let totalAmount = 0;
    const orderItems = [];

    // Validate all products and calculate total
    for (const item of validatedData.items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('price, stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { error: `Product ${item.product_id} not found` },
          { status: 404 }
        );
      }

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${item.product_id}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
      });
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: validatedData.user_id,
        status: 'pending',
        total_amount: totalAmount,
        payment_method: validatedData.payment_method,
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Update product stock quantities
    for (const item of validatedData.items) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        product_id: item.product_id,
        quantity: item.quantity,
      });

      if (stockError) {
        console.error('Stock update error:', stockError);
        // In a real application, you'd want to implement proper rollback here
      }
    }

    // Clear user's cart after successful order
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', validatedData.user_id);

    // Fetch the complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) {
      console.error('Order fetch error:', fetchError);
      return NextResponse.json(order, { status: 201 });
    }

    return NextResponse.json(completeOrder, { status: 201 });
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