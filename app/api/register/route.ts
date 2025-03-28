import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  console.log('=== REGISTRATION REQUEST START ===')
  console.log('Registration request received')
  
  try {
    // Parse the request body
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
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
      console.error('Missing required user ID')
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!userProfile || !userProfile.name) {
      console.error('Missing required user profile data')
      return NextResponse.json(
        { success: false, message: 'User profile data is required' },
        { status: 400 }
      )
    }
    
    // IMPORTANT DEBUG
    console.log('=== REGISTRATION DETAILS ===')
    console.log('Registering user with ID:', userId)
    console.log('User profile name:', userProfile.name)
    
    // Check if user already exists
    console.log('Checking if user exists...')
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { userProfile: true }
    })
    
    if (existingUser) {
      console.log('User already exists, updating profile...')
      // Update existing user's profile
      const updatedProfile = await prisma.userProfile.update({
        where: { userId: existingUser.id },
        data: {
          name: userProfile.name,
          location: userProfile.location || 'Not specified',
          currentTravelLocation: userProfile.currentTravelLocation,
          languages: userProfile.languages || [],
          personalityTraits: userProfile.personalityTraits || [],
          goals: userProfile.goals || [],
        }
      })
      
      console.log('Updated profile for existing user:', updatedProfile.id)
      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          userId: existingUser.id,
          updatedAt: existingUser.updatedAt
        }
      })
    }
    
    console.log('Starting database transaction for NEW user ID:', userId)
    
    // Use a transaction to ensure all related data is saved together
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create the user record with Supabase ID
        console.log('Creating new user record...')
        const user = await tx.user.create({
          data: {
            id: userId // Use the Supabase user ID
          }
        })
        
        console.log('Created user with ID:', user.id)
        
        // 2. Create user profile
        console.log('Creating user profile...')
        const profile = await tx.userProfile.create({
          data: {
            name: userProfile.name,
            location: userProfile.location || 'Not specified',
            currentTravelLocation: userProfile.currentTravelLocation,
            languages: userProfile.languages || [],
            personalityTraits: userProfile.personalityTraits || [],
            goals: userProfile.goals || [],
            userId: user.id
          }
        })
        
        console.log('Created profile for user:', profile.id)
        
        // 3. Create event preferences
        if (eventPreferences) {
          await tx.eventPreferences.create({
            data: {
              categories: eventPreferences.categories || [],
              vibeKeywords: eventPreferences.vibeKeywords || [],
              idealTimeSlots: eventPreferences.idealTimeSlots || [],
              budget: eventPreferences.budget || '',
              preferredGroupType: eventPreferences.preferredGroupType || [],
              preferredEventSize: eventPreferences.preferredEventSize || [],
              maxDistanceKm: eventPreferences.maxDistanceKm || 0,
              userId: user.id
            }
          })
        }
        
        // 4. Create restrictions
        if (restrictions) {
          await tx.restrictions.create({
            data: {
              avoidCrowdedDaytimeConferences: restrictions.avoidCrowdedDaytimeConferences || false,
              avoidOverlyFormalNetworking: restrictions.avoidOverlyFormalNetworking || false,
              avoidFamilyKidsEvents: restrictions.avoidFamilyKidsEvents || false,
              userId: user.id
            }
          })
        }
        
        // 5. Create history with event feedback
        if (history) {
          const historyRecord = await tx.history.create({
            data: {
              recentEventsAttended: history.recentEventsAttended || [],
              userId: user.id
            }
          })
          
          // Add event feedback if available
          if (history.eventFeedback && history.eventFeedback.length > 0) {
            for (const feedback of history.eventFeedback) {
              await tx.eventFeedback.create({
                data: {
                  eventName: feedback.eventName || '',
                  feedback: feedback.feedback || '',
                  historyId: historyRecord.id
                }
              })
            }
          }
        }
        
        // 6. Create ideal outcomes
        if (idealOutcomes && idealOutcomes.length > 0) {
          for (const outcome of idealOutcomes) {
            await tx.idealOutcome.create({
              data: {
                description: outcome.description,
                userId: user.id
              }
            })
          }
        }
        
        // 7. Create calendar events
        if (calendarEvents && calendarEvents.length > 0) {
          for (const event of calendarEvents) {
            await tx.calendarEvent.create({
              data: {
                date: new Date(event.date), // Convert string to Date
                status: event.status || '',
                description: event.description || '',
                userId: user.id
              }
            })
          }
        }
        
        // 8. Create deliverables
        if (deliverables && deliverables.length > 0) {
          for (const deliverable of deliverables) {
            await tx.deliverable.create({
              data: {
                title: deliverable.title || '',
                date: new Date(deliverable.date), // Convert string to Date
                note: deliverable.note || '',
                userId: user.id
              }
            })
          }
        }
        
        return user
      })
      
      console.log('Transaction completed successfully, user created with ID:', result.id)
      console.log('=== REGISTRATION REQUEST END ===')
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: "Profile created successfully",
        data: {
          userId: result.id,
          createdAt: result.createdAt
        }
      })
    } catch (error) {
      console.error('Transaction error:', error)
      
      // Detailed error logging
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error code:', error.code)
        console.error('Prisma error message:', error.message) 
        console.error('Prisma error meta:', error.meta)
      }
      
      throw error // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle Prisma specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is the error code for unique constraint violation
      if (error.code === 'P2002') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'A user with this ID already exists. Try refreshing your dashboard.'
          },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to process registration',
        errorDetails: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 