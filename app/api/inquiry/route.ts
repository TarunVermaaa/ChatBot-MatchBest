import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('Inquiry API called')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { name, email, phone, company, inquiryType, message, plan } = body

    // Validate required fields with specific error messages
    if (!name || !name.trim()) {
      console.log('Validation failed: name is missing or empty')
      return NextResponse.json(
        { error: 'Please enter your name' },
        { status: 400 }
      )
    }

    if (!email || !email.trim()) {
      console.log('Validation failed: email is missing or empty')
      return NextResponse.json(
        { error: 'Please enter your email address' },
        { status: 400 }
      )
    }

    if (!inquiryType || !inquiryType.trim()) {
      console.log('Validation failed: inquiryType is missing or empty')
      return NextResponse.json(
        { error: 'Please select an inquiry type' },
        { status: 400 }
      )
    }

    console.log('Creating inquiry with data:', {
      name,
      email,
      phone: phone || null,
      company: company || null,
      inquiryType,
      message: message || null,
      plan: plan || null,
      status: 'pending'
    })

    // Create user inquiry
    const inquiry = await prisma.userInquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        inquiryType,
        message: message || null,
        plan: plan || null,
        status: 'pending'
      }
    })

    console.log('Inquiry created successfully:', inquiry)

    return NextResponse.json({ 
      success: true, 
      inquiry,
      message: 'Your inquiry has been submitted successfully!' 
    })

  } catch (error) {
    console.error('Error creating inquiry:', error)
    return NextResponse.json(
      { error: `Failed to submit inquiry: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('Fetching inquiries')
    
    const inquiries = await prisma.userInquiry.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('Fetched inquiries:', inquiries.length)

    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
} 