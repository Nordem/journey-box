import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`Fetching user data for ID: ${userId}`)
    
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
      console.log(`User not found in database with ID: ${userId}`)
      return NextResponse.json(
        { success: false, message: 'User not found', id: userId },
        { status: 404 }
      )
    }
    
    console.log(`Successfully found user with ID: ${userId}, has profile: ${!!user.userProfile}`)
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    )
  }
} 