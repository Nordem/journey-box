import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }> | { id: string }
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  // Await the params object
  const params = await context.params
  const { id } = params

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userProfile: true,
        eventPreferences: true,
        restrictions: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const params = await context.params
  const { id } = params

  try {
    const body = await request.json()
    const { name, phone, location, nearestAirport } = body

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        userProfile: {
          update: {
            name,
            phone,
            location,
            nearestAirport
          }
        }
      },
      include: {
        userProfile: true,
        eventPreferences: true,
        restrictions: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 