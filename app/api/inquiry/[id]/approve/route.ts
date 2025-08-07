import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action, assignee, priority, estimatedCompletion, adminNotes } = body

    console.log('Approval action:', { inquiryId: params.id, action, assignee, priority })

    let updateData: any = {
      updatedAt: new Date()
    }

    // Handle different approval actions
    switch (action) {
      case 'approve':
        updateData.status = 'approved'
        updateData.approvedAt = new Date()
        if (assignee) {
          updateData.assignee = assignee
          updateData.assignedAt = new Date()
        }
        break

      case 'reject':
        updateData.status = 'rejected'
        break

      case 'assign':
        updateData.assignee = assignee
        updateData.assignedAt = new Date()
        updateData.status = 'in_progress'
        break

      case 'complete':
        updateData.status = 'completed'
        updateData.completedAt = new Date()
        break

      case 'update':
        if (assignee) updateData.assignee = assignee
        if (priority) updateData.priority = priority
        if (estimatedCompletion) updateData.estimatedCompletion = new Date(estimatedCompletion)
        if (adminNotes) updateData.adminNotes = adminNotes
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update the inquiry
    const inquiry = await prisma.userInquiry.update({
      where: { id: params.id },
      data: updateData
    })

    // Log the workflow action
    await prisma.workflowLog.create({
      data: {
        inquiryId: params.id,
        action: action,
        performedBy: 'admin', // In real app, get from auth context
        details: `Action: ${action}, Assignee: ${assignee || 'N/A'}, Priority: ${priority || 'N/A'}`
      }
    })

    console.log('Inquiry updated successfully:', inquiry)

    return NextResponse.json({ 
      success: true, 
      inquiry,
      message: `Inquiry ${action}d successfully!` 
    })

  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json(
      { error: `Failed to process inquiry: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 