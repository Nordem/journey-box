import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }> | { id: string }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const params = await context.params
  const { id } = params

  try {
    const body = await request.json()
    const { currentYear, nextYear, followingYear } = body

    const updatedAvailability = await prisma.travelAvailability.upsert({
      where: { userId: id },
      update: {
        currentYear,
        nextYear,
        followingYear
      },
      create: {
        userId: id,
        currentYear,
        nextYear,
        followingYear
      }
    })

    return NextResponse.json(updatedAvailability)
  } catch (error) {
    console.error('Error updating travel availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
