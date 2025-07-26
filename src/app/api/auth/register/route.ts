import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { userRegistrationSchema } from '@/lib/validations';
import { handleApiError, ValidationError, ConflictError, DatabaseError } from '@/lib/error-handler';

// POST /api/auth/register - User registration
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON in request body');
    }

    if (!body || typeof body !== 'object') {
      throw new ValidationError('Request body must be a valid object');
    }

    const validatedData = userRegistrationSchema.parse(body);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

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
      if (authError.message.includes('already registered')) {
        throw new ConflictError('User with this email already exists');
      }
      
      if (authError.message.includes('Password')) {
        throw new ValidationError('Password does not meet requirements', { password: authError.message });
      }
      
      if (authError.message.includes('Email')) {
        throw new ValidationError('Invalid email format', { email: authError.message });
      }
      
      throw new ValidationError('Registration failed: ' + authError.message);
    }

    if (!authData.user) {
      throw new ValidationError('Registration failed - no user data returned');
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
      // Clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new DatabaseError('Failed to create user profile', profileError.code, profileError);
    }

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: validatedData.name,
      },
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}