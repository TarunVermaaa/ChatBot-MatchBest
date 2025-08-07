import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test database connection
    await prisma.$connect()
    console.log('Database connected successfully')
    
    // Test a simple query
    const count = await prisma.userInquiry.count()
    console.log('Total inquiries in database:', count)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      inquiryCount: count
    })
    
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 