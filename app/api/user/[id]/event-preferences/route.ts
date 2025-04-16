import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { 
      preferredExperiences,
      preferredDestinations,
      seasonalPreferences,
      groupSizePreference,
      blockedDates,
      teamBuildingPrefs
    } = body

    const updatedPreferences = await prisma.eventPreferences.update({
      where: { userId: id },
      data: {
        preferredExperiences,
        preferredDestinations,
        seasonalPreferences,
        groupSizePreference,
        blockedDates,
        teamBuildingPrefs: teamBuildingPrefs ? {
          update: {
            preferredActivities: teamBuildingPrefs.preferredActivities,
            location: teamBuildingPrefs.location,
            duration: teamBuildingPrefs.duration,
            suggestions: teamBuildingPrefs.suggestions
          }
        } : undefined
      },
      include: {
        teamBuildingPrefs: true
      }
    })

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    console.error('Error updating event preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
