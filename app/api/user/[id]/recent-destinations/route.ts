import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }> | { id: string }
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  const params = await context.params
  const { id } = params

  try {
    const destinations = await prisma.recentDestination.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(destinations)
  } catch (error) {
    console.error('Error fetching recent destinations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  const params = await context.params
  const { id } = params

  try {
    const body = await request.json()
    const { country, destination, isArkusTrip } = body

    if (!country || !destination) {
      return NextResponse.json(
        { error: 'Country and destination are required' },
        { status: 400 }
      )
    }

    const newDestination = await prisma.recentDestination.create({
      data: {
        country,
        destination,
        isArkusTrip,
        userId: id
      }
    })

    return NextResponse.json(newDestination)
  } catch (error) {
    console.error('Error creating recent destination:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 