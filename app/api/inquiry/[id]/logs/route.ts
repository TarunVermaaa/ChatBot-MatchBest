import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching workflow logs for inquiry:', params.id)

    const logs = await prisma.workflowLog.findMany({
      where: { inquiryId: params.id },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Found workflow logs:', logs.length)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching workflow logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow logs' },
      { status: 500 }
    )
  }
} 