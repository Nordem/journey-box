import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let data;
    try {
      data = await request.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      );
    }

    // Log the received data for debugging
    console.log('Received data:', JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.userProfile?.name || !data.userProfile?.location) {
      return NextResponse.json(
        { error: 'Name and location are required' },
        { status: 400 }
      );
    }

    try {
      const user = await prisma.user.create({
        data: {
          userProfile: {
            create: {
              name: data.userProfile.name,
              location: data.userProfile.location,
              currentTravelLocation: data.userProfile.currentTravelLocation,
              languages: data.userProfile.languages,
              personalityTraits: data.userProfile.personalityTraits,
              hobbiesAndInterests: data.userProfile.hobbiesAndInterests,
              additionalInfo: data.userProfile.additionalInfo,
              nearestAirport: data.userProfile.nearestAirport
            },
          },
          eventPreferences: {
            create: {
              preferredExperiences: data.eventPreferences.preferredExperiences,
              preferredDestinations: data.eventPreferences.preferredDestinations,
              seasonalPreferences: data.eventPreferences.seasonalPreferences,
              groupSizePreference: data.eventPreferences.groupSizePreference,
              blockedDates: data.eventPreferences.blockedDates,
              teamBuildingPrefs: data.eventPreferences.teamBuildingPrefs ? {
                create: {
                  preferredActivities: data.eventPreferences.teamBuildingPrefs.preferredActivities,
                  location: data.eventPreferences.teamBuildingPrefs.location,
                  duration: data.eventPreferences.teamBuildingPrefs.duration,
                  suggestions: data.eventPreferences.teamBuildingPrefs.suggestions
                }
              } : undefined
            },
          },
          restrictions: {
            create: {
              avoidCrowdedDaytimeConferences: data.restrictions.avoidCrowdedDaytimeConferences,
              avoidOverlyFormalNetworking: data.restrictions.avoidOverlyFormalNetworking,
              avoidFamilyKidsEvents: data.restrictions.avoidFamilyKidsEvents,
            },
          },
          history: {
            create: {
              recentEventsAttended: data.history.recentEventsAttended,
              eventFeedback: {
                create: data.history.eventFeedback.map((feedback: string) => ({
                  eventName: '', // You might want to add eventName to your form data
                  feedback,
                })),
              },
            },
          },
          idealOutcomes: {
            create: data.idealOutcomes.map((outcome: { description: string }) => ({
              description: outcome.description,
            })),
          },
          calendarEvents: {
            create: data.calendarEvents.map((event: any) => ({
              date: new Date(event.date),
              status: event.status,
              description: event.description,
            })),
          },
          deliverables: {
            create: data.deliverables.map((deliverable: any) => ({
              title: deliverable.title,
              date: new Date(deliverable.date),
              note: deliverable.note,
            })),
          },
        },
      });

      return NextResponse.json({ user });
    } catch (prismaError) {
      console.error('Prisma error:', prismaError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 