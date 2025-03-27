import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  console.log('Registration request received')
  
  try {
    // Parse the request body
    const body = await request.json()
    console.log('Request body parsed successfully')
    
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

    if (!email) {
      console.error('Missing required email')
      return NextResponse.json(
        { success: false, message: 'Email is required' },
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
    console.log('Registering user with ID:', userId)
    console.log('User email:', email)
    console.log('User profile name:', userProfile.name)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { userProfile: true }
    })
    
    if (existingUser) {
      console.log('User already exists with ID:', userId, 'Has profile:', !!existingUser.userProfile)
      
      if (existingUser.userProfile) {
        // User already exists with a profile, no need to create a new one
        return NextResponse.json({
          success: true,
          message: "User already exists with a profile",
          data: {
            userId: existingUser.id,
            email: email,
            alreadyExists: true
          }
        })
      }
      
      // If user exists but has no profile, update with the new profile data
      console.log('User exists but has no profile. Creating profile...')
      
      try {
        // Use a transaction to create all the missing data
        const updatedUser = await prisma.$transaction(async (tx) => {
          // Create user profile
          const profile = await tx.userProfile.create({
            data: {
              name: userProfile.name,
              location: userProfile.location || 'Not specified',
              currentTravelLocation: userProfile.currentTravelLocation,
              languages: userProfile.languages || [],
              personalityTraits: userProfile.personalityTraits || [],
              goals: userProfile.goals || [],
              userId: existingUser.id
            }
          })
          
          console.log('Created profile for existing user:', profile.id)
          
          // Create event preferences if provided
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
                userId: existingUser.id
              }
            })
          }
          
          // Create restrictions if provided
          if (restrictions) {
            await tx.restrictions.create({
              data: {
                avoidCrowdedDaytimeConferences: restrictions.avoidCrowdedDaytimeConferences || false,
                avoidOverlyFormalNetworking: restrictions.avoidOverlyFormalNetworking || false,
                avoidFamilyKidsEvents: restrictions.avoidFamilyKidsEvents || false,
                userId: existingUser.id
              }
            })
          }
          
          // Create other data as needed...
          
          // Similar implementation as the full creation below for other data types
          
          return existingUser
        })
        
        console.log('Profile created for existing user:', updatedUser.id)
        return NextResponse.json({
          success: true,
          message: "Profile added to existing user",
          data: {
            userId: updatedUser.id,
            email: email,
            updated: true
          }
        })
      } catch (error) {
        console.error('Error updating existing user:', error)
        // Detailed error logging
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error('Prisma error code:', error.code)
          console.error('Prisma error message:', error.message)
          console.error('Prisma error meta:', error.meta)
        }
        
        return NextResponse.json(
          { 
            success: false, 
            message: error instanceof Error ? `Error updating user: ${error.message}` : 'Failed to update user'
          },
          { status: 500 }
        )
      }
    }
    
    console.log('Starting database transaction for NEW user ID:', userId)
    
    // Use a transaction to ensure all related data is saved together
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create the user record with Supabase ID
        const user = await tx.user.create({
          data: {
            id: userId // Use the Supabase user ID
          }
        })
        
        console.log('Created user with ID:', user.id)
        
        // 2. Create user profile
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
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: "Profile created successfully",
        data: {
          userId: result.id,
          email: email,
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