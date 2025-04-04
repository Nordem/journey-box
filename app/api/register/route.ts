import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    console.log('Starting registration process...')
    
    // Parse the request body
    let body;
    try {
      const rawBody = await request.text()
      console.log('Raw request body:', rawBody)
      body = JSON.parse(rawBody)
      console.log('Successfully parsed request body')
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    // Log the received data
    console.log('Received registration data:', JSON.stringify(body, null, 2))
    
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
      console.error('Missing userId in request')
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!userProfile || !userProfile.name) {
      console.error('Missing or invalid userProfile in request:', userProfile)
      return NextResponse.json(
        { success: false, message: 'User profile data is required' },
        { status: 400 }
      )
    }

    // Ensure eventPreferences has required fields
    if (eventPreferences && !eventPreferences.budget) {
      console.log('Setting default budget to medium')
      eventPreferences.budget = "medium" // Default value
    }

    // Ensure maxDistanceKm is a number
    if (eventPreferences && typeof eventPreferences.maxDistanceKm !== 'number') {
      console.log('Setting default maxDistanceKm to 1000')
      eventPreferences.maxDistanceKm = 1000
    }
    
    // Check if user already exists
    console.log('Checking for existing user:', userId)
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { userProfile: true }
    })

    if (existingUser) {
      console.log('User exists, updating profile')
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

    console.log('Creating new user with profile')
    // Create new user with profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user record
      const user = await tx.user.create({
        data: {
          id: userId,
          userProfile: {
            create: {
              ...userProfile,
              languages: userProfile.languages || [],
              personalityTraits: userProfile.personalityTraits || [],
              hobbiesAndInterests: userProfile.hobbiesAndInterests || [],
              additionalInfo: userProfile.additionalInfo,
              nearestAirport: userProfile.nearestAirport
            }
          },
          eventPreferences: eventPreferences ? {
            create: {
              preferredExperiences: eventPreferences.preferredExperiences || [],
              preferredDestinations: eventPreferences.preferredDestinations || [],
              seasonalPreferences: eventPreferences.seasonalPreferences || [],
              groupSizePreference: eventPreferences.groupSizePreference || [],
              blockedDates: eventPreferences.blockedDates || [],
              teamBuildingPrefs: eventPreferences.teamBuildingPrefs ? {
                create: {
                  preferredActivities: eventPreferences.teamBuildingPrefs.preferredActivities || [],
                  location: eventPreferences.teamBuildingPrefs.location || 'both',
                  duration: eventPreferences.teamBuildingPrefs.duration || 'half_day',
                  suggestions: eventPreferences.teamBuildingPrefs.suggestions
                }
              } : undefined
            }
          } : undefined,
          restrictions: restrictions ? {
            create: {
              avoidFamilyKidsEvents: restrictions.avoidFamilyKidsEvents || false,
              avoidCrowdedDaytimeConferences: restrictions.avoidCrowdedDaytimeConferences || false,
              avoidOverlyFormalNetworking: restrictions.avoidOverlyFormalNetworking || false
            }
          } : undefined,
          history: history ? {
            create: {
              recentEventsAttended: history.recentEventsAttended || [],
              eventFeedback: {
                create: (history.eventFeedback || []).map((feedback: any) => {
                  // Handle both string and object formats
                  if (typeof feedback === 'string') {
                    return {
                      eventName: "General Feedback",
                      feedback: feedback
                    }
                  }
                  return {
                    eventName: feedback.eventName || "General Feedback",
                    feedback: feedback.feedback || ""
                  }
                })
              }
            }
          } : undefined,
          idealOutcomes: idealOutcomes ? {
            create: idealOutcomes.map((outcome: { description: string }) => ({
              description: outcome.description
            }))
          } : undefined,
          calendarEvents: calendarEvents ? {
            create: calendarEvents.map((event: any) => ({
              date: new Date(event.date),
              status: event.status,
              description: event.description || ""
            }))
          } : undefined,
          deliverables: deliverables ? {
            create: deliverables.map((deliverable: any) => ({
              title: deliverable.title,
              date: new Date(deliverable.date),
              note: deliverable.note || ""
            }))
          } : undefined
        },
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

      return user
    })

    console.log('User created successfully')
    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      user: result
    })
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error details:', {
        code: error.code,
        meta: error.meta,
        message: error.message,
        name: error.name
      })
      
      // Log the specific error code and handle it appropriately
      switch (error.code) {
        case 'P2002':
          return NextResponse.json(
            { success: false, message: 'A unique constraint would be violated' },
            { status: 400 }
          )
        case 'P2025':
          return NextResponse.json(
            { success: false, message: 'Record not found' },
            { status: 404 }
          )
        default:
          return NextResponse.json(
            { success: false, message: `Database error: ${error.message}` },
            { status: 500 }
          )
      }
    }

    // Log the full error stack trace
    console.error('Full error stack:', error instanceof Error ? error.stack : 'No stack trace available')
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 