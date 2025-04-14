import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check in Supabase using signInWithOtp
    const { error: supabaseError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    })

    // If we get a "User not found" error, it means the email doesn't exist
    if (supabaseError?.message?.includes('User not found')) {
      return NextResponse.json({ success: true, exists: false })
    }

    // If there's no error, it means the user exists
    if (!supabaseError) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // For any other error, return a server error
    console.error('Supabase error:', supabaseError)
    return NextResponse.json(
      { error: 'Error checking email' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 