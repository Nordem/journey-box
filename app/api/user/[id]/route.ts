import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id: userId } = await context.params
    
    if (!userId) {
      console.error('No user ID provided in request')
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`Fetching user data for ID: ${userId}`)
    
    // First check if the user exists at all
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!userExists) {
      console.error(`User does not exist in database with ID: ${userId}`)
      return NextResponse.json(
        { success: false, message: 'User not found', id: userId },
        { status: 404 }
      )
    }
    
    console.log(`User exists in database, fetching full profile...`)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProfile: true,
        eventPreferences: true,
        restrictions: true,
        history: {
          include: {
            eventFeedback: true
          }
        },
        idealOutcomes: true,
        calendarEvents: true,
        deliverables: true
      }
    })
    
    if (!user) {
      console.error(`User not found in database with ID: ${userId}`)
      return NextResponse.json(
        { success: false, message: 'User not found', id: userId },
        { status: 404 }
      )
    }
    
    console.log(`Successfully found user with ID: ${userId}`)
    console.log(`User profile exists: ${!!user.userProfile}`)
    console.log(`User profile details:`, user.userProfile)
    
    // If no profile exists, return 404
    if (!user.userProfile) {
      console.error(`User found but no profile exists for ID: ${userId}`)
      return NextResponse.json(
        { success: false, message: 'User profile not found', id: userId },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user data:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    )
  }
} 