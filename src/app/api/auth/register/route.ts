import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { userRegistrationSchema } from '@/lib/validations';

// POST /api/auth/register - User registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userRegistrationSchema.parse(body);

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
        },
      },
    });

    if (authError) {
      console.error('Auth registration error:', authError);
      
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      );
    }

    // Create user profile in our users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        name: validatedData.name,
        email: validatedData.email,
        address: validatedData.address || '',
        phone_number: validatedData.phone_number || '',
      }]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Note: In production, you might want to clean up the auth user here
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: validatedData.name,
      },
    }, { status: 201 });
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