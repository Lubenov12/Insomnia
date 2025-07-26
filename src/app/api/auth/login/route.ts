import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { userLoginSchema } from '@/lib/validations';
import { handleApiError, ValidationError, AuthenticationError, DatabaseError } from '@/lib/error-handler';

// POST /api/auth/login - User login
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

    const validatedData = userLoginSchema.parse(body);

    // Authenticate user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        throw new AuthenticationError('Invalid email or password');
      }
      
      if (authError.message.includes('Email not confirmed')) {
        throw new AuthenticationError('Please confirm your email address before logging in');
      }
      
      if (authError.message.includes('Too many requests')) {
        throw new ValidationError('Too many login attempts. Please try again later');
      }
      
      throw new AuthenticationError('Login failed: ' + authError.message);
    }

    if (!authData.user || !authData.session) {
      throw new AuthenticationError('Login failed - invalid response');
    }

    // Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      throw new DatabaseError('Failed to fetch user profile', profileError.code, profileError);
    }

    if (!userProfile) {
      throw new DatabaseError('User profile not found');
    }

    return NextResponse.json({
      message: 'Login successful',
      user: userProfile,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}