import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, notes } = body

    const inquiry = await prisma.userInquiry.update({
      where: { id: params.id },
      data: {
        status: status || undefined,
        notes: notes || undefined,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      inquiry,
      message: 'Inquiry updated successfully!' 
    })

  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.userInquiry.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Inquiry deleted successfully!' 
    })

  } catch (error) {
    console.error('Error deleting inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 }
    )
  }
} 