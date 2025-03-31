import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    
    // Extract all the form data
    const {
      userId, // Supabase user ID
      email,
      userProfile,
      eventPreferences, 
      restrictions,
      history,
      idealOutcomes,
      calendarEvents,
      deliverables
    } = body
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!userProfile || !userProfile.name) {
      return NextResponse.json(
        { success: false, message: 'User profile data is required' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { userProfile: true }
    })

    if (existingUser) {
      // Update existing user's profile
      const updatedProfile = await prisma.userProfile.update({
        where: { userId: userId },
        data: {
          ...userProfile,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...existingUser,
          userProfile: updatedProfile
        }
      })
    }

    // Create new user with profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user record
      const user = await tx.user.create({
        data: {
          id: userId,
          userProfile: {
            create: userProfile
          },
          eventPreferences: eventPreferences ? {
            create: eventPreferences
          } : undefined,
          restrictions: restrictions ? {
            create: restrictions
          } : undefined,
          history: history ? {
            create: history
          } : undefined,
          idealOutcomes: idealOutcomes ? {
            create: idealOutcomes
          } : undefined,
          calendarEvents: calendarEvents ? {
            create: calendarEvents
          } : undefined,
          deliverables: deliverables ? {
            create: deliverables
          } : undefined
        },
        include: {
          userProfile: true,
          eventPreferences: true,
          restrictions: true,
          history: true,
          idealOutcomes: true,
          calendarEvents: true,
          deliverables: true
        }
      })

      return user
    })

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: result
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { success: false, message: 'Database error occurred' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 