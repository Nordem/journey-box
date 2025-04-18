import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: { id: string; destinationId: string }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const params = await context.params
  const { id, destinationId } = params

  try {
    const body = await request.json()
    const { country, destination, isArkusTrip } = body

    if (!country || !destination) {
      return NextResponse.json(
        { error: 'Country and destination are required' },
        { status: 400 }
      )
    }

    const updatedDestination = await prisma.recentDestination.update({
      where: {
        id: destinationId,
        userId: id
      },
      data: {
        country,
        destination,
        isArkusTrip
      }
    })

    return NextResponse.json(updatedDestination)
  } catch (error) {
    console.error('Error updating recent destination:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const params = await context.params
  const { id, destinationId } = params

  try {
    await prisma.recentDestination.delete({
      where: {
        id: destinationId,
        userId: id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recent destination:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 