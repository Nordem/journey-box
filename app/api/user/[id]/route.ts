import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id: userId } = await context.params
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // First check if the user exists at all
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!userExists) {
      return NextResponse.json(
        { success: false, message: 'User not found', id: userId },
        { status: 404 }
      )
    }
    
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
      return NextResponse.json(
        { success: false, message: 'User not found', id: userId },
        { status: 404 }
      )
    }
    
    // If no profile exists, return 404
    if (!user.userProfile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found', id: userId },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 